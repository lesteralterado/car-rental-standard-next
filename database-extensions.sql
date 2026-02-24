-- Car Rental System - Additional Database Tables
-- Run this after the main database-schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing types if they need to be updated
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- Create updated types
CREATE TYPE user_role AS ENUM ('client', 'admin');

-- Updated booking status to include 'ongoing'
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'ongoing', 'completed', 'cancelled', 'rejected');

CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');

CREATE TYPE notification_type AS ENUM (
    'booking_submitted',
    'booking_approved',
    'booking_rejected',
    'payment_required',
    'payment_received',
    'license_verified',
    'pickup_reminder_3_days',
    'pickup_reminder_1_day',
    'pickup_reminder_2_hours',
    'return_reminder_1_day',
    'return_reminder_4_hours',
    'overdue_alert',
    'extension_requested',
    'extension_approved',
    'extension_rejected',
    'deposit_refunded',
    'maintenance_due'
);

CREATE TYPE payment_method AS ENUM ('gcash', 'bank_transfer', 'credit_card', 'debit_card', 'paymaya', 'cash');

CREATE TYPE inspection_type AS ENUM ('pickup', 'return', 'damage_report');

CREATE TYPE extension_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================
-- VEHICLE INSPECTIONS TABLE
-- ============================================
CREATE TABLE vehicle_inspections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    inspection_type inspection_type NOT NULL,
    inspection_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    inspector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Fuel level (1-8 scale, where 8 = full tank)
    fuel_level INTEGER CHECK (fuel_level >= 1 AND fuel_level <= 8),
    
    -- Odometer reading
    odometer_reading DECIMAL(10, 2),
    
    -- Vehicle condition notes
    overall_condition TEXT,
    
    -- Existing damages documented
    existing_damages JSONB DEFAULT '[]',
    
    -- Photos stored as JSON array of URLs
    photos JSONB DEFAULT '[]',
    
    -- Customer signature data
    customer_signature TEXT, -- Base64 or signature URL
    customer_signed_at TIMESTAMP WITH TIME ZONE,
    
    -- Staff signature data
    staff_signature TEXT,
    staff_signed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    payment_type payment_method NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    
    -- Payment details
    reference_number TEXT, -- GCash reference, bank reference, etc.
    transaction_id TEXT, -- External payment gateway ID
    payment_proof_url TEXT, -- Screenshot/proof of payment
    
    -- Deposit tracking
    is_deposit BOOLEAN DEFAULT FALSE,
    deposit_amount DECIMAL(10, 2),
    deposit_refunded BOOLEAN DEFAULT FALSE,
    deposit_refund_amount DECIMAL(10, 2),
    deposit_refunded_at TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    admin_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- RENTAL EXTENSIONS TABLE
-- ============================================
CREATE TABLE rental_extensions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    requested_extension_days INTEGER NOT NULL,
    new_return_date TIMESTAMP WITH TIME ZONE NOT NULL,
    extension_fee DECIMAL(10, 2) NOT NULL,
    
    status extension_status DEFAULT 'pending',
    admin_notes TEXT,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- LATE FEES TABLE
-- ============================================
CREATE TABLE late_fees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    
    original_return_date TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_return_date TIMESTAMP WITH TIME ZONE,
    hours_overdue INTEGER,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    total_late_fee DECIMAL(10, 2) NOT NULL,
    
    payment_status payment_status DEFAULT 'pending',
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- MAINTENANCE TABLE
-- ============================================
CREATE TABLE maintenance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
    
    maintenance_type TEXT NOT NULL, -- Oil change, tire rotation, major service, etc.
    description TEXT,
    
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    
    cost DECIMAL(10, 2),
    mechanic_shop TEXT,
    mechanic_contact TEXT,
    
    -- Next maintenance reminder
    next_maintenance_date DATE,
    mileage_at_service INTEGER,
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
    
    expense_type TEXT NOT NULL CHECK (expense_type IN ('fuel', 'maintenance', 'repair', 'insurance', 'registration', 'other')),
    amount DECIMAL(10, 2) NOT NULL,
    
    description TEXT,
    receipt_url TEXT,
    
    expense_date DATE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- PEAK SEASON PRICING TABLE
