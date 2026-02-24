import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/blacklist - Check if user is blacklisted or get blacklist entries
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

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        // Users can check their own status
        if (!userId || userId === decoded.userId) {
            const { data: blacklistEntry } = await supabase
                .from('blacklist')
                .select('*')
                .eq('user_id', decoded.userId)
                .single();

            return NextResponse.json({
                is_blacklisted: !!blacklistEntry,
                entry: blacklistEntry
            });
        }

        // Only admins can check other users
        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { data: blacklistEntries } = await supabase
            .from('blacklist')
            .select('*, profiles:user_id(full_name, email, phone)')
            .order('created_at', { ascending: false });

        return NextResponse.json({ blacklist: blacklistEntries || [] });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/blacklist - Add user to blacklist (admin only)
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
        const { user_id, reason, blocked_until } = body;

        if (!user_id || !reason) {
            return NextResponse.json({ error: 'User ID and reason required' }, { status: 400 });
        }

        // Check if user exists
        const { data: user, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user_id)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if already blacklisted
        const { data: existing } = await supabase
            .from('blacklist')
            .select('id')
            .eq('user_id', user_id)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'User is already blacklisted' }, { status: 400 });
        }

        const { data: blacklistEntry, error } = await supabase
            .from('blacklist')
            .insert({
                user_id,
                reason,
                blocked_until: blocked_until || null,
                blocked_by: decoded.userId
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding to blacklist:', error);
            return NextResponse.json({ error: 'Failed to add to blacklist' }, { status: 500 });
        }

        return NextResponse.json({ entry: blacklistEntry }, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/blacklist - Remove user from blacklist (admin only)
export async function DELETE(request: NextRequest) {
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
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('blacklist')
            .delete()
            .eq('user_id', userId);

        if (error) {
            console.error('Error removing from blacklist:', error);
            return NextResponse.json({ error: 'Failed to remove from blacklist' }, { status: 500 });
        }

        return NextResponse.json({ message: 'User removed from blacklist' });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
