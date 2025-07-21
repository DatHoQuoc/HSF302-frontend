import React from 'react';
import { X, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FeedbackSection } from './FeedbackSection';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: number;
  bookTitle: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  bookId,
  bookTitle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl min-h-[90vh] flex items-center justify-center py-8">
        <Card className="w-full max-h-[90vh] overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Đánh giá sách: {bookTitle}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-6 overflow-y-auto flex-1 min-h-0">
            <FeedbackSection bookId={bookId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};