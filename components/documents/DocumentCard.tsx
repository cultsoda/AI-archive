'use client'

import React from 'react'
import { User, Calendar, Eye, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCategories } from '@/components/categories/CategoryProvider'
import { useAuth } from '@/components/auth/AuthProvider'
import type { Document, DocumentType } from '@/lib/types'

interface DocumentCardProps {
  document: Document
  onEdit?: (document: Document) => void
  onDelete?: (documentId: string) => void
  onView?: (document: Document) => void
}

// 문서 타입별 아이콘과 라벨
const getDocumentTypeInfo = (type?: DocumentType) => {
  switch (type) {
    case 'html':
      return { icon: '🌐', label: 'HTML', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
    case 'csv':
      return { icon: '📊', label: 'CSV', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' }
    case 'markdown':
      return { icon: '📄', label: 'Markdown', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' }
    default:
      return { icon: '📝', label: '텍스트', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' }
  }
}

// 내용 미리보기 (타입별로 다르게 처리)
const getContentPreview = (document: Document, maxLength: number = 150) => {
  const content = document.content.trim()
  
  switch (document.documentType) {
    case 'html':
      // HTML 태그 제거하고 텍스트만 추출
      const textContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      return textContent.length > maxLength 
        ? textContent.substring(0, maxLength) + '...'
        : textContent
    
    case 'csv':
      // CSV의 첫 몇 줄만 표시
      const lines = content.split('\n').filter(line => line.trim())
      const preview = lines.slice(0, 3).join('\n')
      return preview.length > maxLength 
        ? preview.substring(0, maxLength) + '...'
        : preview + (lines.length > 3 ? `\n... (총 ${lines.length}줄)` : '')
    
    case 'markdown':
      // 마크다운 문법 제거하고 텍스트만 추출
      const markdownText = content
        .replace(/#{1,6}\s+/g, '') // 헤딩 제거
        .replace(/\*\*(.*?)\*\*/g, '$1') // 볼드 제거
        .replace(/\*(.*?)\*/g, '$1') // 이탤릭 제거
        .replace(/`(.*?)`/g, '$1') // 인라인 코드 제거
        .replace(/\[([^\]]*)\]\([^\)]*\)/g, '$1') // 링크 제거
        .replace(/^[-*+]\s+/gm, '') // 리스트 마커 제거
        .replace(/\n+/g, ' ')
        .trim()
      return markdownText.length > maxLength 
        ? markdownText.substring(0, maxLength) + '...'
        : markdownText
    
    default:
      // 일반 텍스트
      return content.length > maxLength 
        ? content.substring(0, maxLength) + '...'
        : content
  }
}

export function DocumentCard({ 
  document, 
  onEdit, 
  onDelete, 
  onView 
}: DocumentCardProps) {
  const { user } = useAuth()
  const { categories } = useCategories()

  // 카테고리 색상 찾기
  const categoryColor = categories.find(cat => cat.name === document.category)?.color || 
    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'

  // 문서 타입 정보
  const typeInfo = getDocumentTypeInfo(document.documentType)

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const handleEdit = () => {
    if (onEdit && user?.role === 'admin') {
      onEdit(document)
    }
  }

  const handleDelete = () => {
    if (onDelete && user?.role === 'admin') {
      if (window.confirm('이 문서를 삭제하시겠습니까?')) {
        onDelete(document.id)
      }
    }
  }

  const handleView = () => {
    if (onView) {
      onView(document)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base sm:text-lg line-clamp-2 text-gray-900 dark:text-gray-100 pr-2">
            {document.title}
          </CardTitle>
          
          {/* Admin actions */}
          {user?.role === 'admin' && (
            <div className="flex space-x-1 ml-2 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="문서 수정"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                title="문서 삭제"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* 카테고리와 문서 타입 배지 */}
        <div className="flex items-center space-x-2">
          <Badge className={categoryColor}>
            {document.category}
          </Badge>
          <Badge className={typeInfo.color}>
            <span className="mr-1">{typeInfo.icon}</span>
            {typeInfo.label}
          </Badge>
        </div>

        {/* 태그 표시 */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {document.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {document.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{document.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Content preview */}
        <div className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {document.documentType === 'csv' ? (
            <pre className="whitespace-pre-wrap font-mono text-xs line-clamp-3">
              {getContentPreview(document)}
            </pre>
          ) : (
            <p className="line-clamp-3">
              {getContentPreview(document)}
            </p>
          )}
        </div>
        
        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
            {/* Author */}
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{document.author}</span>
            </div>
            
            {/* Date */}
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(document.createdAt)}</span>
            </div>
            
            {/* Updated date if different */}
            {document.updatedAt !== document.createdAt && (
              <div className="flex items-center space-x-1 text-orange-500">
                <span>수정: {formatDate(document.updatedAt)}</span>
              </div>
            )}
          </div>
          
          {/* View button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleView}
            className="h-6 px-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Eye className="h-3 w-3 mr-1" />
            보기
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}