
import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Share2, Archive, Upload, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookForm } from '@/components/BookForm';
import { BookDetailsModal } from '@/components/BookDetailsModal';
import { FeedbackSection } from '@/components/FeedbackSection';

const MyBooks = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [showBookDetails, setShowBookDetails] = useState(false);

  // Mock data - in real app this would come from API
  const mockMyBooks = [
    {
      id: 1,
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      author: "Robert C. Martin",
      synopsis: "A comprehensive guide to writing maintainable and efficient code that every developer should read.",
      isbn: "978-0132350884",
      rating: 4.5,
      cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
      shareable: true,
      archived: false,
      owner: "current_user",
      createdDate: "2024-01-15",
      borrowCount: 5
    },
    {
      id: 2,
      title: "JavaScript: The Definitive Guide",
      author: "David Flanagan",
      synopsis: "The comprehensive reference and guide to JavaScript programming language.",
      isbn: "978-1491952023",
      rating: 4.3,
      cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
      shareable: false,
      archived: false,
      owner: "current_user",
      createdDate: "2024-02-10",
      borrowCount: 2
    },
    {
      id: 3,
      title: "Design Patterns",
      author: "Gang of Four",
      synopsis: "Elements of reusable object-oriented software design patterns.",
      isbn: "978-0201633612",
      rating: 4.7,
      cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
      shareable: true,
      archived: true,
      owner: "current_user",
      createdDate: "2023-12-05",
      borrowCount: 8
    }
  ];

  const activeBooks = mockMyBooks.filter(book => !book.archived);
  const archivedBooks = mockMyBooks.filter(book => book.archived);

  const handleEditBook = (book: any) => {
    setSelectedBook(book);
    setShowAddForm(true);
  };

  const handleViewBook = (book: any) => {
    setSelectedBook(book);
    setShowBookDetails(true);
  };

  const handleDeleteBook = (bookId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa sách này?')) {
      // TODO: Implement delete logic
      console.log('Delete book:', bookId);
    }
  };

  const handleToggleShareable = (bookId: number) => {
    // TODO: Implement toggle shareable logic
    console.log('Toggle shareable:', bookId);
  };

  const handleToggleArchive = (bookId: number) => {
    // TODO: Implement toggle archive logic
    console.log('Toggle archive:', bookId);
  };

  const handleUploadCover = (bookId: number) => {
    // TODO: Implement upload cover logic
    console.log('Upload cover for book:', bookId);
  };

  const BookCard = ({ book, showArchiveActions = false }: { book: any; showArchiveActions?: boolean }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-blue-100">
      <div className="relative">
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleUploadCover(book.id)}
            className="bg-white/90 hover:bg-white"
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
              <span className="text-sm font-medium">{book.rating}</span>
            </div>
            <Badge variant={book.shareable ? "default" : "secondary"}>
              {book.shareable ? "Có thể chia sẻ" : "Riêng tư"}
            </Badge>
          </div>

          <div className="text-xs text-gray-500">
            <p>Đã mượn: {book.borrowCount} lần</p>
            <p>Tạo ngày: {new Date(book.createdDate).toLocaleDateString('vi-VN')}</p>
          </div>

          <div className="flex space-x-2 pt-2 border-t">
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
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleArchive(book.id)}
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
              >
                Khôi phục
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteBook(book.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
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

        {/* Search and Filter */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm sách..."
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

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active">
              Đang hoạt động ({activeBooks.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Đã lưu trữ ({archivedBooks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-gray-500 mb-4">Bạn chưa có sách nào</p>
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
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="archived" className="space-y-6">
            {archivedBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {archivedBooks.map((book) => (
                  <BookCard key={book.id} book={book} showArchiveActions={true} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-gray-500">Không có sách nào được lưu trữ</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Book Form Modal */}
      {showAddForm && (
        <BookForm
          book={selectedBook}
          onClose={() => {
            setShowAddForm(false);
            setSelectedBook(null);
          }}
        />
      )}

      {/* Book Details Modal */}
      {showBookDetails && selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={() => {
            setShowBookDetails(false);
            setSelectedBook(null);
          }}
        />
      )}
    </div>
  );
};

export default MyBooks;
