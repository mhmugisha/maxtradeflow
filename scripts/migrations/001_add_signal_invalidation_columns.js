const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function run() {
  const url = process.env.NEON_DATABASE_URL;
  if (!url) {
    console.error('Error: NEON_DATABASE_URL is not set. Check .env.local.');
    process.exit(1);
  }

  const sql = neon(url);

  try {
    console.log('Migration 001: Adding signal invalidation columns to articles table...\n');

    console.log('Adding column is_valid...');
    await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_valid BOOLEAN DEFAULT NULL`;
    console.log('  ✓ is_valid added (BOOLEAN DEFAULT NULL)\n');

    console.log('Adding column invalidated_at...');
    await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS invalidated_at TIMESTAMP DEFAULT NULL`;
    console.log('  ✓ invalidated_at added (TIMESTAMP DEFAULT NULL)\n');

    console.log('Adding column invalidation_reason...');
    await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS invalidation_reason TEXT DEFAULT NULL`;
    console.log('  ✓ invalidation_reason added (TEXT DEFAULT NULL)\n');

    console.log('Migration 001 complete. Added 3 columns to articles table.');
  } catch (err) {
    console.error('Migration 001 failed:', err.message);
    process.exit(1);
  }
}

run();
