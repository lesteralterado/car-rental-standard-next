import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DEFAULT_HOURLY_RATE = 100; // PHP per hour

// GET /api/late-fees - Get late fees
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', decoded.userId)
            .single();

        const isAdmin = profile?.role === 'admin';

        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get('booking_id');

        let query = supabase.from('late_fees').select('*');

        if (!isAdmin) {
            // Users can only see their own late fees
            const { data: userBookings } = await supabase
                .from('bookings')
                .select('id')
                .eq('user_id', decoded.userId);

            if (userBookings && userBookings.length > 0) {
                query = query.in('booking_id', userBookings.map(b => b.id));
            } else {
                return NextResponse.json({ late_fees: [] });
            }
        }

        if (bookingId) {
            query = query.eq('booking_id', bookingId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching late fees:', error);
            return NextResponse.json({ error: 'Failed to fetch late fees' }, { status: 500 });
        }

        return NextResponse.json({ late_fees: data || [] });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/late-fees - Calculate and create late fee (admin or automated)
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        // Check if user is admin or it's a system call
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', decoded.userId)
            .single();

        const body = await request.json();
        const { booking_id, hourly_rate } = body;

        if (!booking_id) {
            return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
        }

        // Get booking details
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('id, return_date, status')
            .eq('id', booking_id)
            .single();

        if (bookingError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Only create late fees for overdue rentals
        const now = new Date();
        const returnDate = new Date(booking.return_date);

        if (returnDate > now) {
            return NextResponse.json({ error: 'Rental is not overdue yet' }, { status: 400 });
        }

        // Check if late fee already exists
        const { data: existingFee } = await supabase
            .from('late_fees')
            .select('id')
            .eq('booking_id', booking_id)
            .single();

        if (existingFee) {
            return NextResponse.json({ error: 'Late fee already exists for this booking' }, { status: 400 });
        }

        // Calculate hours overdue
        const hoursOverdue = Math.floor(
            (now.getTime() - returnDate.getTime()) / (1000 * 60 * 60)
        );

        const rate = hourly_rate || DEFAULT_HOURLY_RATE;
        const totalLateFee = Math.max(hoursOverdue, 1) * rate;

        const { data: lateFee, error } = await supabase
            .from('late_fees')
            .insert({
                booking_id,
                original_return_date: booking.return_date,
                actual_return_date: null,
                hours_overdue: hoursOverdue,
                hourly_rate: rate,
                total_late_fee: totalLateFee,
                payment_status: 'pending',
                paid_amount: 0
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating late fee:', error);
            return NextResponse.json({ error: 'Failed to create late fee' }, { status: 500 });
        }

        return NextResponse.json({ late_fee: lateFee }, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/late-fees - Update late fee (mark as paid)
export async function PUT(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', decoded.userId)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { id, payment_status, paid_amount, actual_return_date } = body;

        if (!id) {
            return NextResponse.json({ error: 'Late fee ID required' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};

        if (payment_status) {
            updateData.payment_status = payment_status;
        }

        if (paid_amount !== undefined) {
            updateData.paid_amount = paid_amount;
        }

        if (actual_return_date) {
            updateData.actual_return_date = actual_return_date;
        }

        const { data: lateFee, error } = await supabase
            .from('late_fees')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating late fee:', error);
            return NextResponse.json({ error: 'Failed to update late fee' }, { status: 500 });
        }

        return NextResponse.json({ late_fee: lateFee });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
