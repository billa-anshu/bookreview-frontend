import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, User, Calendar, Edit2, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { reviews } from '@/services/api';
import { toast } from 'sonner';

const ReviewCard = ({ review, showBookInfo = false, book, currentUser, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRating, setEditedRating] = useState(review.rating);
  const [editedComment, setEditedComment] = useState(review.comment || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Check if current user owns this review
  const isOwner = currentUser && review.user?.id === currentUser.id;
  
  // Get reviewer name
  const reviewerName = review.user?.name || 'Anonymous';
  const reviewerAvatar = `https://ui-avatars.com/api/?name=${reviewerName}&background=random`;
  
  const renderStars = (rating, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
        } ${
          i < rating ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground/30'
        }`}
        onClick={interactive ? () => setEditedRating(i + 1) : undefined}
      />
    ));
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      // Update review using your Spring Boot API
      await reviews.update(review.reviewId, {
        rating: editedRating,
        comment: editedComment,
      });
      
      toast.success('Review updated successfully!');
      setIsEditing(false);
      if (onEdit) await onEdit();
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error(error.response?.data?.message || 'Failed to update review');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedRating(review.rating);
    setEditedComment(review.comment || '');
  };

  const handleDeleteClick = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      // Delete review using your Spring Boot API
      await reviews.delete(review.reviewId);
      
      toast.success('Review deleted successfully!');
      if (onDelete) await onDelete(review.reviewId);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const reviewText = review.comment || '';
  const shouldTruncate = !isEditing && reviewText && reviewText.length > 150;
  const displayComment = expanded || !shouldTruncate || isEditing
    ? (isEditing ? editedComment : reviewText)
    : `${reviewText.substring(0, 150)}...`;

  // Edit mode view
  if (isEditing) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img 
              src={reviewerAvatar}
              alt={reviewerName} 
              className="w-10 h-10 rounded-full object-cover border border-border"
            />
            <div>
              <p className="font-medium text-sm text-foreground">{reviewerName}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 mb-4">
          {renderStars(editedRating, true)}
          <span className="text-xs text-muted-foreground ml-2">(Click to rate)</span>
        </div>
        
        <Textarea
          value={editedComment}
          onChange={(e) => setEditedComment(e.target.value)}
          placeholder="Edit your review..."
          className="min-h-[150px] mb-4 resize-vertical"
        />
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={handleSaveEdit}
            disabled={isSaving}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancelEdit}
            disabled={isSaving}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Normal view mode
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {showBookInfo && book && (
        <Link to={`/books/${book.id}`} className="flex items-center gap-4 mb-4 pb-4 border-b border-border group">
          <img 
            src={book.coverImage || `https://picsum.photos/id/${parseInt(book.id?.replace(/\D/g, '') || '100')}/100/150`}
            alt={book.title} 
            className="w-12 h-16 object-cover rounded shadow-sm group-hover:scale-105 transition-transform"
          />
          <div>
            <h4 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{book.title}</h4>
            <p className="text-sm text-muted-foreground">{book.author}</p>
          </div>
        </Link>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img 
            src={reviewerAvatar}
            alt={reviewerName} 
            className="w-10 h-10 rounded-full object-cover border border-border"
          />
          <div>
            <p className="font-medium text-sm text-foreground">{reviewerName}</p>
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <Calendar className="w-3 h-3" />
              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1 mb-3">
        {renderStars(review.rating)}
      </div>
      
      <div className="flex-1">
        <p className="text-foreground/90 leading-relaxed text-sm whitespace-pre-wrap">
          "{displayComment}"
        </p>
        {shouldTruncate && (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="text-primary text-sm font-medium mt-2 hover:underline"
          >
            {expanded ? 'Read Less' : 'Read More'}
          </button>
        )}
      </div>

      {isOwner && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-8 text-xs" 
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="w-3 h-3 mr-2" /> Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/20" 
            onClick={handleDeleteClick}
          >
            <Trash2 className="w-3 h-3 mr-2" /> Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;