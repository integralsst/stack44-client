const {chromium}=require('playwright-core');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-webgl']});
 try{
  const page=await browser.newPage({viewport:{width:1672,height:941},deviceScaleFactor:1});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});await page.locator('summary').waitFor();await page.waitForTimeout(1000);
  await page.screenshot({path:'docs/design/captures/reference-view.png'});
  const gpu=await page.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2');const ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)});
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(8000);
  const samples=await page.evaluate(()=>new Promise(resolve=>{let start=performance.now(),last=start;const times=[];function tick(now){times.push(now-last);last=now;if(now-start<3000)requestAnimationFrame(tick);else resolve({frames:times.length,durationMs:now-start,fps:times.length*1000/(now-start),p95FrameMs:times.sort((a,b)=>a-b)[Math.floor(times.length*.95)]})}requestAnimationFrame(tick)}));
  const result={viewport:{width:1672,height:941},gpu,...samples,note:'Short headless desktop sample on this host, not a guarantee for other devices. Mobile hardware remains unmeasured.'};
  fs.writeFileSync('docs/design/captures/render-sample.json',JSON.stringify(result,null,2));console.log(result);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
