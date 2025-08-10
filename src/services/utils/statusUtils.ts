import { Order } from '@/types';

// Define type-safe status enums
export const DELIVERY_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED',
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export const PAYMENT_METHODS = {
  COD: 'COD',
  ONLINE: 'ONLINE',
} as const;

// Create type aliases for better readability
export type DeliveryStatus = keyof typeof DELIVERY_STATUSES;
export type PaymentStatus = keyof typeof PAYMENT_STATUSES;
export type PaymentMethod = keyof typeof PAYMENT_METHODS;

// Status display labels with proper typing
export const DELIVERY_STATUS_LABELS: Record<typeof DELIVERY_STATUSES[keyof typeof DELIVERY_STATUSES], string> = {
  [DELIVERY_STATUSES.PENDING]: 'Pending',
  [DELIVERY_STATUSES.CONFIRMED]: 'Confirmed',
  [DELIVERY_STATUSES.PROCESSING]: 'Processing',
  [DELIVERY_STATUSES.SHIPPED]: 'Shipped',
  [DELIVERY_STATUSES.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [DELIVERY_STATUSES.DELIVERED]: 'Delivered',
  [DELIVERY_STATUSES.CANCELLED]: 'Cancelled',
  [DELIVERY_STATUSES.RETURNED]: 'Returned',
};

export const PAYMENT_STATUS_LABELS: Record<typeof PAYMENT_STATUSES[keyof typeof PAYMENT_STATUSES], string> = {
  [PAYMENT_STATUSES.PENDING]: 'Pending',
  [PAYMENT_STATUSES.PAID]: 'Paid',
  [PAYMENT_STATUSES.FAILED]: 'Failed',
  [PAYMENT_STATUSES.REFUNDED]: 'Refunded',
};

// Status color mappings with exhaustive type checking
export const getDeliveryStatusColor = (status: typeof DELIVERY_STATUSES[keyof typeof DELIVERY_STATUSES]): string => {
  switch (status) {
    case DELIVERY_STATUSES.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case DELIVERY_STATUSES.CONFIRMED:
      return 'bg-blue-100 text-blue-800';
    case DELIVERY_STATUSES.PROCESSING:
      return 'bg-purple-100 text-purple-800';
    case DELIVERY_STATUSES.SHIPPED:
      return 'bg-indigo-100 text-indigo-800';
    case DELIVERY_STATUSES.OUT_FOR_DELIVERY:
      return 'bg-orange-100 text-orange-800';
    case DELIVERY_STATUSES.DELIVERED:
      return 'bg-green-100 text-green-800';
    case DELIVERY_STATUSES.CANCELLED:
      return 'bg-red-100 text-red-800';
    case DELIVERY_STATUSES.RETURNED:
      return 'bg-gray-100 text-gray-800';
    default:
      // Ensures exhaustive check - will cause type error if any case is missing
      const _exhaustiveCheck: never = status;
      return _exhaustiveCheck;
  }
};

export const getPaymentStatusColor = (status: typeof PAYMENT_STATUSES[keyof typeof PAYMENT_STATUSES]): string => {
  switch (status) {
    case PAYMENT_STATUSES.PAID:
      return 'bg-green-100 text-green-800';
    case PAYMENT_STATUSES.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case PAYMENT_STATUSES.FAILED:
      return 'bg-red-100 text-red-800';
    case PAYMENT_STATUSES.REFUNDED:
      return 'bg-gray-100 text-gray-800';
    default:
      const _exhaustiveCheck: never = status;
      return _exhaustiveCheck;
  }
};

// Status progression logic with proper typing
export const canUpdateDeliveryStatus = (
  currentStatus: typeof DELIVERY_STATUSES[keyof typeof DELIVERY_STATUSES],
  targetStatus: typeof DELIVERY_STATUSES[keyof typeof DELIVERY_STATUSES]
): boolean => {
  const statusOrder = [
    DELIVERY_STATUSES.PENDING,
    DELIVERY_STATUSES.CONFIRMED,
    DELIVERY_STATUSES.PROCESSING,
    DELIVERY_STATUSES.SHIPPED,
    DELIVERY_STATUSES.OUT_FOR_DELIVERY,
    DELIVERY_STATUSES.DELIVERED,
    DELIVERY_STATUSES.CANCELLED,
    DELIVERY_STATUSES.RETURNED,
  ] as const;

  const currentIndex = statusOrder.indexOf(currentStatus);
  const targetIndex = statusOrder.indexOf(targetStatus);

  // Special cases
  if (targetStatus === DELIVERY_STATUSES.CANCELLED) {
    return currentStatus !== DELIVERY_STATUSES.DELIVERED && 
           currentStatus !== DELIVERY_STATUSES.RETURNED;
  }

  if (targetStatus === DELIVERY_STATUSES.RETURNED) {
    return currentStatus === DELIVERY_STATUSES.DELIVERED;
  }

  if (currentStatus === DELIVERY_STATUSES.CANCELLED || 
      currentStatus === DELIVERY_STATUSES.RETURNED) {
    return false;
  }

  if (currentStatus === DELIVERY_STATUSES.DELIVERED) {
    return targetStatus === DELIVERY_STATUSES.RETURNED;
  }

  // Normal progression - can only move forward
  return targetIndex > currentIndex;
};

// Get available next statuses with proper typing
export const getAvailableDeliveryStatuses = (
  currentStatus: typeof DELIVERY_STATUSES[keyof typeof DELIVERY_STATUSES]
): Array<typeof DELIVERY_STATUSES[keyof typeof DELIVERY_STATUSES]> => {
  return Object.values(DELIVERY_STATUSES).filter(status => 
    status !== currentStatus && canUpdateDeliveryStatus(currentStatus, status)
  ) as Array<typeof DELIVERY_STATUSES[keyof typeof DELIVERY_STATUSES]>;
};

// Type guards with proper typing
export const isValidDeliveryStatus = (status: string): status is typeof DELIVERY_STATUSES[keyof typeof DELIVERY_STATUSES] => {
  return Object.values(DELIVERY_STATUSES).includes(status as any);
};

export const isValidPaymentStatus = (status: string): status is typeof PAYMENT_STATUSES[keyof typeof PAYMENT_STATUSES] => {
  return Object.values(PAYMENT_STATUSES).includes(status as any);
};

export const isValidPaymentMethod = (method: string): method is typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS] => {
  return Object.values(PAYMENT_METHODS).includes(method as any);
};

