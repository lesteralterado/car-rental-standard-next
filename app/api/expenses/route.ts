import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/expenses - Get expenses
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

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const carId = searchParams.get('car_id');
        const expenseType = searchParams.get('type');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        let query = supabase
            .from('expenses')
            .select('*')
            .order('expense_date', { ascending: false });

        if (carId) {
            query = query.eq('car_id', carId);
        }

        if (expenseType) {
            query = query.eq('expense_type', expenseType);
        }

        if (startDate) {
            query = query.gte('expense_date', startDate);
        }

        if (endDate) {
            query = query.lte('expense_date', endDate);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching expenses:', error);
            return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
        }

        // Calculate total
        const total = data?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

        return NextResponse.json({ expenses: data || [], total });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/expenses - Create expense record
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
        const { car_id, expense_type, amount, description, receipt_url, expense_date } = body;

        if (!car_id || !expense_type || !amount || !expense_date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: expense, error } = await supabase
            .from('expenses')
            .insert({
                car_id,
                expense_type,
                amount,
                description,
                receipt_url,
                expense_date
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating expense:', error);
            return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
        }

        return NextResponse.json({ expense }, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
