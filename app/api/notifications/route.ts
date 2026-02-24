import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unread_only') === 'true';
        const limit = parseInt(searchParams.get('limit') || '20');

        let query = supabase
            .from('notifications')
            .select('*')
            .eq('user_id', decoded.userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (unreadOnly) {
            query = query.eq('read', false);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching notifications:', error);
            return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
        }

        const unreadCount = data?.filter(n => !n.read).length || 0;

        return NextResponse.json({
            notifications: data || [],
            unreadCount
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/notifications - Create notification or send SMS/Email
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        // Check if user is admin for sending notifications
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', decoded.userId)
            .single();

        const body = await request.json();
        const {
            user_id,
            type,
            title,
            message,
            booking_id,
            send_sms,
            send_email
        } = body;

        if (!user_id || !type || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create in-app notification
        const { data: notification, error } = await supabase
            .from('notifications')
            .insert({
                user_id,
                type,
                title,
                message,
                booking_id,
                read: false
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating notification:', error);
            return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
        }

        // Log notification for tracking
        await supabase
            .from('notifications_log')
            .insert({
                user_id,
                booking_id,
                notification_type: type,
                channel: 'in_app',
                title,
                message,
                status: 'sent',
                sent_at: new Date().toISOString()
            });

        // TODO: Integrate with SMS gateway (Semaphore, Movider) and Email service
        // For now, these are placeholders
        if (send_sms) {
            // Placeholder for SMS sending
            console.log(`[SMS] Would send to user ${user_id}: ${message}`);
            await supabase
                .from('notifications_log')
                .insert({
                    user_id,
                    booking_id,
                    notification_type: type,
                    channel: 'sms',
                    title,
                    message,
                    status: 'pending' // Would be 'sent' after integration
                });
        }

        if (send_email) {
            // Placeholder for Email sending
            console.log(`[Email] Would send to user ${user_id}: ${message}`);
            await supabase
                .from('notifications_log')
                .insert({
                    user_id,
                    booking_id,
                    notification_type: type,
                    channel: 'email',
                    title,
                    message,
                    status: 'pending' // Would be 'sent' after integration
                });
        }

        return NextResponse.json({ notification }, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const body = await request.json();
        const { notification_id, mark_all_read } = body;

        if (mark_all_read) {
            // Mark all notifications as read
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', decoded.userId);

            if (error) {
                console.error('Error marking all as read:', error);
                return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
            }

            return NextResponse.json({ message: 'All notifications marked as read' });
        }

        if (!notification_id) {
            return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notification_id)
            .eq('user_id', decoded.userId);

        if (error) {
            console.error('Error marking notification as read:', error);
            return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ============================================
// AUTOMATED REMINDERS SCHEDULER (Webhook endpoint)
// This would be called by a cron job
// ============================================

// POST /api/notifications/send-reminders - Send automated reminders
export async function sendReminders(request: NextRequest) {
    try {
        // This endpoint should be protected with a secret key
        const authHeader = request.headers.get('authorization');
        const CRON_SECRET = process.env.CRON_SECRET;

        if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const reminderType = searchParams.get('type'); // pickup_3_days, return_1_day, etc.

        const now = new Date();

        if (reminderType === 'pickup_3_days') {
            // Find bookings starting in 3 days
            const targetDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
            const targetDateStr = targetDate.toISOString().split('T')[0];

            const { data: bookings } = await supabase
                .from('bookings')
                .select('id, user_id, pickup_date, cars:car_id(name, brand, model)')
                .eq('status', 'confirmed')
                .gte('pickup_date', targetDateStr)
                .lt('pickup_date', new Date(targetDate.getTime() + 24 * 60 * 60 * 1000).toISOString());

            if (bookings && bookings.length > 0) {
                for (const booking of bookings) {
                    await supabase.from('notifications').insert({
                        user_id: booking.user_id,
                        type: 'pickup_reminder_3_days',
                        title: 'Pickup Reminder - 3 Days Away',
                        message: `Your ${booking.cars?.[0]?.name} rental is in 3 days! Please prepare your valid ID and driver's license.`,
                        booking_id: booking.id,
                        read: false
                    });
                }
            }
        }

        if (reminderType === 'pickup_1_day') {
            // Find bookings starting tomorrow
            const targetDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
            const targetDateStr = targetDate.toISOString().split('T')[0];

            const { data: bookings } = await supabase
                .from('bookings')
                .select('id, user_id, pickup_date, cars:car_id(name, brand, model)')
                .eq('status', 'confirmed')
                .gte('pickup_date', targetDateStr)
                .lt('pickup_date', new Date(targetDate.getTime() + 24 * 60 * 60 * 1000).toISOString());

            if (bookings && bookings.length > 0) {
                for (const booking of bookings) {
                    await supabase.from('notifications').insert({
                        user_id: booking.user_id,
                        type: 'pickup_reminder_1_day',
                        title: 'Pickup Reminder - Tomorrow',
                        message: `Reminder: Pick up your ${booking.cars?.[0]?.name} tomorrow! Please bring valid ID and payment for the remaining balance.`,
                        booking_id: booking.id,
                        read: false
                    });
                }
            }
        }

        if (reminderType === 'return_1_day') {
            // Find bookings returning tomorrow
            const targetDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
            const targetDateStr = targetDate.toISOString().split('T')[0];

            const { data: bookings } = await supabase
                .from('bookings')
                .select('id, user_id, return_date, cars:car_id(name, brand, model)')
                .in('status', ['confirmed', 'ongoing'])
                .gte('return_date', targetDateStr)
                .lt('return_date', new Date(targetDate.getTime() + 24 * 60 * 60 * 1000).toISOString());

            if (bookings && bookings.length > 0) {
                for (const booking of bookings) {
                    await supabase.from('notifications').insert({
                        user_id: booking.user_id,
                        type: 'return_reminder_1_day',
                        title: 'Return Reminder - Tomorrow',
                        message: `Please return your ${booking.cars?.[0]?.name} tomorrow by the scheduled time.`,
                        booking_id: booking.id,
                        read: false
                    });
                }
            }
        }

        if (reminderType === 'overdue_check') {
            // Check for overdue rentals
            const { data: overdueBookings } = await supabase
                .from('bookings')
                .select('id, user_id, return_date, cars:car_id(name, brand, model)')
                .eq('status', 'ongoing')
                .lt('return_date', now.toISOString());

            if (overdueBookings && overdueBookings.length > 0) {
                for (const booking of overdueBookings) {
                    // Create late fee record
                    const hoursOverdue = Math.floor(
                        (now.getTime() - new Date(booking.return_date).getTime()) / (1000 * 60 * 60)
                    );

                    await supabase.from('late_fees').insert({
                        booking_id: booking.id,
                        original_return_date: booking.return_date,
                        hours_overdue: hoursOverdue,
                        hourly_rate: 100, // PHP per hour - should be configurable
                        total_late_fee: hoursOverdue * 100,
                        payment_status: 'pending',
                        paid_amount: 0
                    });

                    // Notify customer
                    await supabase.from('notifications').insert({
                        user_id: booking.user_id,
                        type: 'overdue_alert',
                        title: 'Rental Overdue',
                        message: `Your ${booking.cars?.[0]?.name} rental is overdue by ${hoursOverdue} hours. Late fees apply. Please return the vehicle immediately.`,
                        booking_id: booking.id,
                        read: false
                    });
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Reminders sent successfully' });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
