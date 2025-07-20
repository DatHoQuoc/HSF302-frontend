
import React, { useState } from 'react';
import { Star, Heart, Share2, Archive, Edit, Upload, Eye, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import {bookService} from '@/service/BookService'
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
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  viewMode,
  showActions = false,
  showOwnerActions = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleBorrow = async () => {
    try {
      await bookService.borrowBook(book.id);
      toast({
        title: "Yêu cầu mượn sách",
        description: `Đã gửi yêu cầu mượn "${book.title}"`,
      });
    } catch (error) {
      toast({
        title: "Yêu cầu mượn sách thất bại",
        description: `Chưa gửi yêu cầu mượn "${book.title}"`,
      });
    }

  };

  const handleToggleShareable = () => {
    toast({
      title: book.shareable ? "Đã ẩn sách" : "Đã chia sẻ sách",
      description: `"${book.title}" ${book.shareable ? 'không còn' : 'đã được'} chia sẻ công khai`,
    });
  };

  const handleToggleArchived = () => {
    toast({
      title: book.archived ? "Đã khôi phục sách" : "Đã lưu trữ sách",
      description: `"${book.title}" ${book.archived ? 'đã được khôi phục' : 'đã được lưu trữ'}`,
    });
  };

  const handleUploadCover = () => {
    toast({
      title: "Upload ảnh bìa",
      description: "Tính năng upload ảnh bìa sẽ được triển khai",
    });
  };

  if (viewMode === 'list') {
    return (
      <Card
        className="transition-all duration-300 hover:shadow-lg border-blue-100 hover:border-blue-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-6">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
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

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
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
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Mượn
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {showOwnerActions && book.owner === 'current_user' && (
                    <>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleShareable}
                        className={book.shareable ? 'text-green-600' : 'text-gray-600'}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUploadCover}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleArchived}
                        className={book.archived ? 'text-orange-600' : 'text-gray-600'}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-blue-100 hover:border-blue-300"
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
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Mượn
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Heart className="h-4 w-4" />
                  </Button>
                </>
              )}

              {showOwnerActions && book.owner === 'current_user' && (
                <>
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleShareable}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUploadCover}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </>
              )}

              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
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

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1 text-gray-900">
          {book.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">bởi {book.author}</p>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {book.synopsis}
        </p>

        <div className="flex items-center justify-between">
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
  );
};
