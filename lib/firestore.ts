import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  DocumentSnapshot,
  QuerySnapshot,
  DocumentData,
  CollectionReference,
  DocumentReference,
  Query,
  Unsubscribe
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  Document,
  Category,
  UserProfile,
  DocumentForm,
  CategoryForm,
  FilterOptions,
  SortOptions,
  PaginatedResponse,
  DocumentType,
} from './types'

// 컬렉션 참조
export const COLLECTIONS = {
  USERS: 'users',
  DOCUMENTS: 'documents',
  CATEGORIES: 'categories',
  COMMENTS: 'comments',
} as const

// 사용자 관련 함수들
export const userService = {
  // 사용자 프로필 생성
  async createUserProfile(uid: string, data: Omit<UserProfile, 'createdAt' | 'updatedAt'>) {
    const userRef = doc(db, COLLECTIONS.USERS, uid)
    const profileData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    // updateDoc 대신 setDoc 사용 (문서가 존재하지 않을 수 있으므로)
    await setDoc(userRef, profileData)
    return profileData
  },

  // 사용자 프로필 조회
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, COLLECTIONS.USERS, uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return { ...userSnap.data() } as UserProfile
    }
    return null
  },

  // 사용자 프로필 업데이트
  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    const userRef = doc(db, COLLECTIONS.USERS, uid)
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    }
    await updateDoc(userRef, updateData)
  },

  // 모든 사용자 조회 (관리자만)
  async getAllUsers(): Promise<UserProfile[]> {
    const usersRef = collection(db, COLLECTIONS.USERS)
    const querySnapshot = await getDocs(usersRef)
    
    return querySnapshot.docs.map((doc: DocumentSnapshot<DocumentData>) => ({
      uid: doc.id,
      ...doc.data()
    })) as UserProfile[]
  }
}

// 문서 관련 함수들
export const documentService = {
  // 문서 생성
  async createDocument(data: DocumentForm & { authorUid: string; author: string }): Promise<string> {
    const documentsRef = collection(db, COLLECTIONS.DOCUMENTS)
    
    // 정리된 데이터 생성 (모든 필드 명시적으로 포함)
    const cleanData: Record<string, any> = {
      title: data.title,
      content: data.content,
      category: data.category,
      documentType: data.documentType || 'text', // 🔥 기본값 추가
      author: data.author,
      authorUid: data.authorUid,
      isLocked: data.isLocked || false,
      tags: data.tags || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      comments: [],
      linkedDocuments: [],
    }

    // password가 있는 경우에만 추가
    if (data.password) {
      cleanData.password = data.password
    }
    
    console.log('Firestore에 저장할 데이터:', cleanData) // 디버깅용
    
    const docRef = await addDoc(documentsRef, cleanData)
    return docRef.id
  },

  // 문서 조회 (단일)
  async getDocument(id: string): Promise<Document | null> {
    const docRef = doc(db, COLLECTIONS.DOCUMENTS, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      const document: Document = {
        id: docSnap.id,
        title: data.title || '',
        content: data.content || '',
        category: data.category || '',
        documentType: data.documentType || 'text', // 🔥 기본값 추가
        author: data.author || '',
        authorUid: data.authorUid || '',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        isLocked: data.isLocked || false,
        password: data.password || '',
        tags: data.tags || [],
        linkedDocuments: data.linkedDocuments || [],
        comments: data.comments || [],
      }
      
      console.log('Firestore에서 읽어온 문서:', document) // 디버깅용
      return document
    }
    return null
  },

  // 모든 문서 조회
  async getAllDocuments(options?: {
    filter?: FilterOptions
    sort?: SortOptions
    limit?: number
  }): Promise<Document[]> {
    const documentsRef = collection(db, COLLECTIONS.DOCUMENTS)
    let q: Query<DocumentData> = query(documentsRef)

    // 필터 적용
    if (options?.filter?.category) {
      q = query(q, where('category', '==', options.filter.category))
    }
    if (options?.filter?.author) {
      q = query(q, where('authorUid', '==', options.filter.author))
    }

    // 정렬 적용
    if (options?.sort) {
      q = query(q, orderBy(options.sort.sortBy, options.sort.order))
    } else {
      q = query(q, orderBy('createdAt', 'desc'))
    }

    // 제한 적용
    if (options?.limit) {
      q = query(q, limit(options.limit))
    }

    const querySnapshot = await getDocs(q)
    const documents = querySnapshot.docs.map((docSnap: DocumentSnapshot<DocumentData>) => {
      const data = docSnap.data()
      const document: Document = {
        id: docSnap.id,
        title: data.title || '',
        content: data.content || '',
        category: data.category || '',
        documentType: data.documentType || 'text', // 🔥 기본값 추가
        author: data.author || '',
        authorUid: data.authorUid || '',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        isLocked: data.isLocked || false,
        password: data.password || '',
        tags: data.tags || [],
        linkedDocuments: data.linkedDocuments || [],
        comments: data.comments || [],
      }
      
      return document
    })
    
    console.log('Firestore에서 읽어온 모든 문서들:', documents) // 디버깅용
    return documents
  },

  // 문서 업데이트
  async updateDocument(id: string, data: Partial<DocumentForm>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.DOCUMENTS, id)
    
    // 정리된 데이터 생성
    const cleanData: Record<string, any> = {
      updatedAt: serverTimestamp(),
    }

    // 각 필드를 개별적으로 확인하여 undefined가 아닌 경우에만 추가
    if (data.title !== undefined) cleanData.title = data.title
    if (data.content !== undefined) cleanData.content = data.content
    if (data.category !== undefined) cleanData.category = data.category
    if (data.documentType !== undefined) cleanData.documentType = data.documentType // 🔥 추가
    if (data.isLocked !== undefined) cleanData.isLocked = data.isLocked
    if (data.tags !== undefined) cleanData.tags = data.tags
    if (data.password !== undefined) cleanData.password = data.password
    
    console.log('Firestore 업데이트 데이터:', cleanData) // 디버깅용
    
    await updateDoc(docRef, cleanData)
  },

  // 문서 삭제
  async deleteDocument(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.DOCUMENTS, id)
    await deleteDoc(docRef)
  },

  // 실시간 문서 리스너
  onDocumentsChange(callback: (documents: Document[]) => void): Unsubscribe {
    const documentsRef = collection(db, COLLECTIONS.DOCUMENTS)
    const q = query(documentsRef, orderBy('createdAt', 'desc'))
    
    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const documents = snapshot.docs.map((docSnap: DocumentSnapshot<DocumentData>) => {
        const data = docSnap.data()
        const document: Document = {
          id: docSnap.id,
          title: data.title || '',
          content: data.content || '',
          category: data.category || '',
          documentType: data.documentType || 'text', // 🔥 기본값 추가
          author: data.author || '',
          authorUid: data.authorUid || '',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          isLocked: data.isLocked || false,
          password: data.password || '',
          tags: data.tags || [],
          linkedDocuments: data.linkedDocuments || [],
          comments: data.comments || [],
        }
        
        return document
      })
      
      console.log('실시간 업데이트된 문서들:', documents) // 디버깅용
      callback(documents)
    })
  }
}

