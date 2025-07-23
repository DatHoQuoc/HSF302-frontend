"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react" // Import useRef
import { X, User, Mail, Calendar, Loader2, Save, Camera } from "lucide-react" // Import Camera icon
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { authenticationService } from "@/service/AuthenticationService"
import type { UserProfile, UserInfo } from "@/service/BookService"
import type { UpdateProfileRequest } from '@/service/AuthenticationService'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onProfileUpdate: (profile: UserProfile) => void
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, onProfileUpdate }) => {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    imageId: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null) // State để lưu trữ file được chọn
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref cho input type="file"

  // Load user profile when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUserProfile()
    }
  }, [isOpen])

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      const userProfile = await authenticationService.getProfile()
      setProfile(userProfile)
      setFormData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        dateOfBirth: userProfile.dateOfBirth || "",
        imageId: userProfile.imageUrl || "",
      })
      setSelectedFile(null); // Reset selected file on profile load
    } catch (error) {
      console.error("Error loading user profile:", error)
      // Try to get from localStorage as fallback
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          setProfile(user)
          setFormData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            dateOfBirth: user.dateOfBirth || "",
            imageId: user.imageUrl || "",

          })
        } catch (e) {
          console.error("Error parsing stored user:", e)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Họ là bắt buộc"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Tên là bắt buộc"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click(); // Kích hoạt input file ẩn khi click vào avatar
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)

      // Tạo request data
      const updateData: UpdateProfileRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth || undefined,
        file: selectedFile || undefined, // Thêm file đã chọn vào request nếu có
      }

      // Gọi API update profile thực tế
      const updatedProfile = await authenticationService.updateProfile(updateData)
      const latestUserProfile = await authenticationService.getProfile();
      // Callback để parent component cập nhật state
      onProfileUpdate(latestUserProfile)

      onClose()

      toast({
        title: "Cập nhật thành công",
        description: "Thông tin cá nhân đã được lưu",
      })
    } catch (error) { // Cần định nghĩa rõ ràng kiểu lỗi
      console.error("Error updating profile:", error)
      toast({
        title: "Lỗi cập nhật",
        description: error.message || "Không thể cập nhật thông tin",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getUserInitials = () => {
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
    }
    return "U"
  }

  const avatarSrc = selectedFile ? URL.createObjectURL(selectedFile) : formData.imageId || undefined;

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Hồ sơ cá nhân</CardTitle>
            <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {isLoading && !profile ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Đang tải thông tin...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative cursor-pointer" onClick={handleAvatarClick}>
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarSrc} alt="Avatar" />
                    <AvatarFallback className="text-lg bg-blue-100 text-blue-600">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 text-white border-2 border-white">
                    <Camera className="h-4 w-4" />
                  </div>
                </div>
                {/* Input file ẩn */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*" // Chỉ chấp nhận các loại file ảnh
                />
                <p className="text-sm text-gray-500 text-center">
                  Nhấp vào ảnh đại diện để thay đổi
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Họ *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={errors.firstName ? "border-red-500" : ""}
                    placeholder="Nhập họ của bạn"
                  />
                  {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Tên *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={errors.lastName ? "border-red-500" : ""}
                    placeholder="Nhập tên của bạn"
                  />
                  {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                  placeholder="Nhập email của bạn"
                  disabled // Email thường không được thay đổi qua form này
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ngày sinh
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  placeholder="Chọn ngày sinh"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}