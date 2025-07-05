'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@/lib/auth'
import type { AuthContextType, AppUser, SignupForm } from '@/lib/types'

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Firebase Auth 상태 변화 감지
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // 로그인
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      const userData = await authService.signIn(email, password)
      setUser(userData)
    } catch (error) {
      console.error('로그인 실패:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 회원가입
  const signUp = async (data: SignupForm): Promise<void> => {
    try {
      setLoading(true)
      const userData = await authService.signUp(data)
      setUser(userData)
    } catch (error) {
      console.error('회원가입 실패:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 로그아웃
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)
      await authService.signOut()
      setUser(null)
    } catch (error) {
      console.error('로그아웃 실패:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 프로필 업데이트
  const updateProfile = async (data: Partial<AppUser>): Promise<void> => {
    if (!user) throw new Error('사용자가 로그인되어 있지 않습니다.')

    try {
      // Firestore에서 프로필 업데이트 로직이 필요하면 여기에 추가
      setUser({ ...user, ...data })
    } catch (error) {
      console.error('프로필 업데이트 실패:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// useAuth 훅
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용되어야 합니다.')
  }
  return context
}