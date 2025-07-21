import api from '@/api'

export interface GetAllBooksRequest {
    page?: number;
    size?: number;
    //search?: string;
}

export interface BookInfo {
    id: number;
    title: string;
    author: string;
    isbn: string;
    synopsis: string;
    owner: string;
    cover: string;
    rate: number;
    archived: boolean;
    shareable: boolean;
}

export interface GetAllBooksResponse {
    content: BookInfo[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export interface CreateBookRequest {
    id: number;
    title: string;
    authorName: string;
    isbn: string;
    synopsis: string;
    shareable: boolean;
}

export interface FeedbackRequest {
    note: number;
    comment: string;
    bookId: number;
}

export interface FeedbackInfo {
    id: number;
    note: number;
    comment: string;
    ownFeedback: boolean;
    createdDate: string;
    bookId: number;
}

export interface GetFeedbacksResponse {
    content: FeedbackInfo[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

class BookService {
    async getAllBooks(params?: GetAllBooksRequest): Promise<GetAllBooksResponse> {
        try {
            const response = await api.get<GetAllBooksResponse>('/books', { params });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch books:", error);
            const errorMessage = error.response?.data?.message || "Không thể lấy danh sách sách. Vui lòng thử lại.";
            throw new Error(errorMessage);
        }
    }

    async createBook(bookData: CreateBookRequest): Promise<void> {
        try {
            const response = await api.post<number>('/books', bookData);
            return;
        } catch (error) {
            console.error("Failed to create book:", error);
            const errorMessage = error.response?.data?.message || "Không thể tạo sách. Vui lòng thử lại.";
            throw new Error(errorMessage);
        }
    }
    async borrowBook(bookId: number): Promise<void> {
        try {
            await api.post<number>(`/books/borrow/${bookId}`);
            return;
        } catch (error) {
            console.error(`Failed to borrow book with ID ${bookId}:`, error);
            const errorMessage = error.response?.data?.message || "Không thể mượn sách. Vui lòng thử lại.";
            throw new Error(errorMessage);
        }
    }
    async toggleShareableStatus(bookId: number): Promise<void> {
        try {
            await api.patch<void>(`/books/shareable/${bookId}`);
            return;
        } catch (error) {
            console.error(`Failed to toggle shareable status for book with ID ${bookId}:`, error);
            const errorMessage = error.response?.data?.message || "Không thể cập nhật trạng thái chia sẻ sách. Vui lòng thử lại.";
            throw new Error(errorMessage);
        }
    }

    async returnBook(bookId: number): Promise<void> {
        try {
            await api.patch<void>(`/books/borrow/return/${bookId}`);
            return;
        } catch (error) {
            console.error(`Failed to return book with ID ${bookId}:`, error);
            const errorMessage = error.response?.data?.message || "Không thể trả sách. Vui lòng thử lại.";
            throw new Error(errorMessage);
        }
    }

    async approveReturn(bookId: number): Promise<void> {
        try {
            await api.patch<void>(`/books/borrow/return/approve/${bookId}`);
            return;
        } catch (error) {
            console.error(`Failed to approve return for book with ID ${bookId}:`, error);
            const errorMessage = error.response?.data?.message || "Không thể duyệt trả sách. Vui lòng thử lại.";
            throw new Error(errorMessage);
        }
    }

    async toggleArchivedStatus(bookId: number): Promise<void> {
        try {
            await api.patch<void>(`/books/archived/${bookId}`);
            return;
        } catch (error) {
            console.error(`Failed to toggle archived status for book with ID ${bookId}:`, error);
            const errorMessage = error.response?.data?.message || "Không thể cập nhật trạng thái lưu trữ sách. Vui lòng thử lại.";
            throw new Error(errorMessage);
        }
    }
    async uploadBookCover(bookId: number, file: File): Promise<void> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            await api.post<Record<string, never>>(`/books/cover/${bookId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return;
        } catch (error) {
            console.error(`Failed to upload cover for book with ID ${bookId}:`, error);
            const errorMessage = error.response?.data?.message || "Không thể tải ảnh bìa sách lên. Vui lòng thử lại.";
            throw new Error(errorMessage);
        }
    }
     async getAllBooksByOwner(params?: GetAllBooksRequest): Promise<GetAllBooksResponse> {
        try {
            const response = await api.get<GetAllBooksResponse>('/books/owner', { params });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch books:", error);
            const errorMessage = error.response?.data?.message || "Không thể lấy danh sách sách. Vui lòng thử lại.";
            throw new Error(errorMessage);
        }
    }

     async getAllBooksReturned(params?: GetAllBooksRequest): Promise<GetAllBooksResponse> {
        try {
            const response = await api.get<GetAllBooksResponse>('/books/returned', { params });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch books:", error);
            const errorMessage = error.response?.data?.message || "Không thể lấy danh sách sách. Vui lòng thử lại.";
            throw new Error(errorMessage);
        }
    }
      async getAllBooksBorrowed(params?: GetAllBooksRequest): Promise<GetAllBooksResponse> {
        try {
            const response = await api.get<GetAllBooksResponse>('/books/borrowed', { params });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch books:", error);
            const errorMessage = error.response?.data?.message || "Không thể lấy danh sách sách. Vui lòng thử lại.";
            throw new Error(errorMessage);
        }
    }
    async createFeedback(feedbackData: FeedbackRequest): Promise<void> {
        try {
            await api.post<void>('/feedbacks', feedbackData);
            return;
        } catch (error) {
            console.error("Failed to create feedback:", error);
            const errorMessage = error.response?.data?.message || "Không thể gửi đánh giá. Vui lòng thử lại.";
            throw new Error(errorMessage);
        }
    }

    async getFeedbacksByBook(bookId: number, params?: GetAllBooksRequest): Promise<GetFeedbacksResponse> {
        try {
            const response = await api.get<GetFeedbacksResponse>(`/feedbacks/book/${bookId}`, { params });
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch feedbacks for book ${bookId}:`, error);
            const errorMessage = error.response?.data?.message || "Không thể lấy danh sách đánh giá. Vui lòng thử lại.";
            throw new Error(errorMessage);
        }
    }

}

export const bookService = new BookService();