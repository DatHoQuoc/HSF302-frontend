import React, { useState } from 'react';
import { BookOpen, Users, Heart, ArrowRight, Plus, Search, Filter, Grid, List, User, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookCard } from '@/components/BookCard';
import { BookForm } from '@/components/BookForm';
import { StatsCard } from '@/components/StatsCard';
import { Link } from 'react-router-dom';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock data - in real app this would come from API
  const mockBooks = [
    {
      id: 1,
      title: "The Art of Clean Code",
      author: "Robert C. Martin",
      synopsis: "A comprehensive guide to writing maintainable and efficient code",
      isbn: "978-0132350884",
      rating: 4.5,
      cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
      shareable: true,
      archived: false,
      owner: "current_user"
    },
    {
      id: 2,
      title: "System Design Interview",
      author: "Alex Xu",
      synopsis: "An insider's guide to system design interviews",
      isbn: "978-1736049112",
      rating: 4.7,
      cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
      shareable: true,
      archived: false,
      owner: "other_user"
    },
    {
      id: 3,
      title: "JavaScript: The Good Parts",
      author: "Douglas Crockford",
      synopsis: "Unearthing the excellence in JavaScript",
      isbn: "978-0596517748",
      rating: 4.2,
      cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
      shareable: false,
      archived: false,
      owner: "current_user"
    }
  ];

  const mockStats = {
    totalBooks: 156,
    borrowedBooks: 23,
    sharedBooks: 45,
    returnedBooks: 78
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  BookConnect
                </h1>
                <p className="text-sm text-gray-600">Share • Connect • Learn</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm sách..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 border-blue-200 focus:border-blue-400"
                />
              </div>
              
              {/* Navigation Menu */}
              <div className="flex items-center space-x-2">
                <Link to="/my-books">
                  <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Sách của tôi
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm sách
                </Button>
                
                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Tổng số sách"
            value={mockStats.totalBooks}
            icon={BookOpen}
            color="blue"
            trend="+12%"
          />
          <StatsCard
            title="Sách đã mượn"
            value={mockStats.borrowedBooks}
            icon={Users}
            color="green"
            trend="+5%"
          />
          <StatsCard
            title="Sách chia sẻ"
            value={mockStats.sharedBooks}
            icon={Heart}
            color="purple"
            trend="+8%"
          />
          <StatsCard
            title="Sách đã trả"
            value={mockStats.returnedBooks}
            icon={ArrowRight}
            color="orange"
            trend="+15%"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all-books" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-2xl grid-cols-5 bg-white border border-blue-200">
              <TabsTrigger value="all-books" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Tất cả sách
              </TabsTrigger>
              <TabsTrigger value="my-books" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Sách của tôi
              </TabsTrigger>
              <TabsTrigger value="borrowed" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Đã mượn
              </TabsTrigger>
              <TabsTrigger value="returned" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Đã trả
              </TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Yêu thích
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Lọc
              </Button>
            </div>
          </div>

          <TabsContent value="all-books" className="space-y-6">
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {mockBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  viewMode={viewMode}
                  showActions={true}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-books" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Xem tất cả sách của bạn trong trang riêng</p>
              <Link to="/my-books">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Đi đến Sách của tôi
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="borrowed" className="space-y-6">
            <div className="grid gap-6 grid-cols-1">
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="text-orange-800">Sách đang mượn</CardTitle>
                  <CardDescription>Danh sách các sách bạn đang mượn</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-600">Bạn chưa mượn sách nào.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="returned" className="space-y-6">
            <div className="grid gap-6 grid-cols-1">
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="text-green-800">Sách đã trả</CardTitle>
                  <CardDescription>Lịch sử các sách bạn đã mượn và trả</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-green-600">Chưa có lịch sử mượn trả sách.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <div className="grid gap-6 grid-cols-1">
              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader>
                  <CardTitle className="text-purple-800">Sách yêu thích</CardTitle>
                  <CardDescription>Danh sách các sách bạn đã đánh dấu yêu thích</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-600">Chưa có sách yêu thích nào.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Book Form Modal */}
      {showAddForm && (
        <BookForm onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
};

export default Index;
