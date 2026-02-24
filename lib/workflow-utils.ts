// lib/workflow-utils.ts - Utility functions for car rental workflow

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// PRICE CALCULATIONS
// ============================================

/**
 * Calculate total rental price with peak season pricing
 */
export async function calculateRentalPrice(
    carId: string,
    pickupDate: string,
    returnDate: string,
    insuranceCost: number = 0,
    deliveryFee: number = 0,
    securityDeposit: number = 0
): Promise<{
    basePrice: number;
    days: number;
    peakSurcharge: number;
    subtotal: number;
    insurance: number;
    delivery: number;
    deposit: number;
    total: number;
}> {
    const { data: car } = await supabase
        .from('cars')
        .select('price_per_day')
        .eq('id', carId)
        .single();

    const { data: peakSeasons } = await supabase
        .from('peak_season_pricing')
        .select('start_date, end_date, price_multiplier')
        .eq('is_active', true);

    const basePrice = car?.price_per_day || 0;
    const days = Math.ceil(
        (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24)
    ) || 1;

    // Calculate with peak season
    const { totalPrice, peakSurcharge } = calculatePeakSeasonPrice(
        basePrice,
        pickupDate,
        returnDate,
        peakSeasons || []
    );

    const subtotal = totalPrice;
    const total = subtotal + insuranceCost + deliveryFee + securityDeposit;

    return {
        basePrice,
        days,
        peakSurcharge,
        subtotal,
        insurance: insuranceCost,
        delivery: deliveryFee,
        deposit: securityDeposit,
        total: Math.round(total * 100) / 100
    };
}

/**
 * Calculate peak season price (internal helper)
 */
function calculatePeakSeasonPrice(
    basePrice: number,
    startDate: string,
    endDate: string,
    peakSeasons: Array<{ start_date: string; end_date: string; price_multiplier: number }>
): { totalPrice: number; peakSurcharge: number } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    let totalPrice = 0;
    let peakSurcharge = 0;

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
    }

    return { totalPrice, peakSurcharge };
}

/**
 * Calculate late fee for overdue rentals
 */
export function calculateLateFee(
    hourlyRate: number,
    hoursOverdue: number,
    minimumCharge: number = 100
): number {
    const fee = hoursOverdue * hourlyRate;
    return Math.max(fee, minimumCharge);
}

/**
 * Calculate deposit refund amount
 */
export function calculateDepositRefund(
    depositAmount: number,
    damageCharges: number,
    lateFees: number,
    fuelCharges: number
): {
    totalDeductions: number;
    refundAmount: number;
} {
    const totalDeductions = damageCharges + lateFees + fuelCharges;
    const refundAmount = Math.max(0, depositAmount - totalDeductions);

    return {
        totalDeductions,
        refundAmount
    };
}

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format time for display
 */
export function formatTime(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Calculate days between two dates
 */
export function getDaysBetween(start: string | Date, end: string | Date): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: string | Date): boolean {
    return new Date(date) < new Date();
}

/**
 * Get reminder dates for a booking
 */
export function getReminderDates(pickupDate: string): {
    threeDaysBefore: Date;
    oneDayBefore: Date;
    twoHoursBefore: Date;
} {
    const pickup = new Date(pickupDate);
    
    return {
        threeDaysBefore: new Date(pickup.getTime() - 3 * 24 * 60 * 60 * 1000),
        oneDayBefore: new Date(pickup.getTime() - 1 * 24 * 60 * 60 * 1000),
        twoHoursBefore: new Date(pickup.getTime() - 2 * 60 * 60 * 1000)
    };
}

/**
 * Get return reminder dates
 */
export function getReturnReminderDates(returnDate: string): {
    oneDayBefore: Date;
    fourHoursBefore: Date;
} {
    const returnD = new Date(returnDate);
    
    return {
        oneDayBefore: new Date(returnD.getTime() - 1 * 24 * 60 * 60 * 1000),
        fourHoursBefore: new Date(returnD.getTime() - 4 * 60 * 60 * 1000)
    };
}

// ============================================
// BOOKING UTILITIES
// ============================================

/**
 * Generate booking reference number
 */
