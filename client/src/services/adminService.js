import api from './api';

const adminService = {
  // Get admin dashboard statistics
  async getStats() {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch admin statistics');
    }
  },

  // Get recent activities
  async getActivities() {
    try {
      const response = await api.get('/admin/activities');
      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch recent activities');
    }
  },

  // Get top colleges
  async getTopColleges() {
    try {
      const response = await api.get('/admin/top-colleges');
      return response.data;
    } catch (error) {
      console.error('Error fetching top colleges:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch top colleges');
    }
  },

  // Get all colleges for management
  async getColleges() {
    try {
      const response = await api.get('/admin/colleges');
      return response.data;
    } catch (error) {
      console.error('Error fetching colleges:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch colleges');
    }
  },

  // Get all students for management
  async getStudents() {
    try {
      const response = await api.get('/admin/students');
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch students');
    }
  },

  // Get college requests
  async getCollegeRequests() {
    try {
      const response = await api.get('/admin/college-requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching college requests:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch college requests');
    }
  },

  // Approve college request
  async approveCollegeRequest(requestId) {
    try {
      const response = await api.put(`/admin/college-requests/${requestId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving college request:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve college request');
    }
  },

  // Reject college request
  async rejectCollegeRequest(requestId, reason = '') {
    try {
      const response = await api.put(`/admin/college-requests/${requestId}/reject`, {
        reason: reason
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting college request:', error);
      throw new Error(error.response?.data?.message || 'Failed to reject college request');
    }
  }
};

export default adminService;
