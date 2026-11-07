const {chromium}=require('playwright-core');const fs=require('node:fs'),assert=require('node:assert/strict');
const dir='docs/design/captures-v3/';
const inspect=page=>page.evaluate(()=>new Promise(resolve=>document.querySelector('canvas').dispatchEvent(new CustomEvent('campus:inspect',{detail:{reply:resolve}}))));
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-webgl']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto('http://127.0.0.1:5174/?campusQA=1',{waitUntil:'domcontentloaded'});await page.locator('canvas').waitFor({state:'visible'});
  let visible=null;for(let i=0;i<30;i++){const s=await inspect(page),actor=s.actors.find(c=>c.state==='STANDING_UP'&&c.hipY-.84>.02);if(actor){visible={sinceRenderMs:await page.evaluate(first=>performance.now()-first,s.timing.firstRenderMs),actor:actor.name,hipY:actor.hipY,timing:s.timing};break;}await page.waitForTimeout(20);}
  assert(visible,'Visible stand-up in initial second');assert(visible.sinceRenderMs<1000,JSON.stringify(visible));
  await page.evaluate(()=>{const canvas=document.querySelector('canvas'),stream=canvas.captureStream(30),chunks=[];
   const codec=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';const recorder=new MediaRecorder(stream,{mimeType:codec,videoBitsPerSecond:1500000});
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
   window.__campusRecording={recorder,done:new Promise(resolve=>recorder.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(chunks,{type:codec}));stream.getTracks().forEach(t=>t.stop());})};recorder.start();});
  const start=Date.now(),previous=new Map(),counts={},stalled=[],snapshots=[];
  let shot=false;
  while(Date.now()-start<9000){const s=await inspect(page);snapshots.push(s);
   for(const c of [...s.actors,...s.visitors]){const old=previous.get(c.name);if(old){const ds=Math.hypot(c.local[0]-old.local[0],c.local[2]-old.local[2]);const legDelta=c.legs.reduce((sum,v,i)=>sum+Math.abs(v-old.legs[i]),0);
    if(ds>.002&&!['STANDING_UP','SITTING'].includes(c.state)){counts[c.name]=(counts[c.name]||0)+1;if(legDelta<1e-6)stalled.push({name:c.name,elapsed:s.elapsed,ds});}
   }previous.set(c.name,c);}
   if(!shot&&Date.now()-start>2800){await page.screenshot({path:dir+'early-walk.png'});await page.screenshot({path:dir+'secretary-walk-detail.png',clip:{x:270,y:205,width:400,height:370}});shot=true;}
   await page.waitForTimeout(60);
  }
  const b64=await page.evaluate(async()=>{window.__campusRecording.recorder.stop();return await window.__campusRecording.done});fs.writeFileSync(dir+'walks.webm',Buffer.from(b64,'base64'));
  assert.equal(stalled.length,0,JSON.stringify(stalled));assert(counts['Secretaria']>3);assert(counts['Visitante parqueadero']>3);assert(counts['Visitante jardín']>3);
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);const frozen=await inspect(page);await page.waitForTimeout(200);const frozenAfter=await inspect(page);
  assert.deepEqual(frozenAfter.actors.map(c=>[c.local,c.legs]),frozen.actors.map(c=>[c.local,c.legs]));assert.deepEqual(frozenAfter.visitors.map(c=>[c.local,c.legs]),frozen.visitors.map(c=>[c.local,c.legs]));
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(250);const resumed=await inspect(page);assert(resumed.visitors.some((c,i)=>Math.hypot(c.local[0]-frozen.visitors[i].local[0],c.local[2]-frozen.visitors[i].local[2])>.001));
  fs.writeFileSync(dir+'animation-browser.json',JSON.stringify({visible,counts,stalled,errors,snapshots},null,2));assert.equal(errors.length,0,JSON.stringify(errors));
  console.log(JSON.stringify({visible,counts,stalled,errors,video:'walks.webm'},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