export function generateBookingReference(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BR-${timestamp}-${random}`;
}

/**
 * Check if user is blacklisted
 */
export async function isUserBlacklisted(userId: string): Promise<boolean> {
    const { data: blacklistEntry } = await supabase
        .from('blacklist')
        .select('id, blocked_until')
        .eq('user_id', userId)
        .single();

    if (!blacklistEntry) return false;

    // If blocked_until is null, it's a permanent ban
    if (blacklistEntry.blocked_until === null) return true;

    // Check if ban has expired
    return new Date(blacklistEntry.blocked_until) > new Date();
}

/**
 * Check if car is available for booking
 */
export async function isCarAvailable(
    carId: string,
    pickupDate: string,
    returnDate: string,
    excludeBookingId?: string
): Promise<{ available: boolean; reason?: string }> {
    // Check car availability status
    const { data: car } = await supabase
        .from('cars')
        .select('availability')
        .eq('id', carId)
        .single();

    if (!car?.availability?.available) {
        return { available: false, reason: 'Car is not available' };
    }

    // Check for conflicting bookings
    let query = supabase
        .from('bookings')
        .select('id')
        .eq('car_id', carId)
        .neq('status', 'cancelled')
        .neq('status', 'rejected')
        .or(`and(pickup_date.lte.${returnDate},return_date.gte.${pickupDate})`);

    if (excludeBookingId) {
        query = query.neq('id', excludeBookingId);
    }

    const { data: conflicts } = await query;

    if (conflicts && conflicts.length > 0) {
        return { available: false, reason: 'Car is booked for the selected dates' };
    }

    return { available: true };
}

/**
 * Get booking statistics for dashboard
 */
export async function getBookingStats(): Promise<{
    pending: number;
    confirmed: number;
    ongoing: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
}> {
    const { data: bookings } = await supabase
        .from('bookings')
        .select('status, total_price, payment_status');

    const stats = {
        pending: 0,
        confirmed: 0,
        ongoing: 0,
        completed: 0,
        cancelled: 0,
        totalRevenue: 0
    };

    bookings?.forEach((booking) => {
        const status = booking.status as keyof typeof stats;
        if (status in stats) {
            stats[status] = (stats[status] || 0) + 1;
        }
        if (booking.payment_status === 'paid') {
            stats.totalRevenue += booking.total_price || 0;
        }
    });

    return stats;
}

// ============================================
// NOTIFICATION UTILITIES
// ============================================

/**
 * Get notification message templates
 */
export const notificationTemplates = {
    bookingConfirmation: (ref: string, car: string, dates: string) =>
        `Booking confirmed! Reference: ${ref}. Your ${car} rental for ${dates} has been confirmed.`,

    pickupReminder3Days: (car: string, date: string) =>
        `Reminder: Your ${car} rental is in 3 days (${date}). Please prepare your valid ID and driver's license.`,

    pickupReminder1Day: (car: string, time: string, location: string) =>
        `Reminder: Pick up your ${car} tomorrow at ${time} from ${location}. Bring valid ID and payment.`,

    returnReminder1Day: (car: string, time: string, location: string) =>
        `Please return your ${car} tomorrow by ${time} to ${location}.`,

    returnReminder4Hours: (car: string, time: string) =>
        `Return your ${car} by ${time}. 4 hours remaining!`,

    overdueAlert: (car: string, hours: number, fee: number) =>
        `Your ${car} rental is overdue by ${hours} hours. Late fee: ₱${fee}. Please return immediately.`,

    extensionRequested: (car: string, newDate: string) =>
        `Your request to extend your ${car} rental until ${newDate} has been submitted.`,

    extensionApproved: (car: string, newDate: string, fee: number) =>
        `Extension approved! Your ${car} can now be kept until ${newDate}. Additional fee: ₱${fee}`,

    depositRefunded: (amount: number) =>
        `Your security deposit of ₱${amount} has been refunded to your original payment method.`
};

// ============================================
// FORMATTING UTILITIES
// ============================================

/**
 * Format currency for Philippine Pesos
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('63')) {
        return `+${cleaned}`;
    }
    if (cleaned.startsWith('0')) {
        return `+63${cleaned.slice(1)}`;
    }
    return phone;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'yellow',
        confirmed: 'green',
        ongoing: 'blue',
        completed: 'gray',
        cancelled: 'red',
        rejected: 'red',
        paid: 'green',
        failed: 'red',
        refunded: 'gray'
    };
    return colors[status] || 'gray';
}

/**
 * Get payment status badge color
 */
export function getPaymentStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'yellow',
        paid: 'green',
        failed: 'red',
        refunded: 'gray',
        partially_refunded: 'orange'
    };
    return colors[status] || 'gray';
}
