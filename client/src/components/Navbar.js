import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  User,
  ChevronDown,
  Home,
  Search,
  Shield
} from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const navigateToProfile = () => {
    // For college admins, navigate to their college profile instead of student profile
    if (user?.role === 'college_admin') {
      navigate('/college/profile');
    } else {
      navigate('/profile');
    }
    setIsDropdownOpen(false);
  };

  const navigateToHome = () => {
    // For college admins, navigate to their dashboard instead of home
    if (user?.role === 'college_admin') {
      navigate('/college/dashboard');
    } else {
      navigate('/');
    }
    setIsDropdownOpen(false);
  };



  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-orange-500/20 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-black font-bold text-xl">C</span>
            </div>
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              CampusAI
            </span>
          </Link>

                     {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to={user?.role === 'college_admin' ? '/college/dashboard' : '/'}
                className="text-gray-300 hover:text-yellow-400 transition-colors font-medium flex items-center"
              >
                <Home className="h-4 w-4 mr-1" />
                {user?.role === 'college_admin' ? 'Dashboard' : 'Home'}
              </Link>
              {/* Only show search for non-college-admin users */}
              {user?.role !== 'college_admin' && (
                <Link
                  to="/colleges"
                  className="text-gray-300 hover:text-yellow-400 transition-colors font-medium flex items-center"
                >
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Link>
              )}
            </div>
          )}

          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/college-registration"
                  className="text-gray-300 hover:text-yellow-400 transition-colors font-medium"
                >
                  List Your College
                </Link>
                <Link
                  to="/admin-login"
                  className="flex items-center text-gray-300 hover:text-orange-400 transition-colors font-medium"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Link>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-yellow-400 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-black font-bold text-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="font-medium hidden md:block">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-sm border border-yellow-400/20 rounded-2xl shadow-2xl shadow-yellow-400/20 py-2">
                    <div className="px-4 py-3 border-b border-yellow-400/20">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                      <p className="text-xs text-yellow-400 capitalize">{user?.role?.replace('_', ' ')}</p>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={navigateToProfile}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                      >
                        <User className="h-4 w-4 mr-3" />
                        My Profile
                      </button>
                      
                      
                      
                      <button
                        onClick={navigateToHome}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                      >
                        <Home className="h-4 w-4 mr-3" />
                        {user?.role === 'college_admin' ? 'Dashboard' : 'Home'}
                      </button>
                      
                      <div className="border-t border-yellow-400/20 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Links */}
      {isAuthenticated && (
        <div className="md:hidden border-t border-orange-500/20 px-4 py-3">
          <div className="flex space-x-6">
            <Link
              to={user?.role === 'college_admin' ? '/college/dashboard' : '/'}
              className="text-gray-300 hover:text-yellow-400 transition-colors text-sm flex items-center"
            >
              <Home className="h-4 w-4 mr-1" />
              {user?.role === 'college_admin' ? 'Dashboard' : 'Home'}
            </Link>
            {/* Only show search for non-college-admin users */}
            {user?.role !== 'college_admin' && (
              <Link
                to="/colleges"
                className="text-gray-300 hover:text-yellow-400 transition-colors text-sm flex items-center"
              >
                <Search className="h-4 w-4 mr-1" />
                Search
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
