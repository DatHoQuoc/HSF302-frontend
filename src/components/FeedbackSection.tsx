"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Star, MessageCircle, Edit, Trash2, Plus, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { bookService } from "@/service/BookService"
import type { FeedbackInfo, UserProfile } from "@/service/BookService"
import { useToast } from "@/hooks/use-toast"

interface FeedbackSectionProps {
  bookId: number
  currentUser?: UserProfile | null
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({ bookId, currentUser }) => {
  const { toast } = useToast()
  const [feedbacks, setFeedbacks] = useState<FeedbackInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingFeedback, setEditingFeedback] = useState<FeedbackInfo | null>(null)
  const [newFeedback, setNewFeedback] = useState({ note: "", rating: 5 })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load feedbacks
  useEffect(() => {
    loadFeedbacks()
  }, [bookId])

  const loadFeedbacks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const feedbackData = await bookService.getFeedbacksByBook(bookId)
      setFeedbacks(feedbackData.content)
    } catch (error) {
      console.error("Error loading feedbacks:", error)
      setError(error.message || "Unable to load feedbacks")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!newFeedback.note.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a feedback note",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      if (editingFeedback) {
        await bookService.updateFeedback(editingFeedback.id, {
          comment: newFeedback.note,
          note: newFeedback.rating,
        })
        toast({
          title: "Feedback Updated",
          description: "Your feedback has been updated successfully",
        })
      } else {
        await bookService.createFeedback({
          bookId: bookId,
          note: newFeedback.rating,        // rating should go to note (number)
          comment: newFeedback.note.trim() // comment text should go to comment (string)
        })
        toast({
          title: "Feedback Added",
          description: "Your feedback has been added successfully",
        })
      }

      // Reset form and reload feedbacks
      setNewFeedback({ note: "", rating: 5 })
      setShowModal(false)
      setEditingFeedback(null)
      await loadFeedbacks()
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error",
        description: error.message || "Unable to submit feedback",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditFeedback = (feedback: FeedbackInfo) => {
    setEditingFeedback(feedback)
    setNewFeedback({
      note: feedback.comment,
      rating: feedback.note,
    })
    setShowModal(true)
  }

  const handleDeleteFeedback = async (feedbackId: number) => {
    if (!confirm("Are you sure you want to delete this feedback?")) {
      return
    }

    try {
      await bookService.deleteFeedback(feedbackId)
      toast({
        title: "Feedback Deleted",
        description: "Feedback has been deleted successfully",
      })
      await loadFeedbacks()
    } catch (error) {
      console.error("Error deleting feedback:", error)
      toast({
        title: "Error",
        description: error.message || "Unable to delete feedback",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setShowModal(false)
    setEditingFeedback(null)
    setNewFeedback({ note: "", rating: 5 })
  }

  const getUserInitials = (user: UserProfile | undefined) => {
    if (!user) return "U"
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
  }

  const getUserDisplayName = (user: UserProfile | undefined) => {
    if (!user) return "Anonymous User"
    return user.fullName || `${user.firstName} ${user.lastName}` || user.email || "User"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
              } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">({rating}/5)</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading feedbacks...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Reviews & Feedback ({feedbacks.length})</h3>
        </div>

        {currentUser && (
          <Button
            onClick={() => setShowModal(true)}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        )}
      </div>

      {/* Modal for Add/Edit Feedback */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg max-h-[50vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingFeedback ? "Edit Your Review" : "Write a Review"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Rating</label>
              {renderStars(newFeedback.rating, true, (rating) => setNewFeedback((prev) => ({ ...prev, rating })))}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Your Review</label>
              <Textarea
                value={newFeedback.note}
                onChange={(e) => setNewFeedback((prev) => ({ ...prev, note: e.target.value }))}
                placeholder="Share your thoughts about this book..."
                rows={4}
                className="resize-none min-h-[100px]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button 
                onClick={handleCancelEdit} 
                variant="outline" 
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting || !newFeedback.note.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Submitting..." : editingFeedback ? "Update Review" : "Submit Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedbacks List */}
      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 border rounded-lg bg-gray-50/50">
        {feedbacks.length > 0 ? (
          <>
            {feedbacks.map((feedback, index) => {
              const isOwnFeedback = currentUser && feedback.userInfo?.id === currentUser.id

              return (
                <div key={feedback.id}>
                  <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Author Avatar */}
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage
                              src={
                                feedback.userInfo?.imageId ? `/api/images/${feedback.userInfo.imageId}` : undefined
                              }
                              alt={getUserDisplayName(feedback.userInfo)}
                            />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getUserInitials(feedback.userInfo)}
                            </AvatarFallback>
                          </Avatar>

                          {/* Feedback Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900">{getUserDisplayName(feedback.userInfo)}</h4>
                                <p className="text-sm text-gray-500">{formatDate(feedback.createdDate)}</p>
                              </div>
                              {renderStars(feedback.note)}
                            </div>

                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{feedback.comment}</p>
                          </div>
                        </div>

                        {/* Actions for own feedback */}
                        {isOwnFeedback && (
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              onClick={() => handleEditFeedback(feedback)}
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteFeedback(feedback.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {index < feedbacks.length - 1 && <Separator className="my-4" />}
                </div>
              )
            })}
          </>
        ) : (
          <Card className="text-center py-12 bg-gray-50">
            <CardContent>
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-500 mb-6">Be the first to share your thoughts about this book!</p>
                {currentUser && (
                  <Button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Write First Review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}