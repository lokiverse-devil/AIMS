// Run the pending_registrations migration against Supabase
// Usage: node scripts/run_migration.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rvamuonqnsbnqdgpskir.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY required.');
  console.error('Set it in your environment or .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  const sqlPath = path.join(__dirname, '..', 'migrations', 'create_pending_registrations.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  console.log('Running migration: create_pending_registrations...');
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error('Migration failed via RPC. This is expected if exec_sql function does not exist.');
    console.error('Please run the SQL migration manually in Supabase Dashboard > SQL Editor:');
    console.error(`File: ${sqlPath}`);
    console.error('\n--- SQL to run ---');
    console.log(sql);
    console.error('--- End SQL ---\n');
  } else {
    console.log('Migration applied successfully!');
  }
}

runMigration();
