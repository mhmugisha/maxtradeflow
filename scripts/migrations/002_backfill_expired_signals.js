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
    console.log('Migration 002: Backfilling expired signals as is_valid=false...\n');

    // Step 1: Preview — count rows that will be affected
    const preview = await sql`
      SELECT COUNT(*) AS count
      FROM articles
      WHERE category = 'signal'
        AND created_at < NOW() - INTERVAL '24 hours'
        AND (is_valid IS NULL OR is_valid = true)
    `;
    const affectedCount = parseInt(preview[0].count, 10);
    console.log(`Found ${affectedCount} signal(s) older than 24h that will be marked invalid.\n`);

    if (affectedCount === 0) {
      console.log('Nothing to update. Migration 002 complete (no-op).');
      return;
    }

    // Step 2: Run the UPDATE
    console.log('Running UPDATE...');
    const updated = await sql`
      UPDATE articles
      SET is_valid = false,
          invalidated_at = NOW(),
          invalidation_reason = 'PRE_DEPLOY'
      WHERE category = 'signal'
        AND created_at < NOW() - INTERVAL '24 hours'
        AND (is_valid IS NULL OR is_valid = true)
    `;
    console.log(`  ✓ ${updated.count ?? affectedCount} row(s) updated.\n`);

    // Step 3: Verification — distribution of is_valid across all signals
    console.log('Verification — current is_valid distribution across all signals:');
    const dist = await sql`
      SELECT
        CASE
          WHEN is_valid = false THEN 'false'
          ELSE 'true / NULL'
        END AS is_valid_bucket,
        invalidation_reason,
        COUNT(*) AS count
      FROM articles
      WHERE category = 'signal'
      GROUP BY is_valid_bucket, invalidation_reason
      ORDER BY is_valid_bucket, invalidation_reason NULLS FIRST
    `;

    console.log('');
    console.log('  is_valid         reason          count');
    console.log('  ─────────────────────────────────────');
    for (const row of dist) {
      const bucket = row.is_valid_bucket.padEnd(16);
      const reason = (row.invalidation_reason ?? '—').padEnd(15);
      console.log(`  ${bucket} ${reason} ${row.count}`);
    }
    console.log('');

    console.log('Migration 002 complete. Existing signals older than 24h marked as PRE_DEPLOY.');
  } catch (err) {
    console.error('Migration 002 failed:', err.message);
    process.exit(1);
  }
}

run();
