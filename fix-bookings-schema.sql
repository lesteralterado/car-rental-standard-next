-- Fix database schema inconsistency for bookings table
-- This script migrates from user_id directly on bookings to customer_id referencing customers table

-- First, ensure customers table exists
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create trigger to automatically create customer record when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_customer()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.customers (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create customer on user signup (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_customer') THEN
        CREATE TRIGGER on_auth_user_created_customer
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_customer();
    END IF;
END $$;

-- Populate customers table with existing profiles data
INSERT INTO customers (user_id, email, full_name, phone)
SELECT p.id, u.email, p.full_name, p.phone
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.user_id = p.id);

-- Add customer_id column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE;

-- Migrate existing user_id data to customer_id
UPDATE bookings SET customer_id = c.id
FROM customers c
WHERE bookings.user_id = c.user_id AND bookings.customer_id IS NULL;

-- Make customer_id NOT NULL after migration
ALTER TABLE bookings ALTER COLUMN customer_id SET NOT NULL;

-- Drop the old user_id column
ALTER TABLE bookings DROP COLUMN IF EXISTS user_id;

-- Update RLS policies for bookings table
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own pending bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;

CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own bookings" ON bookings
    FOR INSERT WITH CHECK (
        customer_id IN (
            SELECT id FROM customers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own pending bookings" ON bookings
    FOR UPDATE USING (
        customer_id IN (
            SELECT id FROM customers WHERE user_id = auth.uid()
        ) AND status = 'pending'
    );

CREATE POLICY "Admins can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all bookings" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Update RLS policies for customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own customer record" ON customers;
DROP POLICY IF EXISTS "Users can update their own customer record" ON customers;

CREATE POLICY "Users can view their own customer record" ON customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer record" ON customers
    FOR UPDATE USING (auth.uid() = user_id);

-- Update trigger functions that reference the old structure
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
RETURNS TRIGGER AS $$
DECLARE
    user_id UUID;
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Get user_id from customers table using customer_id
        SELECT c.user_id INTO user_id
        FROM customers c
        WHERE c.id = NEW.customer_id;

        IF user_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, type, title, message, booking_id)
            VALUES (
                user_id,
                CASE
                    WHEN NEW.status = 'confirmed' THEN 'booking_approved'
                    WHEN NEW.status = 'rejected' THEN 'booking_rejected'
                    ELSE 'booking_submitted'
                END,
                CASE
                    WHEN NEW.status = 'confirmed' THEN 'Booking Confirmed!'
                    WHEN NEW.status = 'rejected' THEN 'Booking Rejected'
                    ELSE 'Booking Update'
                END,
                CASE
                    WHEN NEW.status = 'confirmed' THEN 'Your booking has been confirmed. Please proceed with payment if not already done.'
                    WHEN NEW.status = 'rejected' THEN 'Your booking has been rejected. Please contact support for more information.'
                    ELSE 'Your booking status has been updated.'
                END,
                NEW.id
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;