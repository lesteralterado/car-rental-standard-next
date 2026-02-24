# Booking System Unit Testing Guide

This document describes the unit testing setup for the car rental booking system.

## Overview

The project uses **Jest** as the testing framework along with **@testing-library/react** for testing React components and hooks.

## Test Structure

```
car-rental-standard-next/
├── jest.config.ts           # Jest configuration
├── jest.setup.ts            # Global test setup and mocks
├── lib/
│   └── __tests__/
│       └── bookings.test.ts # Tests for lib/bookings.ts
└── hooks/
    └── __tests__/
        └── useBookings.test.ts # Tests for hooks/useBookings.ts
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The test suite covers:

### 1. lib/bookings.ts Tests (`lib/__tests__/bookings.test.ts`)

- **`calculateTotalPrice` function**
  - Basic calculations (3-day, 7-day, 30-day rentals)
  - Edge cases (overnight, weekend, large rentals)
  - Boundary conditions (zero price, leap years, same-day returns)
  - Date range validation

- **Booking API Integration Tests**
  - Booking input validation
  - Booking response validation
  - Pagination calculations
  - Availability check logic
  - Status validation

### 2. hooks/useBookings.ts Tests (`hooks/__tests__/useBookings.test.ts`)

- **`createBooking` function**
  - Successful booking creation
  - Error handling

- **`cancelBooking` function**
  - Successful cancellation
  - Error handling
  - Reload after cancellation

- **`checkAvailability` function**
  - Available car detection
  - Unavailable car handling
  - Error handling

- **`loadBookings` function**
  - Loading user bookings
  - Pagination parameters
  - Error handling

- **Error Handling**
  - Clearing errors before new operations
  - Non-Error object handling

## Mocking Strategy

### Supabase Client

The Supabase client is mocked in `jest.setup.ts` to avoid actual database connections:

```typescript
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    // ... other methods
  })),
  auth: {
    getUser: jest.fn(),
  },
};
```

### Toast Notifications

The `sonner` toast library is mocked to prevent UI notifications during tests:

```typescript
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));
```

## Jest Configuration

Key configuration in `jest.config.ts`:

- **testEnvironment**: `jsdom` for DOM testing
- **setupFilesAfterEnv**: `jest.setup.ts` for global mocks
- **transform**: `ts-jest` for TypeScript support
- **moduleNameMapper**: Path aliases (`@/` → root directory)
- **coverageFrom**: Focuses on `lib/` and `hooks/` directories

## Writing New Tests

### Adding Tests to lib/bookings.ts

1. Create a new describe block for the function being tested
2. Use `beforeEach` to reset mocks if needed
3. Test both success and error scenarios
4. Test edge cases and boundary conditions

Example:

```typescript
describe('calculateTotalPrice', () => {
  it('should calculate total price correctly', () => {
    const pricePerDay = 50;
    const pickupDate = new Date('2024-01-01');
    const returnDate = new Date('2024-01-04');

    const result = calculateTotalPrice(pricePerDay, pickupDate, returnDate);
    
    expect(result).toBe(150);
  });
});
```

### Adding Tests to hooks/useBookings.ts

1. Mock the booking library functions
2. Use `renderHook` from @testing-library/react
3. Wrap async operations in `act()`
4. Test both success and error scenarios

Example:

```typescript
it('should load user bookings', async () => {
  (bookingsLib.getUserBookings as jest.Mock).mockResolvedValue({
    bookings: mockBookings,
    total: 1,
    pages: 1,
  });

  const { result } = renderHook(() => useBookings());

  await act(async () => {
    await result.current.loadBookings();
  });

  expect(result.current.bookings).toEqual(mockBookings);
});
```

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Clear Expectations**: Use descriptive test names
3. **Test Edge Cases**: Consider boundary conditions and error scenarios
4. **Mock External Dependencies**: Avoid real API calls in unit tests
5. **Use Act()**: Wrap React state updates in `act()` for async operations

## CI/CD Integration

Tests are automatically run via npm:

```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage"
  }
}
```

Add these to your CI pipeline to ensure all tests pass before merging.
