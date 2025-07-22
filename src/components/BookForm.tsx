"use client"

import type React from "react"
import { useState } from "react"
import { X, Upload, BookOpen, User, FileText, Hash, Share2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { bookService } from "@/service/BookService"
import type { CreateBookRequest } from "@/service/BookService"
import { toast } from "@/hooks/use-toast"

interface BookFormProps {
  onClose: () => void
  onSuccess?: () => void
  book?: any 
  isEditing?: boolean
}

export const BookForm: React.FC<BookFormProps> = ({ onClose, onSuccess, book, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: book?.title || "",
    authorName: book?.author || "",
    isbn: book?.isbn || "",
    synopsis: book?.synopsis || "",
    shareable: book?.shareable ?? true,
  })

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>(book?.cover || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Vui lòng nhập tên sách")
      return false
    }
    if (!formData.authorName.trim()) {
      setError("Vui lòng nhập tên tác giả")
      return false
    }
    if (!formData.isbn.trim()) {
      setError("Vui lòng nhập mã ISBN")
      return false
    }
    if (!formData.synopsis.trim()) {
      setError("Vui lòng nhập mô tả sách")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const bookData: CreateBookRequest = {
        id: book?.id || 0, // For new books, this might be ignored by the API
        title: formData.title.trim(),
        authorName: formData.authorName.trim(),
        isbn: formData.isbn.trim(),
        synopsis: formData.synopsis.trim(),
        shareable: formData.shareable,
      }

      if (isEditing && book?.id) {
        // Update existing book
        await bookService.updateBook(book.id, bookData)
        toast({
          title: "Cập nhật sách thành công",
          description: `Đã cập nhật thông tin sách "${formData.title}"`,
        })
      } else {
        // Create new book
        await bookService.createBook(bookData)
        toast({
          title: "Thêm sách thành công",
          description: `Đã thêm sách "${formData.title}" vào thư viện`,
        })
      }

      // Upload cover if provided
      if (coverFile && book?.id) {
        try {
          await bookService.uploadBookCover(book.id, coverFile)
          toast({
            title: "Upload ảnh bìa thành công",
            description: "Ảnh bìa sách đã được cập nhật",
          })
        } catch (coverError) {
          console.error("Error uploading cover:", coverError)
          toast({
            title: "Lỗi upload ảnh bìa",
            description: "Sách đã được lưu nhưng không thể upload ảnh bìa",
            variant: "destructive",
          })
        }
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Error saving book:", error)
      setError(error.message || "Đã xảy ra lỗi khi lưu sách")
      toast({
        title: isEditing ? "Lỗi cập nhật sách" : "Lỗi thêm sách",
        description: error.message || "Vui lòng thử lại",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            {isEditing ? "Chỉnh sửa sách" : "Thêm sách mới"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Cover Upload */}
            <div className="space-y-2">
              <Label htmlFor="cover">Ảnh bìa sách</Label>
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <Input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">Chọn file ảnh (JPG, PNG, GIF). Tối đa 5MB.</p>
                </div>
                {coverPreview && (
                  <div className="w-20 h-28 border rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={coverPreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Tên sách *
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Nhập tên sách..."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="author" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Tác giả *
              </Label>
              <Input
                id="author"
                type="text"
                placeholder="Nhập tên tác giả..."
                value={formData.authorName}
                onChange={(e) => handleInputChange("authorName", e.target.value)}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            {/* ISBN */}
            <div className="space-y-2">
              <Label htmlFor="isbn" className="flex items-center">
                <Hash className="h-4 w-4 mr-2" />
                Mã ISBN *
              </Label>
              <Input
                id="isbn"
                type="text"
                placeholder="Nhập mã ISBN..."
                value={formData.isbn}
                onChange={(e) => handleInputChange("isbn", e.target.value)}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <Label htmlFor="synopsis" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Mô tả sách *
              </Label>
              <Textarea
                id="synopsis"
                placeholder="Nhập mô tả về nội dung sách..."
                value={formData.synopsis}
                onChange={(e) => handleInputChange("synopsis", e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className="w-full resize-none"
              />
            </div>

            {/* Shareable Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Share2 className="h-5 w-5 text-blue-600" />
                <div>
                  <Label htmlFor="shareable" className="text-sm font-medium">
                    Cho phép chia sẻ
                  </Label>
                  <p className="text-xs text-gray-500">Người khác có thể xem và mượn sách này</p>
                </div>
              </div>
              <Switch
                id="shareable"
                checked={formData.shareable}
                onCheckedChange={(checked) => handleInputChange("shareable", checked)}
                disabled={isSubmitting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? "Đang cập nhật..." : "Đang thêm..."}
                  </>
                ) : (
                  <>
                    {isEditing ? (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Cập nhật sách
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Thêm sách
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
