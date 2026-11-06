const {chromium}=require('playwright-core');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.resolve(process.env.CAMPUS_QA_DIR||'docs/design/captures');
(async()=>{
 fs.mkdirSync(dir,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl']});
 const report=[];
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:name==='mobile',hasTouch:name==='mobile'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});await page.waitForTimeout(2000);
  await page.screenshot({path:path.join(dir,`${name}.png`)});
  await page.screenshot({path:path.join(dir,`${name}-full.png`),fullPage:true});
  const targets=['Vestíbulo','Pérgola','Monumento','Vehículo oscuro','Sedán claro','Secretaria','Jesús','Cristina','Apolo','Zeus','Hera','Tablero','Sala de juntas','Impresora','Café'];
  const opened=[];
  for(const label of targets){
   const summary=page.locator('summary');if(!await summary.evaluate(e=>e.parentElement.open))await summary.click();
   await page.getByRole('button',{name:label,exact:true}).click();
   await page.getByRole('dialog').waitFor();opened.push(await page.locator('#office-panel-title').textContent());
   await page.getByRole('button',{name:'Cerrar panel',exact:true}).click();
  }
  await page.locator('details').evaluate(e=>e.open=false);
  await page.getByRole('button',{name:'Explorar campus',exact:true}).click();
  await page.getByRole('button',{name:'Conoce Stack44',exact:true}).click();
  const tour=[];for(let i=0;i<7;i++){tour.push(await page.locator('#office-panel-title').textContent());if(i<6)await page.getByRole('button',{name:'Siguiente',exact:true}).click();}
  await page.getByRole('button',{name:'Terminar',exact:true}).click();
  let touchScroll=null;
  if(name==='mobile'){
   const cdp=await page.context().newCDPSession(page);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:530}]});
   for(let y=510;y>=190;y-=20)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(300);
   touchScroll=await page.evaluate(()=>scrollY);await page.evaluate(()=>scrollTo(0,0));
  }
  const bounds=await page.evaluate(()=>({canvas:!!document.querySelector('canvas'),overflow:document.documentElement.scrollWidth>innerWidth}));
  await page.mouse.wheel(0,800);await page.waitForTimeout(300);const scroll=await page.evaluate(()=>scrollY);
  await page.screenshot({path:path.join(dir,`${name}-transition.png`)});
  await page.getByRole('link',{name:'Iniciar sesión',exact:true}).click();
  report.push({name,width,height,opened,tour,...bounds,touchScroll,scroll,login:new URL(page.url()).pathname,errors});
  await page.close();
 }
 await browser.close();fs.writeFileSync(path.join(dir,'qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 if(report.some(r=>r.errors.length||r.overflow||!r.canvas||r.login!=='/login'||!r.scroll||(r.name==='mobile'&&!r.touchScroll)))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
