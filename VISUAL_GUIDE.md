# 🗺️ Bookings System - Visual Guide & Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │         React Components (Your Pages)                │       │
│  │  - Car browsing                                      │       │
│  │  - Booking form                                      │       │
│  │  - My bookings list                                  │       │
│  └──────────────────────────────────────────────────────┘       │
│            ↓ useBookings() hook                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │         hooks/useBookings.ts                         │       │
│  │  - Loading states                                    │       │
│  │  - Error handling                                    │       │
│  │  - Toast notifications                               │       │
│  └──────────────────────────────────────────────────────┘       │
│            ↓ lib/bookings.ts functions                           │
└─────────────────────────────────────────────────────────────────┘
         ↓ HTTP API calls
┌─────────────────────────────────────────────────────────────────┐
│                  Next.js Server (Backend)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │         app/api/bookings/route.ts                    │       │
│  │  - GET: Fetch bookings                               │       │
│  │  - POST: Create booking                              │       │
│  │  - Authentication check                              │       │
│  │  - Availability check                                │       │
│  └──────────────────────────────────────────────────────┘       │
│            ↓ Supabase client                                     │
└─────────────────────────────────────────────────────────────────┘
         ↓ SQL queries
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Database                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐            │
│  │  profiles   │  │    cars     │  │  bookings    │ ← YOU HERE │
│  │  table      │  │  table      │  │  table       │            │
│  ├─────────────┤  ├─────────────┤  ├──────────────┤            │
│  │ id          │  │ id          │  │ id           │            │
│  │ full_name   │  │ name        │  │ user_id      │────────┐   │
│  │ role        │  │ brand       │  │ car_id       │─┐      │   │
│  │ ...         │  │ ...         │  │ status       │ │      │   │
│  └─────────────┘  └─────────────┘  │ total_price  │ │      │   │
│       ↑                   ↑          │ ...         │ │      │   │
│       └───────────────────┴──────────├──────────────┘ │      │   │
│                         Foreign Keys  │               │      │   │
│                                      └───────────────┴──────┘   │
│                                                                   │
│  Row Level Security (RLS):                                       │
│  - Users see only their own bookings                             │
│  - Admins see all bookings                                       │
│                                                                   │
│  Automatic Triggers:                                             │
│  - Updated timestamps                                            │
│  - Notifications on status change                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## File Organization

```
project-root/
│
├── 📚 Documentation (Read These First)
│   ├── SETUP_COMPLETE.md              ← Complete setup summary
│   ├── BOOKINGS_README.md             ← 5-min quick start
│   ├── BOOKINGS_QUICKSTART.md         ← Code examples
│   ├── BOOKINGS_SYSTEM.md             ← Full documentation
│   ├── SUPABASE_SETUP.md              ← DB setup details
│   ├── BOOKINGS_IMPLEMENTATION.md     ← What was created
│   ├── DOCUMENTATION_INDEX.md         ← Navigation guide
│   └── THIS FILE
│
├── ⚙️ Configuration
│   ├── .env.local.example             ← Copy & fill in
│   ├── .env.local                     ← CREATE THIS FILE
│   ├── package.json                   ← Updated
│   └── next.config.ts                 ← Updated
│
├── 🔧 Database
│   └── database-schema.sql            ← Run in Supabase
│
├── 💻 Frontend Code
│   ├── app/
│   │   ├── api/
│   │   │   └── bookings/route.ts      ← API endpoints (existing)
│   │   └── components/
│   │       └── examples/
│   │           └── BookingsExample.tsx ← Example component
│   │
│   ├── hooks/
│   │   └── useBookings.ts             ← React hook (NEW)
│   │
│   ├── lib/
│   │   └── bookings.ts                ← Core utilities (NEW)
│   │
│   └── types/
│       └── booking.ts                 ← TypeScript types (NEW)
│
└── 🛠️ Scripts
    └── scripts/
        └── verify-supabase.js         ← Setup verification
```

## Data Flow

### Creating a Booking

```
User clicks "Book" in UI
         ↓
BookingForm component (Your component or BookingsExample.tsx)
         ↓
useBookings() hook
         ↓
createBooking() function from lib/bookings.ts
         ↓
POST /api/bookings endpoint
         ↓
Validate user is authenticated
         ↓
Check car exists and is available
         ↓
Check for conflicting bookings
         ↓
Create booking in database
         ↓
Return booking details
         ↓
useBookings hook shows success toast
         ↓
Update bookings list in UI
         ↓
User sees confirmation
```

### Getting User's Bookings

```
User visits "My Bookings" page
         ↓
useBookings() hook
         ↓
useEffect triggers loadBookings()
         ↓
getUserBookings() from lib/bookings.ts
         ↓
GET /api/bookings endpoint
         ↓
Get current user from session
         ↓
Query: SELECT * FROM bookings WHERE user_id = current_user
         ↓
Apply Row Level Security (RLS)
         ↓
Return paginated results
         ↓
Display bookings in component
```

### Checking Availability

```
User selects car and dates
         ↓
checkAvailability() from hook
         ↓
Query database for conflicting bookings
         ↓
Check if car is available for date range
         ↓
Return true/false
         ↓
Show "Available" or "Not Available" message
         ↓
Enable/disable "Book" button
```

## Component Integration

### Minimal Example
```tsx
import { useBookings } from '@/hooks/useBookings';

export function MinimalBooking() {
  const { createBooking, loading } = useBookings();

  return (
    <button 
      onClick={() => createBooking({
        car_id: 'uuid',
        pickup_date: new Date().toISOString(),
        return_date: new Date(Date.now() + 2*24*60*60*1000).toISOString(),
        pickup_location: 'Manila',
        total_price: 5000,
      })}
      disabled={loading}
    >
      {loading ? 'Booking...' : 'Book'}
    </button>
  );
}
```

