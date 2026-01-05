// hooks/useBookings.ts
'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  createBooking,
  getUserBookings,
  cancelBooking,
  checkCarAvailability,
  BookingInput,
  Booking,
} from '@/lib/bookings';

interface UseBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  createBooking: (booking: BookingInput) => Promise<Booking | null>;
  loadBookings: (page?: number, limit?: number) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  checkAvailability: (carId: string, start: Date, end: Date) => Promise<boolean>;
}

export function useBookings(): UseBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getUserBookings(page, limit);
      setBookings(result.bookings);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load bookings';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateBooking = useCallback(async (booking: BookingInput): Promise<Booking | null> => {
    try {
      setLoading(true);
      setError(null);
      const newBooking = await createBooking(booking);
      toast.success('Booking created successfully!');
      await loadBookings();
      return newBooking;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create booking';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadBookings]);

  const handleCancelBooking = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await cancelBooking(id);
      toast.success('Booking cancelled successfully!');
      await loadBookings();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel booking';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [loadBookings]);

  const handleCheckAvailability = useCallback(async (
    carId: string,
    start: Date,
    end: Date
  ): Promise<boolean> => {
    try {
      const available = await checkCarAvailability(
        carId,
        start.toISOString(),
        end.toISOString()
      );
      return available;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check availability';
      setError(message);
      return false;
    }
  }, []);

  return {
    bookings,
    loading,
    error,
    createBooking: handleCreateBooking,
    loadBookings,
    cancelBooking: handleCancelBooking,
    checkAvailability: handleCheckAvailability,
  };
}
