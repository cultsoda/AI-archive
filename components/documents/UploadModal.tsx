'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDocuments } from '@/components/documents/DocumentProvider'
import { useCategories } from '@/components/categories/CategoryProvider'
import { useAuth } from '@/components/auth/AuthProvider'
import type { Document, DocumentForm } from '@/lib/types'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  editingDocument?: Document | null
}

export function UploadModal({ 
  isOpen, 
  onClose, 
  editingDocument = null 
}: UploadModalProps) {
  const { user } = useAuth()
  const { addDocument, updateDocument } = useDocuments()
  const { categories } = useCategories()
  
  const [form, setForm] = useState<DocumentForm>({
    title: '',
    content: '',
    category: '',
    isLocked: false,
    password: '',
    tags: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 수정 모드일 때 폼 초기화
  useEffect(() => {
    if (editingDocument) {
      setForm({
        title: editingDocument.title,
        content: editingDocument.content,
        category: editingDocument.category,
        isLocked: editingDocument.isLocked || false,
        password: editingDocument.password || '',
        tags: editingDocument.tags || [],
      })
    } else {
      setForm({
        title: '',
        content: '',
        category: '',
        isLocked: false,
        password: '',
        tags: [],
      })
    }
    setError(null)
  }, [editingDocument, isOpen])

  const validateForm = (): string | null => {
    if (!form.title.trim()) {
      return '제목을 입력해주세요.'
    }
    
    if (!form.content.trim()) {
      return '내용을 입력해주세요.'
    }
    
    if (!form.category) {
      return '카테고리를 선택해주세요.'
    }
    
    if (form.isLocked && !form.password) {
      return '잠금 설정 시 비밀번호를 입력해주세요.'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || user.role !== 'admin') {
      setError('관리자만 문서를 업로드할 수 있습니다.')
      return
    }

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const documentData = {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
        isLocked: form.isLocked,
        password: form.isLocked ? form.password : undefined,
        tags: form.tags.filter(tag => tag.trim() !== ''),
      }

      if (editingDocument) {
        await updateDocument(editingDocument.id, documentData)
      } else {
        await addDocument(documentData)
      }
      
      // 성공 시 모달 닫기 및 폼 초기화
      handleClose()
    } catch (err: any) {
      console.error('문서 저장 실패:', err)
      setError(err.message || '문서 저장에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setForm({
        title: '',
        content: '',
        category: '',
        isLocked: false,
        password: '',
        tags: [],
      })
      setError(null)
      onClose()
    }
  }

  const handleTagsChange = (value: string) => {
    // 쉼표로 구분된 태그들을 배열로 변환
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    setForm({ ...form, tags })
  }

  const isEditMode = !!editingDocument

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            {isEditMode ? '문서 수정' : '새 문서 업로드'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* 제목 */}
          <div>
            <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">
              제목 *
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              placeholder="문서 제목을 입력하세요"
              required
              disabled={isLoading}
            />
          </div>

          {/* 카테고리 */}
          <div>
            <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">
              카테고리 *
            </Label>
            <Select
              value={form.category}
              onValueChange={(value) => setForm({ ...form, category: value })}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 태그 */}
          <div>
            <Label htmlFor="tags" className="text-gray-700 dark:text-gray-300">
              태그 (선택사항)
            </Label>
            <Input
              id="tags"
              value={form.tags?.join(', ') || ''}
              onChange={(e) => handleTagsChange(e.target.value)}
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              placeholder="태그1, 태그2, 태그3 (쉼표로 구분)"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              쉼표로 구분하여 여러 태그를 입력할 수 있습니다
            </p>
          </div>

          {/* 내용 */}
          <div>
            <Label htmlFor="content" className="text-gray-700 dark:text-gray-300">
              내용 *
            </Label>
            <Textarea
              id="content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 min-h-[200px]"
              placeholder="문서 내용을 입력하세요"
              rows={8}
              required
              disabled={isLoading}
            />
          </div>

          {/* 보안 설정 (향후 확장용) */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">보안 설정</h4>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isLocked"
                checked={form.isLocked}
                onChange={(e) => setForm({ ...form, isLocked: e.target.checked })}
                className="rounded border-gray-300"
                disabled={isLoading}
              />
              <Label htmlFor="isLocked" className="text-sm text-gray-700 dark:text-gray-300">
                문서 잠금 (비밀번호 필요)
              </Label>
            </div>
            
            {form.isLocked && (
              <div className="mt-3">
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  placeholder="문서 잠금 비밀번호"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          {/* 버튼들 */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-gray-200 dark:border-gray-600"
            >
              취소
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading 
                ? (isEditMode ? '수정 중...' : '업로드 중...') 
                : (isEditMode ? '수정' : '업로드')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}