-- ============================================
CREATE TABLE peak_season_pricing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    name TEXT NOT NULL, -- e.g., "Christmas Season", "Holy Week"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Multiplier or fixed increase
    pricing_type TEXT DEFAULT 'multiplier' CHECK (pricing_type IN ('multiplier', 'fixed')),
    price_multiplier DECIMAL(3, 2) DEFAULT 1.00, -- e.g., 1.25 = 25% increase
    fixed_increase DECIMAL(10, 2) DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- NOTIFICATIONS LOG TABLE
-- ============================================
CREATE TABLE notifications_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    
    notification_type notification_type NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'push', 'in_app')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Delivery status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Error tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- External message ID (from SMS gateway, etc.)
    external_message_id TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- CUSTOMER DOCUMENTS TABLE
-- ============================================
CREATE TABLE customer_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    document_type TEXT NOT NULL CHECK (document_type IN ('valid_id', 'drivers_license', 'barangay_clearance', 'police_clearance', 'proof_of_billing', 'other')),
    document_name TEXT NOT NULL,
    document_url TEXT NOT NULL,
    
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    expiry_date DATE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- BLACKLISTED CUSTOMERS TABLE
-- ============================================
CREATE TABLE blacklist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    reason TEXT NOT NULL,
    blocked_until DATE, -- NULL means permanent
    blocked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- BRANCHES/LOCATIONS TABLE
