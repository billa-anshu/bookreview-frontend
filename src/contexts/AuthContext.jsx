import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, users } from '@/services/api';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('Auth Init - Token exists:', !!token);
      console.log('Auth Init - Saved user:', savedUser);
      
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('Restored user from localStorage:', parsedUser);
          setCurrentUser(parsedUser);
        } catch (e) {
          console.error('Error parsing saved user:', e);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  // Check for OAuth callback on mount (for full page redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userId = urlParams.get('userId');
    const name = urlParams.get('name');
    const email = urlParams.get('email');
    const role = urlParams.get('role');
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      console.error('OAuth error:', errorParam);
      toast.error(`Login failed: ${errorParam}`);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    if (token && userId) {
      console.log('OAuth callback detected with token');
      
      // Save to localStorage
      localStorage.setItem('token', token);
      const userData = {
        id: userId,
        name: decodeURIComponent(name || 'User'),
        email: email || '',
        role: role || 'USER'
      };
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set current user
      setCurrentUser(userData);
      
      toast.success(`Welcome ${userData.name}!`);
      
      // Clean URL and redirect to home
      window.location.href = '/';
    }
  }, []);

  const login = async (email, password) => {
    console.log('Login attempt for:', email);
    setLoading(true);
    setError(null);
    try {
      const response = await auth.login({ email, password });
      console.log('Login response:', response.data);
      
      const { token, userId, name, email: userEmail, role } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', token);
      const userData = { id: userId, name, email: userEmail, role };
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentUser(userData);
      
      console.log('Login successful, user set:', userData);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Invalid email or password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    console.log('Register attempt for:', email);
    setLoading(true);
    setError(null);
    try {
      const response = await auth.register({ name, email, password });
      console.log('Register response:', response.data);
      
      const { token, userId, role } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', token);
      const userData = { id: userId, name, email, role };
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentUser(userData);
      
      console.log('Register successful, user set:', userData);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Register error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logout called');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    toast.info('You have been logged out');
  };

  // Update user in state and localStorage
  const updateUser = (updatedData) => {
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('User updated:', updatedUser);
  };

  // Update profile name
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await users.updateProfile(userData);
      if (response.data) {
        updateUser({ name: response.data.name || userData.name });
        toast.success('Profile updated successfully');
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Update failed' };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Update failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (file) => {
    setLoading(true);
    try {
      const response = await users.uploadProfilePicture(file);
      console.log('Upload response:', response.data);
      
      if (response.data && response.data.profilePictureUrl) {
        updateUser({ profilePictureUrl: response.data.profilePictureUrl });
        toast.success('Profile picture updated!');
        return { success: true, url: response.data.profilePictureUrl };
      }
      return { success: false, error: 'Upload failed - no URL returned' };
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.error || 'Upload failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Force refresh user data from backend
  const refreshUser = async () => {
    try {
      const response = await users.getMe();
      if (response?.data) {
        const updatedUser = { ...currentUser, ...response.data };
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('User refreshed:', updatedUser);
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Failed to refresh user' };
    } catch (err) {
      console.error('Error refreshing user:', err);
      return { success: false, error: err.response?.data?.error || 'Refresh failed' };
    }
  };

  const value = {
    currentUser,
    setCurrentUser,  // ← EXPORTING THIS (needed for OAuth callbacks)
    isAuthenticated: !!currentUser,
    userRole: currentUser?.role || null,
    login,
    register,
    logout,
    updateProfile,
    uploadProfilePicture,
    updateUser,
    refreshUser,  // ← NEW: Force refresh user data
    loading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
