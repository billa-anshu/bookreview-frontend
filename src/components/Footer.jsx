import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12 mt-auto">
      <div className="container max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="h-6 w-6" />
          <span className="font-serif font-bold text-xl text-foreground">Library</span>
        </div>
        <div className="flex gap-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">Home</Link>
          <Link to="/books" className="text-sm text-muted-foreground hover:text-primary">Books</Link>
          <Link to="/about" className="text-sm text-muted-foreground hover:text-primary">About</Link>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Library. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
