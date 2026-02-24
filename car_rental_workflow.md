# Car Rental System Workflow

## 1. CUSTOMER BOOKING FLOW

### A. Browse Available Vehicles
```
Customer visits website
  ↓
Select date range (pickup & return date)
  ↓
System checks vehicle availability in real-time
  ↓
Display available vehicles with:
  - Vehicle photos
  - Price per day
  - Vehicle features (transmission, seating, etc.)
  - Current location
  ↓
Customer selects vehicle
```

### B. Booking & Payment
```
Customer fills booking form:
  - Full name
  - Contact number
  - Email
  - Valid ID upload
  - Driver's license upload
  - Pickup location (branch or delivery address)
  - Return location
  ↓
System calculates total cost:
  - Daily rate × number of days
  - Delivery fee (if applicable)
  - Insurance option (optional)
  - Total amount
  ↓
Customer selects payment method:
  - GCash
  - Bank transfer
  - Credit/Debit card
  - PayMaya
  ↓
Pay security deposit (e.g., 30% or fixed amount)
  ↓
System generates booking reference number
  ↓
Auto-send confirmation via:
  - SMS
  - Email
  - With booking details & reference number
```

### C. Pre-Pickup Reminders
```
System sends automated reminders:
  - 3 days before: "Your booking is coming up"
  - 1 day before: "Reminder: Pickup tomorrow at [time]"
  - 2 hours before: "We're preparing your vehicle"
  ↓
Customer receives reminder with:
  - Booking details
  - What to bring (IDs, payment for balance)
  - Contact number for changes
```

### D. Vehicle Pickup
```
Customer arrives at pickup location
  ↓
Staff logs into system on tablet/phone
  ↓
Search booking by reference number or customer name
  ↓
Verify customer identity & documents
  ↓
Staff conducts vehicle inspection with customer:
  - Take photos of vehicle condition
  - Note existing damages/scratches
  - Check fuel level
  - Upload photos to system
  ↓
Customer pays remaining balance
  ↓
System generates digital rental contract:
  - Auto-filled with booking details
  - Terms & conditions
  - Customer e-signature on tablet/phone
  - Staff e-signature
  ↓
System updates booking status: "ONGOING"
  ↓
Customer receives copy of contract via email
  ↓
Vehicle released
```

### E. During Rental Period
```
System monitors rental:
  - Tracks rental duration
  - Sends check-in SMS (optional): "How's your trip?"
  ↓
If customer needs extension:
  - Customer requests via system or SMS
  - Staff approves/rejects based on vehicle availability
  - Customer pays extension fee online
  - System updates return date
```

### F. Return Reminders
```
Automated reminders:
  - 1 day before return: "Please return vehicle tomorrow by [time]"
  - 4 hours before: "Reminder: Return by [time] today"
  - If overdue: Auto-calculate late fee
```

### G. Vehicle Return
```
Customer returns vehicle
  ↓
Staff logs into system
  ↓
Retrieve booking record
  ↓
Conduct return inspection:
  - Take photos of current condition
  - Compare with pickup photos
  - Check fuel level
  - Note any new damages
  - Upload return photos
  ↓
Calculate final charges:
  - Late fees (if any)
  - Fuel charges (if not full tank)
  - Damage charges (if any)
  - Total refundable deposit
  ↓
Process deposit refund:
  - If no issues: Full deposit refund
  - If damages: Deduct damage cost, refund balance
  ↓
System updates booking status: "COMPLETED"
  ↓
Customer receives:
  - Final receipt via email/SMS
  - Deposit refund to GCash/Bank
  - Thank you message
  - Request for review/rating (optional)
```

---

## 2. OWNER/STAFF MANAGEMENT FLOW

### A. Dashboard Overview
```
Owner/Staff logs in
  ↓
Dashboard displays:
  - Today's pickups (list with times)
  - Today's returns (list with times)
  - Current ongoing rentals
  - Available vehicles
  - Vehicles under maintenance
  - Revenue today/this week/this month
  - Pending deposit refunds
  - Overdue rentals (highlighted in red)
```

