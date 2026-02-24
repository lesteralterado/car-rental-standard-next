// types/extended.ts - Extended types for car rental workflow

// ============================================
// ENUMS
// ============================================

export type UserRole = 'client' | 'admin';

export type BookingStatus = 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled' | 'rejected';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export type PaymentMethod = 'gcash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'paymaya' | 'cash';

export type InspectionType = 'pickup' | 'return' | 'damage_report';

export type ExtensionStatus = 'pending' | 'approved' | 'rejected';

export type NotificationType =
    | 'booking_submitted'
    | 'booking_approved'
    | 'booking_rejected'
    | 'payment_required'
    | 'payment_received'
    | 'license_verified'
    | 'pickup_reminder_3_days'
    | 'pickup_reminder_1_day'
    | 'pickup_reminder_2_hours'
    | 'return_reminder_1_day'
    | 'return_reminder_4_hours'
    | 'overdue_alert'
    | 'extension_requested'
    | 'extension_approved'
    | 'extension_rejected'
    | 'deposit_refunded'
    | 'maintenance_due';

export type ExpenseType = 'fuel' | 'maintenance' | 'repair' | 'insurance' | 'registration' | 'other';

export type DocumentType = 'valid_id' | 'drivers_license' | 'barangay_clearance' | 'police_clearance' | 'proof_of_billing' | 'other';

// ============================================
// VEHICLE INSPECTION TYPES
// ============================================

export interface VehicleDamage {
    location: string; // e.g., "front bumper", "left door"
    description: string;
    severity: 'minor' | 'moderate' | 'major';
    photo_url?: string;
}

export interface VehicleInspection {
    id: string;
    booking_id: string;
    inspection_type: InspectionType;
    inspection_date: string;
    inspector_id?: string;
    
    // Fuel level (1-8 scale)
    fuel_level?: number;
    
    // Odometer reading
    odometer_reading?: number;
    
    // Vehicle condition
    overall_condition?: string;
    existing_damages?: VehicleDamage[];
    
    // Photos
    photos?: string[];
    
    // Signatures
    customer_signature?: string;
    customer_signed_at?: string;
    staff_signature?: string;
    staff_signed_at?: string;
    
    created_at: string;
    updated_at: string;
}

export interface VehicleInspectionInput {
    booking_id: string;
    inspection_type: InspectionType;
    fuel_level?: number;
    odometer_reading?: number;
    overall_condition?: string;
    existing_damages?: VehicleDamage[];
    photos?: string[];
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface Payment {
    id: string;
    booking_id: string;
    user_id: string;
    
    payment_type: PaymentMethod;
    amount: number;
    payment_status: PaymentStatus;
    
    // Payment details
    reference_number?: string;
    transaction_id?: string;
    payment_proof_url?: string;
    
    // Deposit tracking
    is_deposit: boolean;
    deposit_amount?: number;
    deposit_refunded: boolean;
    deposit_refund_amount?: number;
    deposit_refunded_at?: string;
    
    // Notes
    admin_notes?: string;
    
    created_at: string;
    updated_at: string;
}

export interface PaymentInput {
    booking_id: string;
    payment_type: PaymentMethod;
    amount: number;
    is_deposit?: boolean;
    deposit_amount?: number;
    reference_number?: string;
    transaction_id?: string;
    payment_proof_url?: string;
}

// ============================================
// RENTAL EXTENSION TYPES
// ============================================

export interface RentalExtension {
    id: string;
    booking_id: string;
    user_id: string;
    
    requested_extension_days: number;
    new_return_date: string;
    extension_fee: number;
    
    status: ExtensionStatus;
    admin_notes?: string;
    reviewed_by?: string;
    reviewed_at?: string;
    
    created_at: string;
    updated_at: string;
}

export interface RentalExtensionInput {
    booking_id: string;
    requested_extension_days: number;
    new_return_date: string;
    extension_fee: number;
}

// ============================================
// LATE FEE TYPES
// ============================================

export interface LateFee {
    id: string;
    booking_id: string;
    
    original_return_date: string;
    actual_return_date?: string;
    hours_overdue?: number;
    hourly_rate: number;
    total_late_fee: number;
    
    payment_status: PaymentStatus;
    paid_amount: number;
    
    created_at: string;
    updated_at: string;
}

// ============================================
// MAINTENANCE TYPES
// ============================================

export interface Maintenance {
    id: string;
    car_id: string;
    
    maintenance_type: string;
    description?: string;
    
    scheduled_date: string;
    completed_date?: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    
    cost?: number;
    mechanic_shop?: string;
    mechanic_contact?: string;
    
    next_maintenance_date?: string;
    mileage_at_service?: number;
    
    notes?: string;
    
    created_at: string;
    updated_at: string;
}

export interface MaintenanceInput {
    car_id: string;
    maintenance_type: string;
    description?: string;
    scheduled_date: string;
    cost?: number;
    mechanic_shop?: string;
    mechanic_contact?: string;
    next_maintenance_date?: string;
    mileage_at_service?: number;
    notes?: string;
}

// ============================================
// EXPENSE TYPES
// ============================================

export interface Expense {
    id: string;
    car_id: string;
    
    expense_type: ExpenseType;
    amount: number;
    
    description?: string;
    receipt_url?: string;
    
    expense_date: string;
    
