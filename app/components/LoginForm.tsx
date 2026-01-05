'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import client from '@/api/client';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check for demo credentials
    const demoUsers = {
      'juan@example.com': {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'juan@example.com',
        user_metadata: { name: 'Juan dela Cruz' },
        role: 'client'
      },
      'maria@example.com': {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'maria@example.com',
        user_metadata: { name: 'Maria Santos' },
        role: 'client'
      },
      'admin@example.com': {
        id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'admin@example.com',
        user_metadata: { name: 'Admin User' },
        role: 'admin'
      },
      'demo@example.com': {
        id: 'demo-user-id',
        email: 'demo@example.com',
        user_metadata: { name: 'Demo User' },
        role: 'client'
      }
    };

    const demoUser = demoUsers[email as keyof typeof demoUsers];
    if (demoUser && password === 'demo123') {
      // Simulate successful login for demo
      try {
        // Store in localStorage to persist demo session
        localStorage.setItem('demo_user', JSON.stringify(demoUser));

        // Trigger a page reload or state update
        window.location.reload();
        return;
      } catch (err) {
        setError('Demo login failed');
        setLoading(false);
        console.error('Demo login error:', err);
        return;
      }
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        // Login successful, the AuthProvider will handle the state update
        console.log('Login successful', data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
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
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="space-y-2">
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">Try Demo Accounts:</p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail('juan@example.com');
                    setPassword('demo123');
                  }}
                  disabled={loading}
                  className="text-xs"
                >
                  Juan dela Cruz (Client)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail('maria@example.com');
                    setPassword('demo123');
                  }}
                  disabled={loading}
                  className="text-xs"
                >
                  Maria Santos (Client)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail('admin@example.com');
                    setPassword('demo123');
                  }}
                  disabled={loading}
                  className="text-xs"
                >
                  Admin User (Admin)
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Don&quot; have an account? <a href="/signup" className="text-blue-600 hover:underline">Sign up</a></p>
            <p className="mt-2 text-xs">
              <strong>All Demo Accounts:</strong><br />
              Password: demo123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}