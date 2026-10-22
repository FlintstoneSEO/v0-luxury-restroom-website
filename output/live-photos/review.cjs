const {chromium}=require('C:/Users/wende/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('assert');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
const p=await b.newPage();const errors=[],rows=[];p.on('pageerror',e=>errors.push(e.message));
for(const route of ['/','/gallery','/luxury-restroom-trailer-rentals','/private-event-restroom-trailers']){
const response=await p.goto('http://localhost:3006'+route,{waitUntil:'domcontentloaded',timeout:90000});assert.equal(response.status(),200);
for(const width of (route==='/'?[1440,1024,768,390,375,320]:[1440,390])){
await p.setViewportSize({width,height:1000});await p.evaluate(()=>document.fonts.ready);
for(let y=0;y<await p.locator('body').evaluate(e=>e.scrollHeight);y+=800)await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);
await p.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));scrollTo({top:0,behavior:'instant'})});
const state=await p.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,photos:[...document.images].filter(i=>i.src.includes('live-events')).map(i=>({alt:i.alt,loaded:i.complete&&i.naturalWidth>0}))}));assert(state.scrollWidth<=width);assert(state.photos.length>0);assert(state.photos.every(i=>i.loaded));rows.push({route,...state});
const name=route==='/'?'home':route.slice(1);await p.screenshot({path:`output/live-photos/${name}-${width}.png`,fullPage:true});
if(await p.locator('.day-night-scene').count()){
const scene=p.locator('.day-night-scene');await scene.scrollIntoViewIfNeeded();await scene.screenshot({path:`output/live-photos/${name}-day-${width}.png`,style:'.estate-header,.estate-header *{visibility:hidden!important}'});
const night=scene.getByRole('button',{name:'Lights on',exact:true});await night.focus();await p.keyboard.press('Enter');assert.equal(await night.getAttribute('aria-pressed'),'true');assert((await scene.locator('figcaption').textContent()).startsWith('After dark'));
await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await scene.locator('img').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
await scene.screenshot({path:`output/live-photos/${name}-night-${width}.png`,style:'.estate-header,.estate-header *{visibility:hidden!important}'});
await scene.getByRole('button',{name:'Daytime',exact:true}).click();
}
}}
assert.equal(errors.length,0);fs.writeFileSync('output/live-photos/browser-checks.json',JSON.stringify({rows,errors,keyboardToggle:true,reducedMotion:true},null,2));console.log('PASS: four routes, responsive photos, no overflow, keyboard day/night switch, reduced motion, no page errors');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
