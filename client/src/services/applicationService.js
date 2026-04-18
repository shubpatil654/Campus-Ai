import api from './api';

class ApplicationService {
  // Get all applications for the college
  async getApplications() {
    try {
      const response = await api.get('/applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch applications');
    }
  }

  // Get application statistics
  async getApplicationStats() {
    try {
      const response = await api.get('/applications/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching application stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch application statistics');
    }
  }

  // Get single application details
  async getApplicationById(applicationId) {
    try {
      const response = await api.get(`/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch application details');
    }
  }

  // Update application status (accept/reject)
  async updateApplicationStatus(applicationId, status, reviewNotes = '') {
    try {
      const response = await api.put(`/applications/${applicationId}/status`, {
        status,
        review_notes: reviewNotes
      });
      return response.data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update application status');
    }
  }

  // Accept application
  async acceptApplication(applicationId, reviewNotes = '') {
    return this.updateApplicationStatus(applicationId, 'accepted', reviewNotes);
  }

  // Reject application
  async rejectApplication(applicationId, reviewNotes = '') {
    return this.updateApplicationStatus(applicationId, 'rejected', reviewNotes);
  }
}

export default new ApplicationService();
