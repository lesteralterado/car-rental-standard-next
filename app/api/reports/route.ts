import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/reports - Get various reports
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
        const reportType = searchParams.get('type') || 'overview';
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        switch (reportType) {
            case 'overview':
                return getOverviewReport(startDate, endDate);
            case 'revenue':
                return getRevenueReport(startDate, endDate);
            case 'vehicle-performance':
                return getVehiclePerformanceReport(startDate, endDate);
            case 'customer':
                return getCustomerReport(startDate, endDate);
            case 'bookings':
                return getBookingsReport(startDate, endDate);
            case 'payments':
                return getPaymentsReport(startDate, endDate);
            case 'dashboard':
                return getDashboardStats();
            default:
                return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
        }
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Dashboard Stats
async function getDashboardStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Today's pickups and returns
    const { data: todayPickups } = await supabase
        .from('bookings')
        .select('id')
        .eq('status', 'confirmed')
        .gte('pickup_date', todayStart)
        .lt('pickup_date', new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString());

    const { data: todayReturns } = await supabase
        .from('bookings')
        .select('id')
        .in('status', ['confirmed', 'ongoing'])
        .gte('return_date', todayStart)
        .lt('return_date', new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString());

    const { data: ongoingRentals } = await supabase
        .from('bookings')
        .select('id')
        .eq('status', 'ongoing');

    const { data: overdueRentals } = await supabase
        .from('bookings')
        .select('id')
        .eq('status', 'ongoing')
        .lt('return_date', now.toISOString());

    // Financial stats
    const { data: paymentsToday } = await supabase
        .from('payments')
        .select('amount')
        .eq('payment_status', 'paid')
        .gte('created_at', todayStart);

    const { data: paymentsWeek } = await supabase
        .from('payments')
        .select('amount')
        .eq('payment_status', 'paid')
        .gte('created_at', weekStart);

    const { data: paymentsMonth } = await supabase
        .from('payments')
        .select('amount')
        .eq('payment_status', 'paid')
        .gte('created_at', monthStart);

    const { data: pendingDeposits } = await supabase
        .from('payments')
        .select('amount')
        .eq('is_deposit', true)
        .eq('payment_status', 'pending');

    const { data: pendingRefunds } = await supabase
        .from('payments')
        .select('amount')
        .eq('is_deposit', true)
        .eq('payment_status', 'paid')
        .eq('deposit_refunded', false);

    // Vehicle stats
    const { count: availableVehicles } = await supabase
        .from('cars')
        .select('id', { count: 'exact' })
        .eq('availability->>available', 'true');

    const { data: maintenanceVehicles } = await supabase
        .from('maintenance')
        .select('car_id')
        .eq('status', 'in_progress');

    // Booking stats
    const { data: pendingBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('status', 'pending');

    const { data: completedThisMonth } = await supabase
        .from('bookings')
        .select('id')
        .eq('status', 'completed')
        .gte('updated_at', monthStart);

    return NextResponse.json({
        dashboard: {
            todayPickups: todayPickups?.length || 0,
            todayReturns: todayReturns?.length || 0,
            ongoingRentals: ongoingRentals?.length || 0,
            overdueRentals: overdueRentals?.length || 0,
            availableVehicles: availableVehicles || 0,
            maintenanceVehicles: maintenanceVehicles?.length || 0,
            revenueToday: paymentsToday?.reduce((sum, p) => sum + p.amount, 0) || 0,
            revenueThisWeek: paymentsWeek?.reduce((sum, p) => sum + p.amount, 0) || 0,
            revenueThisMonth: paymentsMonth?.reduce((sum, p) => sum + p.amount, 0) || 0,
            pendingDeposits: pendingDeposits?.reduce((sum, p) => sum + p.amount, 0) || 0,
            pendingRefunds: pendingRefunds?.reduce((sum, p) => sum + p.amount, 0) || 0,
            pendingBookings: pendingBookings?.length || 0,
            completedThisMonth: completedThisMonth?.length || 0
        }
    });
}

// Revenue Report
async function getRevenueReport(startDate?: string | null, endDate?: string | null) {
    let query = supabase
        .from('payments')
        .select('amount, created_at, payment_status, is_deposit, deposit_refunded, deposit_refund_amount')
        .eq('payment_status', 'paid');

    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data: payments } = await query;

    const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const depositsCollected = payments?.filter(p => p.is_deposit).reduce((sum, p) => sum + p.amount, 0) || 0;
    const depositsRefunded = payments?.filter(p => p.is_deposit && p.deposit_refunded).reduce((sum, p) => sum + (p.deposit_refund_amount || 0), 0) || 0;

    // Monthly breakdown
    const monthlyData: Record<string, { revenue: number; bookings: number }> = {};
    payments?.forEach(payment => {
        const month = new Date(payment.created_at).toISOString().slice(0, 7);
        if (!monthlyData[month]) {
            monthlyData[month] = { revenue: 0, bookings: 0 };
        }
        monthlyData[month].revenue += payment.amount;
        monthlyData[month].bookings += 1;
    });

    return NextResponse.json({
        report: 'revenue',
        totalRevenue,
        depositsCollected,
        depositsRefunded,
        netRevenue: totalRevenue - depositsRefunded,
        monthlyBreakdown: Object.entries(monthlyData).map(([month, data]) => ({
            month,
            ...data
        }))
    });
}

