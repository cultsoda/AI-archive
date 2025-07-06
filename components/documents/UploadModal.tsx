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
  const [tagInput, setTagInput] = useState<string>('')

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
      setTagInput((editingDocument.tags || []).join(', '))
    } else {
      setForm({
        title: '',
        content: '',
        category: '',
        isLocked: false,
        password: '',
        tags: [],
      })
      setTagInput('')
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
      
      const documentData: any = {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
        isLocked: form.isLocked,
        tags: tagInput.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      }

      // password 필드는 잠금이 설정된 경우에만 추가 (undefined 방지)
      if (form.isLocked && form.password) {
        documentData.password = form.password
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
      setTagInput('')
      setError(null)
      onClose()
    }
  }

  const handleTagInputChange = (value: string) => {
    setTagInput(value)
  }

  const isEditMode = !!editingDocument

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            {isEditMode ? '문서 수정' : '새 문서 업로드'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-700 dark:text-gray-300 font-medium">
              제목 *
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              placeholder="문서 제목을 입력하세요"
              required
              disabled={isLoading}
            />
          </div>

          {/* 카테고리 */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-700 dark:text-gray-300 font-medium">
              카테고리 *
            </Label>
            {categories.length === 0 ? (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                  사용 가능한 카테고리가 없습니다. 먼저 카테고리를 생성해주세요.
                </p>
              </div>
            ) : (
              <Select
                value={form.category}
                onValueChange={(value) => setForm({ ...form, category: value })}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  {categories.map((category) => (
                    <SelectItem 
                      key={category.id} 
                      value={category.name}
                      className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600"
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${category.color.split(' ')[0]}`}></div>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 태그 */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-gray-700 dark:text-gray-300 font-medium">
              태그 (선택사항)
            </Label>
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => handleTagInputChange(e.target.value)}
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              placeholder="태그1, 태그2, 태그3 (쉼표로 구분)"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              쉼표로 구분하여 여러 태그를 입력할 수 있습니다
            </p>
            {/* 태그 미리보기 */}
            {tagInput && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tagInput.split(',').map((tag, index) => {
                  const trimmedTag = tag.trim()
                  if (!trimmedTag) return null
                  return (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {trimmedTag}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* 내용 */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-gray-700 dark:text-gray-300 font-medium">
              내용 *
            </Label>
            <Textarea
              id="content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 min-h-[200px] resize-y"
              placeholder="문서 내용을 입력하세요"
              rows={8}
              required
              disabled={isLoading}
            />
          </div>

          {/* 보안 설정 */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">보안 설정</h4>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isLocked"
                checked={form.isLocked}
                onChange={(e) => setForm({ ...form, isLocked: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <Label htmlFor="isLocked" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                문서 잠금 (비밀번호 필요)
              </Label>
            </div>
            
            {form.isLocked && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-700 dark:text-gray-300">
                  잠금 비밀번호
                </Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="문서 잠금 비밀번호"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          {/* 버튼들 */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              취소
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || categories.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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