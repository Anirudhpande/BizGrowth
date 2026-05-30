import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// Supabase Client
// ============================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_KEY must be defined in environment variables');
  process.exit(1);
}

/**
 * Singleton Supabase client instance.
 * Uses the anon/service-role key for server-side database access.
 */
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

/**
 * Verifies Supabase connectivity by performing a lightweight query.
 * Call this during server startup to fail fast on misconfiguration.
 */
export const verifyConnection = async (): Promise<void> => {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      // Table might not exist yet — that's ok during first run
      if (error.code === '42P01') {
        console.warn('⚠️  Supabase connected, but "users" table does not exist.');
        console.warn('   Run the SQL migration in your Supabase dashboard to create it.');
        return;
      }
      throw error;
    }

    console.log('✅ Supabase connected successfully');
  } catch (error) {
    const err = error as Error;
    console.error(`❌ Supabase connection check failed: ${err.message}`);
    console.warn('⚠️  Server will start, but database operations may fail.');
  }
};

export default supabase;
