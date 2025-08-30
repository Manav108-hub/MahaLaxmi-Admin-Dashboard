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
import { User } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { exportToCSV } from '@/services/utils/csv';
import { Download, Users, UserCheck, UserX, Search, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Extended User interface for component use
interface ExtendedUser extends User {
  totalOrders?: number;
  totalSpent?: number;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<ExtendedUser[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setError(null);
        setLoading(true);
        
        console.log('Fetching all users...'); // Debug log
        const data = await usersApi.getAllUsers();
        console.log('Users received:', data); // Debug log
        
        if (!Array.isArray(data)) {
          console.warn('Users data is not an array:', typeof data, data);
          setUsers([]);
          return;
        }
        
        setUsers(data);
        setFilteredUsers(data);
        
      } catch (error: any) {
        console.error('Error fetching users:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users. Please try again.';
        setError(errorMessage);
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm))
    );
    
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

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
      const csvData = filteredUsers.map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        state: user.state || '',
        isAdmin: user.isAdmin ? 'Yes' : 'No',
        totalOrders: user.totalOrders || 0,
        totalSpent: user.totalSpent || 0,
        createdAt: user.createdAt,
      }));
      
      exportToCSV(
        csvData,
        ['id', 'name', 'username', 'email', 'phone', 'city', 'state', 'isAdmin', 'totalOrders', 'totalSpent', 'createdAt'],
        'users.csv'
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await usersApi.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      setFilteredUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
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

  const regularUsers = users.filter(u => !u.isAdmin);
  const adminUsers = users.filter(u => u.isAdmin);
  const usersWithOrders = users.filter(u => (u.totalOrders || 0) > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts and information</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={handleDownloadCSV}>
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredUsers.length !== users.length && `${filteredUsers.length} filtered`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {adminUsers.length}
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
              {regularUsers.length}
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
              {usersWithOrders.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            User List ({filteredUsers.length})
            {searchTerm && (
              <span className="text-sm text-gray-500 ml-2">
                - searching for "{searchTerm}"
              </span>
            )}
          </CardTitle>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  <TableCell>
                    {user.city && user.state 
                      ? `${user.city}, ${user.state}`
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.totalOrders || 0}</TableCell>
                  <TableCell>{formatCurrency(user.totalSpent || 0)}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Navigate to user edit page or open edit modal
                          console.log('Edit user:', user.id);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!user.isAdmin && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Debug info - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p>Total users: {users.length}</p>
            <p>Filtered users: {filteredUsers.length}</p>
            <p>Admin users: {adminUsers.length}</p>
            <p>Regular users: {regularUsers.length}</p>
            <p>Users with orders: {usersWithOrders.length}</p>
            <p>Search term: "{searchTerm}"</p>
            <p>Users is array: {Array.isArray(users) ? 'Yes' : 'No'}</p>
            {users.length > 0 && (
              <details className="mt-2">
                <summary>First user data:</summary>
                <pre className="mt-1 text-xs bg-gray-100 p-2 rounded">
                  {JSON.stringify(users[0], null, 2)}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}