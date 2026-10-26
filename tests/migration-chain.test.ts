import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { afterEach, describe, expect, it } from 'vitest';

const migrationsDirectory = fileURLToPath(
  new URL('../supabase/migrations/', import.meta.url),
);

let db: PGlite | undefined;

afterEach(async () => {
  await db?.close();
  db = undefined;
});

async function createSupabaseManagedStubs(database: PGlite) {
  await database.exec(`
    create role anon;
    create role authenticated;
    create role service_role;

    create schema auth;
    create function auth.role()
    returns text
    language sql
    stable
    as $$ select 'authenticated'::text $$;
    create table auth.users (
      id uuid primary key
    );

    create schema storage;
    create table storage.buckets (
      id text primary key,
      name text not null,
      public boolean not null default false,
      file_size_limit bigint,
      allowed_mime_types text[]
    );
    create table storage.objects (
      id uuid primary key default gen_random_uuid(),
      bucket_id text not null
    );
  `);
}

describe('complete Supabase migration chain', () => {
  it(
    'replays every migration in timestamp order on a fresh database',
    async () => {
      db = new PGlite();
      await createSupabaseManagedStubs(db);

      const migrationFiles = (await readdir(migrationsDirectory))
        .filter((file) => file.endsWith('.sql'))
        .sort();

      expect(migrationFiles).toHaveLength(20);
      expect(new Set(migrationFiles.map((file) => file.slice(0, 14))).size).toBe(
        migrationFiles.length,
      );

      for (const migrationFile of migrationFiles) {
        const sql = (await readFile(path.join(migrationsDirectory, migrationFile), 'utf8'))
          // PGlite exposes gen_random_uuid() but does not bundle Supabase's
          // pgcrypto extension control file. Supabase itself executes this.
          .replace(/create extension if not exists pgcrypto;\s*/gi, '');
        try {
          await db.exec(sql);
        } catch (error) {
          throw new Error(`Failed migration ${migrationFile}`, { cause: error });
        }
      }

      const requiredTables = await db.query<{ table_name: string }>(`
        select table_name
        from information_schema.tables
        where table_schema = 'public'
          and table_name in (
            'admin_users',
            'availability_blocks',
            'contact_submissions',
            'homepage_media',
            'pricing_settings',
            'quote_approval_tokens',
            'quote_link_events',
            'quote_options',
            'quote_requests',
            'quote_status_history',
            'site_media'
          )
        order by table_name
      `);

      expect(requiredTables.rows.map((row) => row.table_name)).toEqual([
        'admin_users',
        'availability_blocks',
        'contact_submissions',
        'homepage_media',
        'pricing_settings',
        'quote_approval_tokens',
        'quote_link_events',
        'quote_options',
        'quote_requests',
        'quote_status_history',
        'site_media',
      ]);

      const quoteColumns = await db.query<{ column_name: string }>(`
        select column_name
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'quote_requests'
      `);
      const columnNames = new Set(quoteColumns.rows.map((row) => row.column_name));

      for (const requiredColumn of [
        'agreement_status',
        'approved_at',
        'deposit_percentage',
        'deposit_status',
        'is_test_quote',
        'needs_manual_distance_review',
        'selected_quote_option_id',
        'sales_tax_amount',
      ]) {
        expect(columnNames.has(requiredColumn), requiredColumn).toBe(true);
      }
    },
    60_000,
  );
});