    created_at: string;
    updated_at: string;
}

export interface ExpenseInput {
    car_id: string;
    expense_type: ExpenseType;
    amount: number;
    description?: string;
    receipt_url?: string;
    expense_date: string;
}

// ============================================
// PEAK SEASON PRICING TYPES
// ============================================

export interface PeakSeasonPricing {
    id: string;
    
    name: string;
    start_date: string;
    end_date: string;
    
    pricing_type: 'multiplier' | 'fixed';
    price_multiplier: number; // e.g., 1.25 = 25% increase
    fixed_increase: number;
    
    is_active: boolean;
    notes?: string;
    
    created_at: string;
    updated_at: string;
}

export interface PeakSeasonPricingInput {
    name: string;
    start_date: string;
    end_date: string;
    pricing_type?: 'multiplier' | 'fixed';
    price_multiplier?: number;
    fixed_increase?: number;
    is_active?: boolean;
    notes?: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    booking_id?: string;
    inquiry_id?: string;
    created_at: string;
}

export interface NotificationLog {
    id: string;
    user_id: string;
    booking_id?: string;
    
    notification_type: NotificationType;
    channel: 'sms' | 'email' | 'push' | 'in_app';
    title: string;
    message: string;
    
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    sent_at?: string;
    delivered_at?: string;
    
    error_message?: string;
    retry_count: number;
    external_message_id?: string;
    
    created_at: string;
}

// ============================================
// CUSTOMER DOCUMENT TYPES
// ============================================

export interface CustomerDocument {
    id: string;
    user_id: string;
    
    document_type: DocumentType;
    document_name: string;
    document_url: string;
    
    is_verified: boolean;
    verified_by?: string;
    verified_at?: string;
    
    expiry_date?: string;
    notes?: string;
    
    created_at: string;
    updated_at: string;
}

export interface CustomerDocumentInput {
    document_type: DocumentType;
    document_name: string;
    document_url: string;
    expiry_date?: string;
}

// ============================================
// BLACKLIST TYPES
// ============================================

export interface BlacklistEntry {
    id: string;
    user_id: string;
    
    reason: string;
    blocked_until?: string; // NULL means permanent
    blocked_by?: string;
    
    created_at: string;
}

// ============================================
// BRANCH/LOCATION TYPES
// ============================================

export interface Branch {
    id: string;
    name: string; // e.g., "Manila", "Cebu", "Davao"
    address?: string;
    contact_number?: string;
    email?: string;
    
    opening_time?: string; // HH:MM format
    closing_time?: string;
    
    is_active: boolean;
    notes?: string;
    
    created_at: string;
    updated_at: string;
}

// ============================================
// EXTENDED BOOKING TYPE
// ============================================

export interface ExtendedBooking {
    id: string;
    user_id: string;
    car_id: string;
    pickup_date: string;
    return_date: string;
    pickup_location: string;
    dropoff_location?: string | null;
    status: BookingStatus;
    total_price: number;
    payment_status: PaymentStatus;
    payment_intent_id?: string | null;
    drivers_license_verified: boolean;
    admin_notes?: string | null;
    created_at: string;
    updated_at: string;
    
    // Extended fields
    security_deposit_amount?: number;
    security_deposit_paid?: boolean;
    insurance_option?: boolean;
    insurance_cost?: number;
    delivery_fee?: number;
    booking_reference?: string;
    
    // Related data
    car?: {
        id: string;
        name: string;
        brand: string;
        model: string;
        year: number;
        images?: string[];
        price_per_day: number;
    };
    user?: {
        id: string;
        full_name: string;
        email: string;
        phone?: string;
    };
    payments?: Payment[];
    inspections?: VehicleInspection[];
    extension?: RentalExtension;
}

// ============================================
// DASHBOARD STATS TYPES
// ============================================

export interface DashboardStats {
    // Today's metrics
    todayPickups: number;
    todayReturns: number;
    ongoingRentals: number;
    availableVehicles: number;
    maintenanceVehicles: number;
    overdueRentals: number;
    
    // Financial metrics
    revenueToday: number;
    revenueThisWeek: number;
    revenueThisMonth: number;
    pendingDeposits: number;
    pendingRefunds: number;
    
    // Booking metrics
    pendingBookings: number;
    confirmedBookings: number;
    completedThisMonth: number;
    cancelledThisMonth: number;
}

// ============================================
// REPORT TYPES
// ============================================

export interface RevenueReport {
    period: string;
    totalRevenue: number;
    totalBookings: number;
    averageBookingValue: number;
    depositCollected: number;
    depositRefunded: number;
    lateFeesCollected: number;
}

export interface VehiclePerformanceReport {
    car_id: string;
    car_name: string;
    totalBookings: number;
    totalRevenue: number;
    utilizationRate: number; // percentage
    averageRentalDays: number;
    maintenanceCost: number;
    profit: number;
}

export interface CustomerReport {
    totalCustomers: number;
    newCustomersThisMonth: number;
    returningCustomers: number;
    topCustomers: Array<{
        user_id: string;
        full_name: string;
        totalBookings: number;
        totalSpent: number;
    }>;
    customerLifetimeValue: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ============================================
// PRICE CALCULATION TYPES
// ============================================

export interface PriceBreakdown {
    basePrice: number;
    days: number;
    peakSeasonMultiplier: number;
    peakSeasonSurcharge: number;
    insuranceCost: number;
    deliveryFee: number;
    securityDeposit: number;
    subtotal: number;
    tax: number;
    total: number;
}

export interface AvailabilityCheck {
    carId: string;
    available: boolean;
    reason?: string;
    conflictingBookings?: string[];
}
