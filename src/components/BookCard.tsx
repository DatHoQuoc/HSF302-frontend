"use client"

import type React from "react"
import { useState } from "react"
import { Star, Share2, Archive, Edit, Trash2, BookOpen, Eye, Info, MoreVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookDetailsModal } from "./BookDetailsModal"
import { BookForm } from "./BookForm"
import { bookService } from "@/service/BookService"
import type { BookInfo, UserProfile } from "@/service/BookService"
import { useToast } from "@/hooks/use-toast"

interface BookCardProps {
  book: BookInfo
  viewMode?: "grid" | "list"
  showActions?: boolean
  showOwnerActions?: boolean
  showReturnActions?: boolean
  showApprovalActions?: boolean
  onBookUpdate?: () => void
  currentUser?: UserProfile | null
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  viewMode = "grid",
  // The following props will effectively be ignored for action button visibility
  // showActions = false,
  // showOwnerActions = false,
  // showReturnActions = false,
  // showApprovalActions = false,
  onBookUpdate,
  currentUser,
}) => {
  const { toast } = useToast()
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const isOwner = currentUser && book.ownerInfo?.id === currentUser.id
  const isBorrower = currentUser && book.borrowerInfo?.id === currentUser.id
  // canBorrow is still relevant for the 'Mượn' button's disabled state or visual cue,
  // but it won't hide the button entirely based on the request.
  const canBorrow = book.shareable && !book.archived && !book.borrowerInfo && !isOwner

  const handleBorrowBook = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      setIsActionLoading(true)
      await bookService.borrowBook(book.id)
      toast({
        title: "Mượn sách thành công",
        description: `Bạn đã mượn sách "${book.title}"`,
      })
      onBookUpdate?.()
    } catch (error) {
      console.error("Error borrowing book:", error)
      toast({
        title: "Lỗi mượn sách",
        description: error.message || "Không thể mượn sách",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleReturnBook = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      setIsActionLoading(true)
      await bookService.returnBook(book.id)
      toast({
        title: "Trả sách thành công",
        description: `Bạn đã trả sách "${book.title}"`,
      })
      onBookUpdate?.()
    } catch (error) {
      console.error("Error returning book:", error)
      toast({
        title: "Lỗi trả sách",
        description: error.message || "Không thể trả sách",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleApproveReturn = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      setIsActionLoading(true)
      await bookService.approveReturn(book.id)
      toast({
        title: "Duyệt trả sách thành công",
        description: `Đã duyệt trả sách "${book.title}"`,
      })
      onBookUpdate?.()
    } catch (error) {
      console.error("Error approving return:", error)
      toast({
        title: "Lỗi duyệt trả sách",
        description: error.message || "Không thể duyệt trả sách",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleToggleShareable = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      setIsActionLoading(true)
      await bookService.toggleShareableStatus(book.id)
      toast({
        title: "Cập nhật thành công",
        description: `Đã ${book.shareable ? "tắt" : "bật"} chia sẻ sách`,
      })
      onBookUpdate?.()
    } catch (error) {
      console.error("Error toggling shareable:", error)
      toast({
        title: "Lỗi cập nhật",
        description: error.message || "Không thể cập nhật trạng thái chia sẻ",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleToggleArchived = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      setIsActionLoading(true)
      await bookService.toggleArchivedStatus(book.id)
      toast({
        title: "Cập nhật thành công",
        description: `Đã ${book.archived ? "bỏ lưu trữ" : "lưu trữ"} sách`,
      })
      onBookUpdate?.()
    } catch (error) {
      console.error("Error toggling archived:", error)
      toast({
        title: "Lỗi cập nhật",
        description: error.message || "Không thể cập nhật trạng thái lưu trữ",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteBook = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Bạn có chắc chắn muốn xóa sách "${book.title}"?`)) {
      return
    }

    try {
      setIsActionLoading(true)
      await bookService.deleteBook(book.id)
      toast({
        title: "Xóa sách thành công",
        description: `Đã xóa sách "${book.title}"`,
      })
      onBookUpdate?.()
    } catch (error) {
      console.error("Error deleting book:", error)
      toast({
        title: "Lỗi xóa sách",
        description: error.message || "Không thể xóa sách",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const getUserInitials = (user: UserProfile | undefined) => {
    if (!user) return "U"
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  if (viewMode === "list") {
    return (
      <>
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <div className="flex p-4 space-x-4">
            {/* Book Cover */}
            <div className="flex-shrink-0">
              <div className="w-20 h-28 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={book.cover || "/placeholder.svg?height=112&width=80&text=No+Cover"}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Book Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">Tác giả: {book.author}</p>

                  {book.synopsis && <p className="text-sm text-gray-700 line-clamp-2 mb-2">{book.synopsis}</p>}

                  {/* Owner Info */}
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={book.ownerInfo?.imageId ? `/api/images/${book.ownerInfo.imageId}` : undefined}
                        alt={book.ownerInfo?.fullName}
                      />
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                        {getUserInitials(book.ownerInfo)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">
                      {book.ownerInfo?.fullName || `${book.ownerInfo?.firstName} ${book.ownerInfo?.lastName}`}
                    </span>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant={book.shareable ? "default" : "secondary"} className="text-xs">
                      {book.shareable ? "Có thể chia sẻ" : "Riêng tư"}
                    </Badge>
                    {book.archived && (
                      <Badge variant="destructive" className="text-xs">
                        Đã lưu trữ
                      </Badge>
                    )}
                    {book.borrowerInfo && (
                      <Badge variant="secondary" className="text-xs">
                        Đang được mượn
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  {book.rate && (
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= book.rate! ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">({book.rate}/5)</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDetailsModal(true)
                    }}
                  >
                    <Info className="h-4 w-4 mr-1" />
                    Chi tiết
                  </Button>

                  {/* Action Buttons - Always visible */}
                  <Button
                    onClick={handleBorrowBook}
                    disabled={isActionLoading}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    Mượn
                  </Button>

                  <Button onClick={handleReturnBook} disabled={isActionLoading} variant="outline" size="sm">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Trả sách
                  </Button>

                  <Button
                    onClick={handleApproveReturn}
                    disabled={isActionLoading}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    Duyệt
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowEditForm(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleToggleShareable}>
                        <Share2 className="h-4 w-4 mr-2" />
                        {book.shareable ? "Tắt chia sẻ" : "Bật chia sẻ"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleToggleArchived}>
                        <Archive className="h-4 w-4 mr-2" />
                        {book.archived ? "Bỏ lưu trữ" : "Lưu trữ"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDeleteBook} className="text-red-600 focus:text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa sách
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Modals */}
        <BookDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          bookId={book.id}
          onBookUpdate={onBookUpdate}
          //currentUser={currentUser}
        />

        {showEditForm && (
          <BookForm
            book={book}
            onClose={() => setShowEditForm(false)}
            onSuccess={() => {
              setShowEditForm(false)
              onBookUpdate?.()
            }}
          />
        )}
      </>
    )
  }

  // Grid view
  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden">
        <div className="relative">
          {/* Book Cover */}
          <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
            <img
              src={book.cover || "/placeholder.svg?height=400&width=300&text=No+Cover"}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDetailsModal(true)
                }}
                className="bg-white hover:bg-gray-100"
              >
                <Eye className="h-4 w-4 mr-1" />
                Chi tiết
              </Button>

              {/* Action Buttons - Always visible */}
              <Button
                onClick={handleBorrowBook}
                disabled={isActionLoading}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Mượn
              </Button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {!book.shareable && (
              <Badge variant="secondary" className="text-xs">
                Riêng tư
              </Badge>
            )}
            {book.archived && (
              <Badge variant="destructive" className="text-xs">
                Lưu trữ
              </Badge>
            )}
            {book.borrowerInfo && (
              <Badge variant="secondary" className="text-xs">
                Đã mượn
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">{book.title}</h3>
            <p className="text-sm text-gray-600">Tác giả: {book.author}</p>

            {/* Owner Info */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={book.ownerInfo?.imageId ? `/api/images/${book.ownerInfo.imageId}` : undefined}
                  alt={book.ownerInfo?.fullName}
                />
                <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                  {getUserInitials(book.ownerInfo)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600 truncate">
                {book.ownerInfo?.fullName || `${book.ownerInfo?.firstName} ${book.ownerInfo?.lastName}`}
              </span>
            </div>

            {/* Rating */}
            {book.rate && (
              <div className="flex items-center space-x-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${star <= book.rate! ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600">({book.rate}/5)</span>
              </div>
            )}

            {/* Synopsis */}
            {book.synopsis && <p className="text-sm text-gray-700 line-clamp-2">{book.synopsis}</p>}

            {/* Action Buttons - Always visible */}
            <div className="pt-2 space-y-2">
              <Button
                onClick={handleReturnBook}
                disabled={isActionLoading}
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Trả sách
              </Button>

              <Button
                onClick={handleApproveReturn}
                disabled={isActionLoading}
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Duyệt trả sách
              </Button>

              <div className="flex space-x-1">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowEditForm(true)
                  }}
                  disabled={isActionLoading}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Sửa
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleToggleShareable}>
                      <Share2 className="h-4 w-4 mr-2" />
                      {book.shareable ? "Tắt chia sẻ" : "Bật chia sẻ"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleArchived}>
                      <Archive className="h-4 w-4 mr-2" />
                      {book.archived ? "Bỏ lưu trữ" : "Lưu trữ"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                   
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <BookDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        bookId={book.id}
        onBookUpdate={onBookUpdate}
        //currentUser={currentUser}
      />

      {showEditForm && (
        <BookForm
          book={book}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false)
            onBookUpdate?.()
          }}
        />
      )}
    </>
  )
}