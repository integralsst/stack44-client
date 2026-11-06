const {chromium}=require('playwright-core');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const dir='docs/design/captures/';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl']});
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});await page.locator('details').waitFor();
 await page.clock.install();await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+1000));

 async function select(label){
  if(!await page.locator('details').evaluate(e=>e.open))await page.locator('summary').click({force:true});
  await page.getByRole('button',{name:label,exact:true}).click({force:true});
  await page.getByRole('button',{name:'Cerrar panel',exact:true}).click({force:true});
  await page.locator('details').evaluate(e=>e.open=false);
 }
 async function capture(name,ms){await page.clock.fastForward(ms);await page.screenshot({path:dir+name+'.png'});}
 await select('Impresora');await capture('printing',9000);await capture('carrying',11000);await capture('delivery',7000);await capture('returned',12000);
 await select('Café');await capture('coffee',12000);await page.clock.fastForward(19000);
 await select('Sala de juntas');await capture('meeting',12000);await page.clock.fastForward(19000);
 await select('Pérgola');await capture('pergola-rest',1000);
 await select('Vehículo oscuro');await capture('car-lights',1200);
 // Initial camera and reduced motion make pixel clicks repeatable.
 await page.clock.resume();await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});await page.locator('details').waitFor();await page.waitForTimeout(1000);
 const picks=[];
 for(const [name,x,y] of [['Jesús',689,303],['Cristina',872,333],['Apolo',590,370],['Zeus',735,397],['Hera',878,420],['Secretaria',420,400],['lobby',655,585],['pergola',315,305],['monument',319,602],['car-dark',1069,648],['car-silver',1057,710]]){
  await page.mouse.click(x,y);const dialog=page.getByRole('dialog');
  if(await dialog.isVisible()){picks.push({name,title:await page.locator('#office-panel-title').textContent()});await page.getByRole('button',{name:'Cerrar panel',exact:true}).click({force:true});}
  else picks.push({name,title:null});
 }
 fs.writeFileSync(dir+'actions-qa.json',JSON.stringify({errors,picks,note:'Action screenshots use the browser clock; controller states are asserted separately by campus-behavior-check.cjs.'},null,2));
 const expected=['Bienvenido a Stack44','Indicadores y control','Diagnóstico SG-SST','Plan de trabajo','Capacitación y mejora','¡Bienvenido a Stack44!','Bienvenido al campus','Una pausa en el jardín','Conoce Stack44','Llegada al campus','Bienvenida ejecutiva'];
 console.log(JSON.stringify({errors,picks}));assert.equal(errors.length,0);assert.deepEqual(picks.map(p=>p.title),expected);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
