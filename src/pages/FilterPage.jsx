import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import BookCard from '@/components/BookCard.jsx';
import { books } from '@/services/api';
import { FilterX, SlidersHorizontal } from 'lucide-react';

const FilterPage = () => {
  const [booksList, setBooksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [genres, setGenres] = useState([]);
  
  const [selectedGenre, setSelectedGenre] = useState('');
  const [minRating, setMinRating] = useState([1]);

  // Fetch available genres from the database
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        // Get all books to extract unique genres
        const response = await books.getAll(0, 100);
        const booksData = response.data.content || [];
        const uniqueGenres = [...new Set(booksData.map(book => book.genre).filter(Boolean))];
        setGenres(uniqueGenres.sort());
      } catch (error) {
        console.error('Error fetching genres:', error);
        // Fallback genres
        setGenres(["Fantasy", "Dystopian", "Technical", "Mystery", "Romance", "Science Fiction", "Comedy", "Thriller", "Motivational"]);
      }
    };
    fetchGenres();
  }, []);

  const fetchFilteredBooks = async () => {
    setLoading(true);
    try {
      // Build filter parameters (author removed)
      let genreParam = selectedGenre || null;
      let minRatingParam = minRating[0] > 1 ? minRating[0] : null;
      
      const response = await books.filter(genreParam, null, minRatingParam, 0, 50);
      setBooksList(response.data.content || []);
      setTotalResults(response.data.totalElements || 0);
    } catch (error) {
      console.error('Error filtering books:', error);
      setBooksList([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFilteredBooks();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [selectedGenre, minRating]);

  const handleClearFilters = () => {
    setSelectedGenre('');
    setMinRating([1]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Discover & Filter - Library</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Discover Books</h1>
            <p className="text-lg text-muted-foreground">Find exactly what you're looking for with advanced filters.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Filter Sidebar */}
            <aside className="w-full lg:w-72 shrink-0">
              <div className="bg-card border border-border rounded-2xl p-6 lg:sticky lg:top-24 shadow-sm">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold font-serif">Filters</h2>
                </div>
                
                <div className="space-y-8">
                  {/* Genre Filter */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Genre</Label>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {genres.map((g) => (
                        <div key={g} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`genre-${g}`} 
                            checked={selectedGenre === g}
                            onCheckedChange={(checked) => setSelectedGenre(checked ? g : '')}
                          />
                          <label
                            htmlFor={`genre-${g}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {g}
                          </label>
                        </div>
                      ))}
                    </div>
                    {genres.length === 0 && (
                      <p className="text-sm text-muted-foreground">Loading genres...</p>
                    )}
                  </div>
                  
                  {/* Rating Filter */}
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Minimum Rating</Label>
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">{minRating[0]} Stars</span>
                    </div>
                    <Slider 
                      value={minRating} 
                      onValueChange={setMinRating} 
                      max={5} 
                      min={1} 
                      step={1} 
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>1 Star</span>
                      <span>2 Stars</span>
                      <span>3 Stars</span>
                      <span>4 Stars</span>
                      <span>5 Stars</span>
                    </div>
                  </div>
                  
                  {/* Clear Filters Button */}
                  <div className="pt-6 border-t border-border">
                    <Button type="button" variant="outline" onClick={handleClearFilters} className="w-full">
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1">
              <div className="mb-6 flex justify-between items-end">
                <p className="text-muted-foreground font-medium">
                  {loading ? 'Searching...' : `Found ${totalResults} ${totalResults === 1 ? 'result' : 'results'}`}
                </p>
                {selectedGenre && (
                  <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                    Genre: {selectedGenre}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : booksList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {booksList.map(book => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-card rounded-2xl border border-border border-dashed shadow-sm">
                  <FilterX className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h2 className="text-2xl font-bold font-serif mb-2">No matches found</h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Try removing some filters to broaden your search results.
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FilterPage;