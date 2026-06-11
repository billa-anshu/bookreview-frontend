import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import BookCard from '@/components/BookCard.jsx';  // ← Import BookCard
import { books } from '@/services/api';
import { BookX, ChevronLeft, ChevronRight } from 'lucide-react';

const BooksListingPage = () => {
  const [booksList, setBooksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('rating-desc');
  const size = 12;

  useEffect(() => {
    loadBooks();
  }, [page, sortBy]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      let sortField = 'rating';
      let sortDirection = 'desc';
      
      switch (sortBy) {
        case 'title-asc':
          sortField = 'title';
          sortDirection = 'asc';
          break;
        case 'author-asc':
          sortField = 'author';
          sortDirection = 'asc';
          break;
        case 'rating-desc':
          sortField = 'rating';
          sortDirection = 'desc';
          break;
        case 'year-desc':
          sortField = 'publishYear';
          sortDirection = 'desc';
          break;
        default:
          sortField = 'rating';
          sortDirection = 'desc';
      }
      
      const response = await books.getAll(page, size, sortField, sortDirection);
      setBooksList(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Browse All Books - Library</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">The Library</h1>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Browse our collection of literary works reviewed by the community.
            </p>
          </div>
          
          {/* Sort Section */}
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2 bg-card p-1.5 rounded-lg border border-border shadow-sm">
              <span className="text-xs font-medium text-muted-foreground ml-2 hidden sm:inline-block">Sort by:</span>
              <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setPage(0); }}>
                <SelectTrigger className="w-[160px] h-8 text-sm border-transparent bg-muted/50 hover:bg-muted">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating-desc">Rating: High to Low</SelectItem>
                  <SelectItem value="year-desc">Newest Published</SelectItem>
                  <SelectItem value="title-asc">Title: A to Z</SelectItem>
                  <SelectItem value="author-asc">Author: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Books Grid - Using BookCard Component */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : booksList.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-5">
                {booksList.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-6 mt-6">
                  <p className="text-xs text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{page * size + 1}</span> to{' '}
                    <span className="font-medium text-foreground">{Math.min((page + 1) * size, totalElements)}</span> of{' '}
                    <span className="font-medium text-foreground">{totalElements}</span> books
                  </p>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                      className="bg-card hover:bg-muted h-8 px-3"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                      Prev
                    </Button>
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i;
                        } else if (page < 2) {
                          pageNum = i;
                        } else if (page > totalPages - 3) {
                          pageNum = totalPages - 5 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            size="sm"
                            className="w-7 h-7 text-xs"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum + 1}
                          </Button>
                        );
                      })}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page + 1 >= totalPages}
                      className="bg-card hover:bg-muted h-8 px-3"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <BookX className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">No books found</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                Our library seems to be empty at the moment.
              </p>
              <Button asChild size="sm">
                <Link to="/">Go Home</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BooksListingPage;