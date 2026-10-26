// Run after scripts/test-pricing-workspace.mjs. Never accepts a hosted URL.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServerClient } from '@supabase/ssr';
import { fixtureAdminEmail, fixturePassword, fixtureAnonKey, fixtureServiceKey, historicalId } from '../tests/support/pricing-fixture.mjs';

const app = 'http://127.0.0.1:3106';
const storage = 'http://127.0.0.1:15439';
const jar = new Map();
const auth = createServerClient(storage, fixtureAnonKey, { cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: values => values.forEach(({ name, value }) => jar.set(name, value)) } });
const login = await auth.auth.signInWithPassword({ email: fixtureAdminEmail, password: fixturePassword });
assert.equal(login.error, null, 'Synthetic sign-in');
const cookie = [...jar].map(([name, value]) => `${name}=${value}`).join('; ');
const snapshot = async () => {
  const response = await fetch(`${storage}/__fixture/status`, { headers: { 'x-fixture-control': fixtureServiceKey } });
  const data = await response.json(); assert.equal(data.fixture, true);
  assert(data.quotes.every(quote => quote.is_test_quote && quote.email.endsWith('@example.invalid')), 'Only synthetic database records allowed');
  return data;
};
const save = settings => fetch(`${app}/api/admin/pricing`, { method: 'PUT', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ settings }) });
const before = await snapshot();
const historical = JSON.stringify(before.quotes.find(quote => quote.id === historicalId));
if (process.argv.includes('--verify-ui-save')) {
  const settings = Object.fromEntries(before.settings.map(row => [row.setting_key, Number(row.setting_value)]));
  assert.equal(settings.additional_event_hourly_rate, 130, 'Browser save persisted to PostgreSQL');
  const email = `browser-save-${Date.now()}@example.invalid`;
  const response = await fetch(`${app}/api/quote-requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_name: 'Browser Save Synthetic Test', email, phone: '2025550100', event_date: '2099-07-01', event_type: 'Private Party', guest_count: 100, event_address: '4463 Helmsway Dr', city: 'Lansing', state: 'MI', zip_code: '48911', event_start_time: '14:00', event_end_time: '23:00', has_power: true, has_water: true }) });
  assert.equal(response.status, 200, await response.text());
  const row = (await snapshot()).quotes.find(quote => quote.email === email);
  assert.equal(row.calculated_breakdown.extra_hours_fee, 130);
  assert.equal(Number(row.after_hours_fee), 80);
  assert.equal(Number(row.total_price), 1468.1);
  assert.equal(JSON.stringify((await snapshot()).quotes.find(quote => quote.id === historicalId)), historical);
  const path = new URL('../output/pricing-persistence/results.json', import.meta.url);
  const report = JSON.parse(await readFile(path, 'utf8'));
  report.browserSave = { savedRate: 130, persistedAfterReload: true, newQuoteExtraHoursFee: 130, newQuoteTotal: 1468.1, isolatedDatabaseOnly: true };
  await writeFile(path, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.browserSave));
  await auth.auth.signOut({ scope: 'local' });
  process.exit(0);
}
assert.equal((await fetch(`${app}/api/admin/pricing`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings: { base_price_100_guests: 1 } }) })).status, 401, 'Anonymous save denied');

const policy = { base_price_100_guests: 1175, event_time_policy_enabled: 1, extra_hours_enabled: 1, included_event_hours: 8, additional_event_hourly_rate: 100, after_hours_hourly_rate: 75, after_hours_cutoff_hour: 22, duration_rounding: 1, after_hours_rounding: 1, after_hours_max_hours: 0, stack_hourly_charges: 1 };
assert.equal((await save(policy)).status, 200, 'Real settings route saves');
const persisted = await snapshot();
const stored = Object.fromEntries(persisted.settings.map(row => [row.setting_key, Number(row.setting_value)]));
for (const [key, value] of Object.entries(policy)) assert.equal(stored[key], value, `PostgreSQL readback: ${key}`);
const reload = await fetch(`${app}/admin/pricing`, { headers: { Cookie: cookie } });
assert.equal(reload.status, 200);
const html = await reload.text();
for (const [key, value] of [['base_price_100_guests', 1175], ['included_event_hours', 8], ['additional_event_hourly_rate', 100]]) {
  assert.match(html, new RegExp(`id="pricing-${key}"[^>]*value="${value}"`), `Fresh server-rendered page reloads ${key}`);
}
const run = Date.now();
const scenarios = [
  ['14:00','22:00',0,0], ['12:00','22:00',200,0], ['16:00','23:00',0,75], ['14:00','23:00',100,75],
];
const results = [];
async function submit(start, end, suffix, expectedExtra, expectedLate) {
  const email = `pricing-${run}-${suffix}@example.invalid`;
  const response = await fetch(`${app}/api/quote-requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_name: 'Synthetic Pricing Test', email, phone: '2025550100', event_date: '2099-07-01', event_type: 'Private Party', guest_count: 100, event_address: '4463 Helmsway Dr', city: 'Lansing', state: 'MI', zip_code: '48911', event_start_time: start, event_end_time: end, has_power: true, has_water: true, additional_notes: 'Isolated fixture only. No email delivery.' }) });
  assert.equal(response.status, 200, await response.text());
  const row = (await snapshot()).quotes.find(quote => quote.email === email);
  assert(row, 'Public endpoint persisted a new quote');
  assert.equal(Number(row.calculated_breakdown.extra_hours_fee), expectedExtra);
  assert.equal(Number(row.after_hours_fee), expectedLate);
  assert.equal(Number(row.base_price), 1175);
  const subtotal = 1175 + expectedExtra + expectedLate;
  assert.equal(Number(row.subtotal), subtotal);
  assert.equal(Number(row.total_price), Math.round(subtotal * 106) / 100);
  results.push({ start, end, extraHours: expectedExtra, afterHours: expectedLate, total: Number(row.total_price) });
  return row;
}
for (const [index, [start,end,extra,late]] of scenarios.entries()) await submit(start,end,index,extra,late);
const earlier = JSON.stringify((await snapshot()).quotes);
assert.equal((await save({ additional_event_hourly_rate: 125, after_hours_hourly_rate: 80 })).status, 200);
assert.equal(JSON.stringify((await snapshot()).quotes), earlier, 'Changing settings does not recalculate existing quotes');
await submit('14:00','23:00','changed-rates',125,80);

