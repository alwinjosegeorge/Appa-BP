import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function init() {
  await sql`
    CREATE TABLE IF NOT EXISTS bp_readings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_name TEXT,
      reading_date DATE NOT NULL,
      reading_time TIME NOT NULL,
      right_systolic INTEGER,
      right_diastolic INTEGER,
      left_systolic INTEGER,
      left_diastolic INTEGER,
      pulse INTEGER,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log("bp_readings created");

  await sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_name TEXT NOT NULL,
      patient_age INTEGER
    );
  `;
  console.log("app_settings created");

  const settings = await sql`SELECT * FROM app_settings LIMIT 1`;
  if (settings.length === 0) {
    await sql`INSERT INTO app_settings (patient_name) VALUES ('User')`;
    console.log("inserted default settings");
  }

  process.exit(0);
}

init().catch(console.error);
