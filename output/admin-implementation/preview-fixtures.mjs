// Rebuildable isolated QA harness. No auth bypass, live data, or application route.
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
const require = createRequire(import.meta.url);
const root = process.cwd();
const out = path.join(root, 'output/admin-implementation');
const esbuild = require(require.resolve('esbuild', { paths: [path.dirname(require.resolve('vitest'))] }));
await esbuild.build({ entryPoints: [path.join(out, 'fixture-entry.jsx')], bundle: true, outfile: path.join(out,'fixture-bundle.txt'), jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, alias: { '@': root, 'next/navigation': path.join(out,'fixture-navigation.jsx'), 'next/link': path.join(out,'fixture-navigation.jsx') } });
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');
const css = await postcss([tailwind({ base: root })]).process(await fs.readFile(path.join(root,'app/globals.css'),'utf8'), { from: path.join(root,'app/globals.css') });
await fs.writeFile(path.join(out,'fixture.css'), css.css + '\n' + await fs.readFile(path.join(root,'app/admin/operations.css'),'utf8') + '\n' + await fs.readFile(path.join(root,'app/admin/quote-desk.css'),'utf8') + '\n.fixture-banner { padding: 5px 16px; background: #f5f5f5; border-bottom: 1px solid #e5e7eb; color: #526279; font: 12px Arial; } @media(min-width:1024px) { .fixture-banner { position: absolute; top: 0; left: 240px; right: 0; z-index: 2; height: 36px; display: flex; align-items: center; padding-left: 30px; } }');
if(process.env.FIXTURE_BUILD_ONLY === '1') process.exit(0);
const html = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Signature Operations · Synthetic fixture preview</title><link rel="stylesheet" href="/fixture.css"><div id="root"></div><script src="/fixture-bundle.txt"></script></html>';
http.createServer(async (req,res) => {
  if(req.method !== 'GET') { res.writeHead(405); res.end('Read-only fixture preview'); return; }
  const file = req.url.split('?')[0];
  // Fixture-only reads. This server has no database or provider clients and rejects writes.
  if (file.startsWith('/api/')) { res.setHeader('content-type','application/json'); res.end(JSON.stringify(file.endsWith('/email-preview') ? {to:'morgan@example.com',subject:'Synthetic quote preview',html:'<p>Synthetic preview only. No customer email was sent.</p>',text:'Synthetic preview only.'} : {options:[]})); return; }
  if (file === '/quote-desk-comparison') { res.setHeader('content-type','text/html'); res.end(await fs.readFile(path.join(root,'output/quote-desk-implementation/comparison.html'),'utf8')); return; }
  if (['/quote-desk/reference.png','/quote-desk/desktop.png'].includes(file)) { res.setHeader('content-type','image/png'); res.end(await fs.readFile(path.join(root,'output/quote-desk-implementation',path.basename(file)))); return; }
  if (['/fixture.css','/fixture-bundle.txt'].includes(file)) { res.setHeader('content-type',file.endsWith('.css') ? 'text/css' : 'text/javascript'); res.end(await fs.readFile(path.join(out,file.slice(1)))); }
  else { res.setHeader('content-type','text/html'); res.end(html); }
}).listen(3011,'127.0.0.1',() => console.log('Synthetic fixture preview: http://127.0.0.1:3011'));


