import api from './api';

class MediaService {
  // Get all media items for the college
  async getMediaItems() {
    try {
      const response = await api.get('/media');
      return response.data;
    } catch (error) {
      console.error('Error fetching media items:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch media items');
    }
  }

  // Get media items for a specific college
  async getCollegeMedia(collegeId) {
    try {
      const response = await api.get(`/media/college/${collegeId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching college media:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch college media');
    }
  }

  // Upload media item
  async uploadMedia(formData) {
    try {
      const response = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload media');
    }
  }

  // Update media item
  async updateMedia(mediaId, mediaData) {
    try {
      const response = await api.put(`/media/${mediaId}`, mediaData);
      return response.data;
    } catch (error) {
      console.error('Error updating media:', error);
      throw new Error(error.response?.data?.message || 'Failed to update media');
    }
  }

  // Delete media item
  async deleteMedia(mediaId) {
    try {
      const response = await api.delete(`/media/${mediaId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting media:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete media');
    }
  }

  // Toggle media item active status
  async toggleMediaStatus(mediaId) {
    try {
      const response = await api.patch(`/media/${mediaId}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Error toggling media status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update media status');
    }
  }
}

export default new MediaService();

