import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Users, Heart, ArrowRight, Plus, Search, Filter, Grid, List, User, LogOut, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge'; // Make sure this is used if you intend to
import { BookCard } from '@/components/BookCard';
import { BookForm } from '@/components/BookForm';
import { StatsCard } from '@/components/StatsCard';
import { Link } from 'react-router-dom';
import { bookService } from '@/service/BookService'; // Adjust this import path as necessary
import { GetAllBooksRequest, GetAllBooksResponse, BookInfo } from '@/service/BookService'; // Adjust this import path as necessary for your types

const Index = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showAddForm, setShowAddForm] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('all-books'); // State for active tab

    // State for fetched books
    const [allBooks, setAllBooks] = useState<BookInfo[]>([]);
    const [borrowedBooks, setBorrowedBooks] = useState<BookInfo[]>([]);
    const [returnedBooks, setReturnedBooks] = useState<BookInfo[]>([]);
    const [myBooks, setMyBooks] = useState<BookInfo[]>([]); // Assuming you'll fetch "My Books" directly

    // Loading states
    const [isLoadingAllBooks, setIsLoadingAllBooks] = useState(true);
    const [isLoadingBorrowedBooks, setIsLoadingBorrowedBooks] = useState(false);
    const [isLoadingReturnedBooks, setIsLoadingReturnedBooks] = useState(false);
    const [isLoadingMyBooks, setIsLoadingMyBooks] = useState(false);

    // Error states
    const [errorAllBooks, setErrorAllBooks] = useState<string | null>(null);
    const [errorBorrowedBooks, setErrorBorrowedBooks] = useState<string | null>(null);
    const [errorReturnedBooks, setErrorReturnedBooks] = useState<string | null>(null);
    const [errorMyBooks, setErrorMyBooks] = useState<string | null>(null);

    // Mock stats for now, replace with actual API calls if you have them
    const mockStats = {
        totalBooks: 156, // This should come from an API if available
        borrowedBooks: 23,
        sharedBooks: 45,
        returnedBooks: 78
    };

    // --- Data Fetching Functions ---
    const fetchAllBooks = useCallback(async (params?: GetAllBooksRequest) => {
        setIsLoadingAllBooks(true);
        setErrorAllBooks(null);
        try {
            const response = await bookService.getAllBooks(params);
            setAllBooks(response.content);
        } catch (error) {
            setErrorAllBooks(error.message);
        } finally {
            setIsLoadingAllBooks(false);
        }
    }, []);

    const fetchBorrowedBooks = useCallback(async (params?: GetAllBooksRequest) => {
        setIsLoadingBorrowedBooks(true);
        setErrorBorrowedBooks(null);
        try {
            const response = await bookService.getAllBooksBorrowed(params);
            setBorrowedBooks(response.content);
        } catch (error) {
            setErrorBorrowedBooks(error.message);
        } finally {
            setIsLoadingBorrowedBooks(false);
        }
    }, []);

    const fetchReturnedBooks = useCallback(async (params?: GetAllBooksRequest) => {
        setIsLoadingReturnedBooks(true);
        setErrorReturnedBooks(null);
        try {
            const response = await bookService.getAllBooksReturned(params);
            setReturnedBooks(response.content);
        } catch (error) {
            setErrorReturnedBooks(error.message);
        } finally {
            setIsLoadingReturnedBooks(false);
        }
    }, []);

    const fetchMyBooks = useCallback(async (params?: GetAllBooksRequest) => {
        setIsLoadingMyBooks(true);
        setErrorMyBooks(null);
        try {
         
            const response = await bookService.getAllBooksByOwner(params); 
            setMyBooks(response.content);
        } catch (error) {
            setErrorMyBooks(error.message);
        } finally {
            setIsLoadingMyBooks(false);
        }
    }, []);


    // --- useEffect for fetching data based on activeTab ---
    useEffect(() => {
        if (activeTab === 'all-books') {
            // Apply search query here if you want to filter "All Books"
            fetchAllBooks({
                page: 0,
                size: 3, // Or whatever default page/size you want
                //title: searchQuery // Pass search query if your API supports it
            });
        } else if (activeTab === 'borrowed') {
            fetchBorrowedBooks({ page: 0, size: 10 });
        } else if (activeTab === 'returned') {
            fetchReturnedBooks({ page: 0, size: 10 });
        } else if (activeTab === 'my-books') {
            fetchMyBooks({ page: 0, size: 10 });
        }
        // No fetch for 'favorites' yet, as it's typically user-specific and might need a separate endpoint
    }, [activeTab, fetchAllBooks, fetchBorrowedBooks, fetchReturnedBooks, fetchMyBooks, searchQuery]); // Re-fetch when tab or search query changes

    // --- Handle Search Functionality ---
    // You might want a debounced search or trigger search on button click
    const handleSearch = () => {
        // This will trigger the useEffect for 'all-books' if that's the active tab
        // If search should apply to other tabs, you'd call their specific fetch functions
        if (activeTab === 'all-books') {
            fetchAllBooks({
                page: 0,
                size: 10,
                //title: searchQuery // Assuming API filters by title
            });
        }
        // Add more conditions for other tabs if they also need search functionality
    };

    // Determine which book list and loading/error state to display based on the active tab
    const getBooksToDisplay = () => {
        switch (activeTab) {
            case 'all-books':
                return { books: allBooks, isLoading: isLoadingAllBooks, error: errorAllBooks };
            case 'borrowed':
                return { books: borrowedBooks, isLoading: isLoadingBorrowedBooks, error: errorBorrowedBooks };
            case 'returned':
                return { books: returnedBooks, isLoading: isLoadingReturnedBooks, error: errorReturnedBooks };
            case 'my-books':
                return { books: myBooks, isLoading: isLoadingMyBooks, error: errorMyBooks };
            case 'favorites':
                return { books: [], isLoading: false, error: null }; // No API for favorites yet
            default:
                return { books: [], isLoading: false, error: null };
        }
    };

    const { books, isLoading, error } = getBooksToDisplay();


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
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearch();
                                        }
                                    }}
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
                {/* Stats Section - Keep mock for now or fetch from another API */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Tổng số sách"
                        value={mockStats.totalBooks} // Replace with actual total if available
                        icon={BookOpen}
                        color="blue"
                        trend="+12%"
                    />
                    <StatsCard
                        title="Sách đã mượn"
                        value={mockStats.borrowedBooks} // Replace with actual borrowed count
                        icon={Users}
                        color="green"
                        trend="+5%"
                    />
                    <StatsCard
                        title="Sách chia sẻ"
                        value={mockStats.sharedBooks} // Replace with actual shared count
                        icon={Heart}
                        color="purple"
                        trend="+8%"
                    />
                    <StatsCard
                        title="Sách đã trả"
                        value={mockStats.returnedBooks} // Replace with actual returned count
                        icon={ArrowRight}
                        color="orange"
                        trend="+15%"
                    />
                </div>

                {/* Main Content */}
                <Tabs defaultValue="all-books" className="space-y-6" onValueChange={setActiveTab}>
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

                    {/* All Books Tab Content */}
                    <TabsContent value="all-books" className="space-y-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="ml-2 text-gray-600">Đang tải sách...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-600">
                                <p>{error}</p>
                            </div>
                        ) : books.length === 0 ? (
                            <div className="text-center py-12 text-gray-600">
                                <p>Không tìm thấy sách nào.</p>
                            </div>
                        ) : (
                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                                {books.map((book) => (
                                    <BookCard
                                        key={book.id}
                                        book={book}
                                        viewMode={viewMode}
                                        showActions={true}
                                        onBookUpdate={() => fetchAllBooks({ page: 0, size: 10 })}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* My Books Tab Content */}
                    <TabsContent value="my-books" className="space-y-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="ml-2 text-gray-600">Đang tải sách của bạn...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-600">
                                <p>{error}</p>
                            </div>
                        ) : books.length === 0 ? (
                            <div className="text-center py-12 text-gray-600">
                                <p>Bạn chưa thêm sách nào.</p>
                                <Link to="/my-books">
                                    <Button className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        Đi đến Sách của tôi
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                                {books.map((book) => (
                                    <BookCard
                                        key={book.id}
                                        book={book}
                                        viewMode={viewMode}
                                        showOwnerActions={true}
                                        onBookUpdate={() => fetchMyBooks({ page: 0, size: 10 })}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Borrowed Books Tab Content */}
                    <TabsContent value="borrowed" className="space-y-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="ml-2 text-gray-600">Đang tải sách đã mượn...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-600">
                                <p>{error}</p>
                            </div>
                        ) : books.length === 0 ? (
                            <Card className="border-orange-200 bg-orange-50/50">
                                <CardHeader>
                                    <CardTitle className="text-orange-800">Sách đang mượn</CardTitle>
                                    <CardDescription>Danh sách các sách bạn đang mượn</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-orange-600">Bạn chưa mượn sách nào.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                                {books.map((book) => (
                                    <BookCard
                                        key={book.id}
                                        book={book}
                                        viewMode={viewMode}
                                        showReturnActions={true}
                                        onBookUpdate={() => fetchBorrowedBooks({ page: 0, size: 10 })}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Returned Books Tab Content */}
                    <TabsContent value="returned" className="space-y-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="ml-2 text-gray-600">Đang tải sách đã trả...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-600">
                                <p>{error}</p>
                            </div>
                        ) : books.length === 0 ? (
                            <Card className="border-green-200 bg-green-50/50">
                                <CardHeader>
                                    <CardTitle className="text-green-800">Sách đã trả</CardTitle>
                                    <CardDescription>Lịch sử các sách bạn đã mượn và trả</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-green-600">Chưa có lịch sử mượn trả sách.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                                {books.map((book) => (
                                    <BookCard
                                        key={book.id}
                                        book={book}
                                        viewMode={viewMode}
                                        showApprovalActions={true}
                                        onBookUpdate={() => fetchReturnedBooks({ page: 0, size: 10 })}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Favorites Tab Content - Still mock for now */}
                    <TabsContent value="favorites" className="space-y-6">
                        <Card className="border-purple-200 bg-purple-50/50">
                            <CardHeader>
                                <CardTitle className="text-purple-800">Sách yêu thích</CardTitle>
                                <CardDescription>Danh sách các sách bạn đã đánh dấu yêu thích</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-purple-600">Chưa có sách yêu thích nào.</p>
                            </CardContent>
                        </Card>
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