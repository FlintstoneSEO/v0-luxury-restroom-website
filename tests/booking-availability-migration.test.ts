import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { afterEach, describe, expect, it } from 'vitest';

const migrationPath = fileURLToPath(
  new URL(
    '../supabase/migrations/20260731020944_enforce_one_booking_per_day.sql',
    import.meta.url,
  ),
);
const availabilityBlocksMigrationPath = fileURLToPath(
  new URL(
    '../supabase/migrations/20260825113949_add_availability_blocks.sql',
    import.meta.url,
  ),
);
const availabilityBlocksReconciliationPath = fileURLToPath(
  new URL(
    '../supabase/migrations/20260825204336_reconcile_availability_blocks.sql',
    import.meta.url,
  ),
);

let db: PGlite | undefined;

afterEach(async () => {
  await db?.close();
  db = undefined;
});

async function createWorkflowSchema(database: PGlite) {
  await database.exec(`
    create role anon;
    create role authenticated;
    create role service_role;

    create schema auth;
    create table auth.users (
      id uuid primary key
    );

    create table public.quote_requests (
      id uuid primary key,
      quote_number text,
      event_date date not null,
      status text not null default 'pending_review',
      is_test_quote boolean not null default false,
      agreement_status text default 'not_sent',
      customer_response text,
      customer_response_type text,
      customer_response_at timestamptz,
      updated_at timestamptz default now(),
      approved_at timestamptz,
      selected_quote_option_id uuid,
      base_price numeric default 0,
      travel_fee numeric default 0,
      utility_fee numeric default 0,
      after_hours_fee numeric default 0,
      cleaning_fee numeric default 0,
      damage_waiver_fee numeric default 0,
      rush_booking_fee numeric default 0,
      subtotal numeric default 0,
      discount_amount numeric default 0,
      pretax_total numeric default 0,
      taxable_amount numeric default 0,
      tax_rate numeric default 0,
      sales_tax_amount numeric default 0,
      total_price numeric default 0,
      deposit_percentage numeric default 0,
      deposit_amount numeric default 0,
      final_balance numeric default 0,
      calculated_breakdown jsonb
    );

    create table public.quote_options (
      id uuid primary key,
      quote_request_id uuid not null references public.quote_requests(id),
      option_label text not null,
      option_description text,
      status text not null default 'draft',
      base_price numeric default 0,
      travel_fee numeric default 0,
      utility_fee numeric default 0,
      after_hours_fee numeric default 0,
      cleaning_fee numeric default 0,
      damage_waiver_fee numeric default 0,
      rush_booking_fee numeric default 0,
      subtotal numeric default 0,
      discount_amount numeric default 0,
      pretax_total numeric default 0,
      taxable_amount numeric default 0,
      tax_rate numeric default 0,
      sales_tax_amount numeric default 0,
      total_price numeric default 0,
      deposit_percentage numeric default 0,
      deposit_amount numeric default 0,
      final_balance numeric default 0,
      calculated_breakdown jsonb,
      updated_at timestamptz default now()
    );

    create table public.quote_approval_tokens (
      id uuid primary key,
      quote_request_id uuid not null references public.quote_requests(id),
      token_hash text not null,
      expires_at timestamptz not null,
      used_at timestamptz
    );

    create table public.quote_link_events (
      id bigint generated always as identity primary key,
      quote_request_id uuid not null references public.quote_requests(id),
      token_id uuid references public.quote_approval_tokens(id),
      event_type text not null
    );

    create table public.quote_status_history (
      id bigint generated always as identity primary key,
      quote_request_id uuid not null references public.quote_requests(id),
      old_status text,
      new_status text,
      changed_at timestamptz,
      changed_by text,
      note text
    );
  `);
}

