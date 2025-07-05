// lib/types.ts

export interface Category {
  id: string
  name: string
  color: string
  count: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface Document {
  id: string
  title: string
  content: string
  category: string
  author: string
  authorUid: string
  createdAt: string
  updatedAt: string
  isLocked?: boolean
  password?: string
  tags?: string[]
  linkedDocuments?: string[]
  comments?: Comment[]
}

export interface Comment {
  id: string
  content: string
  author: string
  authorUid: string
  createdAt: string
  updatedAt: string
}

export interface AppUser {
  uid: string
  name: string
  email: string
  role: 'admin' | 'viewer'
  createdAt: string
  updatedAt: string
  profileImage?: string
}

// Firebase User Profile (Firestore에 저장될 데이터)
export interface UserProfile {
  name: string
  email: string
  role: 'admin' | 'viewer'
  createdAt: string
  updatedAt: string
  profileImage?: string
}

// 폼 상태 타입들
export interface LoginForm {
  email: string
  password: string
}

export interface SignupForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  adminKey: string
}

export interface DocumentForm {
  title: string
  content: string
  category: string
  isLocked?: boolean
  password?: string
  tags?: string[]
}

export interface CategoryForm {
  name: string
  color: string
}

// 컴포넌트 Props 타입들
export interface DocumentCardProps {
  document: Document
  onEdit?: (document: Document) => void
  onDelete?: (documentId: string) => void
  isAdmin: boolean
}

export interface CategorySidebarProps {
  categories: Category[]
  documents: Document[]
  selectedCategory: string
  onCategorySelect: (categoryName: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  isLoading: boolean
}

// Context 타입들
export interface AuthContextType {
  user: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: SignupForm) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

export interface DocumentContextType {
  documents: Document[]
  loading: boolean
  error: string | null
  addDocument: (data: DocumentForm) => Promise<void>
  updateDocument: (id: string, data: Partial<DocumentForm>) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  refreshDocuments: () => Promise<void>
}

export interface CategoryContextType {
  categories: Category[]
  loading: boolean
  error: string | null
  addCategory: (data: CategoryForm) => Promise<void>
  updateCategory: (id: string, data: Partial<CategoryForm>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  refreshCategories: () => Promise<void>
}

// Firebase 관련 타입들
export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

// 유틸리티 타입들
export type UserRole = 'admin' | 'viewer'

export type DocumentSortBy = 'createdAt' | 'updatedAt' | 'title' | 'author'
export type SortOrder = 'asc' | 'desc'

export interface SortOptions {
  sortBy: DocumentSortBy
  order: SortOrder
}

export interface FilterOptions {
  category?: string
  author?: string
  dateRange?: {
    start: string
    end: string
  }
  tags?: string[]
}

// API 응답 타입들
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// 에러 타입들
export interface AppError {
  code: string
  message: string
  details?: any
}

export type AuthError = 
  | 'invalid-credentials'
  | 'user-not-found'
  | 'email-already-exists'
  | 'weak-password'
  | 'network-error'
  | 'unknown-error'

export type DocumentError = 
  | 'document-not-found'
  | 'permission-denied'
  | 'invalid-data'
  | 'network-error'
  | 'unknown-error'

// 상수 타입들
export const CATEGORY_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-red-100 text-red-800',
  'bg-yellow-100 text-yellow-800',
  'bg-indigo-100 text-indigo-800',
  'bg-pink-100 text-pink-800',
  'bg-gray-100 text-gray-800',
] as const

export type CategoryColor = typeof CATEGORY_COLORS[number]

export const DEFAULT_CATEGORIES = [
  '사업',
  '상위 기획',
  '상세 기획',
  '디자인',
  '프론트 개발',
  '백엔드 개발',
  'QA',
  '운영',
  '개인',
] as const

export type DefaultCategory = typeof DEFAULT_CATEGORIES[number]

// 권한 확인 유틸리티 타입
export interface PermissionCheck {
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  canManageCategories: boolean
  canManageUsers: boolean
}

// 테마 관련 타입
export type Theme = 'light' | 'dark' | 'system'

// 알림 타입
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: () => void
  variant?: 'default' | 'destructive'
}

export const CATEGORY_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-red-100 text-red-800',
  'bg-yellow-100 text-yellow-800',
  'bg-indigo-100 text-indigo-800',
  'bg-pink-100 text-pink-800',
  'bg-gray-100 text-gray-800',
] as const

export type CategoryColor = typeof CATEGORY_COLORS[number]
