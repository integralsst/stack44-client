const {chromium}=require('playwright-core');
const assert=require('node:assert/strict'),fs=require('node:fs');
const dir='docs/design/captures-v3/';
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-webgl']});const results=[];
 try{
  for(const profile of ['half-packed','float-raw','mobile-focus']){
   const page=await browser.newPage({viewport:profile==='mobile-focus'?{width:390,height:844}:{width:900,height:700}}),errors=[],tables=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.url().includes('campus-ltc-'))tables.push(r.url())});
   if(profile==='half-packed')await page.addInitScript(()=>{const old=WebGL2RenderingContext.prototype.getExtension;WebGL2RenderingContext.prototype.getExtension=function(name){return name==='OES_texture_float_linear'?null:old.call(this,name)}});
   if(profile==='float-raw')await page.addInitScript(()=>{window.DecompressionStream=undefined});
   await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:5174/?campusQA=1',{waitUntil:'networkidle'});await page.locator('details').waitFor();
   const inspect=()=>page.evaluate(()=>new Promise(resolve=>document.querySelector('canvas').dispatchEvent(new CustomEvent('campus:inspect',{detail:{reply:resolve}}))));
   const state=await inspect();assert(state.drawCalls>0);
   const focus=[];
   if(profile==='mobile-focus'){
    for(const label of ['Secretaria','Hera','Pérgola','Sedán claro']){
     await page.locator('details').evaluate(e=>e.open=true);await page.getByRole('button',{name:label,exact:true}).click();await page.getByRole('dialog').waitFor();await page.waitForTimeout(60);
     const s=await inspect(),target=s.targets.find(t=>t.target===({'Pérgola':'pergola','Sedán claro':'car-silver'}[label]||label));
     assert(target.x>80&&target.x<310,JSON.stringify({label,target}));focus.push({label,x:target.x});
     if(label==='Secretaria')await page.screenshot({path:dir+'mobile-secretary-focus.png'});
     await page.getByRole('button',{name:'Cerrar panel',exact:true}).click();
    }
   }
   assert.equal(errors.length,0,JSON.stringify(errors));if(profile==='half-packed')assert(tables.some(t=>t.includes('f16')&&t.endsWith('.gz')));if(profile==='float-raw')assert(tables.some(t=>t.includes('f32')&&t.endsWith('.bin')));
   results.push({profile,errors,tables,focus});await page.close();
  }
  fs.writeFileSync(dir+'compatibility.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
