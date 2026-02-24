/**
 * Unit tests for hooks/useBookings.ts
 */
import { renderHook, act } from '@testing-library/react';
import { useBookings } from '../useBookings';

// Mock the bookings library
jest.mock('@/lib/bookings', () => ({
  createBooking: jest.fn(),
  getUserBookings: jest.fn(),
  cancelBooking: jest.fn(),
  checkCarAvailability: jest.fn(),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import * as bookingsLib from '@/lib/bookings';

describe('useBookings Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should create a new booking successfully', async () => {
      const newBooking = {
        id: 'booking-new',
        car_id: 'car-123',
        pickup_date: '2024-01-01',
        return_date: '2024-01-05',
        pickup_location: 'Airport',
        total_price: 200,
      };

      (bookingsLib.createBooking as jest.Mock).mockResolvedValue(newBooking);
      (bookingsLib.getUserBookings as jest.Mock).mockResolvedValue({
        bookings: [newBooking],
        total: 1,
        pages: 1,
      });

      const { result } = renderHook(() => useBookings());

      const bookingInput = {
        car_id: 'car-123',
        pickup_date: '2024-01-01',
        return_date: '2024-01-05',
        pickup_location: 'Airport',
        total_price: 200,
      };

      let created: any;
      await act(async () => {
        created = await result.current.createBooking(bookingInput);
      });

      expect(created).toEqual(newBooking);
      expect(bookingsLib.createBooking).toHaveBeenCalledWith(bookingInput);
    });

    it('should return null on createBooking error', async () => {
      (bookingsLib.createBooking as jest.Mock).mockRejectedValue(
        new Error('Failed to create booking')
      );

      const { result } = renderHook(() => useBookings());

      const bookingInput = {
        car_id: 'car-123',
        pickup_date: '2024-01-01',
        return_date: '2024-01-05',
        pickup_location: 'Airport',
        total_price: 200,
      };

      let created: any;
      await act(async () => {
        created = await result.current.createBooking(bookingInput);
      });

      expect(created).toBeNull();
      expect(result.current.error).toBe('Failed to create booking');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking successfully', async () => {
      (bookingsLib.cancelBooking as jest.Mock).mockResolvedValue({
        id: 'booking-123',
        status: 'cancelled',
      });
      (bookingsLib.getUserBookings as jest.Mock).mockResolvedValue({
        bookings: [],
        total: 0,
        pages: 0,
      });

      const { result } = renderHook(() => useBookings());

      await act(async () => {
        await result.current.cancelBooking('booking-123');
      });

      expect(bookingsLib.cancelBooking).toHaveBeenCalledWith('booking-123');
    });

    it('should handle cancelBooking error', async () => {
      (bookingsLib.cancelBooking as jest.Mock).mockRejectedValue(
        new Error('Failed to cancel booking')
      );

      const { result } = renderHook(() => useBookings());

      await act(async () => {
        await result.current.cancelBooking('booking-123');
      });

      expect(result.current.error).toBe('Failed to cancel booking');
    });
  });

  describe('checkAvailability', () => {
    it('should check car availability successfully', async () => {
      (bookingsLib.checkCarAvailability as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => useBookings());

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-05');

      let isAvailable = false;
      await act(async () => {
        isAvailable = await result.current.checkAvailability('car-123', startDate, endDate);
      });

      expect(isAvailable).toBe(true);
      expect(bookingsLib.checkCarAvailability).toHaveBeenCalledWith(
        'car-123',
        startDate.toISOString(),
        endDate.toISOString()
      );
    });

    it('should return false on availability check error', async () => {
      (bookingsLib.checkCarAvailability as jest.Mock).mockRejectedValue(
        new Error('Failed to check availability')
      );

      const { result } = renderHook(() => useBookings());

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-05');

      let isAvailable = true;
      await act(async () => {
        isAvailable = await result.current.checkAvailability('car-123', startDate, endDate);
      });
      
      expect(isAvailable).toBe(false);
      expect(result.current.error).toBe('Failed to check availability');
    });

    it('should handle unavailable car', async () => {
      (bookingsLib.checkCarAvailability as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useBookings());

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-05');

      let isAvailable = true;
      await act(async () => {
        isAvailable = await result.current.checkAvailability('car-123', startDate, endDate);
      });
      
      expect(isAvailable).toBe(false);
    });
  });

  describe('loadBookings', () => {
    it('should load user bookings successfully', async () => {
      const mockBookings = [
        { id: 'booking-1', car_id: 'car-1', status: 'pending' },
        { id: 'booking-2', car_id: 'car-2', status: 'confirmed' },
      ];

      (bookingsLib.getUserBookings as jest.Mock).mockResolvedValue({
        bookings: mockBookings,
        total: 2,
        pages: 1,
      });

      const { result } = renderHook(() => useBookings());

      await act(async () => {
        await result.current.loadBookings(1, 10);
      });

      expect(result.current.bookings).toEqual(mockBookings);
      expect(result.current.loading).toBe(false);
    });

    it('should handle loadBookings error', async () => {
      (bookingsLib.getUserBookings as jest.Mock).mockRejectedValue(
        new Error('Failed to load bookings')
      );

      const { result } = renderHook(() => useBookings());

      await act(async () => {
        await result.current.loadBookings();
      });

      expect(result.current.error).toBe('Failed to load bookings');
      expect(result.current.bookings).toEqual([]);
    });

    it('should call getUserBookings with correct pagination', async () => {
      (bookingsLib.getUserBookings as jest.Mock).mockResolvedValue({
        bookings: [],
        total: 0,
        pages: 0,
      });

      const { result } = renderHook(() => useBookings());

      await act(async () => {
        await result.current.loadBookings(2, 20);
      });

      expect(bookingsLib.getUserBookings).toHaveBeenCalledWith(2, 20);
    });

    it('should use default pagination values', async () => {
      (bookingsLib.getUserBookings as jest.Mock).mockResolvedValue({
        bookings: [],
        total: 0,
        pages: 0,
      });

      const { result } = renderHook(() => useBookings());

      await act(async () => {
        await result.current.loadBookings();
      });

      expect(bookingsLib.getUserBookings).toHaveBeenCalledWith(1, 10);
    });
  });
});
