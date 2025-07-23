import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Share2, Archive, Upload, Star, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookForm } from '@/components/BookForm';
import { BookDetailsModal } from '@/components/BookDetailsModal';
import { useNavigate } from 'react-router-dom';
import { bookService, BookInfo, GetAllBooksRequest } from '@/service/BookService';
import { useToast } from '@/hooks/use-toast';
import { type UserProfile } from '@/service/BookService';
interface MyBooksProps {
  page?: number;
  size?: number;
}

const MyBooks: React.FC<MyBooksProps> = ({ page = 0, size = 5 }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookInfo | null>(null);
  const [showBookDetails, setShowBookDetails] = useState(false);
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  
  // --- Effect để tải dữ liệu sách ---
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        const params: GetAllBooksRequest = { page: currentPage, size: size };
        const response = await bookService.getAllBooksByOwner(params);

        setBooks(response.content);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error("Lỗi khi tải sách:", err);
        const errorMessage = err.message || "Không thể tải danh sách sách. Vui lòng thử lại.";
        toast({
          title: "Lỗi tải sách",
          description: errorMessage,
          variant: "destructive",
        });
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage, size, refreshTrigger, toast]);

  const activeBooks = books.filter(book => !book.archived);
  const archivedBooks = books.filter(book => book.archived);

  const filteredActiveBooks = activeBooks.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArchivedBooks = archivedBooks.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Callbacks xử lý các hành động trên sách ---

  const handleEditBook = useCallback((book: BookInfo) => {
    setSelectedBook(book);
    setShowAddForm(true);
  }, []);

  const handleViewBook = useCallback((book: BookInfo) => {
    setSelectedBook(book);
    setShowBookDetails(true);
  }, []);

  const handleDeleteBook = useCallback(async (bookId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa sách này? Hành động này không thể hoàn tác.')) {
      try {
        //await bookService.deleteBook(bookId);
        setRefreshTrigger(prev => prev + 1);
        toast({
          title: "Thành công!",
          description: "Sách đã được xóa thành công.",
        });
      } catch (err) {
        console.error("Lỗi khi xóa sách:", err);
        const errorMessage = err.message || "Không thể xóa sách. Vui lòng thử lại.";
        toast({
          title: "Lỗi xóa sách",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleToggleShareable = useCallback(async (bookId: number) => {
    try {
      await bookService.toggleShareableStatus(bookId);
      setRefreshTrigger(prev => prev + 1);
      toast({
        title: "Thành công!",
        description: "Trạng thái chia sẻ của sách đã được cập nhật.",
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái chia sẻ:", err);
      const errorMessage = err.message || "Không thể cập nhật trạng thái chia sẻ.";
      toast({
        title: "Lỗi cập nhật",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleToggleArchive = useCallback(async (bookId: number) => {
    try {
      await bookService.toggleArchivedStatus(bookId);
      setRefreshTrigger(prev => prev + 1);
      toast({
        title: "Thành công!",
        description: "Trạng thái lưu trữ của sách đã được cập nhật.",
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái lưu trữ:", err);
      const errorMessage = err.message || "Không thể cập nhật trạng thái lưu trữ.";
      toast({
        title: "Lỗi cập nhật",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleUploadCover = useCallback(async (bookId: number, file: File) => {
    if (!file) {
      toast({
        title: "Lỗi tải ảnh bìa",
        description: "Vui lòng chọn một tệp ảnh.",
        variant: "destructive",
      });
      return;
    }
    try {
      await bookService.uploadBookCover(bookId, file);
      setRefreshTrigger(prev => prev + 1);
      toast({
        title: "Thành công!",
        description: "Ảnh bìa đã được tải lên thành công.",
      });
    } catch (err) {
      console.error("Lỗi khi tải ảnh bìa:", err);
      const errorMessage = err.message || "Không thể tải lên ảnh bìa.";
      toast({
        title: "Lỗi tải ảnh bìa",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFormSuccess = useCallback(() => {
    setShowAddForm(false);
    setSelectedBook(null);
    setRefreshTrigger(prev => prev + 1);
    toast({
      title: "Thành công!",
      description: "Sách đã được lưu thành công.",
    }); // Thường thì toast này sẽ được gọi từ BookForm
  }, [toast]);

  const BookCard = ({ book, showArchiveActions = false }: { book: BookInfo; showArchiveActions?: boolean }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-blue-100">
      <div className="relative">
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Input
            id={`upload-cover-${book.id}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleUploadCover(book.id, e.target.files[0]);
              }
            }}
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => document.getElementById(`upload-cover-${book.id}`)?.click()}
            className="bg-white/90 hover:bg-white"
            title="Tải ảnh bìa"
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        {book.archived && (
          <Badge className="absolute top-2 left-2 bg-gray-500">
            <Archive className="h-3 w-3 mr-1" />
            Đã lưu trữ
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 text-gray-900">
              {book.title}
            </h3>
            <p className="text-sm text-gray-600">Tác giả: {book.author}</p>
            <p className="text-xs text-gray-500 mt-1">ISBN: {book.isbn}</p>
          </div>

          <p className="text-sm text-gray-700 line-clamp-2">
            {book.synopsis}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{book.rate}</span>
            </div>
            <Badge variant={book.shareable ? "default" : "secondary"}>
              {book.shareable ? "Có thể chia sẻ" : "Riêng tư"}
            </Badge>
          </div>

          <div className="text-xs text-gray-500">
            {/* <p>Đã mượn: {book.borrowCount || 0} lần</p>
            <p>Tạo ngày: {book.createdDate ? new Date(book.createdDate).toLocaleDateString('vi-VN') : 'N/A'}</p> */}
          </div>

          <div className="flex space-x-2 pt-2 border-t mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewBook(book)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              Xem
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditBook(book)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Sửa
            </Button>
            {!showArchiveActions ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleShareable(book.id)}
                  className={book.shareable ? "text-blue-600" : ""}
                  title={book.shareable ? "Chuyển thành Riêng tư" : "Chuyển thành Có thể chia sẻ"}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleArchive(book.id)}
                  title="Lưu trữ sách"
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggleArchive(book.id)}
                className="text-green-600"
                title="Khôi phục sách"
              >
                Khôi phục
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteBook(book.id)}
              className="text-red-600 hover:text-red-700"
              title="Xóa sách"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <p className="text-lg text-gray-700">Đang tải sách của bạn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Card className="p-8 text-center bg-red-50 border-red-200">
          <CardTitle className="text-red-700 mb-4">Lỗi khi tải sách</CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
          <Button onClick={() => setRefreshTrigger(prev => prev + 1)} className="mt-6">Thử lại</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <Button
          onClick={() => {
            navigate('/home');
          }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 mb-6"
        >
          <Home className="h-4 w-4 mr-2" />
          Trở về trang chủ
        </Button>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sách của tôi</h1>
            <p className="text-gray-600 mt-2">Quản lý bộ sưu tập sách cá nhân</p>
          </div>
          <Button
            onClick={() => {
              setSelectedBook(null);
              setShowAddForm(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm sách mới
          </Button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm sách theo tiêu đề, tác giả, ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Lọc
          </Button>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active">
              Đang hoạt động ({filteredActiveBooks.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Đã lưu trữ ({filteredArchivedBooks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {filteredActiveBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredActiveBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? "Không tìm thấy sách nào khớp với tìm kiếm của bạn trong mục đang hoạt động." : "Bạn chưa có sách nào đang hoạt động."}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => {
                        setSelectedBook(null);
                        setShowAddForm(true);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm sách đầu tiên
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-6">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  variant="outline"
                >
                  Trang trước
                </Button>
                <span> Trang {currentPage + 1} / {totalPages} </span>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                  variant="outline"
                >
                  Trang sau
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="space-y-6">
            {filteredArchivedBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredArchivedBooks.map((book) => (
                  <BookCard key={book.id} book={book} showArchiveActions={true} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-gray-500">
                    {searchQuery ? "Không tìm thấy sách đã lưu trữ nào khớp với tìm kiếm của bạn." : "Không có sách nào được lưu trữ."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {showAddForm && (
        <BookForm
          book={selectedBook}
          isEditing={!!selectedBook}
          onClose={() => {
            setShowAddForm(false);
            setSelectedBook(null);
          }}
         onSuccess={handleFormSuccess}
        />
      )}

      {showBookDetails && selectedBook && (
        <BookDetailsModal
          isOpen={showBookDetails}
          bookId={selectedBook.id}
          onClose={() => {
            setShowBookDetails(false);
            setSelectedBook(null);
          }}
          onBookUpdate={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}
    </div>
  );
};

export default MyBooks;
