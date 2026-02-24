import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/maintenance - Get maintenance records
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const { searchParams } = new URL(request.url);
        const carId = searchParams.get('car_id');
        const status = searchParams.get('status');

        let query = supabase
            .from('maintenance')
            .select('*')
            .order('scheduled_date', { ascending: false });

        if (carId) {
            query = query.eq('car_id', carId);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching maintenance:', error);
            return NextResponse.json({ error: 'Failed to fetch maintenance records' }, { status: 500 });
        }

        return NextResponse.json({ maintenance: data || [] });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/maintenance - Create maintenance record
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

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const {
            car_id,
            maintenance_type,
            description,
            scheduled_date,
            cost,
            mechanic_shop,
            mechanic_contact,
            next_maintenance_date,
            mileage_at_service,
            notes
        } = body;

        if (!car_id || !maintenance_type || !scheduled_date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if car exists
        const { data: car, error: carError } = await supabase
            .from('cars')
            .select('id')
            .eq('id', car_id)
            .single();

        if (carError || !car) {
            return NextResponse.json({ error: 'Car not found' }, { status: 404 });
        }

        const { data: maintenance, error } = await supabase
            .from('maintenance')
            .insert({
                car_id,
                maintenance_type,
                description,
                scheduled_date,
                cost,
                mechanic_shop,
                mechanic_contact,
                next_maintenance_date,
                mileage_at_service,
                notes,
                status: 'scheduled'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating maintenance:', error);
            return NextResponse.json({ error: 'Failed to create maintenance record' }, { status: 500 });
        }

        return NextResponse.json({ maintenance }, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/maintenance - Update maintenance record
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
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'Maintenance ID required' }, { status: 400 });
        }

        const { data: maintenance, error } = await supabase
            .from('maintenance')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating maintenance:', error);
            return NextResponse.json({ error: 'Failed to update maintenance' }, { status: 500 });
        }

        return NextResponse.json({ maintenance });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
