-- Create customers table that links to Supabase auth.users
CREATE TABLE customers (
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

-- Trigger to create customer on user signup
CREATE TRIGGER on_auth_user_created_customer
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_customer();

-- RLS Policies for customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customer record" ON customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer record" ON customers
    FOR UPDATE USING (auth.uid() = user_id);

-- Update inquiries table to reference customers instead of direct user_id
-- (This assumes you want to keep the existing inquiries table structure)
-- If you want to change it, you can modify the foreign key

-- For now, let's update the code to use the customers table
-- The customer_id in inquiries should reference customers.id