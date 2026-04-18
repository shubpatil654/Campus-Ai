import api from './api';

class CollegeDashboardService {
  // Get college dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/college/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }

  // Get college information for dashboard
  async getCollegeInfo() {
    try {
      const response = await api.get('/college/dashboard/info');
      return response.data;
    } catch (error) {
      console.error('Error fetching college info:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch college information');
    }
  }

  // Get recent applications/reviews
  async getRecentApplications(limit = 5) {
    try {
      const response = await api.get(`/college/dashboard/recent-applications?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent applications:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch recent applications');
    }
  }
}

export default new CollegeDashboardService();
