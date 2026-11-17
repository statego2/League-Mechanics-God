// Supplemental deterministic roster captures. These fixtures inject only setup;
// the ordinary game loop, rendering and collision run at real time.
const {chromium}=require('playwright'),fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js?*',async route=>{
  const src=fs.readFileSync('game.js','utf8').replace(/\}\)\(\);\s*$/,`window.adcFixture={setup(name){
   reset('adc');spawn=999;if(name==='xerath-q'){adcBeam({x:player.x+350,y:player.y},Math.PI,false);return;}if(name==='xerath-w'){adcState.ambientAt=0;adcState.ambientNext='w';return;}const e=enemy(player.x+240,player.y);Object.assign(e,{hp:112,maxHp:112,speed:0,adcCaster:true,adcChampion:name,adcPursuer:['ezreal','ahri','blitz','malphite'].includes(name),adcLux:name==='lux',adcSyndra:name==='syndra',shoot:0,contactCooldown:0});
   if(name==='lux-r'){e.adcChampion='lux';e.adcLux=true;e.adcCastCount=2;}foes=[e];rng=0;
  },setupStationary(){reset('adc');},get hazards(){return hazards},get shots(){return shots},get state(){return state},get hp(){return player.hp},get kills(){return kills}};})();`);
  await route.fulfill({status:200,contentType:'text/javascript',body:src});
 });
 await page.goto(process.env.ADC_URL||'http://127.0.0.1:8765/');
 fs.mkdirSync('docs/evidence/adc',{recursive:true});
 for(const [name,delay] of [['ezreal',500],['lux',500],['ahri',500],['blitz',500],['velkoz',500],['syndra',750],['lux-r',600],['orianna',700],['malphite',800],['cassio',600],['xerath-q',500],['xerath-w',500]]){
  await page.evaluate(name=>window.adcFixture.setup(name),name);await page.waitForTimeout(delay);
  const obs=await page.evaluate(()=>({state:adcFixture.state,hazards:adcFixture.hazards.map(h=>({type:h.adcSpecial||h.spellName||h.phase,phase:h.phase})),shots:adcFixture.shots.map(s=>s.spellName)}));
  await page.screenshot({path:`docs/evidence/adc/fixture-${name}.jpg`,quality:83});console.log(JSON.stringify({name,...obs}));
  if(name==='ahri'||name==='velkoz'){
   await page.waitForFunction(n=>adcFixture.shots.some(s=>n==='ahri'?s.kind==='enemyOrb'&&s.phase==='return':s.velkoz==='child'),name,{timeout:2500});
   await page.screenshot({path:`docs/evidence/adc/fixture-${name}-second-phase.jpg`,quality:83});
  }
  if(['orianna','syndra','xerath-q','xerath-w'].includes(name)){
   await page.waitForTimeout(name==='xerath-w'?560:400);await page.screenshot({path:`docs/evidence/adc/fixture-${name}-second-phase.jpg`,quality:83});
  }
 }
 await page.evaluate(()=>adcFixture.setupStationary());
 await page.waitForFunction(()=>adcFixture.state==='ended',null,{timeout:45000});
 await page.screenshot({path:'docs/evidence/adc/results.jpg',quality:83});const result=await page.locator('#menuDescription').textContent();
 await page.keyboard.press('t');const retry=await page.evaluate(()=>({state:adcFixture.state,hp:adcFixture.hp,kills:adcFixture.kills}));
 if(retry.state!=='playing'||retry.hp!==160||retry.kills!==0)throw Error('Stationary death/retry failed: '+JSON.stringify(retry));
 console.log(JSON.stringify({stationaryResult:result,deathRetry:retry}));
 await browser.close();if(errors.length){console.error(JSON.stringify(errors));process.exitCode=1;}
})().catch(e=>{console.error(e);process.exitCode=1});
