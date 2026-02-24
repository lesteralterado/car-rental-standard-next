-- Fix for profile creation RLS policy issue
-- Run this in your Supabase SQL Editor

-- Add an INSERT policy that allows the trigger to create profiles
-- This bypasses the normal auth.uid() check for the trigger function

CREATE POLICY "System can create profiles" ON profiles
    FOR INSERT
    WITH CHECK (true);

-- Alternatively, if you want to be more specific, you can check if the insert is from the trigger
-- by using a custom function that the trigger calls
