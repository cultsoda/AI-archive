'use client'

import React, { useState } from 'react'
import { FileText, Menu, Upload, Settings, Shield, User, LogIn, LogOut, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/components/auth/AuthProvider'

interface HeaderProps {
  onLoginClick: () => void
  onSignupClick: () => void
  onUploadClick: () => void
  onCategoryManageClick: () => void
  onMobileMenuToggle: (open: boolean) => void
  isMobileMenuOpen: boolean
  mobileMenuContent: React.ReactNode
}

export function Header({
  onLoginClick,
  onSignupClick,
  onUploadClick,
  onCategoryManageClick,
  onMobileMenuToggle,
  isMobileMenuOpen,
  mobileMenuContent,
}: HeaderProps) {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={onMobileMenuToggle}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              {mobileMenuContent}
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              <span className="hidden sm:inline">AI Document Archive</span>
              <span className="sm:hidden">문서 아카이브</span>
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <>
              {/* Admin actions - Desktop */}
              {user.role === 'admin' && (
                <div className="hidden sm:flex space-x-2">
                  <Button onClick={onUploadClick} className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="h-4 w-4 mr-2" />
                    문서 업로드
                  </Button>
                  <Button variant="outline" onClick={onCategoryManageClick}>
                    <Settings className="h-4 w-4 mr-2" />
                    카테고리 관리
                  </Button>
                </div>
              )}

              {/* Admin actions - Mobile */}
              {user.role === 'admin' && (
                <div className="sm:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <div className="space-y-4 pt-6">
                        <Button
                          className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                          onClick={onUploadClick}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          문서 업로드
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={onCategoryManageClick}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          카테고리 관리
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}

              {/* User info */}
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-900">
                    {user.role === 'admin' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm hidden sm:block">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                    {user.role === 'admin' ? '관리자' : '뷰어'}
                  </Badge>
                </div>
              </div>

              {/* Logout button */}
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">로그아웃</span>
              </Button>
            </>
          ) : (
            /* Auth buttons */
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onLoginClick} size="sm">
                <LogIn className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">로그인</span>
              </Button>
              <Button onClick={onSignupClick} className="bg-blue-600 hover:bg-blue-700" size="sm">
                <span className="hidden sm:inline">회원가입</span>
                <span className="sm:hidden">가입</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}