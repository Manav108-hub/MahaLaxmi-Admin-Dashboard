'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RevenueChart } from '@/components/Charts/RevenueChart';
import { OrderChart } from '@/components/Charts/OrderChart';
import { analyticsApi } from '@/services/api/analytics';
import { Analytics } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Detailed analytics and insights</p>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4">
            <RevenueChart data={analytics.revenueByMonth} type="line" />
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Average Order Value</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(analytics.totalRevenue / analytics.totalOrders)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Monthly Growth</p>
                    <p className="text-2xl font-bold text-green-600">+12.5%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4">
            <OrderChart data={analytics.ordersByStatus} />
            <Card>
              <CardHeader>
                <CardTitle>Order Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.ordersByStatus.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{item.status}</span>
                      <span className="text-2xl font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topProducts.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{item.product}</span>
                    <span className="text-lg font-bold">{item.sales} sold</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{analytics.totalUsers}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">85%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