// 카테고리 관련 함수들
export const categoryService = {
  // 카테고리 생성
  async createCategory(data: CategoryForm & { createdBy: string }): Promise<string> {
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES)
    const categoryData = {
      ...data,
      count: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    
    const docRef = await addDoc(categoriesRef, categoryData)
    return docRef.id
  },

  // 모든 카테고리 조회
  async getAllCategories(): Promise<Category[]> {
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES)
    const q = query(categoriesRef, orderBy('name'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map((doc: DocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    })) as Category[]
  },

  // 카테고리 업데이트
  async updateCategory(id: string, data: Partial<CategoryForm>): Promise<void> {
    const categoryRef = doc(db, COLLECTIONS.CATEGORIES, id)
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    }
    await updateDoc(categoryRef, updateData)
  },

  // 카테고리 삭제
  async deleteCategory(id: string): Promise<void> {
    const categoryRef = doc(db, COLLECTIONS.CATEGORIES, id)
    await deleteDoc(categoryRef)
  },

  // 카테고리 문서 수 업데이트
  async updateCategoryCount(categoryName: string, increment: number = 1): Promise<void> {
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES)
    const q = query(categoriesRef, where('name', '==', categoryName))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const categoryDoc = querySnapshot.docs[0]
      const currentCount = categoryDoc.data().count || 0
      const newCount = Math.max(0, currentCount + increment)
      
      await updateDoc(categoryDoc.ref, {
        count: newCount,
        updatedAt: serverTimestamp(),
      })
    }
  },

  // 실시간 카테고리 리스너
  onCategoriesChange(callback: (categories: Category[]) => void): Unsubscribe {
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES)
    const q = query(categoriesRef, orderBy('name'))
    
    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const categories = snapshot.docs.map((doc: DocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      })) as Category[]
      callback(categories)
    })
  }
}

// 검색 관련 함수들
export const searchService = {
  // 문서 전문 검색
  async searchDocuments(searchTerm: string): Promise<Document[]> {
    // Firestore는 전문 검색을 지원하지 않으므로 클라이언트 사이드에서 필터링
    // 실제 프로덕션에서는 Algolia나 Elasticsearch 사용 권장
    const documents = await documentService.getAllDocuments()
    
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }
}

// 초기화 함수
export const initializeFirestore = async () => {
  try {
    // 기본 카테고리가 없으면 생성
    const categories = await categoryService.getAllCategories()
    
    if (categories.length === 0) {
      const defaultCategories = [
        { name: '사업', color: 'bg-blue-100 text-blue-800' },
        { name: '상위 기획', color: 'bg-green-100 text-green-800' },
        { name: '상세 기획', color: 'bg-purple-100 text-purple-800' },
        { name: '디자인', color: 'bg-red-100 text-red-800' },
        { name: '프론트 개발', color: 'bg-yellow-100 text-yellow-800' },
        { name: '백엔드 개발', color: 'bg-indigo-100 text-indigo-800' },
        { name: 'QA', color: 'bg-pink-100 text-pink-800' },
        { name: '운영', color: 'bg-gray-100 text-gray-800' },
        { name: '개인', color: 'bg-blue-100 text-blue-800' },
      ]

      for (const category of defaultCategories) {
        await categoryService.createCategory({
          ...category,
          createdBy: 'system'
        })
      }
    }
  } catch (error) {
    console.error('Firestore 초기화 실패:', error)
  }
}