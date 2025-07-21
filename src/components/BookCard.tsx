  
  import React, { useState } from 'react';
  import { Star, Heart, Share2, Archive, Edit, Upload, Eye, Download, MessageCircle, RotateCcw, CheckCircle } from 'lucide-react';
  import { Card, CardContent } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import { Badge } from '@/components/ui/badge';
  import { Avatar, AvatarFallback } from '@/components/ui/avatar';
  import { toast } from '@/hooks/use-toast';
  import { bookService } from '@/service/BookService';
  import { FeedbackModal } from '@/components/FeedBackModal';
  interface Book {
    id: number;
    title: string;
    author: string;
    synopsis: string;
    isbn: string;
    rate: number;
    cover: string;
    shareable: boolean;
    archived: boolean;
    owner: string;
  }
  
  interface BookCardProps {
    book: Book;
    viewMode: 'grid' | 'list';
    showActions?: boolean;
    showOwnerActions?: boolean;
    showReturnActions?: boolean;
    showApprovalActions?: boolean;
    onBookUpdate?: () => void;
  }
  
  export const BookCard: React.FC<BookCardProps> = ({
    book,
    viewMode,
    showActions = false,
    showOwnerActions = false,
    showReturnActions = false,
    showApprovalActions = false,
    onBookUpdate
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
  
    const handleBorrow = async () => {
      setIsLoading(true);
      try {
        await bookService.borrowBook(book.id);
        toast({
          title: "Yêu cầu mượn sách",
          description: `Đã gửi yêu cầu mượn "${book.title}"`,
        });
        onBookUpdate?.();
      } catch (error) {
        toast({
          title: "Yêu cầu mượn sách thất bại",
          description: error.message || `Chưa gửi yêu cầu mượn "${book.title}"`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleToggleShareable = async () => {
      setIsLoading(true);
      try {
        await bookService.toggleShareableStatus(book.id);
        toast({
          title: book.shareable ? "Đã ẩn sách" : "Đã chia sẻ sách",
          description: `"${book.title}" ${book.shareable ? 'không còn' : 'đã được'} chia sẻ công khai`,
        });
        onBookUpdate?.();
      } catch (error) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể cập nhật trạng thái chia sẻ",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleToggleArchived = async () => {
      setIsLoading(true);
      try {
        await bookService.toggleArchivedStatus(book.id);
        toast({
          title: book.archived ? "Đã khôi phục sách" : "Đã lưu trữ sách",
          description: `"${book.title}" ${book.archived ? 'đã được khôi phục' : 'đã được lưu trữ'}`,
        });
        onBookUpdate?.();
      } catch (error) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể cập nhật trạng thái lưu trữ",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleUploadCover = () => {
      toast({
        title: "Upload ảnh bìa",
        description: "Tính năng upload ảnh bìa sẽ được triển khai",
      });
    };
  
    const handleReturnBook = async () => {
      setIsLoading(true);
      try {
        await bookService.returnBook(book.id);
        toast({
          title: "Trả sách thành công",
          description: `Đã gửi yêu cầu trả "${book.title}". Chờ chủ sách xác nhận.`,
        });
        onBookUpdate?.();
      } catch (error) {
        toast({
          title: "Trả sách thất bại",
          description: error.message || `Không thể trả sách "${book.title}"`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleApproveReturn = async () => {
      setIsLoading(true);
      try {
        await bookService.approveReturn(book.id);
        toast({
          title: "Duyệt trả sách thành công",
          description: `Đã duyệt trả sách "${book.title}"`,
        });
        onBookUpdate?.();
      } catch (error) {
        toast({
          title: "Duyệt trả sách thất bại",
          description: error.message || `Không thể duyệt trả sách "${book.title}"`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleViewFeedback = () => {
      setShowFeedbackModal(true);
    };
  
    const handleCloseFeedbackModal = () => {
      setShowFeedbackModal(false);
    };
  
    if (viewMode === 'list') {
      return (
        <>
          <Card
            className="transition-all duration-300 hover:shadow-lg border-blue-100 hover:border-blue-300 overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <CardContent className="p-6 max-h-none overflow-visible">
              <div className="flex gap-6">
                <div className="relative flex-shrink-0">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-24 h-32 object-cover rounded-lg shadow-md"
                  />
                  {book.rate && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      {book.rate}
                    </div>
                  )}
                </div>
  
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">bởi {book.author}</p>
                    </div>
                    <div className="flex gap-1">
                      {book.shareable && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Có thể mượn
                        </Badge>
                      )}
                      {book.archived && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                          Đã lưu trữ
                        </Badge>
                      )}
                    </div>
                  </div>
  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 overflow-hidden">
                    {book.synopsis}
                  </p>
  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>ISBN: {book.isbn}</span>
                    </div>
  
                    <div className="flex gap-2">
                      {showActions && book.owner !== 'current_user' && (
                        <>
                          <Button
                            size="sm"
                            onClick={handleBorrow}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isLoading}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Mượn
                          </Button>
                          <Button variant="outline" size="sm">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </>
                      )}
  
                      {showReturnActions && (
                        <>
                          <Button
                            size="sm"
                            onClick={handleReturnBook}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            disabled={isLoading}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Trả sách
                          </Button>
                        </>
                      )}
  
                      {showApprovalActions && (
                        <>
                          <Button
                            size="sm"
                            onClick={handleApproveReturn}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Duyệt trả
                          </Button>
                        </>
                      )}
  
                      {showOwnerActions && (
                        <>
                          <Button variant="outline" size="sm" disabled={isLoading}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleToggleShareable}
                            className={book.shareable ? 'text-green-600' : 'text-gray-600'}
                            disabled={isLoading}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUploadCover}
                            disabled={isLoading}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleToggleArchived}
                            className={book.archived ? 'text-orange-600' : 'text-gray-600'}
                            disabled={isLoading}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </>
                      )}
  
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleViewFeedback}
                        title="Xem đánh giá"
                        disabled={isLoading}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="outline" size="sm" disabled={isLoading}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <FeedbackModal
            isOpen={showFeedbackModal}
            onClose={handleCloseFeedbackModal}
            bookId={book.id}
            bookTitle={book.title}
          />
        </>
      );
    }
  
    return (
      <>
        <Card
          className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-blue-100 hover:border-blue-300 h-full flex flex-col"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative">
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            />
  
            {/* Overlay */}
            <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-2">
                  {showActions && book.owner !== 'current_user' && (
                    <>
                      <Button
                        size="sm"
                        onClick={handleBorrow}
                        className="bg-white text-gray-900 hover:bg-gray-100"
                        disabled={isLoading}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Mượn
                      </Button>
                      <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </>
                  )}
  
                  {showReturnActions && (
                    <Button
                      size="sm"
                      onClick={handleReturnBook}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      disabled={isLoading}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Trả sách
                    </Button>
                  )}
  
                  {showApprovalActions && (
                    <Button
                      size="sm"
                      onClick={handleApproveReturn}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      disabled={isLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Duyệt trả
                    </Button>
                  )}
  
                  {showOwnerActions && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleShareable}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        disabled={isLoading}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUploadCover}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        disabled={isLoading}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </>
                  )}
  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={handleViewFeedback}
                    title="Xem đánh giá"
                    disabled={isLoading}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    disabled={isLoading}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
  
            {/* Rating Badge */}
            {book.rate && (
              <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                {book.rate}
              </div>
            )}
  
            {/* Status Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {book.shareable && (
                <Badge className="bg-green-500 text-white text-xs">
                  Có thể mượn
                </Badge>
              )}
              {book.archived && (
                <Badge className="bg-gray-500 text-white text-xs">
                  Đã lưu trữ
                </Badge>
              )}
            </div>
          </div>
  
          <CardContent className="p-4 flex-1 flex flex-col">
            <h3 className="font-semibold text-lg mb-1 truncate text-gray-900">
              {book.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">bởi {book.author}</p>
            <p className="text-xs text-gray-500 line-clamp-3 mb-3 flex-1 overflow-hidden">
              {book.synopsis}
            </p>
  
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                    {book.owner === 'current_user' ? 'TÔI' : 'ND'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-500">
                  {book.owner === 'current_user' ? 'Sách của tôi' : 'Người dùng khác'}
                </span>
              </div>
  
              <span className="text-xs text-gray-400">
                #{book.id}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={handleCloseFeedbackModal}
          bookId={book.id}
          bookTitle={book.title}
        />
      </>
    );
  };
