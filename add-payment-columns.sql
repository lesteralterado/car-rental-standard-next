-- Migration: Add payment_method and payment_reference to bookings table
-- Run this to enable GCash and Bank transfer payment options

-- Add payment_method column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE bookings ADD COLUMN payment_method TEXT;
    END IF;
END $$;

-- Add payment_reference column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'payment_reference'
    ) THEN
        ALTER TABLE bookings ADD COLUMN payment_reference TEXT;
    END IF;
END $$;

-- Add index for faster queries on payment status
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method) WHERE payment_method IS NOT NULL;