describe('one-booking-per-day migration', () => {
  it(
    'is idempotent, allows pending/test duplicates, and atomically rejects a second approval',
    async () => {
      db = new PGlite();
      await createWorkflowSchema(db);
      const migrationSql = await readFile(migrationPath, 'utf8');
      await db.exec(migrationSql);
      await db.exec(migrationSql);

      const first = await db.query<{ id: string }>(`
        insert into public.quote_requests (id, quote_number, event_date)
        values ('00000000-0000-0000-0000-000000000001', 'SL-ONE', '2026-09-26')
        returning id
      `);
      const second = await db.query<{ id: string }>(`
        insert into public.quote_requests (id, quote_number, event_date)
        values ('00000000-0000-0000-0000-000000000002', 'SL-TWO', '2026-09-26')
        returning id
      `);
      await db.exec(`
        insert into public.quote_requests (
          id, quote_number, event_date, status, is_test_quote
        ) values (
          '00000000-0000-0000-0000-000000000003',
          'TEST',
          '2026-09-26',
          'booked',
          true
        )
      `);

      const firstToken = await db.query<{ id: string }>(`
        insert into public.quote_approval_tokens (
          id, quote_request_id, token_hash, expires_at
        ) values (
          '10000000-0000-0000-0000-000000000001',
          '${first.rows[0].id}',
          'first',
          now() + interval '1 day'
        ) returning id
      `);
      const secondToken = await db.query<{ id: string }>(`
        insert into public.quote_approval_tokens (
          id, quote_request_id, token_hash, expires_at
        ) values (
          '10000000-0000-0000-0000-000000000002',
          '${second.rows[0].id}',
          'second',
          now() + interval '1 day'
        ) returning id
      `);

      const firstResult = await db.query<{ result_ok: boolean }>(`
        select * from public.submit_quote_response(
          '${firstToken.rows[0].id}',
          '${first.rows[0].id}',
          'approved',
          '',
          null,
          now()
        )
      `);
      expect(firstResult.rows[0].result_ok).toBe(true);

      const secondResult = await db.query<{
        result_ok: boolean;
        result_code: string;
      }>(`
        select * from public.submit_quote_response(
          '${secondToken.rows[0].id}',
          '${second.rows[0].id}',
          'approved',
          '',
          null,
          now()
        )
      `);
      expect(secondResult.rows[0]).toMatchObject({
        result_ok: false,
        result_code: 'EVENT_DATE_ALREADY_BOOKED',
      });

      const unchanged = await db.query<{
        status: string;
        used_at: string | null;
        history_count: number;
      }>(`
        select
          q.status,
          t.used_at,
          (
            select count(*)::int
            from public.quote_status_history h
            where h.quote_request_id = q.id
          ) as history_count
        from public.quote_requests q
        join public.quote_approval_tokens t on t.quote_request_id = q.id
        where q.id = '${second.rows[0].id}'
      `);
      expect(unchanged.rows[0]).toEqual({
        status: 'pending_review',
        used_at: null,
        history_count: 0,
      });

      await expect(
        db.exec(`
          insert into public.quote_requests (id, quote_number, event_date, status)
          values (
            '00000000-0000-0000-0000-000000000004',
            'LATE',
            '2026-09-26',
            'pending_review'
          )
        `),
      ).rejects.toThrow(/EVENT_DATE_ALREADY_BOOKED/);
    },
    30_000,
  );

  it(
    'fails clearly when duplicate real blocking bookings already exist',
    async () => {
      db = new PGlite();
      await createWorkflowSchema(db);
      await db.exec(`
        insert into public.quote_requests (id, quote_number, event_date, status)
        values
          ('00000000-0000-0000-0000-000000000005', 'DUP-A', '2026-10-03', 'booked'),
          ('00000000-0000-0000-0000-000000000006', 'DUP-B', '2026-10-03', 'confirmed')
      `);
      const migrationSql = await readFile(migrationPath, 'utf8');

      await expect(db.exec(migrationSql)).rejects.toThrow(
        /duplicate real blocking bookings exist/i,
      );
    },
    30_000,
  );
});

