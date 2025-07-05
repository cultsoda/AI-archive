"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Search,
  Upload,
  Settings,
  Shield,
  User,
  LogIn,
  LogOut,
  FileText,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Types
interface Category {
  id: string
  name: string
  color: string
  count: number
}

interface Document {
  id: string
  title: string
  content: string
  category: string
  author: string
  createdAt: string
  updatedAt: string
}

interface AppUser {
  id: string
  name: string
  email: string
  role: "admin" | "viewer"
}

// Sample data
const sampleCategories: Category[] = [
  { id: "1", name: "사업", color: "bg-blue-100 text-blue-800", count: 2 },
  { id: "2", name: "디자인", color: "bg-green-100 text-green-800", count: 1 },
  { id: "3", name: "개발", color: "bg-purple-100 text-purple-800", count: 1 },
]

const sampleDocuments: Document[] = [
  {
    id: "1",
    title: "2024년 사업 계획서",
    content:
      "새로운 AI 기술을 활용한 혁신적인 서비스 개발 계획입니다. 시장 분석과 경쟁사 현황을 바탕으로 한 전략적 접근 방안을 제시합니다.",
    category: "사업",
    author: "김철수",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    title: "UI/UX 디자인 가이드라인",
    content:
      "브랜드 아이덴티티를 반영한 일관된 사용자 경험 설계를 위한 디자인 시스템입니다. 컬러 팔레트, 타이포그래피, 컴포넌트 규칙을 포함합니다.",
    category: "디자인",
    author: "이영희",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-12",
  },
  {
    id: "3",
    title: "시스템 아키텍처 문서",
    content:
      "마이크로서비스 기반의 확장 가능한 시스템 구조 설계 문서입니다. 각 서비스 간의 통신 방식과 데이터 플로우를 상세히 기술합니다.",
    category: "개발",
    author: "박민수",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-14",
  },
  {
    id: "4",
    title: "마케팅 전략 보고서",
    content:
      "타겟 고객 분석과 채널별 마케팅 전략을 담은 종합 보고서입니다. ROI 분석과 향후 6개월 실행 계획을 포함합니다.",
    category: "사업",
    author: "최지영",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-11",
  },
]

