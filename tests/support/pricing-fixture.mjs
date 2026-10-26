// Test-only Supabase-compatible boundary. Real HTTP clients and real PostgreSQL
// storage; not a replacement for hosted Supabase Auth/RLS/PostgREST acceptance.
import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

export const fixturePassword = 'fixture-password-only';
export const fixtureAdminEmail = 'pricing-admin@example.invalid';
export const fixtureServiceKey = 'fixture-service-key-not-a-real-secret';
export const fixtureAnonKey = 'fixture-anon-key-not-a-real-secret';
export const historicalId = '00000000-0000-4000-8000-000000000099';
const secret = 'local-pricing-fixture-signing-secret-only';
const baseline = { base_price_100_guests: 1000, base_price_150_guests: 1200, base_price_200_guests: 1400, base_price_200_plus: 1600, included_miles: 15, travel_rate_per_mile: 5, generator_fee: 150, water_fee: 75, after_hours_hourly_rate: 75, after_hours_cutoff_hour: 22, cleaning_fee: 0, damage_waiver_fee: 0, extra_day_fee: 0, rush_booking_fee: 250, sales_tax_percentage: 6, deposit_percentage: 40 };

function userFor(email) {
  return { id: email === fixtureAdminEmail ? '00000000-0000-4000-8000-000000000001' : '00000000-0000-4000-8000-000000000002', email, aud: 'authenticated', role: 'authenticated', app_metadata: { is_admin: email === fixtureAdminEmail }, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
}
export function fixtureToken(email = fixtureAdminEmail) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const user = userFor(email);
  const claims = Buffer.from(JSON.stringify({ ...user, sub: user.id, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64url');
  const payload = `${header}.${claims}`;
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}
function verify(token) {
  try {
    const [header, payload, signature] = token.split('.');
    const expected = createHmac('sha256', secret).update(`${header}.${payload}`).digest();
    const supplied = Buffer.from(signature, 'base64url');
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return claims.exp > Date.now() / 1000 ? userFor(claims.email) : null;
  } catch { return null; }
}
/** @param {{ port?: number, dataDir?: string }} options */
export async function startPricingFixture({ port = 0, dataDir } = {}) {
  const db = new PGlite(dataDir);
  const schema = await readFile(new URL('../../supabase/schema.sql', import.meta.url), 'utf8');
  for (const table of ['quote_requests', 'pricing_settings']) {
    const statement = schema.match(new RegExp(`create table if not exists ${table} \\([\\s\\S]*?\\n\\);`, 'i'))?.[0];
    if (!statement) throw new Error(`Fixture schema missing ${table}`);
    await db.exec(statement);
  }
  if (!(await db.query('select 1 from pricing_settings limit 1')).rows.length) {
    for (const [key, value] of Object.entries(baseline)) await db.query('insert into pricing_settings(setting_key, setting_value) values ($1,$2)', [key, value]);
    await db.query(`insert into quote_requests(id,quote_number,customer_name,email,event_date,guest_count,event_start_time,event_end_time,base_price,total_price,deposit_amount,final_balance,status,is_test_quote,calculated_breakdown) values ($1,'FIXTURE-HISTORICAL','Synthetic historical customer','historical@example.invalid','2099-06-01',100,'14:00','22:00',1000,1060,424,636,'quote_sent',true,'{"total_price":1060,"details":{"fixture":true}}')`, [historicalId]);
  }
  let failNextWrite = false;
  const requests = [];
  const read = async req => {
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    return chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
  };
  const server = createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3106');
    res.setHeader('Access-Control-Allow-Headers', 'authorization,apikey,content-type,x-client-info,x-supabase-api-version,prefer');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
    const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (req.method === 'OPTIONS') return send(200, {});
    const url = new URL(req.url, 'http://127.0.0.1');
    const bearer = String(req.headers.authorization ?? '').replace(/^Bearer /, '');
    const user = verify(bearer);
    requests.push({ method: req.method, path: url.pathname });
    try {
      if (url.pathname === '/auth/v1/token') {
        const body = await read(req);
        if (![fixtureAdminEmail, 'pricing-staff@example.invalid'].includes(body.email) || body.password !== fixturePassword) return send(400, { error: 'invalid_grant', error_description: 'Fixture credentials required' });
        return send(200, { access_token: fixtureToken(body.email), refresh_token: 'fixture-refresh-token', expires_in: 86400, token_type: 'bearer', user: userFor(body.email) });
      }
      if (url.pathname === '/auth/v1/user') return send(user ? 200 : 401, user ?? { message: 'Fixture session required' });
      if (url.pathname === '/auth/v1/logout') return send(200, {});
      if (url.pathname.startsWith('/__fixture/')) {
        if (req.headers['x-fixture-control'] !== fixtureServiceKey) return send(403, { message: 'Fixture control only' });
        if (url.pathname === '/__fixture/fail-next-save') { failNextWrite = true; return send(200, { ok: true }); }
        return send(200, { fixture: true, settings: (await db.query('select setting_key,setting_value from pricing_settings order by setting_key')).rows, quotes: (await db.query('select * from quote_requests order by created_at,id')).rows, requests });
      }
      const service = bearer === fixtureServiceKey;
      if (url.pathname === '/rest/v1/pricing_settings') {
        if (!service && !user?.app_metadata.is_admin) return send(403, { message: 'Admin required' });
        if (req.method === 'POST') {
          if (!service) return send(403, { message: 'Service write required' });
          if (failNextWrite) { failNextWrite = false; return send(503, { message: 'Deliberate fixture storage failure' }); }
          const body = await read(req);
          const rows = Array.isArray(body) ? body : [body];
          const saved = await db.transaction(async tx => {
            const result = [];
            for (const row of rows) result.push(...(await tx.query('insert into pricing_settings(setting_key,setting_value,description) values ($1,$2,$3) on conflict(setting_key) do update set setting_value=excluded.setting_value,description=excluded.description returning setting_key,setting_value,description', [row.setting_key, row.setting_value, row.description])).rows);
            return result;
          });
          return send(201, saved);
        }
        return send(200, (await db.query('select setting_key,setting_value,description from pricing_settings order by setting_key')).rows);
      }
      if (url.pathname === '/rest/v1/quote_requests') {
        if (!service) return send(403, { message: 'Service access required' });
        if (req.method === 'POST') {
          const body = await read(req);
          const rows = Array.isArray(body) ? body : [body];
          const known = new Set((await db.query("select column_name from information_schema.columns where table_name='quote_requests'")).rows.map(row => row.column_name));
          const inserted = await db.transaction(async tx => {
            const result = [];
            for (const row of rows) {
              // Mark only inside this isolated test database; the real public
              // endpoint and its status/validation remain completely unchanged.
              const entries = Object.entries({ ...row, is_test_quote: true });
              if (entries.some(([key]) => !known.has(key))) throw new Error('Unknown quote column');
              const fields = entries.map(([key]) => `"${key}"`).join(',');
              const values = entries.map(([, value]) => typeof value === 'object' ? JSON.stringify(value) : value);
              result.push(...(await tx.query(`insert into quote_requests(${fields}) values (${values.map((_, index) => `$${index + 1}`).join(',')}) returning *`, values)).rows);
            }
            return result;
          });
          return send(201, inserted);
        }
        const clauses = []; const values = [];
        for (const key of ['email', 'event_date', 'id', 'created_at']) {
          const condition = url.searchParams.get(key);
          if (!condition) continue;
          const [op, ...parts] = condition.split('.');
          if (!['eq', 'gte'].includes(op)) throw new Error('Unsupported fixture query');
          values.push(parts.join('.')); clauses.push(`"${key}" ${op === 'eq' ? '=' : '>='} $${values.length}`);
        }
        return send(200, (await db.query(`select * from quote_requests${clauses.length ? ` where ${clauses.join(' and ')}` : ''} order by created_at`, values)).rows);
      }
      if (url.pathname === '/rest/v1/availability_blocks') {
        if (!service) return send(403, { message: 'Service access required' });
        return send(200, []); // This isolated fixture has no reserved dates.
      }
      if (url.pathname === '/rest/v1/quote_options') return send(200, []);
      return send(404, { message: 'Unsupported test endpoint', path: url.pathname });
    } catch (error) { return send(500, { message: error.message }); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return { db, url: `http://127.0.0.1:${server.address().port}`, requests, close: async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await db.close(); } };
}
