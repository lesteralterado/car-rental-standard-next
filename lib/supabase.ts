import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if we're in development mode without Supabase configured
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV

// Only throw error if we're not in development mode or if variables are partially set
if (!supabaseUrl || !supabaseKey) {
  if (isDevelopment) {
    console.warn('⚠️ Supabase environment variables not found.')
    console.warn('📝 Please create a .env file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.warn('📋 Copy .env.example to .env and fill in your Supabase credentials')
    console.warn('🔗 Get your credentials from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api')
  } else {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
    )
  }
}

// Create client only if credentials are available
let supabase: SupabaseClient | null = null

interface MockQueryBuilder {
  select: () => { data: unknown[] | null; error: { message: string } | null; count: number }
  insert: () => { data: null; error: { message: string } }
  update: () => { data: null; error: null }
  delete: () => { data: null; error: null }
  eq: (column: string, value: string) => MockQueryBuilder
  or: (condition: string) => MockQueryBuilder
}

interface MockSupabaseClient {
  from: (table: string) => MockQueryBuilder
  auth: {
    getUser: () => Promise<{ data: { user: unknown }; error: null }>
    signInWithPassword: () => Promise<{ data: null; error: { message: string } }>
    signOut: () => Promise<{ error: null }>
  }
  channel: (name: string) => {
    on: (event: string, config: unknown, callback: (payload: unknown) => void) => { subscribe: () => { status: string } }
    unsubscribe: () => void
  }
  removeChannel: (channel: unknown) => void
}

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
} else {
  // Export a mock client for development
  const mockClient: MockSupabaseClient = {
    from: () => ({
      select: () => ({ data: null, error: null, count: 0 }),
      insert: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      eq: () => mockClient.from(''),
      or: () => mockClient.from(''),
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({ status: 'subscribed' }) }),
      unsubscribe: () => {},
    }),
    removeChannel: () => {},
  }
  supabase = mockClient as unknown as SupabaseClient
}

export { supabase }
export default supabase
