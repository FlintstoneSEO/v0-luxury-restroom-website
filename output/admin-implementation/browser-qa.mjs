import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/wende/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out = 'output/admin-implementation/';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const results = { checks: [], viewports: [], errors: [], interceptedFixtureMutations: [] };
page.on('pageerror', error => results.errors.push(error.message));
await page.route('**/api/**', async route => {
  const req = route.request();
  if(req.method() === 'GET') return route.fulfill({ json: { ok: true, options: [] } });
  results.interceptedFixtureMutations.push({ method: req.method(), path: new URL(req.url()).pathname });
  if(req.url().endsWith('/email-preview')) return route.fulfill({ json: { ok: true, to: 'fixture@example.com', subject: 'Synthetic quote preview', html: '<p>Fixture preview only</p>', text: 'Fixture preview only' } });
  if(req.method() === 'PATCH') await new Promise(resolve => setTimeout(resolve,800));
  return route.fulfill({ status: 500, json: { error: 'Simulated save failure — no data was written.' } });
});
async function check(name, fn) { try { await fn(); results.checks.push({ name, result: 'PASS' }); } catch(error) { results.checks.push({ name, result: 'FAIL', error: error.message }); } }
function assert(condition,message) { if(!condition) throw new Error(message); }
async function allQuotes() { await page.getByRole('button',{name:/^All Quotes/}).click(); }
await page.goto('http://127.0.0.1:3011');
await page.getByRole('heading',{name:'Quotes & bookings'}).waitFor();
await check('Reference All Quotes default and hidden tests', async () => {
  assert(await page.getByRole('button',{name:'All Quotes',exact:true}).getAttribute('aria-pressed') === 'true','Wrong default');
  assert(await page.getByText('Hidden Test Record',{exact:true}).count() === 0,'Test record visible');
});
await allQuotes();
await check('Reference five-column queue and review-view filters', async () => {
  assert(await page.locator('.operations-desktop-table th').allTextContents().then(values=>values.join('|')) === 'Customer|Event|Status|Total|Next step','Queue columns differ from reference');
  await page.getByRole('button',{name:/^Needs action/}).click();
  assert(await page.locator('.operations-desktop-table tbody tr').count() > 0,'Needs action view empty');
  await page.getByRole('button',{name:/^Waiting \(/}).click();
  assert(await page.locator('.operations-desktop-table tbody tr').count() > 0,'Waiting view empty');
  await allQuotes();
});
for (const width of [1586,1440,1280,1024,768,390,375,320]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.screenshot({ path: `${out}dashboard-${width}.png`, fullPage: true });
  const state = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth, font: getComputedStyle(document.querySelector('.operations-table')).fontFamily, headingHeight: document.querySelector('h1').getBoundingClientRect().height, queueTop: document.querySelector('.operations-queue').getBoundingClientRect().top, detailVisible: !!document.querySelector('.operations-workbench').offsetWidth }));
  results.viewports.push({ width, ...state });
  await check(`No horizontal page overflow at ${width}px`, async () => assert(state.documentWidth <= width, JSON.stringify(state)));
}
await page.setViewportSize({ width: 390, height: 844 });
await check('Mobile selection, detail focus, Back focus and retained search', async () => {
  await page.getByRole('textbox',{name:'Search quotes'}).fill('Morgan');
  const inspect = page.getByRole('button',{name:'Inspect Avery Morgan quote',exact:true});
  await inspect.click();
  assert(await page.locator('#workbench-heading').evaluate(el=>el===document.activeElement),'Detail focus missing');
  await page.screenshot({ path: `${out}phone-workbench.png`, fullPage:true });
  await page.getByRole('button',{name:'Back to quote queue'}).click();
  assert(await page.getByRole('textbox',{name:'Search quotes'}).inputValue() === 'Morgan','Search lost');
  assert(await inspect.evaluate(el=>el===document.activeElement),'Selected row focus not restored');
  await page.getByRole('textbox',{name:'Search quotes'}).fill('');
});
await check('Mobile navigation keyboard Escape and focus return', async () => {
  const trigger=page.getByRole('button',{name:'Open admin navigation'});
  await trigger.focus(); await page.keyboard.press('Enter');
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({state:'hidden'});
  assert(await trigger.evaluate(el=>el===document.activeElement),'Menu focus not restored');
});
await check('Empty search and reset recovery', async () => {
  await page.getByRole('textbox',{name:'Search quotes'}).fill('no-matching-record-xyz');
  await page.getByRole('heading',{name:'No quotes match this view'}).waitFor();
  await page.screenshot({path:`${out}empty-results.png`,fullPage:true});
  await page.getByRole('button',{name:'Reset filters',exact:true}).last().click();
  assert(await page.getByRole('textbox',{name:'Search quotes'}).inputValue() === '', 'Search not reset');
});
await page.setViewportSize({ width:1440,height:1000 });
await check('Distance warning, independent statuses, financial lock and pricing/activity/notes tabs', async () => {
  await page.locator('.operations-desktop-table [data-quote-id="fixture-3"]').click();
  await page.getByText('Manual distance review needed.',{exact:false}).waitFor();
  await page.screenshot({path:`${out}manual-review.png`,fullPage:true});
  await page.locator('.operations-desktop-table [data-quote-id="fixture-5"]').click();
  await page.getByText('Customer-facing pricing is locked.',{exact:false}).waitFor();
  await page.getByRole('tab',{name:'Pricing',exact:true}).focus();
  await page.keyboard.press('Enter');
  await page.getByText('Final balance',{exact:true}).waitFor();
  await page.keyboard.press('ArrowRight');
  assert(await page.getByRole('tab',{name:'Activity',exact:true}).getAttribute('aria-selected') === 'true','Tab arrow navigation failed');
  await page.keyboard.press('ArrowRight');
  await page.getByRole('heading',{name:'Internal notes · admin only'}).waitFor();
});
await check('All filters/sorts and explicit test visibility', async () => {
  await page.locator('summary').click();
  const combos = page.getByRole('combobox');
  assert(await combos.count() === 8,'Filter or sorting control missing');
  await page.getByRole('combobox',{name:'Filter test quotes',exact:true}).click();
  await page.getByRole('option',{name:'Test Quotes Only',exact:true}).click();
  await page.getByText('Hidden Test Record',{exact:true}).first().waitFor();
  assert(await page.locator('.operations-desktop-table tbody tr').count() === 1,'Test-only filter incorrect');
  await page.getByRole('combobox',{name:'Filter test quotes',exact:true}).click();
  await page.getByRole('option',{name:'Hide Test Quotes',exact:true}).click();
  for(const option of ['Oldest First','Event Date (Soonest)','Event Date (Latest)','Highest Total','Lowest Total','Status A-Z','Newest First']) {
    await page.getByRole('combobox',{name:'Sort quotes',exact:true}).click();
    await page.getByRole('option',{name:option,exact:true}).click();
  }
  await page.getByRole('combobox',{name:'Filter by date availability',exact:true}).click();
  await page.getByRole('option',{name:'Booking Conflicts',exact:true}).click();
  assert(await page.locator('.operations-desktop-table tbody tr').count() === 2,'Conflict filter incorrect');
  await page.getByRole('button',{name:'Reset filters',exact:true}).first().click();
  await page.getByRole('combobox',{name:'Filter pipeline stage',exact:true}).selectOption('closed_lost');
  assert(await page.locator('.operations-desktop-table tbody tr').count() === 3,'Closed records inaccessible');
});
for (const mode of ['empty','error']) {
  await page.goto(`http://127.0.0.1:3011/?mode=${mode}`);
  await page.screenshot({path:`${out}source-${mode}.png`,fullPage:true});
}
await page.goto('http://127.0.0.1:3011/?screen=loading');
await page.getByRole('status').waitFor();
await page.screenshot({path:`${out}loading.png`,fullPage:true});
await page.goto('http://127.0.0.1:3011/?screen=detail');
await check('Existing editor retains notes after a simulated save failure and prevents duplicate submit', async () => {
  await page.getByLabel('Internal Notes (Staff Only)',{exact:true}).fill('Preserve this unsaved fixture note.');
  const before = results.interceptedFixtureMutations.filter(request=>request.method === 'PATCH').length;
  await page.getByRole('button',{name:'Save Changes',exact:true}).click();
  assert(await page.getByRole('button',{name:'Saving...',exact:true}).isDisabled(),'Save not disabled while submitting');
  await page.getByText('Simulated save failure — no data was written.',{exact:true}).waitFor();
  assert(results.interceptedFixtureMutations.filter(request=>request.method === 'PATCH').length === before+1,'Duplicate save submission');
  assert(await page.getByLabel('Internal Notes (Staff Only)',{exact:true}).inputValue() === 'Preserve this unsaved fixture note.','Entered note lost');
  await page.screenshot({path:`${out}editor-save-error.png`,fullPage:true});
});
await check('Customer send uses existing confirmation and can cancel without sending', async () => {
  const before = results.interceptedFixtureMutations.length;
  await page.getByRole('button',{name:'Send Quote Email',exact:true}).click();
  await page.getByRole('alertdialog').waitFor();
  await page.screenshot({path:`${out}send-confirmation.png`});
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  assert(results.interceptedFixtureMutations.length === before,'Unexpected customer send');
});
await page.setViewportSize({width:390,height:844});
await page.screenshot({path:`${out}full-editor-phone.png`,fullPage:true});
await page.goto('http://127.0.0.1:3011/?screen=calendar');
await page.screenshot({path:`${out}calendar-phone.png`,fullPage:true});
const auth = await browser.newContext();
const authPage = await auth.newPage();
await check('Anonymous local admin and API remain protected',async () => {
  const response = await authPage.goto('http://127.0.0.1:3003/admin',{timeout:90000});
  assert(authPage.url().includes('/admin/login'),`Unexpected admin response ${response.status()} ${authPage.url()}`);
  const api = await auth.request.get('http://127.0.0.1:3003/api/admin/quotes');
  assert(api.status() === 401,`API status ${api.status()}`);
  await authPage.screenshot({path:`${out}unauthorized-login.png`,fullPage:true});
});
await auth.close();
await fs.writeFile(`${out}browser-checks.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
await browser.close();
if(results.checks.some(check=>check.result === 'FAIL') || results.errors.length) process.exitCode=1;

