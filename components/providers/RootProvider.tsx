'use client'

import React from 'react'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { DocumentProvider } from '@/components/documents/DocumentProvider'
import { CategoryProvider } from '@/components/categories/CategoryProvider'

interface RootProviderProps {
  children: React.ReactNode
}

/**
 * 모든 Context Provider를 통합하는 Root Provider
 * 순서가 중요합니다: Auth → Category → Document
 */
export function RootProvider({ children }: RootProviderProps) {
  return (
    <AuthProvider>
      <CategoryProvider>
        <DocumentProvider>
          {children}
        </DocumentProvider>
      </CategoryProvider>
    </AuthProvider>
  )
}