'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import DatePicker from '@/app/components/ui/date-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import client from '@/api/client';
import useAuth from '@/hooks/useAuth';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

interface CarOption {
  id: string;
  name: string;
  brand: string;
  model: string;
}

export default function InquiryForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    carId: '',
    pickupDate: '',
    returnDate: '',
    pickupLocation: '',
    dropoffLocation: '',
    message: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit an inquiry');
      return;
    }

    setLoading(true);

    try {
      const { error } = await client
        .from('inquiries')
        .insert({
          user_id: (user as User).id,
          car_id: formData.carId || null,
          pickup_date: formData.pickupDate || new Date().toISOString(),
          return_date: formData.returnDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          pickup_location: formData.pickupLocation || 'TBD',
          dropoff_location: formData.dropoffLocation || null,
          message: formData.message,
        });

      if (error) {
        console.error('Inquiry submission error:', error);
        toast.error('Failed to submit inquiry');
        return;
      }

      toast.success('Inquiry submitted successfully! We will get back to you soon.');
      setFormData({
        carId: '',
        pickupDate: '',
        returnDate: '',
        pickupLocation: '',
        dropoffLocation: '',
        message: '',
      });
    } catch (err) {
      console.error('Inquiry submission error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available cars for the select dropdown
  const [cars, setCars] = useState<CarOption[]>([]);

  useEffect(() => {
    const fetchCars = async () => {
      const { data, error } = await client
        .from('cars')
        .select('id, name, brand, model')
        .eq('available', true);

      if (!error && data) {
        setCars(data);
      }
    };

    fetchCars();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Car Inquiry
          </CardTitle>
          <CardDescription>
            Send us a message about your car rental needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="carId">Select Vehicle (Optional)</Label>
              <Select value={formData.carId} onValueChange={(value) => handleChange('carId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a car (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {cars.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.brand} {car.model} - {car.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupDate">Pickup Date</Label>
                <Input
                  id="pickupDate"
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) => handleChange('pickupDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnDate">Return Date</Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => handleChange('returnDate', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Input
                  id="pickupLocation"
                  placeholder="e.g., Manila Airport"
                  value={formData.pickupLocation}
                  onChange={(e) => handleChange('pickupLocation', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoffLocation">Drop-off Location (Optional)</Label>
                <Input
                  id="dropoffLocation"
                  placeholder="e.g., Cebu Airport"
                  value={formData.dropoffLocation}
                  onChange={(e) => handleChange('dropoffLocation', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Tell us about your car rental needs..."
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                rows={6}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !user}
            >
              {loading ? 'Submitting Inquiry...' : 'Submit Inquiry'}
            </Button>

            {!user && (
              <p className="text-sm text-center text-red-600 dark:text-red-400">
                Please log in to submit an inquiry
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}