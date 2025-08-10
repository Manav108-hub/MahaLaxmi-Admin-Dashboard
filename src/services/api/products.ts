// Simplified API client without CSRF protection
import axios from 'axios';
import { Product, Category } from '@/types';

const API_BASE_URL = 'http://localhost:5000';

// Main API instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Simple request interceptor (no CSRF)
api.interceptors.request.use((config) => {
  // Just pass through the request as-is
  return config;
});

// Response interceptor for general error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed. Please login again.');
      // You can redirect to login page here if needed
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const productsApi = {
  getAllProducts: async (): Promise<Product[]> => {
    const response = await api.get('/api/products');
    return response.data.data.products;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get(`/api/product/${id}`);
    return response.data.data;
  },

  createProduct: async (productData: FormData) => {
    const response = await api.post('/api/product', productData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateProduct: async (id: string, productData: FormData) => {
    const response = await api.put(`/api/product/${id}`, productData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/api/categories');
    return response.data.data;
  },

  createCategory: async (categoryData: { name: string; description?: string }) => {
    const response = await api.post('/api/category', categoryData);
    return response.data;
  },

  getProductsWithPagination: async (params?: any) => {
    const response = await api.get('/api/products', { params });
    return response.data.data;
  },
};

// Debug function (simplified)
export const debugApiInfo = () => {
  const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  console.log('API Debug Info:', {
    baseURL: API_BASE_URL,
    cookies,
    allCookies: document.cookie,
  });
  
  return { cookies };
};