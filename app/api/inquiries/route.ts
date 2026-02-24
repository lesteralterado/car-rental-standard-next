import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', decoded.userId)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase.from('inquiries').select(`
      *,
      profiles (
        id,
        full_name,
        phone,
        email
      ),
      cars (
        id,
        name,
        brand,
        model,
        price_per_day
      )
    `, { count: 'exact' });

    // If not admin, only show user's own inquiries
    if (profile.role !== 'admin') {
      query = query.eq('user_id', decoded.userId);
    }

    const { data: inquiries, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching inquiries:', error);
      return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
    }

    return NextResponse.json({
      inquiries,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const body = await request.json();
    const { car_id, pickup_date, return_date, pickup_location, dropoff_location, message } = body;

    // Validate required fields
    if (!car_id || !pickup_date || !return_date || !pickup_location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if car exists and is available
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('id, available')
      .eq('id', car_id)
      .single();

    if (carError || !car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    if (!car.available) {
      return NextResponse.json({ error: 'Car is not available' }, { status: 400 });
    }

    // Create inquiry
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .insert({
        user_id: decoded.userId,
        car_id,
        pickup_date,
        return_date,
        pickup_location,
        dropoff_location: dropoff_location || null,
        message: message || null,
      })
      .select(`
        *,
        cars (
          id,
          name,
          brand,
          model,
          price_per_day
        )
      `)
      .single();

    if (inquiryError) {
      console.error('Error creating inquiry:', inquiryError);
      return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 });
    }

    // Create notification for admins
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (!adminError && admins) {
      for (const admin of admins) {
        await supabase
          .from('notifications')
          .insert({
            user_id: admin.id,
            type: 'booking_submitted',
            title: 'New Car Inquiry',
            message: `New inquiry received for ${inquiry.cars.brand} ${inquiry.cars.model}`,
            inquiry_id: inquiry.id,
          });
      }
    }

    return NextResponse.json({ inquiry }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}