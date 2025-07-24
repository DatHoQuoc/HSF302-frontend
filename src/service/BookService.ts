import api from "@/api"

export interface GetAllBooksRequest {
  page?: number
  size?: number
  id?: number
  searchText?: string
  archived?: boolean
  shareable?: boolean
  keyword?: string
  returnApproved?: boolean
  bookId?: number
}

export interface UserInfo {
  id: number
  firstName: string
  lastName: string
  email: string
  fullName?: string
}

export interface BookInfo {
  id: number
  title: string
  author: string
  isbn: string
  synopsis: string
  owner: string
  ownerInfo?: UserProfile
  cover: string
  rate: number
  archived: boolean
  shareable: boolean
  returnApproved?: boolean
  borrowerInfo?: UserProfile
   hasContent?: boolean
}

export interface GetAllBooksResponse {
  content: BookInfo[]
  number: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface CreateBookRequest {
  id: number
  title: string
  authorName: string
  isbn: string
  synopsis: string
  shareable: boolean
}

export interface FeedbackRequest {
  note: number
  comment: string
  bookId: number
}

export interface FeedbackInfo {
  id: number
  note: number
  comment: string
  ownFeedback: boolean
  createdDate: string
  bookId: number
  userInfo?: UserProfile
}

export interface GetFeedbacksResponse {
  content: FeedbackInfo[]
  number: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  imageId?: string
  fullName?: string
}

interface ValueObject {
  value: number;
}

export interface DashboardStats {
  totalBooks: ValueObject;
  borrowedBooks: ValueObject;
  sharedBooks: ValueObject;
  returnedBooks: ValueObject;
}

class BookService {
  // Existing methods...
  async getAllBooks(params?: GetAllBooksRequest): Promise<GetAllBooksResponse> {
    try {
      const response = await api.get<GetAllBooksResponse>("/books", { params })
      return response.data
    } catch (error) {
      console.error("Failed to fetch books:", error)
      const errorMessage = error.response?.data?.error || "Không thể lấy danh sách sách. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  async createBook(bookData: CreateBookRequest): Promise<number> {
    try {
      const response = await api.post<number>("/books", bookData)
      return response.data
    } catch (error) {
      console.error("Failed to create book:", error)
      const errorMessage = error.response?.data?.error || "Không thể tạo sách. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  async borrowBook(bookId: number): Promise<void> {
    try {
      await api.post<number>(`/books/borrow/${bookId}`)
      return
    } catch (error) {
      console.error(`Failed to borrow book with ID ${bookId}:`, error)
      const errorMessage = error.response?.data?.error || "Không thể mượn sách. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  async toggleShareableStatus(bookId: number): Promise<void> {
    try {
      await api.patch<void>(`/books/shareable/${bookId}`)
      return
    } catch (error) {
      console.error(`Failed to toggle shareable status for book with ID ${bookId}:`, error)
      const errorMessage =
        error.response?.data?.error || "Không thể cập nhật trạng thái chia sẻ sách. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  async returnBook(bookId: number): Promise<void> {
    try {
      await api.patch<void>(`/books/borrow/return/${bookId}`)
      return
    } catch (error) {
      console.error(`Failed to return book with ID ${bookId}:`, error)
      const errorMessage = error.response?.data?.error || "Không thể trả sách. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  async approveReturn(bookId: number): Promise<void> {
    try {
      await api.patch<void>(`/books/borrow/return/approve/${bookId}`)
      return
    } catch (error) {
      console.error(`Failed to approve return for book with ID ${bookId}:`, error)
      const errorMessage = error.response?.data?.error || "Không thể duyệt trả sách. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  async toggleArchivedStatus(bookId: number): Promise<void> {
    try {
      await api.patch<void>(`/books/archived/${bookId}`)
      return
    } catch (error) {
      console.error(`Failed to toggle archived status for book with ID ${bookId}:`, error)
      const errorMessage =
        error.response?.data?.error || "Không thể cập nhật trạng thái lưu trữ sách. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  async uploadBookCover(bookId: number, file: File): Promise<void> {
    try {
      const formData = new FormData()
      formData.append("file", file)

      await api.post<Record<string, never>>(`/books/cover/${bookId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return
    } catch (error) {
      console.error(`Failed to upload cover for book with ID ${bookId}:`, error)
      const errorMessage = error.response?.data?.error || "Không thể tải ảnh bìa sách lên. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  async getAllBooksByOwner(params?: GetAllBooksRequest): Promise<GetAllBooksResponse> {
    try {
      const response = await api.get<GetAllBooksResponse>("/books/owner", { params })
      return response.data
    } catch (error) {
      console.error("Failed to fetch owner books:", error)
      const errorMessage = error.response?.data?.error || "Không thể lấy danh sách sách của bạn. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  async getAllBooksReturned(params?: GetAllBooksRequest): Promise<GetAllBooksResponse> {
    try {
      const response = await api.get<GetAllBooksResponse>("/books/returned", { params })
      return response.data
    } catch (error) {
      console.error("Failed to fetch returned books:", error)
      const errorMessage = error.response?.data?.error || "Không thể lấy danh sách sách đã trả. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  async getAllBooksBorrowed(params?: GetAllBooksRequest): Promise<GetAllBooksResponse> {
    try {
      const response = await api.get<GetAllBooksResponse>("/books/borrowed", { params })
      return response.data
    } catch (error) {
      console.error("Failed to fetch borrowed books:", error)
      const errorMessage = error.response?.data?.error || "Không thể lấy danh sách sách đã mượn. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  // New methods based on API documentation
  async getBookById(bookId: number): Promise<BookInfo> {
    try {
      const response = await api.get<BookInfo>(`/books/${bookId}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch book with ID ${bookId}:`, error)
      const errorMessage = error.response?.data?.error || "Không thể lấy thông tin sách. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  async updateBook(bookId: number, bookData: Partial<CreateBookRequest>): Promise<void> {
    try {
      await api.put<void>(`/books/${bookId}`, bookData)
      return
    } catch (error) {
      console.error(`Failed to update book with ID ${bookId}:`, error)
      const errorMessage = error.response?.data?.error || "Không thể cập nhật sách. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  async deleteBook(bookId: number): Promise<void> {
    try {
      await api.delete<void>(`/books/${bookId}`)
      return
    } catch (error) {
      console.error(`Failed to delete book with ID ${bookId}:`, error)
      const errorMessage = error.response?.data?.error || "Không thể xóa sách. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  // Feedback methods
  async createFeedback(feedbackData: FeedbackRequest): Promise<void> {
    try {
      await api.post<void>("/feedbacks", feedbackData)
      return
    } catch (error) {
      console.error("Failed to create feedback:", error)
      const errorMessage = error.response?.data?.error || "Không thể gửi đánh giá. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  async getFeedbacksByBook(bookId: number, params?: GetAllBooksRequest): Promise<GetFeedbacksResponse> {
    try {
      const response = await api.get<GetFeedbacksResponse>(`/feedbacks/book/${bookId}`, { params })
      return response.data
    } catch (error) {
      console.error(`Failed to fetch feedbacks for book ${bookId}:`, error)
      const errorMessage = error.response?.data?.error || "Không thể lấy danh sách đánh giá. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  async updateFeedback(feedbackId: number, feedbackData: Partial<FeedbackRequest>): Promise<void> {
    try {
      await api.put<void>(`/feedbacks/${feedbackId}`, feedbackData)
      return
    } catch (error) {
      console.error(`Failed to update feedback with ID ${feedbackId}:`, error)
      const errorMessage = error.response?.data?.error || "Không thể cập nhật đánh giá. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  async deleteFeedback(feedbackId: number): Promise<void> {
    try {
      await api.delete<void>(`/feedbacks/${feedbackId}`)
      return
    } catch (error) {
      console.error(`Failed to delete feedback with ID ${feedbackId}:`, error)
      const errorMessage = error.response?.data?.error || "Không thể xóa đánh giá. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  // User profile methods
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await api.get<UserProfile>("/user/profile")
      return response.data
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      const errorMessage = error.response?.data?.error || "Không thể lấy thông tin người dùng. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get<DashboardStats>("/user/dashboard")
      return response.data
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
      const errorMessage = error.response?.data?.error || "Không thể lấy thống kê dashboard. Vui lòng thử lại."
      throw new Error(errorMessage)
    }
  }

  async uploadBookContent(bookId: number, file: File, uploadedBy: number): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', uploadedBy.toString()); 

    try {
      const response = await api.post(`/books/${bookId}/upload-content`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', 
        },
      });
      return response.data; 
    } catch (error) {
      console.error(`Failed to upload content for book ID ${bookId}:`, error);
      const errorMessage = error.response?.data?.error || "Không thể tải lên nội dung sách. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  }

  async getBookPdfUrl(bookId: number, userId: number, expiresInSeconds: number = 604800): Promise<string> {
    try {
      const response = await api.get<{ signedUrl: string }>(
        `/books/${bookId}/signed-url?userId=${userId}&expiresInSeconds=${expiresInSeconds}`
      );
      return response.data.signedUrl;
    } catch (error) {
      console.error(`Failed to get signed URL for book ID ${bookId}:`, error);
      const errorMessage = error.response?.data?.error || "Không thể tải nội dung sách. Vui lòng thử lại.";
      throw new Error(errorMessage);
    }
  }
  getDownloadContentUrl(bookId: number, userId: number): string {
    return `${api.defaults.baseURL || ''}/books/${bookId}/download-content?userId=${userId}`;
  }
  async checkDownloadPermission(bookId: number, userId: number): Promise<boolean> {
    try {
     
      const response = await api.get<{ canDownload: boolean }>(
        `/books/${bookId}/can-download?userId=${userId}`
      );
      return response.data.canDownload;
    } catch (error) {
      console.error(`Failed to check download permission for book ID ${bookId}:`, error);
   
      if (error.response && error.response.status === 403) {
        return false;
      }
      // Ném lỗi cho các loại lỗi khác nếu cần xử lý riêng
      const errorMessage = error.response?.data?.error || "Không thể kiểm tra quyền tải xuống.";
      throw new Error(errorMessage);
    }
  }
}

export const bookService = new BookService()
