const {chromium}=require('C:/Users/wende/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
const routes=['corporate-event-restroom-trailers','festival-community-event-restroom-trailers','luxury-restroom-trailer-features','wedding-restroom-trailer-rentals','private-event-restroom-trailers','luxury-restroom-trailer-rentals','construction-long-term-restroom-trailer-rentals','emergency-disaster-relief-restroom-trailers'];
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const results=[];
for(const route of routes){
 const response=await page.goto('http://127.0.0.1:3003/'+route,{waitUntil:'domcontentloaded',timeout:180000});
 await page.evaluate(()=>document.fonts.ready);
 await page.locator('.service-hero-photo img').evaluate(img=>img.decode().catch(()=>{}));
 for(const width of [1440,768,390,320]){
 await page.setViewportSize({width,height:1000});
 await page.evaluate(()=>scrollTo(0,0));
 await page.waitForFunction(()=>{const i=document.querySelector('.service-hero-photo img');return i && i.complete && i.naturalWidth>0},{},{timeout:30000});
 await page.screenshot({path:`output/service-redesign/${route}-${width}.png`});
 const data=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,h1:document.querySelector('h1')?.textContent,h1Count:document.querySelectorAll('h1').length,heroImage:document.querySelector('.service-hero-photo img')?.naturalWidth,quoteLinks:document.querySelectorAll('a[href="/request-quote"]').length,canonical:document.querySelector('link[rel="canonical"]')?.href}));
 results.push({route,status:response.status(),...data});
 }
 if(['corporate-event-restroom-trailers','wedding-restroom-trailer-rentals','luxury-restroom-trailer-rentals'].includes(route)){
 await page.setViewportSize({width:1440,height:1000});
 for(let y=0;y<await page.locator('body').evaluate(b=>b.scrollHeight);y+=800) await page.evaluate(y=>scrollTo(0,y),y);
 await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:`output/service-redesign/${route}-full.png`,fullPage:true});
 if(route==='corporate-event-restroom-trailers'){await page.locator('.service-faq summary').first().focus();await page.keyboard.press('Enter');
 results.push({faqKeyboardOpen:await page.locator('.service-faq details').first().getAttribute('open')!==null});}
 }
 console.log(route+' reviewed');
}
fs.writeFileSync('output/service-redesign/browser-checks.json',JSON.stringify({results,errors},null,2));
await browser.close();
})();
