const { chromium } = require('C:/Users/wende/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const assert = require('node:assert/strict');
const path = require('path');
(async () => {
 const browser = await chromium.launch({headless:true});
 const page = await browser.newPage({viewport:{width:1513,height:1039},timezoneId:'America/New_York',reducedMotion:'reduce'});
 const evidence = {checks:[], widths:[], axe:[], requests:[]};
 let patches=0, failSave=true;
 await page.route('**/api/**', async route => {
   const request=route.request(); evidence.requests.push({method:request.method(),path:new URL(request.url()).pathname});
   if(request.method()==='PATCH') { patches++; await new Promise(resolve=>setTimeout(resolve,200)); await route.fulfill(failSave ? {status:500,json:{error:'Fixture save failed. Your draft is retained.'}} : {json:{quote: {...request.postDataJSON(), id:'quote-desk-demo', quote_number:'SL-DEMO-0248', created_at:'2027-09-09T14:24:00Z'}}}); }
   else if(request.url().includes('preview')) await route.fulfill({json:{to:'morgan@example.com',subject:'Synthetic quote preview',html:'<p>Synthetic preview only</p>',text:'Synthetic preview only'}});
   else if(request.method()==='GET') await route.fulfill({json:{options:[]}});
   else throw new Error('Customer/provider mutation was blocked: '+request.url());
 });
 const go=async(query='?screen=detail&reference=1')=>{await page.goto('http://127.0.0.1:3011/'+query);await page.getByRole('heading',{name:'Quote Desk',exact:true}).waitFor();};
 const scan=async(name)=>{
   await page.addScriptTag({path:path.join(process.env.TEMP,'signature-operations-qa/node_modules/axe-core/axe.min.js')});
   const result=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
   evidence.axe.push({name,violations:result.violations.map(({id,nodes})=>({id,targets:nodes.map(n=>n.target)}))});
 };
 await go();
 await page.screenshot({path:'output/quote-desk-implementation/desktop.png'});
 evidence.geometry=await page.locator('.desk-masthead,.desk-status-strip,.desk-workspace,.desk-tabs,.desk-summary,.desk-action-bar').evaluateAll(els=>els.map(e=>({class:e.className,rect:e.getBoundingClientRect().toJSON()})));
 const before=fs.readFileSync('output/quote-desk-implementation/before-editor.txt','utf8');
 const after=fs.readFileSync('components/admin/quote-detail-editor.tsx','utf8');
 const ids=text=>[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]).sort();
 assert.deepEqual(ids(after),ids(before));evidence.checks.push('Every existing literal field/dialog ID retained');
 await scan('desktop-event');
 await page.locator('#customer_name').fill('Draft retained across tabs');
 await page.getByRole('tab',{name:'Pricing & options',exact:true}).click();
 await scan('desktop-pricing');
 await page.getByRole('tab',{name:'Agreements & payments',exact:true}).click();
 await scan('desktop-payments');
 await page.getByRole('tab',{name:'Activity & notes',exact:true}).click();
 await scan('desktop-activity');
 await page.getByRole('tab',{name:'Event',exact:true}).click();
 assert.equal(await page.locator('#customer_name').inputValue(),'Draft retained across tabs');
 assert.match(await page.locator('.desk-action-bar').innerText(),/1 unsaved change/);evidence.checks.push('Shared draft and accurate dirty count survive all tab switches');
 await page.getByRole('button',{name:'Save Changes',exact:true}).dblclick();
 await page.getByRole('alert').filter({hasText:'Fixture save failed'}).waitFor();
 assert.equal(patches,1);assert.equal(await page.locator('#customer_name').inputValue(),'Draft retained across tabs');evidence.checks.push('Failed save retains draft; duplicate click makes one PATCH');
 failSave=false;
 await page.getByRole('button',{name:'Save Changes',exact:true}).click();
 await page.getByText('All changes saved',{exact:true}).waitFor();evidence.checks.push('Successful mocked save clears dirty count');
 await page.getByRole('button',{name:'Preview Quote Email',exact:true}).click();
 await page.getByRole('dialog').waitFor();assert.match(await page.getByRole('dialog').innerText(),/Synthetic quote preview/);
 await scan('preview-dialog');await page.keyboard.press('Escape');await page.waitForTimeout(250);
 assert.match(await page.evaluate(()=>document.activeElement.textContent),/Preview Quote Email/);evidence.checks.push('Preview opens with synthetic content and restores trigger focus on Escape');
 await page.getByRole('button',{name:'Send Quote Email',exact:true}).click();await page.getByRole('alertdialog').waitFor();
 assert.match(await page.getByRole('alertdialog').innerText(),/customer/);await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.waitForTimeout(250);evidence.checks.push('Customer send confirmation reviewed and cancelled; no sends executed');
 await page.getByRole('tab',{name:'Event',exact:true}).focus();await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>[...document.querySelectorAll('[role=tab]')].some(tab=>tab.textContent==='Pricing & options' && tab.dataset.state==='active'));evidence.checks.push('Arrow-key tab navigation works');
 await go('?screen=detail&quote=10');await page.getByRole('tab',{name:'Pricing & options',exact:true}).click();
 assert.equal(await page.locator('#base_price').isDisabled(),true);assert.match(await page.locator('.desk-summary').innerText(),/Reserved date/);evidence.checks.push('Locked quote retains disabled fee inputs and existing reserved status');
 for(const width of [320,375,390,768,1024,1440,1513]) {
   await page.setViewportSize({width,height:width<600?844:1039});await go();
   const result=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,title:document.querySelector('h1').getBoundingClientRect().toJSON()}));
   assert.ok(result.scroll<=width,`Overflow at ${width}: ${result.scroll}`);evidence.widths.push(result);
   for(const name of ['Pricing & options','Agreements & payments','Activity & notes','Event']) {
     await page.getByRole('tab',{name,exact:true}).click();
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Tab overflow '+name+' at '+width);
   }
   if([390,768,1024].includes(width)) await page.screenshot({path:`output/quote-desk-implementation/${width}.png`,fullPage:true});
   if(width===390) await scan('phone-event');
 }
 evidence.checks.push('All four tabs reflow without horizontal overflow at seven widths, including 320px');
 fs.writeFileSync('output/quote-desk-implementation/qa-results.json',JSON.stringify(evidence,null,2));
 assert.equal(evidence.axe.reduce((sum,scan)=>sum+scan.violations.length,0),0,'Accessibility violations');
 fs.writeFileSync('output/quote-desk-implementation/qa-results.json',JSON.stringify(evidence,null,2));
 await browser.close();console.log(JSON.stringify(evidence,null,2));
})().catch(error=>{console.error(error);process.exit(1)});
