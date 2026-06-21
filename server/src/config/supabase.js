const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;

// Publishable key: used for regular user operations (auth, etc.)
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabasePublishableKey);

// Service role key: used for admin/server-side operations that need to bypass RLS
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = { supabase, supabaseAdmin };
