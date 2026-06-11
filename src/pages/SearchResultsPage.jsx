import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import BookCard from '@/components/BookCard.jsx';
import { books } from '@/services/api';
import { SearchX, ArrowLeft } from 'lucide-react';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      if (!query.trim()) {
        setResults([]);
        setTotalResults(0);
        setLoading(false);
        return;
      }
      
      try {
        // Use the search endpoint from your backend
        // Page 0, size 50 to get all results
        const response = await books.search(query, 0, 50);
        setResults(response.data.content || []);
        setTotalResults(response.data.totalElements || 0);
      } catch (error) {
        console.error('Error searching books:', error);
        setResults([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Search Results for "{query}" - Library</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-6 -ml-4 text-muted-foreground">
            <Link to="/books"><ArrowLeft className="w-4 h-4 mr-2" /> Back to browse</Link>
          </Button>

          <div className="mb-12 border-b border-border pb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-serif mb-4">Search Results</h1>
            <p className="text-xl text-muted-foreground">
              {loading ? 'Searching...' : (
                <>Found <span className="font-semibold text-foreground">{totalResults}</span> {totalResults === 1 ? 'book' : 'books'} matching <span className="font-semibold text-foreground italic">"{query}"</span></>
              )}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {results.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-card rounded-2xl border border-border shadow-sm max-w-3xl mx-auto">
              <SearchX className="h-20 w-20 text-muted-foreground mx-auto mb-6 opacity-30" />
              <h2 className="text-3xl font-bold font-serif mb-4">No matching books found</h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
                We couldn't find any books matching your search query. Try checking for typos or using broader keywords.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link to="/filter">Try advanced filters</Link>
                </Button>
                <Button asChild>
                  <Link to="/books">Browse all books</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResultsPage;