import apiService from './api';

export const authService = {
  async login(credentials) {
    const response = await apiService.post('/auth/login', credentials);
    // Backend returns { user, token }
    if (response.token) {
      localStorage.setItem('adhyaan_token', response.token.access_token);
      localStorage.setItem('adhyaan_user', JSON.stringify(response.user));
    }
    return response;
  },

  async register(userData) {
    const response = await apiService.post('/auth/register', userData);
    // Backend returns { user, token }
    if (response.token) {
      localStorage.setItem('adhyaan_token', response.token.access_token);
      localStorage.setItem('adhyaan_user', JSON.stringify(response.user));
    }
    return response;
  },

  async logout() {
    localStorage.removeItem('adhyaan_token');
    localStorage.removeItem('adhyaan_user');
    localStorage.removeItem('adhyaan_role');
    try {
      return await apiService.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
      console.log('Logout completed');
    }
  },

  async resetPassword(email) {
    return await apiService.post('/auth/reset-password', { email });
  },

  async getCurrentUser() {
    return await apiService.get('/auth/me');
  },
};
