'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { productsApi } from '@/services/api/products';

interface ProductChartProps {
  type?: 'bar' | 'pie';
  period?: 'week' | 'month' | 'year';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ProductChart({ type = 'bar', period = 'month' }: ProductChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData = await productsApi.getProductAnalytics(period);
        setData(productData);
      } catch (error) {
        console.error('Error fetching product analytics:', error);
        // Fallback mock data
        setData([
          { name: 'Electronics', sales: 1200, stock: 45, value: 45000 },
          { name: 'Clothing', sales: 800, stock: 120, value: 32000 },
          { name: 'Books', sales: 600, stock: 200, value: 18000 },
          { name: 'Home & Garden', sales: 950, stock: 75, value: 28500 },
          { name: 'Sports', sales: 400, stock: 60, value: 16000 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, type]);

  if (loading) {
    return <div className="h-80 flex items-center justify-center">Loading...</div>;
  }

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="sales"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="sales" fill="#8884d8" name="Sales" />
        <Bar dataKey="stock" fill="#82ca9d" name="Stock" />
      </BarChart>
    </ResponsiveContainer>
  );
}