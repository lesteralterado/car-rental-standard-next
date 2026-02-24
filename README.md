This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Variables

Before running the project, you need to create a `.env.local` file with the following variables:

```bash
# =============================================================================
# SUPABASE CONFIGURATION (REQUIRED)
# =============================================================================
# Get these from your Supabase Project Dashboard:
# 1. Go to https://supabase.com/dashboard
# 2. Select your project
# 3. Go to Settings > API
# 4. Copy the URL and anon key

NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Service role key (for admin operations - keep secret!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# =============================================================================
# AUTHENTICATION
# =============================================================================
# Generate a secure random string for JWT tokens (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# =============================================================================
# APPLICATION SETTINGS
# =============================================================================
# Late fee configuration (PHP per hour)
DEFAULT_LATE_FEE_HOURLY_RATE=100

# Security deposit (PHP)
DEFAULT_SECURITY_DEPOSIT=5000
SECURITY_DEPOSIT_PERCENTAGE=30

# =============================================================================
# PAYMENT METHODS (Enable/disable)
# =============================================================================
PAYMENT_METHODS_GCASH=true
PAYMENT_METHODS_BANK_TRANSFER=true
PAYMENT_METHODS_CREDIT_CARD=true
PAYMENT_METHODS_CASH=true

# =============================================================================
# DEVELOPMENT
# =============================================================================
NODE_ENV=development
```

## Getting Started

First, make sure you have configured all the environment variables above, then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
