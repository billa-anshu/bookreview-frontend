import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare } from 'lucide-react';

const BookCard = ({ book }) => {
  const title = book.title || book.bookTitle || 'Unknown Title';
  const author = book.author || 'Unknown Author';
  const rating = book.rating || 0;
  const reviewCount = book.reviewCount || 0;
  const imageUrl = book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop';

  // Truncate long titles
  const displayTitle = title.length > 40 ? title.substring(0, 37) + '...' : title;

  return (
    <Link to={`/books/${book.id}`} className="group flex flex-col h-full">
      <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg shadow-md bg-muted">
        <img
          src={imageUrl}
          alt={`Cover of ${title}`}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white font-medium px-3 py-1.5 text-xs border border-white rounded-md backdrop-blur-sm">
            View Details
          </span>
        </div>
      </div>
      
      {/* Darker content area */}
      <div className="flex flex-col flex-1 bg-card border border-t-0 border-border rounded-b-lg p-3">
        {/* Title */}
        <h3 className="font-semibold text-sm leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2 text-foreground">
          {displayTitle}
        </h3>
        
        {/* Author */}
        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
          {author}
        </p>
        
        {/* Rating and Review Count */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
            <span className="font-medium text-xs text-foreground">{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{reviewCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;