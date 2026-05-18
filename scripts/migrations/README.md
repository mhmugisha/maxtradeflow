# Database Migrations

## How to run a migration

From the project root (`~/maxtradeflow`):

```bash
node scripts/migrations/001_add_signal_invalidation_columns.js
```

Migrations require `NEON_DATABASE_URL` to be set in `.env.local`.

## Naming convention

Files are numbered sequentially with a three-digit prefix:

```
001_description_of_change.js
002_next_change.js
003_...
```

The number determines run order. The description should be a short snake_case summary of what the migration does.

## Idempotency

Every migration is safe to re-run. DDL statements use `IF NOT EXISTS` / `IF EXISTS` guards so running a migration twice produces no errors and no unintended side effects.

## What belongs here

Schema changes only: `ALTER TABLE`, `CREATE TABLE`, `CREATE INDEX`, `DROP COLUMN`, etc. Data backfills go in separate scripts under `scripts/backfills/`.
