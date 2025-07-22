"use client"

import { useState, useEffect } from "react"
import {
  Star,
  Send,
  MessageCircle,
  ThumbsUp,
  Flag,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { bookService, type FeedbackInfo, type FeedbackRequest } from "@/service/BookService"

interface FeedbackSectionProps {
  bookId: number
}

export const FeedbackSection = ({ bookId }: FeedbackSectionProps) => {
  const [newFeedback, setNewFeedback] = useState("")
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedbacks, setFeedbacks] = useState<FeedbackInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  // Load feedbacks when component mounts or page changes
  useEffect(() => {
    loadFeedbacks()
  }, [bookId, currentPage])

  const loadFeedbacks = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await bookService.getFeedbacksByBook(bookId, {
        page: currentPage,
        size: pageSize,
      })

      setFeedbacks(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải đánh giá")
      console.error("Error loading feedbacks:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!newFeedback.trim() || rating === 0) {
      setError("Vui lòng nhập đánh giá và chọn số sao!")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const feedbackData: FeedbackRequest = {
        note: rating,
        comment: newFeedback.trim(),
        bookId: bookId,
      }

      await bookService.createFeedback(feedbackData)

      // Reset form
      setNewFeedback("")
      setRating(0)

      // Reload feedbacks to show the new one
      setCurrentPage(0) // Go back to first page to see new feedback
      await loadFeedbacks()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi gửi đánh giá")
      console.error("Error submitting feedback:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLikeFeedback = (feedbackId: number) => {
    // TODO: Implement like feedback API when available
    console.log("Like feedback:", feedbackId)
  }

  const handleReportFeedback = (feedbackId: number) => {
    // TODO: Implement report feedback API when available
    console.log("Report feedback:", feedbackId)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  // Calculate average rating
  const averageRating =
    feedbacks.length > 0 ? feedbacks.reduce((sum, feedback) => sum + feedback.note, 0) / feedbacks.length : 0

  // Helper function to get user display name
  const getUserDisplayName = (feedback: FeedbackInfo) => {
    if (feedback.userInfo) {
      return `${feedback.userInfo.firstName} ${feedback.userInfo.lastName}`
    }
    return `Người dùng #${feedback.id || "Unknown"}`
  }

  // Helper function to get user initials
  const getUserInitials = (feedback: FeedbackInfo) => {
    if (feedback.userInfo?.firstName && feedback.userInfo?.lastName) {
      return `${feedback.userInfo.firstName[0]}${feedback.userInfo.lastName[0]}`.toUpperCase()
    }
    if (feedback.id) {
      return feedback.id.toString().slice(-2)
    }
    return "ND"
  }

  return (
    <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <div className="space-y-6 p-1">
        <div className="flex items-center justify-between sticky top-0 bg-white z-10 pb-2 border-b">
          <h3 className="text-lg font-semibold flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Đánh giá & Phản hồi ({totalElements})
          </h3>
          {totalElements > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{averageRating.toFixed(1)} / 5</span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Add new feedback - Sticky form */}
        <Card className="border-blue-200 sticky top-16 bg-white z-10 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Viết đánh giá của bạn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Rating stars */}
            <div>
              <p className="text-sm font-medium mb-2">Đánh giá sao:</p>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-colors"
                    disabled={submitting}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment textarea */}
            <div>
              <Textarea
                placeholder="Chia sẻ suy nghĩ của bạn về cuốn sách này..."
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                rows={3}
                className="resize-none"
                disabled={submitting}
              />
            </div>

            <Button
              onClick={handleSubmitFeedback}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={!newFeedback.trim() || rating === 0 || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Gửi đánh giá
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Đang tải đánh giá...</span>
          </div>
        )}

        {/* Scrollable Feedback list */}
        {!loading && (
          <div className="space-y-4 pb-4">
            {feedbacks.length === 0 ? (
              <Card className="border-gray-200">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có đánh giá nào cho cuốn sách này.</p>
                  <p className="text-sm text-gray-400 mt-1">Hãy là người đầu tiên đánh giá!</p>
                </CardContent>
              </Card>
            ) : (
              feedbacks.map((feedback, index) => (
                <Card
                  key={feedback.id || `feedback-${index}`}
                  className="border-gray-200 hover:shadow-sm transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage
                          src={feedback.userInfo?.imageId ? `/api/images/${feedback.userInfo.imageId}` : undefined}
                          alt={getUserDisplayName(feedback)}
                        />
                        <AvatarFallback>{getUserInitials(feedback)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="font-medium text-sm truncate">{getUserDisplayName(feedback)}</span>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < feedback.note ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            {feedback.ownFeedback && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                Của bạn
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {new Date(feedback.createdDate).toLocaleDateString("vi-VN")}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 leading-relaxed break-words">{feedback.comment}</p>

                        <div className="flex items-center space-x-4 pt-2">
                          <button
                            onClick={() => handleLikeFeedback(feedback.id || index)}
                            className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>Thích</span>
                          </button>
                          <button
                            onClick={() => handleReportFeedback(feedback.id || index)}
                            className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <Flag className="h-3 w-3" />
                            <span>Báo cáo</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Sticky Pagination at bottom */}
        {!loading && totalPages > 1 && (
          <div className="sticky bottom-0 bg-white border-t pt-4 mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} trong
                tổng số {totalElements} đánh giá
              </p>

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
          </div>
        )}
      </div>
    </div>
  )
}
