import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Upload, X } from 'lucide-react';
import { reviews, books } from '@/services/api';
import { toast } from 'sonner';

const ReviewForm = ({ reviewId = null, bookId = null, onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [hoveredStar, setHoveredStar] = useState(0);
  const [bookInfo, setBookInfo] = useState(null);
  const [loadingBook, setLoadingBook] = useState(false);

  useEffect(() => {
    if (reviewId) {
      loadReview();
    } else if (bookId) {
      loadBookInfo();
    }
  }, [reviewId, bookId]);

  const loadBookInfo = async () => {
    setLoadingBook(true);
    try {
      const response = await books.getById(bookId);
      setBookInfo(response.data);
    } catch (error) {
      console.error('Error loading book info:', error);
      toast.error('Failed to load book information');
    } finally {
      setLoadingBook(false);
    }
  };

  const loadReview = async () => {
    try {
      // Get all reviews and find the one we need
      const response = await reviews.getAll();
      const review = response.data.find(r => r.reviewId === reviewId);
      
      if (review) {
        setFormData({
          rating: review.rating,
          comment: review.comment || '',
        });
        setBookInfo(review.book);
      }
    } catch (error) {
      console.error('Error loading review:', error);
      toast.error('Failed to load review');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    
    if (!formData.comment.trim()) {
      newErrors.comment = 'Review text is required';
    } else if (formData.comment.trim().length < 5) {
      newErrors.comment = 'Review must be at least 5 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (reviewId) {
        // Update existing review
        await reviews.update(reviewId, {
          rating: formData.rating,
          comment: formData.comment
        });
        toast.success('Review updated successfully');
      } else if (bookId) {
        // Create new review
        await reviews.add({
          book: { id: bookId },
          rating: formData.rating,
          comment: formData.comment
        });
        toast.success('Review added successfully');
      } else {
        toast.error('Missing book information');
        setLoading(false);
        return;
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || (reviewId ? 'Failed to update review' : 'Failed to create review'));
    } finally {
      setLoading(false);
    }
  };

  if (loadingBook) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted animate-pulse rounded"></div>
        <div className="h-10 bg-muted animate-pulse rounded"></div>
        <div className="h-32 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Book Info Display (when creating review for a specific book) */}
      {bookInfo && !reviewId && (
        <div className="pb-4 border-b border-border">
          <p className="text-sm text-muted-foreground mb-1">Reviewing</p>
          <p className="font-semibold text-lg">{bookInfo.title}</p>
          <p className="text-sm text-muted-foreground">by {bookInfo.author}</p>
        </div>
      )}

      {/* Rating */}
      <div>
        <Label>Your Rating</Label>
        <div className="flex items-center gap-2 mt-1.5">
          {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredStar || formData.rating)
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
          {formData.rating > 0 && (
            <span className="text-sm font-medium ml-2">{formData.rating}/5</span>
          )}
        </div>
        {errors.rating && (
          <p className="text-sm text-destructive mt-1">{errors.rating}</p>
        )}
      </div>

      {/* Review Text */}
      <div>
        <Label htmlFor="comment">Your Review</Label>
        <Textarea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          placeholder="Share your thoughts about this book..."
          rows={6}
          className="mt-1.5"
        />
        {errors.comment && (
          <p className="text-sm text-destructive mt-1">{errors.comment}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : reviewId ? 'Update Review' : 'Post Review'}
      </Button>
    </form>
  );
};

export default ReviewForm;