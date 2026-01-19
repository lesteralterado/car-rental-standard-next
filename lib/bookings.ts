// lib/bookings.ts
import client from '@/api/client';

export interface BookingInput {
  car_id: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  dropoff_location?: string;
  total_price: number;
  drivers_license_verified?: boolean;
}

export interface Booking extends BookingInput {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_intent_id?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new booking
 */
export async function createBooking(booking: BookingInput): Promise<Booking> {
  const { data, error } = await client
    .from('bookings')
    .insert({
      car_id: booking.car_id,
      pickup_date: booking.pickup_date,
      return_date: booking.return_date,
      pickup_location: booking.pickup_location,
      dropoff_location: booking.dropoff_location || null,
      total_price: booking.total_price,
      drivers_license_verified: booking.drivers_license_verified || false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all bookings for the current user
 */
export async function getUserBookings(
  page: number = 1,
  limit: number = 10
): Promise<{ bookings: Booking[]; total: number; pages: number }> {
  const { data: { user }, error: authError } = await client.auth.getUser();
  
  if (authError || !user) throw new Error('Not authenticated');

  const offset = (page - 1) * limit;

  const { data, count, error } = await client
    .from('bookings')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    bookings: data || [],
    total: count || 0,
    pages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get a single booking by ID
 */
export async function getBooking(id: string): Promise<Booking> {
  const { data, error } = await client
    .from('bookings')
    .select()
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update booking status (admin only)
 */
export async function updateBookingStatus(
  id: string,
  status: Booking['status'],
  adminNotes?: string
): Promise<Booking> {
  const { data, error } = await client
    .from('bookings')
    .update({
      status,
      ...(adminNotes && { admin_notes: adminNotes }),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  id: string,
  paymentStatus: Booking['payment_status'],
  paymentIntentId?: string
): Promise<Booking> {
  const { data, error } = await client
    .from('bookings')
    .update({
      payment_status: paymentStatus,
      ...(paymentIntentId && { payment_intent_id: paymentIntentId }),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Cancel a booking
 */
export async function cancelBooking(id: string): Promise<Booking> {
  return updateBookingStatus(id, 'cancelled');
}

/**
 * Check car availability for date range
 */
export async function checkCarAvailability(
  carId: string,
  pickupDate: string,
  returnDate: string
): Promise<boolean> {
  const { data, error } = await client
    .from('bookings')
    .select('id')
    .eq('car_id', carId)
    .neq('status', 'rejected')
    .neq('status', 'cancelled')
    .gte('return_date', pickupDate)
    .lte('pickup_date', returnDate);

  if (error) throw error;
  
  return !data || data.length === 0;
}

/**
 * Calculate total price for a booking
 */
export function calculateTotalPrice(
  pricePerDay: number,
  pickupDate: Date,
  returnDate: Date
): number {
  const days = Math.ceil(
    (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return pricePerDay * Math.max(days, 1);
}

/**
 * Get booking statistics (admin only)
 */
export async function getBookingStats(): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}> {
  const { data, error } = await client
    .from('bookings')
    .select('status');

  if (error) throw error;

  const stats = {
    total: data?.length || 0,
    pending: data?.filter(b => b.status === 'pending').length || 0,
    confirmed: data?.filter(b => b.status === 'confirmed').length || 0,
    completed: data?.filter(b => b.status === 'completed').length || 0,
    cancelled: data?.filter(b => b.status === 'cancelled').length || 0,
  };

  return stats;
}
