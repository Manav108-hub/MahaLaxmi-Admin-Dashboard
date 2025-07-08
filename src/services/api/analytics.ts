import axios from 'axios';
import { Analytics } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const analyticsApi = {
  getAnalytics: async (): Promise<Analytics> => {
    // Since your backend doesn't have analytics endpoints, we'll create mock data
    // You can replace this with actual API calls when you implement them
    const [orders, users, products] = await Promise.all([
      api.get('/admin/orders'),
      api.get('/users/download'), // This returns CSV, you'll need a proper users endpoint
      api.get('/products'),
    ]);

    // Process the data to create analytics
    const ordersData = orders.data.data;
    const productsData = products.data.data;

    return {
      totalOrders: ordersData.length,
      totalRevenue: ordersData.reduce((sum: number, order: any) => sum + order.totalAmount, 0),
      totalUsers: 0, // You'll need to implement this
      totalProducts: productsData.length,
      revenueByMonth: processRevenueByMonth(ordersData),
      ordersByStatus: processOrdersByStatus(ordersData),
      topProducts: processTopProducts(ordersData),
      userGrowth: [], // You'll need to implement this
    };
  },
};

function processRevenueByMonth(orders: any[]) {
  const monthlyRevenue: { [key: string]: number } = {};
  
  orders.forEach(order => {
    const month = new Date(order.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.totalAmount;
  });

  return Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }));
}

function processOrdersByStatus(orders: any[]) {
  const statusCount: { [key: string]: number } = {};
  
  orders.forEach(order => {
    statusCount[order.deliveryStatus] = (statusCount[order.deliveryStatus] || 0) + 1;
  });

  return Object.entries(statusCount).map(([status, count]) => ({ status, count }));
}

function processTopProducts(orders: any[]) {
  const productSales: { [key: string]: number } = {};
  
  orders.forEach(order => {
    order.orderItems?.forEach((item: any) => {
      productSales[item.product.name] = (productSales[item.product.name] || 0) + item.quantity;
    });
  });

  return Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([product, sales]) => ({ product, sales }));
}
