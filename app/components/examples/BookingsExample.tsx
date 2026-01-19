'use client';

import { useState, useEffect } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Example Bookings Management Component
 * 
 * This component demonstrates how to use the bookings system:
 * - List user's bookings
 * - Create a new booking
 * - Cancel a booking
 * - Check car availability
 * 
 * Copy and modify this for your actual booking UI
 */

export default function BookingsExample() {
  const { 
    bookings, 
    loading, 
    error, 
    createBooking, 
    loadBookings, 
    cancelBooking,
    checkAvailability 
  } = useBookings();

  const [carId, setCarId] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Manila');
  const [totalPrice, setTotalPrice] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load bookings on component mount
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Check availability when dates change
  useEffect(() => {
    const checkAvail = async () => {
      if (!carId || !pickupDate || !returnDate) {
        setIsAvailable(null);
        return;
      }

      const available = await checkAvailability(
        carId,
        new Date(pickupDate),
        new Date(returnDate)
      );
      setIsAvailable(available);
    };

    checkAvail();
  }, [carId, pickupDate, returnDate, checkAvailability]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createBooking({
        car_id: carId,
        pickup_date: new Date(pickupDate).toISOString(),
        return_date: new Date(returnDate).toISOString(),
        pickup_location: pickupLocation,
        total_price: parseFloat(totalPrice),
      });

      // Reset form
      setCarId('');
      setPickupDate('');
      setReturnDate('');
      setTotalPrice('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      await cancelBooking(bookingId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Booking</CardTitle>
            <CardDescription>
              Book a car for your next trip
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBooking} className="space-y-4">
              {/* Car ID Input */}
              <div className="space-y-2">
                <Label htmlFor="carId">Car ID</Label>
                <Input
                  id="carId"
                  placeholder="Enter car UUID"
                  value={carId}
                  onChange={(e) => setCarId(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Get this from the car details page
                </p>
              </div>

              {/* Pickup Date */}
              <div className="space-y-2">
                <Label htmlFor="pickupDate">Pickup Date & Time</Label>
                <Input
                  id="pickupDate"
                  type="datetime-local"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  required
                />
              </div>

              {/* Return Date */}
              <div className="space-y-2">
                <Label htmlFor="returnDate">Return Date & Time</Label>
                <Input
                  id="returnDate"
                  type="datetime-local"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                />
              </div>

              {/* Pickup Location */}
              <div className="space-y-2">
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Input
                  id="pickupLocation"
                  placeholder="e.g., Manila, Cebu, Davao"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  required
                />
              </div>

              {/* Total Price */}
              <div className="space-y-2">
                <Label htmlFor="totalPrice">Total Price (PHP)</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  placeholder="5000"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  required
                />
              </div>

              {/* Availability Status */}
              {isAvailable !== null && (
                <div className={`p-3 rounded text-sm ${
                  isAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isAvailable 
                    ? '✅ Car is available for these dates' 
                    : '❌ Car is not available for these dates'}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || loading || !isAvailable}
                className="w-full"
              >
                {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
              </Button>

              {error && (
                <div className="p-3 rounded bg-red-100 text-red-800 text-sm">
                  {error}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Bookings</CardTitle>
            <CardDescription>
              {bookings.length} active booking{bookings.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-gray-500">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-gray-500">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">Booking #{booking.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          Car ID: {booking.car_id.slice(0, 8)}...
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        <span className="font-medium">Pickup:</span>{' '}
                        {new Date(booking.pickup_date).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Return:</span>{' '}
                        {new Date(booking.return_date).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Location:</span>{' '}
                        {booking.pickup_location}
                      </p>
                      <p>
                        <span className="font-medium">Price:</span> ₱
                        {booking.total_price.toLocaleString()}
                      </p>
                    </div>

                    {booking.status === 'pending' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                        className="w-full"
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
