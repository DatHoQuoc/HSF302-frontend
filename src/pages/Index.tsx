"use client"

import { useState, useEffect, useCallback } from "react"
import {
  BookOpen,
  Users,
  Heart,
  ArrowRight,
  Plus,
  Search,
  Grid,
  List,
  User,
  LogOut,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookCard } from "@/components/BookCard"
import { BookForm } from "@/components/BookForm"
import { StatsCard } from "@/components/StatsCard"
import { UserProfileModal } from "@/components/UserProfileModal"
import { Link } from "react-router-dom"
import { bookService } from "@/service/BookService"
import type { GetAllBooksRequest, BookInfo, UserProfile } from "@/service/BookService"
import NotificationBell from "../components/NotificationBell"
import { useNotifications } from "../NotificationContext"
import { useToast } from "@/hooks/use-toast"

const Index = () => {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("all-books")
  const { notifications, unreadCount, isConnected } = useNotifications()

  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(12)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Filter states
  const [filters, setFilters] = useState({
    shareable: undefined as boolean | undefined,
    archived: undefined as boolean | undefined,
    sortBy: "title" as string,
    sortDirection: "asc" as "asc" | "desc",
  })

  // State for fetched books
  const [allBooks, setAllBooks] = useState<BookInfo[]>([])
  const [borrowedBooks, setBorrowedBooks] = useState<BookInfo[]>([])
  const [returnedBooks, setReturnedBooks] = useState<BookInfo[]>([])
  const [myBooks, setMyBooks] = useState<BookInfo[]>([])

  // Loading states
  const [isLoadingAllBooks, setIsLoadingAllBooks] = useState(true)
  const [isLoadingBorrowedBooks, setIsLoadingBorrowedBooks] = useState(false)
  const [isLoadingReturnedBooks, setIsLoadingReturnedBooks] = useState(false)
  const [isLoadingMyBooks, setIsLoadingMyBooks] = useState(false)

  // Error states
  const [errorAllBooks, setErrorAllBooks] = useState<string | null>(null)
  const [errorBorrowedBooks, setErrorBorrowedBooks] = useState<string | null>(null)
  const [errorReturnedBooks, setErrorReturnedBooks] = useState<string | null>(null)
  const [errorMyBooks, setErrorMyBooks] = useState<string | null>(null)

  // Stats state
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalBorrowed: 0,
    totalShared: 0,
    totalReturned: 0,
  })

  // Debounced search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(0)
  }, [debouncedSearchQuery, filters, activeTab])

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true)
        const profile = await bookService.getUserProfile()
        profile.fullName = `${profile.firstName} ${profile.lastName}`
        setUserProfile(profile)
      } catch (error) {
        console.error("Error fetching user profile:", error)
        // Try to get from localStorage as fallback
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser)
            setUserProfile({
              ...user,
              fullName: `${user.firstName} ${user.lastName}`,
            })
          } catch (e) {
            console.error("Error parsing stored user:", e)
          }
        }
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchUserProfile()
  }, [])

  // --- Data Fetching Functions ---
  const fetchAllBooks = useCallback(
    async (params?: GetAllBooksRequest) => {
      setIsLoadingAllBooks(true)
      setErrorAllBooks(null)
      try {
        const requestParams: GetAllBooksRequest = {
          page: currentPage,
          size: pageSize,
          searchText: debouncedSearchQuery || undefined,
          shareable: filters.shareable,
          archived: filters.archived,
          ...params,
        }

        const response = await bookService.getAllBooks(requestParams)
        setAllBooks(response.content)
        setTotalPages(response.totalPages)
        setTotalElements(response.totalElements)
      } catch (error) {
        setErrorAllBooks(error.message)
        toast({
          title: "Lỗi tải sách",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoadingAllBooks(false)
      }
    },
    [currentPage, pageSize, debouncedSearchQuery, filters, toast],
  )

  const fetchBorrowedBooks = useCallback(
    async (params?: GetAllBooksRequest) => {
      setIsLoadingBorrowedBooks(true)
      setErrorBorrowedBooks(null)
      try {
        const requestParams: GetAllBooksRequest = {
          page: currentPage,
          size: pageSize,
          searchText: debouncedSearchQuery || undefined,
          ...params,
        }

        const response = await bookService.getAllBooksBorrowed(requestParams)
        setBorrowedBooks(response.content)
        setTotalPages(response.totalPages)
        setTotalElements(response.totalElements)
      } catch (error) {
        setErrorBorrowedBooks(error.message)
        toast({
          title: "Lỗi tải sách đã mượn",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoadingBorrowedBooks(false)
      }
    },
    [currentPage, pageSize, debouncedSearchQuery, toast],
  )

  const fetchReturnedBooks = useCallback(
    async (params?: GetAllBooksRequest) => {
      setIsLoadingReturnedBooks(true)
      setErrorReturnedBooks(null)
      try {
        const requestParams: GetAllBooksRequest = {
          page: currentPage,
          size: pageSize,
          searchText: debouncedSearchQuery || undefined,
          returnApproved: true,
          ...params,
        }

        const response = await bookService.getAllBooksReturned(requestParams)
        setReturnedBooks(response.content)
        setTotalPages(response.totalPages)
        setTotalElements(response.totalElements)
      } catch (error) {
        setErrorReturnedBooks(error.message)
        toast({
          title: "Lỗi tải sách đã trả",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoadingReturnedBooks(false)
      }
    },
    [currentPage, pageSize, debouncedSearchQuery, toast],
  )

  const fetchMyBooks = useCallback(
    async (params?: GetAllBooksRequest) => {
      setIsLoadingMyBooks(true)
      setErrorMyBooks(null)
      try {
        const requestParams: GetAllBooksRequest = {
          page: currentPage,
          size: pageSize,
          searchText: debouncedSearchQuery || undefined,
          shareable: filters.shareable,
          archived: filters.archived,
          ...params,
        }

        const response = await bookService.getAllBooksByOwner(requestParams)
        setMyBooks(response.content)
        setTotalPages(response.totalPages)
        setTotalElements(response.totalElements)
      } catch (error) {
        setErrorMyBooks(error.message)
        toast({
          title: "Lỗi tải sách của tôi",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoadingMyBooks(false)
      }
    },
    [currentPage, pageSize, debouncedSearchQuery, filters, toast],
  )

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await bookService.getDashboardStats();
            const transformedStats = {
                totalBooks: statsData.totalBooks?.value || 0, // Use optional chaining and default to 0
                totalBorrowed: statsData.borrowedBooks?.value || 0,
                totalShared: statsData.sharedBooks?.value || 0,
                totalReturned: statsData.returnedBooks?.value || 0,
            };
            setStats(transformedStats);
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }, [])

  // --- useEffect for fetching data based on activeTab ---
  useEffect(() => {
    if (activeTab === "all-books") {
      fetchAllBooks()
    } else if (activeTab === "borrowed") {
      fetchBorrowedBooks()
    } else if (activeTab === "returned") {
      fetchReturnedBooks()
    } else if (activeTab === "my-books") {
      fetchMyBooks()
    }
  }, [activeTab, fetchAllBooks, fetchBorrowedBooks, fetchReturnedBooks, fetchMyBooks])

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // --- Handle Search Functionality ---
  const handleSearch = () => {
    setCurrentPage(0)
    if (activeTab === "all-books") {
      fetchAllBooks()
    } else if (activeTab === "borrowed") {
      fetchBorrowedBooks()
    } else if (activeTab === "returned") {
      fetchReturnedBooks()
    } else if (activeTab === "my-books") {
      fetchMyBooks()
    }
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }))
  }

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  // Handle page size change
  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number.parseInt(newSize))
    setCurrentPage(0)
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    localStorage.removeItem("role")
    window.location.href = "/login"
  }

  // Handle profile update
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile)
    toast({
      title: "Profile đã được cập nhật",
      description: "Thông tin cá nhân đã được lưu thành công",
    })
  }

  // Determine which book list and loading/error state to display based on the active tab
  const getBooksToDisplay = () => {
    switch (activeTab) {
      case "all-books":
        return { books: allBooks, isLoading: isLoadingAllBooks, error: errorAllBooks }
      case "borrowed":
        return { books: borrowedBooks, isLoading: isLoadingBorrowedBooks, error: errorBorrowedBooks }
      case "returned":
        return { books: returnedBooks, isLoading: isLoadingReturnedBooks, error: errorReturnedBooks }
      case "my-books":
        return { books: myBooks, isLoading: isLoadingMyBooks, error: errorMyBooks }
      case "favorites":
        return { books: [], isLoading: false, error: null }
      default:
        return { books: [], isLoading: false, error: null }
    }
  }

  const { books, isLoading, error } = getBooksToDisplay()

  const refreshCurrentTab = () => {
    if (activeTab === "all-books") {
      fetchAllBooks()
    } else if (activeTab === "borrowed") {
      fetchBorrowedBooks()
    } else if (activeTab === "returned") {
      fetchReturnedBooks()
    } else if (activeTab === "my-books") {
      fetchMyBooks()
    }
    fetchStats() // Also refresh stats
  }

  // Get user initials for avatar
  const getUserInitials = (user: UserProfile | null) => {
    if (!user) return "U"
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  BookConnect
                </h1>
                <p className="text-sm text-gray-600">Share • Connect • Learn</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm sách..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                  className="pl-10 w-64 border-blue-200 focus:border-blue-400"
                />
              </div>

              {/* Navigation Menu */}
              <div className="flex items-center space-x-2">
                <Link to="/my-books">
                  <Button variant="outline" className="border-blue-200 hover:bg-blue-50 bg-transparent">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Sách của tôi
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm sách
                </Button>

                {/* Connection status and notifications */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="text-sm text-gray-500">{isConnected ? "Online" : "Offline"}</span>
                  </div>
                  <NotificationBell />
                </div>

                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  {!isLoadingProfile && userProfile && (
                    <div className="text-sm text-gray-600 mr-2">
                      Xin chào, <span className="font-medium text-blue-600">{userProfile.fullName}</span>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={userProfile?.imageId ? `/api/images/${userProfile.imageId}` : undefined}
                            alt={userProfile?.fullName}
                          />
                          <AvatarFallback>{getUserInitials(userProfile)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{userProfile?.fullName}</p>
                          <p className="text-xs leading-none text-muted-foreground">{userProfile?.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Hồ sơ cá nhân</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Cài đặt</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BookOpen className="mr-2 h-4 w-4" />
                        <Link to="/my-books">Sách của tôi</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Đăng xuất</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Tổng số sách" value={stats.totalBooks} icon={BookOpen} color="blue" trend="+12%" />
          <StatsCard title="Sách đã mượn" value={stats.totalBorrowed} icon={Users} color="green" trend="+5%" />
          <StatsCard title="Sách chia sẻ" value={stats.totalShared} icon={Heart} color="purple" trend="+8%" />
          <StatsCard title="Sách đã trả" value={stats.totalReturned} icon={ArrowRight} color="orange" trend="+15%" />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all-books" className="space-y-6" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-2xl grid-cols-5 bg-white border border-blue-200">
              <TabsTrigger value="all-books" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Tất cả sách
              </TabsTrigger>
              <TabsTrigger value="my-books" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Sách của tôi
              </TabsTrigger>
              <TabsTrigger value="borrowed" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Đã mượn
              </TabsTrigger>
              <TabsTrigger value="returned" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Đã trả
              </TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Yêu thích
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <List className="h-4 w-4" />
              </Button>

              {/* Filters */}
              <Select
                onValueChange={(value) =>
                  handleFilterChange("shareable", value === "true" ? true : value === "false" ? false : undefined)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trạng thái chia sẻ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="true">Có thể chia sẻ</SelectItem>
                  <SelectItem value="false">Riêng tư</SelectItem>
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) =>
                  handleFilterChange("archived", value === "true" ? true : value === "false" ? false : undefined)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trạng thái lưu trữ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="false">Đang hoạt động</SelectItem>
                  <SelectItem value="true">Đã lưu trữ</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={handlePageSizeChange} defaultValue={pageSize.toString()}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tab Contents */}
          <TabsContent value="all-books" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Đang tải sách...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => fetchAllBooks()} variant="outline">
                  Thử lại
                </Button>
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p>Không tìm thấy sách nào.</p>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
                >
                  {books.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      viewMode={viewMode}
                      showActions={true}
                      onBookUpdate={refreshCurrentTab}
                      currentUser={userProfile}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8">
                    <div className="text-sm text-gray-700">
                      Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)}{" "}
                      trong tổng số {totalElements} sách
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </Button>

                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i
                          } else if (currentPage < 3) {
                            pageNum = i
                          } else if (currentPage > totalPages - 4) {
                            pageNum = totalPages - 5 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum + 1}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                      >
                        Sau
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Similar structure for other tabs */}
          <TabsContent value="my-books" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Đang tải sách của bạn...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => fetchMyBooks()} variant="outline">
                  Thử lại
                </Button>
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p>Bạn chưa thêm sách nào.</p>
                <Button
                  className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm sách đầu tiên
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
                >
                  {books.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      viewMode={viewMode}
                      showOwnerActions={true}
                      onBookUpdate={refreshCurrentTab}
                      currentUser={userProfile}
                    />
                  ))}
                </div>

                {/* Pagination for My Books */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8">
                    <div className="text-sm text-gray-700">
                      Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)}{" "}
                      trong tổng số {totalElements} sách
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </Button>

                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i
                          } else if (currentPage < 3) {
                            pageNum = i
                          } else if (currentPage > totalPages - 4) {
                            pageNum = totalPages - 5 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum + 1}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                      >
                        Sau
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="borrowed" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Đang tải sách đã mượn...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => fetchBorrowedBooks()} variant="outline">
                  Thử lại
                </Button>
              </div>
            ) : books.length === 0 ? (
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="text-orange-800">Sách đang mượn</CardTitle>
                  <CardDescription>Danh sách các sách bạn đang mượn</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-600">Bạn chưa mượn sách nào.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
                >
                  {books.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      viewMode={viewMode}
                      showReturnActions={true}
                      onBookUpdate={refreshCurrentTab}
                      currentUser={userProfile}
                    />
                  ))}
                </div>

                {/* Pagination for Borrowed Books */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8">
                    <div className="text-sm text-gray-700">
                      Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)}{" "}
                      trong tổng số {totalElements} sách
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </Button>

                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i
                          } else if (currentPage < 3) {
                            pageNum = i
                          } else if (currentPage > totalPages - 4) {
                            pageNum = totalPages - 5 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum + 1}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                      >
                        Sau
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="returned" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Đang tải sách đã trả...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => fetchReturnedBooks()} variant="outline">
                  Thử lại
                </Button>
              </div>
            ) : books.length === 0 ? (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="text-green-800">Sách đã trả</CardTitle>
                  <CardDescription>Lịch sử các sách bạn đã mượn và trả</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-green-600">Chưa có lịch sử mượn trả sách.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
                >
                  {books.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      viewMode={viewMode}
                      showApprovalActions={true}
                      onBookUpdate={refreshCurrentTab}
                      currentUser={userProfile}
                    />
                  ))}
                </div>

                {/* Pagination for Returned Books */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8">
                    <div className="text-sm text-gray-700">
                      Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)}{" "}
                      trong tổng số {totalElements} sách
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </Button>

                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i
                          } else if (currentPage < 3) {
                            pageNum = i
                          } else if (currentPage > totalPages - 4) {
                            pageNum = totalPages - 5 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum + 1}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                      >
                        Sau
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Favorites Tab Content - Still mock for now */}
          <TabsContent value="favorites" className="space-y-6">
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="text-purple-800">Sách yêu thích</CardTitle>
                <CardDescription>Danh sách các sách bạn đã đánh dấu yêu thích</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-purple-600">Chưa có sách yêu thích nào.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Book Form Modal */}
      {showAddForm && <BookForm onClose={() => setShowAddForm(false)} onSuccess={refreshCurrentTab} />}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  )
}

export default Index
