import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function migrate() {
  console.log("Fetching readings from Supabase...");
  const { data: readings, error: readingsErr } = await supabase.from('bp_readings').select('*');
  if (readingsErr) {
    console.error("Error fetching readings:", readingsErr);
    process.exit(1);
  }

  console.log(`Found ${readings?.length || 0} readings.`);
  
  if (readings && readings.length > 0) {
    // Insert readings into Neon
    // postgres.js handles bulk inserts beautifully
    try {
      await sql`
        INSERT INTO bp_readings ${sql(readings)}
        ON CONFLICT (id) DO NOTHING
      `;
      console.log("Successfully migrated readings to Neon!");
    } catch (err) {
      console.error("Failed to insert readings into Neon:", err);
    }
  }

  console.log("Fetching settings from Supabase...");
  const { data: settings, error: settingsErr } = await supabase.from('app_settings').select('*');
  if (settingsErr) {
    console.error("Error fetching settings:", settingsErr);
  } else if (settings && settings.length > 0) {
    try {
      await sql`
        INSERT INTO app_settings ${sql(settings)}
        ON CONFLICT (id) DO NOTHING
      `;
      console.log("Successfully migrated settings to Neon!");
    } catch (err) {
      console.error("Failed to insert settings into Neon:", err);
    }
  }

  console.log("Migration complete.");
  process.exit(0);
}

migrate().catch(console.error);
