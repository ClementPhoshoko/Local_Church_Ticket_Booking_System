const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
// Use SUPABASE_PUBLISHABLE_KEY for auth operations
// (SUPABASE_SECRET_KEY doesn't work with auth APIs)
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
