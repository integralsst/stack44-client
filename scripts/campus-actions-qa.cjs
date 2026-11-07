const {chromium}=require('playwright-core');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const dir=process.env.CAMPUS_QA_DIR||'docs/design/captures/';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-webgl']});
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();await page.goto('http://127.0.0.1:5174/?campusQA=1',{waitUntil:'networkidle'});await page.locator('details').waitFor();
 await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+1000));

 const inspect=()=>page.evaluate(()=>new Promise(resolve=>document.querySelector('canvas').dispatchEvent(new CustomEvent('campus:inspect',{detail:{reply:resolve}}))));
 const phases=[];
 async function select(label){
  if(!await page.locator('details').evaluate(e=>e.open))await page.locator('summary').click({force:true});
  await page.getByRole('button',{name:label,exact:true}).click({force:true});
  await page.getByRole('button',{name:'Cerrar panel',exact:true}).click({force:true});
  await page.locator('details').evaluate(e=>e.open=false);
 }
 async function until(predicate){
  for(let i=0;i<320;i++){const s=await inspect();if(predicate(s))return s;await page.clock.fastForward(500);await page.clock.runFor(17);}
  throw new Error('Activity did not reach expected state');
 }
 async function capture(name,predicate){const state=await until(predicate);phases.push({name,...state});assert(state.actors.every(a=>a.world[1]>=state.levels.office-.001));await page.screenshot({path:dir+name+'.png'});}
 await select('Impresora');
 await capture('printing',s=>s.paper&&s.actors.find(a=>a.name==='Secretaria').state==='PRINTING');
 await capture('carrying',s=>s.actors.find(a=>a.name==='Secretaria').state==='DELIVERING'&&s.actors.find(a=>a.name==='Secretaria').documents);
 await capture('delivery',s=>s.delivered&&!s.actors.find(a=>a.name==='Secretaria').documents);
 await capture('returned',s=>s.actors.find(a=>a.name==='Secretaria').state==='WORKING');
 await select('Café');await capture('coffee',s=>s.actors.find(a=>a.name==='Apolo').cup);
 await until(s=>s.actors.find(a=>a.name==='Apolo').state==='WORKING');
 await select('Sala de juntas');await capture('meeting',s=>s.actors.find(a=>a.name==='Zeus').state==='MEETING'&&s.actors.find(a=>a.name==='Hera').state==='MEETING');
 await select('Pérgola');await page.clock.fastForward(1000);await page.clock.runFor(17);await capture('pergola-rest',()=>true);
 await select('Vehículo oscuro');await page.clock.fastForward(1200);await page.clock.runFor(17);await capture('car-lights',()=>true);
 // Initial camera and reduced motion make pixel clicks repeatable.
 await page.clock.resume();await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});await page.locator('details').waitFor();await page.waitForTimeout(1000);
 const picks=[];
 const projected=(await inspect()).targets;
 for(const name of ['Jesús','Cristina','Apolo','Zeus','Hera','Secretaria','lobby','pergola','monument','car-dark','car-silver']){
  const {x,y}=projected.find(p=>p.target===name);
  await page.mouse.click(x,y);const dialog=page.getByRole('dialog');
  if(await dialog.isVisible()){picks.push({name,x,y,title:await page.locator('#office-panel-title').textContent()});await page.getByRole('button',{name:'Cerrar panel',exact:true}).click({force:true});}
  else picks.push({name,x,y,title:null});
 }
 fs.writeFileSync(dir+'actions-qa.json',JSON.stringify({errors,picks,phases,note:'Action screenshots use the browser clock; controller states are asserted separately by campus-behavior-check.cjs.'},null,2));
 const expected=['Bienvenido a Stack44','Indicadores y control','Diagnóstico SG-SST','Plan de trabajo','Capacitación y mejora','¡Bienvenido a Stack44!','Bienvenido al campus','Una pausa en el jardín','Conoce Stack44','Llegada al campus','Bienvenida ejecutiva'];
 console.log(JSON.stringify({errors,picks}));assert.equal(errors.length,0);assert.deepEqual(picks.map(p=>p.title),expected);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
