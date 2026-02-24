-- Car Rental System Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('client', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'rejected', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE notification_type AS ENUM ('booking_submitted', 'booking_approved', 'booking_rejected', 'payment_required', 'license_verification');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    role user_role DEFAULT 'client',
    full_name TEXT,
    phone TEXT,
    drivers_license_number TEXT,
    drivers_license_verified BOOLEAN DEFAULT FALSE,
    drivers_license_url TEXT, -- URL to uploaded license image
    password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Cars table
CREATE TABLE cars (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('economy', 'compact', 'mid-size', 'full-size', 'luxury', 'suv', 'van')),
    price_per_day DECIMAL(10,2) NOT NULL,
    price_per_week DECIMAL(10,2),
    price_per_month DECIMAL(10,2),
    images TEXT[] DEFAULT '{}', -- Array of image URLs
    features TEXT[] DEFAULT '{}', -- Array of features
    specifications JSONB DEFAULT '{}', -- JSON object with seats, transmission, fuel, doors, luggage, airConditioning
    availability JSONB DEFAULT '{"available": true, "locations": [], "unavailableDates": []}', -- JSON object
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    description TEXT,
    popular BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Bookings table
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
    pickup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_location TEXT NOT NULL,
    dropoff_location TEXT,
    status booking_status DEFAULT 'pending',
    total_price DECIMAL(10,2) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    payment_intent_id TEXT, -- Stripe payment intent ID
    drivers_license_verified BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inquiries table
CREATE TABLE inquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    pickup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_location TEXT NOT NULL,
    dropoff_location TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
    admin_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert sample cars
INSERT INTO cars (
    name, brand, model, year, category, price_per_day, price_per_week, price_per_month,
    images, features, specifications, availability, rating, review_count, description, popular, featured
) VALUES
('Toyota Camry 2024', 'Toyota', 'Camry', 2024, 'mid-size', 2500.00, 16500.00, 65000.00,
 '{"https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop"}',
 '{"Bluetooth", "Backup Camera", "Cruise Control", "USB Ports", "Lane Assist"}',
 '{"seats": 5, "transmission": "automatic", "fuel": "gasoline", "doors": 4, "luggage": 3, "airConditioning": true}',
 '{"available": true, "locations": ["Manila", "Cebu", "Davao"], "unavailableDates": []}',
 4.8, 124, 'Reliable and comfortable mid-size sedan perfect for business trips and family outings.', true, true),

('Honda CR-V 2024', 'Honda', 'CR-V', 2024, 'suv', 3200.00, 21000.00, 85000.00,
 '{"https://images.unsplash.com/photo-1519641384142-9b3c08c8b7c1?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop"}',
 '{"All-Wheel Drive", "Sunroof", "Leather Seats", "Navigation", "Apple CarPlay"}',
 '{"seats": 5, "transmission": "automatic", "fuel": "gasoline", "doors": 4, "luggage": 4, "airConditioning": true}',
 '{"available": true, "locations": ["Manila", "Cebu"], "unavailableDates": []}',
 4.9, 89, 'Spacious SUV with excellent fuel economy and advanced safety features.', true, true),

('BMW 3 Series 2024', 'BMW', '3 Series', 2024, 'luxury', 5500.00, 35000.00, 140000.00,
 '{"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1617886322464-7b3ba542b2fd?w=800&h=600&fit=crop"}',
 '{"Premium Sound", "Heated Seats", "Wireless Charging", "Heads-up Display", "Premium Interior"}',
 '{"seats": 5, "transmission": "automatic", "fuel": "gasoline", "doors": 4, "luggage": 3, "airConditioning": true}',
 '{"available": true, "locations": ["Manila"], "unavailableDates": []}',
 4.7, 156, 'Ultimate driving machine with luxurious features and exceptional performance.', false, true);

-- Create admin user (you'll need to register this user first, then update their role)
-- After creating an admin user, run: UPDATE profiles SET role = 'admin' WHERE id = 'user-uuid-here';

-- Row Level Security (RLS) Policies

-- Profiles policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Cars policies (public read, admin write)
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cars" ON cars
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage cars" ON cars
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Bookings policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending bookings" ON bookings
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

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

-- Inquiries policies
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inquiries" ON inquiries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inquiries" ON inquiries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending inquiries" ON inquiries
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all inquiries" ON inquiries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all inquiries" ON inquiries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Notifications policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Functions and Triggers

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create notification on booking status change
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

-- Trigger for booking status notifications
CREATE TRIGGER on_booking_status_change
    AFTER UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION public.notify_booking_status_change();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();