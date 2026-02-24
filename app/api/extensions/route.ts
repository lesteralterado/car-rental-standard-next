import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/extensions - Get extension requests
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get('booking_id');
        const status = searchParams.get('status');

        // Check user role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', decoded.userId)
            .single();

        const isAdmin = profile?.role === 'admin';

        let query = supabase
            .from('rental_extensions')
            .select('*')
            .eq('user_id', decoded.userId);

        // Admins can see all extensions
        if (isAdmin) {
            query = supabase.from('rental_extensions').select('*');
        }

        if (bookingId) {
            query = query.eq('booking_id', bookingId);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching extensions:', error);
            return NextResponse.json({ error: 'Failed to fetch extensions' }, { status: 500 });
        }

        return NextResponse.json({ extensions: data || [] });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/extensions - Request a rental extension
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const body = await request.json();
        const { booking_id, requested_extension_days, new_return_date, extension_fee } = body;

        // Validate required fields
        if (!booking_id || !requested_extension_days || !new_return_date || !extension_fee) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if booking exists and user has access
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('id, user_id, return_date, status, car_id, price_per_day')
            .eq('id', booking_id)
            .single();

        if (bookingError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Verify user owns the booking
        if (booking.user_id !== decoded.userId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Check if booking is active/ongoing
        if (booking.status !== 'confirmed' && booking.status !== 'ongoing') {
            return NextResponse.json({ error: 'Extension only available for active bookings' }, { status: 400 });
        }

        // Check if new return date is after current return date
        const currentReturnDate = new Date(booking.return_date);
        const newReturnDate = new Date(new_return_date);

        if (newReturnDate <= currentReturnDate) {
            return NextResponse.json({ error: 'New return date must be after current return date' }, { status: 400 });
        }

        // Check for existing pending extension
        const { data: existingExtension } = await supabase
            .from('rental_extensions')
            .select('id')
            .eq('booking_id', booking_id)
            .eq('status', 'pending')
            .single();

        if (existingExtension) {
            return NextResponse.json({ error: 'Already have a pending extension request' }, { status: 400 });
        }

        // Check if car is available for extension period
        const { data: conflictingBookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('car_id', booking.car_id)
            .eq('status', 'confirmed')
            .or(`and(pickup_date.lte.${new_return_date},return_date.gte.${new_return_date})`)
            .neq('id', booking_id);

        if (conflictingBookings && conflictingBookings.length > 0) {
            return NextResponse.json({ error: 'Car is not available for the requested extension date' }, { status: 400 });
        }

        // Create extension request
        const { data: extension, error } = await supabase
            .from('rental_extensions')
            .insert({
                booking_id,
                user_id: decoded.userId,
                requested_extension_days,
                new_return_date,
                extension_fee,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating extension:', error);
            return NextResponse.json({ error: 'Failed to create extension request' }, { status: 500 });
        }

        return NextResponse.json({ extension }, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/extensions - Approve/reject extension (admin only)
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
        const { id, status, admin_notes } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Extension ID and status required' }, { status: 400 });
        }

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status. Use approved or rejected' }, { status: 400 });
        }

        // Get extension details
        const { data: extension, error: extensionError } = await supabase
            .from('rental_extensions')
            .select('*')
            .eq('id', id)
            .single();

        if (extensionError || !extension) {
            return NextResponse.json({ error: 'Extension not found' }, { status: 404 });
        }

        if (extension.status !== 'pending') {
            return NextResponse.json({ error: 'Extension has already been processed' }, { status: 400 });
        }

        // Update extension status
        const { data: updatedExtension, error } = await supabase
            .from('rental_extensions')
            .update({
                status,
                admin_notes,
                reviewed_by: decoded.userId,
                reviewed_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating extension:', error);
            return NextResponse.json({ error: 'Failed to update extension' }, { status: 500 });
        }

        // If approved, update booking return date
        if (status === 'approved') {
            await supabase
                .from('bookings')
                .update({ return_date: extension.new_return_date })
                .eq('id', extension.booking_id);
        }

        return NextResponse.json({ extension: updatedExtension });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
