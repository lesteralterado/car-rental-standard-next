'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

// Get JWT_SECRET at runtime, not module level
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
};

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (!supabase) {
          setStatus('Authentication service not available');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        // Get the session from URL hash (Supabase OAuth callback)
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setStatus('Authentication failed. Redirecting to login...');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        if (data.session) {
          setStatus('Authentication successful! Setting up your account...');
          
          const supabaseUser = data.session.user;
          
          // Create a JWT token for the user so they can access API routes
          const token = jwt.sign(
            { userId: supabaseUser.id, email: supabaseUser.email },
            getJwtSecret(),
            { expiresIn: '7d' }
          );
          
          // Store the token
          localStorage.setItem('token', token);
          
          // Check if profile exists in database, if not create one
          try {
            const profileResponse = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (!profileResponse.ok) {
              // Profile doesn't exist, create one using the service role
              const createProfileResponse = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: supabaseUser.email,
                  // Use OAuth provider info instead of fake password
                  oauth_provider: supabaseUser.app_metadata?.provider || 'unknown',
                  oauthId: supabaseUser.id,
                  full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'OAuth User',
                  isOAuth: true
                }),
              });
              
              if (createProfileResponse.ok) {
                const profileData = await createProfileResponse.json();
                localStorage.setItem('token', profileData.token);
              }
            }
          } catch (profileError) {
            console.error('Error checking/creating profile:', profileError);
          }
          
          // Redirect to home page
          setTimeout(() => router.push('/'), 1000);
        } else {
          // No session found - might be a direct access to callback
          setStatus('No authentication session found. Redirecting to login...');
          setTimeout(() => router.push('/login'), 2000);
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setStatus('An unexpected error occurred. Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700 dark:text-gray-300">{status}</p>
      </div>
    </div>
  );
}
