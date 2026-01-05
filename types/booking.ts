// types/booking.ts

/**
 * Booking Status Types
 */
export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';

/**
 * Payment Status Types
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/**
 * Booking Interface
 */
export interface Booking {
  id: string;
  user_id: string;
  car_id: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  dropoff_location?: string | null;
  status: BookingStatus;
  total_price: number;
  payment_status: PaymentStatus;
  payment_intent_id?: string | null;
  drivers_license_verified: boolean;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Booking Input (for creating bookings)
 */
export interface BookingInput {
  car_id: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  dropoff_location?: string;
  total_price: number;
  drivers_license_verified?: boolean;
}

/**
 * Booking Filter Options
 */
export interface BookingFilters {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}

/**
 * Booking Response (from API)
 */
export interface BookingResponse {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Booking Statistics
 */
export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  averagePrice: number;
}

/**
 * Booking with Car Details (joined query)
 */
export interface BookingWithCar extends Booking {
  car?: {
    id: string;
    name: string;
    brand: string;
    model: string;
    price_per_day: number;
    images?: string[];
  };
}

/**
 * Booking with User Details (joined query)
 */
export interface BookingWithUser extends Booking {
  user?: {
    id: string;
    full_name: string;
    phone: string;
    email: string;
  };
}

/**
 * Full Booking Details (all related data)
 */
export interface BookingDetails extends BookingWithCar, BookingWithUser {
  notifications?: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
  }>;
}

/**
 * Booking Creation Response
 */
export interface BookingCreationResponse {
  success: boolean;
  booking?: Booking;
  error?: string;
  message?: string;
}

/**
 * Availability Check Result
 */
export interface AvailabilityResult {
  carId: string;
  available: boolean;
  conflictingBookings?: string[];
  message?: string;
}

/**
 * Date Range
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Booking Price Calculation
 */
export interface PriceCalculation {
  days: number;
  pricePerDay: number;
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
}
