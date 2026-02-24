import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/peak-pricing - Get peak season pricing
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active_only') !== 'false';
        const date = searchParams.get('date'); // Check if specific date is in peak season

        let query = supabase
            .from('peak_season_pricing')
            .select('*')
            .order('start_date', { ascending: true });

        if (activeOnly) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching peak pricing:', error);
            return NextResponse.json({ error: 'Failed to fetch peak season pricing' }, { status: 500 });
        }

        // If date is provided, check if it falls within any peak season
        let activeMultiplier = 1.0;
        if (date) {
            const checkDate = new Date(date);
            const activeSeason = data?.find(season => {
                const start = new Date(season.start_date);
                const end = new Date(season.end_date);
                return checkDate >= start && checkDate <= end;
            });
            if (activeSeason) {
                activeMultiplier = activeSeason.price_multiplier || 1.0;
            }
        }

        return NextResponse.json({
            pricing: data || [],
            dateMultiplier: activeMultiplier
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/peak-pricing - Create peak season pricing (admin only)
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
        const { name, start_date, end_date, pricing_type, price_multiplier, fixed_increase, notes } = body;

        if (!name || !start_date || !end_date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: pricing, error } = await supabase
            .from('peak_season_pricing')
            .insert({
                name,
                start_date,
                end_date,
                pricing_type: pricing_type || 'multiplier',
                price_multiplier: price_multiplier || 1.0,
                fixed_increase: fixed_increase || 0,
                is_active: true,
                notes
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating peak pricing:', error);
            return NextResponse.json({ error: 'Failed to create peak season pricing' }, { status: 500 });
        }

        return NextResponse.json({ pricing }, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/peak-pricing - Update peak season pricing (admin only)
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
            return NextResponse.json({ error: 'Pricing ID required' }, { status: 400 });
        }

        const { data: pricing, error } = await supabase
            .from('peak_season_pricing')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating peak pricing:', error);
            return NextResponse.json({ error: 'Failed to update peak season pricing' }, { status: 500 });
        }

        return NextResponse.json({ pricing });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Helper function to calculate price with peak season
export function calculatePeakSeasonPrice(
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
