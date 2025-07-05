'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthProvider'
import type { LoginForm } from '@/lib/types'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signIn } = useAuth()
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.email || !form.password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      await signIn(form.email, form.password)
      
      // 성공 시 모달 닫기 및 폼 초기화
      setForm({ email: '', password: '' })
      onClose()
    } catch (err: any) {
      console.error('로그인 실패:', err)
      
      // Firebase 에러 메시지를 사용자 친화적으로 변환
      let errorMessage = '로그인에 실패했습니다.'
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = '존재하지 않는 계정입니다.'
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = '잘못된 비밀번호입니다.'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = '올바른 이메일 형식이 아닙니다.'
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setForm({ email: '', password: '' })
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">로그인</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* 이메일 */}
          <div>
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              placeholder="example@email.com"
              required
              disabled={isLoading}
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
              비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              placeholder="비밀번호를 입력하세요"
              required
              disabled={isLoading}
            />
          </div>

          {/* 테스트 계정 안내 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">테스트 계정:</p>
            <p className="text-blue-700 dark:text-blue-400">관리자: cultsoda@gmail.com</p>
            <p className="text-blue-700 dark:text-blue-400">일반: 임의의 등록된 이메일</p>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-gray-200 dark:border-gray-600"
            >
              취소
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}