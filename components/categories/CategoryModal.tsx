'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useCategories } from '@/components/categories/CategoryProvider'
import { useAuth } from '@/components/auth/AuthProvider'
import type { CategoryForm, CATEGORY_COLORS } from '@/lib/types'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
}

const AVAILABLE_COLORS = [
  { value: 'bg-blue-100 text-blue-800', label: '파란색' },
  { value: 'bg-green-100 text-green-800', label: '초록색' },
  { value: 'bg-purple-100 text-purple-800', label: '보라색' },
  { value: 'bg-red-100 text-red-800', label: '빨간색' },
  { value: 'bg-yellow-100 text-yellow-800', label: '노란색' },
  { value: 'bg-indigo-100 text-indigo-800', label: '인디고' },
  { value: 'bg-pink-100 text-pink-800', label: '핑크색' },
  { value: 'bg-gray-100 text-gray-800', label: '회색' },
] as const

export function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
  const { user } = useAuth()
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories()
  
  const [form, setForm] = useState<CategoryForm>({
    name: '',
    color: 'bg-blue-100 text-blue-800',
  })
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateForm = (): string | null => {
    if (!form.name.trim()) {
      return '카테고리 이름을 입력해주세요.'
    }
    
    // 중복 이름 체크 (수정 모드가 아닐 때만)
    if (!editingCategory) {
      const exists = categories.some(cat => 
        cat.name.toLowerCase() === form.name.trim().toLowerCase()
      )
      if (exists) {
        return '이미 존재하는 카테고리 이름입니다.'
      }
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || user.role !== 'admin') {
      setError('관리자만 카테고리를 관리할 수 있습니다.')
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
      
      const categoryData = {
        name: form.name.trim(),
        color: form.color,
      }

      if (editingCategory) {
        await updateCategory(editingCategory, categoryData)
        setEditingCategory(null)
      } else {
        await addCategory(categoryData)
      }
      
      // 폼 초기화
      setForm({
        name: '',
        color: 'bg-blue-100 text-blue-800',
      })
    } catch (err: any) {
      console.error('카테고리 저장 실패:', err)
      setError(err.message || '카테고리 저장에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    if (category) {
      setForm({
        name: category.name,
        color: category.color,
      })
      setEditingCategory(categoryId)
      setError(null)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!user || user.role !== 'admin') return

    const category = categories.find(cat => cat.id === categoryId)
    if (!category) return

    if (category.count > 0) {
      setError('문서가 있는 카테고리는 삭제할 수 없습니다.')
      return
    }

    if (!window.confirm(`'${category.name}' 카테고리를 삭제하시겠습니까?`)) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      await deleteCategory(categoryId)
    } catch (err: any) {
      console.error('카테고리 삭제 실패:', err)
      setError(err.message || '카테고리 삭제에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setForm({
      name: '',
      color: 'bg-blue-100 text-blue-800',
    })
    setEditingCategory(null)
    setError(null)
  }

  const handleClose = () => {
    if (!isLoading) {
      handleCancel()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">카테고리 관리</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* 카테고리 추가/수정 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {editingCategory ? '카테고리 수정' : '새 카테고리 추가'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 카테고리 이름 */}
              <div>
                <Label htmlFor="categoryName" className="text-gray-700 dark:text-gray-300">
                  카테고리 이름 *
                </Label>
                <Input
                  id="categoryName"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  placeholder="카테고리 이름을 입력하세요"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* 카테고리 색상 */}
              <div>
                <Label htmlFor="categoryColor" className="text-gray-700 dark:text-gray-300">
                  색상 *
                </Label>
                <Select
                  value={form.color}
                  onValueChange={(value) => setForm({ ...form, color: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded ${color.value}`}></div>
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 미리보기 */}
            {form.name && (
              <div className="mt-4">
                <Label className="text-gray-700 dark:text-gray-300">미리보기:</Label>
                <div className="mt-1">
                  <Badge className={form.color}>
                    {form.name}
                  </Badge>
                </div>
              </div>
            )}

            {/* 버튼들 */}
            <div className="flex justify-end space-x-2">
              {editingCategory && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="border-gray-200 dark:border-gray-600"
                >
                  취소
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isLoading 
                  ? (editingCategory ? '수정 중...' : '추가 중...') 
                  : (editingCategory ? '수정' : '추가')
                }
              </Button>
            </div>
          </form>

          {/* 기존 카테고리 목록 */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">기존 카테고리</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">등록된 카테고리가 없습니다.</p>
              ) : (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge className={category.color}>
                        {category.name}
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        문서 {category.count}개
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(category.id)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-600"
                        title="카테고리 수정"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(category.id)}
                        disabled={isLoading || category.count > 0}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                        title={category.count > 0 ? "문서가 있어 삭제할 수 없습니다" : "카테고리 삭제"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 닫기 버튼 */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-gray-200 dark:border-gray-600"
            >
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}