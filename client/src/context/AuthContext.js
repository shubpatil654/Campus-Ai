import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'), // Set as authenticated if token exists
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' });
          const user = await authService.getCurrentUser();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token }
          });
        } catch (error) {
          // If auth check fails, keep the user authenticated but without user data
          // This prevents constant redirects while still allowing access to protected routes
          console.log('Auth check failed, but keeping token:', error.message);
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: null, token }
          });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const { user, token } = await authService.login(credentials);
      localStorage.setItem('token', token);
      localStorage.setItem('lastLoginTime', Date.now().toString());
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
      toast.success('Login successful!');
      
      // Redirect based on user role
      if (user.role === 'super_admin') {
        navigate('/admin');
      } else if (user.role === 'college_admin' || user.role === 'college') {
        // Check if it's first login and redirect to payment
        if (user.first_login && !user.has_paid_subscription) {
          navigate('/college/payment');
        } else {
          navigate('/college/dashboard');
        }
      } else {
        navigate('/');
      }
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message
      });
      toast.error(error.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const { user, token } = await authService.register(userData);
      localStorage.setItem('token', token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message
      });
      toast.error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
    navigate('/');
  };

  const updateProfile = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Profile update failed');
    }
  };

  const uploadProfilePicture = async (imageFile) => {
    try {
      const result = await authService.uploadProfilePicture(imageFile);
      if (result.user) {
        dispatch({
          type: 'UPDATE_USER',
          payload: result.user
        });
      }
      return result;
    } catch (error) {
      toast.error(error.message || 'Profile picture upload failed');
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    uploadProfilePicture,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