### B. Vehicle Management
```
Add/Edit Vehicle:
  - Upload vehicle photos
  - Model, make, year
  - Plate number
  - Daily rental rate
  - Features (aircon, transmission, seats)
  - Status: Available/Rented/Maintenance
  ↓
Track Vehicle Status:
  - View booking history per vehicle
  - See upcoming bookings
  - Revenue generated per vehicle
  - Maintenance schedule
  - Total kilometers (if tracked)
```

### C. Booking Management
```
View All Bookings (filterable):
  - By status: Pending/Confirmed/Ongoing/Completed/Cancelled
  - By date range
  - By vehicle
  - By customer
  ↓
Manual Booking Creation (for walk-ins or phone bookings):
  - Staff creates booking on behalf of customer
  - Same process as online booking
  - Mark as "Phone booking" or "Walk-in"
  ↓
Modify Bookings:
  - Change dates (if vehicle available)
  - Change vehicle
  - Cancel booking
  - Process refunds
```

### D. Payment & Deposit Tracking
```
Payment Dashboard:
  - All transactions listed
  - Filter by: Paid/Pending/Refunded
  - Track deposits collected
  - Track deposits refunded
  - Track outstanding balances
  ↓
Payment Reconciliation:
  - View all GCash payments
  - View all bank transfers
  - Match reference numbers with bookings
  - Mark as verified
  ↓
Generate Financial Reports:
  - Daily sales report
  - Weekly/Monthly revenue
  - Revenue per vehicle
  - Outstanding collections
  - Profit after expenses (if expense tracking enabled)
```

### E. Customer Management
```
Customer Database:
  - All customer records
  - Booking history per customer
  - Contact information
  - Uploaded documents (IDs, licenses)
  - Ratings/notes from previous rentals
  ↓
Blacklist Management:
  - Flag problematic customers
  - System warns if blacklisted customer tries to book
```

### F. Inventory & Maintenance Tracking
```
Maintenance Schedule:
  - Set maintenance reminders per vehicle
  - System alerts when maintenance due
  - Mark vehicle as "Under Maintenance"
  - Track maintenance costs
  - Log what was done
  ↓
Expense Tracking:
  - Fuel costs
  - Maintenance/repairs
  - Insurance renewals
  - LTO registration
  - Associate expenses with specific vehicles
```

---

## 3. AUTOMATED NOTIFICATIONS FLOW

### SMS/Email Triggers
```
1. Booking Confirmation
   → Sent immediately after payment
   → Contains: booking ref, dates, vehicle, amount paid

2. Pickup Reminder (3 days before)
   → "Your [Vehicle] rental is in 3 days"

3. Pickup Reminder (1 day before)
   → "Tomorrow at [time], pickup your [Vehicle]"

4. Pickup Reminder (2 hours before)
   → "We're preparing your vehicle. See you soon!"

5. Return Reminder (1 day before)
   → "Please return [Vehicle] tomorrow by [time]"

6. Return Reminder (4 hours before)
   → "Return due in 4 hours at [location]"

7. Overdue Alert (to customer)
   → "Your rental is overdue. Late fees apply."

8. Overdue Alert (to owner)
   → "Customer [Name] is overdue by [X] hours"

9. Payment Received
   → "Payment of ₱[amount] received. Thank you!"

10. Deposit Refund Processed
    → "Your deposit of ₱[amount] has been refunded"

11. Maintenance Due (to owner)
    → "[Vehicle] maintenance due in 7 days"
```

---

## 4. REPORTING & ANALYTICS FLOW

### Reports Available to Owner
```
1. Revenue Reports
   - Daily/Weekly/Monthly/Yearly
   - Revenue per vehicle
   - Revenue by booking channel (online/walk-in/phone)

2. Booking Analytics
   - Total bookings per period
   - Booking conversion rate
   - Average rental duration
   - Peak booking seasons
   - Most popular vehicles

3. Vehicle Performance
   - Utilization rate per vehicle
   - Revenue per vehicle
   - Maintenance costs per vehicle
   - Profit margin per vehicle
   - "Which car makes the most money?"

4. Customer Reports
   - New vs returning customers
   - Customer lifetime value
   - Top customers by bookings

5. Payment Reports
   - Collection efficiency
   - Outstanding balances
   - Deposit refunds pending
   - Payment method breakdown

6. Operational Reports
   - Average response time
   - No-show rate
   - Cancellation rate
   - Late return frequency
```

