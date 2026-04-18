import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  BookOpen, 
  TrendingUp, 
  Settings, 
  Plus,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Star,
  GraduationCap
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import collegeDashboardService from '../../services/collegeDashboardService';
import applicationService from '../../services/applicationService';

const CollegeAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalApplications: 0
  });
  const [collegeInfo, setCollegeInfo] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all dashboard data in parallel
      const [statsResponse, infoResponse, applicationsResponse] = await Promise.all([
        collegeDashboardService.getDashboardStats(),
        collegeDashboardService.getCollegeInfo(),
        collegeDashboardService.getRecentApplications(3)
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (infoResponse.success) {
        setCollegeInfo(infoResponse.data);
      }

      if (applicationsResponse.success) {
        setRecentApplications(applicationsResponse.data);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="h-16" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.name || 'College Admin'}
              </h1>
              <p className="text-gray-400">
                {collegeInfo ? `Managing ${collegeInfo.name}` : 'Manage your college profile, courses, and student applications'}
              </p>
              {collegeInfo && (
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{collegeInfo.city}, {collegeInfo.state}</span>
                  </div>
                  {collegeInfo.established_year && (
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Est. {collegeInfo.established_year}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">College</p>
                <p className="text-white font-medium">{collegeInfo?.name || user?.name}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Courses</p>
                <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">New Applications</p>
                <p className="text-2xl font-bold text-white">{stats.totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* College Profile */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">College Profile</h3>
              <Settings className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-2 flex-grow">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300 text-sm">Update information</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300 text-sm">Location details</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/college/profile')}
              className="mt-4 w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-medium py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 text-sm"
            >
              Manage Profile
            </button>
          </div>

          {/* Course Management */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Course Management</h3>
              <BookOpen className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-2 flex-grow">
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300 text-sm">Add courses</span>
              </div>
              <div className="flex items-center space-x-2">
                <Edit3 className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300 text-sm">Edit courses</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/college/courses')}
              className="mt-4 w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-medium py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 text-sm"
            >
              Manage Courses
            </button>
          </div>


          {/* Manage Media */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Manage Media</h3>
              <Settings className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-2 flex-grow">
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300 text-sm">Upload images</span>
              </div>
              <div className="flex items-center space-x-2">
                <Edit3 className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300 text-sm">Gallery management</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/college/manage-media')}
              className="mt-4 w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-medium py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 text-sm"
            >
              Manage Media
            </button>
          </div>

          {/* View Applications */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">View Applications</h3>
              <Eye className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-2 flex-grow">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300 text-sm">Student applications</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300 text-sm">Reviews & ratings</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/college/view-applications')}
              className="mt-4 w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-medium py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 text-sm"
            >
              View Applications
            </button>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Applications</h3>
            <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentApplications.length > 0 ? (
              recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{application.studentName}</p>
                      <p className="text-gray-400 text-sm">{application.course}</p>
                      {application.rating && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-yellow-400 text-xs">{application.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                    <button className="text-yellow-400 hover:text-yellow-300">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No recent applications found</p>
                <p className="text-gray-500 text-sm">Applications will appear here when students apply</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeAdminDashboard;