import axios from 'axios';
import { Order } from '@/types';

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
      // Handle unauthorized access
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const ordersApi = {
  // Get all orders with optional filters
  getAllOrders: async (params?: {
    status?: Order['deliveryStatus'];
    paymentStatus?: Order['paymentStatus'];
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<Order[]> => {
    try {
      const response = await api.get('/admin/orders', { params });
      console.log('API Response:', response.data); // Debug log
      
      // Based on your JSON response structure, orders are in response.data.orders
      return response.data.orders || [];
    } catch (error) {
      console.error('getAllOrders API error:', error);
      throw error;
    }
  },

  // Get a single order by ID
  getOrderById: async (id: string): Promise<Order> => {
    try {
      const response = await api.get(`/order/${id}`);
      return response.data.order || response.data;
    } catch (error) {
      console.error('getOrderById API error:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (
    id: string, 
    status: { 
      deliveryStatus?: Order['deliveryStatus']; 
      paymentStatus?: Order['paymentStatus']; 
    }
  ): Promise<{ success: boolean; message: string; data: Order }> => {
    try {
      const response = await api.put(`/admin/order/${id}/status`, status);
      return response.data;
    } catch (error) {
      console.error('updateOrderStatus API error:', error);
      throw error;
    }
  },

  // Update order details
  updateOrder: async (id: string, updateData: Partial<Order>): Promise<Order> => {
    try {
      const response = await api.put(`/admin/order/${id}`, updateData);
      return response.data.order || response.data;
    } catch (error) {
      console.error('updateOrder API error:', error);
      throw error;
    }
  },

  // Delete an order
  deleteOrder: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/admin/order/${id}`);
      return response.data;
    } catch (error) {
      console.error('deleteOrder API error:', error);
      throw error;
    }
  },

  // Get payment details for an order
  getPaymentDetails: async (orderId: string): Promise<{
    paymentId: string;
    amount: number;
    status: string;
    method: string;
    transactionId?: string;
    createdAt: string;
  }> => {
    try {
      const response = await api.get(`/order/${orderId}/payments`);
      return response.data.payments || response.data;
    } catch (error) {
      console.error('getPaymentDetails API error:', error);
      throw error;
    }
  },

  // Get order statistics
  getOrderStats: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Array<{ status: string; count: number }>;
    revenueByDay: Array<{ date: string; revenue: number }>;
  }> => {
    try {
      const response = await api.get('/admin/orders/stats', { params });
      return response.data.data || response.data;
    } catch (error) {
      console.error('getOrderStats API error:', error);
      throw error;
    }
  },

  // Bulk update orders
  bulkUpdateOrders: async (
    orderIds: string[], 
    updates: { 
      deliveryStatus?: Order['deliveryStatus']; 
      paymentStatus?: Order['paymentStatus']; 
    }
  ): Promise<{ success: boolean; message: string; updatedCount: number }> => {
    try {
      const response = await api.put('/admin/orders/bulk-update', {
        orderIds,
        updates
      });
      return response.data;
    } catch (error) {
      console.error('bulkUpdateOrders API error:', error);
      throw error;
    }
  },

  // Export orders to CSV
  exportOrders: async (params?: {
    status?: Order['deliveryStatus'];
    startDate?: string;
    endDate?: string;
    format?: 'csv' | 'excel';
  }): Promise<Blob> => {
    try {
      const response = await api.get('/admin/orders/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('exportOrders API error:', error);
      throw error;
    }
  }
};