---

## 5. SYSTEM INTEGRATIONS

### Payment Integration
```
GCash API
  → Real-time payment verification
  → Automatic deposit refunds

Bank Transfer
  → Reference number matching
  → Manual verification by staff

Credit/Debit Card (via PayMongo or similar)
  → Direct payment processing
  → Automatic confirmation
```

### SMS Integration
```
SMS Gateway (e.g., Semaphore, Movider)
  → All automated notifications
  → 2-way SMS for confirmations
```

### Cloud Storage
```
For document uploads:
  - Customer IDs
  - Driver's licenses
  - Vehicle inspection photos
  - Contracts
```

---

## 6. SPECIAL FEATURES FOR PHILIPPINE CONTEXT

### Multi-Location Support
```
If owner has multiple branches:
  - Cebu branch
  - Manila branch
  - Davao branch
  ↓
Customer can:
  - Pick up in Cebu, return in Manila (with fee)
  - See inventory per location
  ↓
Owner can:
  - Track revenue per branch
  - Transfer vehicles between branches
```

### Peso Currency & Local Payment Methods
```
All amounts in ₱ (PHP)
Payment options prioritize local methods:
  - GCash (primary)
  - PayMaya
  - Bank transfer (BDO, BPI, etc.)
  - Credit/Debit card
  - Cash (for walk-ins)
```

### Holiday/Peak Season Pricing
```
Owner can set special rates for:
  - Holy Week
  - Christmas season
  - New Year
  - Long weekends
  ↓
System automatically applies peak pricing for those dates
```

### Barangay Clearance / Police Clearance Upload (Optional)
```
For long-term rentals or high-value vehicles:
  - Require additional documents
  - Customer uploads to system
  - Staff verifies before approval
```

---

## 7. MOBILE-FIRST DESIGN

Since most Filipino SMB owners use phones:

```
Owner Mobile App / Responsive Web:
  - Quick view of today's schedule
  - Approve/reject bookings on-the-go
  - Receive push notifications for new bookings
  - Process returns using phone camera
  - View sales dashboard

Customer Mobile Experience:
  - Easy browsing on mobile
  - Quick booking in 3-5 steps
  - Mobile-friendly payment
  - View booking details anytime
```

---

## WORKFLOW SUMMARY DIAGRAM

```
CUSTOMER JOURNEY:
Browse → Select Dates → Choose Vehicle → Fill Details → Pay Deposit 
→ Receive Confirmation → Get Reminders → Pickup Vehicle (Inspection + Contract) 
→ Use Vehicle → Return Reminder → Return Vehicle (Inspection) 
→ Final Payment/Refund → Completed

OWNER JOURNEY:
Receive Booking → Verify Payment → Prepare Vehicle → Release Vehicle 
→ Monitor Rental → Send Reminders → Receive Vehicle → Inspect & Process Return 
→ Refund Deposit → Track Revenue → Generate Reports → Plan Maintenance
```

---

## TECHNICAL NOTES

**Database Tables Needed:**
- users (customers & staff)
- vehicles
- bookings
- payments
- vehicle_inspections
- maintenance_logs
- expenses
- notifications_log
- system_settings

**Key Features to Prevent Pain Points:**
1. **Real-time availability** → Prevents double booking
2. **Automated reminders** → Reduces no-shows & late returns
3. **Digital contracts** → Eliminates manual paperwork
4. **Deposit automation** → Ensures commitment from customers
5. **Photo documentation** → Protects against disputes
6. **Centralized dashboard** → All info in one place
7. **Revenue tracking per vehicle** → Shows which cars are profitable
8. **Multi-payment support** → Accepts how Filipinos actually pay

