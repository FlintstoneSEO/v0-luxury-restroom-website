// Launch an isolated copy of the actual Next application. No .env.local allowed.
import { existsSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { startPricingFixture, fixtureAnonKey, fixtureServiceKey } from '../tests/support/pricing-fixture.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
if (['.env', '.env.local', '.env.development', '.env.development.local'].some(name => existsSync(resolve(root, name)))) throw new Error('Use an isolated worktree without environment files. Refusing to launch.');
const env = { ...process.env };
for (const key of Object.keys(env)) if (/SUPABASE|RESEND|GOOGLE_MAPS|DATABASE_URL|STRIPE|SQUARE|DROPBOX|SIGNWELL|SENDGRID|NEXT_PUBLIC_/.test(key)) delete env[key];
const dataDir = resolve(root, '.next-pricing-fixture/data');
mkdirSync(resolve(root, '.next-pricing-fixture'), { recursive: true });
const fixture = await startPricingFixture({ port: 15439, dataDir });
const guard = fileURLToPath(new URL('../tests/support/local-network-only.cjs', import.meta.url)).replaceAll('\\', '/');
Object.assign(env, { NEXT_PUBLIC_SUPABASE_URL: fixture.url, NEXT_PUBLIC_SUPABASE_ANON_KEY: fixtureAnonKey, SUPABASE_SERVICE_ROLE_KEY: fixtureServiceKey, NEXT_DIST_DIR: '.next-pricing-fixture/build', NEXT_TELEMETRY_DISABLED: '1', NODE_OPTIONS: `--require "${guard}"` });
const child = spawn(process.execPath, [resolve(root, 'node_modules/next/dist/bin/next'), 'dev', '--webpack', '--hostname', '127.0.0.1', '--port', '3106'], { cwd: root, env, stdio: 'inherit', windowsHide: true });
let closing = false;
async function close() { if (closing) return; closing = true; child.kill(); await fixture.close(); }
process.on('SIGINT', () => { void close(); });
process.on('SIGTERM', () => { void close(); });
child.on('exit', code => { process.exitCode = code ?? 0; void close(); });
console.log('Isolated pricing test: http://127.0.0.1:3106/admin/pricing');
console.log('Fixture PostgreSQL API: http://127.0.0.1:15439 — synthetic data only');
