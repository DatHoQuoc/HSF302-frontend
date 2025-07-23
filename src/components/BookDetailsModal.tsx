"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Star, BookOpen, Share2, Archive, Edit, Trash2, Download, Eye, Loader2 } from "lucide-react" // Thêm Download, Eye, Loader2 icons
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area" // Không còn cần thiết nếu sử dụng max-h và overflow-y-auto
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FeedbackSection } from "./FeedbackSection"
import { BookForm } from "./BookForm"
import { bookService } from "@/service/BookService"
import type { BookInfo, UserProfile } from "@/service/BookService"
import { useToast } from "@/hooks/use-toast"
import { PdfReaderModal } from "@/components/PDFReader" 

interface BookDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  bookId: number
  onBookUpdate?: () => void
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  isOpen,
  onClose,
  bookId,
  onBookUpdate,
}) => {
  const { toast } = useToast()
  const [book, setBook] = useState<BookInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false) // For borrow/return/archive actions
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
    const [isUserLoading, setIsUserLoading] = useState(true); // Trạng thái tải user

  // States cho tính năng đọc/tải xuống
  const [showPdfReader, setShowPdfReader] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoadingPdf, setIsLoadingPdf] = useState(false) // For PDF loading specifically

   useEffect(() => {
    // console.log("Fetching user from localStorage...");
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const parsedUser: UserProfile = JSON.parse(userString);
        setCurrentUser(parsedUser);
      } else {
        setCurrentUser(null); // Không tìm thấy user trong localStorage
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      setCurrentUser(null);
    } finally {
        setIsUserLoading(false); // Đánh dấu đã xong việc tải user
    }
  }, []); // Chạy một lần khi component mount

  // Load book details when modal opens
  useEffect(() => {
    if (isOpen && bookId) {
      loadBookDetails()
    }
  }, [isOpen, bookId, isUserLoading])

  const loadBookDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const bookData = await bookService.getBookById(bookId)
      setBook(bookData)
    } catch (error) { // Cần định nghĩa type cho error
      console.error("Error loading book details:", error)
      setError(error.message || "Không thể tải thông tin sách")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBorrowBook = async () => {
    if (!book) return

    try {
      setIsActionLoading(true)
      await bookService.borrowBook(book.id)

      toast({
        title: "Mượn sách thành công",
        description: `Bạn đã mượn sách "${book.title}"`,
      })

      await loadBookDetails()
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

  const handleReturnBook = async () => {
    if (!book) return

    try {
      setIsActionLoading(true)
      await bookService.returnBook(book.id)

      toast({
        title: "Trả sách thành công",
        description: `Bạn đã trả sách "${book.title}"`,
      })

      await loadBookDetails()
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

  const handleApproveReturn = async () => {
    if (!book) return

    try {
      setIsActionLoading(true)
      await bookService.approveReturn(book.id)

      toast({
        title: "Duyệt trả sách thành công",
        description: `Đã duyệt trả sách "${book.title}"`,
      })

      await loadBookDetails()
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

  const handleToggleShareable = async () => {
    if (!book) return

    try {
      setIsActionLoading(true)
      await bookService.toggleShareableStatus(book.id)

      toast({
        title: "Cập nhật thành công",
        description: `Đã ${book.shareable ? "tắt" : "bật"} chia sẻ sách`,
      })

      await loadBookDetails()
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

  const handleToggleArchived = async () => {
    if (!book) return

    try {
      setIsActionLoading(true)
      await bookService.toggleArchivedStatus(book.id)

      toast({
        title: "Cập nhật thành công",
        description: `Đã ${book.archived ? "bỏ lưu trữ" : "lưu trữ"} sách`,
      })

      await loadBookDetails()
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

  const handleDeleteBook = async () => {
    if (!book) return

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
      onClose()
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

  // --- Hàm xử lý Đọc sách (xem PDF) ---
  const handleReadBook = async () => {
    console.log(book.id, currentUser.id);
    if (!book?.id || !currentUser?.id) {
      toast({
        title: "Không thể đọc sách",
        description: "Không có đủ thông tin sách hoặc người dùng để đọc.",
        variant: "destructive",
      });
      return;
    }

    if (book.hasContent) {
        toast({
            title: "Không có nội dung sách",
            description: "Cuốn sách này chưa có nội dung để đọc.",
            variant: "default",
        });
        return;
    }

    try {
      setIsLoadingPdf(true);
      const signedUrl = await bookService.getBookPdfUrl(book.id, parseInt(currentUser.id));
      if (signedUrl) {
          setPdfUrl(signedUrl);
          setShowPdfReader(true);
      } else {
          toast({
              title: "Lỗi",
              description: "Không thể nhận URL đọc sách. Vui lòng thử lại.",
              variant: "destructive",
          });
      }
    } catch (error) {
      console.error("Error getting PDF URL:", error);
      toast({
        title: "Lỗi tải sách",
        description: error.message || "Không thể tải file PDF để đọc.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // --- Hàm xử lý Tải xuống sách ---
  const handleDownloadBook = async () => {
    if (!book?.id || !currentUser?.id) {
      toast({
        title: "Không thể tải xuống",
        description: "Không có đủ thông tin sách hoặc người dùng để tải xuống.",
        variant: "destructive",
      });
      return;
    }
     // Check if the book actually has content
     if (book.hasContent) { // Giả định BookInfo có thuộc tính `hasContent`
        toast({
            title: "Không có nội dung sách",
            description: "Cuốn sách này chưa có nội dung để tải xuống.",
            variant: "default",
        });
        return;
    }

    try {
      

      const downloadUrl = await  bookService.getBookPdfUrl(book.id, parseInt(currentUser.id));
      // Tạo một thẻ <a> ẩn và click để kích hoạt tải xuống
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${book.title || 'book'}.pdf`; // Gợi ý tên file khi tải xuống
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Đang tải xuống",
        description: `Đang tải xuống sách "${book.title}"...`,
      });
    } catch (error) {
      console.error("Error downloading book:", error);
      toast({
        title: "Lỗi tải xuống",
        description: error.message || "Không thể tải xuống sách.",
        variant: "destructive",
      });
    }
  };


  const isOwner = currentUser && book && book.ownerInfo?.id === currentUser.id
  const isBorrower = currentUser && book && book.borrowerInfo?.id === currentUser.id
  const canBorrow = book && book.shareable && !book.archived && !book.borrowerInfo && !isOwner
  // Sách có nội dung (PDF) để đọc/tải xuống
  const hasContentToAccess = book?.hasContent || true;


  const getUserInitials = (user: UserProfile | undefined) => {
    if (!user) return "U"
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Chi tiết sách</CardTitle>
              <CardDescription>Thông tin đầy đủ về cuốn sách</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <div className="max-h-[calc(90vh-120px)] overflow-y-auto"> {/* Sử dụng div thay ScrollArea */}
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Đang tải thông tin sách...</span>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : book ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Book Cover and Basic Info */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={book.cover || "/placeholder.svg?height=400&width=300&text=No+Cover"}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={book.shareable ? "default" : "secondary"}>
                      {book.shareable ? "Có thể chia sẻ" : "Riêng tư"}
                    </Badge>
                    <Badge variant={book.archived ? "destructive" : "outline"}>
                      {book.archived ? "Đã lưu trữ" : "Đang hoạt động"}
                    </Badge>
                    {book.borrowerInfo && <Badge variant="secondary">Đang được mượn</Badge>}
                  </div>

                  {/* Rating */}
                  {book.rate && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= book.rate! ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({book.rate}/5)</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {/* Read & Download Buttons (Chỉ hiển thị khi có nội dung sách) */}
                    {hasContentToAccess && (
                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={handleReadBook}
                                disabled={isLoadingPdf || isActionLoading}
                                className="flex-1 min-w-[120px]"
                            >
                                {isLoadingPdf ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Eye className="h-4 w-4 mr-2" />
                                )}
                                Đọc sách
                            </Button>
                            <Button
                                onClick={handleDownloadBook}
                                disabled={isActionLoading}
                                variant="outline"
                                className="flex-1 min-w-[120px]"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Tải xuống
                            </Button>
                        </div>
                    )}

                    {canBorrow && (
                      <Button
                        onClick={handleBorrowBook}
                        disabled={isActionLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Mượn sách
                      </Button>
                    )}

                    {isBorrower && (
                      <Button
                        onClick={handleReturnBook}
                        disabled={isActionLoading}
                        variant="outline"
                        className="w-full bg-transparent"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Trả sách
                      </Button>
                    )}

                    {isOwner && book.borrowerInfo && (
                      <Button
                        onClick={handleApproveReturn}
                        disabled={isActionLoading}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Duyệt trả sách
                      </Button>
                    )}

                    {isOwner && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => setShowEditForm(true)}
                          disabled={isActionLoading}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          onClick={handleDeleteBook}
                          disabled={isActionLoading}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    )}

                    {isOwner && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={handleToggleShareable} disabled={isActionLoading} variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          {book.shareable ? "Tắt chia sẻ" : "Bật chia sẻ"}
                        </Button>
                        <Button onClick={handleToggleArchived} disabled={isActionLoading} variant="outline" size="sm">
                          <Archive className="h-4 w-4 mr-1" />
                          {book.archived ? "Bỏ lưu trữ" : "Lưu trữ"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Book Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Title and Author */}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{book.title}</h1>
                    <p className="text-lg text-gray-600 mb-4">Tác giả: {book.author}</p>
                    {book.isbn && <p className="text-sm text-gray-500">ISBN: {book.isbn}</p>}
                  </div>

                  <Separator />

                  {/* Synopsis */}
                  {book.synopsis && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tóm tắt</h3>
                      <p className="text-gray-700 leading-relaxed">{book.synopsis}</p>
                    </div>
                  )}

                  <Separator />

                  {/* Owner and Borrower Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Owner Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Chủ sách</h3>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={book.ownerInfo?.imageId ? `/api/images/${book.ownerInfo.imageId}` : undefined}
                            alt={book.ownerInfo?.fullName}
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getUserInitials(book.ownerInfo)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {book.ownerInfo?.fullName || `${book.ownerInfo?.firstName} ${book.ownerInfo?.lastName}`}
                          </p>
                          <p className="text-sm text-gray-500">{book.ownerInfo?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Borrower Info */}
                    {book.borrowerInfo && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Người mượn</h3>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={book.borrowerInfo?.imageId ? `/api/images/${book.borrowerInfo.imageId}` : undefined}
                              alt={book.borrowerInfo?.fullName}
                            />
                            <AvatarFallback className="bg-green-100 text-green-600">
                              {getUserInitials(book.borrowerInfo)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {book.borrowerInfo?.fullName ||
                                `${book.borrowerInfo?.firstName} ${book.borrowerInfo?.lastName}`}
                            </p>
                            <p className="text-sm text-gray-500">{book.borrowerInfo?.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      {/* Bỏ comment nếu muốn hiển thị */}
                      {/* <p>
                        <strong>Ngày tạo:</strong> {formatDate(book.createdDate)}
                      </p>
                      {book.borrowCount && (
                        <p>
                          <strong>Số lần mượn:</strong> {book.borrowCount}
                        </p>
                      )} */}
                    </div>
                  </div>

                  <Separator />

                  {/* Feedback Section */}
                  <div className="min-h-0">
                    <FeedbackSection bookId={book.id} currentUser={currentUser} />
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </div>
      </Card>

      {/* Edit Form Modal */}
      {showEditForm && book && (
        <BookForm
          book={book}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false)
            loadBookDetails() 
            onBookUpdate?.() 
          }}
          isEditing={true} // Luôn là chỉnh sửa khi mở từ BookDetailsModal
        />
      )}

      {/* PdfReaderModal */}
      {showPdfReader && pdfUrl && (
        <PdfReaderModal
          isOpen={showPdfReader}
          onClose={() => {
            setShowPdfReader(false)
            setPdfUrl(null)
          }}
          pdfUrl={pdfUrl}
          bookTitle={book?.title || "Sách"}
        />
      )}
    </div>
  )
}