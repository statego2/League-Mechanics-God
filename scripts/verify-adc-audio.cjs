// Real Web Audio smoke test. This measures generated signal, not speaker output.
const {chromium}=require('playwright'),fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
 try{
  const page=await browser.newPage();
  await page.addInitScript(()=>{
   const Native=window.AudioContext||window.webkitAudioContext;
   window.audioProbe={peak:0,starts:0};
   window.AudioContext=class extends Native{
    createOscillator(){const osc=super.createOscillator(),start=osc.start.bind(osc);osc.start=(...args)=>{window.audioProbe.starts++;return start(...args);};return osc;}
    createGain(){const gain=super.createGain(),connect=gain.connect.bind(gain),analyser=super.createAnalyser();analyser.fftSize=256;connect(analyser);const samples=new Float32Array(analyser.fftSize),until=performance.now()+350;
     const sample=()=>{analyser.getFloatTimeDomainData(samples);for(const n of samples)window.audioProbe.peak=Math.max(window.audioProbe.peak,Math.abs(n));if(this.state!=='closed'&&performance.now()<until)requestAnimationFrame(sample);};requestAnimationFrame(sample);return gain;}
   };
  });
  await page.route('**/game.js?*',async route=>{const src=fs.readFileSync('game.js','utf8').replace(/\}\)\(\);\s*$/,`window.audioFixture={setup(){reset('adc');spawn=999;adcState.ambientAt=999;const e=enemy(player.x+180,player.y);Object.assign(e,{adcGeneric:true,adcPursuer:true,hp:1000,maxHp:1000,speed:0});foes=[e];},get player(){return player},get foe(){return foes[0]}};})();`);await route.fulfill({status:200,contentType:'text/javascript',body:src});});
  await page.goto(process.env.ADC_URL||'http://127.0.0.1:8766/');await page.locator('[data-mode=adc]').click();await page.evaluate(()=>audioFixture.setup());
  await page.locator('#soundBtn').click();await page.waitForFunction(()=>audioProbe.peak>.001,null,{timeout:5000});
  const ready=await page.evaluate(()=>({...audioProbe}));await page.waitForTimeout(180);await page.evaluate(()=>{audioProbe.peak=0;});const box=await page.locator('#arena').boundingBox(),target=await page.evaluate(()=>({x:audioFixture.foe.x,y:audioFixture.foe.y}));
  await page.mouse.click(box.x+target.x*box.width/1200,box.y+target.y*box.height/675,{button:'right'});
  await page.waitForFunction(n=>audioProbe.starts>n&&audioProbe.peak>.001,ready.starts,{timeout:3000});const attack=await page.evaluate(()=>({...audioProbe}));
  await page.locator('#soundBtn').click();const muted=await page.evaluate(()=>audioProbe.starts);await page.keyboard.press('q');if(!(await page.evaluate(()=>audioFixture.player.adcRapid>0)))throw Error('Q did not activate while muted');await page.waitForTimeout(500);
  if(await page.evaluate(()=>audioProbe.starts)!==muted)throw Error('Sound continued after mute');
  console.log(JSON.stringify({ready,attack,muted:true}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
