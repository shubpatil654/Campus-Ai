import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  MessageSquare,
  AlertCircle,
  Star
} from 'lucide-react';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [topColleges, setTopColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, collegesResponse] = await Promise.all([
        adminService.getStats(),
        adminService.getTopColleges()
      ]);

      // Format stats data
      const statsData = [
        {
          name: 'Total Students',
          value: statsResponse.data.totalStudents?.toLocaleString() || '0',
          icon: Users,
          color: 'from-blue-500 to-blue-600'
        },
        {
          name: 'Total Colleges',
          value: statsResponse.data.totalColleges?.toLocaleString() || '0',
          icon: Building2,
          color: 'from-green-500 to-green-600'
        },
        {
          name: 'Pending Requests',
          value: statsResponse.data.pendingRequests?.toLocaleString() || '0',
          icon: AlertCircle,
          color: 'from-orange-500 to-red-500'
        },
        {
          name: 'Chat Sessions',
          value: statsResponse.data.chatSessions?.toLocaleString() || '0',
          icon: MessageSquare,
          color: 'from-purple-500 to-purple-600'
        }
      ];

      setStats(statsData);
      setTopColleges(collegesResponse.data || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-2">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <div>
              <h3 className="text-red-400 font-semibold">Error Loading Dashboard</h3>
              <p className="text-gray-300 mt-1">{error}</p>
              <button 
                onClick={fetchDashboardData}
                className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
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
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.name}</p>
                  <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Colleges */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Top Colleges</h2>
          <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {topColleges.length > 0 ? (
            topColleges.map((college, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{college.name}</p>
                    <p className="text-gray-400 text-sm">{college.totalRatings} ratings</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-white text-sm">{college.rating}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    college.status === 'Verified' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {college.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No colleges found</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;