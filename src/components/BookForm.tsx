"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Upload, Book } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { bookService, type CreateBookRequest } from "@/service/BookService"
import type { BookInfo } from "@/service/BookService"
interface BookFormProps {
  onClose: () => void
  book?: BookInfo
}

export const BookForm: React.FC<BookFormProps> = ({ onClose, book }) => {
  const [formData, setFormData] = useState<CreateBookRequest>({
    id: book?.id || 0,
    title: book?.title || "",
    authorName: book?.author || "",
    isbn: book?.isbn || "",
    synopsis: book?.synopsis || "",
    shareable: book?.shareable || false,
  })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>(book?.cover || "")
  const [loading, setLoading] = useState<boolean>(false) // State for loading indicator

  useEffect(() => {
    if (book) {
      setFormData({
        id: book?.id || 0,
        title: book.title || "",
        authorName: book.author || "",
        isbn: book.isbn || "",
        synopsis: book.synopsis || "",
        shareable: book.shareable || false,
      })
      setCoverPreview(book.cover || "")
      setCoverFile(null)
    } else {
      setFormData({
        id: 0,
        title: "",
        authorName: "",
        isbn: "",
        synopsis: "",
        shareable: false,
      })
      setCoverFile(null)
      setCoverPreview("")
    }
  }, [book])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name === "author" ? "authorName" : name]: value, // Map 'author' from form to 'authorName' for API
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      shareable: checked,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setCoverFile(null)
      setCoverPreview("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title || !formData.authorName || !formData.isbn) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc (Tiêu đề, Tác giả, ISBN)",
        variant: "destructive",
      })
      return
    }

    setLoading(true) // Start loading

    try {
      if (book && book.id) {
        await bookService.createBook(formData);
        if (coverFile) {
          await bookService.uploadBookCover(book.id, coverFile)
          toast({
            title: "Cập nhật ảnh bìa thành công",
            description: `Ảnh bìa của "${formData.title}" đã được cập nhật.`,
          })
        }
        toast({
          title: "Cập nhật thành công",
          description: `"${formData.title}" đã được cập nhật.`,
        })
      } else {
        const createBookData: CreateBookRequest = {
          id: 0, 
          title: formData.title,
          authorName: formData.authorName,
          isbn: formData.isbn,
          synopsis: formData.synopsis,
          shareable: formData.shareable,
        }

        await bookService.createBook(createBookData)

        toast({
          title: "Thêm sách thành công",
          description: `"${formData.title}" đã được thêm vào thư viện`,
        })
      }
      onClose()
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi trong quá trình xử lý.",
        variant: "destructive",
      })
    } finally {
      setLoading(false) // End loading
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl min-h-[90vh] flex items-center justify-center py-8">
        <Card className="w-full max-h-[90vh] overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-blue-600" />
              {book ? "Cập nhật sách" : "Thêm sách mới"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="overflow-y-auto flex-1 min-h-0">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Cover Upload */}
            <div className="space-y-2">
              <Label>Ảnh bìa sách</Label>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {coverPreview ? (
                    <img
                      src={coverPreview || "/placeholder.svg"}
                      alt="Cover preview"
                      className="w-32 h-44 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-32 h-44 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="mb-2" />
                  <p className="text-sm text-gray-500">Chọn ảnh bìa cho sách (JPG, PNG, tối đa 5MB)</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tên sách *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nhập tên sách"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Tác giả *</Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.authorName}
                  onChange={handleInputChange}
                  placeholder="Nhập tên tác giả"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN *</Label>
              <Input
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleInputChange}
                placeholder="Nhập mã ISBN"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="synopsis">Tóm tắt nội dung</Label>
              <Textarea
                id="synopsis"
                name="synopsis"
                value={formData.synopsis}
                onChange={handleInputChange}
                placeholder="Nhập tóm tắt nội dung sách"
                rows={4}
              />
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cho phép chia sẻ</Label>
                  <p className="text-sm text-gray-500">Người khác có thể mượn sách này không?</p>
                </div>
                <Switch checked={formData.shareable} onCheckedChange={handleSwitchChange} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {book ? "Cập nhật" : "Thêm sách"}
              </Button>
            </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
