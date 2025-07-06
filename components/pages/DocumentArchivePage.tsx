'use client'

import React, { useState, useEffect } from 'react'
import { FileText, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/Header'
import { DesktopSidebar, MobileSidebarContent } from '@/components/layout/Sidebar'
import { LoginModal } from '@/components/auth/LoginModal'
import { SignupModal } from '@/components/auth/SignupModal'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { UploadModal } from '@/components/documents/UploadModal'
import { CategoryModal } from '@/components/categories/CategoryModal'
import { useAuth } from '@/components/auth/AuthProvider'
import { useDocuments } from '@/components/documents/DocumentProvider'
import { useCategories } from '@/components/categories/CategoryProvider'
import { DocumentViewer } from '@/components/documents/DocumentViewer'
import type { Document } from '@/lib/types'

export default function DocumentArchivePage() {
  const { user } = useAuth()
  const { documents, loading: documentsLoading, deleteDocument } = useDocuments()
  const { categories } = useCategories()

  // UI 상태
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  //기타 추가
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null)

  // 모달 상태
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)

  // 다크모드 감지 및 적용
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setIsDark(mediaQuery.matches)

      const handleChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [isDark])

  // 문서 필터링
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // 카테고리별 문서 그룹화
  const groupedDocuments = filteredDocuments.reduce(
    (acc, doc) => {
      if (!acc[doc.category]) {
        acc[doc.category] = []
      }
      acc[doc.category].push(doc)
      return acc
    },
    {} as Record<string, Document[]>
  )

  // 이벤트 핸들러들
  const handleEditDocument = (document: Document) => {
    setEditingDocument(document)
    setShowUploadModal(true)
  }

  // ✅ 실제 삭제 함수 호출
  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocument(documentId) // 실제 삭제 함수 호출
      console.log('문서 삭제 완료:', documentId)
    } catch (err: any) {
      console.error('문서 삭제 실패:', err)
  }
}

  const handleViewDocument = (document: Document) => {
  setViewingDocument(document)
  }


  const handleUploadModalClose = () => {
    setShowUploadModal(false)
    setEditingDocument(null)
  }

  // 모바일 사이드바 컨텐츠
  const mobileMenuContent = (
    <MobileSidebarContent
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      selectedCategory={selectedCategory}
      onCategorySelect={setSelectedCategory}
      onMobileClose={() => setIsMobileMenuOpen(false)}
    />
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <Header
        onLoginClick={() => setShowLoginModal(true)}
        onSignupClick={() => setShowSignupModal(true)}
        onUploadClick={() => setShowUploadModal(true)}
        onCategoryManageClick={() => setShowCategoryModal(true)}
        onMobileMenuToggle={setIsMobileMenuOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        mobileMenuContent={mobileMenuContent}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <DesktopSidebar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
          {!user ? (
            /* 비로그인 상태 */
            <div className="flex flex-col items-center justify-center h-96 text-center px-4">
              <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                문서 아카이브에 오신 것을 환영합니다
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
                문서를 보려면 로그인이 필요합니다.
              </p>
              <Button onClick={() => setShowLoginModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <LogIn className="h-4 w-4 mr-2" />
                로그인하기
              </Button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            /* 문서가 없는 상태 */
            <div className="flex flex-col items-center justify-center h-96 text-center px-4">
              <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm || selectedCategory !== 'all' 
                  ? '검색 조건에 맞는 문서가 없습니다'
                  : '문서가 없습니다'
                }
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
                {searchTerm || selectedCategory !== 'all'
                  ? '다른 검색어나 카테고리를 시도해보세요.'
                  : user.role === 'admin' 
                    ? '첫 번째 문서를 업로드해보세요.'
                    : '아직 업로드된 문서가 없습니다.'
                }
              </p>
              {user.role === 'admin' && !searchTerm && selectedCategory === 'all' && (
                <Button onClick={() => setShowUploadModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  <FileText className="h-4 w-4 mr-2" />
                  첫 문서 업로드하기
                </Button>
              )}
            </div>
          ) : (
            /* 문서 목록 */
            <div className="space-y-6 sm:space-y-8">
              {/* 검색 결과 헤더 */}
              {(searchTerm || selectedCategory !== 'all') && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        검색 결과
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {searchTerm && `"${searchTerm}" 검색 • `}
                        {selectedCategory !== 'all' && `${selectedCategory} 카테고리 • `}
                        총 {filteredDocuments.length}개 문서
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('all')
                      }}
                      size="sm"
                    >
                      필터 초기화
                    </Button>
                  </div>
                </div>
              )}

              {/* 카테고리별 문서 목록 */}
              {Object.entries(groupedDocuments).map(([categoryName, docs]) => (
                <div key={categoryName}>
                  <div className="flex items-center space-x-2 mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {categoryName}
                    </h2>
                    <Badge
                      className={
                        categories.find((cat) => cat.name === categoryName)?.color ||
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }
                    >
                      {docs.length}개
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {docs.map((document) => (
                      <DocumentCard
                        key={document.id}
                        document={document}
                        onEdit={handleEditDocument}
                        onDelete={handleDeleteDocument}
                        onView={handleViewDocument}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* 로딩 상태 */}
              {documentsLoading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">문서를 불러오는 중...</span>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 모달들 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
      />

      <UploadModal
        isOpen={showUploadModal}
        onClose={handleUploadModalClose}
        editingDocument={editingDocument}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />

      <DocumentViewer
        document={viewingDocument}
        isOpen={!!viewingDocument}
        onClose={() => setViewingDocument(null)}
      />
    </div>
  )
}