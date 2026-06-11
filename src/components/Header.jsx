import React, { useState, forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BookOpen, Search, User, LogOut, Settings, BookMarked } from 'lucide-react';

const Header = forwardRef(({ searchInputRef }, ref) => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get avatar URL - prioritize profilePictureUrl, then avatar, then fallback
  const avatarUrl = currentUser?.profilePictureUrl || currentUser?.avatar;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md shadow-sm">
      <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
          <BookOpen className="h-7 w-7" />
          <span className="font-serif font-bold text-2xl text-foreground hidden sm:block">Library</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Home</Link>
          <Link to="/books" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Browse Books</Link>
          <Link to="/filter" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Discover</Link>
        </nav>

        <div className="flex-1 max-w-md hidden sm:block mx-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              ref={searchInputRef}
              type="search" 
              placeholder="Search by title, author..." 
              className="pl-9 bg-muted border-transparent focus-visible:bg-background focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full ml-2 p-0">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={currentUser?.name} 
                      className="rounded-full object-cover w-full h-full border border-border shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full rounded-full bg-amber-100 flex items-center justify-center"><svg class="h-5 w-5 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-amber-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-amber-700" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser?.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser?.email || ''}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    <span>View Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile?tab=reviews" className="cursor-pointer flex items-center">
                    <BookMarked className="mr-2 h-5 w-5" />
                    <span>My Reviews</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile?tab=settings" className="cursor-pointer flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-muted-foreground hover:text-primary">
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;