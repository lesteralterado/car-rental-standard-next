# Quick Booking Setup Checklist

## ✅ Bookings Table is Ready!

Your car rental application has a fully configured bookings system. Follow these steps to get it working:

## Step 1: Environment Setup (5 minutes)

```bash
# 1. Copy the example env file
cp .env.local.example .env.local

# 2. Get your Supabase credentials:
#    - Go to https://supabase.com/dashboard
#    - Select your project
#    - Settings → API
#    - Copy Project URL and anon key
```

**Edit `.env.local`:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 2: Database Setup (10 minutes)

1. **Create Tables in Supabase:**
   - Go to your Supabase project dashboard
   - Click "SQL Editor"
   - New Query
   - Copy entire `database-schema.sql` file
   - Click "Run"

2. **Verify Setup:**
   ```bash
   npm run verify:supabase
   ```

## Step 3: Test the Application (5 minutes)

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Test Checklist:
- [ ] Sign up a new account at `/signup`
- [ ] View cars at `/cars`
- [ ] Create a booking for a car
- [ ] View your bookings (if you have a bookings page)
- [ ] Check admin dashboard at `/admin` (if implemented)

## File Structure

```
your-project/
├── lib/
│   └── bookings.ts              ← Booking utilities
├── hooks/
│   ├── useAuth.js              ← Auth hook
│   └── useBookings.ts           ← NEW: Booking hook
├── api/
│   ├── client.js               ← Supabase client
│   └── bookings/
│       └── route.ts            ← Bookings API
├── database-schema.sql         ← Full DB schema
├── SUPABASE_SETUP.md          ← Detailed guide
├── .env.local                  ← Your credentials (CREATE THIS)
└── .env.local.example          ← Template
```

## Using Bookings in Your Components

### Example 1: Create Booking
```tsx
import { useBookings } from '@/hooks/useBookings';

export function BookingForm() {
  const { createBooking, loading } = useBookings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createBooking({
      car_id: 'car-uuid',
      pickup_date: '2024-12-20T10:00:00Z',
      return_date: '2024-12-22T10:00:00Z',
      pickup_location: 'Manila',
      total_price: 7500,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button disabled={loading}>
        {loading ? 'Creating...' : 'Book Now'}
      </button>
    </form>
  );
}
```

### Example 2: Check Availability
```tsx
import { useBookings } from '@/hooks/useBookings';

export function CarSelector() {
  const { checkAvailability } = useBookings();

  const handleDateChange = async (start, end) => {
    const available = await checkAvailability('car-uuid', start, end);
    console.log('Available:', available);
  };

  return (
    <div>
      {/* Date picker */}
    </div>
  );
}
```

### Example 3: Load User Bookings
```tsx
import { useBookings } from '@/hooks/useBookings';
import { useEffect } from 'react';

export function MyBookings() {
  const { bookings, loading, loadBookings } = useBookings();

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {bookings.map(booking => (
            <div key={booking.id}>
              <h3>{booking.car_id}</h3>
              <p>Status: {booking.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## API Endpoints

All endpoints require authentication.

### GET /api/bookings
Get user's bookings (or all bookings if admin)

**Query Parameters:**
```
?page=1&limit=10
```

**Response:**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "car_id": "uuid",
      "user_id": "uuid",
      "status": "pending",
      "total_price": 7500,
      "created_at": "2024-01-05T10:00:00Z",
      ...
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

### POST /api/bookings
Create a new booking

**Request:**
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

**Success Response (201):**
```json
{
  "booking": {
    "id": "uuid",
    "car_id": "uuid",
    ...
  }
}
```

## Database Schema

### bookings table
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL (references profiles),
  car_id UUID NOT NULL (references cars),
  pickup_date TIMESTAMP NOT NULL,
  return_date TIMESTAMP NOT NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT,
  status TEXT (pending|confirmed|rejected|completed|cancelled),
  total_price DECIMAL(10,2),
  payment_status TEXT (pending|paid|failed|refunded),
  payment_intent_id TEXT,
  drivers_license_verified BOOLEAN,
  admin_notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Troubleshooting

### Issue: "Unauthorized" Error
```
Solution: Make sure you're logged in first
- Visit /login or /signup
- Create an account
- Try booking again
```

### Issue: "Car not found"
```
Solution: Verify sample cars were created
- Run: npm run verify:supabase
- Check cars table in Supabase dashboard
- Make sure you're using a valid car_id
```

### Issue: Port 3000 already in use
```
Solution: Use a different port
npm run dev -- -p 3001
```

### Issue: Supabase environment variables not found
```
Solution: Create .env.local file
- Copy from .env.local.example
- Fill in your actual Supabase credentials
- Restart development server
```

## Next Features to Implement

- [ ] Payment processing with Stripe
- [ ] Email notifications for booking confirmations
- [ ] SMS notifications for pickup reminders
- [ ] Booking cancellation and modification
- [ ] Advanced filtering (price, features, location)
- [ ] Star ratings and reviews
- [ ] Admin dashboard for analytics
- [ ] Insurance options during booking
- [ ] Driver additional information collection
- [ ] Real-time availability updates

## Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Community:** https://supabase.com/community
- **Check Logs:** Supabase Dashboard → Logs

## Database Documentation

See `SUPABASE_SETUP.md` for:
- Detailed table structures
- Row Level Security (RLS) policies
- Database triggers and functions
- Complete API documentation
- Advanced troubleshooting

---

**Your bookings system is production-ready!** 🎉
