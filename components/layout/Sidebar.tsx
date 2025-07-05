'use client'

import React from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { useCategories } from '@/components/categories/CategoryProvider'
import { useDocuments } from '@/components/documents/DocumentProvider'

interface SidebarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedCategory: string
  onCategorySelect: (category: string) => void
  isMobile?: boolean
  onMobileClose?: () => void
}

export function Sidebar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  isMobile = false,
  onMobileClose,
}: SidebarProps) {
  const { categories } = useCategories()
  const { documents } = useDocuments()

  const handleCategoryClick = (categoryName: string) => {
    onCategorySelect(categoryName)
    if (isMobile && onMobileClose) {
      onMobileClose()
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors ${
      isMobile ? 'h-full' : 'h-[calc(100vh-73px)]'
    } p-6`}>
      <div className="space-y-6">
        {/* Mobile header */}
        {isMobile && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">메뉴</h2>
            {onMobileClose && (
              <Button variant="ghost" size="sm" onClick={onMobileClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="문서 검색..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`pl-10 ${
              isMobile 
                ? '' 
                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
            }`}
          />
        </div>

        <Separator className="dark:bg-gray-700" />

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">카테고리</h3>
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          
          <div className="space-y-2">
            {/* All documents */}
            <button
              onClick={() => handleCategoryClick('all')}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>전체</span>
              <Badge variant="secondary">{documents.length}</Badge>
            </button>

            {/* Category list */}
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  selectedCategory === category.name
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{category.name}</span>
                <Badge variant="secondary">{category.count}</Badge>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Desktop Sidebar wrapper
export function DesktopSidebar(props: Omit<SidebarProps, 'isMobile' | 'onMobileClose'>) {
  return (
    <aside className="hidden md:block w-80">
      <Sidebar {...props} />
    </aside>
  )
}

// Mobile Sidebar content
export function MobileSidebarContent(props: SidebarProps) {
  return <Sidebar {...props} isMobile={true} />
}