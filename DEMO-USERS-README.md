# Demo Users Setup

This document explains how to set up and use the three sample demo users in the Car Rental application.

## Demo Users Created

### 1. Juan dela Cruz (Regular Client)
- **Email**: `juan@example.com`
- **Password**: `demo123`
- **Role**: Client
- **Features**: Can browse cars, make bookings, submit inquiries
- **Sample Data**: Has a confirmed booking for Toyota Camry

### 2. Maria Santos (Premium Client)
- **Email**: `maria@example.com`
- **Password**: `demo123`
- **Role**: Client
- **Features**: Can browse cars, make bookings, submit inquiries
- **Sample Data**: Has a pending booking for BMW 3 Series

### 3. Admin User (Administrator)
- **Email**: `admin@example.com`
- **Password**: `demo123`
- **Role**: Admin
- **Features**: Full access to admin dashboard, can manage cars, bookings, inquiries, reports

## How to Use Demo Users

1. **Navigate to Login Page**: Go to `/login`
2. **Click Demo User Button**: Click on any of the three demo user buttons:
   - "Juan dela Cruz (Client)"
   - "Maria Santos (Client)"
   - "Admin User (Admin)"
3. **Auto-filled Credentials**: The email and password will be automatically filled
4. **Login**: Click "Sign In" or the form will auto-submit

## Database Setup

To set up the demo users in your Supabase database:

1. **Run the SQL Script**: Execute `demo-users.sql` in your Supabase SQL Editor
2. **Note**: The script includes sample bookings and inquiries for demonstration

## Features Available to Each User Type

### Client Users (Juan & Maria)
- ✅ Browse available cars
- ✅ View car details and specifications
- ✅ Make booking requests
- ✅ Submit inquiries
- ✅ View booking history
- ✅ Access notifications
- ❌ Admin dashboard access

### Admin User
- ✅ All client features
- ✅ Admin dashboard access
- ✅ Manage cars (add/edit/delete)
- ✅ Review and approve/reject bookings
- ✅ Handle customer inquiries
- ✅ View reports and analytics
- ✅ Manage notifications

## Sample Data Included

- **Cars**: Toyota Camry, Honda CR-V, BMW 3 Series (from existing schema)
- **Bookings**: Pre-created bookings for demo users
- **Inquiries**: Sample inquiry from Juan dela Cruz

## Technical Implementation

- Demo users are stored in `localStorage` for persistence
- AuthProvider automatically detects demo users and sets appropriate roles
- No actual Supabase Auth users are created (purely frontend simulation)
- All demo users use the same password: `demo123`

## Testing Different Scenarios

Use different demo users to test:
- Client booking workflow
- Admin approval process
- Inquiry management
- Dashboard analytics
- Role-based access control

## Reset Demo Session

To switch between demo users or logout:
- Click the "Logout" button in the header
- Or manually clear `localStorage` in browser dev tools