'use client'

import React from 'react'
import { User, Calendar, Eye, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCategories } from '@/components/categories/CategoryProvider'
import { useAuth } from '@/components/auth/AuthProvider'
import type { Document } from '@/lib/types'

interface DocumentCardProps {
  document: Document
  onEdit?: (document: Document) => void
  onDelete?: (documentId: string) => void
  onView?: (document: Document) => void
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
        
        {/* Category badge */}
        <Badge className={categoryColor}>
          {document.category}
        </Badge>
      </CardHeader>
      
      <CardContent>
        {/* Content preview */}
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
          {document.content}
        </p>
        
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