import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ReviewCard from '@/components/ReviewCard.jsx';
import { reviews, books, users } from '@/services/api';
import { User, LogOut, BookOpen, Star, CalendarDays, Edit3, Camera } from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, logout, updateProfile, uploadProfilePicture, updateUser } = useAuth();
  
  const [userReviews, setUserReviews] = useState([]);
  const [bookMap, setBookMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [memberSince, setMemberSince] = useState('');
  
  // Edit profile state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
      loadMemberSince();
      setEditName(currentUser.name || '');
    }
  }, [currentUser]);

  const loadMemberSince = async () => {
    try {
      const response = await users.getMe();
      if (response?.data?.createdAt) {
        const date = new Date(response.data.createdAt);
        setMemberSince(date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }));
      } else {
        setMemberSince('2024');
      }
    } catch (error) {
      console.error('Error loading member since:', error);
      setMemberSince('2024');
    }
  };

  const loadUserData = async () => {
    setLoading(true);
    try {
      const myReviewsResponse = await reviews.getMyReviews();
      const userReviewsData = Array.isArray(myReviewsResponse?.data) ? myReviewsResponse.data : [];
      
      setUserReviews(userReviewsData);
      
      const total = userReviewsData.length;
      const avg = total > 0 
        ? userReviewsData.reduce((acc, curr) => acc + (curr.rating || 0), 0) / total
        : 0;
      setTotalReviews(total);
      setAvgRating(avg);
      
      // Load book details in parallel for better performance
      const bookPromises = userReviewsData
        .filter(review => review.book?.id || review.bookId)
        .map(async (review) => {
          const bookId = review.book?.id || review.bookId;
          try {
            const bookData = await books.getById(bookId);
            return { bookId, book: bookData?.data };
          } catch (err) {
            console.error('Error loading book:', bookId, err);
            return { bookId, book: null };
          }
        });
      
      const bookResults = await Promise.all(bookPromises);
      const bookDetailsMap = {};
      bookResults.forEach(result => {
        if (result.book) {
          bookDetailsMap[result.bookId] = result.book;
        }
      });
      setBookMap(bookDetailsMap);
      
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load your profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    
    const result = await updateProfile({ name: editName });
    if (result.success) {
      setIsEditDialogOpen(false);
    }
  };

  const handleUploadPicture = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    try {
      const result = await uploadProfilePicture(file);
      if (result.success) {
        toast.success('Profile picture updated!');
      }
    } catch (error) {
      toast.error('Failed to upload picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviews.delete(reviewId);
        toast.success('Review deleted successfully');
        await loadUserData();
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error(error.response?.data?.message || 'Failed to delete review');
      }
    }
  };

  const handleEditReview = (reviewId) => {
    const review = userReviews.find(r => r.reviewId === reviewId);
    if (review && (review.book?.id || review.bookId)) {
      const bookId = review.book?.id || review.bookId;
      navigate(`/books/${bookId}`);
    } else {
      toast.info('Go to the book page to edit your review');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const avatarUrl = currentUser.profilePictureUrl 
    ? currentUser.profilePictureUrl
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=d97706&color=fff&size=128`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{currentUser.name || 'User'}'s Profile - Library</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Profile Header */}
          <div className="bg-card border border-border rounded-3xl p-8 md:p-10 mb-12 shadow-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="relative group">
                <img 
                  src={avatarUrl}
                  alt={currentUser.name || 'User'} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-lg"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=d97706&color=fff&size=128`;
                  }}
                />
                <label 
                  htmlFor="profile-picture-input"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-primary text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/80 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </label>
                <input
                  id="profile-picture-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadPicture}
                  disabled={isUploading}
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="text-white text-xs">Uploading...</div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-3 py-1 bg-secondary/15 text-secondary-foreground text-xs font-bold rounded-full mb-3">
                  {currentUser.role || 'USER'}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold font-serif">{currentUser.name || 'User'}</h1>
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Name</Label>
                          <Input
                            id="edit-name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Your name"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleUpdateName}>Save Changes</Button>
                          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-muted-foreground mb-6 flex items-center justify-center md:justify-start gap-2">
                  <User className="h-4 w-4" /> {currentUser.email || 'No email'}
                </p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4 border-t border-border">
                  <div className="flex flex-col">
                    <span className="flex items-center text-sm text-muted-foreground mb-1"><BookOpen className="h-4 w-4 mr-1.5" /> Total Reviews</span>
                    <span className="text-2xl font-bold font-serif">{loading ? '...' : totalReviews}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="flex items-center text-sm text-muted-foreground mb-1"><Star className="h-4 w-4 mr-1.5" /> Avg Rating Given</span>
                    <span className="text-2xl font-bold font-serif">{loading ? '...' : avgRating.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="flex items-center text-sm text-muted-foreground mb-1"><CalendarDays className="h-4 w-4 mr-1.5" /> Member Since</span>
                    <span className="text-xl font-bold font-serif mt-0.5">{memberSince}</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:block">
                <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* User Reviews */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold font-serif">My Reviews</h2>
              <Button asChild variant="ghost" className="text-primary">
                <Link to="/books">Review more books</Link>
              </Button>
            </div>
            
            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                ))}
              </div>
            ) : userReviews.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {userReviews.map(review => {
                  const bookId = review.book?.id || review.bookId;
                  const book = bookMap[bookId] || review.book;
                  
                  return (
                    <ReviewCard 
                      key={review.reviewId} 
                      review={review} 
                      book={book} 
                      showBookInfo={true}
                      currentUser={currentUser}
                      onEdit={() => handleEditReview(review.reviewId)}
                      onDelete={() => handleDeleteReview(review.reviewId)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-2xl font-semibold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground mb-6">You haven't shared your thoughts on any books yet.</p>
                <Button asChild>
                  <Link to="/books">Find a book to review</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="mt-12 md:hidden">
            <Button variant="outline" className="w-full text-destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
