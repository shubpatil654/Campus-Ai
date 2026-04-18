import api from './api';

class AuthService {
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user data');
    }
  }

  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  }

  async testUpload(imageFile) {
    try {
      console.log('Testing upload with file:', imageFile);
      const formData = new FormData();
      formData.append('profilePicture', imageFile);
      
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      const response = await api.post('/auth/test-upload', formData, {
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      console.error('Test upload error:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Test upload failed');
    }
  }

  async uploadProfilePicture(imageFile) {
    try {
      console.log('Uploading file:', imageFile);
      const formData = new FormData();
      formData.append('profilePicture', imageFile);
      
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      const response = await api.post('/auth/upload-profile-picture', formData, {
        timeout: 30000, // 30 second timeout for file uploads
      });
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Profile picture upload failed');
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  }

  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  }

  async resetPassword(token, password) {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  }

  async verifyEmail(token) {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Email verification failed');
    }
  }

  async resendVerification() {
    try {
      const response = await api.post('/auth/resend-verification');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to resend verification');
    }
  }
}

export const authService = new AuthService();
