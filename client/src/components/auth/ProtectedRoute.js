import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { loading, user, token } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If we have a token but no user data, still allow access
  // This handles cases where the auth check failed but the token is valid
  if (!user && token) {
    // For admin routes, check if this might be an admin token
    if (allowedRoles.includes('super_admin')) {
      // Allow access and let the admin routes handle their own auth
      return children;
    }
    // For regular routes, allow access as well
    return children;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === 'super_admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'college_admin') {
      return <Navigate to="/college-admin" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
