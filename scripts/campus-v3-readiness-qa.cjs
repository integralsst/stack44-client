const {chromium}=require('playwright-core');const fs=require('node:fs');
function firstRenderProbe(){
 window.__campusMeasure={};
 const original=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(...args){
  const gl=original.apply(this,args),canvas=this;
  if(!gl||!String(args[0]).startsWith('webgl')||gl.__campusProbe)return gl;
  window.__campusMeasure.contextReadyMs=performance.now();gl.__campusProbe=true;let framebuffer=null;
  const bind=gl.bindFramebuffer,arrays=gl.drawArrays,elements=gl.drawElements;
  gl.bindFramebuffer=function(target,value){if(target===gl.FRAMEBUFFER||target===gl.DRAW_FRAMEBUFFER)framebuffer=value;return bind.call(this,target,value)};
  function mark(){if(framebuffer===null&&canvas.isConnected&&canvas.width>16&&!window.__campusMeasure.firstRenderMs){
   window.__campusMeasure.firstRenderMs=performance.now();
   requestAnimationFrame(()=>window.__campusMeasure.firstPresentationProxyMs=performance.now());
   gl.bindFramebuffer=bind;gl.drawArrays=arrays;gl.drawElements=elements;
  }}
  gl.drawArrays=function(...a){const r=arrays.apply(this,a);mark();return r};
  gl.drawElements=function(...a){const r=elements.apply(this,a);mark();return r};
  return gl;
 };
}
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-webgl']});const results=[];
 try{for(let run=0;run<3;run++)for(const [version,port] of run%2?[['V3',5176],['V2',5175]]:[['V2',5175],['V3',5176]]){
  const context=await browser.newContext({viewport:{width:1672,height:941},deviceScaleFactor:1}),page=await context.newPage();const cdp=await context.newCDPSession(page);
  await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await page.addInitScript(firstRenderProbe);
  await page.goto('http://127.0.0.1:'+port+'/',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__campusMeasure.firstPresentationProxyMs);
  const timing=await page.evaluate(()=>({...window.__campusMeasure,contextToFirstDrawMs:window.__campusMeasure.firstRenderMs-window.__campusMeasure.contextReadyMs}));
  // Actual input-event timestamp, excluding Playwright actionability/click scheduling.
  await page.evaluate(()=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent==='Explorar campus');button.addEventListener('click',()=>{window.__campusClick=performance.now();new MutationObserver((_,observer)=>{if(document.querySelector('[role="dialog"]')){requestAnimationFrame(()=>window.__campusDialog=performance.now()-window.__campusClick);observer.disconnect();}}).observe(document.body,{childList:true,subtree:true});},{capture:true,once:true});});
  await page.getByRole('button',{name:'Explorar campus',exact:true}).click();await page.waitForFunction(()=>window.__campusDialog);timing.inputToDialogNextRAFMs=await page.evaluate(()=>window.__campusDialog);
  results.push({version,run,...timing});await context.close();
 }}finally{await browser.close()}
 fs.writeFileSync('docs/design/captures-v3/paired-readiness.json',JSON.stringify({definition:'Alternating production builds; cold HTTP cache; localhost, no throttle. Context-to-first-draw includes scene construction, LUT fetch, shaders and first GPU submission, not only JS CPU initialization. Input latency excludes Playwright scheduling and ends at next RAF after dialog insertion.',results},null,2));console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
