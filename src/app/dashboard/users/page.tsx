'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { usersApi } from '@/services/api/users';
import { ordersApi } from '@/services/api/orders';
import { User, Order } from '@/types';
import { formatDate } from '@/lib/utils';
import { exportToCSV } from '@/services/utils/csv';
import { Download, Users, UserCheck, UserX } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Since we don't have a direct users endpoint, we'll get users from orders
        const ordersData = await ordersApi.getAllOrders();
        setOrders(ordersData);
        
        // Extract unique users from orders
        const uniqueUsers = ordersData.reduce((acc: User[], order) => {
          if (!acc.find(u => u.id === order.user.id)) {
            acc.push(order.user);
          }
          return acc;
        }, []);
        
        setUsers(uniqueUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getUserStats = (userId: string) => {
    const userOrders = orders.filter(order => order.userId === userId);
    const totalSpent = userOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = userOrders.length;
    
    return { totalSpent, totalOrders };
  };

  const handleDownloadCSV = async () => {
    try {
      const blob = await usersApi.downloadUsersCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      // Fallback: create CSV from current data
      const csvData = users.map(user => {
        const stats = getUserStats(user.id);
        return {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.userDetails?.email || '',
          phone: user.userDetails?.phone || '',
          city: user.userDetails?.city || '',
          state: user.userDetails?.state || '',
          isAdmin: user.isAdmin ? 'Yes' : 'No',
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent,
          createdAt: user.createdAt,
        };
      });
      
      exportToCSV(
        csvData,
        ['id', 'name', 'username', 'email', 'phone', 'city', 'state', 'isAdmin', 'totalOrders', 'totalSpent', 'createdAt'],
        'users.csv'
      );
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts and information</p>
        </div>
        <Button onClick={handleDownloadCSV}>
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.isAdmin).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => !u.isAdmin).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => getUserStats(u.id).totalOrders > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const stats = getUserStats(user.id);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.userDetails?.email || 'N/A'}</TableCell>
                    <TableCell>{user.userDetails?.phone || 'N/A'}</TableCell>
                    <TableCell>
                      {user.userDetails?.city && user.userDetails?.state 
                        ? `${user.userDetails.city}, ${user.userDetails.state}`
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </Badge>
                    </TableCell>
                    <TableCell>{stats.totalOrders}</TableCell>
                    <TableCell>${stats.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}