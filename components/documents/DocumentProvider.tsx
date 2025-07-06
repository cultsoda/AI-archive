'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { documentService, categoryService } from '@/lib/firestore'
import { useAuth } from '@/components/auth/AuthProvider'
import type { DocumentContextType, Document, DocumentForm } from '@/lib/types'

const DocumentContext = createContext<DocumentContextType | null>(null)

interface DocumentProviderProps {
  children: React.ReactNode
}

export function DocumentProvider({ children }: DocumentProviderProps) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 문서 목록 로드
  const loadDocuments = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const docs = await documentService.getAllDocuments({
        sort: { sortBy: 'createdAt', order: 'desc' }
      })
      setDocuments(docs)
    } catch (err) {
      console.error('문서 로드 실패:', err)
      setError('문서를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 사용자 로그인 시 문서 로드
  useEffect(() => {
    if (user) {
      loadDocuments()
    } else {
      setDocuments([])
    }
  }, [user])

  // 실시간 문서 변경 감지 (로컬 상태 업데이트 제거)
  useEffect(() => {
    if (!user) return

    const unsubscribe = documentService.onDocumentsChange((docs) => {
      setDocuments(docs)
    })

    return () => unsubscribe()
  }, [user])

  // 문서 추가
  const addDocument = async (data: DocumentForm): Promise<void> => {
    if (!user || user.role !== 'admin') {
      throw new Error('관리자만 문서를 추가할 수 있습니다.')
    }

    try {
      setLoading(true)
      setError(null)

      const documentData = {
        ...data,
        authorUid: user.uid,
        author: user.name,
      }

      await documentService.createDocument(documentData)
      
      // 카테고리 카운트 업데이트
      await categoryService.updateCategoryCount(data.category, 1)
      
      // 실시간 리스너가 자동으로 상태를 업데이트하므로 
      // 로컬 상태 업데이트 제거

    } catch (err) {
      console.error('문서 추가 실패:', err)
      setError('문서 추가에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 문서 수정
  const updateDocument = async (id: string, data: Partial<DocumentForm>): Promise<void> => {
    if (!user || user.role !== 'admin') {
      throw new Error('관리자만 문서를 수정할 수 있습니다.')
    }

    try {
      setLoading(true)
      setError(null)

      await documentService.updateDocument(id, data)
      
      // 실시간 리스너가 자동으로 상태를 업데이트하므로 
      // 로컬 상태 업데이트 제거

    } catch (err) {
      console.error('문서 수정 실패:', err)
      setError('문서 수정에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 문서 삭제
  const deleteDocument = async (id: string): Promise<void> => {
    if (!user || user.role !== 'admin') {
      throw new Error('관리자만 문서를 삭제할 수 있습니다.')
    }

    try {
      setLoading(true)
      setError(null)

      console.log('삭제 시작:', id) // 디버깅용

      const document = documents.find(doc => doc.id === id)
      if (!document) {
        throw new Error('문서를 찾을 수 없습니다.')
      }

      console.log('삭제할 문서:', document.title, document.category) // 디버깅용

      // Firestore에서 문서 삭제
      await documentService.deleteDocument(id)
      console.log('Firestore에서 삭제 완료') // 디버깅용
      
      // 카테고리 카운트 업데이트
      await categoryService.updateCategoryCount(document.category, -1)
      console.log('카테고리 카운트 업데이트 완료') // 디버깅용
      
      // 실시간 리스너가 자동으로 상태를 업데이트하므로 
      // 로컬 상태 업데이트 제거

    } catch (err) {
      console.error('문서 삭제 실패:', err)
      setError('문서 삭제에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 문서 새로고침
  const refreshDocuments = async (): Promise<void> => {
    await loadDocuments()
  }

  const value: DocumentContextType = {
    documents,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    refreshDocuments,
  }

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  )
}

// useDocuments 훅
export function useDocuments(): DocumentContextType {
  const context = useContext(DocumentContext)
  if (!context) {
    throw new Error('useDocuments는 DocumentProvider 내부에서 사용되어야 합니다.')
  }
  return context
}