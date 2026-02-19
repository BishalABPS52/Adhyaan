import api from './api';

/**
 * Course Service
 * Handles all course-related API calls
 */

const courseService = {
  // Get all courses with optional filtering
  getAllCourses: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.level) params.append('level', filters.level);
      if (filters.board) params.append('board', filters.board);
      
      const queryString = params.toString();
      const url = `/courses${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get a single course by ID
  getCourseById: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      throw error;
    }
  },

  // Create a new course (admin only)
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/courses', courseData);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  // Update a course (admin only)
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await api.put(`/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      console.error(`Error updating course ${courseId}:`, error);
      throw error;
    }
  },

  // Delete a course (admin only)
  deleteCourse: async (courseId) => {
    try {
      const response = await api.delete(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting course ${courseId}:`, error);
      throw error;
    }
  },

  // Link a book to a course (admin only)
  linkBookToCourse: async (courseId, bookLinkData) => {
    try {
      const response = await api.post(`/courses/${courseId}/books`, bookLinkData);
      return response.data;
    } catch (error) {
      console.error(`Error linking book to course ${courseId}:`, error);
      throw error;
    }
  },

  // Get books for a course
  getCourseBooks: async (courseId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.year) params.append('year', filters.year);
      
      const queryString = params.toString();
      const url = `/courses/${courseId}/books${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching books for course ${courseId}:`, error);
      throw error;
    }
  },

  // Unlink a book from a course (admin only)
  unlinkBookFromCourse: async (courseId, bookId) => {
    try {
      const response = await api.delete(`/courses/${courseId}/books/${bookId}`);
      return response.data;
    } catch (error) {
      console.error(`Error unlinking book from course ${courseId}:`, error);
      throw error;
    }
  },
};

export default courseService;
