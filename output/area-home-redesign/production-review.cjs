const { chromium }=require('C:/Users/wende/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
const base='http://127.0.0.1:3004';
(async()=>{
const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const p=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});const errors=[];p.on('pageerror',e=>errors.push({url:p.url(),message:e.message,stack:e.stack}));const rows=[];
for(const route of ['/service-areas/ann-arbor-mi','/service-areas/lansing-mi','/service-areas/east-lansing-mi','/service-areas','/']){
 await p.setViewportSize({width:1440,height:1000});const response=await p.goto(base+route,{waitUntil:'domcontentloaded',timeout:180000});await p.evaluate(()=>document.fonts.ready);
 const key=route==='/'?'home':route.split('/').filter(Boolean).join('-');
 for(const width of [1440,768,390,320]){
 await p.setViewportSize({width,height:1000});
 if(route==='/') await p.locator('#homepage-events').scrollIntoViewIfNeeded();else await p.evaluate(()=>scrollTo(0,0));
 const imgs=route==='/'?p.locator('#homepage-events img'):p.locator('.area-hero-photo img');
 for(const img of await imgs.all()) await img.evaluate(i=>i.decode().catch(()=>{}));
 await p.screenshot({path:`output/area-home-redesign/${key}-${width}.png`});
 if(route==='/') await p.locator('#homepage-events').screenshot({path:`output/area-home-redesign/home-occasions-${width}.png`});
 rows.push({route,status:response.status(),...await p.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,h1:document.querySelector('h1')?.textContent,h1Count:document.querySelectorAll('h1').length,height:document.body.scrollHeight,canonical:document.querySelector('link[rel="canonical"]')?.href,quoteLinks:document.querySelectorAll('a[href="/request-quote"]').length}))});
 }
 if(route==='/service-areas/ann-arbor-mi'||route==='/service-areas'){
 await p.setViewportSize({width:1440,height:1000});for(let y=0;y<await p.locator('body').evaluate(b=>b.scrollHeight);y+=800)await p.evaluate(y=>scrollTo(0,y),y);await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:`output/area-home-redesign/${key}-full.png`,fullPage:true});
 }
 if(route==='/service-areas/ann-arbor-mi'){
 await p.locator('.area-guide summary').first().focus();await p.keyboard.press('Enter');rows.push({guideKeyboard:await p.locator('.area-guide details').first().getAttribute('open')!==null});
 const data=JSON.parse(fs.readFileSync('content/service-areas/ann-arbor-mi.json','utf8'));const text=await p.locator('main').textContent();let missing=[];for(const field of ['intro','venueNote','localOverview','weddingUseCase','privateEventUseCase','corporateFestivalUseCase','constructionLongTermUseCase','setupLogistics','seasonalPlanning','trustNote']){for(const item of [data[field]].flat().filter(Boolean)){if(!text.includes(item))missing.push({field,item});}}rows.push({contentPreservation:'ann-arbor-mi',missing});
 }
 console.log(key+' reviewed');
}
const cityChecks=[];for(const file of fs.readdirSync('content/service-areas').filter(f=>f.endsWith('.json'))){const d=JSON.parse(fs.readFileSync('content/service-areas/'+file,'utf8'));if(d.draft)continue;const response=await p.request.get(base+'/service-areas/'+d.slug);cityChecks.push({slug:d.slug,status:response.status()});}await p.goto(base+'/',{waitUntil:'networkidle'});rows.push({occasionLinks:await p.locator('#homepage-events .home-occasion').evaluateAll(links=>links.map(a=>({label:a.innerText,href:a.getAttribute('href')})))});const notFound=await p.request.get(base+'/service-areas/not-a-city');fs.writeFileSync('output/area-home-redesign/production-checks.json',JSON.stringify({rows,errors,cityChecks,unknownCityStatus:notFound.status()},null,2));await b.close();
})();
