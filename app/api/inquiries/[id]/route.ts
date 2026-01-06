import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface InquiryUpdateData {
  status?: string;
  admin_response?: string;
}

export async function GET(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
 ) {
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

     const { id: inquiryId } = await params;

    let query = supabase.from('inquiries').select(`
      *,
      cars (
        id,
        name,
        brand,
        model,
        price_per_day
      )
    `).eq('id', inquiryId);

    // If not admin, only allow access to own inquiries
    if (profile.role !== 'admin') {
      query = query.eq('user_id', decoded.userId);
    }

    const { data: inquiry, error } = await query.single();

    if (error) {
      console.error('Error fetching inquiry:', error);
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ inquiry });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
 ) {
   try {
     const authHeader = request.headers.get('authorization');
     if (!authHeader || !authHeader.startsWith('Bearer ')) {
       return NextResponse.json({ error: 'No token provided' }, { status: 401 });
     }

     const token = authHeader.substring(7);

     // Verify token
     const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

     // Only admins can update inquiries
     const { data: profile, error: profileError } = await supabase
       .from('profiles')
       .select('role')
       .eq('id', decoded.userId)
       .single();

     if (profileError || profile.role !== 'admin') {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
     }

     const { id: inquiryId } = await params;
     const body = await request.json();
     const { status, admin_response } = body;

     // Validate status
     const validStatuses = ['pending', 'responded', 'closed'];
     if (status && !validStatuses.includes(status)) {
       return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
     }

     const updateData: InquiryUpdateData = {};
     if (status) updateData.status = status;
     if (admin_response !== undefined) updateData.admin_response = admin_response;

     const { data: inquiry, error: updateError } = await supabase
       .from('inquiries')
       .update(updateData)
       .eq('id', inquiryId)
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

     if (updateError) {
       console.error('Error updating inquiry:', updateError);
       return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
     }

     // Create notification for user if status changed
     if (status && status !== 'pending') {
       await supabase
         .from('notifications')
         .insert({
           user_id: inquiry.user_id,
           type: 'booking_submitted',
           title: 'Inquiry Update',
           message: `Your inquiry for ${inquiry.cars.brand} ${inquiry.cars.model} has been ${status}`,
           inquiry_id: inquiry.id,
         });
     }

    return NextResponse.json({ inquiry });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}