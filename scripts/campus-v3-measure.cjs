const {chromium}=require('playwright-core');
const fs=require('node:fs');
const phase=process.argv.includes('--baseline')?'baseline':process.argv.includes('--checkpoint')?'checkpoint':'final';
const prod=process.env.CAMPUS_PROD_URL||'http://127.0.0.1:5175/';
const out='docs/design/captures-v3/';
function firstRenderProbe(){
 window.__campusMeasure={};
 const original=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(...args){
  const gl=original.apply(this,args),canvas=this;
  if(!gl||!String(args[0]).startsWith('webgl')||gl.__campusProbe)return gl;
  gl.__campusProbe=true;let framebuffer=null;
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
const inspect=page=>page.evaluate(()=>new Promise(resolve=>document.querySelector('canvas').dispatchEvent(new CustomEvent('campus:inspect',{detail:{reply:resolve}}))));
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-webgl']});
 const report={phase,definition:'First render = first draw submitted to the visible default framebuffer; presentation proxy = next RAF. Cold localhost loads, no network/CPU throttle. Mobile viewport is emulated on desktop GPU.',loads:[],performance:[]};
 try{
  for(let run=0;run<3;run++){
   const context=await browser.newContext({viewport:{width:1672,height:941},deviceScaleFactor:1});const page=await context.newPage();
   const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await page.addInitScript(firstRenderProbe);
   await page.goto(prod,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__campusMeasure.firstPresentationProxyMs);
   const m=await page.evaluate(()=>({...window.__campusMeasure,jsBytes:performance.getEntriesByType('resource').filter(r=>r.name.includes('.js')).reduce((sum,r)=>sum+r.encodedBodySize,0),ltcBytes:performance.getEntriesByType('resource').filter(r=>r.name.includes('campus-ltc-')).reduce((sum,r)=>sum+r.encodedBodySize,0)}));
   const clickStart=await page.evaluate(()=>performance.now());await page.getByRole('button',{name:'Explorar campus',exact:true}).click();await page.getByRole('dialog').waitFor();m.interactionMs=await page.evaluate(start=>performance.now()-start,clickStart);report.loads.push(m);await context.close();
  }
  const page=await browser.newPage({viewport:{width:1672,height:941},deviceScaleFactor:1});await page.addInitScript(firstRenderProbe);
  await page.goto('http://127.0.0.1:5174/?campusQA=1',{waitUntil:'networkidle'});await page.locator('summary').waitFor();
  const start=Date.now();let moved=null;
  while(Date.now()-start<16000){const s=await inspect(page);const actor=s.actors.find(a=>a.state!=='WORKING'&&a.state!=='SITTING');
   if(actor){moved={observedAtMs:await page.evaluate(()=>performance.now()),actor:actor.name,state:actor.state,sceneElapsed:s.elapsed};break;}await page.waitForTimeout(50);
  }
  report.startup={...await page.evaluate(()=>window.__campusMeasure),firstActivity:moved};if(moved)report.startup.renderToActivityMs=moved.observedAtMs-report.startup.firstRenderMs;
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(600);await page.screenshot({path:out+phase+'-reference.png'});await page.close();
  for(const [profile,width,height,dpr] of [['desktop',1672,941,1],['mobile-emulated',390,844,2]]){
   const p=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr,isMobile:profile==='mobile-emulated',hasTouch:profile==='mobile-emulated'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.goto('http://127.0.0.1:5174/?campusQA=1',{waitUntil:'networkidle'});await p.locator('summary').waitFor();await p.waitForTimeout(5000);
   const sample=await p.evaluate(()=>new Promise(resolve=>{const canvas=document.querySelector('canvas'),gl=canvas.getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');const gpu=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);let start=performance.now(),last=start;const times=[];
    function frame(now){times.push(now-last);last=now;if(now-start<10000)requestAnimationFrame(frame);else{times.sort((a,b)=>a-b);canvas.dispatchEvent(new CustomEvent('campus:inspect',{detail:{reply:state=>resolve({gpu,frames:times.length,durationMs:now-start,fps:times.length*1000/(now-start),p95FrameMs:times[Math.floor(times.length*.95)],p99FrameMs:times[Math.floor(times.length*.99)],state})}}));}}requestAnimationFrame(frame);
   }));report.performance.push({profile,width,height,browserDPR:dpr,errors,...sample});await p.screenshot({path:out+phase+'-'+profile+'-live.png'});await p.close();
  }
 }finally{await browser.close()}
 fs.writeFileSync(out+phase+'-metrics.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,performance:report.performance.map(({state,...p})=>({...p,drawCalls:state.drawCalls,triangles:state.triangles,quality:state.quality}))},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