-- ============================================
CREATE TABLE branches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., "Manila", "Cebu", "Davao"
    address TEXT,
    contact_number TEXT,
    email TEXT,
    
    -- Operating hours
    opening_time TIME,
    closing_time TIME,
    
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default branches
INSERT INTO branches (name, address, contact_number, email, opening_time, closing_time) VALUES
('Manila', 'Metro Manila, Philippines', '+63 2 8888 8888', 'manila@carrental.com', '08:00', '20:00'),
('Cebu', 'Cebu City, Philippines', '+63 32 888 8888', 'cebu@carrental.com', '08:00', '20:00'),
('Davao', 'Davao City, Philippines', '+63 82 888 8888', 'davao@carrental.com', '08:00', '20:00');

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Vehicle inspections policies
ALTER TABLE vehicle_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inspections" ON vehicle_inspections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = vehicle_inspections.booking_id
            AND bookings.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all inspections" ON vehicle_inspections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can create inspections" ON vehicle_inspections
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update inspections" ON vehicle_inspections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Payments policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Rental extensions policies
ALTER TABLE rental_extensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own extensions" ON rental_extensions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create extension requests" ON rental_extensions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all extensions" ON rental_extensions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Late fees policies
ALTER TABLE late_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own late fees" ON late_fees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = late_fees.booking_id
            AND bookings.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage late fees" ON late_fees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Maintenance policies
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view maintenance" ON maintenance
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage maintenance" ON maintenance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Expenses policies
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage expenses" ON expenses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can view expenses" ON expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Peak season pricing policies
ALTER TABLE peak_season_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view peak pricing" ON peak_season_pricing
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage peak pricing" ON peak_season_pricing
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Notifications log policies
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON notifications_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications" ON notifications_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Customer documents policies
ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents" ON customer_documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own documents" ON customer_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON customer_documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all documents" ON customer_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can verify documents" ON customer_documents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Blacklist policies
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can check if they're blacklisted" ON blacklist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage blacklist" ON blacklist
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Branches policies
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active branches" ON branches
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage branches" ON branches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ============================================
-- TRIGGER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables that have it
CREATE TRIGGER update_vehicle_inspections_updated_at
    BEFORE UPDATE ON vehicle_inspections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_extensions_updated_at
    BEFORE UPDATE ON rental_extensions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_late_fees_updated_at
    BEFORE UPDATE ON late_fees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_updated_at
    BEFORE UPDATE ON maintenance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peak_season_pricing_updated_at
    BEFORE UPDATE ON peak_season_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_documents_updated_at
    BEFORE UPDATE ON customer_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at
    BEFORE UPDATE ON branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_vehicle_inspections_booking ON vehicle_inspections(booking_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_rental_extensions_booking ON rental_extensions(booking_id);
CREATE INDEX idx_rental_extensions_status ON rental_extensions(status);
CREATE INDEX idx_late_fees_booking ON late_fees(booking_id);
CREATE INDEX idx_maintenance_car ON maintenance(car_id);
CREATE INDEX idx_maintenance_scheduled ON maintenance(scheduled_date);
CREATE INDEX idx_expenses_car ON expenses(car_id);
CREATE INDEX idx_expenses_type ON expenses(expense_type);
CREATE INDEX idx_notifications_log_user ON notifications_log(user_id);
CREATE INDEX idx_notifications_log_booking ON notifications_log(booking_id);
CREATE INDEX idx_notifications_log_type ON notifications_log(notification_type);
CREATE INDEX idx_customer_documents_user ON customer_documents(user_id);
CREATE INDEX idx_blacklist_user ON blacklist(user_id);
CREATE INDEX idx_branches_active ON branches(is_active);

-- ============================================
-- SAMPLE DATA - Peak Season Pricing
-- ============================================
INSERT INTO peak_season_pricing (name, start_date, end_date, pricing_type, price_multiplier, is_active, notes) VALUES
('Christmas Season', '2024-12-20', '2025-01-05', 'multiplier', 1.25, true, '25% increase during Christmas and New Year'),
('Holy Week', '2025-04-10', '2025-04-20', 'multiplier', 1.15, true, '15% increase during Holy Week'),
('Summer Season', '2025-03-01', '2025-05-31', 'multiplier', 1.10, true, '10% increase during summer vacation');

-- ============================================
-- FUNCTION TO CALCULATE LATE FEE
-- ============================================
CREATE OR REPLACE FUNCTION calculate_late_fee(
    p_booking_id UUID,
    p_hourly_rate DECIMAL(10, 2) DEFAULT 100.00
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    v_late_fee DECIMAL(10, 2) := 0;
    v_hours_overdue INTEGER;
    v_return_date TIMESTAMP WITH TIME ZONE;
    v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    -- Get the booking return date
    SELECT return_date INTO v_return_date
    FROM bookings WHERE id = p_booking_id;
    
    IF v_return_date IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate hours overdue (minimum 1 hour charge)
    v_hours_overdue := EXTRACT(EPOCH FROM (v_now - v_return_date)) / 3600;
    
    IF v_hours_overdue > 0 THEN
        -- Charge for full hours, minimum 1 hour
        v_hours_overdue := GREATEST(v_hours_overdue, 1);
        v_late_fee := v_hours_overdue * p_hourly_rate;
    END IF;
    
    RETURN v_late_fee;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION TO CHECK BLACKLISTED USER
-- ============================================
CREATE OR REPLACE FUNCTION is_user_blacklisted(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_blocked BOOLEAN := FALSE;
    v_blocked_until DATE;
BEGIN
    SELECT blocked_until INTO v_blocked_until
    FROM blacklist WHERE user_id = p_user_id;
    
    IF FOUND THEN
        -- Check if block is permanent or still valid
        IF v_blocked_until IS NULL OR v_blocked_until >= CURRENT_DATE THEN
            v_blocked := TRUE;
        END IF;
    END IF;
    
    RETURN v_blocked;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION TO GET PEAK SEASON MULTIPLIER
-- ============================================
CREATE OR REPLACE FUNCTION get_peak_season_multiplier(p_date DATE)
RETURNS DECIMAL(3, 2) AS $$
DECLARE
    v_multiplier DECIMAL(3, 2) := 1.00;
BEGIN
    SELECT COALESCE(price_multiplier, 1.00) INTO v_multiplier
    FROM peak_season_pricing
    WHERE is_active = true
    AND p_date BETWEEN start_date AND end_date
    LIMIT 1;
    
    RETURN v_multiplier;
END;
$$ LANGUAGE plpgsql;
