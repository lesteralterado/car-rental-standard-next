-- Update existing cars table to match new schema
-- Run these commands in Supabase SQL Editor

-- First, rename image_url to images and change to array type
ALTER TABLE cars ADD COLUMN IF NOT EXISTS images_temp TEXT[];
UPDATE cars SET images_temp = ARRAY[image_url] WHERE image_url IS NOT NULL;
ALTER TABLE cars DROP COLUMN IF EXISTS image_url;
ALTER TABLE cars RENAME COLUMN images_temp TO images;
ALTER TABLE cars ALTER COLUMN images SET DEFAULT '{}';
ALTER TABLE cars ALTER COLUMN images SET NOT NULL;

-- Add missing columns to the existing cars table
ALTER TABLE cars ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('economy', 'compact', 'mid-size', 'full-size', 'luxury', 'suv', 'van'));
ALTER TABLE cars ADD COLUMN IF NOT EXISTS price_per_week DECIMAL(10,2);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS price_per_month DECIMAL(10,2);
ALTER TABLE cars ALTER COLUMN features TYPE TEXT[];
ALTER TABLE cars ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}';
ALTER TABLE cars ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{"available": true, "locations": [], "unavailableDates": []}';
ALTER TABLE cars ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT FALSE;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Update existing records with default values
UPDATE cars SET
  name = COALESCE(name, make || ' ' || model),
  brand = COALESCE(brand, make),
  category = COALESCE(category, 'economy'),
  year = COALESCE(year, 2023),
  availability = COALESCE(availability, '{"available": true, "locations": [], "unavailableDates": []}'),
  specifications = COALESCE(specifications, '{}'),
  features = COALESCE(features, '{}')
WHERE name IS NULL OR brand IS NULL;