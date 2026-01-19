'use client';

import { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import client from '@/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminRoute from '@/app/components/AdminRoute';

interface Booking {
  id: string;
  customer_id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  pickup_location: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  total_price: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  drivers_license_verified: boolean;
  created_at: string;
}

export default function AdminBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    console.log('User in admin bookings:', user);
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    console.log('Starting fetch bookings');
    try {
      const { data, error } = await client
        .from('bookings')
        .select(`*`);

      if (error) throw error;
      console.log('Fetched bookings data:', data);
      setBookings(data || []);
      console.log('Pending bookings count:', data?.filter(b => b.status === 'pending').length || 0);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'rejected') => {
    try {
      const { error } = await client
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      // Refresh bookings
      fetchBookings();
      toast.success(`Booking ${status} successfully`);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AdminRoute>
      <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600 mt-2">Review and manage customer bookings</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>Manage booking requests and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="pending">
                    Pending ({bookings.filter(b => b.status === 'pending').length})
                  </TabsTrigger>
                  <TabsTrigger value="confirmed">
                    Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    Rejected ({bookings.filter(b => b.status === 'rejected').length})
                  </TabsTrigger>
                  <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4 mt-6">
                  {loadingBookings ? (
                    <div className="text-center py-8">Loading bookings...</div>
                  ) : (
                    bookings
                      .filter(booking => booking.status === 'pending')
                      .map(booking => (
                        <div key={booking.id} className="border rounded-lg p-4 bg-white">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold">Car ID: {booking.car_id}</h3>
                              <p className="text-sm text-gray-600">Customer ID: {booking.customer_id}</p>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                            <div>
                              <span className="font-medium">Pickup:</span>
                              <p>{new Date(booking.start_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="font-medium">Return:</span>
                              <p>{new Date(booking.end_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="font-medium">Location:</span>
                              <p>{booking.pickup_location}</p>
                            </div>
                            <div>
                              <span className="font-medium">Total:</span>
                              <p>${booking.total_price}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => updateBookingStatus(booking.id, 'rejected')}
                              variant="destructive"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                  {bookings.filter(b => b.status === 'pending').length === 0 && (
                    <div className="text-center py-8 text-gray-500">No pending bookings</div>
                  )}
                </TabsContent>

                <TabsContent value="confirmed" className="space-y-4 mt-6">
                  {bookings
                    .filter(booking => booking.status === 'confirmed')
                    .map(booking => (
                      <div key={booking.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">Car ID: {booking.car_id}</h3>
                            <p className="text-sm text-gray-600">Customer ID: {booking.customer_id}</p>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                </TabsContent>

                <TabsContent value="rejected" className="space-y-4 mt-6">
                  {bookings
                    .filter(booking => booking.status === 'rejected')
                    .map(booking => (
                      <div key={booking.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">Car ID: {booking.car_id}</h3>
                            <p className="text-sm text-gray-600">Customer ID: {booking.customer_id}</p>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                </TabsContent>

                <TabsContent value="all" className="space-y-4 mt-6">
                  {bookings.map(booking => (
                    <div key={booking.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Car ID: {booking.car_id}</h3>
                          <p className="text-sm text-gray-600">Customer ID: {booking.customer_id}</p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
      </div>
    </AdminRoute>
  );
}