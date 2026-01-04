import { NextRequest, NextResponse } from 'next/server';
import client from '@/api/client';

export async function GET() {
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

    let query = client.from('inquiries').select(`
      *,
      cars (
        id,
        name,
        brand,
        model,
        price_per_day
      )
    `);

    // If not admin, only show user's own inquiries
    if (profile.role !== 'admin') {
      query = query.eq('user_id', user.id);
    }

    const { data: inquiries, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inquiries:', error);
      return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
    }

    return NextResponse.json({ inquiries });
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
    const { car_id, pickup_date, return_date, pickup_location, dropoff_location, message } = body;

    // Validate required fields
    if (!car_id || !pickup_date || !return_date || !pickup_location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if car exists and is available
    const { data: car, error: carError } = await client
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
    const { data: inquiry, error: inquiryError } = await client
      .from('inquiries')
      .insert({
        user_id: user.id,
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
    const { data: admins, error: adminError } = await client
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (!adminError && admins) {
      for (const admin of admins) {
        await client
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