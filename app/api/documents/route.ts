import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/documents - Get user documents
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const { searchParams } = new URL(request.url);
        const documentType = searchParams.get('type');
        const verifiedOnly = searchParams.get('verified_only') === 'true';

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', decoded.userId)
            .single();

        const isAdmin = profile?.role === 'admin';

        let query = supabase
            .from('customer_documents')
            .select('*')
            .eq('user_id', decoded.userId);

        // Admins can see all documents
        if (isAdmin) {
            query = supabase.from('customer_documents').select('*');
        }

        if (documentType) {
            query = query.eq('document_type', documentType);
        }

        if (verifiedOnly) {
            query = query.eq('is_verified', true);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching documents:', error);
            return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
        }

        return NextResponse.json({ documents: data || [] });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/documents - Upload a document
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const body = await request.json();
        const { document_type, document_name, document_url, expiry_date } = body;

        if (!document_type || !document_name || !document_url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: document, error } = await supabase
            .from('customer_documents')
            .insert({
                user_id: decoded.userId,
                document_type,
                document_name,
                document_url,
                expiry_date,
                is_verified: false
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating document:', error);
            return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
        }

        return NextResponse.json({ document }, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/documents - Verify document (admin only)
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
        const { id, is_verified, notes } = body;

        if (!id) {
            return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
        }

        const { data: document, error } = await supabase
            .from('customer_documents')
            .update({
                is_verified: is_verified || false,
                verified_by: decoded.userId,
                verified_at: new Date().toISOString(),
                notes: notes || null
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating document:', error);
            return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
        }

        return NextResponse.json({ document });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
