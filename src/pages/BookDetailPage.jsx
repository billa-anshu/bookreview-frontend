import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { books, reviews } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Star, ArrowLeft, Heart, BookOpen, User, Calendar, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

const BookDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, currentUser } = useAuth();
  const reviewsContainerRef = useRef(null);
  const reviewFormRef = useRef(null);
  
  const [book, setBook] = useState(null);
  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState({});

  useEffect(() => {
    loadBookAndReviews();
  }, [id, currentUser]);

  const loadBookAndReviews = async () => {
    setLoading(true);
    try {
      const [bookRes, reviewsRes] = await Promise.all([
        books.getById(id),
        reviews.getByBookId(id)
      ]);
      
      setBook(bookRes.data);
      
      const sortedReviews = [...(reviewsRes.data || [])].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setReviewsList(sortedReviews);
      
      if (currentUser?.id) {
        const existingReview = sortedReviews.find(review => review.user?.id === currentUser.id);
        if (existingReview) {
          setUserReview(existingReview);
          setReviewForm({
            rating: existingReview.rating,
            comment: existingReview.comment
          });
        }
      }
    } catch (error) {
      console.error('Error loading book:', error);
      toast.error('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    
    if (userReview && !isEditing) {
      toast.error('You have already reviewed this book. Please edit your existing review instead.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && userReview) {
        await reviews.update(userReview.reviewId, {
          rating: reviewForm.rating,
          comment: reviewForm.comment
        });
        toast.success('Review updated successfully!');
        setIsEditing(false);
      } else {
        await reviews.add({
          book: { id: book.id },
          rating: reviewForm.rating,
          comment: reviewForm.comment
        });
        toast.success('Review added successfully!');
      }
      
      await loadBookAndReviews();
      setReviewForm({ rating: 5, comment: '' });
      
      setTimeout(() => {
        reviewsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReview = () => {
    if (userReview) {
      setReviewForm({
        rating: userReview.rating,
        comment: userReview.comment
      });
      setIsEditing(true);
      setTimeout(() => {
        reviewFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setReviewForm(userReview 
      ? { rating: userReview.rating, comment: userReview.comment }
      : { rating: 5, comment: '' }
    );
  };

  const toggleExpand = (reviewId) => {
    setExpandedReviews(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  const renderStars = (rating, size = "w-4 h-4") => {
    const numRating = Math.round(rating || 0);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${i < numRating ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground/30'}`}
      />
    ));
  };

  const ReviewItem = ({ review, isCurrentUserReview }) => {
    const isExpanded = expandedReviews[review.reviewId] || false;
    const comment = review.comment || '';
    const shouldTruncate = comment.length > 150;
    const displayComment = isExpanded || !shouldTruncate ? comment : `${comment.substring(0, 150)}...`;
    const reviewerName = review.user?.name || 'Anonymous';
    const reviewDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently';

    return (
      <div key={review.reviewId} className={`bg-card border rounded-2xl p-5 shadow-sm transition-all duration-300 ${
        isCurrentUserReview ? 'border-primary/30 bg-primary/5' : 'border-border'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(reviewerName)}&background=random`}
              alt={reviewerName} 
              className="w-10 h-10 rounded-full object-cover border border-border"
            />
            <div>
              <p className="font-medium text-sm text-foreground">{reviewerName}</p>
              <div className="flex items-center text-xs text-muted-foreground gap-1">
                <Calendar className="w-3 h-3" />
                {reviewDate}
              </div>
            </div>
          </div>
          {isCurrentUserReview && (
            <button 
              onClick={handleEditReview}
              className="text-primary hover:text-primary/80 transition-colors"
              title="Edit your review"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-1 mb-3">
          {renderStars(review.rating)}
        </div>
        
        <div>
          <p className="text-foreground/90 leading-relaxed text-sm whitespace-pre-wrap">
            {displayComment}
          </p>
          {shouldTruncate && (
            <button 
              onClick={() => toggleExpand(review.reviewId)} 
              className="text-primary text-sm font-medium mt-2 hover:underline"
            >
              {isExpanded ? 'Read Less' : 'Read More'}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 container max-w-5xl mx-auto px-4">
          <Skeleton className="h-10 w-32 mb-8" />
          <div className="grid md:grid-cols-[300px_1fr] gap-10">
            <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
            <div className="space-y-4 pt-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex gap-4 pt-4">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-48" />
              </div>
              <Skeleton className="h-32 w-full mt-8" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md bg-card p-10 rounded-3xl border border-border shadow-sm">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
            <h2 className="text-3xl font-bold font-serif mb-4">Book Not Found</h2>
            <p className="text-muted-foreground mb-8">The book you are looking for doesn't exist in our catalog or has been removed.</p>
            <Button asChild size="lg">
              <Link to="/books">Back to Library</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{`${book.title} - Library`}</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
            <Link to="/books">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Books
            </Link>
          </Button>

          {/* Book Info Section */}
          <div className="grid md:grid-cols-[280px_1fr] gap-10 mb-16">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl bg-card border border-border/50">
                <img 
                  src={book.coverImage || `https://picsum.photos/id/${parseInt(book.id?.replace(/\D/g, '') || '100')}/300/400`}
                  alt={book.title} 
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/id/100/300/400`;
                  }}
                />
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="mb-4">
                <div className="inline-block px-3 py-1 mb-3 rounded-full bg-secondary/15 text-secondary-foreground font-medium text-xs tracking-wider uppercase border border-secondary/20">
                  {book.genre}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2 leading-tight">{book.title}</h1>
                <p className="text-lg text-muted-foreground">by <span className="text-foreground">{book.author}</span></p>
              </div>
              
              <div className="flex items-center gap-4 mb-6 flex-wrap">
                <div className="flex items-center bg-card border border-border rounded-lg px-3 py-1.5">
                  <div className="flex items-center mr-2">
                    {renderStars(book.rating || 0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-base leading-none">{(book.rating || 0).toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">{book.reviewCount || 0} reviews</span>
                  </div>
                </div>
                
                <Button variant="outline" className="rounded-lg" onClick={() => toast.success('Added to your favorites!')}>
                  <Heart className="w-4 h-4 mr-2 text-rose-500" />
                  Add to Favorites
                </Button>
              </div>

              <div>
                <h3 className="font-serif text-xl mb-2 text-foreground">Synopsis</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {book.description}
                </p>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div ref={reviewsContainerRef} className="border-t border-border pt-12">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold font-serif mb-1">Community Reviews</h2>
              <p className="text-muted-foreground text-sm">See what other readers think about this book.</p>
            </div>

            <div className="grid lg:grid-cols-[1fr_320px] gap-8">
              <div className="space-y-5 order-2 lg:order-1">
                {reviewsList.length > 0 ? (
                  reviewsList.map(review => (
                    <ReviewItem 
                      key={review.reviewId}
                      review={review}
                      isCurrentUserReview={currentUser?.id === review.user?.id}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-muted/30 rounded-2xl border border-border border-dashed">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="text-lg font-medium text-foreground mb-1">No reviews yet</p>
                    <p className="text-muted-foreground text-sm">Be the first to review this book!</p>
                  </div>
                )}
              </div>
              
              {/* Review Form */}
              <div ref={reviewFormRef} className="order-1 lg:order-2">
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm sticky top-24">
                  <h3 className="text-lg font-bold font-serif mb-4">
                    {isEditing ? 'Edit Your Review' : (userReview ? 'You Already Reviewed This Book' : 'Write a Review')}
                  </h3>
                  
                  {isAuthenticated ? (
                    userReview && !isEditing ? (
                      <div className="space-y-4">
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                          <p className="text-sm text-muted-foreground mb-2">You have already reviewed this book.</p>
                          <Button variant="outline" className="w-full" onClick={handleEditReview}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Your Review
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Your Rating</label>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                                className="focus:outline-none transition-transform hover:scale-110"
                              >
                                <Star className={`w-7 h-7 ${i < reviewForm.rating ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground/30'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="comment" className="block text-sm font-medium mb-2">Your Review</label>
                          <Textarea 
                            id="comment"
                            placeholder="What did you think of the book?"
                            className="min-h-[100px] resize-none bg-background text-sm"
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1" disabled={isSubmitting} size="sm">
                            {isSubmitting ? 'Submitting...' : (isEditing ? 'Update Review' : 'Post Review')}
                          </Button>
                          {isEditing && (
                            <Button type="button" variant="outline" onClick={handleCancelEdit} size="sm">
                              Cancel
                            </Button>
                          )}
                        </div>
                      </form>
                    )
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground text-sm mb-4">You need to be logged in to write a review.</p>
                      <Button asChild className="w-full" size="sm">
                        <Link to="/login">Log In to Review</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookDetailPage;