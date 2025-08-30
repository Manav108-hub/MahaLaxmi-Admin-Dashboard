import axios from 'axios';
import { User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const usersApi = {
  // Get all users with their details
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      console.log('Users API response:', response.data);
      return response.data.users || response.data.data || response.data || [];
    } catch (error) {
      console.error('getAllUsers API error:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    try {
      const response = await api.get(`/user/${id}`);
      return response.data.user || response.data.data || response.data;
    } catch (error) {
      console.error('getUserById API error:', error);
      throw error;
    }
  },

  // Update user details
  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put(`/user/${id}`, userData);
      return response.data.user || response.data.data || response.data;
    } catch (error) {
      console.error('updateUser API error:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/user/${id}`);
      return response.data;
    } catch (error) {
      console.error('deleteUser API error:', error);
      throw error;
    }
  },

  // Download users CSV
  downloadUsersCSV: async (): Promise<Blob> => {
    try {
      const response = await api.get('/users/download', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('downloadUsersCSV API error:', error);
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async (userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    firstOrderDate: string | null;
    lastOrderDate: string | null;
  }> => {
    try {
      const response = await api.get(`/user/${userId}/stats`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('getUserStats API error:', error);
      throw error;
    }
  }
};