# Supabase Branch Migration Reconciliation

## Problem

Supabase preview branches replay the SQL files in `supabase/migrations` against
a fresh database. The repository previously contained short, duplicate
migration versions such as `20260507_*`, and the alphabetic order attempted to
alter `quote_requests` before creating it. The Git migration history also
omitted migrations recorded by the production project.

The result was a preview branch with status `MIGRATIONS_FAILED`, no applied
migrations, and no public tables.

## Reconciliation

The migration directory now uses the exact 14-digit versions and names recorded
by the production Supabase project. Historical schema changes made before the
migration history was complete are reconciled inside already-applied versions:

- `20260506023230_full_quote_system_schema.sql` includes the quote columns that
  exist in production and are required by later migrations.
- `20260604030023_add_approved_at_to_quote_requests.sql` includes the missing
  `quote_options` creation before tax and booking migrations reference it.

Because those versions are already recorded as applied in production, the
reconciliation supports fresh branch replay without presenting the historical
schema creation as new production DDL.

## Validation

Run:

```powershell
npm.cmd run supabase:validate
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

`tests/migration-chain.test.ts` replays every migration in filename order on a
fresh PGlite database and verifies unique versions, required tables, key quote
columns, and availability-block RLS. The booking migration tests separately
verify quote approval, hard blocks, soft holds, and conflict overrides.

When Docker Desktop or Podman is available, also run the native Supabase replay:

```powershell
corepack pnpm exec supabase start
corepack pnpm exec supabase db reset --local --no-seed
```

## Preview branch recovery

After these repository changes are committed and pushed, recreate the failed
preview branch from the Supabase dashboard or close and reopen its pull request.
Preview branch resets are destructive to preview-only data. Confirm the target
branch before resetting it. Do not reset the production project.

Only merge after the preview branch reports healthy and its migration list ends
with `20260825204336_reconcile_availability_blocks`.
