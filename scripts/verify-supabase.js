#!/usr/bin/env node

/**
 * Supabase Setup Verification Script
 * Run this to verify your Supabase connection and tables are set up correctly
 * 
 * Usage: npm run verify:supabase
 * Or: node scripts/verify-supabase.js
 */

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const client = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('🔍 Verifying Supabase Setup...\n');

  try {
    // Test connection
    console.log('1️⃣  Testing Supabase connection...');
    const { data: { user } } = await client.auth.getUser();
    console.log('   ✅ Connection successful!\n');

    // Check tables
    const tables = ['profiles', 'cars', 'bookings', 'inquiries', 'notifications', 'customers'];
    console.log('2️⃣  Checking database tables...');

    for (const table of tables) {
      try {
        const { error } = await client
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`   ❌ ${table}: Table not found or error: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: OK`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: Error: ${err.message}`);
      }
    }

    console.log('\n3️⃣  Checking sample data...');

    // Check if cars exist
    const { data: cars, error: carsError } = await client
      .from('cars')
      .select('id, name')
      .limit(5);

    if (carsError) {
      console.log('   ❌ Failed to fetch cars');
    } else if (!cars || cars.length === 0) {
      console.log('   ⚠️  No cars found in database');
      console.log('   💡 Tip: Run the database-schema.sql to insert sample cars');
    } else {
      console.log(`   ✅ Found ${cars.length} cars`);
      cars.forEach(car => {
        console.log(`      - ${car.name} (${car.id})`);
      });
    }

    console.log('\n4️⃣  Checking authentication...');
    if (user) {
      console.log(`   ✅ Currently logged in as: ${user.email}`);
    } else {
      console.log('   ℹ️  No user logged in');
      console.log('   💡 You can test bookings after creating an account');
    }

    console.log('\n✅ Verification complete!\n');
    console.log('📚 Next steps:');
    console.log('   1. Visit http://localhost:3000 to see your app');
    console.log('   2. Sign up for an account');
    console.log('   3. Try creating a booking');
    console.log('   4. Check the /admin/bookings page to view all bookings\n');

  } catch (error) {
    console.error('❌ Verification failed!');
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

verify();
