'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthProvider'
import type { SignupForm } from '@/lib/types'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const { signUp } = useAuth()
  const [form, setForm] = useState<SignupForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminKey: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateForm = (): string | null => {
    if (!form.name.trim()) {
      return '이름을 입력해주세요.'
    }
    
    if (!form.email.trim()) {
      return '이메일을 입력해주세요.'
    }
    
    if (!form.password) {
      return '비밀번호를 입력해주세요.'
    }
    
    if (form.password.length < 6) {
      return '비밀번호는 6자 이상이어야 합니다.'
    }
    
    if (form.password !== form.confirmPassword) {
      return '비밀번호가 일치하지 않습니다.'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      await signUp(form)
      
      // 성공 시 모달 닫기 및 폼 초기화
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        adminKey: '',
      })
      onClose()
    } catch (err: any) {
      console.error('회원가입 실패:', err)
      
      // Firebase 에러 메시지를 사용자 친화적으로 변환
      let errorMessage = '회원가입에 실패했습니다.'
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = '이미 사용 중인 이메일입니다.'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = '올바른 이메일 형식이 아닙니다.'
      } else if (err.code === 'auth/weak-password') {
        errorMessage = '비밀번호가 너무 약합니다.'
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = '이메일/비밀번호 계정이 비활성화되어 있습니다.'
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
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        adminKey: '',
      })
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">회원가입</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* 이름 */}
          <div>
            <Label htmlFor="signupName" className="text-gray-700 dark:text-gray-300">
              이름
            </Label>
            <Input
              id="signupName"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              placeholder="홍길동"
              required
              disabled={isLoading}
            />
          </div>

          {/* 이메일 */}
          <div>
            <Label htmlFor="signupEmail" className="text-gray-700 dark:text-gray-300">
              이메일
            </Label>
            <Input
              id="signupEmail"
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
            <Label htmlFor="signupPassword" className="text-gray-700 dark:text-gray-300">
              비밀번호
            </Label>
            <Input
              id="signupPassword"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              placeholder="6자 이상 입력해주세요"
              required
              minLength={6}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">6자 이상 입력해주세요</p>
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
              비밀번호 확인
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              placeholder="비밀번호를 다시 입력해주세요"
              required
              disabled={isLoading}
            />
          </div>

          {/* 관리자 키 */}
          <div>
            <Label htmlFor="adminKey" className="text-gray-700 dark:text-gray-300">
              관리자 키 (선택사항)
            </Label>
            <Input
              id="adminKey"
              type="password"
              placeholder="관리자 권한을 원하면 입력하세요"
              value={form.adminKey}
              onChange={(e) => setForm({ ...form, adminKey: e.target.value })}
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              관리자 키를 입력하면 admin 권한으로 가입됩니다. 입력하지 않으면 viewer 권한입니다.
            </p>
          </div>

          {/* 권한 안내 */}
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm">
            <p className="font-medium text-green-800 dark:text-green-300 mb-1">가입 정보:</p>
            <p className="text-green-700 dark:text-green-400">
              • 기본 권한: 뷰어 (문서 읽기만 가능)
            </p>
            <p className="text-green-700 dark:text-green-400">
              • 관리자 키 입력 시: 관리자 (업로드, 수정, 삭제 가능)
            </p>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? '가입 중...' : '회원가입'}
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