// Status sorting with proper typing
export const sortOrdersByStatus = (orders: Order[]): Order[] => {
  const statusPriority: Record<typeof DELIVERY_STATUSES[keyof typeof DELIVERY_STATUSES], number> = {
    [DELIVERY_STATUSES.PENDING]: 1,
    [DELIVERY_STATUSES.CONFIRMED]: 2,
    [DELIVERY_STATUSES.PROCESSING]: 3,
    [DELIVERY_STATUSES.SHIPPED]: 4,
    [DELIVERY_STATUSES.OUT_FOR_DELIVERY]: 5,
    [DELIVERY_STATUSES.DELIVERED]: 6,
    [DELIVERY_STATUSES.CANCELLED]: 7,
    [DELIVERY_STATUSES.RETURNED]: 8,
  };

  return [...orders].sort((a, b) => {
    const aPriority = statusPriority[a.deliveryStatus] || 999;
    const bPriority = statusPriority[b.deliveryStatus] || 999;
    return aPriority - bPriority;
  });
};

// Status statistics with proper typing
export const getStatusCounts = (orders: Order[]): Record<typeof DELIVERY_STATUSES[keyof typeof DELIVERY_STATUSES], number> => {
  const counts = {} as Record<typeof DELIVERY_STATUSES[keyof typeof DELIVERY_STATUSES], number>;
  
  // Initialize all possible statuses to 0
  Object.values(DELIVERY_STATUSES).forEach(status => {
    counts[status] = 0;
  });

  orders.forEach(order => {
    counts[order.deliveryStatus] = (counts[order.deliveryStatus] || 0) + 1;
  });

  return counts;
};

// Export all status values as arrays for easy iteration
export const ALL_DELIVERY_STATUSES = Object.values(DELIVERY_STATUSES);
export const ALL_PAYMENT_STATUSES = Object.values(PAYMENT_STATUSES);
export const ALL_PAYMENT_METHODS = Object.values(PAYMENT_METHODS);