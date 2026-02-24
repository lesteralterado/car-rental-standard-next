import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/inspections - Get inspections for a booking
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get('booking_id');
        const inspectionType = searchParams.get('type');

        if (!bookingId) {
            return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
        }

        let query = supabase
            .from('vehicle_inspections')
            .select('*')
            .eq('booking_id', bookingId);

        if (inspectionType) {
            query = query.eq('inspection_type', inspectionType);
        }

        const { data, error } = await query.order('inspection_date', { ascending: false });

        if (error) {
            console.error('Error fetching inspections:', error);
            return NextResponse.json({ error: 'Failed to fetch inspections' }, { status: 500 });
        }

        return NextResponse.json({ inspections: data || [] });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/inspections - Create a new inspection
export async function POST(request: NextRequest) {
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

        if (!profile || profile.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const {
            booking_id,
            inspection_type,
            fuel_level,
            odometer_reading,
            overall_condition,
            existing_damages,
            photos,
            customer_signature,
            staff_signature
        } = body;

        // Validate required fields
        if (!booking_id || !inspection_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if booking exists
        const { data: booking } = await supabase
            .from('bookings')
            .select('id')
            .eq('id', booking_id)
            .single();

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Create inspection
        const { data: inspection, error } = await supabase
            .from('vehicle_inspections')
            .insert({
                booking_id,
                inspection_type,
                inspector_id: decoded.userId,
                fuel_level,
                odometer_reading,
                overall_condition,
                existing_damages: existing_damages || [],
                photos: photos || [],
                ...(customer_signature && {
                    customer_signature,
                    customer_signed_at: new Date().toISOString()
                }),
                ...(staff_signature && {
                    staff_signature,
                    staff_signed_at: new Date().toISOString()
                })
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating inspection:', error);
            return NextResponse.json({ error: 'Failed to create inspection' }, { status: 500 });
        }

        return NextResponse.json({ inspection }, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/inspections - Update an inspection (e.g., add signatures)
export async function PUT(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const body = await request.json();
        const { id, customer_signature, staff_signature } = body;

        if (!id) {
            return NextResponse.json({ error: 'Inspection ID required' }, { status: 400 });
        }

        // Check if inspection exists
        const { data: existingInspection } = await supabase
            .from('vehicle_inspections')
            .select('*')
            .eq('id', id)
            .single();

        if (!existingInspection) {
            return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
        }

        // Verify user has access to this booking
        const { data: booking } = await supabase
            .from('bookings')
            .select('user_id')
            .eq('id', existingInspection.booking_id)
            .single();

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', decoded.userId)
            .single();

        // Allow if user owns the booking or is admin
        if (booking?.user_id !== decoded.userId && profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const updateData: Record<string, unknown> = {};

        // Customer can sign their part
        if (customer_signature && !existingInspection.customer_signature) {
            updateData.customer_signature = customer_signature;
            updateData.customer_signed_at = new Date().toISOString();
        }

        // Staff (admin) can sign their part
        if (staff_signature && profile?.role === 'admin' && !existingInspection.staff_signature) {
            updateData.staff_signature = staff_signature;
            updateData.staff_signed_at = new Date().toISOString();
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
        }

        const { data: inspection, error } = await supabase
            .from('vehicle_inspections')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating inspection:', error);
            return NextResponse.json({ error: 'Failed to update inspection' }, { status: 500 });
        }

        return NextResponse.json({ inspection });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
