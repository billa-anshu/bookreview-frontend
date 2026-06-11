import axios from 'axios';

// Use your Spring Boot backend URL
const API_BASE_URL =import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========== AUTH ENDPOINTS ==========
export const auth = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
};

// ========== BOOK ENDPOINTS ==========
export const books = {
  getAll: (page = 0, size = 10, sortBy = 'id', direction = 'asc') =>
    api.get(`/books?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`),
  getById: (id) => api.get(`/books/${id}`),
  search: (keyword, page = 0, size = 10) =>
    api.get(`/books/search?keyword=${keyword}&page=${page}&size=${size}`),
  filter: (genre, author, minRating, page = 0, size = 10) => {
    let url = `/books/filter?page=${page}&size=${size}`;
    if (genre) url += `&genre=${genre}`;
    if (author) url += `&author=${author}`;
    if (minRating) url += `&minRating=${minRating}`;
    return api.get(url);
  },
};

// ========== REVIEW ENDPOINTS ==========
export const reviews = {
  getByBookId: (bookId) => api.get(`/reviews?id=${bookId}`),
  getAll: () => api.get('/reviews/all'),        // ADMIN only - all reviews from all users
  getMyReviews: () => api.get('/reviews/my'),   // NEW - gets only current user's reviews
  add: (reviewData) => api.post('/reviews', reviewData),
  update: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

// ========== USER ENDPOINTS ==========
export const users = {
  getAll: () => api.get('/users'),
  getById: (userId) => api.get(`/users/${userId}`),
  getMe: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/me', userData),
  updateRole: (userId, role) => api.put(`/users/${userId}/role?role=${role}`),
  delete: (userId) => api.delete(`/users/${userId}`),
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;