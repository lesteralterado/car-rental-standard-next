import { NextRequest, NextResponse } from 'next/server';
import client from '@/api/client';

export async function GET(request: NextRequest) {
  try {
    const { data: { user } } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get customer_id for filtering
    const { data: customer } = await client
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let query = client.from('bookings').select(`
      *,
      customers:customer_id (
        full_name,
        phone
      ),
      cars:car_id (
        id,
        name,
        brand as make,
        model,
        price_per_day
      )
    `, { count: 'exact' });

    // If not admin, only show user's own bookings
    if (profile.role !== 'admin') {
      query = query.eq('customer_id', customer?.id);
    }

    const { data: bookings, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    return NextResponse.json({
      bookings,
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
    const { data: { user } } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      car_id,
      start_date,
      end_date,
      pickup_location,
      dropoff_location,
      total_price,
      drivers_license_verified
    } = body;

    // Validate required fields
    if (!car_id || !start_date || !end_date || !pickup_location || !total_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get customer_id
    const { data: customer, error: customerError } = await client
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Check if car exists and is available
    const { data: car, error: carError } = await client
      .from('cars')
      .select('id, available, availability')
      .eq('id', car_id)
      .single();

    if (carError || !car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    if (!car.available) {
      return NextResponse.json({ error: 'Car is not available' }, { status: 400 });
    }

    // Check availability for the selected dates
    const { data: conflictingBookings, error: availabilityError } = await client
      .from('bookings')
      .select('id')
      .eq('car_id', car_id)
      .neq('status', 'rejected')
      .neq('status', 'cancelled')
      .or(`and(start_date.lte.${end_date},end_date.gte.${start_date})`);

    if (availabilityError) {
      console.error('Availability check error:', availabilityError);
      return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 });
    }

    if (conflictingBookings && conflictingBookings.length > 0) {
      return NextResponse.json({
        error: 'Car is not available for the selected dates'
      }, { status: 400 });
    }

    // Create booking
    const { data: booking, error: bookingError } = await client
      .from('bookings')
      .insert({
        customer_id: customer.id,
        car_id,
        start_date,
        end_date,
        pickup_location,
        dropoff_location: dropoff_location || null,
        total_price,
        status: 'pending',
        drivers_license_verified: drivers_license_verified || false,
      })
      .select(`
        *,
        cars (
          id,
          name,
          brand as make,
          model,
          price_per_day
        )
      `)
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}