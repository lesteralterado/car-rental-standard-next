import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables not found:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
}

const client = createClient(
  supabaseUrl,
  supabaseKey
);

export default client;