// Vehicle Performance Report
async function getVehiclePerformanceReport(startDate?: string | null, endDate?: string | null) {
    const { data: cars } = await supabase.from('cars').select('*');
    const { data: bookings } = await supabase.from('bookings').select('*');
    const { data: expenses } = await supabase.from('expenses').select('*');

    const carPerformance = cars?.map(car => {
        const carBookings = bookings?.filter(b => b.car_id === car.id) || [];
        const completedBookings = carBookings.filter(b => b.status === 'completed');
        const carExpenses = expenses?.filter(e => e.car_id === car.id) || [];

        const totalRevenue = completedBookings.reduce((sum, b) => sum + b.total_price, 0);
        const totalExpenses = carExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalDays = carBookings.reduce((sum, b) => {
            const days = Math.ceil((new Date(b.return_date).getTime() - new Date(b.pickup_date).getTime()) / (1000 * 60 * 60 * 24));
            return sum + (days > 0 ? days : 0);
        }, 0);

        return {
            carId: car.id,
            carName: car.name,
            totalBookings: carBookings.length,
            completedBookings: completedBookings.length,
            totalRevenue,
            totalExpenses,
            profit: totalRevenue - totalExpenses,
            totalRentalDays: totalDays,
            averageRentalDays: completedBookings.length > 0 ? totalDays / completedBookings.length : 0,
            utilizationRate: totalDays / 30 // Monthly utilization (simplified)
        };
    }) || [];

    return NextResponse.json({
        report: 'vehicle-performance',
        vehicles: carPerformance.sort((a, b) => b.profit - a.profit)
    });
}

// Customer Report
async function getCustomerReport(startDate?: string | null, endDate?: string | null) {
    const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'client');
    const { data: bookings } = await supabase.from('bookings').select('*');

    // Customer stats
    const totalCustomers = profiles?.length || 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const newCustomersThisMonth = profiles?.filter(p => {
        const created = new Date(p.created_at);
        return created >= new Date(monthStart);
    }).length || 0;

    // Top customers
    const customerStats: Record<string, { fullName: string; bookings: number; totalSpent: number }> = {};
    bookings?.forEach(booking => {
        if (!customerStats[booking.user_id]) {
            const profile = profiles?.find(p => p.id === booking.user_id);
            customerStats[booking.user_id] = {
                fullName: profile?.full_name || 'Unknown',
                bookings: 0,
                totalSpent: 0
            };
        }
        customerStats[booking.user_id].bookings += 1;
        if (booking.status === 'completed' || booking.status === 'ongoing') {
            customerStats[booking.user_id].totalSpent += booking.total_price || 0;
        }
    });

    const topCustomers = Object.entries(customerStats)
        .map(([userId, stats]) => ({ userId, ...stats }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

    const avgBookingsPerCustomer = totalCustomers > 0 
        ? (Object.keys(customerStats).length / totalCustomers) 
        : 0;

    return NextResponse.json({
        report: 'customer',
        totalCustomers,
        newCustomersThisMonth,
        activeCustomers: Object.keys(customerStats).length,
        averageBookingsPerCustomer: avgBookingsPerCustomer.toFixed(2),
        topCustomers
    });
}

// Bookings Report
async function getBookingsReport(startDate?: string | null, endDate?: string | null) {
    let query = supabase.from('bookings').select('*');
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);
    const { data: bookings } = await query;

    const statusCounts: Record<string, number> = {};
    bookings?.forEach(b => {
        statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    });

    const totalBookings = bookings?.length || 0;
    const totalRevenue = bookings?.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + b.total_price, 0) || 0;

    // Daily bookings for trend
    const dailyBookings: Record<string, number> = {};
    bookings?.forEach(b => {
        const date = b.created_at.split('T')[0];
        dailyBookings[date] = (dailyBookings[date] || 0) + 1;
    });

    return NextResponse.json({
        report: 'bookings',
        totalBookings,
        totalRevenue,
        statusBreakdown: statusCounts,
        conversionRate: totalBookings > 0 
            ? ((statusCounts.completed || 0) / totalBookings * 100).toFixed(2) 
            : '0.00',
        dailyTrend: Object.entries(dailyBookings).map(([date, count]) => ({ date, count }))
    });
}

// Payments Report
async function getPaymentsReport(startDate?: string | null, endDate?: string | null) {
    let query = supabase.from('payments').select('*');
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);
    const { data: payments } = await query;

    const paymentMethodBreakdown: Record<string, number> = {};
    const paymentStatusBreakdown: Record<string, number> = {};

    payments?.forEach(p => {
        paymentMethodBreakdown[p.payment_type] = (paymentMethodBreakdown[p.payment_type] || 0) + p.amount;
        paymentStatusBreakdown[p.payment_status] = (paymentStatusBreakdown[p.payment_status] || 0) + 1;
    });

    return NextResponse.json({
        report: 'payments',
        totalTransactions: payments?.length || 0,
        totalAmount: payments?.reduce((sum, p) => sum + p.amount, 0) || 0,
        byMethod: paymentMethodBreakdown,
        byStatus: paymentStatusBreakdown
    });
}

// Overview Report (combines all)
async function getOverviewReport(startDate?: string | null, endDate?: string | null) {
    const dashboardResult = await getDashboardStats();
    const revenueResult = await getRevenueReport(startDate, endDate);
    const vehicleResult = await getVehiclePerformanceReport(startDate, endDate);
    const customerResult = await getCustomerReport(startDate, endDate);

    return NextResponse.json({
        report: 'overview',
        dashboard: dashboardResult,
        revenue: revenueResult,
        vehicles: vehicleResult,
        customers: customerResult
    });
}
