import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/payments - Get payments
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
        const isDeposit = searchParams.get('is_deposit');

        // Check user role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', decoded.userId)
            .single();

        const isAdmin = profile?.role === 'admin';

        let query = supabase
            .from('payments')
            .select('*')
            .eq('user_id', decoded.userId);

        // Admins can see all payments
        if (isAdmin) {
            query = supabase.from('payments').select('*');
        }

        if (bookingId) {
            query = query.eq('booking_id', bookingId);
        }

        if (status) {
            query = query.eq('payment_status', status);
        }

        if (isDeposit !== null) {
            query = query.eq('is_deposit', isDeposit === 'true');
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching payments:', error);
            return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
        }

        return NextResponse.json({ payments: data || [] });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/payments - Create a new payment record
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const body = await request.json();
        const {
            booking_id,
            payment_type,
            amount,
            is_deposit,
            deposit_amount,
            reference_number,
            transaction_id,
            payment_proof_url
        } = body;

        // Validate required fields
        if (!booking_id || !payment_type || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if booking exists and user has access
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('id, user_id, total_price')
            .eq('id', booking_id)
            .single();

        if (bookingError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Users can only create payments for their own bookings
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', decoded.userId)
            .single();

        if (booking.user_id !== decoded.userId && profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Create payment record
        const { data: payment, error } = await supabase
            .from('payments')
            .insert({
                booking_id,
                user_id: decoded.userId,
                payment_type,
                amount,
                payment_status: 'pending',
                is_deposit: is_deposit || false,
                deposit_amount: deposit_amount || null,
                reference_number,
                transaction_id,
                payment_proof_url
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating payment:', error);
            return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
        }

        return NextResponse.json({ payment }, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/payments - Update payment status (admin only for verification)
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
        const { id, payment_status, admin_notes, deposit_refunded, deposit_refund_amount } = body;

        if (!id) {
            return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};

        if (payment_status) {
            updateData.payment_status = payment_status;
        }

        if (admin_notes) {
            updateData.admin_notes = admin_notes;
        }

        // Handle deposit refund
        if (deposit_refunded) {
            updateData.deposit_refunded = true;
            updateData.deposit_refund_amount = deposit_refund_amount;
            updateData.deposit_refunded_at = new Date().toISOString();
        }

        const { data: payment, error } = await supabase
            .from('payments')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating payment:', error);
            return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
        }

        // If payment is marked as paid, update booking payment status
        if (payment_status === 'paid' && payment.booking_id) {
            await supabase
                .from('bookings')
                .update({ payment_status: 'paid' })
                .eq('id', payment.booking_id);
        }

        return NextResponse.json({ payment });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
