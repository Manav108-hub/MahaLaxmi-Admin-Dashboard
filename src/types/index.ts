export interface User {
  id: string;
  name: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  userDetails?: UserDetails;
}

export interface UserDetails {
  id: string;
  userId: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  deliveryStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentMethod: 'COD' | 'ONLINE';
  paymentId?: string;
  shippingAddress: any;
  createdAt: string;
  updatedAt: string;
  user: User;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  revenueByMonth: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { product: string; sales: number }[];
  userGrowth: { month: string; users: number }[];
}
