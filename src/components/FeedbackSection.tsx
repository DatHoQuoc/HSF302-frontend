
import React, { useState } from 'react';
import { Star, Send, MessageCircle, ThumbsUp, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface FeedbackSectionProps {
  bookId: number;
}

export const FeedbackSection = ({ bookId }: FeedbackSectionProps) => {
  const [newFeedback, setNewFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Mock feedback data
  const mockFeedbacks = [
    {
      id: 1,
      user: {
        name: "Nguyễn Văn A",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
      },
      rating: 5,
      comment: "Cuốn sách rất hay, nội dung bổ ích và dễ hiểu. Tôi đã học được rất nhiều từ cuốn sách này.",
      createdDate: "2024-01-20",
      likes: 12,
      helpful: true
    },
    {
      id: 2,
      user: {
        name: "Trần Thị B",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b6dc1e45?w=40&h=40&fit=crop&crop=face"
      },
      rating: 4,
      comment: "Khá tốt, tuy nhiên một số phần hơi khó hiểu đối với người mới bắt đầu.",
      createdDate: "2024-01-18",
      likes: 8,
      helpful: false
    },
    {
      id: 3,
      user: {
        name: "Lê Văn C",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
      },
      rating: 5,
      comment: "Tuyệt vời! Đây là một trong những cuốn sách hay nhất tôi từng đọc về chủ đề này.",
      createdDate: "2024-01-15",
      likes: 15,
      helpful: true
    }
  ];

  const handleSubmitFeedback = () => {
    if (!newFeedback.trim() || rating === 0) {
      alert('Vui lòng nhập đánh giá và chọn số sao!');
      return;
    }
    
    // TODO: Implement feedback submission
    console.log('Submit feedback:', {
      bookId,
      comment: newFeedback,
      rating,
    });
    
    setNewFeedback('');
    setRating(0);
  };

  const handleLikeFeedback = (feedbackId: number) => {
    // TODO: Implement like feedback
    console.log('Like feedback:', feedbackId);
  };

  const handleReportFeedback = (feedbackId: number) => {
    // TODO: Implement report feedback
    console.log('Report feedback:', feedbackId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Đánh giá & Phản hồi ({mockFeedbacks.length})
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>4.7 / 5</span>
        </div>
      </div>

      {/* Add new feedback */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Viết đánh giá của bạn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rating stars */}
          <div>
            <p className="text-sm font-medium mb-2">Đánh giá sao:</p>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-colors"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment textarea */}
          <div>
            <Textarea
              placeholder="Chia sẻ suy nghĩ của bạn về cuốn sách này..."
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleSubmitFeedback}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={!newFeedback.trim() || rating === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            Gửi đánh giá
          </Button>
        </CardContent>
      </Card>

      {/* Feedback list */}
      <div className="space-y-4">
        {mockFeedbacks.map((feedback) => (
          <Card key={feedback.id} className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={feedback.user.avatar} alt={feedback.user.name} />
                  <AvatarFallback>
                    {feedback.user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{feedback.user.name}</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < feedback.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {feedback.helpful && (
                        <Badge variant="secondary" className="text-xs">
                          Hữu ích
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.createdDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {feedback.comment}
                  </p>
                  
                  <div className="flex items-center space-x-4 pt-2">
                    <button
                      onClick={() => handleLikeFeedback(feedback.id)}
                      className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>{feedback.likes}</span>
                    </button>
                    <button
                      onClick={() => handleReportFeedback(feedback.id)}
                      className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Flag className="h-3 w-3" />
                      <span>Báo cáo</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
