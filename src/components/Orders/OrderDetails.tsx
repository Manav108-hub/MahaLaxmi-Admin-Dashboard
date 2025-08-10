'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { X } from 'lucide-react';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export default function OrderDetails({ order, onClose, onUpdateStatus }: OrderDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canUpdateToStatus = (currentStatus: string, targetStatus: string) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus.toLowerCase());
    const targetIndex = statusOrder.indexOf(targetStatus.toLowerCase());
    
    // Can't go backwards (except to cancelled)
    if (targetStatus.toLowerCase() === 'cancelled') return currentStatus.toLowerCase() !== 'delivered';
    if (currentStatus.toLowerCase() === 'cancelled') return false;
    if (currentStatus.toLowerCase() === 'delivered') return false;
    
    return targetIndex > currentIndex;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Order Details - #{order.id.slice(-8)}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Customer Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {order.user.name}</p>
                <p><span className="font-medium">Email:</span> {order.user.userDetails?.email || 'N/A'}</p>
                <p><span className="font-medium">Phone:</span> {order.user.userDetails?.phone || 'N/A'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Order Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Date:</span> {formatDate(order.createdAt)}</p>
                <p><span className="font-medium">Delivery Status:</span> 
                  <Badge className={`ml-2 ${getStatusColor(order.deliveryStatus)}`}>
                    {order.deliveryStatus.replace('_', ' ')}
                  </Badge>
                </p>
                <p><span className="font-medium">Payment Status:</span> 
                  <Badge className={`ml-2 ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </Badge>
                </p>
                <p><span className="font-medium">Payment Method:</span> {order.paymentMethod}</p>
                <p><span className="font-medium">Total:</span> {formatCurrency(order.totalAmount)}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Shipping Address</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p>{order.user.userDetails?.address || 'N/A'}</p>
              <p>{order.user.userDetails?.city ? `${order.user.userDetails.city}, ` : ''}{order.user.userDetails?.state || ''}</p>
              <p>{order.user.userDetails?.pincode || ''}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.orderItems?.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Unit Price: {formatCurrency(item.product.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 italic">No items found</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Update Order Status</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(order.id, 'CONFIRMED')}
                disabled={!canUpdateToStatus(order.deliveryStatus, 'confirmed')}
              >
                Mark Confirmed
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(order.id, 'PROCESSING')}
                disabled={!canUpdateToStatus(order.deliveryStatus, 'processing')}
              >
                Mark Processing
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(order.id, 'SHIPPED')}
                disabled={!canUpdateToStatus(order.deliveryStatus, 'shipped')}
              >
                Mark Shipped
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                disabled={!canUpdateToStatus(order.deliveryStatus, 'out_for_delivery')}
              >
                Out for Delivery
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
                disabled={!canUpdateToStatus(order.deliveryStatus, 'delivered')}
              >
                Mark Delivered
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                disabled={!canUpdateToStatus(order.deliveryStatus, 'cancelled')}
              >
                Cancel Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}