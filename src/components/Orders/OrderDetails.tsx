'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';
import { formatDate } from '@/lib/utils';
import { X } from 'lucide-react';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export default function OrderDetails({ order, onClose, onUpdateStatus }: OrderDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Order Details - {order.id}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Customer Information</h3>
              <p>{order.user.name}</p>
              <p>{order.user.userDetails?.email}</p>
              <p>{order.user.userDetails?.phone}</p>
            </div>
            <div>
              <h3 className="font-semibold">Order Information</h3>
              <p>Date: {formatDate(order.createdAt)}</p>
              <p>Status: <Badge className={getStatusColor(order.status)}>{order.status}</Badge></p>
              <p>Total: ${order.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <p>{order.user.userDetails?.address || 'N/A'}</p>
            <p>{order.user.userDetails?.city}, {order.user.userDetails?.state}</p>
            <p>{order.user.userDetails?.zipcode}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{item.product.title}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus(order.id, 'processing')}
              disabled={order.status === 'processing'}
            >
              Mark Processing
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus(order.id, 'shipped')}
              disabled={order.status === 'shipped' || order.status === 'delivered'}
            >
              Mark Shipped
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus(order.id, 'delivered')}
              disabled={order.status === 'delivered'}
            >
              Mark Delivered
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );