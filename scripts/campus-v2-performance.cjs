const {chromium}=require('playwright-core');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-webgl']});
 const report=[];
 try{
  for(const [profile,width,height,dpr] of [['desktop',1672,941,1],['mobile-emulated',390,844,2]]){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr,isMobile:profile==='mobile-emulated',hasTouch:profile==='mobile-emulated'});
   await page.goto('http://127.0.0.1:5174/?campusQA=1',{waitUntil:'networkidle'});await page.locator('summary').waitFor();await page.waitForTimeout(5000);
   const sample=await page.evaluate(()=>new Promise(resolve=>{
    const canvas=document.querySelector('canvas'),gl=canvas.getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');
    const gpu=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
    let start=performance.now(),last=start;const times=[];
    function frame(now){times.push(now-last);last=now;if(now-start<10000)requestAnimationFrame(frame);else{
     times.sort((a,b)=>a-b);canvas.dispatchEvent(new CustomEvent('campus:inspect',{detail:{reply:state=>resolve({gpu,frames:times.length,durationMs:now-start,fps:times.length*1000/(now-start),p95FrameMs:times[Math.floor(times.length*.95)],p99FrameMs:times[Math.floor(times.length*.99)],state})}}));
    }}requestAnimationFrame(frame);
   }));
   report.push({profile,width,height,browserDPR:dpr,...sample,note:profile==='mobile-emulated'?'Mobile viewport rendered on desktop Apple GPU; NOT a phone hardware benchmark.':'Headless Chrome, 5 s warmup + 10 s sample; finite measurement, not a guarantee for other hardware.'});
   await page.screenshot({path:'docs/design/captures-v2/'+profile+'-live-quality.png'});
   await page.close();
  }
 }finally{await browser.close()}
 fs.writeFileSync('docs/design/captures-v2/performance.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report.map(({state,...r})=>({...r,quality:state.quality,drawCalls:state.drawCalls,triangles:state.triangles,batchedMeshes:state.batchedMeshes})),null,2));
})().catch(e=>{console.error(e);process.exit(1)});
