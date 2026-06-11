import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';

import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import BooksListingPage from '@/pages/BooksListingPage.jsx';
import BookDetailPage from '@/pages/BookDetailPage.jsx';
import SearchResultsPage from '@/pages/SearchResultsPage.jsx';
import FilterPage from '@/pages/FilterPage.jsx';
import ProfilePage from '@/pages/ProfilePage.jsx';

// Simple placeholder for pages not fully built in this sprint
const Placeholder = ({ title }) => <div className="p-8 text-center text-2xl mt-20">{title}</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/books" element={<BooksListingPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/filter" element={<FilterPage />} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Placeholder title="404 Not Found" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
