import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { afterEach, describe, expect, it } from 'vitest';

const migrationPath = fileURLToPath(new URL(
  '../supabase/migrations/20260730193121_add_michigan_sales_tax_and_standard_deposit.sql',
  import.meta.url,
));

let db: PGlite | undefined;

afterEach(async () => {
  await db?.close();
  db = undefined;
});

describe('Michigan sales-tax migration', () => {
  it('applies twice, preserves historical obligations, and seeds current settings', async () => {
    db = new PGlite();
    await db.exec(`
      create table public.quote_requests (
        id bigint generated always as identity primary key,
        subtotal numeric,
        discount_amount numeric default 0,
        total_price numeric,
        deposit_amount numeric,
        final_balance numeric,
        calculated_breakdown jsonb
      );

      create table public.quote_options (
        id bigint generated always as identity primary key,
        subtotal numeric,
        discount_amount numeric default 0,
        total_price numeric,
        deposit_amount numeric,
        final_balance numeric,
        calculated_breakdown jsonb
      );

      create table public.pricing_settings (
        id uuid primary key default gen_random_uuid(),
        setting_key text unique not null,
        setting_value numeric,
        description text,
        updated_at timestamptz default now()
      );

      insert into public.quote_requests (
        subtotal,
        discount_amount,
        total_price,
        deposit_amount,
        final_balance,
        calculated_breakdown
      ) values (
        1100,
        100,
        1000,
        250,
        750,
        '{"details":{"deposit_percentage":25}}'::jsonb
      );

      insert into public.quote_options (
        subtotal,
        discount_amount,
        total_price,
        deposit_amount,
        final_balance,
        calculated_breakdown
      ) values (
        1100,
        100,
        1000,
        250,
        750,
        '{"details":{"deposit_percentage":25}}'::jsonb
      );
    `);

    const migrationSql = await readFile(migrationPath, 'utf8');
    await db.exec(migrationSql);

    const historicalQuote = await db.query<{
      pretax_total: number;
      taxable_amount: number;
      tax_rate: number;
      sales_tax_amount: number;
      total_price: number;
      deposit_percentage: number;
      deposit_amount: number;
      final_balance: number;
    }>(`
      select
        pretax_total::float8,
        taxable_amount::float8,
        tax_rate::float8,
        sales_tax_amount::float8,
        total_price::float8,
        deposit_percentage::float8,
        deposit_amount::float8,
        final_balance::float8
      from public.quote_requests
      where id = 1
    `);

    expect(historicalQuote.rows[0]).toEqual({
      pretax_total: 1000,
      taxable_amount: 0,
      tax_rate: 0,
      sales_tax_amount: 0,
      total_price: 1000,
      deposit_percentage: 25,
      deposit_amount: 250,
      final_balance: 750,
    });

    await db.exec(`
      insert into public.quote_requests (
        subtotal,
        discount_amount,
        pretax_total,
        taxable_amount,
        tax_rate,
        sales_tax_amount,
        total_price,
        deposit_percentage,
        deposit_amount,
        final_balance,
        calculated_breakdown
      ) values (
        1850,
        0,
        1850,
        1850,
        0.06,
        111,
        1961,
        40,
        784.40,
        1176.60,
        '{"sales_tax_amount":111,"details":{"sales_tax_percentage":6,"deposit_percentage":40}}'::jsonb
      );
    `);

    await db.exec(migrationSql);

    const taxAwareQuote = await db.query<{
      tax_rate: number;
      sales_tax_amount: number;
      total_price: number;
      deposit_percentage: number;
      deposit_amount: number;
      final_balance: number;
    }>(`
      select
        tax_rate::float8,
        sales_tax_amount::float8,
        total_price::float8,
        deposit_percentage::float8,
        deposit_amount::float8,
        final_balance::float8
      from public.quote_requests
      where id = 2
    `);
    expect(taxAwareQuote.rows[0]).toEqual({
      tax_rate: 0.06,
      sales_tax_amount: 111,
      total_price: 1961,
      deposit_percentage: 40,
      deposit_amount: 784.4,
      final_balance: 1176.6,
    });

    const option = await db.query<{ pretax_total: number; deposit_percentage: number }>(`
      select pretax_total::float8, deposit_percentage::float8
      from public.quote_options
      where id = 1
    `);
    expect(option.rows[0]).toEqual({
      pretax_total: 1000,
      deposit_percentage: 25,
    });

    const settings = await db.query<{ setting_key: string; setting_value: number }>(`
      select setting_key, setting_value::float8
      from public.pricing_settings
      where setting_key in ('sales_tax_percentage', 'deposit_percentage')
      order by setting_key
    `);
    expect(settings.rows).toEqual([
      { setting_key: 'deposit_percentage', setting_value: 40 },
      { setting_key: 'sales_tax_percentage', setting_value: 6 },
    ]);
  });
});
