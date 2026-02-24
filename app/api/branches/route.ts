import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/branches - Get all active branches
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active_only') !== 'false';

        let query = supabase
            .from('branches')
            .select('*')
            .order('name', { ascending: true });

        if (activeOnly) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching branches:', error);
            return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
        }

        return NextResponse.json({ branches: data || [] });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/branches - Create a new branch (admin only)
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
        const { name, address, contact_number, email, opening_time, closing_time, notes } = body;

        if (!name) {
            return NextResponse.json({ error: 'Branch name is required' }, { status: 400 });
        }

        const { data: branch, error } = await supabase
            .from('branches')
            .insert({
                name,
                address,
                contact_number,
                email,
                opening_time,
                closing_time,
                notes,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating branch:', error);
            return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
        }

        return NextResponse.json({ branch }, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/branches - Update a branch (admin only)
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
            return NextResponse.json({ error: 'Branch ID required' }, { status: 400 });
        }

        const { data: branch, error } = await supabase
            .from('branches')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating branch:', error);
            return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 });
        }

        return NextResponse.json({ branch });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
