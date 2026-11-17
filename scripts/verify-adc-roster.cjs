// Supplemental deterministic roster captures. These fixtures inject only setup;
// the ordinary game loop, rendering and collision run at real time.
const {chromium}=require('playwright'),fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js?*',async route=>{
  const src=fs.readFileSync('game.js','utf8').replace(/\}\)\(\);\s*$/,`window.adcFixture={setup(name){
   reset('adc');spawn=999;adcState.bag=[name];adcState.ambientAt=0;rng=0;
  },setupStationary(){reset('adc');},get hazards(){return hazards},get shots(){return shots},get state(){return state},get hp(){return player.hp},get kills(){return kills},get player(){return player},get foes(){return foes},setupCombo(){reset("adc");spawn=999;adcState.bag=["ezreal","lux"];adcState.ambientAt=1.1;const e=enemy(player.x+180,player.y);Object.assign(e,{adcGeneric:true,adcPursuer:true,hp:112,maxHp:112,speed:60,contactCooldown:0});foes=[e];},setupInteraction(){reset("adc");spawn=999;adcState.bag=["ezreal","lux"];adcState.ambientAt=1.1;const e=enemy(player.x+180,player.y);Object.assign(e,{adcGeneric:true,adcPursuer:true,hp:1000,maxHp:1000,speed:30,contactCooldown:0});foes=[e];},setupKit(){reset("adc");spawn=999;adcState.ambientAt=999;const e=enemy(player.x+190,player.y);Object.assign(e,{adcGeneric:true,adcPursuer:true,hp:1000,maxHp:1000,speed:0,contactCooldown:0});foes=[e];}};})();`);
  await route.fulfill({status:200,contentType:'text/javascript',body:src});
 });
 await page.goto(process.env.ADC_URL||'http://127.0.0.1:8765/');
 fs.mkdirSync('docs/evidence/adc',{recursive:true});
 for(const [name,delay] of [['ezreal',500],['lux',500],['ahri',500],['blitz',500],['velkoz',500],['syndra',750],['lux-r',600],['orianna',700],['malphite',800],['cassio',600],['xerath-q',500],['xerath-w',500]]){
  await page.evaluate(name=>window.adcFixture.setup(name),name);if(['ezreal','lux','ahri','blitz','velkoz'].includes(name))await page.waitForFunction(()=>adcFixture.shots.some(s=>s.adcOwner==='adc'),null,{timeout:2500});else await page.waitForTimeout(delay);
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
 // Separate fixture uses real keyboard/pointer events for the new kit.
 await page.evaluate(()=>adcFixture.setupKit());const box=await page.locator('#arena').boundingBox();
 const point=await page.evaluate(()=>({x:adcFixture.foes[0].x,y:adcFixture.foes[0].y}));
 await page.mouse.move(box.x+point.x*box.width/1200,box.y+point.y*box.height/675);await page.keyboard.press('e');
 if(!(await page.evaluate(()=>!!adcFixture.foes[0].adcCharge)))throw Error('E did not attach charge');
 await page.keyboard.press('r');if(!(await page.evaluate(()=>adcFixture.player.cd.r>0)))throw Error('R did not fire');
 await page.keyboard.press('q');if(!(await page.evaluate(()=>adcFixture.player.adcRapid>0)))throw Error('Q did not activate');
 await page.mouse.move(box.x+box.width*.7,box.y+box.height*.55);await page.keyboard.press('w');
 if(!(await page.evaluate(()=>!!adcFixture.player.dashing?.adcJump)))throw Error('W did not jump');
 await page.screenshot({path:'docs/evidence/adc/tristana-kit.jpg',quality:83});console.log(JSON.stringify({kitInputs:'Q W E R passed'}));
 // Real-input combo against a moving normal-HP target with ambient pressure.
 await page.evaluate(()=>adcFixture.setupCombo());const comboBox=await page.locator('#arena').boundingBox();
 const screen=point=>({x:comboBox.x+point.x*comboBox.width/1200,y:comboBox.y+point.y*comboBox.height/675});
 let position=await page.evaluate(()=>({x:adcFixture.player.x-60,y:adcFixture.player.y})),where=screen(position);
 await page.mouse.move(where.x,where.y);await page.keyboard.press('w');await page.waitForFunction(()=>!adcFixture.player.dashing,null,{timeout:2500});
 position=await page.evaluate(()=>({x:adcFixture.foes[0].x,y:adcFixture.foes[0].y}));where=screen(position);await page.mouse.move(where.x,where.y);await page.keyboard.press('e');await page.keyboard.press('q');
 for(let stack=1;stack<=4;stack++){
  position=await page.evaluate(()=>{const e=adcFixture.foes[0];return e?{x:e.x,y:e.y}:null});if(!position)break;
  where=screen(position);await page.mouse.click(where.x,where.y,{button:'right'});
  await page.waitForFunction(n=>adcFixture.kills>0||(adcFixture.foes[0]?.adcCharge?.stacks||0)>=n,stack,{timeout:4000});
  if(stack<4){position=await page.evaluate(()=>({x:Math.max(25,adcFixture.player.x-18),y:adcFixture.player.y}));where=screen(position);await page.mouse.click(where.x,where.y,{button:'right'});}
 }
 const combo=await page.evaluate(()=>({kills:adcFixture.kills,wCooldown:adcFixture.player.cd.w,hp:adcFixture.hp}));
 if(combo.kills<1||combo.wCooldown!==0)throw Error('E-Q-auto-W reset combo failed: '+JSON.stringify(combo));
 console.log(JSON.stringify({realInputCombo:combo}));
 // E → W landing → R impact against a moving target, using actual inputs.
 await page.evaluate(()=>adcFixture.setupInteraction());
 let target=await page.evaluate(()=>({x:adcFixture.foes[0].x,y:adcFixture.foes[0].y}));where=screen(target);
 await page.mouse.move(where.x,where.y);await page.keyboard.press('e');await page.keyboard.press('w');
 await page.waitForFunction(()=>!adcFixture.player.dashing&&adcFixture.foes[0]?.adcCharge?.stacks===1,null,{timeout:2500});
 target=await page.evaluate(()=>({x:adcFixture.foes[0].x,y:adcFixture.foes[0].y}));where=screen(target);
 await page.mouse.move(where.x,where.y);await page.keyboard.press('r');
 await page.waitForFunction(()=>adcFixture.foes[0]?.adcCharge?.stacks===2&&!!adcFixture.foes[0]?.adcKnock,null,{timeout:2500});
 const interaction=await page.evaluate(()=>({stacks:adcFixture.foes[0].adcCharge.stacks,knockback:!!adcFixture.foes[0].adcKnock,hp:adcFixture.hp}));
 console.log(JSON.stringify({realInputJumpAndUlt:interaction}));
 await page.evaluate(()=>adcFixture.setupStationary());
 await page.waitForFunction(()=>adcFixture.state==='ended',null,{timeout:45000});
 await page.screenshot({path:'docs/evidence/adc/results.jpg',quality:83});const result=await page.locator('#menuDescription').textContent();
 await page.keyboard.press('t');const retry=await page.evaluate(()=>({state:adcFixture.state,hp:adcFixture.hp,kills:adcFixture.kills}));
 if(retry.state!=='playing'||retry.hp!==160||retry.kills!==0)throw Error('Stationary death/retry failed: '+JSON.stringify(retry));
 console.log(JSON.stringify({stationaryResult:result,deathRetry:retry}));
 await browser.close();if(errors.length){console.error(JSON.stringify(errors));process.exitCode=1;}
})().catch(e=>{console.error(e);process.exitCode=1});
