'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
 TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ordersApi } from '@/services/api/orders';
import { Order } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { getDeliveryStatusColor, getPaymentStatusColor, DELIVERY_STATUS_LABELS, PAYMENT_STATUS_LABELS, DELIVERY_STATUSES, isValidDeliveryStatus } from '../../../services/utils/statusUtils';
import { Eye, Edit, Package, User, MapPin, Calendar, CreditCard } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError(null);
        setLoading(true);
        
        console.log('Fetching orders...'); // Debug log
        const data = await ordersApi.getAllOrders();
        console.log('Orders received:', data); // Debug log
        
        if (!data) {
          console.warn('No data received from API');
          setOrders([]);
          return;
        }
        
        if (!Array.isArray(data)) {
          console.warn('Data is not an array:', typeof data, data);
          setOrders([]);
          return;
        }
        
        console.log('Setting orders:', data); // Debug log
        setOrders(data);
        
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch orders. Please try again.';
        setError(errorMessage);
        setOrders([]); // Ensure orders is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    console.log('Filtering orders, current orders:', orders); // Debug log
    
    if (!Array.isArray(orders)) {
      console.warn('Orders is not an array in filter:', orders);
      return [];
    }
    
    const filtered = orders.filter(order => {
      if (filter === 'all') return true;
      return order.deliveryStatus?.toLowerCase() === filter;
    });
    
    console.log('Filtered orders:', filtered); // Debug log
    return filtered;
  }, [orders, filter]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!isValidDeliveryStatus(newStatus)) {
      setError('Invalid delivery status');
      return;
    }

    try {
      await ordersApi.updateOrderStatus(orderId, { 
        deliveryStatus: newStatus as Order['deliveryStatus'] 
      });
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, deliveryStatus: newStatus as Order['deliveryStatus'] }
            : order
        )
      );
    } catch (error: any) {
      console.error('Error updating order status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update order status. Please try again.';
      setError(errorMessage);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const orderDetails = await ordersApi.getOrderById(orderId);
      setSelectedOrder(orderDetails);
      setViewDialogOpen(true);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details');
    }
  };

  const handleEditOrder = (orderId: string) => {
    // Navigate to edit page or open edit modal
    console.log('Edit order:', orderId);
    // You can implement navigation here:
    // router.push(`/admin/orders/${orderId}/edit`);
    // Or open an edit modal
    alert(`Edit order ${orderId} - This feature can be implemented based on your needs`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage all customer orders</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            {Object.entries(DELIVERY_STATUSES).map(([key, value]) => (
              <SelectItem key={key} value={value.toLowerCase()}>
                {DELIVERY_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Order List ({filteredOrders.length})
            <span className="text-sm text-gray-500 ml-2">
              (Total: {orders.length}, Filtered: {filteredOrders.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Delivery Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{order.id.slice(-8)}
                  </TableCell>
                  <TableCell>{order.user?.name || 'Unknown'}</TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.deliveryStatus}
                      onValueChange={(value) => handleStatusUpdate(order.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue>
                          <Badge className={getDeliveryStatusColor(order.deliveryStatus)}>
                            {DELIVERY_STATUS_LABELS[order.deliveryStatus]}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DELIVERY_STATUSES).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {DELIVERY_STATUS_LABELS[value]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewOrder(order.id)}
                        title="View Order Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditOrder(order.id)}
                        title="Edit Order"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    {orders.length === 0 ? 'No orders found' : `No orders match the "${filter}" filter`}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Order Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information about order #{selectedOrder?.id.slice(-8)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Order Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Order ID:</strong> #{selectedOrder.id.slice(-8)}</p>
                    <p><strong>Total:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
                    <p><strong>Date:</strong> {formatDateTime(selectedOrder.createdAt)}</p>
                    <div className="flex space-x-2">
                      <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                        {PAYMENT_STATUS_LABELS[selectedOrder.paymentStatus]}
                      </Badge>
                      <Badge className={getDeliveryStatusColor(selectedOrder.deliveryStatus)}>
                        {DELIVERY_STATUS_LABELS[selectedOrder.deliveryStatus]}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Name:</strong> {selectedOrder.user?.name || 'Unknown'}</p>
                    <p><strong>Username:</strong> {selectedOrder.user?.username || 'Unknown'}</p>
                    <p><strong>Email:</strong> {selectedOrder.shippingAddress?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Method:</strong> {selectedOrder.paymentMethod}</p>
                    <p><strong>Status:</strong> {PAYMENT_STATUS_LABELS[selectedOrder.paymentStatus]}</p>
                    {selectedOrder.paymentId && (
                      <p><strong>Payment ID:</strong> {selectedOrder.paymentId}</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Shipping Address */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Name:</strong> {selectedOrder.shippingAddress?.name}</p>
                  <p><strong>Address:</strong> {selectedOrder.shippingAddress?.address}</p>
                  <p><strong>City:</strong> {selectedOrder.shippingAddress?.city}</p>
                  <p><strong>State:</strong> {selectedOrder.shippingAddress?.state}</p>
                  <p><strong>Pincode:</strong> {selectedOrder.shippingAddress?.pincode}</p>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.orderItems?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {item.product?.images?.[0] && (
                                <img 
                                  src={item.product.images[0]} 
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <span>{item.product?.name || 'Product'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Debug info - Remove this in production
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p>Orders length: {orders.length}</p>
            <p>Filtered orders length: {filteredOrders.length}</p>
            <p>Current filter: {filter}</p>
            <p>Orders is array: {Array.isArray(orders) ? 'Yes' : 'No'}</p>
            <p>First order: {orders[0] ? JSON.stringify(orders[0], null, 2) : 'None'}</p>
          </CardContent>
        </Card>
      )} */}
    </div>
  );
}