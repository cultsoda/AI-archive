'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, ExternalLink, Eye, Code, Maximize2 } from 'lucide-react'
import type { Document, DocumentType } from '@/lib/types'

interface DocumentViewerProps {
  document: Document | null
  isOpen: boolean
  onClose: () => void
}

// CSV 파싱 및 테이블 렌더링
function CSVTable({ content }: { content: string }) {
  const lines = content.trim().split('\n')
  if (lines.length === 0) return <p>빈 CSV 파일입니다.</p>

  const headers = lines[0].split(',').map(h => h.trim())
  const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()))

  return (
    <div className="overflow-auto border rounded-lg max-h-96">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// 마크다운 간단 렌더링 (기본적인 것들만)
function MarkdownRenderer({ content }: { content: string }) {
  const renderMarkdown = (text: string) => {
    return text
      // 헤딩
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100">$1</h1>')
      // 볼드
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
      // 이탤릭
      .replace(/\*(.*)\*/gim, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')
      // 코드 블록
      .replace(/```([\s\S]*?)```/gim, '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm text-gray-800 dark:text-gray-200">$1</code></pre>')
      // 인라인 코드
      .replace(/`([^`]*)`/gim, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm text-gray-800 dark:text-gray-200">$1</code>')
      // 링크
      .replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // 리스트
      .replace(/^\* (.*$)/gim, '<li class="ml-4 text-gray-700 dark:text-gray-300">• $1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 text-gray-700 dark:text-gray-300">• $1</li>')
      // 줄바꿈
      .replace(/\n/gim, '<br>')
  }

  return (
    <div 
      className="prose prose-sm dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}

// HTML 렌더링 (실제 웹페이지로 표시)
function HTMLRenderer({ content }: { content: string }) {
  const [showRaw, setShowRaw] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (showRaw) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex justify-between items-center flex-shrink-0">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">HTML 소스 코드</h4>
          <Button size="sm" onClick={() => setShowRaw(false)}>
            <Eye className="h-4 w-4 mr-2" />
            렌더링 보기
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm h-full">
            <code className="text-gray-800 dark:text-gray-200">{content}</code>
          </pre>
        </div>
      </div>
    )
  }

  const openInNewWindow = () => {
    const newWindow = window.open('', '_blank', 'width=1200,height=800')
    if (newWindow) {
      newWindow.document.write(content)
      newWindow.document.close()
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={`space-y-4 h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4' : ''}`}>
      <div className="flex justify-between items-center flex-shrink-0">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">HTML 미리보기</h4>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={toggleFullscreen}>
            <Maximize2 className="h-4 w-4 mr-2" />
            {isFullscreen ? '축소' : '전체화면'}
          </Button>
          <Button size="sm" variant="outline" onClick={openInNewWindow}>
            <ExternalLink className="h-4 w-4 mr-2" />
            새 창
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowRaw(true)}>
            <Code className="h-4 w-4 mr-2" />
            소스 보기
          </Button>
        </div>
      </div>
      <div className={`border rounded-lg bg-white dark:bg-gray-900 flex-1 ${isFullscreen ? 'h-full' : ''}`}>
        <iframe
          srcDoc={content}
          className={`w-full border-0 rounded-lg ${isFullscreen ? 'h-full' : 'h-96'}`}
          title="HTML 미리보기"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
        />
      </div>
      {isFullscreen && (
        <div className="flex justify-center">
          <Button onClick={toggleFullscreen} variant="outline">
            닫기
          </Button>
        </div>
      )}
    </div>
  )
}

// 일반 텍스트 렌더링
function TextRenderer({ content }: { content: string }) {
  return (
    <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
      {content}
    </div>
  )
}

export function DocumentViewer({ document, isOpen, onClose }: DocumentViewerProps) {
  if (!document) return null

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(document.content)
      // 토스트 알림이 있다면 여기에 추가
    } catch (err) {
      console.error('클립보드 복사 실패:', err)
    }
  }

  const getDocumentTypeIcon = (type?: DocumentType) => {
    switch (type) {
      case 'html': return '🌐'
      case 'csv': return '📊'
      case 'markdown': return '📄'
      default: return '📝'
    }
  }

  const getDocumentTypeLabel = (type?: DocumentType) => {
    switch (type) {
      case 'html': return 'HTML'
      case 'csv': return 'CSV'
      case 'markdown': return 'Markdown'
      default: return '텍스트'
    }
  }

  const renderContent = () => {
    switch (document.documentType) {
      case 'html':
        return <HTMLRenderer content={document.content} />
      case 'csv':
        return <CSVTable content={document.content} />
      case 'markdown':
        return <MarkdownRenderer content={document.content} />
      default:
        return <TextRenderer content={document.content} />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                {document.title}
              </DialogTitle>
              <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                <div className="flex items-center space-x-1">
                  <span>{getDocumentTypeIcon(document.documentType)}</span>
                  <Badge variant="secondary">
                    {getDocumentTypeLabel(document.documentType)}
                  </Badge>
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {document.category}
                </Badge>
                <span>작성자: {document.author}</span>
                <span>작성일: {formatDate(document.createdAt)}</span>
                {document.updatedAt !== document.createdAt && (
                  <span className="text-orange-500">
                    수정: {formatDate(document.updatedAt)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2 flex-shrink-0 ml-4">
              <Button size="sm" variant="outline" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                복사
              </Button>
            </div>
          </div>

          {/* 태그 표시 */}
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {document.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* 문서 내용 - 스크롤 가능 */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="h-full overflow-auto">
            {renderContent()}
          </div>
        </div>

        {/* 푸터 */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}