// API Service - Backend Communication Layer

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://adhyaan.onrender.com/api/v1";

export const getApiBaseUrl = () => API_BASE_URL;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    // Debug log
    console.log('API Request:', url);
    
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('adhyaan_token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = 'API request failed';
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        // Handle expired/invalid tokens by clearing local storage and redirecting
        if (response.status === 401 || (errorMessage && errorMessage.toLowerCase().includes('token'))) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('adhyaan_token');
            localStorage.removeItem('adhyaan_user');
            localStorage.removeItem('adhyaan_role');
            
            // Redirect to login if not already on an auth page
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/auth/login') && !currentPath.includes('/auth/register')) {
              // Store current path to redirect back after login
              sessionStorage.setItem('redirectAfterLogin', currentPath);
              window.location.href = `/auth/login?expired=true&message=${encodeURIComponent(errorMessage)}`;
            }
          }
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      
      // Handle network errors
      if (error.message === 'Failed to fetch') {
        throw new Error('Server Connection Failure');
      }
      
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiService = new ApiService();
export default apiService;
