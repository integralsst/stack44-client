const {chromium}=require('playwright-core');
const fs=require('node:fs');
const dir='docs/design/captures-v2/';
(async()=>{
 const before=process.argv.includes('--before');
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-webgl']});
 try {
  for(const [label,width,height] of [['reference',1672,941],['desktop',1440,900],['mobile',390,844]]){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:label==='mobile',hasTouch:label==='mobile'});
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.goto('http://127.0.0.1:5174/?campusQA=1',{waitUntil:'networkidle'});await page.locator('summary').waitFor();await page.waitForTimeout(1000);
   await page.screenshot({path:dir+(before?'before-':'after-')+label+'.png'});
   if(!before){
    await page.screenshot({path:dir+label+'-full.png',fullPage:true});
    if(label==='reference'){
     for(const [name,x,y,w,h] of [['basement',300,370,1000,400],['lobby',530,400,600,390],['stairs',550,590,490,260],['garden',70,300,510,450],['parking',1110,540,480,330]])await page.screenshot({path:dir+name+'.png',clip:{x,y,width:w,height:h}});
    }
    await page.mouse.wheel(0,550);await page.waitForTimeout(300);await page.screenshot({path:dir+label+'-transition.png'});
   }
   await page.close();
  }
 }finally{await browser.close()}
 console.log(before?'V1 fresh baseline captured.':'V2 comparison and details captured.');
})().catch(e=>{console.error(e);process.exit(1)});
