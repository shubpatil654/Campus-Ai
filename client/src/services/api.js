import axios from 'axios';

// Ensure baseURL always targets the server's /api prefix
const rawBase = process.env.REACT_APP_API_URL;
let resolvedBaseURL = '/api';

if (rawBase) {
  const trimmed = rawBase.replace(/\/$/, '');
  resolvedBaseURL = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const api = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData (file uploads)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      console.log('401 error for URL:', url);
      
      // For admin routes, redirect to admin login instead of regular login
      if (url.includes('/admin')) {
        localStorage.removeItem('token');
        window.location.href = '/admin-login';
        return Promise.reject(error);
      }
      
      // For other protected routes, redirect to regular login
      const isProtectedRoute = 
        url.includes('/favorites') || 
        url.includes('/profile') || 
        url.includes('/college/dashboard') ||
        url.includes('/auth/profile') ||
        url.includes('/auth/upload-profile-picture') ||
        url.includes('/auth/change-password') ||
        url.includes('/favorite');
      
      if (isProtectedRoute) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      // For public routes and auth checks, just pass through the error
    }
    
    return Promise.reject(error);
  }
);

export default api;