export default function DocumentArchive() {
  const [isDark, setIsDark] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 기존 상태들...
  const [user, setUser] = useState<AppUser | null>(null)

  // 시스템 테마 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    setIsDark(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // 다크모드 클래스 적용
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])
  const [documents, setDocuments] = useState<Document[]>(sampleDocuments)
  const [categories, setCategories] = useState<Category[]>(sampleCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer" as "admin" | "viewer",
  })

  // Document form state
  const [documentForm, setDocumentForm] = useState({
    title: "",
    content: "",
    category: "",
  })

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    color: "bg-blue-100 text-blue-800",
  })

  // Filter documents based on search and category
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Group documents by category
  const groupedDocuments = filteredDocuments.reduce(
    (acc, doc) => {
      if (!acc[doc.category]) {
        acc[doc.category] = []
      }
      acc[doc.category].push(doc)
      return acc
    },
    {} as Record<string, Document[]>,
  )

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const mockUser: AppUser = {
        id: "1",
        name: loginForm.email === "admin@example.com" ? "관리자" : "사용자",
        email: loginForm.email,
        role: loginForm.email === "admin@example.com" ? "admin" : "viewer",
      }
      setUser(mockUser)
      setShowLoginModal(false)
      setLoginForm({ email: "", password: "" })
      setIsLoading(false)
    }, 1000)
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      const newUser: AppUser = {
        id: Date.now().toString(),
        name: signupForm.name,
        email: signupForm.email,
        role: signupForm.role,
      }
      setUser(newUser)
      setShowSignupModal(false)
      setSignupForm({ name: "", email: "", password: "", role: "viewer" })
      setIsLoading(false)
    }, 1000)
  }

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || user.role !== "admin") return

    const newDocument: Document = {
      id: Date.now().toString(),
      title: documentForm.title,
      content: documentForm.content,
      category: documentForm.category,
      author: user.name,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }

    setDocuments([newDocument, ...documents])

    // Update category count
    setCategories(
      categories.map((cat) => (cat.name === documentForm.category ? { ...cat, count: cat.count + 1 } : cat)),
    )

    setDocumentForm({ title: "", content: "", category: "" })
    setShowUploadModal(false)
  }

  const handleEditDocument = (doc: Document) => {
    setEditingDocument(doc)
    setDocumentForm({
      title: doc.title,
      content: doc.content,
      category: doc.category,
    })
    setShowUploadModal(true)
  }

  const handleUpdateDocument = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDocument || !user || user.role !== "admin") return

    const updatedDocument: Document = {
      ...editingDocument,
      title: documentForm.title,
      content: documentForm.content,
      category: documentForm.category,
      updatedAt: new Date().toISOString().split("T")[0],
    }

    setDocuments(documents.map((doc) => (doc.id === editingDocument.id ? updatedDocument : doc)))

    setDocumentForm({ title: "", content: "", category: "" })
    setEditingDocument(null)
    setShowUploadModal(false)
  }

  const handleDeleteDocument = (docId: string) => {
    if (!user || user.role !== "admin") return

    const docToDelete = documents.find((doc) => doc.id === docId)
    if (docToDelete) {
      setDocuments(documents.filter((doc) => doc.id !== docId))

      // Update category count
      setCategories(
        categories.map((cat) =>
          cat.name === docToDelete.category ? { ...cat, count: Math.max(0, cat.count - 1) } : cat,
        ),
      )
    }
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || user.role !== "admin") return

    const newCategory: Category = {
      id: Date.now().toString(),
      name: categoryForm.name,
      color: categoryForm.color,
      count: 0,
    }

    setCategories([...categories, newCategory])
    setCategoryForm({ name: "", color: "bg-blue-100 text-blue-800" })
    setShowCategoryModal(false)
  }

  const handleLogout = () => {
    setUser(null)
    setSearchTerm("")
    setSelectedCategory("all")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">메뉴</h2>
                    <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {/* Mobile sidebar content */}
                  <div className="space-y-6">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="문서 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Separator />

                    {/* Categories */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">카테고리</h3>
                        <Filter className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setSelectedCategory("all")
                            setIsMobileMenuOpen(false)
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                            selectedCategory === "all"
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          <span>전체</span>
                          <Badge variant="secondary">{documents.length}</Badge>
                        </button>
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => {
                              setSelectedCategory(category.name)
                              setIsMobileMenuOpen(false)
                            }}
                            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                              selectedCategory === category.name
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700"
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
              </SheetContent>
            </Sheet>

            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                <span className="hidden sm:inline">AI Document Archive</span>
                <span className="sm:hidden">문서 아카이브</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {user.role === "admin" && (
                  <div className="hidden sm:flex space-x-2">
                    <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Upload className="h-4 w-4 mr-2" />
                          문서 업로드
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <DialogHeader>
                          <DialogTitle>{editingDocument ? "문서 수정" : "새 문서 업로드"}</DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={editingDocument ? handleUpdateDocument : handleUploadDocument}
                          className="space-y-4"
                        >
                          <div>
                            <Label htmlFor="title">제목</Label>
                            <Input
                              id="title"
                              value={documentForm.title}
                              onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">카테고리</Label>
                            <Select
                              value={documentForm.category}
                              onValueChange={(value) => setDocumentForm({ ...documentForm, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="카테고리 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.name}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="content">내용</Label>
                            <Textarea
                              id="content"
                              value={documentForm.content}
                              onChange={(e) => setDocumentForm({ ...documentForm, content: e.target.value })}
                              rows={6}
                              required
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowUploadModal(false)
                                setEditingDocument(null)
                                setDocumentForm({ title: "", content: "", category: "" })
                              }}
                            >
                              취소
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                              {editingDocument ? "수정" : "업로드"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          카테고리 관리
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <DialogHeader>
                          <DialogTitle>카테고리 관리</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                          <div>
                            <Label htmlFor="categoryName">카테고리 이름</Label>
                            <Input
                              id="categoryName"
                              value={categoryForm.name}
                              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="categoryColor">색상</Label>
                            <Select
                              value={categoryForm.color}
                              onValueChange={(value) => setCategoryForm({ ...categoryForm, color: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bg-blue-100 text-blue-800">파란색</SelectItem>
                                <SelectItem value="bg-green-100 text-green-800">초록색</SelectItem>
                                <SelectItem value="bg-purple-100 text-purple-800">보라색</SelectItem>
                                <SelectItem value="bg-red-100 text-red-800">빨간색</SelectItem>
                                <SelectItem value="bg-yellow-100 text-yellow-800">노란색</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowCategoryModal(false)}>
                              취소
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                              <Plus className="h-4 w-4 mr-2" />
                              추가
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* Mobile admin menu */}
                {user.role === "admin" && (
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
                            onClick={() => setShowUploadModal(true)}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            문서 업로드
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start bg-transparent"
                            onClick={() => setShowCategoryModal(true)}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            카테고리 관리
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900">
                      {user.role === "admin" ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm hidden sm:block">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                      {user.role === "admin" ? "관리자" : "뷰어"}
                    </Badge>
                  </div>
                </div>

                <Button variant="outline" onClick={handleLogout} size="sm">
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">로그아웃</span>
                </Button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowLoginModal(true)} size="sm">
                  <LogIn className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">로그인</span>
                </Button>
                <Button onClick={() => setShowSignupModal(true)} className="bg-blue-600 hover:bg-blue-700" size="sm">
                  <span className="hidden sm:inline">회원가입</span>
                  <span className="sm:hidden">가입</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-73px)] p-6 transition-colors">
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="문서 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
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
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    selectedCategory === "all"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span>전체</span>
                  <Badge variant="secondary">{documents.length}</Badge>
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.name
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span>{category.name}</span>
                    <Badge variant="secondary">{category.count}</Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
          {!user ? (
            <div className="flex flex-col items-center justify-center h-96 text-center px-4">
              <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                문서 아카이브에 오신 것을 환영합니다
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
                문서를 보려면 로그인이 필요합니다.
              </p>
              <Button onClick={() => setShowLoginModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <LogIn className="h-4 w-4 mr-2" />
                로그인하기
              </Button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center px-4">
              <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                문서가 없습니다
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
                {searchTerm || selectedCategory !== "all"
                  ? "검색 조건에 맞는 문서가 없습니다."
                  : "아직 업로드된 문서가 없습니다."}
              </p>
              {user.role === "admin" && (
                <Button onClick={() => setShowUploadModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4 mr-2" />첫 문서 업로드하기
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {Object.entries(groupedDocuments).map(([categoryName, docs]) => (
                <div key={categoryName}>
                  <div className="flex items-center space-x-2 mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {categoryName}
                    </h2>
                    <Badge
                      className={
                        categories.find((cat) => cat.name === categoryName)?.color ||
                        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }
                    >
                      {docs.length}개
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {docs.map((doc) => (
                      <Card
                        key={doc.id}
                        className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base sm:text-lg line-clamp-2 text-gray-900 dark:text-gray-100 pr-2">
                              {doc.title}
                            </CardTitle>
                            {user.role === "admin" && (
                              <div className="flex space-x-1 ml-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditDocument(doc)}
                                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <Badge
                            className={
                              categories.find((cat) => cat.name === doc.category)?.color ||
                              "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }
                          >
                            {doc.category}
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">{doc.content}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{doc.author}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{doc.createdAt}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              보기
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
