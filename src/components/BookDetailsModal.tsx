
import React from 'react';
import { X, Star, Calendar, Share2, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FeedbackSection } from '@/components/FeedbackSection';

interface BookDetailsModalProps {
  book: any;
  onClose: () => void;
}

export const BookDetailsModal = ({ book, onClose }: BookDetailsModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex">
          {/* Left side - Book cover and basic info */}
          <div className="w-1/3 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <div className="sticky top-0">
              <img
                src={book.cover}
                alt={book.title}
                className="w-full aspect-[3/4] object-cover rounded-lg shadow-lg mb-4"
              />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{book.rating}</span>
                  </div>
                  <Badge variant={book.shareable ? "default" : "secondary"}>
                    {book.shareable ? "Có thể chia sẻ" : "Riêng tư"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>ISBN:</strong> {book.isbn}</p>
                  <p><strong>Đã mượn:</strong> {book.borrowCount} lần</p>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(book.createdDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Detailed info and feedback */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {book.title}
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  Tác giả: {book.author}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Tóm tắt nội dung</h3>
                <p className="text-gray-700 leading-relaxed">
                  {book.synopsis}
                </p>
              </div>

              <div className="flex space-x-3">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Eye className="h-4 w-4 mr-2" />
                  Đọc ngay
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Tải xuống
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Chia sẻ
                </Button>
              </div>

              {/* Feedback Section */}
              <div className="border-t pt-6">
                <FeedbackSection bookId={book.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
