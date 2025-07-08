import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store CSRF token in memory
let csrfToken: string | null = null;

// Request interceptor to add CSRF token to protected requests
api.interceptors.request.use((config) => {
  // Add CSRF token to POST, PUT, DELETE requests
  if (csrfToken && ['post', 'put', 'delete'].includes(config.method?.toLowerCase() || '')) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// Response interceptor to handle CSRF token and errors
api.interceptors.response.use(
  (response) => {
    // Store CSRF token from response
    if (response.data.csrfToken) {
      csrfToken = response.data.csrfToken;
    }
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      csrfToken = null;
      // Redirect to login if on a protected route
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    try {
      const response = await api.post('/login', credentials);
      return {
        success: true,
        user: response.data.user,
        message: response.data.message,
        csrfToken: response.data.csrfToken
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Login failed',
        errors: error.response?.data?.errors || []
      };
    }
  },

  register: async (userData: { 
    name: string; 
    username: string; 
    password: string; 
    adminToken?: string; 
  }) => {
    try {
      const response = await api.post('/register', userData);
      return {
        success: true,
        user: response.data.user,
        message: response.data.message,
        csrfToken: response.data.csrfToken
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Registration failed',
        errors: error.response?.data?.errors || []
      };
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/logout');
      csrfToken = null;
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Logout failed'
      };
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/profile');
      return {
        success: true,
        user: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch profile'
      };
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/refresh-token');
      return {
        success: true,
        csrfToken: response.data.csrfToken
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Token refresh failed'
      };
    }
  },

  // Helper method to get current CSRF token
  getCsrfToken: () => csrfToken,

  // Helper method to check if user is authenticated
  isAuthenticated: async () => {
    try {
      const response = await authApi.getProfile();
      return response.success;
    } catch {
      return false;
    }
  }
};

// Export the configured axios instance for other API calls
export default api;