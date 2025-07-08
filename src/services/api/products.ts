import axios from 'axios';
import { Product, Category } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const productsApi = {
  getAllProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get(`/product/${id}`);
    return response.data.data;
  },

  createProduct: async (productData: FormData) => {
    const response = await api.post('/product', productData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateProduct: async (id: string, productData: FormData) => {
    const response = await api.put(`/product/${id}`, productData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data.data;
  },

  createCategory: async (categoryData: { name: string; description?: string }) => {
    const response = await api.post('/category', categoryData);
    return response.data;
  },
};
