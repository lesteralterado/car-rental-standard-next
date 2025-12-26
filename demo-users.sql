-- Demo Users SQL Script
-- Run this in Supabase SQL Editor to create sample users

-- Note: In a real Supabase setup, you'd create users through the Auth API
-- For demo purposes, these are sample INSERT statements for the profiles table
-- The auth.users entries would need to be created through Supabase Auth first

-- Demo User 1: Regular Client
INSERT INTO profiles (
    id,
    role,
    full_name,
    phone,
    drivers_license_number,
    drivers_license_verified,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001', -- This would be the actual auth.users UUID
    'client',
    'Juan dela Cruz',
    '+63 917 123 4567',
    'A01-23-456789',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Demo User 2: Premium Client
INSERT INTO profiles (
    id,
    role,
    full_name,
    phone,
    drivers_license_number,
    drivers_license_verified,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'client',
    'Maria Santos',
    '+63 918 234 5678',
    'B02-34-567890',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Demo User 3: Admin User
INSERT INTO profiles (
    id,
    role,
    full_name,
    phone,
    drivers_license_number,
    drivers_license_verified,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'admin',
    'Admin User',
    '+63 919 345 6789',
    'C03-45-678901',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Sample bookings for demo users
INSERT INTO bookings (
    user_id,
    car_id,
    pickup_date,
    return_date,
    pickup_location,
    status,
    total_price,
    payment_status,
    created_at,
    updated_at
) VALUES
-- Juan dela Cruz's booking
(
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM cars WHERE name = 'Toyota Camry 2024' LIMIT 1),
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '5 days',
    'Manila',
    'confirmed',
    7500.00,
    'paid',
    NOW(),
    NOW()
),
-- Maria Santos's booking
(
    '550e8400-e29b-41d4-a716-446655440002',
    (SELECT id FROM cars WHERE name = 'BMW 3 Series 2024' LIMIT 1),
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '3 days',
    'Cebu',
    'pending',
    16500.00,
    'pending',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Sample inquiries for demo users
INSERT INTO inquiries (
    user_id,
    car_id,
    pickup_date,
    return_date,
    pickup_location,
    message,
    status,
    created_at,
    updated_at
) VALUES
-- Juan dela Cruz's inquiry
(
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM cars WHERE name = 'Honda CR-V 2024' LIMIT 1),
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '10 days',
    'Davao',
    'I would like to inquire about availability and any special rates for a week-long rental.',
    'pending',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;