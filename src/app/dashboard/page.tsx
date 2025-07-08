'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { RevenueChart } from '@/components/Charts/RevenueChart';
import { OrderChart } from '@/components/Charts/OrderChart';
import { analyticsApi } from '@/services/api/analytics';
import { Analytics } from '@/types';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsApi.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!analytics) {
    return <div className="flex justify-center items-center h-64">Error loading analytics</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          icon={DollarSign}
        />
        <StatsCard
          title="Total Orders"
          value={analytics.totalOrders}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Total Products"
          value={analytics.totalProducts}
          icon={Package}
        />
        <StatsCard
          title="Total Users"
          value={analytics.totalUsers}
          icon={Users}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RevenueChart data={analytics.revenueByMonth} />
        <OrderChart data={analytics.ordersByStatus} />
      </div>
    </div>
  );
}
