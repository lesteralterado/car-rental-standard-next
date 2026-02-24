import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to calculate price with peak season
function calculatePeakSeasonPrice(
    basePrice: number,
    startDate: string,
    endDate: string,
    peakSeasons: Array<{ start_date: string; end_date: string; price_multiplier: number }>
): { totalPrice: number; peakSurcharge: number; appliedMultiplier: number } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    let totalPrice = 0;
    let peakSurcharge = 0;
    let appliedMultiplier = 1.0;

    for (let i = 0; i < days; i++) {
        const currentDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        let dayMultiplier = 1.0;

        for (const season of peakSeasons) {
            const seasonStart = new Date(season.start_date);
            const seasonEnd = new Date(season.end_date);
            if (currentDate >= seasonStart && currentDate <= seasonEnd) {
                dayMultiplier = season.price_multiplier;
                break;
            }
        }

        totalPrice += basePrice * dayMultiplier;
        if (dayMultiplier > 1.0) {
            peakSurcharge += basePrice * (dayMultiplier - 1.0);
        }
        appliedMultiplier = Math.max(appliedMultiplier, dayMultiplier);
    }

    return { totalPrice, peakSurcharge, appliedMultiplier };
}

// GET /api/bookings/availability - Check car availability and calculate price
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const carId = searchParams.get('car_id');
        const pickupDate = searchParams.get('pickup_date');
        const returnDate = searchParams.get('return_date');

        if (!carId || !pickupDate || !returnDate) {
            return NextResponse.json(
                { error: 'car_id, pickup_date, and return_date are required' },
                { status: 400 }
            );
        }

        // Check if car exists
        const { data: car, error: carError } = await supabase
            .from('cars')
            .select('*')
            .eq('id', carId)
            .single();

        if (carError || !car) {
            return NextResponse.json({ error: 'Car not found' }, { status: 404 });
        }

        // Check if car is available
        if (!car.availability?.available) {
            return NextResponse.json({
                available: false,
                reason: 'Car is currently not available for rental'
            });
        }

        // Check for conflicting bookings
        const { data: conflictingBookings, error: conflictError } = await supabase
            .from('bookings')
            .select('id, status, pickup_date, return_date')
            .eq('car_id', carId)
            .neq('status', 'cancelled')
            .neq('status', 'rejected')
            .or(`and(pickup_date.lte.${returnDate},return_date.gte.${pickupDate})`);

        if (conflictError) {
            console.error('Error checking availability:', conflictError);
            return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 });
        }

        const isAvailable = !conflictingBookings || conflictingBookings.length === 0;

        if (!isAvailable) {
            return NextResponse.json({
                available: false,
                reason: 'Car is already booked for the selected dates',
                conflictingBookings: conflictingBookings?.map(b => ({
                    id: b.id,
                    pickupDate: b.pickup_date,
                    returnDate: b.return_date
                }))
            });
        }

        // Get peak season pricing
        const { data: peakSeasons } = await supabase
            .from('peak_season_pricing')
            .select('start_date, end_date, price_multiplier')
            .eq('is_active', true);

        // Calculate price with peak season pricing
        const days = Math.ceil(
            (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24)
        ) || 1;

        const basePrice = car.price_per_day || 0;
        let { totalPrice, peakSurcharge, appliedMultiplier } = calculatePeakSeasonPrice(
            basePrice,
            pickupDate,
            returnDate,
            peakSeasons || []
        );

        // Calculate weekly and monthly discounts if applicable
        let weeklyDiscount = 0;
        let monthlyDiscount = 0;

        if (days >= 7) {
            const weeklyRate = car.price_per_week || (basePrice * 7 * 0.9); // Default 10% off
            const weeks = Math.floor(days / 7);
            const remainingDays = days % 7;
            weeklyDiscount = (basePrice * days) - ((weeklyRate * weeks) + (basePrice * remainingDays));
            totalPrice = (weeklyRate * weeks) + (basePrice * remainingDays);
        }

        if (days >= 30) {
            const monthlyRate = car.price_per_month || (basePrice * 30 * 0.8); // Default 20% off
            const months = Math.floor(days / 30);
            const remainingDays = days % 30;
            monthlyDiscount = totalPrice - ((monthlyRate * months) + (basePrice * remainingDays));
            totalPrice = (monthlyRate * months) + (basePrice * remainingDays);
        }

        return NextResponse.json({
            available: true,
            car: {
                id: car.id,
                name: car.name,
                brand: car.brand,
                model: car.model,
                price_per_day: basePrice
            },
            dateRange: {
                pickupDate,
                returnDate,
                days
            },
            pricing: {
                basePrice,
                days,
                subtotal: basePrice * days,
                peakSurcharge,
                appliedMultiplier,
                weeklyDiscount: Math.max(weeklyDiscount, 0),
                monthlyDiscount: Math.max(monthlyDiscount, 0),
                totalPrice: Math.round(totalPrice * 100) / 100
            },
            location: car.availability?.locations || []
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
