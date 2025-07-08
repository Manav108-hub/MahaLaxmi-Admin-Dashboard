'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/services/api/auth';
import { Shield, AlertCircle, CheckCircle, LogOut } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await authApi.isAuthenticated();
        setIsAuthenticated(authStatus);
        if (authStatus) {
          setSuccess('You are already logged in');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Both username and password are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authApi.login({ username, password });
      
      if (response.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        if (response.errors?.length > 0) {
          setError(response.errors.map((err: any) => err.msg).join(', '));
        } else {
          setError(response.message || 'Login failed. Please check your credentials.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
      setIsAuthenticated(false);
      setUsername('');
      setPassword('');
      setSuccess('You have been logged out');
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Admin Dashboard Login
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAuthenticated ? (
            <div className="text-center py-8">
              <div className="mb-4 flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <p className="text-lg mb-6">You are already authenticated</p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {loading ? 'Logging out...' : 'Logout'}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  className="py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {error && (
                <div className="flex items-center p-3 space-x-2 text-red-600 text-sm bg-red-50 rounded-md">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div className="flex items-center p-3 space-x-2 text-green-600 text-sm bg-green-50 rounded-md">
                  <CheckCircle className="h-5 w-5" />
                  <span>{success}</span>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </Button>
            </form>
          )}
          
          <div className="text-center text-sm text-gray-600 mt-4">
            <p>Enter your admin credentials to access the dashboard</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}