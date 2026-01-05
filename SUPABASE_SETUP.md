# Supabase Setup Guide - Bookings Table

This guide will help you set up the bookings table in Supabase and connect it to your Next.js application.

## Prerequisites

- Supabase account (create one at https://supabase.com)
- A Supabase project created

## Step 1: Create Environment Variables

1. Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**How to find your credentials:**
- Go to your Supabase project dashboard
- Click "Project Settings" → "API"
- Copy the Project URL and anon public key

## Step 2: Create the Database Tables

1. In Supabase, go to the SQL Editor
2. Copy and paste the entire contents of `database-schema.sql`
3. Click "Run" to execute all SQL

**What gets created:**
- `profiles` - User profiles and roles
- `cars` - Vehicle catalog
- `bookings` - Booking records
- `inquiries` - Customer inquiries
- `notifications` - User notifications
- Required triggers and functions for automation

## Step 3: Enable Authentication

1. Go to Supabase Dashboard → "Authentication" → "Providers"
2. Enable "Email" provider (required for sign up/login)
3. (Optional) Enable other providers like Google, GitHub, etc.

## Step 4: Verify Your Setup

Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` and test:
1. Sign up a new account
2. Navigate to `/cars` to view the car catalog
3. Try to create a booking

## Step 5: Test the Bookings API

### Create a Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "car_id": "car-uuid-here",
    "pickup_date": "2024-12-20T10:00:00Z",
    "return_date": "2024-12-22T10:00:00Z",
    "pickup_location": "Manila",
    "total_price": 7500
  }'
```

### Get Bookings
```bash
curl http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Bookings Table Structure

The bookings table includes:

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | UUID | References profiles(id) |
| `car_id` | UUID | References cars(id) |
| `pickup_date` | TIMESTAMP | When rental starts |
| `return_date` | TIMESTAMP | When rental ends |
| `pickup_location` | TEXT | Pickup address |
| `dropoff_location` | TEXT | Return address (optional) |
| `status` | ENUM | pending, confirmed, rejected, completed, cancelled |
| `total_price` | DECIMAL | Total rental cost |
| `payment_status` | ENUM | pending, paid, failed, refunded |
| `payment_intent_id` | TEXT | Stripe payment ID |
| `drivers_license_verified` | BOOLEAN | License verification status |
| `admin_notes` | TEXT | Admin comments |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

## Row Level Security (RLS)

The bookings table has RLS enabled with these policies:

- **Users** can view and create their own bookings
- **Users** can only update pending bookings
- **Admins** can view and update all bookings

## Common Issues & Solutions

### 1. "Unauthorized" Error
**Problem:** Getting 401 errors when making API calls
**Solution:**
- Make sure you're logged in (check `/login` page)
- Verify your session token is valid
- Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly

### 2. "Car not found" Error
**Problem:** Bookings fail with car not found
**Solution:**
- Verify sample cars were inserted (check `cars` table in Supabase)
- Copy a valid car UUID from the cars table
- Use that UUID in your booking request

### 3. "Availability conflict"
**Problem:** Getting "Car is not available for selected dates"
**Solution:**
- Choose dates that don't conflict with existing bookings
- Check the `bookings` table for existing reservations
- Make sure `return_date` is after `pickup_date`

### 4. Foreign Key Constraint Error
**Problem:** "violates foreign key constraint"
**Solution:**
- Make sure the user_id (from auth.users) exists
- Make sure the car_id exists in the cars table
- Ensure you're logged in with a valid Supabase auth user

## API Endpoints

### GET /api/bookings
Fetch all bookings (users see their own, admins see all)

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)

**Response:**
```json
{
  "bookings": [...],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

### POST /api/bookings
Create a new booking

**Request Body:**
```json
{
  "car_id": "uuid",
  "pickup_date": "2024-12-20T10:00:00Z",
  "return_date": "2024-12-22T10:00:00Z",
  "pickup_location": "Manila",
  "dropoff_location": "Cebu",
  "total_price": 7500,
  "drivers_license_verified": true
}
```

## Database Triggers & Functions

1. **handle_new_user()** - Creates a profile when user signs up
2. **notify_booking_status_change()** - Creates notifications when booking status changes
3. **update_updated_at_column()** - Automatically updates the `updated_at` timestamp

## Next Steps

1. Customize the booking form in `app/components/providers/home/booking-modal.tsx`
2. Create an admin dashboard at `/admin/bookings` to manage bookings
3. Integrate payment processing with Stripe (payment_intent_id)
4. Set up email notifications for booking confirmations
5. Add cancellation and modification functionality

## Getting Help

- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Check the browser console for detailed error messages
- Check Supabase logs in the dashboard
