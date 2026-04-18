import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/studentService';
import { collegeService } from '../services/collegeService';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  Users, 
  Building2, 
  BookOpen, 
  MessageSquare, 
  TrendingUp, 
  Star, 
  MapPin, 
  Calendar,
  Clock,
  Eye,
  Heart,
  Search,
  FileText,
  Settings,
  Bell,
  ArrowRight,
  Plus,
  Filter
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'dashboard-stats',
    () => studentService.getDashboardStats(),
    { keepPreviousData: true }
  );

  // Fetch recent activity
  const { data: activityData, isLoading: activityLoading } = useQuery(
    'recent-activity',
    () => studentService.getRecentActivity(),
    { keepPreviousData: true }
  );

  // Fetch top colleges
  const { data: topCollegesData, isLoading: collegesLoading } = useQuery(
    'top-colleges',
    () => studentService.getTopColleges(5),
    { keepPreviousData: true }
  );

  // Fetch user's personal stats
  const { data: chatCountData } = useQuery(
    'chat-count',
    () => studentService.getChatHistoryCount(),
    { keepPreviousData: true }
  );

  const { data: collegeViewsData } = useQuery(
    'college-views-count',
    () => studentService.getCollegeViewsCount(),
    { keepPreviousData: true }
  );

  const { data: favoritesData } = useQuery(
    'user-favorites',
    () => studentService.getFavorites(),
    { keepPreviousData: true }
  );

  const { data: profileCompletionData } = useQuery(
    'profile-completion',
    () => studentService.getProfileCompletion(),
    { keepPreviousData: true }
  );

  useEffect(() => {
    if (!statsLoading && !activityLoading && !collegesLoading) {
      setLoading(false);
    }
  }, [statsLoading, activityLoading, collegesLoading]);

  // Prepare stats data
  const stats = [
    { 
      title: 'Colleges Listed', 
      value: statsData?.data?.totalColleges || 0, 
      icon: Building2, 
      change: '+12%', 
      color: 'from-green-500 to-emerald-500' 
    },
    { 
      title: 'Courses Available', 
      value: statsData?.data?.totalCourses || 0, 
      icon: BookOpen, 
      change: '+8%', 
      color: 'from-purple-500 to-pink-500' 
    },
    { 
      title: 'AI Conversations', 
      value: chatCountData?.data?.count || 0, 
      icon: MessageSquare, 
      change: '+25%', 
      color: 'from-orange-500 to-red-500' 
    },
    { 
      title: 'My Favorites', 
      value: statsData?.data?.favoritesCount || 0, 
      icon: Heart, 
      change: '+5%', 
      color: 'from-pink-500 to-rose-500' 
    }
  ];

  const quickActions = [
    { title: 'Search Colleges', icon: Search, link: '/colleges', color: 'from-yellow-400 to-orange-500' },
    { title: 'AI Chat', icon: MessageSquare, link: '/chatbot', color: 'from-blue-400 to-cyan-500' },
    { title: 'My Profile', icon: FileText, link: '/profile', color: 'from-green-400 to-emerald-500' },
    { title: 'Favorites', icon: Heart, link: '/favorites', color: 'from-pink-400 to-rose-500' }
  ];

  const recentActivity = activityData?.data || [];
  const topColleges = topCollegesData?.data || [];

  if (loading) {
    return (
      <div className="w-full relative" style={{ margin: 0, padding: 0 }}>
        <div
          className="fixed inset-0 z-0"
          style={{
            background: "radial-gradient(125% 125% at 50% 90%, #000000 40%, #2b092b 100%)",
          }}
        />
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative" style={{ margin: 0, padding: 0 }}>
      {/* Violet Abyss - Fixed */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #000000 40%, #2b092b 100%)",
        }}
      />
      
      <Navbar />
      
      {/* Content area */}
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user?.name || 'Student'}! 👋
            </h1>
            <p className="text-gray-300">Here's what's happening with your college search journey</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 hover:border-yellow-400/40 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                    <p className="text-green-400 text-sm mt-1 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Quick Actions & Recent Activity */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Quick Actions */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Quick Actions</h2>
                  <Settings className="h-5 w-5 text-gray-400 hover:text-yellow-400 cursor-pointer" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <div key={index} className="group cursor-pointer">
                      <div className={`w-full h-24 rounded-lg bg-gradient-to-r ${action.color} p-4 flex flex-col items-center justify-center text-white hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 transform group-hover:scale-105`}>
                        <action.icon className="h-8 w-8 mb-2" />
                        <span className="text-sm font-medium text-center">{action.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                  <Bell className="h-5 w-5 text-gray-400 hover:text-yellow-400 cursor-pointer" />
                </div>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700/30 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center">
                          {activity.icon === 'MessageSquare' ? (
                            <MessageSquare className="h-5 w-5 text-yellow-400" />
                          ) : (
                            <Heart className="h-5 w-5 text-yellow-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{activity.action}</p>
                          <p className="text-gray-400 text-sm flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {activity.time}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No recent activity</p>
                      <p className="text-gray-500 text-sm">Start exploring colleges to see your activity here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Top Colleges & Notifications */}
            <div className="space-y-8">
              
              {/* Top Rated Colleges */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Top Rated Colleges</h2>
                  <Filter className="h-5 w-5 text-gray-400 hover:text-yellow-400 cursor-pointer" />
                </div>
                <div className="space-y-4">
                  {topColleges.length > 0 ? (
                    topColleges.map((college, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700/30 transition-colors cursor-pointer">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-black" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{college.name}</p>
                          <p className="text-gray-400 text-sm flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {college.location}
                          </p>
                          <div className="flex items-center mt-1">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            <span className="text-yellow-400 text-sm">{college.rating || 'N/A'}</span>
                            <span className="text-gray-400 text-sm ml-2">• {college.totalRatings || 0} reviews</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No colleges available</p>
                      <p className="text-gray-500 text-sm">Check back later for top rated colleges</p>
                    </div>
                  )}
                </div>
                <button className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105">
                  View All Colleges
                </button>
              </div>

              {/* Upcoming Events */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
                  <Calendar className="h-5 w-5 text-gray-400 hover:text-yellow-400 cursor-pointer" />
                </div>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                    <p className="text-white font-medium">College Fair 2025</p>
                    <p className="text-gray-300 text-sm">March 15, 2025 • Belagavi</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <p className="text-white font-medium">Admission Open House</p>
                    <p className="text-gray-300 text-sm">March 20, 2025 • Multiple Colleges</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <p className="text-white font-medium">Career Counseling Session</p>
                    <p className="text-gray-300 text-sm">March 25, 2025 • Online</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Your Stats</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Colleges Viewed</span>
                    <span className="text-white font-bold">{collegeViewsData?.data?.count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Favorites Added</span>
                    <span className="text-white font-bold">{statsData?.data?.favoritesCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">AI Conversations</span>
                    <span className="text-white font-bold">{chatCountData?.data?.count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Profile Completion</span>
                    <span className="text-white font-bold">{profileCompletionData?.data?.completion || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