const beforeInvalid = JSON.stringify((await snapshot()).settings);
assert.equal((await save({ base_price_100_guests: 999, after_hours_cutoff_hour: 100 })).status, 400);
assert.equal(JSON.stringify((await snapshot()).settings), beforeInvalid, 'Invalid batch leaves all settings unchanged');
await fetch(`${storage}/__fixture/fail-next-save`, { method: 'POST', headers: { 'x-fixture-control': fixtureServiceKey } });
assert.equal((await save({ additional_event_hourly_rate: 900 })).status, 500);
assert.equal(JSON.stringify((await snapshot()).settings), beforeInvalid, 'Failed save leaves persisted settings unchanged');
const after = await snapshot();
assert.equal(JSON.stringify(after.quotes.find(quote => quote.id === historicalId)), historical, 'Historical fixture quote unchanged');
const report = { passed: true, isolation: 'Loopback-only fixture API and disposable PostgreSQL storage; no hosted environment files or credentials', validation: ['Real Next server and pricing PUT handler', 'Real Supabase client HTTP serialization', 'PostgreSQL settings readback', 'Fresh server-rendered settings page', 'Real public quote POST handler', 'Five persisted synthetic quotes use saved rules', 'Existing quotes retain their saved totals', 'Anonymous, invalid, and failed saves rejected'], scenarios: results, historicalFixtureUnchanged: true, limitations: ['Supabase Auth and REST boundary simulated locally; hosted RLS, deployment and provider delivery not tested'] };
await mkdir(new URL('../output/pricing-persistence/', import.meta.url), { recursive: true });
await writeFile(new URL('../output/pricing-persistence/results.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await auth.auth.signOut({ scope: 'local' });
