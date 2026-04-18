import api from './api';

class StudentService {
  // Get student dashboard stats
  async getDashboardStats() {
    try {
      const response = await api.get('/students/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Get user's recent activity
  async getRecentActivity() {
    try {
      const response = await api.get('/students/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  // Get user's favorites
  async getFavorites() {
    try {
      const response = await api.get('/students/favorites');
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }

  // Get top rated colleges
  async getTopColleges(limit = 5) {
    try {
      const response = await api.get(`/colleges/top-rated?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top colleges:', error);
      throw error;
    }
  }

  // Get user's profile completion percentage
  async getProfileCompletion() {
    try {
      const response = await api.get('/students/profile/completion');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile completion:', error);
      throw error;
    }
  }

  // Get user's chat history count
  async getChatHistoryCount() {
    try {
      const response = await api.get('/students/chat/count');
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history count:', error);
      throw error;
    }
  }

  // Get user's college views count
  async getCollegeViewsCount() {
    try {
      const response = await api.get('/students/college-views/count');
      return response.data;
    } catch (error) {
      console.error('Error fetching college views count:', error);
      throw error;
    }
  }
}

export const studentService = new StudentService();
