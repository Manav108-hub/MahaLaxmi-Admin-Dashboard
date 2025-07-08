import axios from 'axios';
import { Order } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const ordersApi = {
  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get('/admin/orders');
    return response.data.data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get(`/order/${id}`);
    return response.data.data;
  },

  updateOrderStatus: async (id: string, status: { deliveryStatus?: string; paymentStatus?: string }) => {
    const response = await api.put(`/admin/order/${id}/status`, status);
    return response.data;
  },

  getPaymentDetails: async (orderId: string) => {
    const response = await api.get(`/order/${orderId}/payments`);
    return response.data.data;
  },
};
