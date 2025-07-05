'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { categoryService, initializeFirestore } from '@/lib/firestore'
import { useAuth } from '@/components/auth/AuthProvider'
import type { CategoryContextType, Category, CategoryForm } from '@/lib/types'

const CategoryContext = createContext<CategoryContextType | null>(null)

interface CategoryProviderProps {
  children: React.ReactNode
}

export function CategoryProvider({ children }: CategoryProviderProps) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 카테고리 목록 로드
  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Firestore 초기화 (기본 카테고리 생성)
      await initializeFirestore()
      
      const cats = await categoryService.getAllCategories()
      setCategories(cats)
    } catch (err) {
      console.error('카테고리 로드 실패:', err)
      setError('카테고리를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 앱 시작 시 카테고리 로드
  useEffect(() => {
    loadCategories()
  }, [])

  // 실시간 카테고리 변경 감지 (옵션)
  useEffect(() => {
    const unsubscribe = categoryService.onCategoriesChange((cats) => {
      setCategories(cats)
    })

    return () => unsubscribe()
  }, [])

  // 카테고리 추가
  const addCategory = async (data: CategoryForm): Promise<void> => {
    if (!user || user.role !== 'admin') {
      throw new Error('관리자만 카테고리를 추가할 수 있습니다.')
    }

    try {
      setLoading(true)
      setError(null)

      const categoryData = {
        ...data,
        createdBy: user.uid,
      }

      const catId = await categoryService.createCategory(categoryData)
      
      // 새 카테고리를 로컬 상태에 추가
      const newCategory: Category = {
        id: catId,
        ...categoryData,
        count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)))
    } catch (err) {
      console.error('카테고리 추가 실패:', err)
      setError('카테고리 추가에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 카테고리 수정
  const updateCategory = async (id: string, data: Partial<CategoryForm>): Promise<void> => {
    if (!user || user.role !== 'admin') {
      throw new Error('관리자만 카테고리를 수정할 수 있습니다.')
    }

    try {
      setLoading(true)
      setError(null)

      await categoryService.updateCategory(id, data)
      
      // 로컬 상태 업데이트
      setCategories(prev => 
        prev.map(cat => 
          cat.id === id 
            ? { ...cat, ...data, updatedAt: new Date().toISOString() }
            : cat
        ).sort((a, b) => a.name.localeCompare(b.name))
      )
    } catch (err) {
      console.error('카테고리 수정 실패:', err)
      setError('카테고리 수정에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 카테고리 삭제
  const deleteCategory = async (id: string): Promise<void> => {
    if (!user || user.role !== 'admin') {
      throw new Error('관리자만 카테고리를 삭제할 수 있습니다.')
    }

    const category = categories.find(cat => cat.id === id)
    if (category && category.count > 0) {
      throw new Error('문서가 있는 카테고리는 삭제할 수 없습니다.')
    }

    try {
      setLoading(true)
      setError(null)

      await categoryService.deleteCategory(id)
      
      // 로컬 상태에서 제거
      setCategories(prev => prev.filter(cat => cat.id !== id))
    } catch (err) {
      console.error('카테고리 삭제 실패:', err)
      setError('카테고리 삭제에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 카테고리 새로고침
  const refreshCategories = async (): Promise<void> => {
    await loadCategories()
  }

  const value: CategoryContextType = {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
  }

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  )
}

// useCategories 훅
export function useCategories(): CategoryContextType {
  const context = useContext(CategoryContext)
  if (!context) {
    throw new Error('useCategories는 CategoryProvider 내부에서 사용되어야 합니다.')
  }
  return context
}