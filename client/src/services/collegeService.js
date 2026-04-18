import api from './api';

class CollegeService {
  // Get all colleges with optional filtering
  async getAllColleges(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.location) params.append('location', filters.location);
      if (filters.stream) params.append('stream', filters.stream);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.maxFees) params.append('maxFees', filters.maxFees);
      if (filters.minFees) params.append('minFees', filters.minFees);
      if (filters.collegeType) params.append('collegeType', filters.collegeType);
      if (filters.accreditation) params.append('accreditation', filters.accreditation);
      if (filters.facilities) params.append('facilities', filters.facilities);
      if (filters.hasHostel) params.append('hasHostel', filters.hasHostel);
      if (filters.hasScholarship) params.append('hasScholarship', filters.hasScholarship);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await api.get(`/colleges?${params.toString()}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching colleges:', error);
      throw error;
    }
  }

  // Get single college by ID
  async getCollegeById(id) {
    try {
      const response = await api.get(`/colleges/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching college:', error);
      throw error;
    }
  }

  // Search colleges
  async searchColleges(searchTerm) {
    try {
      const response = await api.get(`/colleges/search/${encodeURIComponent(searchTerm)}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error searching colleges:', error);
      throw error;
    }
  }

  // Get colleges by stream
  async getCollegesByStream(stream) {
    try {
      const response = await api.get(`/colleges/stream/${encodeURIComponent(stream)}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching colleges by stream:', error);
      throw error;
    }
  }

  // Get top rated colleges
  async getTopRatedColleges(limit = 10) {
    try {
      const response = await api.get(`/colleges/top-rated?limit=${limit}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching top rated colleges:', error);
      throw error;
    }
  }

  // Add college to favorites
  async addToFavorites(collegeId) {
    try {
      const response = await api.post(`/colleges/${collegeId}/favorite`);
      return response.data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  // Remove college from favorites
  async removeFromFavorites(collegeId) {
    try {
      const response = await api.delete(`/colleges/${collegeId}/favorite`);
      return response.data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  // Get user favorites
  async getUserFavorites() {
    try {
      const response = await api.get('/colleges/favorites');
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }

  // Add college review
  async addReview(collegeId, rating, reviewText) {
    try {
      const response = await api.post(`/colleges/${collegeId}/review`, {
        rating,
        reviewText
      });
      return response.data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  // Get college profile for admin
  async getCollegeProfile() {
    try {
      const response = await api.get('/colleges/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching college profile:', error);
      throw error;
    }
  }

  // Update college profile
  async updateCollegeProfile(profileData) {
    try {
      const response = await api.put('/colleges/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating college profile:', error);
      throw error;
    }
  }
}

export const collegeService = new CollegeService();