describe('availability-block migration', () => {
  it(
    'captures leads on limited dates while protecting hard commitments and allowing soft holds',
    async () => {
      db = new PGlite();
      await createWorkflowSchema(db);
      await db.exec(await readFile(migrationPath, 'utf8'));
      const blocksMigrationSql = await readFile(availabilityBlocksMigrationPath, 'utf8');
      await db.exec(blocksMigrationSql);
      await db.exec(await readFile(availabilityBlocksReconciliationPath, 'utf8'));

      await db.exec(`
        insert into public.availability_blocks (
          id, title, start_date, end_date, block_type, availability_effect, organization_name
        ) values (
          '20000000-0000-0000-0000-000000000001',
          'Partner weekend',
          '2026-09-11',
          '2026-09-13',
          'partner_booking',
          'hard_block',
          'XYZ Tailgating'
        );

        insert into public.quote_requests (id, quote_number, event_date, status)
        values (
          '00000000-0000-0000-0000-000000000010',
          'LIMITED-LEAD',
          '2026-09-12',
          'pending_review'
        );
      `);

      await expect(
        db.exec(`
          update public.quote_requests
          set status = 'customer_approved'
          where id = '00000000-0000-0000-0000-000000000010'
        `),
      ).rejects.toThrow(/EVENT_DATE_BLOCKED/);

      await db.exec(`
        insert into public.availability_blocks (
          id, title, start_date, end_date, block_type, availability_effect
        ) values (
          '20000000-0000-0000-0000-000000000002',
          'Tentative hold',
          '2026-10-03',
          '2026-10-03',
          'other',
          'soft_hold'
        );

        insert into public.quote_requests (id, quote_number, event_date, status)
        values (
          '00000000-0000-0000-0000-000000000011',
          'SOFT-HOLD-LEAD',
          '2026-10-03',
          'customer_approved'
        );
      `);

      const statuses = await db.query<{ quote_number: string; status: string }>(`
        select quote_number, status
        from public.quote_requests
        where id in (
          '00000000-0000-0000-0000-000000000010',
          '00000000-0000-0000-0000-000000000011'
        )
        order by quote_number
      `);
      expect(statuses.rows).toEqual([
        { quote_number: 'LIMITED-LEAD', status: 'pending_review' },
        { quote_number: 'SOFT-HOLD-LEAD', status: 'customer_approved' },
      ]);
    },
    30_000,
  );

  it(
    'requires an explicit override for overlapping blocking commitments',
    async () => {
      db = new PGlite();
      await createWorkflowSchema(db);
      await db.exec(await readFile(migrationPath, 'utf8'));
      await db.exec(await readFile(availabilityBlocksMigrationPath, 'utf8'));
      await db.exec(await readFile(availabilityBlocksReconciliationPath, 'utf8'));

      await db.exec(`
        insert into public.quote_requests (id, quote_number, event_date, status)
        values (
          '00000000-0000-0000-0000-000000000012',
          'CONFIRMED',
          '2026-11-07',
          'confirmed'
        )
      `);

      await expect(
        db.exec(`
          insert into public.availability_blocks (
            id, title, start_date, end_date, block_type, availability_effect
          ) values (
            '20000000-0000-0000-0000-000000000003',
            'Conflicting block',
            '2026-11-07',
            '2026-11-08',
            'maintenance',
            'hard_block'
          )
        `),
      ).rejects.toThrow(/BLOCKING_COMMITMENT_CONFLICT/);

      await db.exec(`
        insert into public.availability_blocks (
          id, title, start_date, end_date, block_type, availability_effect,
          conflict_override_at
        ) values (
          '20000000-0000-0000-0000-000000000004',
          'Approved conflict',
          '2026-11-07',
          '2026-11-08',
          'maintenance',
          'hard_block',
          now()
        )
      `);

      const count = await db.query<{ count: number }>(`
        select count(*)::int as count
        from public.availability_blocks
      `);
      expect(count.rows[0].count).toBe(1);
    },
    30_000,
  );
});