### Full Example
See `app/components/examples/BookingsExample.tsx` for:
- Booking form with validation
- Availability checking
- Bookings list
- Cancellation
- Error handling
- Loading states
- Complete UI

## Database Tables Relationship

```
┌─────────────┐
│  profiles   │
│  (users)    │
├─────────────┤
│ id (PK)     │
│ full_name   │
│ role        │
│ phone       │
│ ...         │
└─────────────┘
      ↑
      │ one
      │
    many
      │
      ├──────────┐
      │          │
      ↓          ↓
┌──────────┐  ┌───────────────┐
│  cars    │  │   bookings    │
├──────────┤  ├───────────────┤
│ id (PK)  │  │ id (PK)       │
│ name     │  │ user_id (FK)  │ ──→ profiles
│ brand    │  │ car_id (FK)   │ ──→ cars
│ model    │  │ status        │
│ price    │  │ total_price   │
│ images   │  │ created_at    │
│ ...      │  │ ...           │
└──────────┘  └───────────────┘
```

## Status Flow

```
┌─────────┐
│ pending │  ← Initial state when booking created
└────┬────┘
     │
     ├─→ ┌──────────┐
     │   │confirmed │  ← Admin approves
     │   └──────────┘
     │        │
     │        └─→ ┌───────────┐
     │            │ completed │  ← Booking finished
     │            └───────────┘
     │
     └─→ ┌──────────┐
         │ rejected │  ← Admin rejects
         └──────────┘

OR at any time:
     ─→ ┌───────────┐
        │ cancelled │  ← User or admin cancels
        └───────────┘
```

## Payment Status Flow

```
┌─────────┐
│ pending │  ← Initial state
└────┬────┘
     │
     ├─→ ┌──────┐
     │   │ paid │  ← Payment successful
     │   └──────┘
     │
     ├─→ ┌────────┐
     │   │ failed │  ← Payment failed
     │   └────────┘
     │
     └─→ ┌──────────┐
         │ refunded │  ← Payment refunded
         └──────────┘
```

## API Endpoint Flows

### GET /api/bookings
```
Request: GET /api/bookings?page=1&limit=10

Authentication Check
         ↓
Get current user ID
         ↓
Get user role (admin or client)
         ↓
If admin: SELECT all bookings
If client: SELECT bookings WHERE user_id = current_user
         ↓
Apply pagination (limit 10 per page)
         ↓
Response: {
  bookings: [...],
  total: 25,
  page: 1,
  limit: 10,
  totalPages: 3
}
```

### POST /api/bookings
```
Request: {
  car_id, pickup_date, return_date,
  pickup_location, total_price
}

Authentication Check
         ↓
Validate request body
         ↓
Check car exists
         ↓
Check car is available
         ↓
Check for conflicting bookings
         ↓
Create booking in database
         ↓
Trigger: Create notification
         ↓
Trigger: Update updated_at
         ↓
Response: {
  booking: { id, status, ... }
} (201 Created)
```

## Error Handling Flow

```
User Action
    ↓
Try to execute
    ↓
Error occurs
    ↓
useBookings hook catches it
    ↓
Sets error state
    ↓
Shows toast notification to user
    ↓
User sees error message
    ↓
User can retry
```

## Key Numbers & Limits

```
Pagination:
- Default limit: 10 items per page
- Max limit: Limited by Supabase

File Sizes:
- Types: ~117 lines
- Hook: ~89 lines
- Utilities: ~159 lines
- Example: ~302 lines
- Total: ~667 lines of code

Setup Time:
- Read docs: 5-20 min
- Config: 2-3 min
- Database: 3-5 min
- Testing: 5-10 min
- Total: 15-40 min
```

## Security Layers

```
Layer 1: Authentication
  ├─ Supabase auth.users table
  ├─ Session tokens required
  └─ Password hashing built-in

Layer 2: Authorization
  ├─ Role-based access (admin/client)
  ├─ User ID verification
  └─ Row Level Security (RLS)

Layer 3: Data Validation
  ├─ Required fields check
  ├─ Date range validation
  ├─ Price validation
  └─ Foreign key constraints

Layer 4: Business Logic
  ├─ Availability checking
  ├─ Double-booking prevention
  ├─ Status validation
  └─ Permission checks
```

## Next Steps Roadmap

```
Week 1: Foundation
├─ Setup (2 hours)
├─ Basic booking creation (2 hours)
├─ Display user bookings (2 hours)
└─ Test thoroughly (2 hours)

Week 2: Enhancement
├─ Customize UI (4 hours)
├─ Integrate with car pages (2 hours)
├─ Add admin dashboard (4 hours)
└─ User testing (2 hours)

Week 3: Advanced
├─ Payment processing (6 hours)
├─ Email notifications (4 hours)
├─ SMS reminders (4 hours)
└─ Testing & fixes (2 hours)

Week 4: Polish
├─ Bug fixes (4 hours)
├─ Performance optimization (2 hours)
├─ Documentation (2 hours)
└─ Deployment prep (2 hours)
```

---

## Summary

This visual guide shows:
- ✅ System architecture and data flow
- ✅ File organization
- ✅ Component integration examples
- ✅ Database relationships
- ✅ Status and payment flows
- ✅ API endpoint flows
- ✅ Security layers
- ✅ Timeline for implementation

**See [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) for navigation to other docs!**
