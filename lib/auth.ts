import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth'
import { auth } from './firebase'
import { userService } from './firestore'
import type { SignupForm, UserProfile, AppUser } from './types'

export const authService = {
  // 로그인 (프로필 자동 생성 포함)
  async signIn(email: string, password: string): Promise<AppUser> {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Firestore에서 사용자 프로필 조회
    let profile = await userService.getUserProfile(user.uid)
    
    // 프로필이 없으면 자동 생성 (기존 Firebase Auth 사용자용)
    if (!profile) {
      console.log('프로필이 없어서 자동 생성합니다.')
      
      // 특정 이메일은 관리자로 설정
      const isAdmin = email === 'cultsoda@gmail.com' || email === 'admin@test.com'
      
      const newProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
        name: email.split('@')[0], // 이메일 앞부분을 이름으로 사용
        email: user.email!,
        role: isAdmin ? 'admin' : 'viewer',
      }
      
      await userService.createUserProfile(user.uid, newProfile)
      profile = {
        ...newProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
    
    return {
      uid: user.uid,
      email: user.email!,
      ...profile,
    }
  },

  // 회원가입
  async signUp(data: SignupForm): Promise<AppUser> {
    // 관리자 키 확인
    const role = data.adminKey === '164645' ? 'admin' : 'viewer'
    
    // Firebase Authentication으로 계정 생성
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth, 
      data.email, 
      data.password
    )
    const user = userCredential.user
    
    // Firestore에 사용자 프로필 저장
    const profile: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
      name: data.name,
      email: data.email,
      role,
    }
    
    await userService.createUserProfile(user.uid, profile)
    
    return {
      uid: user.uid,
      email: user.email!,
      name: data.name,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },

  // 로그아웃
  async signOut(): Promise<void> {
    await firebaseSignOut(auth)
  },

  // 인증 상태 리스너
  onAuthStateChanged(callback: (user: AppUser | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          const profile = await userService.getUserProfile(firebaseUser.uid)
          if (profile) {
            const appUser: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              ...profile,
            }
            callback(appUser)
          } else {
            callback(null)
          }
        } catch (error) {
          console.error('사용자 프로필 로드 실패:', error)
          callback(null)
        }
      } else {
        callback(null)
      }
    })
  },

  // 현재 사용자 조회
  async getCurrentUser(): Promise<AppUser | null> {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return null
    
    try {
      const profile = await userService.getUserProfile(firebaseUser.uid)
      if (profile) {
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          ...profile,
        }
      }
    } catch (error) {
      console.error('현재 사용자 조회 실패:', error)
    }
    
    return null
  }
}