'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import client from '@/api/client';
import { supabase } from '@/lib/supabase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    if (!supabase) {
      setError('Authentication service is not available. Please try again later.');
      return;
    }
    
    setOauthLoading(provider);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: provider === 'google' ? 'email profile openid' : 'email public_profile',
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed. Please try again.`);
        setOauthLoading(null);
      }
    } catch (err) {
      console.error('OAuth exception:', err);
      setError('An unexpected error occurred during OAuth login.');
      setOauthLoading(null);
    }
  };

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
      // Sign in using the API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', result.token);
      // Store user data in localStorage for AuthProvider to pick up
      localStorage.setItem('user', JSON.stringify(result.user));
      // Trigger a page reload or state update
      window.location.reload();
    } catch (err) {
      setError('Connection error. Please check your internet connection.');
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
            
            {/* OAuth Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
            
            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn('google')}
                disabled={oauthLoading !== null}
                className="flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {oauthLoading === 'google' ? 'Connecting...' : 'Google'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn('facebook')}
                disabled={oauthLoading !== null}
                className="flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {oauthLoading === 'facebook' ? 'Connecting...' : 'Facebook'}
              </Button>
            </div>
            
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