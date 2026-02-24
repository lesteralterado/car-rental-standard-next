'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import client from '@/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, UserCheck, Calendar } from 'lucide-react';
import UsersTable from '@/app/components/admin/UsersTable';
import { toast } from 'react-hot-toast';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  avatar_url: string | null;
}

export default function AdminUsers() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      // Uncomment for production
      // if (!user || !isAdmin) {
      //   router.push('/');
      //   return;
      // }
      fetchUsers();
    }
  }, [user, isAdmin, authLoading, router]);

  const fetchUsers = async () => {
    try {
      // First, get all profiles with client role
      const { data: profiles, error: profileError } = await client
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          role,
          created_at,
          avatar_url
        `)
        .eq('role', 'client');

      if (profileError) throw profileError;

      // Get auth data for each user to get last_sign_in_at
      const usersWithAuth = await Promise.all(
        (profiles || []).map(async (profile) => {
          try {
            const { data: authData } = await client.auth.admin.getUserById(profile.id);
            return {
              ...profile,
              last_sign_in_at: authData?.user?.last_sign_in_at || null,
            };
          } catch (authErr) {
            console.warn(`Could not fetch auth data for user ${profile.id}:`, authErr);
            return {
              ...profile,
              last_sign_in_at: null,
            };
          }
        })
      );

      setUsers(usersWithAuth);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Uncomment for production
  // if (!isAdmin) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-lg text-red-500">Access denied. Admin privileges required.</div>
  //     </div>
  //   );
  // }

  const totalClients = users.length;
  const activeToday = users.filter(u => 
    u.last_sign_in_at && 
    new Date(u.last_sign_in_at).toDateString() === new Date().toDateString()
  ).length;
  const newThisMonth = users.filter(u => {
    const createdDate = new Date(u.created_at);
    const now = new Date();
    return createdDate.getMonth() === now.getMonth() &&
           createdDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">View and manage all registered users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Registered clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeToday}</div>
            <p className="text-xs text-muted-foreground">
              Signed in today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Joined this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Complete list of all registered users on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable users={users} loading={loadingUsers} />
        </CardContent>
      </Card>
    </div>
  );
}
