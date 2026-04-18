import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { collegeService } from '../services/collegeService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { 
  Heart, 
  Star, 
  MapPin, 
  Users, 
  Award, 
  Eye, 
  UserCheck,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [removingFavorite, setRemovingFavorite] = useState(null);

  // Fetch user favorites
  const { data: favoritesData, isLoading, error, refetch } = useQuery(
    ['userFavorites'],
    () => collegeService.getUserFavorites(),
    {
      enabled: !!user,
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  const favorites = favoritesData?.data || [];

  // Handle remove from favorites
  const handleRemoveFavorite = async (collegeId, collegeName) => {
    setRemovingFavorite(collegeId);
    try {
      await collegeService.removeFromFavorites(collegeId);
      toast.success(`Removed ${collegeName} from favorites`);
      
      // Invalidate and refetch favorites query
      await queryClient.invalidateQueries(['userFavorites']);
      
      // Also invalidate college search query to update favorite status in college cards
      await queryClient.invalidateQueries(['colleges']);
      
    } catch (error) {
      toast.error('Failed to remove from favorites');
    } finally {
      setRemovingFavorite(null);
    }
  };

  // Handle apply now
  const handleApplyNow = (collegeId) => {
    navigate(`/colleges/${collegeId}`);
  };

  // Handle view details
  const handleViewDetails = (collegeId) => {
    navigate(`/colleges/${collegeId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Login Required</h1>
              <p className="text-gray-400 mb-6">Please login to view your favorite colleges</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 font-medium"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="pt-24 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading your favorites...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-red-500/50 rounded-2xl p-8">
              <h1 className="text-2xl font-bold text-white mb-2">Error Loading Favorites</h1>
              <p className="text-gray-400 mb-6">Failed to load your favorite colleges</p>
              <button
                onClick={() => refetch()}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      {/* Header */}
      <div className="pt-24 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Heart className="h-8 w-8 text-yellow-400 fill-current" />
                  My Favorites
                </h1>
                <p className="text-gray-400 mt-1">
                  {favorites.length} {favorites.length === 1 ? 'college' : 'colleges'} saved
                </p>
              </div>
            </div>
          </div>

          {/* Favorites List */}
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12">
                <Heart className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">No Favorites Yet</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Start exploring colleges and add them to your favorites to see them here
                </p>
                <button
                  onClick={() => navigate('/colleges')}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 font-medium"
                >
                  Explore Colleges
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => {
                const college = favorite.colleges;
                if (!college) return null;

                return (
                  <div
                    key={favorite.id}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-yellow-400/10 hover:border-yellow-400/30 hover:scale-[1.02] transition-all duration-300"
                  >
                    {/* College Image */}
                    <div className="relative h-48 bg-gradient-to-br from-yellow-400/20 to-orange-500/20">
                      {college.logo_url ? (
                        <img
                          src={college.logo_url}
                          alt={college.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Award className="h-8 w-8 text-black" />
                          </div>
                        </div>
                      )}
                      
                      {/* Remove from favorites button */}
                      <button
                        onClick={() => handleRemoveFavorite(college.id, college.name)}
                        disabled={removingFavorite === college.id}
                        className="absolute top-3 right-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-full transition-all duration-300 disabled:opacity-50"
                        title="Remove from favorites"
                      >
                        {removingFavorite === college.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* College Info */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                          {college.name}
                        </h3>
                        <div className="flex items-center text-gray-400 text-sm mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="line-clamp-1">{college.location}</span>
                        </div>
                        {college.established_year && (
                          <div className="flex items-center text-gray-400 text-sm">
                            <Users className="h-4 w-4 mr-1" />
                            <span>Est. {college.established_year}</span>
                          </div>
                        )}
                      </div>

                      {/* Rating */}
                      {college.rating > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-yellow-400 font-bold ml-1">
                              {college.rating?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                          <span className="text-gray-400 text-sm">
                            ({college.total_ratings || 0} reviews)
                          </span>
                        </div>
                      )}

                      {/* Description */}
                      {college.description && (
                        <p className="text-gray-300 text-sm line-clamp-3">
                          {college.description}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-gray-700/50">
                        <button
                          onClick={() => handleViewDetails(college.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-all duration-300"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => handleApplyNow(college.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 font-medium"
                        >
                          <UserCheck className="h-4 w-4" />
                          <span>Apply Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
