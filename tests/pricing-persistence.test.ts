import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, sep } from 'node:path';
import { createServerClient } from '@supabase/ssr';
import { startPricingFixture, fixtureToken, fixtureAnonKey, fixtureServiceKey, historicalId } from './support/pricing-fixture.mjs';

// Only the Next request cookie context is supplied here. Auth checks, Supabase
// clients, HTTP transport, settings reads/writes, calculator and quote POST are real.
const context = vi.hoisted(() => ({ cookies: new Map<string, string>() }));
vi.mock('next/headers', () => ({ cookies: async () => ({
  getAll: () => [...context.cookies].map(([name, value]) => ({ name, value })),
  set: (name: string, value: string) => { context.cookies.set(name, value); },
}) }));
import { PUT } from '@/app/api/admin/pricing/route';
import { POST } from '@/app/api/quote-requests/route';
import PricingPage from '@/app/admin/pricing/page';
import { getPricingSettings } from '@/lib/quotes/build-quote-calculation';

let fixture: Awaited<ReturnType<typeof startPricingFixture>>;
let directory: string;
const proposal = { base_price_100_guests: 1175, event_time_policy_enabled: 1, extra_hours_enabled: 1, included_event_hours: 8, additional_event_hourly_rate: 100, after_hours_hourly_rate: 75, after_hours_cutoff_hour: 22, after_hours_max_hours: 0, duration_rounding: 1, after_hours_rounding: 1, stack_hourly_charges: 1 };
const save = (settings: unknown) => PUT(new Request('http://fixture.invalid/api/admin/pricing', { method: 'PUT', body: JSON.stringify({ settings }) }));
const quote = (email: string, start: string, end: string) => POST(new Request('http://fixture.invalid/api/quote-requests', { method: 'POST', body: JSON.stringify({ customer_name: 'Synthetic Pricing Test', email, phone: '2025550100', event_date: '2099-07-01', event_type: 'Wedding', guest_count: 100, event_address: '4463 Helmsway Dr', city: 'Lansing', state: 'MI', zip_code: '48911', event_start_time: start, event_end_time: end, has_power: true, has_water: true }) }));
async function session(email = 'pricing-admin@example.invalid') {
  context.cookies.clear();
  const client = createServerClient(fixture.url, fixtureAnonKey, { cookies: { getAll: () => [], setAll: rows => { for (const row of rows) context.cookies.set(row.name, row.value); } } });
  const result = await client.auth.setSession({ access_token: fixtureToken(email), refresh_token: 'fixture-refresh-only' });
  expect(result.error).toBeNull();
}
beforeEach(async () => {
  directory = await mkdtemp(resolve(tmpdir(), 'signature-pricing-test-'));
  fixture = await startPricingFixture({ dataDir: directory });
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', fixture.url);
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', fixtureAnonKey);
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', fixtureServiceKey);
  vi.stubEnv('GOOGLE_MAPS_API_KEY', '');
  const fetch = globalThis.fetch;
  vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
    const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
    if (url.origin !== fixture.url) throw new Error('External request blocked in persistence test');
    return fetch(input, init);
  });
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  await session();
}, 60_000);
afterEach(async () => {
  await fixture?.close();
  context.cookies.clear(); vi.restoreAllMocks(); vi.unstubAllEnvs();
  if (directory) {
    const absolute = resolve(directory);
    if (!absolute.startsWith(resolve(tmpdir()) + sep + 'signature-pricing-test-')) throw new Error('Unsafe fixture cleanup path');
    await rm(absolute, { recursive: true, force: true });
  }
});

describe('real pricing persistence against isolated PostgreSQL', () => {
  it('saves through the real API, reloads the page, and survives closing/reopening the database', async () => {
    expect((await PricingPage()).props.initialSettings.base_price_100_guests).toBe(1000);
    const response = await save(proposal);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true });
    expect((await PricingPage()).props.initialSettings).toMatchObject(proposal);
    expect(await getPricingSettings()).toMatchObject(proposal);
    const saved = await fixture.db.query<{ setting_value: number }>("select setting_value from pricing_settings where setting_key='additional_event_hourly_rate'");
    expect(Number(saved.rows[0].setting_value)).toBe(100);
    await fixture.close();
    fixture = await startPricingFixture({ dataDir: directory });
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', fixture.url);
    await session();
    expect((await PricingPage()).props.initialSettings).toMatchObject(proposal);
  });
  it('creates all four new quotes using saved rules and never rewrites older quotes', async () => {
    const historicalBefore = await fixture.db.query('select * from quote_requests where id=$1', [historicalId]);
    expect((await save(proposal)).status).toBe(200);
    const cases = [
      ['14:00', '22:00', 0, 0, 1245.5], ['12:00', '22:00', 200, 0, 1457.5],
      ['16:00', '23:00', 0, 75, 1325], ['14:00', '23:00', 100, 75, 1431],
    ] as const;
    for (const [index, [start, end, extra, late, total]] of cases.entries()) {
      const email = `scenario-${index}@example.invalid`;
      expect((await quote(email, start, end)).status).toBe(200);
      const { rows: [stored] } = await fixture.db.query<Record<string, unknown>>('select * from quote_requests where email=$1', [email]);
      expect(Number(stored.base_price)).toBe(1175);
      expect(Number(stored.after_hours_fee)).toBe(late);
      expect(Number(stored.total_price)).toBe(total);
      expect(Number(stored.deposit_amount)).toBe(Math.round(total * 40) / 100);
      expect(stored.calculated_breakdown).toMatchObject({ extra_hours_fee: extra, total_price: total });
    }
    expect((await save({ additional_event_hourly_rate: 160, after_hours_hourly_rate: 90 })).status).toBe(200);
    expect((await quote('updated-rates@example.invalid', '14:00', '23:00')).status).toBe(200);
    const { rows: [newQuote] } = await fixture.db.query<Record<string, unknown>>("select * from quote_requests where email='updated-rates@example.invalid'");
    expect(Number(newQuote.total_price)).toBe(1510.5); // (1175 + 160 + 90) × 1.06
    expect((await fixture.db.query('select * from quote_requests where id=$1', [historicalId])).rows).toEqual(historicalBefore.rows);
    const { rows: [oldQuote] } = await fixture.db.query<{ total_price: number }>("select total_price from quote_requests where email='scenario-3@example.invalid'");
    expect(Number(oldQuote.total_price)).toBe(1431);
  });
  it('keeps database state on invalid data, anonymous access, and non-admin access', async () => {
    const before = (await fixture.db.query('select * from pricing_settings order by setting_key')).rows;
    expect((await save({ base_price_100_guests: 2000, after_hours_cutoff_hour: 100 })).status).toBe(400);
    context.cookies.clear(); expect((await save(proposal)).status).toBe(401);
    await session('pricing-staff@example.invalid'); expect((await save(proposal)).status).toBe(403);
    expect((await fixture.db.query('select * from pricing_settings order by setting_key')).rows).toEqual(before);
  });
  it('reports a real storage failure, retains the previous persisted rate, and permits retry', async () => {
    await fetch(`${fixture.url}/__fixture/fail-next-save`, { method: 'POST', headers: { 'x-fixture-control': fixtureServiceKey } });
    const response = await save(proposal);
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ ok: false });
    expect((await PricingPage()).props.initialSettings.base_price_100_guests).toBe(1000);
    expect((await save(proposal)).status).toBe(200);
    expect((await PricingPage()).props.initialSettings).toMatchObject(proposal);
  });
});
