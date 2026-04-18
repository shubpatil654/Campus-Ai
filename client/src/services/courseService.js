import api from './api';

class CourseService {
  // Get all courses for the college
  async getCourses() {
    try {
      const response = await api.get('/courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch courses');
    }
  }

  // Get a single course by ID
  async getCourseById(courseId) {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch course');
    }
  }

  // Add a new course
  async addCourse(courseData) {
    try {
      const response = await api.post('/courses', courseData);
      return response.data;
    } catch (error) {
      console.error('Error adding course:', error);
      throw new Error(error.response?.data?.message || 'Failed to add course');
    }
  }

  // Update an existing course
  async updateCourse(courseId, courseData) {
    try {
      const response = await api.put(`/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw new Error(error.response?.data?.message || 'Failed to update course');
    }
  }

  // Delete a course
  async deleteCourse(courseId) {
    try {
      const response = await api.delete(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete course');
    }
  }

  // Toggle course active status
  async toggleCourseStatus(courseId) {
    try {
      const response = await api.patch(`/courses/${courseId}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Error toggling course status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update course status');
    }
  }
}

export default new CourseService();
