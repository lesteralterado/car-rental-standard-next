-- ============================================
-- FIX: Account Creation and Profile Setup
-- Run this in Supabase SQL Editor step by step
-- ============================================

-- Step 1: Check if profiles table exists, if not create it
SELECT 'Step 1: Creating profiles table...' as status;

CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role DEFAULT 'client',
    full_name TEXT,
    phone TEXT,
    drivers_license_number TEXT,
    drivers_license_verified BOOLEAN DEFAULT FALSE,
    drivers_license_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 2: Create the function to auto-create profile on user signup
SELECT 'Step 2: Creating trigger function...' as status;

DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create trigger
SELECT 'Step 3: Creating trigger...' as status;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Create profiles for existing users who don't have profiles yet
SELECT 'Step 4: Creating profiles for existing users...' as status;

INSERT INTO profiles (id, full_name)
SELECT auth.users.id, auth.users.raw_user_meta_data->>'name'
FROM auth.users
LEFT JOIN profiles ON auth.users.id = profiles.id
WHERE profiles.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 5: Enable RLS on profiles
SELECT 'Step 5: Setting up RLS on profiles...' as status;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

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

-- Step 6: Add user_id column to bookings if needed
SELECT 'Step 6: Checking bookings table...' as status;

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'user_id') THEN
        RAISE NOTICE 'user_id column already exists in bookings';
    ELSE
        ALTER TABLE bookings ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added user_id column to bookings';
    END IF;
END $$;

-- Step 7: Set up RLS on bookings
SELECT 'Step 7: Setting up RLS on bookings...' as status;

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;

CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Verify the setup
SELECT 'Setup complete!' as status;
SELECT 'Profiles count:' as label, COUNT(*) as value FROM profiles;
SELECT 'Auth users count:' as label, COUNT(*) as value FROM auth.users;
