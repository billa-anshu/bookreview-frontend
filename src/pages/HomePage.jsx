import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { BookOpen, Search } from 'lucide-react';

const HomePage = () => {
  const searchInputRef = useRef(null);

  const handleSearchClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      // Optional: Add a highlight animation class
      searchInputRef.current.classList.add('ring-2', 'ring-amber-500', 'ring-offset-2');
      setTimeout(() => {
        searchInputRef.current?.classList.remove('ring-2', 'ring-amber-500', 'ring-offset-2');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Library - Discover, read, and review books you love</title>
      </Helmet>
      
      <Header searchInputRef={searchInputRef} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.pexels.com/photos/2908984/pexels-photo-2908984.jpeg?auto=compress&cs=tinysrgb&w=1600" 
              alt="Elegant library bookshelf" 
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="relative z-10 container max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-bold font-serif mb-6 text-white tracking-tight drop-shadow-lg">
              Library
            </h1>
            <p className="text-xl md:text-2xl text-white mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Discover, read, and review books you love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* Browse Books Button - Plain Link */}
              <Link 
                to="/books" 
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <BookOpen className="h-5 w-5" />
                Browse All Books
              </Link>
              
              {/* Search Books Button - Now focuses header search */}
              <button
                onClick={handleSearchClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-stone-800 hover:bg-stone-100 font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Search className="h-5 w-5" />
                Search Books
              </button>
            </div>
          </div>
        </section>

        {/* Why Library Section */}
        <section className="py-24 bg-background">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-foreground">Why Library?</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-amber-700 dark:text-amber-500">Curated Collections</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Explore hand-picked selections across various genres, ensuring you always find quality reads that match your interests.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-amber-700 dark:text-amber-500">Community Reviews</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Read honest thoughts from fellow book lovers and share your own insights on the stories that moved you.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-amber-700 dark:text-amber-500">Track Your Reading</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Keep a personal log of your literary journey, favorite quotes, and books you want to read next.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                  <img 
                    src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=800&fit=crop" 
                    alt="Person reading a book" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-amber-100 dark:bg-amber-900/20 rounded-full -z-10 blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;