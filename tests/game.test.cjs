// Run the actual game in a minimal DOM. No test-only globals ship to players.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function boot(preset="standard", options={}){
 const nodes=new Map(),draws=[],drawSizes=[],strokes=[],arcs=[],texts=[],lines=[],rotations=[];
 function node(id){if(!nodes.has(id))nodes.set(id,{textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},listeners:{},addEventListener(k,f){this.listeners[k]=f;},closest(){return this;},setAttribute(k,v){this[k]=v;},getBoundingClientRect(){return {left:0,top:0,width:1200,height:675};}});return nodes.get(id);}
 const ctx=new Proxy({drawImage(img,...args){draws.push(img);drawSizes.push([img,...args])},rotate(a){rotations.push(a)},arc(x,y,r){arcs.push({x,y,r})},fillText(t){texts.push(String(t))},stroke(){strokes.push(this.strokeStyle)},lineTo(x,y){lines.push({x,y})},createRadialGradient(){return {addColorStop(){}};}},{get(o,k){return o[k]||(()=>{});}});
 node('arena').getContext=()=>ctx;
 const window={devicePixelRatio:1,listeners:{},addEventListener(k,f){this.listeners[k]=f;}};
 const document={getElementById:id=>options.missingNodes?.includes(id)?null:node(id),querySelectorAll:()=>[],addEventListener(){}};
 const sandbox={document,window,requestAnimationFrame(){},Math:Object.create(Math)};
 sandbox.Math.random=()=>.5;
 vm.createContext(sandbox);
 vm.runInContext(fs.readFileSync(require.resolve("../world.js"),"utf8"),sandbox);
 if (!options.noData) vm.runInContext(fs.readFileSync(require.resolve("../ahri-data.js"),"utf8"),sandbox);
 if (options.data) window.LMGAhriData=options.data;
 const source=fs.readFileSync(require.resolve('../game.js'),'utf8').replace(/\}\)\(\);\s*$/,`globalThis.g={reset,update,loop,render,drawChampion,enemy,damageEnemy,applyImpact,AHRI,AHRI_DATA,SIMULATION,DODGE_TUNING,DODGE_DIRECTOR,REFERENCE_SPELLS,fire,moveTo,attackOrder,cast,pause,end,segmentDistance,beamTouchesPlayer,threatening,shootEnemy,releaseEnemy,spawnDodgeVisitor,visitorPathsCrowded,updateDodgeVisitor,dodgeAimPoint,dodgeRhythmMultiplier,spawnXerathW,spawnXerathQ,spawnLuxR,spawnOriannaR,spawnMalphiteR,spawnCassioR,cassioConeContains,facingCassio,aimMalphiteR,oriannaEscape,sampleAreaEscape,forecastTravel,dodgeReactionPath,dodgeEscapeClear,canEvadeDodgeCast,canEvadeVelkoz,addWave,addTarget,get bait(){return bait},get dodgeDirector(){return dodgeDirector},get sweeps(){return sweeps},get hazards(){return hazards},get fx(){return fx},get player(){return player},get foes(){return foes},get allies(){return allies},setAllies(v){allies=v},get shots(){return shots},get stats(){return stats},get time(){return time},get dodged(){return dodged},get state(){return state},setFoes(v){foes=v},disableSpawn(){spawn=999},setRng(v){rng=v},setTime(v){time=v},setKills(v){kills=v}};})();`);
 vm.runInContext(source,sandbox);
 const g=sandbox.g;node('difficulty').listeners.change({target:{value:'normal'}});node('attackSpeed').listeners.change({target:{value:preset}});g.reset('kite');g.disableSpawn();
 return {g,node,window,draws,drawSizes,strokes,arcs,texts,lines,rotations,click(x,y,button=2){node('arena').listeners.pointerdown({clientX:x,clientY:y,button,preventDefault(){}});},key(key){window.listeners.keydown({key,repeat:false,preventDefault(){}});}};
}
function foe(g,x=800,y=337.5){const e=g.enemy(x,y);e.speed=0;e.shoot=999;e.hp=e.maxHp=10000;g.setFoes([e]);return e;}
function advance(g,seconds){for(let i=0;i<Math.round(seconds*120);i++)g.update(1/120);}
test('Orianna shockwave draws animated impact arcs',()=>{
 const {g,strokes}=boot('ahri');g.reset('dodge');
 g.fx.push({x:600,y:330,r:207.5,ttl:.1,max:.2,shockwave:true});g.render();
 assert.ok(strokes.includes('#eed6ffff'));assert.ok(strokes.includes('#bf8dffff'));
});
test('Expert Dodge has a bounded flow-spike-recovery rhythm',()=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');
 assert.equal(g.dodgeRhythmMultiplier(0),1);
 assert.equal(g.dodgeRhythmMultiplier(27),.9);
 assert.equal(g.dodgeRhythmMultiplier(33),1.38);
 assert.equal(g.dodgeRhythmMultiplier(38),1);
 assert.ok(g.DODGE_DIRECTOR.hard.interval*.9<.19,'spike must be denser than flow');
 assert.ok(g.DODGE_DIRECTOR.hard.interval*1.38>.19,'recovery must create more space');
});
test('Expert Lux R preserves a full one-second visible charge',()=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.disableSpawn();g.dodgeDirector.next=999;g.setTime(26);
 g.update(1/120);const h=g.hazards.find(x=>x.luxR);assert.ok(h,'Lux R was not scheduled');assert.equal(h.max,1);assert.ok(h.ttl>.98&&h.ttl<=1);
 assert.equal(g.foes.length,0);assert.equal(g.shots.length,0);assert.equal(g.spawnDodgeVisitor(),false,'Lux R must not gain a follow-up during its charge');advance(g,.49);assert.ok(h.ttl>.49&&h.ttl<.52,'beam fired before its readable charge completed');
});
test('Lux R supplies and executes a normal walking sidestep',()=>{
 let checked=0;
 for(let seed=1;seed<=16;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.disableSpawn();g.dodgeDirector.next=999;g.setRng(seed*104729);
  const witness={};if(!g.spawnLuxR(witness))continue;
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1);
  assert.equal(g.stats.hits,0,`seed ${seed}`);checked++;
 }
 assert.ok(checked>=8,`only ${checked} executable Lux R escapes`);
});
test('Expert starts with sustained mixed pressure and early Cassiopeia and Malphite',t=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.player.hp=g.player.maxHp=1000000;
 let maxActive=0,mixed=false;
 for(let i=0;i<60*120;i++){
  g.update(1/120);
  const names=[...g.foes.filter(e=>e.alive&&e.dodgeVisitor&&(e.phase==='enter'||e.phase==='cast')).map(e=>e.spell.name),...g.shots.filter(s=>s.alive&&s.directed).map(s=>s.spellName)];
  maxActive=Math.max(maxActive,names.length);if(names.length>=2&&new Set(names).size>=2)mixed=true;
 }
 assert.ok(maxActive>=3,`peak ${maxActive}`);assert.ok(mixed,'no mixed simultaneous threats');
 assert.ok(g.dodgeDirector.attempted>=20,`only ${g.dodgeDirector.attempted} casts`);
 assert.ok(g.dodgeDirector.cassio>0,'Cassiopeia missing');assert.ok(g.dodgeDirector.malphite>0,'Malphite missing');
 assert.ok(g.dodgeDirector.orianna>0,'Orianna missing');
 t.diagnostic(`peak ${maxActive} simultaneous threats; ${g.dodgeDirector.attempted} casts; Cassiopeia ${g.dodgeDirector.cassio}, Malphite ${g.dodgeDirector.malphite}`);
});
test('Expert independently schedules five concurrent threats in seeded play',t=>{
 let peak=0,spellMix=0,missilePeak=0;
 for(let seed=1;seed<=12&&peak<5;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(seed*1234567);g.player.hp=g.player.maxHp=1000000;
  for(let i=0;i<120*120;i++){
   g.update(1/120);
   const missiles=g.shots.filter(s=>s.alive&&s.directed&&s.velkoz!=='delay');missilePeak=Math.max(missilePeak,missiles.length);
   const live=[...g.foes.filter(e=>e.alive&&e.dodgeVisitor&&(e.phase==='enter'||e.phase==='cast')).map(e=>e.spell.name),...missiles.map(s=>s.spellName)];
   if(live.length>peak){peak=live.length;spellMix=new Set(live).size;}
  }
 }
 t.diagnostic(`peak ${peak}, distinct spells ${spellMix}, simultaneous missiles ${missilePeak}`);assert.ok(peak>=5);assert.ok(spellMix>=2);
});
test('Expert creates overlapping live missiles during sustained seeded play',t=>{
 let peak=0;
 for(let seed=1;seed<=4;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(seed*1234567);g.player.hp=g.player.maxHp=1000000;
  for(let i=0;i<120*90;i++){
   g.update(1/120);peak=Math.max(peak,g.shots.filter(s=>s.alive&&s.directed&&s.velkoz!=='delay'&&!s.ignorePlayer&&!(s.group&&s.group.hit)).length);
  }
 }
 t.diagnostic(`peak eligible missiles ${peak}`);assert.ok(peak>=3);
});
test('Expert avoids a duplicate champion while an earlier visitor is still visible',()=>{
 let spawned=0;
 for(let seed=1;seed<=40;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(seed*1234567);
  const previous=g.enemy(100,150);Object.assign(previous,{dodgeVisitor:true,spell:g.REFERENCE_SPELLS.ezrealDodge,phase:'exit'});g.setFoes([previous]);
  if(g.spawnDodgeVisitor()){assert.notEqual(g.foes[1].spell.name,previous.spell.name);spawned++;}
 }
 assert.ok(spawned>0);
});
test('Dodge reaction forecast follows the retained movement route',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 Object.assign(g.player,{x:250,y:300,target:{x:400,y:300},routeGoal:{x:400,y:300},route:[{x:250,y:400},{x:400,y:300}]});
 const predicted=g.dodgeReactionPath(.2).end;advance(g,.2);
 assert.ok(Math.hypot(g.player.x-predicted.x,g.player.y-predicted.y)<.1,`actual ${g.player.x},${g.player.y}; forecast ${predicted.x},${predicted.y}`);
 assert.ok(predicted.y>330,'the forecast must follow the existing waypoint rather than a newly calculated direct route');
});
test('director escape witnesses survive actual straight shots from varied angles and overlaps',()=>{
 let accepted=0,overlaps=0;
 for(const [key,distance] of [['ezrealDodge',470],['luxDodge',400],['blitzDodge',470],['ahriDodge',500]]){
  for(let i=0;i<16;i++)for(const overlap of [false,true]){
   const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.hp=g.player.maxHp=100000;
   const a=i*Math.PI/8,origin={x:g.player.x+Math.cos(a)*distance,y:g.player.y+Math.sin(a)*distance};
   if(origin.x<60||origin.x>1140||origin.y<145||origin.y>645)continue;
   const spell=g.REFERENCE_SPELLS[key];
   if(overlap){const s=g.fire(160,g.player.y-75,500,0,'enemy',10,15,2);s.directed=true;s.spellName='EZREAL Q';}
   const witness={};if(!g.canEvadeDodgeCast(origin,spell,witness))continue;
   accepted++;if(overlap)overlaps++;
   const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell,phase:'cast',entry:{...origin},speed:120,charge:spell.cast,pending:{angle:Math.atan2(g.player.y-origin.y,g.player.x-origin.x),spell}});g.setFoes([e]);
   advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.8);
   assert.equal(g.stats.hits,0,`${key} angle ${i} overlap ${overlap}`);
  }
 }
 assert.ok(accepted>=24,`only ${accepted} safe casts checked`);assert.ok(overlaps>=8,`only ${overlaps} overlaps checked`);
});
test('multi-shot forecast can use and execute a longer walking response',()=>{
 let found=false;
 for(let y=-100;y<=100&&!found;y+=20)for(let x=320;x<=880&&!found;x+=40)for(const side of [-1,1]){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
  const p=g.player,s=g.fire(x,p.y+y,0,side*500,'enemy',10,30,2);Object.assign(s,{directed:true,spellName:'EZREAL Q'});
  const origin={x:p.x-440,y:p.y},spell=g.REFERENCE_SPELLS.luxDodge,witness={};
  if(!g.canEvadeDodgeCast(origin,spell,witness)||Math.hypot(witness.destination.x-p.x,witness.destination.y-p.y)<75)continue;
  const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell,phase:'cast',charge:spell.cast,pending:{angle:0,spell},entry:{...origin}});g.setFoes([e]);
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,2);assert.equal(g.stats.hits,0);found=true;
 }
 assert.ok(found,'no safe response requiring a longer movement was found');
});
test('candidate escape remains valid when checked independently against live threats',()=>{
 let checked=0;
 for(let i=0;i<24;i++){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
  const angle=i*Math.PI/12,p=g.player,origin={x:p.x+Math.cos(angle)*470,y:p.y+Math.sin(angle)*470},spell=g.REFERENCE_SPELLS.ezrealDodge;
  const shot=g.fire(p.x-300,p.y+140,500,0,'enemy',10,20,2);Object.assign(shot,{directed:true,spellName:'LUX Q'});
  const witness={};if(!g.canEvadeDodgeCast(origin,spell,witness))continue;
  assert.ok(g.dodgeEscapeClear(origin,spell,witness.destination,.2));checked++;
 }
 assert.ok(checked>=8,`only ${checked} candidates checked`);
});
test('Ahri orb uses a blue effect extending to its actual radius for both teams',()=>{
 for(const kind of ['orb','enemyOrb']){
  const {g,arcs,strokes}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
  const shot=g.fire(300,200,100,0,kind,35,50,1);shot.phase='out';g.render();
  assert.ok(arcs.some(a=>a.x===shot.x&&a.y===shot.y&&a.r===shot.r));
  assert.ok(strokes.includes('#9cdbff99'));assert.equal(shot.r,50);
 }
});
test('directed energy shots draw their effect over the existing projectile radius',()=>{
 for(const [name,r,trail] of [['EZREAL Q',30,'#7bd9ff99'],['LUX Q',35,'#ffe4a099'],['BLITZ Q',35,'#e6cb8199'],['VELKOZ Q',30,'#d18bff99'],['VELKOZ Q',27.5,'#d18bff99']]){
  const {g,arcs,strokes}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
  const shot=g.fire(300,200,100,0,'enemy',30,r,1);shot.spellName=name;g.render();
  assert.ok(arcs.some(a=>a.x===shot.x&&a.y===shot.y&&a.r===r),name);assert.ok(strokes.includes(trail),name);assert.equal(shot.r,r);
 }
});
test('Velkoz visitor uses a distinct sprite and still renders when it is unavailable',()=>{
 const {g,node,draws}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;node('mageArt').complete=true;node('mageArt').naturalWidth=100;
 const e=g.enemy(850,300);Object.assign(e,{dodgeVisitor:true,spell:g.REFERENCE_SPELLS.velkozDodge,phase:'enter'});g.setFoes([e]);
 node('voidArt').complete=true;node('voidArt').naturalWidth=100;g.render();assert.ok(draws.includes(node('voidArt')));assert.ok(!draws.includes(node('mageArt')));
 node('voidArt').naturalWidth=0;draws.length=0;assert.doesNotThrow(()=>g.render());
});
test('enemy Ahri uses the same sprite size and anchor as player Ahri',()=>{
 const {g,node,drawSizes}=boot('ahri');node('ahriArt').complete=true;node('ahriArt').naturalWidth=100;
 g.drawChampion(500,300,0,true,false,0,0);g.drawChampion(700,300,0,false,false,0,0,'ahriEnemy');
 assert.deepEqual(drawSizes[0].slice(1),drawSizes[1].slice(1));
});
test('Dodge HUD shows hits taken instead of the unrelated kill count',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;assert.equal(node('killsLabel').textContent,'HITS');
 g.fire(g.player.x-5,g.player.y,1,0,'enemy',10,8,1);g.update(1/120);assert.equal(node('killsValue').textContent,1);
 g.reset('kite');assert.equal(node('killsLabel').textContent,'KILLS');
});
test('rare area casts count a threatened player who enters and exits before impact',()=>{
 for(const kind of ['orianna','malphite']){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.x=950;g.player.y=300;
  const h={x:600,y:300,r:kind==='orianna'?207.5:162.5,ttl:.2,max:.2,casting:true,directed:true,threat:false,spellName:kind==='orianna'?'ORIANNA R':'MALPHITE R'};
  if(kind==='orianna'){h.orianna=true;}else{h.malphite=true;h.target={x:600,y:300};h.start={x:600,y:300};h.remaining=.2;}
  g.hazards.push(h);advance(g,.025);g.player.x=700;advance(g,.025);g.player.x=950;advance(g,.2);
  assert.equal(g.dodged,1,kind);assert.equal(g.dodgeDirector.outcomes[h.spellName].avoided,1,kind);assert.equal(g.stats.hits,0,kind);
 }
});
test('rare area threat detects a grazing crossing between fixed-step endpoints',()=>{
 for(const kind of ['orianna','malphite']){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const r=kind==='orianna'?207.5:162.5,center={x:600,y:300},p=g.player;
  p.x=599.5;p.y=center.y+r+p.hitRadius-.0005;g.moveTo(p.x+10,p.y);
  const h={...center,r,ttl:.1,max:.1,casting:true,directed:true,threat:false,spellName:kind==='orianna'?'ORIANNA R':'MALPHITE R'};
  if(kind==='orianna')h.orianna=true;else Object.assign(h,{malphite:true,target:{...center},start:{...center},remaining:.1});
  assert.ok(Math.hypot(p.x-center.x,p.y-center.y)>r+p.hitRadius);g.hazards.push(h);g.update(1/120);
  assert.ok(Math.hypot(p.x-center.x,p.y-center.y)>r+p.hitRadius);assert.equal(h.threat,true,kind);
  advance(g,.11);assert.equal(g.stats.hits,0);assert.equal(g.dodgeDirector.outcomes[h.spellName].avoided,1);
 }
});
test('rare area does not credit movement that crosses only after impact',()=>{
 for(const kind of ['orianna','malphite']){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const p=g.player;p.x=500;p.y=300;p.speed=2000;g.moveTo(700,300);
  const h={x:600,y:300,r:10,ttl:.01,max:.01,casting:true,directed:true,threat:false,spellName:kind==='orianna'?'ORIANNA R':'MALPHITE R'};
  if(kind==='orianna')h.orianna=true;else Object.assign(h,{malphite:true,target:{x:600,y:300},start:{x:600,y:300},remaining:.01});
  g.hazards.push(h);g.update(.1);assert.equal(g.stats.hits,0,kind);assert.equal(g.dodged,0,kind);assert.equal(g.dodgeDirector.outcomes[h.spellName].harmless,1,kind);
 }
});
test('rare area casts that never threaten the player remain harmless',()=>{
 for(const kind of ['orianna','malphite']){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.x=950;g.player.y=300;
  const h={x:600,y:300,r:kind==='orianna'?207.5:162.5,ttl:.1,max:.1,casting:true,directed:true,threat:false,spellName:kind==='orianna'?'ORIANNA R':'MALPHITE R'};
  if(kind==='orianna'){h.orianna=true;}else{h.malphite=true;h.target={x:600,y:300};h.start={x:600,y:300};h.remaining=.1;}
  g.hazards.push(h);advance(g,.15);assert.equal(g.dodged,0,kind);assert.equal(g.dodgeDirector.outcomes[h.spellName].harmless,1,kind);
 }
});
test('entering a rare area at impact records a hit, not an avoidance',()=>{
 for(const kind of ['orianna','malphite']){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.x=950;g.player.y=300;
  const h={x:600,y:300,r:kind==='orianna'?207.5:162.5,ttl:.1,max:.1,casting:true,directed:true,threat:false,spellName:kind==='orianna'?'ORIANNA R':'MALPHITE R'};
  if(kind==='orianna'){h.orianna=true;}else{h.malphite=true;h.target={x:600,y:300};h.start={x:600,y:300};h.remaining=.1;}
  g.hazards.push(h);advance(g,.025);g.player.x=700;advance(g,.125);assert.equal(g.dodged,0,kind);assert.equal(g.stats.hits,1,kind);assert.equal(g.dodgeDirector.outcomes[h.spellName].hit,1,kind);
 }
});
test('minion death grace preserves player last-hit credit and retargets only after death',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();
 const a=g.allies[0],victim=g.foes[0],next=g.foes[1];g.setAllies([a]);g.setFoes([victim,next]);
 Object.assign(a,{x:victim.x-30,y:victim.y,targetId:victim.id,tick:999});victim.hp=1;victim.tick=next.tick=999;
 g.applyImpact(victim,{sourceId:a.id,sourceTeam:'ally',kind:'minionMelee',raw:11,damageType:'physical'});
 assert.equal(victim.hp,1);assert.equal(victim.alive,true);advance(g,.025);assert.equal(a.targetId,victim.id);
 g.applyImpact(victim,{sourceId:'player',sourceTeam:'player',kind:'auto',raw:53,damageType:'physical'});
 assert.equal(victim.alive,false);assert.equal(g.stats.cs,1);assert.equal(g.stats.missed,0);advance(g,.025);assert.equal(a.targetId,next.id);
});
test('minion death grace expires without extending and excludes ordinary or large hits',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const [a,b,c]=g.foes;
 const hit={sourceId:-1,sourceTeam:'ally',kind:'minionProjectile',raw:21,damageType:'physical'};
 a.hp=1;g.applyImpact(a,hit);advance(g,.04);g.applyImpact(a,hit);advance(g,.035);assert.equal(a.alive,false);assert.equal(g.stats.missed,1);
 b.hp=3;g.applyImpact(b,hit);assert.equal(b.alive,false);
 c.hp=1;g.applyImpact(c,{...hit,raw:191});assert.equal(c.alive,false);
});
test('move cancels pre-release attack without consuming cooldown; post-release missile survives',()=>{
 const {g}=boot();const e=foe(g);g.attackOrder(e);advance(g,.1);assert.ok(g.player.windup>0);g.moveTo(500,400);advance(g,.2);assert.equal(g.stats.released,0);assert.equal(g.stats.cancelled,1);assert.equal(g.player.attackTimer,0);
 g.attackOrder(e);advance(g,.19);assert.equal(g.stats.released,1);g.moveTo(500,400);advance(g,.3);assert.ok(e.hp<e.maxHp);assert.equal(g.stats.cancelled,1);
});
test('chase tracks moving target and latest right-click order wins',()=>{
 const {g,click}=boot();const e=foe(g,1050);click(e.x,e.y);advance(g,.1);e.y=180;advance(g,.1);assert.equal(g.player.target.y,180);
 click(300,200);click(400,500);assert.equal(g.player.target.x,400);assert.equal(g.player.target.y,500);assert.equal(g.player.order,null);
});
test('attack-move persists through travel, acquires in range and selects near cursor',()=>{
 const {g,key,click}=boot();const a=foe(g,1010);const b={...a,id:99,x:1020,y:360};g.setFoes([a,b]);key('a');click(1100,360,0);advance(g,.6);assert.equal(g.stats.released,0);assert.equal(g.player.order.type,'attackMove');advance(g,.8);assert.ok(g.stats.released>0);g.moveTo(850,337.5);advance(g,1);key('a');click(1100,360,0);advance(g,.01);assert.equal(g.player.focus,99);
});
test('stationary unrelated missiles earn no dodges; evading a threatened line earns one',()=>{
 const {g}=boot();g.fire(100,100,1200,0,'enemy',18,8,2);advance(g,1.1);assert.equal(g.dodged,0);
 g.fire(400,g.player.y,400,0,'enemy',18,8,3);advance(g,.01);g.moveTo(g.player.x,500);advance(g,2.1);assert.equal(g.dodged,1);
});
test('pulse counts blocks separately, dash collision does not count as dodge',()=>{
 const {g}=boot();g.fire(550,g.player.y,400,0,'enemy',18,8,3);g.cast('e');assert.equal(g.stats.blocked,1);assert.equal(g.dodged,0);
 g.player.invuln=1;g.fire(570,g.player.y,300,0,'enemy',18,8,3);advance(g,.1);assert.equal(g.stats.blocked,2);assert.equal(g.dodged,0);assert.equal(g.player.hp,160);
});
test('swept collision catches a missile crossing the player within one update',()=>{
 const {g}=boot();g.fire(450,g.player.y,12000,0,'enemy',18,8,1);g.update(1/30);assert.equal(g.player.hp,142);assert.equal(g.stats.hits,1);
 assert.equal(g.segmentDistance(-100,0,100,0),0);
});
test('autos home only to their target and do not damage intervening units',()=>{
 const {g}=boot();const e=foe(g,830);const blocker={...e,id:99,x:700};g.setFoes([e,blocker]);g.attackOrder(e);advance(g,.2);e.y-=80;advance(g,.4);assert.ok(e.hp<e.maxHp);assert.equal(blocker.hp,blocker.maxHp);
});
test('30/60/120 FPS produce the same movement and auto cadence',()=>{
 const results=[];for(const fps of [30,60,120]){const {g}=boot();foe(g);g.attackOrder(g.foes[0]);g.loop(1000);for(let i=1;i<=fps*4;i++)g.loop(1000+i*1000/fps);results.push([g.stats.released,g.time]);}
 assert.deepEqual(results.map(r=>r[0]),[6,6,6]);assert.ok(Math.max(...results.map(r=>r[1]))-Math.min(...results.map(r=>r[1]))<.009);
});
test('pause freezes timers, restart clears orders/stats/cooldowns, blur pauses',()=>{
 const {g,window,node}=boot();g.cast('q');advance(g,.2);g.pause();const t=g.time;advance(g,1);assert.equal(g.time,t);g.pause();advance(g,.1);assert.ok(g.time>t);window.listeners.blur();assert.equal(g.state,'paused');g.reset('dodge');assert.equal(g.state,'playing');assert.equal(g.time,0);assert.equal(g.player.cd.q,0);assert.equal(g.stats.hits,0);assert.equal(node('pauseBtn').textContent,'PAUSE P');g.render();
});
test('both drill end conditions transition once; restart remains playable',()=>{
 const {g,node}=boot();g.reset('dodge');g.disableSpawn();g.setTime(59.999);advance(g,.1);assert.equal(g.state,'playing');g.end(false);assert.match(node('menuDescription').textContent,/threats avoided/);g.end(true);assert.match(node('menuTitle').innerHTML,/FELL/);
 g.reset('kite');g.disableSpawn();for(let i=0;i<10;i++){const e=foe(g,620);e.hp=1;g.fire(600,e.y,1000,0,'q',45,10,1);advance(g,.04);}assert.equal(g.state,'ended');assert.match(node('menuDescription').textContent,/Defeated 10/);
});

test('telegraphs lock aim before release and alternate line/fan/ground patterns',()=>{
 const {g}=boot();g.reset('dodge');g.disableSpawn();const e=foe(g,300,337.5);g.shootEnemy(e);assert.equal(g.shots.length,0);assert.equal(e.pending.angle,0);
 g.moveTo(600,500);advance(g,.5);assert.equal(g.shots.length,1);assert.equal(g.shots[0].vy,0);
 g.shootEnemy(e);assert.equal(e.pending.fan,true);advance(g,.5);assert.equal(g.shots.length,4);
 g.shootEnemy(e);assert.equal(g.hazards.length,1);assert.equal(e.pending,null);
});
test('ground telegraph counts an evaded threat, never an unrelated explosion',()=>{
 const {g}=boot();g.reset('dodge');g.disableSpawn();const e=foe(g,200);e.castCount=2;g.shootEnemy(e);advance(g,.01);g.moveTo(900,337.5);advance(g,1);assert.equal(g.dodged,1);assert.equal(g.stats.hits,0);
 e.castCount=2;g.shootEnemy(e);g.hazards[0].x=100;g.hazards[0].y=100;advance(g,1);assert.equal(g.dodged,1);
 e.castCount=2;g.shootEnemy(e);advance(g,1);assert.equal(g.stats.hits,1);assert.equal(g.player.hp,135);
});
test('same seed reproduces encounters; cosmetic bursts do not affect gameplay RNG',()=>{
 const {g}=boot();const record=()=>{g.reset('dodge');advance(g,.9);return JSON.stringify(g.foes.map(e=>[e.x,e.y,e.speed,e.shoot,e.pending]));};const a=record();g.cast('q');assert.equal(record(),a);
});

test('last-hit waves resolve into exactly 15 misses when the player never attacks',()=>{
 const {g,node}=boot();g.reset('lastHit');advance(g,60);assert.equal(g.state,'ended');assert.equal(g.stats.missed,15);assert.equal(node('killsValue').textContent,0);assert.equal(node('dodgedValue').textContent,15);assert.match(node('menuDescription').textContent,/0 \/ 15 CS/);
});
test('last-hit auto earns CS while an allied projectile kill earns only a miss',()=>{
 const {g,node}=boot();g.reset('lastHit');g.disableSpawn();g.addWave();const a=g.foes[0];a.x=820;a.hp=28;a.tick=99;g.attackOrder(a);advance(g,.6);assert.equal(node('killsValue').textContent,1);assert.equal(g.stats.missed,0);
 const b=g.foes[0];b.x=820;b.hp=6;b.tick=0;g.moveTo(600,337.5);advance(g,.5);assert.equal(g.stats.missed,1);assert.equal(node('killsValue').textContent,1);
});
test('CS offensive spells are disabled and health bars render',()=>{
 const {g,node}=boot();g.reset('lastHit');g.addWave();for(const key of ['q','e','r']){g.cast(key);assert.equal(g.player.cd[key],0);}assert.equal(g.shots.length,0);assert.equal(node('cdQ').textContent,'—');g.render();
});
test('holding right mouse retargets movement immediately',()=>{
 const {g,node}=boot();node('arena').listeners.pointermove({clientX:900,clientY:400,buttons:2});assert.equal(g.player.target.x,900);node('arena').listeners.pointermove({clientX:350,clientY:250,buttons:2});assert.equal(g.player.target.x,350);assert.equal(g.player.target.y,250);
});

test('drill menu exits simulation and repeated pause keys never toggle twice',()=>{
 const {g,node,window,key}=boot();key('p');assert.equal(g.state,'paused');window.listeners.keydown({key:'p',repeat:true,preventDefault(){}});assert.equal(g.state,'paused');node('menuBtn').listeners.click();assert.equal(g.state,'menu');assert.equal(node('settings').hidden,false);g.reset('lastHit');assert.equal(g.state,'playing');assert.equal(node('pauseBtn').disabled,false);
});
test('resuming after suspended animation frames does not advance the simulation',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const shot=g.fire(g.player.x-100,g.player.y,500,0,'enemy',10,5,3);
 g.loop(1000);g.loop(1017);const t=g.time,x=shot.x;
 g.pause();g.pause();g.loop(61017);
 assert.equal(g.time,t);assert.equal(shot.x,x);assert.equal(g.stats.hits,0);
 g.loop(61034);assert.ok(g.time>t);assert.ok(shot.x>x);
});
test('starting a new drill discards stale animation frame time',()=>{
 const {g}=boot('ahri');g.loop(1000);g.loop(1017);g.reset('dodge');g.dodgeDirector.next=999;
 g.loop(61000);assert.equal(g.time,0);g.loop(61017);assert.ok(g.time>0);
});

test('death from contact freezes later hazards and the final result immediately',()=>{
 const {g,node}=boot();g.player.hp=1;const e=foe(g,g.player.x,g.player.y);e.speed=0;g.hazards.push({x:100,y:100,r:50,ttl:.001,max:1,threat:true});advance(g,.01);assert.equal(g.state,'ended');assert.equal(g.dodged,0);assert.equal(g.stats.hits,1);assert.match(node('menuDescription').textContent,/1 hits taken/);
});

test('clicking the elevated enemy silhouette selects its ground-anchored unit',()=>{
 const {g,click}=boot();const e=foe(g,800,337.5);click(800,297);assert.equal(g.player.order.id,e.id);
});

test('skillshot drill counts fired and hit Q accurately and ends at 45 seconds',()=>{
 const {g,node}=boot();g.reset('skillshot');g.disableSpawn();const e=foe(g,800);e.targetDummy=true;e.anchorX=e.x;e.anchorY=e.y;e.phase=0;e.speed=0;e.hp=45;g.cast('q');assert.equal(g.stats.skillShots,1);advance(g,.5);assert.equal(g.stats.skillHits,1);assert.equal(node('killsValue').textContent,1);assert.equal(node('dodgedValue').textContent,1);g.cast('e');assert.equal(g.player.cd.e,0);g.setTime(44.99);advance(g,.02);assert.equal(g.state,'ended');assert.match(node('menuDescription').textContent,/1 \/ 1 skillshots hit · 100% accuracy/);
});

test('personal best is saved per drill and difficulty; unavailable storage never interrupts results',()=>{
 const {g,window,node}=boot();const values=new Map();window.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 g.reset('skillshot');g.stats.skillHits=3;g.stats.skillShots=4;g.end(true);assert.match(node('menuDescription').textContent,/Local best \(normal\): 3 hits/);
 g.reset('skillshot');g.stats.skillHits=1;g.end(true);assert.equal(values.get('lmg.best.v1.skillshot.normal'),'3');
 window.localStorage={getItem(){throw Error('blocked')}};g.reset('dodge');g.end(false);assert.equal(g.state,'ended');
});

test('bait drill rewards a baited, avoided spell followed by a last-hit',()=>{
 const {g}=boot();g.reset('bait');advance(g,.02);g.player.x=760;g.player.y=300;advance(g,.02);assert.equal(g.bait.phase,'cast');g.moveTo(760,450);advance(g,2);assert.equal(g.bait.phase,'window');assert.equal(g.bait.dodges,1);assert.equal(g.stats.hits,0);const minion=g.foes.find(e=>e.minion);advance(g,1.2);assert.ok(minion.hp<=28);g.attackOrder(minion);advance(g,.7);assert.equal(g.bait.cs,1);advance(g,.7);assert.equal(g.bait.round,2);
});
test('bait drill tracks hits and missed minions across three rounds',()=>{
 const {g,node}=boot();g.reset('bait');g.player.hp=500;advance(g,.02);for(let round=1;round<=3;round++){g.player.x=600;g.player.y=337;g.player.target=null;advance(g,.02);g.player.x=800;g.player.y=300;advance(g,5.5);if(round<3)assert.equal(g.bait.round,round+1);}assert.equal(g.state,'ended');assert.equal(g.bait.casts,3);assert.equal(g.bait.dodges,0);assert.equal(g.bait.missed,3);assert.equal(g.stats.hits,3);assert.match(node('menuDescription').textContent,/3 spells baited · 0 dodged · 0 \/ 3 CS · 3 missed/);
});

test('skillshot targets spawn away from the player and existing targets',()=>{
 const {g}=boot();g.reset('skillshot');g.disableSpawn();g.addTarget();g.addTarget();g.addTarget();assert.equal(g.foes.length,3);for(const e of g.foes)assert.ok(Math.hypot(e.x-g.player.x,e.y-g.player.y)>250);for(let i=0;i<g.foes.length;i++)for(let j=i+1;j<g.foes.length;j++)assert.ok(Math.hypot(g.foes[i].x-g.foes[j].x,g.foes[i].y-g.foes[j].y)>85);
});

test('bait minion cannot be killed before the enemy spell resolves',()=>{
 const {g}=boot();g.reset('bait');advance(g,.02);const minion=g.foes.find(e=>e.minion);g.player.x=minion.x-50;g.player.y=minion.y;g.attackOrder(minion);advance(g,.2);assert.equal(g.stats.released,0);assert.equal(minion.hp,36);
});
test('painted assets and procedural fallback both render in all drills',()=>{
 const {g,node}=boot();for(const id of ['arenaArt','rangerArt','rangerBackArt','rangerFrontArt','mageArt','minionArt']){node(id).complete=true;node(id).naturalWidth=100;}for(const mode of ['dodge','kite','lastHit','skillshot','bait','lane']){g.reset(mode);advance(g,.05);g.render();}node('arenaArt').naturalWidth=0;node('rangerArt').naturalWidth=0;node('mageArt').naturalWidth=0;node('minionArt').naturalWidth=0;g.render();
});

test('T instantly retries from play, pause and results with a fresh score',()=>{
 const {g,key}=boot();for(const state of ['playing','paused','ended']){g.reset('skillshot');g.stats.skillShots=7;if(state==='paused')g.pause();if(state==='ended')g.end(true);key('t');assert.equal(g.state,'playing');assert.equal(g.time,0);assert.equal(g.stats.skillShots,0);}
});

test('ranger changes sprite with vertical facing and falls back if a direction fails to load',()=>{
 const {g,node,draws}=boot();for(const id of ['rangerArt','rangerBackArt','rangerFrontArt']){node(id).complete=true;node(id).naturalWidth=100;}
 for(const [angle,id] of [[-Math.PI/2,'rangerBackArt'],[Math.PI/2,'rangerFrontArt'],[0,'rangerArt']]){draws.length=0;g.drawChampion(600,300,angle,true,false,0,0);assert.equal(draws[0],node(id));}
 node('rangerBackArt').naturalWidth=0;draws.length=0;g.drawChampion(600,300,-Math.PI/2,true,false,0,0);assert.equal(draws[0],node('rangerArt'));
});

test('kite records prefer a win, then the fastest win, over earlier partial runs',()=>{
 const {g,window,node}=boot();const values=new Map();window.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 g.reset('kite');g.setTime(100);g.end(false);g.reset('kite');g.setTime(30);g.end(true);assert.match(node('menuDescription').textContent,/win in 30.0s/);
 g.reset('kite');g.setTime(40);g.end(true);assert.match(node('menuDescription').textContent,/win in 30.0s/);g.reset('kite');g.setTime(25);g.end(true);assert.match(node('menuDescription').textContent,/win in 25.0s/);
});

test('right-click routes the player around walls without entering them',()=>{
 const {g}=boot(),world=require('../world.js');g.player.x=35;g.player.y=150;g.moveTo(400,150);
 let diverted=false;for(let i=0;i<360;i++){g.update(1/120);assert.ok(world.pointWalkable(g.player));if(Math.abs(g.player.y-150)>20)diverted=true;}assert.ok(diverted);assert.ok(Math.hypot(g.player.x-400,g.player.y-150)<2);
});
test('dash stops at a wall, while flash can cross and ends in walkable space',()=>{
 const {g,node}=boot(),world=require('../world.js');g.player.x=35;g.player.y=150;node('arena').listeners.pointermove({clientX:600,clientY:150,buttons:0});g.cast('w');assert.ok(g.player.x<85);assert.ok(world.pointWalkable(g.player));
 g.reset('kite');g.disableSpawn();g.player.x=35;g.player.y=150;g.cast('f');assert.ok(g.player.x>181);assert.ok(world.pointWalkable(g.player));
});
test('a pursuing enemy routes around a wall rather than crossing or getting stuck',()=>{
 const {g}=boot(),world=require('../world.js');g.player.x=500;g.player.y=150;
 const e=foe(g,35,150);e.speed=100;let diverted=false;for(let i=0;i<720;i++){g.update(1/120);assert.ok(world.pointWalkable(e,e.r));if(Math.abs(e.y-150)>10)diverted=true;}
 assert.ok(diverted);assert.ok(Math.hypot(e.x-g.player.x,e.y-g.player.y)<260);
});
test('attack-move navigates around a wall before acquiring a destination',()=>{
 const {g,key,click}=boot(),world=require('../world.js');g.player.x=35;g.player.y=150;
 key('a');click(400,150,0);let diverted=false;for(let i=0;i<360;i++){g.update(1/120);assert.ok(world.pointWalkable(g.player));if(Math.abs(g.player.y-150)>20)diverted=true;}
 assert.ok(diverted);assert.ok(Math.hypot(g.player.x-400,g.player.y-150)<2);
});
test('a fresh move order interrupts a detour immediately',()=>{
 const {g}=boot(),world=require('../world.js');g.player.x=35;g.player.y=150;g.moveTo(400,150);advance(g,.3);g.moveTo(100,350);
 for(let i=0;i<300;i++){g.update(1/120);assert.ok(world.pointWalkable(g.player));}
 assert.ok(Math.hypot(g.player.x-100,g.player.y-350)<2);
});
test('bait caster moves while waiting and stops to lock its spell',()=>{
 const {g}=boot();g.reset('bait');advance(g,.02);const caster=g.foes.find(e=>e.baitCaster),initial={x:caster.x,y:caster.y};advance(g,1);
 assert.ok(Math.hypot(caster.x-initial.x,caster.y-initial.y)>1);g.player.x=760;g.player.y=300;advance(g,.02);assert.equal(g.bait.phase,'cast');const locked={x:caster.x,y:caster.y};advance(g,.2);assert.equal(caster.x,locked.x);assert.equal(caster.y,locked.y);
});
test('all difficulty presets give a last-hit window after an allied hit',()=>{
 for(const difficulty of ['easy','normal','hard']){
  const {g,node}=boot();node('difficulty').listeners.change({target:{value:difficulty}});g.reset('bait');advance(g,.02);g.player.x=760;g.player.y=300;advance(g,.02);g.moveTo(760,450);
  for(let i=0;i<360&&g.bait.phase!=='window';i++)g.update(1/120);assert.equal(g.bait.phase,'window',difficulty);
  advance(g,1.65);const minion=g.foes.find(e=>e.minion);assert.ok(minion&&minion.hp>0&&minion.hp<=28,`${difficulty}: ${minion?.hp}`);assert.ok(g.bait.timer>1);
 }
});

test('running away along a baited shot is not scored as a dodge before it catches up',()=>{
 const {g}=boot();g.reset('bait');advance(g,.02);g.player.x=400;g.player.y=300;g.bait.phase='dodge';const s=g.fire(200,300,340,0,'enemy',18,7,4);s.bait=true;s.threat=true;g.moveTo(1000,300);advance(g,1);assert.equal(g.bait.dodges,0);assert.equal(g.stats.hits,0);advance(g,1.6);assert.equal(g.bait.dodges,0);assert.equal(g.stats.hits,1);
});

test('optional sound handles missing audio and never interrupts gameplay',()=>{
 const {g,node}=boot();node('soundBtn').listeners.click();assert.equal(node('soundBtn').disabled,true);assert.equal(node('soundBtn').textContent,'SOUND UNAVAILABLE');const e=foe(g);g.attackOrder(e);advance(g,.25);assert.equal(g.stats.released,1);
});
test('enabled sound plays attack cues and the toggle mutes subsequent cues',()=>{
 const {g,window,node}=boot();let plays=0;const param={setValueAtTime(){},exponentialRampToValueAtTime(){}};
 window.AudioContext=class{constructor(){this.currentTime=10;this.destination={};}resume(){return Promise.resolve();}createOscillator(){return {frequency:param,connect(){},start(){plays++;},stop(){}};}createGain(){return {gain:param,connect(){}};}};
 node('soundBtn').listeners.click();assert.equal(node('soundBtn').textContent,'SOUND ON');assert.equal(plays,1);
 const e=foe(g);g.attackOrder(e);advance(g,.2);assert.equal(plays,2);node('soundBtn').listeners.click();assert.equal(node('soundBtn').textContent,'SOUND OFF');advance(g,1);assert.equal(plays,2);
});

test('lane scenario separates player CS, enemy kills and allied misses',()=>{
 const {g,node}=boot();g.reset('lane');advance(g,.02);const minion=g.foes.find(e=>e.minion),opponent=g.foes.find(e=>!e.minion);assert.ok(minion&&opponent);
 g.damageEnemy(minion,100);assert.equal(g.stats.cs,1);assert.equal(g.stats.missed,0);g.damageEnemy(opponent,100);assert.equal(g.stats.cs,1);
 advance(g,.02);assert.equal(node('killsValue').textContent,1);g.setTime(59.99);advance(g,.02);assert.equal(g.state,'ended');assert.match(node('menuDescription').textContent,/1 \/ 15 CS · 0 missed · 2 unresolved · 1 enemies defeated/);
});

test('lane scenario resolves all 15 minions and ends at 60 seconds',()=>{
 const {g,node}=boot();g.reset('lane');g.player.hp=g.player.maxHp=10000;advance(g,60.1);assert.equal(g.state,'ended');assert.equal(g.stats.cs,0);assert.equal(g.stats.missed,15);assert.match(node('menuDescription').textContent,/0 \/ 15 CS · 15 missed/);
});
test('lane minions do not heal the player, champion defeats still do',()=>{
 const {g}=boot();g.reset('lane');advance(g,.02);g.player.hp=100;const minion=g.foes.find(e=>e.minion),opponent=g.foes.find(e=>!e.minion);g.damageEnemy(minion,100);assert.equal(g.player.hp,100);g.damageEnemy(opponent,100);assert.equal(g.player.hp,105);
});

test('a finishing pulse does not damage further enemies or block missiles after the game ends',()=>{
 const {g,node}=boot();g.setKills(9);const a=g.enemy(620,337.5),b=g.enemy(640,337.5);a.hp=b.hp=1;g.setFoes([a,b]);const shot=g.fire(610,337.5,0,0,'enemy',18,8,2);g.cast('e');assert.equal(g.state,'ended');assert.equal(b.hp,1);assert.equal(shot.alive,true);assert.equal(g.stats.blocked,0);assert.match(node('menuDescription').textContent,/Defeated 10 enemies/);
});
test('retry removes stale toast feedback',()=>{
 const {g,node,key}=boot(),active=new Set();node('toast').classList={add:k=>active.add(k),remove:k=>active.delete(k)};key('a');assert.ok(active.has('show'));g.reset('kite');assert.equal(g.time,0);assert.equal(active.has('show'),false);
});

test('fatal contact stops later enemies from acting in the same simulation step',()=>{
 const {g}=boot();g.player.hp=1;const a=g.enemy(g.player.x,g.player.y),b=g.enemy(g.player.x+100,g.player.y);a.speed=b.speed=0;a.shoot=999;b.shoot=-1;g.setFoes([a,b]);advance(g,.02);assert.equal(g.state,'ended');assert.equal(g.shots.length,0);
});

test('attack-speed presets change cadence without affecting frame-rate independence',()=>{
 for(const [preset,expected] of [['slow',3],['standard',6],['fast',8]]){for(const fps of [30,60,120]){const {g,node}=boot();node('attackSpeed').listeners.change({target:{value:preset}});g.reset('kite');g.disableSpawn();const e=foe(g);g.attackOrder(e);g.loop(1000);for(let i=1;i<=fps*4;i++)g.loop(1000+i*1000/fps);assert.equal(g.stats.released,expected,`${preset} ${fps}`);}}
});
test('personal bests are separated by attack-speed preset',()=>{
 const {g,node,window}=boot(),values=new Map();window.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};g.reset('skillshot');g.stats.skillHits=4;g.end(true);node('attackSpeed').listeners.change({target:{value:'fast'}});g.reset('skillshot');g.stats.skillHits=2;g.end(true);assert.equal(values.get('lmg.best.v1.skillshot.normal'),'4');assert.equal(values.get('lmg.best.v1.skillshot.normal.as_fast'),'2');
});

test('target escaping during windup is reported as a cancelled attack, without consuming cooldown',()=>{
 const {g}=boot();const e=foe(g,800);g.attackOrder(e);advance(g,.05);e.x=1100;advance(g,.2);assert.equal(g.stats.cancelled,1);assert.equal(g.stats.released,0);assert.equal(g.player.attackTimer,0);
});

test('telegraphed sweep has a safe corridor and does not award unrelated dodges',()=>{
 const {g}=boot();g.reset('dodge');g.disableSpawn();advance(g,14.05);assert.equal(g.sweeps.length,1);const gap=g.sweeps[0].gap;g.player.y=gap;advance(g,1.5);assert.equal(g.sweeps.length,0);assert.ok(g.shots.length>0);for(const shot of g.shots)assert.ok(Math.abs(shot.y-gap)>=75);advance(g,5);assert.equal(g.player.hp,160);assert.equal(g.dodged,0);
});
test('sweep warning pauses, resets, and its centre corridor is walkable across the arena',()=>{
 const {g}=boot(),world=require('../world.js');g.reset('dodge');g.disableSpawn();advance(g,14.05);const wall=g.sweeps[0],remaining=wall.remaining;
 for(let x=22;x<=1178;x+=20)assert.ok(world.pointWalkable({x,y:wall.gap}));
 g.pause();advance(g,2);assert.equal(wall.remaining,remaining);g.pause();g.reset('dodge');assert.equal(g.sweeps.length,0);g.disableSpawn();advance(g,13);assert.equal(g.sweeps.length,0);
});

test('kite feedback measures time ready in range without an active attack',()=>{
 const {g}=boot();const e=foe(g);advance(g,1);assert.ok(g.stats.readyIdle>.99);g.attackOrder(e);const baseline=g.stats.readyIdle;advance(g,2);assert.ok(g.stats.readyIdle-baseline<.03);
});

test('results and pause reopen the menu at the top',()=>{
 const {g,node}=boot();node('menu').scrollTop=200;g.pause();assert.equal(node('menu').scrollTop,0);g.pause();node('menu').scrollTop=180;g.end(false);assert.equal(node('menu').scrollTop,0);
});

test('skillshot targets spawn and move outside physical walls',()=>{
 const world=require('../world.js');const {g}=boot();g.reset('skillshot');g.disableSpawn();
 for(let i=0;i<100;i++){g.setFoes([]);g.addTarget();for(const e of g.foes)assert.ok(world.pointWalkable(e,e.r));}
 const e=foe(g,810,550);e.targetDummy=true;e.anchorX=780;e.anchorY=550;e.phase=0;e.speed=90;
 for(let i=0;i<1200;i++){g.update(1/120);assert.ok(world.pointWalkable(e,e.r),`target entered a wall at ${e.x}, ${e.y}`);}
});

test('Ahri timing uses level-one cadence and 20 percent windup',()=>{
 for(const fps of [30,60,120]){const {g,node}=boot();node('attackSpeed').listeners.change({target:{value:'ahri'}});g.reset('kite');g.disableSpawn();const e=foe(g);g.attackOrder(e);advance(g,.28);assert.equal(g.stats.released,0);advance(g,.04);assert.equal(g.stats.released,1);g.loop(1000);for(let i=1;i<=fps*4;i++)g.loop(1000+i*1000/fps);assert.equal(g.stats.released,3);assert.match(node('encounterValue').textContent,/AS 0.668/);}
});

test('Ahri CS profile uses 53 damage and separates old timing-only records',()=>{
 const {g,node,window}=boot(),values=new Map();window.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 node('attackSpeed').listeners.change({target:{value:'ahri'}});g.reset('lastHit');g.disableSpawn();g.addWave();g.setAllies([]);const e=g.foes[0];assert.equal(e.hp,465);assert.equal(g.player.speed,165);e.x=g.player.x+220;e.y=g.player.y;e.tick=999;e.hp=54;g.attackOrder(e);advance(g,.7);assert.equal(e.hp,1);assert.equal(g.stats.cs,0);
 g.moveTo(600,337.5);e.hp=53;g.attackOrder(e);advance(g,2);assert.equal(e.alive,false);assert.equal(node('killsValue').textContent,1);g.end(true);assert.equal(values.get('lmg.best.v1.lastHit.normal.cs_ahri_v14'),'1');assert.match(node('menuDescription').textContent,/53 damage/);
});
test('Ahri CS unattended waves resolve without breaking the drill',()=>{
 for(const difficulty of ['easy','normal','hard']){const {g,node}=boot();node('attackSpeed').listeners.change({target:{value:'ahri'}});node('difficulty').listeners.change({target:{value:difficulty}});g.reset('lastHit');advance(g,600.02);assert.equal(g.state,'ended');assert.equal(g.stats.missed+g.stats.unresolved,126);}
});

test('auto attacks apply armor mitigation at impact and CS lethal boundary',()=>{
 for(const [hp,lethal] of [[26.5,true],[26.6,false]]){const {g,node}=boot();node('attackSpeed').listeners.change({target:{value:'ahri'}});g.reset('lastHit');g.disableSpawn();g.addWave();const e=g.foes[0];e.x=g.player.x+220;e.y=g.player.y;e.tick=999;e.armor=100;e.hp=hp;g.attackOrder(e);advance(g,.7);assert.equal(!e.alive,lethal);assert.equal(node('killsValue').textContent,lethal?1:0);if(!lethal)assert.ok(Math.abs(e.hp-.1)<1e-7);g.render();}
});

test('Ahri can secure a minion after allied damage on each difficulty',()=>{
 for(const difficulty of ['easy','normal','hard']){const {g,node}=boot();node('attackSpeed').listeners.change({target:{value:'ahri'}});node('difficulty').listeners.change({target:{value:difficulty}});g.reset('lastHit');g.disableSpawn();g.addWave();const e=g.foes[1];g.player.x=650;g.player.y=e.y;
 for(let i=0;i<1800&&e.alive&&e.hp>53;i++)g.update(1/120);assert.ok(e.alive&&e.hp>0&&e.hp<=53,`${difficulty} has a last-hit window`);g.attackOrder(e);
 for(let i=0;i<120&&e.alive;i++)g.update(1/120);assert.equal(node('killsValue').textContent,1,`${difficulty} secures CS`);}
});

test('reference spells use stated cast, speed, range and mitigated damage',()=>{
 for(const [mode,speed,radius,ttl,damage,root] of [['luxDodge',600,35,650/600,80/1.3,2],['ezrealDodge',1000,30,.6,98/1.21,0]]){const {g,node}=boot();g.reset(mode);advance(g,1.52);const caster=g.foes[0];assert.ok(caster.pending);assert.equal(g.shots.length,0);advance(g,.26);const s=g.shots[0];assert.ok(s);assert.ok(Math.abs(Math.hypot(s.vx,s.vy)-speed)<1e-6);assert.equal(s.r,radius);assert.ok(s.ttl<=ttl&&s.ttl>ttl-.03);advance(g,1);assert.ok(Math.abs(g.stats.damage-damage)<1e-6);assert.equal(g.stats.hits,1);assert.equal(node('killsValue').textContent,1);if(root)assert.ok(g.player.root>1);else assert.equal(g.player.root,0);}
});
test('Lux root prevents movement and flash, while pause freezes it',()=>{
 const {g}=boot();g.reset('luxDodge');advance(g,2.6);assert.ok(g.player.root>0);const x=g.player.x;g.moveTo(x-200,g.player.y);advance(g,.3);assert.equal(g.player.x,x);const root=g.player.root;g.pause();advance(g,1);assert.equal(g.player.root,root);g.pause();g.cast('f');assert.equal(g.player.x,x);assert.equal(g.player.cd.f,0);advance(g,2);assert.equal(g.player.root,0);g.cast('f');assert.notEqual(g.player.x,x);
});
test('reference missiles expire at range and reference drills restart cleanly',()=>{
 for(const mode of ['luxDodge','ezrealDodge']){const {g}=boot();g.reset(mode);g.player.x=100;g.player.y=337.5;advance(g,3.5);assert.equal(g.stats.hits,0);assert.equal(g.shots.length,0);g.reset(mode);assert.equal(g.player.root,0);assert.equal(g.player.hp,590);g.setTime(59.99);advance(g,.02);assert.equal(g.state,'ended');}
});

test('reference shots retain damage and timing at 30, 60 and 120 FPS',()=>{
 for(const mode of ['luxDodge','ezrealDodge']){const outcomes=[];for(const fps of [30,60,120]){const {g}=boot();g.reset(mode);g.loop(1000);for(let i=1;i<=fps*3;i++)g.loop(1000+i*1000/fps);outcomes.push([g.stats.hits,g.stats.damage]);}for(const outcome of outcomes){assert.equal(outcome[0],1);assert.ok(Math.abs(outcome[1]-outcomes[0][1])<1e-8);}}
});
test('reference flash does not grant invulnerability',()=>{
 const {g}=boot();g.reset('luxDodge');g.cast('f');assert.equal(g.player.invuln,0);
});

test('both reference drills complete a full simulated survival and report correct score',()=>{
 for(const mode of ['luxDodge','ezrealDodge']){const {g,node}=boot();g.reset(mode);g.player.x=100;advance(g,60.02);assert.equal(g.state,'ended');assert.equal(g.stats.hits,0);assert.equal(g.dodged,0);assert.match(node('menuTitle').innerHTML,/COMPLETE/);assert.match(node('menuDescription').textContent,/0 hits/);}
});

test('Ahri waves contain three melee and three caster minions and use edge attack range',()=>{
 const {g,node}=boot();node('attackSpeed').listeners.change({target:{value:'ahri'}});g.reset('lastHit');g.disableSpawn();g.addWave();assert.equal(g.foes.length,6);assert.equal(g.foes.filter(e=>e.minionType==='melee'&&e.hp===465).length,3);assert.equal(g.foes.filter(e=>e.minionType==='caster'&&e.hp===284).length,3);
 const e=g.foes[0];e.x=g.player.x+331;e.y=g.player.y;e.tick=e.meleeTick=999;g.attackOrder(e);advance(g,.31);assert.equal(g.stats.released,1);
});
test('Ahri CS allied melee and caster damage use minion ratios',()=>{
 const {g,node}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const e=g.foes[0],ally=g.allies[0];e.x=e.destination;e.tick=999;ally.x=e.x-35;ally.y=e.y;ally.tick=0;g.setFoes([e]);g.setAllies([ally]);advance(g,.27);assert.ok(Math.abs(e.hp-(465-11-465*.02))<1e-8);
 ally.minionType='caster';ally.tick=0;advance(g,.5);const hpAfterMelee=465-11-465*.02;assert.ok(Math.abs(e.hp-(hpAfterMelee-21-hpAfterMelee*.035))<1e-7);
});

test('Ahri is the selected default and visible menu has three focused drills',()=>{
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8');assert.match(html,/value="ahri" selected/);assert.deepEqual([...html.matchAll(/data-mode="([^"]+)"/g)].map(m=>m[1]),['dodge','kite','lastHit']);
 const {g}=boot('ahri');for(const mode of ['dodge','kite','lastHit']){g.reset(mode);assert.equal(g.player.hp,590);assert.equal(g.player.speed,165);}
});
test('Ahri dodge integrates Lux and Ezreal casts in one drill',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.disableSpawn();const e=foe(g,900);g.shootEnemy(e);assert.equal(e.pending.spell.name,'LUX Q');g.releaseEnemy(e);assert.equal(g.shots[0].r,35);g.shootEnemy(e);assert.equal(e.pending.spell.name,'EZREAL Q');g.releaseEnemy(e);assert.equal(g.shots[1].r,30);
});

test('Ahri Charm casts for 0.25 seconds and hits the first unit with magic damage and crowd control',()=>{
 const {g}=boot('ahri');g.reset('kite');g.disableSpawn();const e=foe(g,800);e.hp=200;e.mr=100;e.speed=0;const b={...e,id:99,x:900,hp:200};g.setFoes([e,b]);g.cast('e');assert.equal(g.player.cd.e,12);assert.ok(g.player.casting);advance(g,.2);assert.equal(g.shots.length,0);g.pause();advance(g,1);assert.ok(g.player.casting);g.pause();advance(g,.4);assert.equal(e.hp,160);assert.equal(b.hp,200);assert.ok(e.charm>0);assert.equal(g.shots.length,0);
});
test('Ahri Charm interrupts an enemy cast and forces movement toward Ahri',()=>{
 const {g}=boot('ahri');g.reset('kite');g.disableSpawn();const e=foe(g,800);e.hp=200;e.speed=100;e.shoot=999;g.shootEnemy(e);assert.ok(e.pending);g.cast('e');advance(g,.55);assert.ok(e.charm>0);assert.equal(e.pending,null);const x=e.x;advance(g,.25);assert.ok(e.x<x);
});
test('Charm cast locks movement but accepts a queued move',()=>{
 const {g}=boot('ahri');g.reset('kite');g.disableSpawn();const x=g.player.x;g.cast('e');g.moveTo(400,g.player.y);advance(g,.2);assert.equal(g.player.x,x);advance(g,.2);assert.ok(g.player.x<x);
});

test('Ahri orb pierces units once each way and returns true damage',()=>{
 const {g}=boot('ahri');g.reset('kite');g.disableSpawn();const e=foe(g,800);e.hp=200;e.mr=100;const b={...e,id:99,x:900,hp:200};g.setFoes([e,b]);g.cast('q');assert.equal(g.player.cd.q,7);advance(g,.2);assert.equal(g.shots.length,0);advance(g,1.8);assert.ok(Math.abs(e.hp-147.5)<1e-7);assert.ok(Math.abs(b.hp-147.5)<1e-7);assert.equal(g.shots.length,0);
});
test('Ahri orb follows the player on return after they move',()=>{
 const {g}=boot('ahri');g.reset('kite');g.disableSpawn();g.cast('q');advance(g,.9);assert.equal(g.shots[0].phase,'return');g.moveTo(400,500);advance(g,2);assert.equal(g.shots.length,0);assert.ok(g.player.x<600);
});

test('Ahri Fox-Fire boosts movement and its three flames deal reduced repeat damage',()=>{
 const {g}=boot('ahri');g.reset('kite');g.disableSpawn();const e=foe(g,800);e.mr=100;const x=g.player.x;g.moveTo(700,g.player.y);g.cast('w');assert.equal(g.player.cd.w,9);advance(g,.2);assert.ok(g.player.x-x>33);advance(g,1.5);assert.ok(Math.abs(e.hp-9964)<1e-7);assert.equal(g.player.fox,null);
});
test('Ahri Fox-Fire movement observes the upper speed soft cap and decays',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.moveTo(1100,g.player.y);g.cast('w');
 const dt=1/120,start=g.player.x;g.update(dt);
 const raw=330*(1+.4*(2-dt)/2),expected=(raw*.8+83)*.5*dt;
 assert.ok(Math.abs(g.player.x-start-expected)<1e-8);const first=g.player.x-start;
 advance(g,.8);const before=g.player.x;g.update(dt);const later=g.player.x-before;
 assert.ok(later<first);assert.ok(later>165*dt);
});
test('Ahri Fox-Fire does not cancel an auto windup and is locked in auto-only CS',()=>{
 const {g,node}=boot('ahri');g.reset('kite');g.disableSpawn();const e=foe(g,800);g.attackOrder(e);advance(g,.1);const windup=g.player.windup;g.cast('w');assert.equal(g.player.windup,windup);advance(g,.25);assert.equal(g.stats.released,1);g.reset('lastHit');g.cast('w');assert.equal(g.player.cd.w,0);assert.equal(node('cdW').textContent,'—');
});

test('Ahri Spirit Rush has three timed charges and fires magic bolts',()=>{
 const {g,node}=boot('ahri');g.reset('kite');g.disableSpawn();const e=foe(g,800);e.mr=100;const x=g.player.x;g.cast('r');assert.equal(g.player.rushCharges,2);assert.equal(g.player.cd.r,140);g.cast('r');assert.equal(g.player.rushCharges,2);advance(g,.7);assert.ok(g.player.x>x);assert.ok(Math.abs(e.hp-9962.5)<1e-8);advance(g,.4);assert.match(node('cdR').textContent,/×2/);g.cast('r');assert.equal(g.player.rushCharges,1);advance(g,1.1);g.cast('r');assert.equal(g.player.rushCharges,0);advance(g,1.1);g.cast('r');assert.equal(g.player.rushCharges,0);assert.ok(g.player.cd.r>130);
});
test('Spirit Rush snapshots capped movement speed when the dash starts',()=>{
 function dash(boosted){
  const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
  node('arena').listeners.pointermove({clientX:1000,clientY:g.player.y,buttons:0});if(boosted)g.cast('w');g.cast('r');
  const speed=g.player.dashing.speed,start=g.player.x;g.update(.1);return {g,speed,moved:g.player.x-start};
 }
 const base=dash(false),boosted=dash(true);
 assert.equal(base.speed,765);assert.ok(Math.abs(boosted.speed-826.3)<1e-9);
 assert.ok(Math.abs(base.moved-76.5)<1e-8);assert.ok(Math.abs(boosted.moved-82.63)<1e-8);
 const before=base.g.player.dashing.speed;base.g.cast('w');assert.equal(base.g.player.dashing.speed,before);
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;node('arena').listeners.pointermove({clientX:1000,clientY:g.player.y,buttons:0});g.cast('w');advance(g,.8);g.cast('r');
 assert.ok(g.player.dashing.speed>base.speed&&g.player.dashing.speed<boosted.speed);
});
test('Spirit Rush cannot ignore enemy collisions or cast while rooted',()=>{
 const {g}=boot('ahri');g.reset('kite');g.disableSpawn();g.player.root=1;g.cast('r');assert.equal(g.player.cd.r,0);g.player.root=0;g.fire(670,g.player.y,0,0,'enemy',18,5,1);g.cast('r');advance(g,.3);assert.equal(g.stats.hits,1);assert.equal(g.player.invuln,0);
});
test('Spirit Rush crosses a wall only when its destination is walkable',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.x=600;g.player.y=580;
 node('arena').listeners.pointermove({clientX:850,clientY:580,buttons:0});g.cast('r');assert.equal(g.player.dashing.throughTerrain,true);
 advance(g,.15);assert.ok(g.player.x>653&&g.player.x<792,'dash should traverse the wall over time');assert.ok(g.player.dashing);
 advance(g,.3);assert.ok(Math.abs(g.player.x-850)<.1);assert.equal(g.player.dashing,null);
 g.reset('dodge');g.dodgeDirector.next=999;g.player.x=600;g.player.y=580;
 node('arena').listeners.pointermove({clientX:720,clientY:580,buttons:0});g.cast('r');assert.equal(g.player.dashing.throughTerrain,false);
 advance(g,.4);assert.ok(g.player.x<=653.01);assert.equal(g.player.dashing,null);
});
test('Spirit Rush remains vulnerable while crossing terrain and roots cannot strand it',()=>{
 const world=require('../world.js'),{g,node}=boot('ahri');g.reset('kite');g.disableSpawn();g.player.x=600;g.player.y=580;
 node('arena').listeners.pointermove({clientX:850,clientY:580,buttons:0});const shot=g.fire(710,580,0,0,'enemy',10,5,1);shot.root=1;g.cast('r');advance(g,.25);
 assert.equal(g.stats.hits,1);assert.ok(g.player.root>0);assert.equal(g.player.dashing,null);assert.ok(world.pointWalkable(g.player,g.player.r));
});

test('Spirit Rush recast window freezes during pause and expires without refreshing cooldown',()=>{
 const {g}=boot('ahri');g.reset('kite');g.disableSpawn();g.cast('r');advance(g,.5);g.pause();const remaining=g.player.rushWindow;advance(g,3);assert.equal(g.player.rushWindow,remaining);g.pause();advance(g,15);assert.equal(g.player.rushWindow,0);const charges=g.player.rushCharges;g.cast('r');assert.equal(g.player.rushCharges,charges);assert.ok(g.player.cd.r>120);
});

test('Ahri sprite is selected with a safe fallback when unavailable',()=>{
 const {g,node,draws}=boot('ahri');g.reset('kite');node('ahriArt').complete=true;node('ahriArt').naturalWidth=100;g.render();assert.ok(draws.includes(node('ahriArt')));draws.length=0;node('ahriArt').naturalWidth=0;node('rangerArt').complete=true;node('rangerArt').naturalWidth=100;g.render();assert.ok(draws.includes(node('rangerArt')));
});

test('Ahri back sprite appears when facing away and falls back to side',()=>{
 const {g,node,draws}=boot('ahri');g.reset('kite');for(const id of ['ahriArt','ahriBackArt']){node(id).complete=true;node(id).naturalWidth=100;}g.player.facing=-Math.PI/2;g.render();assert.ok(draws.includes(node('ahriBackArt')));draws.length=0;node('ahriBackArt').naturalWidth=0;g.render();assert.ok(draws.includes(node('ahriArt')));
});

test('Ahri projectile hitbox uses scaled 65-unit gameplay radius at its boundary',()=>{
 for(const [offset,expected] of [[62.4,1],[62.6,0]]){const {g}=boot('ahri');g.reset('kite');g.disableSpawn();assert.equal(g.player.hitRadius,32.5);g.fire(400,g.player.y+offset,400,0,'enemy',18,30,1.5);advance(g,1);assert.equal(g.stats.hits,expected,`offset ${offset}`);}
});
test('directed Ahri dodge never adds the legacy synthetic sweep outside the threat budget',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.disableSpawn();g.player.hp=1e9;
 for(let i=0;i<60*120;i++){
  g.update(1/120);
  assert.equal(g.sweeps.length,0);
  assert.ok(g.shots.every(s=>!s.alive||s.directed),'undirected projectile bypassed the director');
 }
 assert.ok(g.dodgeDirector.attempted>0);
});

test('Ahri charm respects champion and minion gameplay-radius boundaries',()=>{
 for(const [minion,offset,hit] of [[false,62.4,true],[false,62.6,false],[true,53.9,true],[true,54.1,false]]){const {g}=boot('ahri');g.reset('kite');g.disableSpawn();const e=foe(g,800,g.player.y+offset);e.minion=minion;e.mr=0;e.hp=1000;if(minion){e.tick=999;e.destination=800;}g.cast('e');advance(g,.8);assert.equal(e.hp<1000,hit,`${minion?'minion':'champion'} at ${offset}`);}
});

test('non-piercing skillshot hits the first collision, not the closest center',()=>{
 const {g}=boot('ahri');g.reset('kite');g.disableSpawn();const a=foe(g,790,g.player.y+62);a.hp=1000;const b={...a,id:99,x:800,y:g.player.y,hp:1000};g.setFoes([a,b]);g.fire(600,g.player.y,1000,0,'charm',80,30,1);g.update(.5);assert.equal(a.hp,1000);assert.equal(b.hp,920);assert.ok(b.charm>0);
});

test('Ahri heals on ninth minion last hit and champion takedown',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.player.hp=400;for(let i=0;i<9;i++){const e=g.enemy(900,300);e.minion=true;e.hp=1;g.damageEnemy(e,1);}assert.equal(g.player.essence,0);assert.equal(g.player.hp,435);g.reset('kite');g.disableSpawn();g.player.hp=550;const champ=foe(g,800);champ.hp=1;g.damageEnemy(champ,1);assert.equal(g.player.hp,590);
});
test('allied minion damage respects target armor',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const e=g.foes[0],ally=g.allies[0];e.x=e.destination;e.armor=100;e.tick=999;ally.x=e.x-35;ally.y=e.y;ally.tick=0;g.setFoes([e]);g.setAllies([ally]);advance(g,.27);assert.ok(Math.abs(e.hp-(465-(11+465*.02)/2))<1e-8);
});

test('Ahri champion takedown adds a Spirit Rush charge during its active window',()=>{
 const {g}=boot('ahri');g.reset('kite');g.disableSpawn();g.cast('r');advance(g,.4);const e=foe(g,800);e.hp=1;g.damageEnemy(e,1);assert.equal(g.player.rushCharges,3);assert.ok(g.player.rushWindow>10);
});

test('Dodge Trial applies skillshot damage without immobilizing the player',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.disableSpawn();const shot=g.fire(500,g.player.y,600,0,'enemy',40,35,1);shot.root=2;advance(g,.3);assert.equal(g.stats.hits,1);assert.equal(g.player.root,0);const x=g.player.x;g.moveTo(x+100,g.player.y);advance(g,.3);assert.ok(g.player.x>x);
});

test('CS waves fight both ways, stop attacking after death and retarget',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();assert.equal(g.allies.length,6);assert.equal(g.foes.length,6);advance(g,6);assert.ok(g.allies.some(e=>e.hp<e.maxHp));assert.ok(g.foes.some(e=>e.hp<e.maxHp));const ally=g.allies[0];ally.hp=1;advance(g,4);assert.ok(!ally.alive);
});

test('allied minions retarget after a target dies and player last hits retain credit',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const a=g.allies[0],first=g.foes[0],second=g.foes[1];a.x=790;a.y=first.y;a.tick=0;first.x=first.destination;first.hp=1;second.x=second.destination;first.tick=second.tick=999;g.setAllies([a]);g.setFoes([first,second]);advance(g,.35);assert.equal(first.alive,false);assert.equal(g.stats.missed,1);advance(g,.1);assert.equal(a.targetId,second.id);second.hp=1;g.damageEnemy(second,1);assert.equal(g.stats.missed,1);assert.equal(g.player.essence,1);
});

test('bidirectional waves remain deterministic across frame rates and freeze on pause',()=>{
 const outcomes=[];for(const fps of [30,60,120]){const {g}=boot('ahri');g.reset('lastHit');g.loop(1000);for(let i=1;i<=fps*12;i++)g.loop(1000+i*1000/fps);outcomes.push(JSON.stringify([g.stats.missed,g.foes.map(e=>[e.id,Math.round(e.hp*1000)]),g.allies.map(e=>[e.id,Math.round(e.hp*1000)])]));g.pause();const state=JSON.stringify([g.foes,g.allies,g.shots]);advance(g,2);assert.equal(JSON.stringify([g.foes,g.allies,g.shots]),state);}assert.deepEqual(outcomes,[outcomes[0],outcomes[0],outcomes[0]]);
});

test('impact applies damage types and records one killer once',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const e=g.foes[0];e.armor=100;e.mr=100;e.hp=100;
 assert.equal(g.applyImpact(e,{sourceId:7,sourceTeam:'ally',kind:'test',raw:53,damageType:'physical'}),26.5);
 assert.equal(g.applyImpact(e,{sourceId:'player',sourceTeam:'player',kind:'test',raw:53,damageType:'magic'}),26.5);
 assert.equal(g.applyImpact(e,{sourceId:7,sourceTeam:'ally',kind:'test',raw:47,damageType:'true'}),47);
 assert.equal(e.death.killerId,7);assert.equal(g.stats.missed,1);assert.equal(g.player.essence,0);
 assert.equal(g.applyImpact(e,{sourceId:'player',sourceTeam:'player',kind:'auto',raw:999,damageType:'true'}),0);assert.equal(g.stats.missed,1);assert.equal(g.player.essence,0);
});
test('timeout survivors are unresolved rather than attributed deaths',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();g.setAllies([]);g.end(true);assert.equal(g.stats.missed,0);assert.equal(g.stats.unresolved,6);assert.ok(g.foes.every(e=>e.alive));
});
test('minion windup cancels when target dies and can reacquire another wave',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const a=g.allies[0],first=g.foes[0],next=g.foes[1];a.x=790;a.y=first.y;a.tick=0;first.x=first.destination;first.tick=999;next.x=next.destination;next.wave=2;g.setAllies([a]);g.setFoes([first,next]);advance(g,.1);assert.equal(first.hp,465);g.damageEnemy(first,999);advance(g,.1);assert.equal(a.targetId,next.id);assert.equal(next.hp,465);advance(g,.3);assert.ok(next.hp<465);
});

test('pinned Ahri data is converted once and leaves time and damage unscaled',()=>{
 const {g}=boot('ahri');assert.equal(g.AHRI_DATA.patch,'16.21.1');assert.equal(g.SIMULATION.toWorld(165),330);assert.equal(g.AHRI.speed,165);assert.equal(g.AHRI.range,275);assert.equal(g.AHRI.missileSpeed,875);assert.equal(g.AHRI.q.radius,50);assert.equal(g.AHRI.q.range,450);assert.equal(g.AHRI.q.cast,.25);assert.equal(g.AHRI.damage,53);
});

test('missing or incompatible champion data uses a visible safe fallback',()=>{
 for(const options of [{noData:true},{data:{patch:'15.15.1'}},{data:{patch:'16.21.1',base:{}}}]){const {g,node}=boot('ahri',options);g.reset('lastHit');assert.equal(g.AHRI_DATA.sourceId,'built-in-fallback');assert.equal(g.player.speed,165);assert.match(node('encounterValue').textContent,/DATA FALLBACK/);}
});

test('surviving minions advance toward the opposing side and acquire another wave',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const ally=g.allies[0];ally.x=550;ally.y=300;ally.tick=0;g.setAllies([ally]);g.setFoes([]);advance(g,1);assert.ok(ally.x>550);
 const e=g.enemy(ally.x+150,300);Object.assign(e,{minion:true,minionType:'melee',wave:2,destination:ally.x+150,tick:999,hp:465,maxHp:465});g.setFoes([e]);advance(g,.1);assert.equal(ally.targetId,e.id);advance(g,3);assert.ok(e.hp<465);
});

test('CS count and kill identity remain consistent across impacts and reset',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const one=g.foes[0],two=g.foes[1];one.hp=53;two.hp=53;
 g.applyImpact(one,{sourceId:'player',sourceTeam:'player',kind:'auto',raw:53,damageType:'physical'});
 g.applyImpact(two,{sourceId:8,sourceTeam:'ally',kind:'minionMelee',raw:53,damageType:'physical'});
 assert.equal(g.stats.cs,1);assert.equal(g.stats.missed,1);assert.equal(one.death.eventId,1);assert.equal(two.death.eventId,2);
 g.reset('lastHit');g.disableSpawn();g.addWave();const fresh=g.foes[0];fresh.hp=1;g.damageEnemy(fresh,1);assert.equal(fresh.death.eventId,1);assert.equal(g.stats.cs,1);
});

test('minion retains equal-priority target but switches to a higher-priority attacker',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const a=g.allies[0],other=g.allies[1],first=g.foes[0],second=g.foes[1];
 Object.assign(a,{x:790,y:300,tick:999,targetId:first.id});Object.assign(other,{x:700,y:300,tick:999});Object.assign(first,{x:820,y:300,destination:820,tick:999,targetId:null});Object.assign(second,{x:800,y:300,destination:800,tick:999,targetId:null});g.setAllies([a,other]);g.setFoes([first,second]);
 g.update(1/120);assert.equal(a.targetId,first.id);first.targetId=null;second.targetId=other.id;a.targetRecheck=0;g.update(1/120);assert.equal(a.targetId,second.id);
});
test('caster missile survives source death and calculates bonus from health at impact',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const caster=g.allies[3],target=g.foes[0];
 Object.assign(caster,{x:700,y:300,tick:0});Object.assign(target,{x:820,y:300,destination:820,tick:999,armor:100});g.setAllies([caster]);g.setFoes([target]);
 advance(g,.27);assert.ok(g.shots.some(s=>s.kind==='allied'&&s.sourceId===caster.id));caster.alive=false;target.hp=100;advance(g,.5);
 assert.ok(Math.abs(target.hp-(100-(21+100*.035)/2))<1e-8);
});

test('mirrored first waves move together and meet around the lane centre',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const blue=g.allies[1],red=g.foes[1];const initial=Math.hypot(blue.x-red.x,blue.y-red.y);
 assert.ok(blue.x<red.x&&blue.y>red.y);advance(g,.4);assert.ok(Math.hypot(blue.x-red.x,blue.y-red.y)<initial-80);
 advance(g,1);const mx=(blue.x+red.x)/2,my=(blue.y+red.y)/2;assert.ok(Math.abs(mx-650)<35&&Math.abs(my-325)<35,`meeting ${mx}, ${my}`);assert.equal(blue.targetId,red.id);assert.equal(red.targetId,blue.id);
});

test('Dodge hides cast trajectory and countdown while retaining launched projectile',()=>{
 const {g,strokes}=boot('ahri');g.reset('dodge');g.disableSpawn();const e=foe(g,900);g.shootEnemy(e);g.render();
 assert.ok(e.pending);assert.ok(!strokes.includes('#ff80634a'));assert.ok(!strokes.includes('#ffcf87'));
 g.releaseEnemy(e);assert.equal(g.shots.length,1);assert.ok(g.shots[0].alive);
});
test('non-Dodge training modes retain their trajectory guide',()=>{
 const {g,strokes}=boot();g.reset('kite');g.disableSpawn();const e=foe(g,900);g.shootEnemy(e);g.render();assert.ok(strokes.includes('#ff80634a'));
});

test('same-step melee releases are committed on both sides before damage resolves',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const blue=g.allies[0],red=g.foes[0];
 Object.assign(blue,{x:610,y:300,hp:1,tick:0,windupLeft:.001,targetId:red.id,firstAcquired:true});
 Object.assign(red,{x:640,y:300,hp:1,tick:0,windupLeft:.001,targetId:blue.id,firstAcquired:true});
 g.setAllies([blue]);g.setFoes([red]);g.update(1/120);assert.ok(blue.deathGrace&&red.deathGrace);advance(g,.075);assert.equal(blue.alive,false);assert.equal(red.alive,false);assert.equal(g.stats.missed,1);
});
test('minion projectiles hit identical allied and enemy gameplay radii',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const blue=g.allies[0],red=g.foes[0];
 Object.assign(blue,{x:500,y:300,tick:999});Object.assign(red,{x:800,y:300,tick:999});g.setAllies([blue]);g.setFoes([red]);
 const a=g.fire(770,300,380,0,'allied',21,3,2);a.targetId=red.id;a.minionBonus=.035;
 const b=g.fire(530,300,-380,0,'enemyMinion',21,3,2);b.targetId=blue.id;b.minionBonus=.035;g.update(1/120);
 assert.equal(a.alive,false);assert.equal(b.alive,false);assert.ok(Math.abs(blue.hp-red.hp)<1e-9);
});

test('caster minions have distinct visible team-coloured staffs',()=>{
 const {g,strokes}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();g.render();assert.ok(strokes.includes('#9de4ff'));assert.ok(strokes.includes('#ffb78a'));
});

test('initial formation staggers attack readiness rather than synchronizing all three lanes',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();assert.ok(g.allies[0].firstAttackDelay<g.allies[1].firstAttackDelay);assert.ok(g.allies[1].firstAttackDelay<g.allies[2].firstAttackDelay);
 let distinct=false;for(let i=0;i<360;i++){g.update(1/120);const hp=g.foes.filter(e=>e.minionType==='melee').map(e=>e.hp);if(hp.length===3&&new Set(hp).size>1)distinct=true;}assert.ok(distinct,'initial attacks never staggered');
});

test('S stops movement and chase, cancels windup but preserves launched autos',()=>{
 const {g,key}=boot();const e=foe(g);g.moveTo(400,300);advance(g,.1);key('s');const pos=[g.player.x,g.player.y];advance(g,.1);assert.deepEqual([g.player.x,g.player.y],pos);assert.equal(g.player.target,null);
 g.attackOrder(e);advance(g,.1);assert.ok(g.player.windup>0);key('s');assert.equal(g.player.order,null);assert.equal(g.player.windup,0);advance(g,.2);assert.equal(g.stats.released,0);
 g.attackOrder(e);advance(g,.2);assert.equal(g.stats.released,1);key('s');advance(g,.5);assert.ok(e.hp<e.maxHp);assert.equal(g.stats.released,1);
});
test('S overrides a held right-click until a new right press',()=>{
 const {g,node,key,click}=boot();click(400,300);advance(g,.05);key('s');node('arena').listeners.pointermove({clientX:350,clientY:300,buttons:2});assert.equal(g.player.target,null);
 node('arena').listeners.pointermove({clientX:350,clientY:300,buttons:0});click(400,300);assert.ok(g.player.target);
});

test('CS gold credits only player last hits; missed and unresolved stay separate',()=>{
 const {g,node}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();g.setAllies([]);const melee=g.foes[0],caster=g.foes[3],alive=g.foes[4];
 g.damageEnemy(melee,9999);g.applyImpact(caster,{sourceId:-4,sourceTeam:'ally',kind:'minionProjectile',raw:9999,damageType:'true'});g.applyImpact(caster,{sourceId:'player',sourceTeam:'player',kind:'auto',raw:9999,damageType:'true'});
 assert.equal(g.stats.gold,20);assert.equal(g.stats.missedGold,14);assert.ok(alive.alive);g.end(true);assert.equal(g.stats.unresolved,4);assert.equal(g.stats.missedGold,14);assert.match(node('menuDescription').textContent,/20 gold earned · 14 gold missed/);
});

test('minion chases an acquired target around a solid wall rather than getting stuck',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const ally=g.allies[0],enemy=g.foes[0];
 Object.assign(ally,{x:620,y:585,tick:999,targetId:enemy.id,firstAcquired:true});Object.assign(enemy,{x:830,y:585,tick:999,targetId:null});g.setAllies([ally]);g.setFoes([enemy]);
 const before=Math.hypot(ally.x-enemy.x,ally.y-enemy.y);advance(g,4);assert.ok(Math.hypot(ally.x-enemy.x,ally.y-enemy.y)<before-80,`ally stuck at ${ally.x},${ally.y}`);
});
test('unopposed minion wave routes around walls and stays on walkable ground',()=>{
 const world=require('../world.js');const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const ally=g.allies[0];Object.assign(ally,{x:620,y:600,tick:999,targetId:null});g.setAllies([ally]);g.setFoes([]);
 for(let i=0;i<360;i++){g.update(1/120);assert.ok(world.pointWalkable(ally,ally.r));}
 assert.ok(ally.x>775||ally.y<540,`minion stuck at ${ally.x},${ally.y}`);
});
test('first cannon appears in wave three and both teams have correct starting health',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();g.addWave();assert.equal(g.foes.filter(e=>e.minionType==='siege').length,0);assert.equal(g.allies.filter(e=>e.minionType==='siege').length,0);
 g.addWave();const red=g.foes.filter(e=>e.minionType==='siege'),blue=g.allies.filter(e=>e.minionType==='siege');assert.equal(red.length,1);assert.equal(blue.length,1);assert.equal(red[0].hp,835);assert.equal(blue[0].hp,835);
});
test('cannon launches a tracked shot and its player last-hit credits 50 gold',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();g.addWave();g.addWave();const blue=g.allies.find(e=>e.minionType==='siege'),red=g.foes.find(e=>e.minionType==='siege');
 Object.assign(blue,{x:600,y:300,tick:0,firstAttackDelay:0});Object.assign(red,{x:700,y:300,tick:999});g.setAllies([blue]);g.setFoes([red]);advance(g,.27);assert.ok(g.shots.some(s=>s.sourceId===blue.id&&s.targetId===red.id));advance(g,.4);assert.ok(red.hp<835);g.damageEnemy(red,9999);assert.equal(g.stats.gold,50);assert.equal(g.stats.cs,1);
});
test('Ahri CS drill continues with a cannon in wave three',()=>{
 const {g}=boot('ahri');g.reset('lastHit');advance(g,60.1);assert.ok(g.foes.some(e=>e.wave===3&&e.minionType==='siege'));assert.equal(g.state,'playing');
});

test('CS arena does not display a last-hit label on low-health minions',()=>{
 const {g,texts}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();g.foes[0].hp=1;g.render();assert.ok(!texts.some(t=>/last hit/i.test(t)));
});
test('melee minions approach within contact range before committing damage',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const blue=g.allies[0],red=g.foes[0];Object.assign(blue,{x:600,y:300,tick:0,firstAttackDelay:0,targetId:red.id,firstAcquired:true});Object.assign(red,{x:655,y:300,tick:999,targetId:blue.id,firstAcquired:true});g.setAllies([blue]);g.setFoes([red]);g.update(1/120);assert.equal(red.hp,465);assert.ok(blue.x>600);advance(g,.4);assert.ok(red.hp<465);
});

test('both teams spawn cannon on waves 3, 6, 9, 12, 15 and 18',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();for(let i=0;i<20;i++)g.addWave();assert.deepEqual(Array.from(g.foes.filter(e=>e.minionType==='siege'),e=>e.wave),[3,6,9,12,15,18]);assert.deepEqual(Array.from(g.allies.filter(e=>e.minionType==='siege'),e=>e.wave),[3,6,9,12,15,18]);assert.equal(g.foes.length,126);
});
test('opening minion formation keeps rows visibly separated',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();for(const units of [g.allies,g.foes])for(const group of ['melee','caster']){const rows=units.filter(e=>e.minionType===group);assert.ok(Math.hypot(rows[0].x-rows[1].x,rows[0].y-rows[1].y)>70);}
});

test('champion has no attack timing or permanent hitbox overlays',()=>{
 const {g,texts,strokes}=boot('ahri');g.reset('kite');g.disableSpawn();const e=foe(g,800);g.attackOrder(e);advance(g,.1);g.render();
 assert.ok(g.player.windup>0);assert.ok(!texts.some(t=>['READY','WINDUP','RECOVERY'].includes(t)));assert.ok(!strokes.includes('#bcffe944'));assert.ok(!strokes.includes('#7ce8d0'));
});

test('survivors wait before opposing ingress and meet the next wave after a long push',()=>{
 for(const allySide of [true,false]){
  const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const survivor=allySide?g.allies[0]:g.foes[0];
  if(allySide){g.setAllies([survivor]);g.setFoes([]);}else{g.setAllies([]);g.setFoes([survivor]);}
  advance(g,20);const oldX=survivor.x,oldY=survivor.y;advance(g,2);assert.ok(Math.hypot(survivor.x-oldX,survivor.y-oldY)<1);
  g.addWave();if(allySide)g.setAllies([survivor]);else g.setFoes([survivor]);advance(g,.05);const enemies=allySide?g.foes:g.allies;assert.ok(enemies.some(e=>e.id===survivor.targetId),`${allySide?'blue':'red'} survivor failed to acquire wave two`);
  const victim=enemies.find(e=>e.id===survivor.targetId),hp=victim.hp;advance(g,2);assert.ok(!victim.alive||victim.hp<hp,`${allySide?'blue':'red'} survivor failed to attack wave two`);
 }
});
test('higher-priority target does not interrupt a minion attack windup',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const a=g.allies[0],ally=g.allies[1],first=g.foes[0],higher=g.foes[1];
 Object.assign(a,{x:700,y:300,tick:0,windupLeft:.1,targetId:first.id,firstAcquired:true,targetRecheck:0});Object.assign(ally,{x:650,y:300,tick:999});Object.assign(first,{x:735,y:300,tick:999,targetId:null});Object.assign(higher,{x:750,y:300,tick:999,targetId:ally.id});
 g.setAllies([a,ally]);g.setFoes([first,higher]);advance(g,.05);assert.equal(a.targetId,first.id);advance(g,.1);assert.ok(first.hp<465);first.targetId=null;higher.targetId=ally.id;a.targetRecheck=0;advance(g,.05);assert.equal(a.targetId,higher.id);
});

test('successive melee waves receive the sourced 90-second health upgrade',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();for(let i=0;i<7;i++)g.addWave();for(const [wave,hp] of [[1,465],[2,465],[3,465],[4,500],[6,500],[7,535]]){assert.ok(g.foes.filter(e=>e.wave===wave&&e.minionType==='melee').every(e=>e.maxHp===hp));assert.ok(g.allies.filter(e=>e.wave===wave&&e.minionType==='melee').every(e=>e.maxHp===hp));}
});

test('Dodge director sends single-cast visitors with deterministic Ezreal-heavy spell selection',()=>{
 function run(){const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.player.hp=g.player.maxHp=100000;advance(g,55);return [g.dodgeDirector.ezreal,g.dodgeDirector.lux,g.dodgeDirector.ahri,g.dodgeDirector.blitz,g.dodgeDirector.velkoz,g.dodgeDirector.xerath,g.dodgeDirector.xerathQ,g.dodgeDirector.oriannaQ,g.dodgeDirector.orianna,g.dodgeDirector.malphite,g.dodgeDirector.cassio,g.dodgeDirector.attempted];}
 const a=run(),b=run();assert.deepEqual(a,b);assert.equal(a.slice(0,-1).reduce((sum,n)=>sum+n,0),a.at(-1));assert.ok(a[0]>a[1]);assert.ok(a.at(-1)>=10,`too few casts: ${a}`);
});
test('Ahri Q is actually scheduled on every difficulty in the default seeded long drill',()=>{
 for(const difficulty of ['easy','normal','hard']){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:difficulty}});
  g.reset('dodge');g.player.hp=g.player.maxHp=1000000;advance(g,90);
  assert.ok(g.dodgeDirector.ahri>0,`${difficulty}: no Ahri casts`);assert.ok(g.dodgeDirector.ezreal>g.dodgeDirector.ahri,`${difficulty}: Ezreal should remain common`);
 }
});
test('Dodge visitor enters, casts only once, then exits without deleting its missile',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.player.hp=g.player.maxHp=100000;advance(g,.02);const visitor=g.foes.find(e=>e.dodgeVisitor);assert.ok(visitor);advance(g,1.1);assert.equal(g.dodgeDirector.attempted,1);assert.equal(visitor.phase,'exit');advance(g,1);assert.ok(!g.foes.includes(visitor));assert.equal(g.dodgeDirector.attempted,1);
});

test('Dodge is endless and uses separate records from timed runs',()=>{
 const {g,window}=boot('ahri'),values=new Map();window.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 g.reset('dodge');g.dodgeDirector.next=999;g.setTime(720);g.update(1/120);assert.equal(g.state,'playing');
 g.player.hp=1;g.fire(g.player.x,g.player.y,0,0,'enemy',10,5,1);g.update(1/120);assert.equal(g.state,'ended');
 assert.ok([...values.keys()].some(k=>k.includes('.endless')));
});

test('Dodge director does not grant artificial invulnerability after a hit',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.disableSpawn();g.fire(g.player.x-5,g.player.y,1,0,'enemy',10,8,1);g.fire(g.player.x+5,g.player.y,-1,0,'enemy',10,8,1);g.update(1/120);assert.equal(g.stats.hits,2);assert.equal(g.player.hp,570);assert.equal(g.player.invuln,0);
});
test('Dodge director continues past 12 minutes with bounded directed threats',()=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'normal'}});g.reset('dodge');g.player.hp=g.player.maxHp=1000000;
 for(let i=0;i<720*120+2&&g.state==='playing';i++){
  g.update(1/120);const active=g.foes.filter(e=>e.alive&&e.dodgeVisitor&&e.phase!=='exit'&&e.phase!=='orbFlight'&&e.phase!=='hookFlight').length+g.shots.filter(s=>s.alive&&s.directed).length+g.hazards.filter(h=>h.directed).length;
  assert.ok(active<=2,`directed threats exceeded cap: ${active}`);
 }
 assert.equal(g.state,'playing');assert.ok(g.dodgeDirector.attempted>100);assert.ok(g.dodgeDirector.xerathQ>0,'long session never scheduled Xerath Q');assert.ok(g.dodgeDirector.velkoz>0,'long session never scheduled Velkoz Q');assert.ok(g.dodgeDirector.orianna>0,'long session never scheduled Orianna R');assert.ok(g.dodgeDirector.malphite>0,'long session never scheduled Malphite R');assert.equal(g.dodgeDirector.attempted,g.dodgeDirector.ezreal+g.dodgeDirector.lux+g.dodgeDirector.ahri+g.dodgeDirector.blitz+g.dodgeDirector.velkoz+g.dodgeDirector.xerath+g.dodgeDirector.xerathQ+g.dodgeDirector.oriannaQ+g.dodgeDirector.orianna+g.dodgeDirector.malphite+g.dodgeDirector.cassio);
});
test('Dodge visitor uses distinct existing visual profiles and projectile colours',()=>{
 const {g,node,draws,strokes}=boot('ahri');for(const id of ['mageArt','explorerArt']){node(id).complete=true;node(id).naturalWidth=100;}
 g.drawChampion(500,300,0,false,false,0,0,'ezreal');g.drawChampion(500,300,0,false,false,0,0);assert.ok(draws.includes(node('explorerArt')));assert.ok(draws.includes(node('mageArt')));
 const e=g.fire(200,200,100,0,'enemy',10,8,1);e.spellName='EZREAL Q';const l=g.fire(250,250,100,0,'enemy',10,8,1);l.spellName='LUX Q';g.render();assert.ok(strokes.includes('#7bd9ff99'));assert.ok(strokes.includes('#ffe4a099'));
});

test('surviving minions meet later waves in front of the ingress without spawning on top of them',()=>{
 for(const allySide of [true,false]){
  const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();
  const survivor=allySide?g.allies[1]:g.foes[1];
  if(allySide){g.setAllies([survivor]);g.setFoes([]);}else{g.setAllies([]);g.setFoes([survivor]);}
  advance(g,12);g.addWave();
  const incoming=(allySide?g.foes:g.allies).filter(e=>e.wave===2);
  const front=incoming.filter(e=>e.minionType==='melee');
  assert.ok(Math.min(...front.map(e=>Math.hypot(e.x-survivor.x,e.y-survivor.y)))>130);
  if(allySide)g.setAllies([survivor]);else g.setFoes([survivor]);
  advance(g,1);assert.ok(incoming.some(e=>e.id===survivor.targetId));
  const target=incoming.find(e=>e.id===survivor.targetId);g.applyImpact(target,{sourceId:'player',sourceTeam:'player',kind:'auto',raw:9999,damageType:'true'});
  advance(g,.1);assert.notEqual(survivor.targetId,target.id);assert.ok(incoming.some(e=>e.alive&&e.id===survivor.targetId));
 }
});

test('enemy Ahri orb can hit once on each leg with true damage on its return',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.disableSpawn();g.dodgeDirector.next=999;
 const shot=g.fire(400,g.player.y,775,0,'enemyOrb',35,50,450/775);
 Object.assign(shot,{phase:'out',phaseHit:false,anchor:{x:400,y:g.player.y},casterId:-999});
 advance(g,1.5);
 assert.equal(g.stats.hits,2);assert.ok(Math.abs(g.stats.damage-(35/1.3+35))<1e-7);assert.ok(!shot.alive);
});
test('enemy Ahri return orb homes toward its still-living caster',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.disableSpawn();g.dodgeDirector.next=999;
 const caster=g.enemy(400,200);caster.referenceCaster=true;caster.shoot=999;g.setFoes([caster]);
 const shot=g.fire(400,200,775,0,'enemyOrb',35,50,450/775);
 Object.assign(shot,{phase:'out',phaseHit:false,anchor:{x:400,y:200},casterId:caster.id});
 advance(g,.6);assert.equal(shot.phase,'return');caster.y=300;advance(g,.02);
 assert.equal(shot.anchor.y,300);assert.ok(shot.vy>0);
});
test('Dodge results include the future Ahri Q return while its outgoing orb is live',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const orb=g.fire(300,200,775,0,'enemyOrb',35,50,.5);
 Object.assign(orb,{directed:true,spellName:'AHRI Q',phase:'out',phaseHit:false,anchor:{x:300,y:200},casterId:-1});
 g.end(false);assert.match(node('dodgeBreakdownText').textContent,/2 unresolved phases/);
});
test('a lethal outgoing Ahri Q hit still reports its unplayed return',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.hp=1;
 const orb=g.fire(g.player.x,g.player.y,775,0,'enemyOrb',35,50,.5);
 Object.assign(orb,{directed:true,spellName:'AHRI Q',phase:'out',phaseHit:false,anchor:{x:300,y:200},casterId:-1});
 g.update(.01);assert.equal(g.state,'ended');assert.match(node('dodgeBreakdownText').textContent,/AHRI Q: 0 avoided \/ 1 hit/);
 assert.match(node('dodgeBreakdownText').textContent,/1 unresolved phase/);
});
test('Ahri return is not counted twice once it has begun',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const orb=g.fire(300,200,775,0,'enemyOrb',35,50,.5);
 Object.assign(orb,{directed:true,spellName:'AHRI Q',phase:'return',phaseHit:false,anchor:{x:300,y:200},casterId:-1});
 g.end(false);assert.match(node('dodgeBreakdownText').textContent,/1 unresolved phase/);
});


test('Dodge visitors enter and cast with their full silhouettes inside the visible arena',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 for(const [x,y] of [[600,337],[80,90],[1120,90],[80,610],[1120,610]]){
  g.player.x=x;g.player.y=y;let spawned=0;
  for(let i=0;i<100;i++){
   g.setFoes([]);if(!g.spawnDodgeVisitor())continue;spawned++;const e=g.foes[0];
   for(const point of [e.entry,e.origin]){assert.ok(point.x>=60&&point.x<=1140);assert.ok(point.y>=145&&point.y<=645);}
  }
  assert.ok(spawned>0,`no visible entry found near ${x},${y}`);
 }
});

test('directed projectile outcomes distinguish hits, avoided threats and harmless misses',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 function shot(y){const s=g.fire(400,y,400,0,'enemy',10,8,1.2);s.directed=true;s.spellName='EZREAL Q';return s;}
 shot(g.player.y);advance(g,.6);
 shot(100);advance(g,1.3);
 shot(g.player.y);advance(g,.01);g.player.y=500;advance(g,1.3);
 const outcomes=g.dodgeDirector.outcomes['EZREAL Q'];
 assert.equal(outcomes.hit,1);assert.equal(outcomes.harmless,1);assert.equal(outcomes.avoided,1);assert.equal(g.dodged,1);
});
test('lethal directed hits are recorded before the result screen and in-flight phases remain unresolved',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.hp=1;
 const pending=g.fire(100,100,1,0,'enemy',1,1,10);pending.directed=true;pending.spellName='LUX Q';
 const lethal=g.fire(g.player.x-10,g.player.y,400,0,'enemy',10,8,1);lethal.directed=true;lethal.spellName='EZREAL Q';
 g.update(1/120);assert.equal(g.state,'ended');assert.equal(g.dodgeDirector.outcomes['EZREAL Q'].hit,1);
 assert.match(node('dodgeBreakdownText').textContent,/EZREAL Q: 0 avoided \/ 1 hit/);assert.match(node('dodgeBreakdownText').textContent,/1 unresolved phase/);
});
test('returning orb records two independent hit phases and never counts a hit as avoided',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const s=g.fire(400,g.player.y,775,0,'enemyOrb',35,50,450/775);
 Object.assign(s,{phase:'out',phaseHit:false,anchor:{x:400,y:g.player.y},casterId:-999,directed:true,spellName:'AHRI Q'});
 advance(g,1.5);assert.equal(g.dodgeDirector.outcomes['AHRI Q'].hit,2);assert.equal(g.dodgeDirector.outcomes['AHRI Q'].avoided,0);
});

test('ambient Xerath W has a readable delay, center damage and no caster entity',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 assert.equal(g.spawnXerathW(),true);assert.equal(g.foes.length,0);assert.equal(g.dodgeDirector.xerath,1);
 const h=g.hazards[0];g.player.x=h.x;g.player.y=h.y;
 advance(g,.7);assert.equal(g.stats.hits,0);advance(g,.1);
 assert.equal(g.stats.hits,1);assert.ok(Math.abs(g.stats.damage-(50*1.667/1.3))<1e-7);
 assert.equal(g.dodgeDirector.outcomes['XERATH W'].hit,1);
});
test('Xerath W can be escaped and rejects an unsupported directed encounter',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const shot=g.fire(100,100,1,0,'enemy',1,1,10);shot.directed=true;
 assert.equal(g.spawnXerathW(),false);shot.alive=false;
 assert.equal(g.spawnXerathW(),true);assert.equal(g.spawnDodgeVisitor(),false);
 const h=g.hazards[0],dx=g.player.x-h.x,dy=g.player.y-h.y,d=Math.hypot(dx,dy);
 g.moveTo(g.player.x+dx/d*120,g.player.y+dy/d*120);advance(g,.8);
 assert.equal(g.stats.hits,0);assert.equal(g.dodgeDirector.outcomes['XERATH W'].avoided,1);
});
test('Xerath W and an in-flight Ezreal Q have a shared walkable escape',()=>{
 for(const difficulty of ['normal','hard']){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:difficulty}});g.reset('dodge');g.dodgeDirector.next=999;
  const shot=g.fire(10,g.player.y,1000,0,'enemy',10,30,.6);Object.assign(shot,{directed:true,spellName:'EZREAL Q'});
  const witness={};assert.equal(g.spawnXerathW(witness),true,difficulty);
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1);assert.equal(g.stats.hits,0,difficulty);
  assert.equal(g.dodgeDirector.outcomes['XERATH W'].avoided,1,difficulty);
 }
});
test('the seeded director naturally schedules an Ezreal Q and Xerath W combination',()=>{
 let combinations=0;
 for(let seedOffset=0;seedOffset<30;seedOffset++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});for(let i=0;i<seedOffset;i++)node('newSeed').listeners.click();
  g.reset('dodge');g.setTime(50);g.dodgeDirector.next=999;const spell=g.REFERENCE_SPELLS.ezrealDodge,e=g.enemy(130,g.player.y);
  Object.assign(e,{dodgeVisitor:true,phase:'enter',spell,origin:{x:e.x,y:e.y},entry:{x:80,y:e.y},speed:120});g.setFoes([e]);
  g.update(1/120);const h=g.hazards.find(h=>h.xerath);if(!h)continue;combinations++;
  assert.equal(e.phase,'cast');assert.equal(e.pending.spell,spell);assert.ok(h.ttl>0,`seed offset ${seedOffset}`);
 }
 assert.ok(combinations>0,'no director-generated combinations');
});
test('normal gameplay reaches the mixed encounter across seeded sessions',()=>{
 let sessionsWithOverlap=0;
 for(let seedOffset=0;seedOffset<5;seedOffset++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});for(let i=0;i<seedOffset;i++)node('newSeed').listeners.click();
  g.reset('dodge');g.player.hp=g.player.maxHp=1000000;let found=false;
  while(g.time<179&&!found){g.update(1/120);found=g.hazards.some(h=>h.xerath)&&(g.foes.some(e=>e.alive&&e.dodgeVisitor&&e.phase==='cast'&&e.spell===g.REFERENCE_SPELLS.ezrealDodge)||g.shots.some(s=>s.alive&&s.spellName==='EZREAL Q'));}
  if(found)sessionsWithOverlap++;
 }
 assert.ok(sessionsWithOverlap>0,'no natural mixed encounters in five seeded sessions');
});
test('a seeded Lux follow-up permits ordinary movement to avoid both casts',()=>{
 let checked=false;
 for(let seedOffset=0;seedOffset<40&&!checked;seedOffset++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});for(let i=0;i<seedOffset;i++)node('newSeed').listeners.click();
  g.reset('dodge');g.setTime(50);g.dodgeDirector.next=999;g.player.hp=g.player.maxHp=100000;
  const spell=g.REFERENCE_SPELLS.ezrealDodge,e=g.enemy(130,g.player.y),first={};assert.ok(g.canEvadeDodgeCast(e,spell,first));
  Object.assign(e,{dodgeVisitor:true,phase:'enter',spell,origin:{x:e.x,y:e.y},entry:{x:80,y:e.y},speed:120});g.setFoes([e]);g.update(1/120);
  const follow=g.foes.find(x=>x.followUp&&x.spell===g.REFERENCE_SPELLS.luxDodge);if(!follow)continue;checked=true;
  assert.equal(follow.spell,g.REFERENCE_SPELLS.luxDodge);advance(g,.2-1/120);g.moveTo(first.destination.x,first.destination.y);
  for(let i=0;i<180&&follow.phase==='enter';i++)g.update(1/120);
  assert.equal(follow.phase,'cast');assert.equal(g.stats.hits,0);
  const second={};assert.ok(g.canEvadeDodgeCast(follow,follow.spell,second));advance(g,.2);g.moveTo(second.destination.x,second.destination.y);advance(g,1.5);
  assert.equal(g.stats.hits,0);assert.equal(g.dodgeDirector.ezreal,1);assert.equal(g.dodgeDirector.lux,1);
 }
 assert.ok(checked,'no seeded follow-up spawned');
});
test('Lux follow-ups occur in natural Expert sessions but not Foundation',()=>{
 for(const [difficulty,expected] of [['easy',false],['hard',true]]){
  let found=false;
  for(let seedOffset=0;seedOffset<5&&!found;seedOffset++){
   const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:difficulty}});for(let i=0;i<seedOffset;i++)node('newSeed').listeners.click();
   g.reset('dodge');g.player.hp=g.player.maxHp=1000000;
   while(g.time<179&&!found){g.update(1/120);found=g.foes.some(e=>e.alive&&e.followUp&&e.phase==='cast'&&e.spell===g.REFERENCE_SPELLS.luxDodge);}
  }
  assert.equal(found,expected,difficulty);
 }
});
test('Xerath W rejects unsafe or unsupported overlaps and respects Foundation cap',()=>{
 for(const scenario of ['imminent','foundation','orb','split','cap','unknownCast','charmedCast']){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:scenario==='foundation'?'easy':'hard'}});g.reset('dodge');g.dodgeDirector.next=999;
  const s=g.fire(scenario==='imminent'?g.player.x-70:10,g.player.y,1000,0,scenario==='orb'?'enemyOrb':'enemy',10,30,.6);Object.assign(s,{directed:true,spellName:scenario==='orb'?'AHRI Q':'EZREAL Q'});
  if(scenario==='split')s.velkoz='main';if(scenario==='cap')for(let i=0;i<4;i++){const extra=g.fire(10,100+i*30,1000,0,'enemy',10,30,.6);extra.directed=true;extra.spellName='EZREAL Q';}
  if(scenario==='unknownCast'){const e=g.enemy(200,200);Object.assign(e,{dodgeVisitor:true,phase:'cast'});g.setFoes([e]);}
  if(scenario==='charmedCast'){const e=g.enemy(200,200);Object.assign(e,{dodgeVisitor:true,phase:'cast',charm:1,charge:.25,pending:{spell:g.REFERENCE_SPELLS.ezrealDodge,angle:0}});g.setFoes([e]);}
  assert.equal(g.spawnXerathW(),false,scenario);assert.equal(g.hazards.length,0,scenario);
 }
});
test('Xerath W uses center based edge and outside hits use base damage',()=>{
 for(const [offset,expected] of [[62.5,50*1.667/1.3],[62.6,50/1.3],[137.5,50/1.3],[137.6,0]]){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;assert.ok(g.spawnXerathW());const h=g.hazards[0];
  g.player.x=h.x+offset;g.player.y=h.y;advance(g,.8);assert.ok(Math.abs(g.stats.damage-expected)<1e-7,`offset ${offset}`);
 }
});


test('Blitz Q visitor commits one hook, waits for its flight and does not stun or pull',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const e=g.enemy(300,g.player.y);Object.assign(e,{dodgeVisitor:true,spell:g.REFERENCE_SPELLS.blitzDodge,phase:'cast',charge:.001,pending:{angle:0,spell:g.REFERENCE_SPELLS.blitzDodge},entry:{x:250,y:g.player.y},speed:120});g.setFoes([e]);
 g.update(1/120);assert.equal(e.phase,'hookFlight');assert.equal(g.dodgeDirector.blitz,1);assert.equal(g.shots[0].spellName,'BLITZ Q');
 const start={x:g.player.x,y:g.player.y};advance(g,.1);assert.equal(e.phase,'hookFlight');advance(g,.4);
 assert.equal(g.stats.hits,1);assert.ok(Math.abs(g.stats.damage-(110/1.3))<1e-7);assert.equal(g.player.root,0);assert.equal(g.player.x,start.x);assert.equal(g.player.y,start.y);assert.equal(g.dodgeDirector.outcomes['BLITZ Q'].hit,1);
});
test('Blitz hook expires at its configured range and retains first collision swept detection',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const s=g.fire(100,g.player.y,900,0,'enemy',110/1.3,35,510/900);Object.assign(s,{directed:true,spellName:'BLITZ Q'});
 g.update(.5);assert.equal(g.stats.hits,1);assert.equal(s.alive,false);
 g.reset('dodge');g.dodgeDirector.next=999;g.player.x=1000;const short=g.fire(100,g.player.y,900,0,'enemy',1,35,510/900);short.directed=true;short.spellName='BLITZ Q';advance(g,.7);assert.equal(g.stats.hits,0);assert.equal(g.dodgeDirector.outcomes['BLITZ Q'].harmless,1);
});


test('director rejects a point-blank cast and accepts a walkable long-range sidestep',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const spell=g.REFERENCE_SPELLS.ezrealDodge;
 assert.equal(g.canEvadeDodgeCast({x:g.player.x-250,y:g.player.y},spell),false);
 assert.equal(g.canEvadeDodgeCast({x:g.player.x-460,y:g.player.y},spell),true);
});
test('director accounts for spell cast locks and defers threats during a dash',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const spell=g.REFERENCE_SPELLS.ezrealDodge,origin={x:g.player.x-460,y:g.player.y};
 assert.equal(g.canEvadeDodgeCast(origin,spell),true);
 g.player.casting={kind:'charm',angle:0,remaining:.25};assert.equal(g.canEvadeDodgeCast(origin,spell),false);
 g.player.casting.remaining=.1;assert.equal(g.canEvadeDodgeCast(origin,spell),true);
 g.player.casting=null;g.player.dashing={x:800,y:337.5};
 assert.equal(g.canEvadeDodgeCast(origin,spell),false);assert.equal(g.canEvadeVelkoz(origin,0,400,g.REFERENCE_SPELLS.velkozDodge),false);
 assert.equal(g.spawnXerathW(),false);assert.equal(g.spawnXerathQ(),false);assert.equal(g.spawnOriannaR(),false);assert.equal(g.aimMalphiteR(origin),null);
 g.player.dashing=null;g.player.root=2;assert.equal(g.canEvadeDodgeCast(origin,spell),false);assert.equal(g.spawnXerathW(),false);assert.equal(g.spawnXerathQ(),false);
});
test('a sampled escape remains safe when a committed Ahri spell delays movement',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const origin={x:200,y:g.player.y},spell=g.REFERENCE_SPELLS.luxDodge,witness={};g.player.casting={kind:'charm',angle:Math.PI/2,remaining:.25};
 assert.ok(g.canEvadeDodgeCast(origin,spell,witness));
 const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell,phase:'cast',entry:{...origin},speed:120,charge:spell.cast,pending:{angle:0,spell}});g.setFoes([e]);
 advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.5);assert.equal(g.stats.hits,0);
});
test('straight-shot safety checks reject targets beyond projectile reach including hitboxes',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.x=900;g.player.y=337.5;
 const spell=g.REFERENCE_SPELLS.ezrealDodge,reach=spell.range+spell.radius+g.player.hitRadius;
 assert.equal(g.canEvadeDodgeCast({x:g.player.x-reach+1,y:g.player.y},spell),true);
 assert.equal(g.canEvadeDodgeCast({x:g.player.x-reach-1,y:g.player.y},spell),false);
});
test('a visitor cancels its uncommitted cast when its target moves out of reach',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.x=1000;g.player.y=337.5;
 const e=g.enemy(250,337.5);Object.assign(e,{dodgeVisitor:true,spell:g.REFERENCE_SPELLS.ezrealDodge,phase:'enter',origin:{x:e.x,y:e.y},entry:{x:e.x-50,y:e.y},speed:120});g.setFoes([e]);
 advance(g,.05);assert.equal(e.phase,'exit');assert.equal(g.dodgeDirector.attempted,0);assert.equal(g.shots.length,0);
});
test('dodging a locked straight shot during its cast counts as an avoidance',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const e=g.enemy(100,337.5);Object.assign(e,{dodgeVisitor:true,spell:g.REFERENCE_SPELLS.ezrealDodge,phase:'enter',origin:{x:e.x,y:e.y},entry:{x:50,y:e.y},speed:120});g.setFoes([e]);
 advance(g,.025);assert.equal(e.phase,'cast');g.player.y=500;advance(g,1.5);
 assert.equal(g.stats.hits,0);assert.equal(g.dodged,1);assert.equal(g.dodgeDirector.outcomes['EZREAL Q'].avoided,1);
});
test('visitor abandons a cast if the player closes distance during its entry',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const e=g.enemy(400,300);Object.assign(e,{dodgeVisitor:true,spell:g.REFERENCE_SPELLS.ezrealDodge,phase:'enter',origin:{x:400,y:300},entry:{x:350,y:300},speed:120});g.setFoes([e]);
 g.player.x=500;g.player.y=300;g.update(1/120);assert.equal(e.phase,'exit');assert.equal(g.dodgeDirector.attempted,0);assert.equal(g.shots.length,0);
});

test('accepted isolated Ezreal shot can be dodged after a 200ms delay by ordinary movement',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const e=g.enemy(140,g.player.y);Object.assign(e,{dodgeVisitor:true,spell:g.REFERENCE_SPELLS.ezrealDodge,phase:'enter',origin:{x:e.x,y:e.y},entry:{x:e.x,y:e.y},speed:120});g.setFoes([e]);
 g.update(1/120);assert.equal(e.phase,'cast');advance(g,.2);g.moveTo(g.player.x,g.player.y+100);advance(g,.8);
 assert.equal(g.stats.hits,0);assert.equal(g.dodgeDirector.outcomes['EZREAL Q'].avoided,1);
});


test('new directed cast rejects crossing threats that block both sidesteps',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const origin={x:140,y:g.player.y},spell=g.REFERENCE_SPELLS.ezrealDodge;
 assert.equal(g.canEvadeDodgeCast(origin,spell),true);
 const a=g.fire(g.player.x,g.player.y+80,0,.01,'enemy',10,30,2);a.directed=true;
 assert.equal(g.canEvadeDodgeCast(origin,spell),true,'other sidestep remains open');
 const b=g.fire(g.player.x,g.player.y-80,0,-.01,'enemy',10,30,2);b.directed=true;
 assert.equal(g.canEvadeDodgeCast(origin,spell),false,'both paths are obstructed');
});
test('new directed cast defers an orb with unknown phase and anchor',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const shot=g.fire(200,200,100,0,'enemyOrb',10,20,2);shot.directed=true;
 assert.equal(g.canEvadeDodgeCast({x:140,y:g.player.y},g.REFERENCE_SPELLS.ezrealDodge),false);
 shot.alive=false;assert.equal(g.canEvadeDodgeCast({x:140,y:g.player.y},g.REFERENCE_SPELLS.ezrealDodge),true);
});
test('Ezreal overlap with an existing Ahri orb defers if its caster can move',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const e=g.enemy(300,400),s=g.fire(400,400,775,0,'enemyOrb',35,50,.3);
 Object.assign(e,{dodgeVisitor:true,phase:'orbFlight',charm:.5,orbShot:s});Object.assign(s,{directed:true,spellName:'AHRI Q',phase:'out',anchor:{x:e.x,y:e.y},casterId:e.id});g.setFoes([e]);
 assert.equal(g.canEvadeDodgeCast({x:140,y:g.player.y},g.REFERENCE_SPELLS.ezrealDodge),false);
});
test('Ahri orb overlaps reject imminent hits and unsupported companion spells',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const p=g.player;
 const e=g.enemy(300,p.y),s=g.fire(p.x-70,p.y,775,0,'enemyOrb',35,50,.3);
 Object.assign(e,{dodgeVisitor:true,phase:'orbFlight',charm:0,orbShot:s});Object.assign(s,{directed:true,spellName:'AHRI Q',phase:'out',anchor:{x:e.x,y:e.y},casterId:e.id});g.setFoes([e]);
 assert.equal(g.canEvadeDodgeCast({x:140,y:p.y},g.REFERENCE_SPELLS.ezrealDodge),false);
 s.x=350;s.y=p.y+150;assert.equal(g.canEvadeDodgeCast({x:140,y:p.y},g.REFERENCE_SPELLS.luxDodge),false);
});
test('Ezreal walking witnesses clear an existing Ahri orb and its return',()=>{
 const counts={out:0,return:0};
 for(const phase of ['out','return'])for(const side of [-1,1])for(let i=0;i<16;i++){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.cassAt=Infinity;g.dodgeDirector.rareAt=Infinity;g.dodgeDirector.malAt=Infinity;
  const p=g.player,y=p.y+side*70,caster=g.enemy(300,y),s=g.fire(phase==='out'?350:850,y,phase==='out'?775:-700,0,'enemyOrb',35,50,phase==='out'?.4:2);
  Object.assign(caster,{dodgeVisitor:true,phase:'orbFlight',charm:0,orbShot:s,entry:{x:300,y},speed:120,hp:10000,maxHp:10000});
  Object.assign(s,{directed:true,spellName:'AHRI Q',phase,phaseHit:false,anchor:{x:300,y},casterId:caster.id});g.setFoes([caster]);
  const a=i*Math.PI/8,origin={x:p.x+Math.cos(a)*450,y:p.y+Math.sin(a)*450},spec=g.REFERENCE_SPELLS.ezrealDodge,witness={};
  if(!g.canEvadeDodgeCast(origin,spec,witness))continue;
  const enemy=g.enemy(origin.x,origin.y);Object.assign(enemy,{dodgeVisitor:true,spell:spec,phase:'cast',charge:spec.cast,pending:{angle:Math.atan2(p.y-origin.y,p.x-origin.x),spell:spec,threat:true},entry:{...origin}});g.setFoes([caster,enemy]);
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,2);
  assert.equal(g.stats.hits,0,`${phase} side ${side} angle ${i}`);counts[phase]++;
 }
 assert.ok(counts.out>0&&counts.return>0,JSON.stringify(counts));
});
test('Expert Lux and Blitz witnesses clear both phases of an existing Ahri orb',()=>{
 const counts={};
 for(const key of ['luxDodge','blitzDodge'])for(const phase of ['out','return']){
  let accepted=0;
  for(const side of [-1,1])for(let i=0;i<16;i++){
   const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.cassAt=g.dodgeDirector.rareAt=g.dodgeDirector.malAt=Infinity;
   const p=g.player,y=p.y+side*70,caster=g.enemy(300,y),s=g.fire(phase==='out'?350:850,y,phase==='out'?775:-700,0,'enemyOrb',35,50,phase==='out'?.4:2);
   Object.assign(caster,{dodgeVisitor:true,phase:'orbFlight',spell:g.REFERENCE_SPELLS.ahriDodge,charm:0,orbShot:s,entry:{x:300,y},speed:120,hp:10000,maxHp:10000});
   Object.assign(s,{directed:true,spellName:'AHRI Q',phase,phaseHit:false,anchor:{x:300,y},casterId:caster.id});g.setFoes([caster]);
   const a=i*Math.PI/8,origin={x:p.x+Math.cos(a)*450,y:p.y+Math.sin(a)*450},spell=g.REFERENCE_SPELLS[key],witness={};
   if(!g.canEvadeDodgeCast(origin,spell,witness))continue;
   const enemy=g.enemy(origin.x,origin.y);Object.assign(enemy,{dodgeVisitor:true,spell,phase:'cast',charge:spell.cast,pending:{angle:Math.atan2(p.y-origin.y,p.x-origin.x),spell,threat:true},entry:{...origin}});g.setFoes([caster,enemy]);
   advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,2);
   assert.equal(g.stats.hits,0,`${key} ${phase} ${side} ${i}`);accepted++;
  }
  counts[`${key}-${phase}`]=accepted;assert.ok(accepted>0,JSON.stringify(counts));
 }
});
test('Expert naturally fires Lux and Blitz while an Ahri orb is active',()=>{
 for(const name of ['LUX Q','BLITZ Q']){
  let found=false;
  for(let seed=1;seed<=8&&!found;seed++){
   const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(seed*1234567);g.player.hp=g.player.maxHp=1e6;
   for(let i=0;i<120*180&&!found;i++){
    g.update(1/120);found=g.shots.some(s=>s.alive&&s.kind==='enemyOrb')&&g.shots.some(s=>s.alive&&s.spellName===name);
   }
  }
  assert.ok(found,`no Ahri + ${name} projectile overlap found`);
 }
});
test('Ahri orb and Ezreal shared escapes survive existing movement and W decay',()=>{
 const counts={out:0,return:0,boosted:0};
 for(const phase of ['out','return'])for(const side of [-1,1])for(const boosted of [false,true])for(let i=0;i<16;i++){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.cassAt=Infinity;g.dodgeDirector.rareAt=Infinity;g.dodgeDirector.malAt=Infinity;
  const p=g.player,y=p.y+side*70,caster=g.enemy(300,y),s=g.fire(phase==='out'?350:850,y,phase==='out'?775:-700,0,'enemyOrb',35,50,phase==='out'?.4:2);
  Object.assign(caster,{dodgeVisitor:true,phase:'orbFlight',charm:0,orbShot:s,entry:{x:300,y},speed:120,hp:10000,maxHp:10000});
  Object.assign(s,{directed:true,spellName:'AHRI Q',phase,phaseHit:false,anchor:{x:300,y},casterId:caster.id});g.setFoes([caster]);
  g.moveTo(p.x+(i%2?80:-80),p.y-side*100);if(boosted)g.cast('w');
  const a=i*Math.PI/8,origin={x:p.x+Math.cos(a)*450,y:p.y+Math.sin(a)*450},spec=g.REFERENCE_SPELLS.ezrealDodge,witness={};
  if(!g.canEvadeDodgeCast(origin,spec,witness))continue;
  const enemy=g.enemy(origin.x,origin.y);Object.assign(enemy,{dodgeVisitor:true,spell:spec,phase:'cast',charge:spec.cast,pending:{angle:Math.atan2(p.y-origin.y,p.x-origin.x),spell:spec,threat:true},entry:{...origin}});g.setFoes([caster,enemy]);
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,2);
  assert.equal(g.stats.hits,0,`${phase}, side ${side}, boosted ${boosted}, angle ${i}`);counts[phase]++;if(boosted)counts.boosted++;
 }
 assert.ok(counts.out>0&&counts.return>0&&counts.boosted>0,JSON.stringify(counts));
});
test('Expert naturally schedules Ezreal pressure while an Ahri orb is active',()=>{
 let found=false;
 for(let seed=0;seed<5&&!found;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});for(let i=0;i<seed;i++)node('newSeed').listeners.click();g.reset('dodge');g.player.hp=g.player.maxHp=1e6;
  while(g.time<120&&!found){g.update(1/120);found=g.shots.some(s=>s.alive&&s.kind==='enemyOrb')&&(g.foes.some(e=>e.alive&&e.dodgeVisitor&&e.spell===g.REFERENCE_SPELLS.ezrealDodge&&e.phase==='cast')||g.shots.some(s=>s.alive&&s.spellName==='EZREAL Q'));}
 }
 assert.ok(found,'no natural Ahri orb + Ezreal overlap');
});
test('a straight-shot visitor joining an Ahri orb still enters visibly before casting',()=>{
 let spawned=0;
 for(let seed=1;seed<=40;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setTime(10);g.setRng(seed*2654435761>>>0);
  const p=g.player,y=p.y+150,caster=g.enemy(300,y),orb=g.fire(350,y,775,0,'enemyOrb',35,50,.4);
  Object.assign(caster,{dodgeVisitor:true,spell:g.REFERENCE_SPELLS.ahriDodge,phase:'orbFlight',charm:0,orbShot:orb,entry:{x:300,y}});Object.assign(orb,{directed:true,spellName:'AHRI Q',phase:'out',phaseHit:false,anchor:{x:300,y},casterId:caster.id});g.setFoes([caster]);
  if(!g.spawnDodgeVisitor())continue;const visitor=g.foes.find(e=>e!==caster);if(!visitor)continue;
  assert.ok([g.REFERENCE_SPELLS.ezrealDodge,g.REFERENCE_SPELLS.luxDodge,g.REFERENCE_SPELLS.blitzDodge].includes(visitor.spell));assert.equal(visitor.phase,'enter');
  assert.ok(Math.abs(Math.hypot(visitor.entry.x-visitor.origin.x,visitor.entry.y-visitor.origin.y)-35)<1e-6);spawned++;
 }
 assert.ok(spawned>0,'no overlap entry sampled');
});

test('escape forecast considers an enemy cast that has already locked its aim',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const origin={x:140,y:g.player.y},spell=g.REFERENCE_SPELLS.ezrealDodge;
 const a=g.fire(g.player.x,g.player.y+80,0,.01,'enemy',10,30,2);a.directed=true;
 const pending=g.enemy(g.player.x,g.player.y-80),spec={speed:.01,range:.02,radius:30};
 Object.assign(pending,{dodgeVisitor:true,phase:'cast',charge:0,pending:{angle:-Math.PI/2,spell:spec}});g.setFoes([pending]);
 assert.equal(g.canEvadeDodgeCast(origin,spell),false);
 pending.pending=null;assert.equal(g.canEvadeDodgeCast(origin,spell),true);
});

test('ambient Xerath Q resolves after its cue with no on-screen caster',()=>{
 const {g,strokes}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 assert.ok(g.spawnXerathQ());assert.equal(g.foes.length,0);assert.equal(g.dodgeDirector.xerathQ,1);
 const h=g.hazards[0];g.render();assert.ok(!strokes.includes('#b5e5ff'),'beam leaked its exact line before firing');
 advance(g,.5);assert.equal(g.stats.hits,0);advance(g,.05);
 assert.equal(g.stats.hits,1);assert.ok(Math.abs(g.stats.damage-(70/1.3))<1e-7);assert.equal(g.dodgeDirector.outcomes['XERATH Q'].hit,1);
 g.render();assert.ok(strokes.includes('#b5e5ff'),'impact beam was not rendered');
});
test('Xerath Q has a walkable sidestep after the training reaction delay and no overlap',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;assert.ok(g.spawnXerathQ());
 assert.equal(g.spawnDodgeVisitor(),false);assert.equal(g.spawnXerathW(),false);
 const h=g.hazards[0],dx=h.endX-h.x,dy=h.endY-h.y,len=Math.hypot(dx,dy);
 advance(g,.2);g.moveTo(g.player.x+dy/len*90,g.player.y-dx/len*90);advance(g,.4);
 assert.equal(g.stats.hits,0);assert.equal(g.dodgeDirector.outcomes['XERATH Q'].avoided,1);
});
test('Xerath Q uses the projectile-width and champion hitbox at its beam boundary',()=>{
 for(const [offset,hit] of [[68.7,true],[68.8,false]]){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;assert.ok(g.spawnXerathQ());const h=g.hazards[0];
  const dx=h.endX-h.x,dy=h.endY-h.y,d=Math.hypot(dx,dy);g.player.x=h.x+dx/d*350+dy/d*offset;g.player.y=h.y+dy/d*350-dx/d*offset;
  advance(g,.55);assert.equal(g.stats.hits,hit?1:0,`offset ${offset}`);
 }
});


test('Xerath beam uses a flat-ended rectangle against the champion circle',()=>{
 const {g}=boot('ahri');const beam={x:100,y:100,endX:200,endY:100,r:10};
 for(const [x,y,expected] of [[150,115,true],[150,115.1,false],[96,113,true],[96,114,false],[204,113,true],[204,114,false],[94.9,100,false],[205.1,100,false]]){
  assert.equal(g.beamTouchesPlayer(beam,{x,y},5),expected,`${x},${y}`);
 }
 const rotated={x:100,y:100,endX:100,endY:200,r:10};assert.equal(g.beamTouchesPlayer(rotated,{x:114,y:96},5),false);assert.equal(g.beamTouchesPlayer(rotated,{x:113,y:96},5),true);
});


test('Velkoz Q splits into two perpendicular faster bolts after a short delay',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.y=550;
 const e=g.enemy(300,200),spec=g.REFERENCE_SPELLS.velkozDodge;Object.assign(e,{dodgeVisitor:true,pending:{angle:0,spell:spec}});g.releaseEnemy(e);
 const main=g.shots[0];assert.equal(main.velkoz,'main');assert.equal(g.dodgeDirector.velkoz,1);
 advance(g,1);const children=g.shots.filter(s=>s.velkoz==='child');assert.equal(children.length,2);
 assert.ok(children.every(s=>Math.abs(s.vx)<1e-9&&Math.abs(Math.abs(s.vy)-1050)<1e-9));assert.ok(children[0].vy*children[1].vy<0);assert.equal(g.spawnDodgeVisitor(),false);
});
test('Velkoz main-bolt hit cannot damage the same champion again with its split',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const e=g.enemy(400,g.player.y),spec=g.REFERENCE_SPELLS.velkozDodge;Object.assign(e,{dodgeVisitor:true,pending:{angle:0,spell:spec}});g.releaseEnemy(e);advance(g,1);
 assert.equal(g.stats.hits,1);assert.equal(g.player.root,0);assert.ok(Math.abs(g.stats.damage-(80/1.3))<1e-7);
});


test('Velkoz angled split can threaten the player outside the main bolt path',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const e=g.enemy(300,g.player.y),spec=g.REFERENCE_SPELLS.velkozDodge;Object.assign(e,{dodgeVisitor:true,pending:{angle:.32,spell:spec,splitDistance:300*Math.cos(.32)}});g.releaseEnemy(e);advance(g,1);
 assert.equal(g.stats.hits,1);assert.ok(Math.abs(g.stats.damage-(80/1.3))<1e-7);
});


test('Velkoz split branches cannot both hit the same champion',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const e=g.enemy(300,200),spec=g.REFERENCE_SPELLS.velkozDodge;Object.assign(e,{dodgeVisitor:true,pending:{angle:0,spell:spec,splitDistance:200}});g.releaseEnemy(e);
 advance(g,.4);const main=g.shots.find(s=>s.velkoz==='delay');assert.ok(main);g.player.x=main.x;g.player.y=main.y;advance(g,.4);assert.equal(g.stats.hits,1);
});


test('Velkoz split forecast checks both perpendicular branches and terrain routes',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const origin={x:160,y:g.player.y},spec=g.REFERENCE_SPELLS.velkozDodge;
 assert.equal(g.canEvadeVelkoz(origin,.32,440*Math.cos(.32),spec),true);
});
test('entering Velkoz reserves its encounter until cast or cancellation',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const e=g.enemy(200,300);Object.assign(e,{dodgeVisitor:true,phase:'enter',spell:g.REFERENCE_SPELLS.velkozDodge});g.setFoes([e]);
 assert.equal(g.spawnDodgeVisitor(),false);
});
test('Expert forecasts a committed Velkoz split alongside new straight shots',()=>{
 for(const key of ['ezrealDodge','luxDodge','blitzDodge']){
  let accepted=0;
  for(const side of [-1,1])for(let i=0;i<16;i++){
   const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;
   const p=g.player,y=p.y+side*70,spec=g.REFERENCE_SPELLS.velkozDodge,caster=g.enemy(350,y);
   Object.assign(caster,{dodgeVisitor:true,spell:spec,phase:'cast',charge:.25,entry:{x:350,y},speed:120,pending:{angle:0,spell:spec,splitDistance:260}});g.setFoes([caster]);
   const a=i*Math.PI/8,origin={x:p.x+Math.cos(a)*450,y:p.y+Math.sin(a)*450},spell=g.REFERENCE_SPELLS[key],witness={};
   if(!g.canEvadeDodgeCast(origin,spell,witness))continue;
   const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell,phase:'cast',charge:spell.cast,entry:{...origin},pending:{angle:Math.atan2(p.y-origin.y,p.x-origin.x),spell,threat:true}});g.setFoes([caster,e]);
   advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);
   for(let step=0;step<240;step++){g.update(1/120);g.dodgeDirector.splitFollow=false;}
   assert.equal(g.stats.hits,0,`${key} ${side} ${i} ${JSON.stringify(g.dodgeDirector.outcomes)}`);accepted++;
  }
  assert.ok(accepted>0,`no shared ${key} response`);
 }
});
test('committed Velkoz forecast defers unpredictable split trajectories',()=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;
 const spec=g.REFERENCE_SPELLS.velkozDodge,e=g.enemy(1100,300);Object.assign(e,{dodgeVisitor:true,spell:spec,phase:'cast',charge:.25,pending:{angle:0,spell:spec,splitDistance:300}});g.setFoes([e]);
 assert.equal(g.canEvadeDodgeCast({x:140,y:g.player.y},g.REFERENCE_SPELLS.ezrealDodge),false);
});
test('Expert can introduce a separate visitor during a committed Velkoz cast',()=>{
 let accepted=0;
 for(let seed=1;seed<=32;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;g.setRng(seed*1234567);
  const p=g.player,spec=g.REFERENCE_SPELLS.velkozDodge,e=g.enemy(350,p.y+70);
  Object.assign(e,{dodgeVisitor:true,spell:spec,phase:'cast',charge:.25,entry:{x:e.x,y:e.y},pending:{angle:0,spell:spec,splitDistance:260}});g.setFoes([e]);
  if(g.spawnDodgeVisitor()){const next=g.foes.find(f=>f!==e);assert.ok(next);assert.notEqual(next.spell.name,'VELKOZ Q');accepted++;}
 }
 assert.ok(accepted>0,'no follow-up visitor entered');
});


test('a sampled Velkoz escape survives the actual split after 200ms reaction',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const origin={x:160,y:g.player.y},spec=g.REFERENCE_SPELLS.velkozDodge,angle=.32,distance=440*Math.cos(.32),witness={};
 assert.ok(g.canEvadeVelkoz(origin,angle,distance,spec,witness));
 const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell:spec,phase:'cast',entry:{x:origin.x,y:origin.y},speed:120,charge:spec.cast,pending:{angle,spell:spec,splitDistance:distance}});g.setFoes([e]);
 advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.7);assert.equal(g.stats.hits,0);
});
test('Expert Velkoz and an existing straight projectile share an executable escape',()=>{
 let checked=0;
 for(const side of [-1,1])for(let i=0;i<16;i++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;
  const p=g.player,s=g.fire(150,p.y+side*125,500,0,'enemy',20,20,2);Object.assign(s,{directed:true,spellName:'EZREAL Q'});
  const a=i*Math.PI/8,origin={x:p.x+Math.cos(a)*440,y:p.y+Math.sin(a)*440},spec=g.REFERENCE_SPELLS.velkozDodge,angle=Math.atan2(p.y-origin.y,p.x-origin.x)+.32,distance=440*Math.cos(.32),witness={};
  if(origin.x<60||origin.x>1140||origin.y<145||origin.y>645)continue;
  if(!g.canEvadeVelkoz(origin,angle,distance,spec,witness))continue;
  const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell:spec,phase:'cast',entry:{...origin},speed:120,charge:spec.cast,pending:{angle,spell:spec,splitDistance:distance}});g.setFoes([e]);
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,2);assert.equal(g.stats.hits,0,`side ${side} angle ${i}`);checked++;
 }
 assert.ok(checked>0,'no executable shared escape was sampled');
});
test('Expert can commit Velkoz while a prior straight missile remains active',()=>{
 let committed=0;
 for(let seed=1;seed<=24;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;g.setRng(seed*1234567);
  const s=g.fire(100,100,1,0,'enemy',10,1,5);Object.assign(s,{directed:true,spellName:'EZREAL Q'});
  if(!g.spawnDodgeVisitor(g.REFERENCE_SPELLS.velkozDodge,20))continue;
  const e=g.foes[0];for(let i=0;i<120&&e.phase==='enter';i++)g.update(1/120);
  if(e.phase==='cast'&&s.alive)committed++;
 }
 assert.ok(committed>0,'no split cast was committed during a live straight missile');
});
test('Expert naturally releases Velkoz while another missile is already in flight',()=>{
 let found=false;
 for(let seed=1;seed<=6&&!found;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(seed*1234567);g.player.hp=g.player.maxHp=1e6;
  let previousVel=0;
  for(let i=0;i<120*120&&!found;i++){
   const prior=g.shots.filter(s=>s.alive&&s.directed&&!s.velkoz&&s.kind!=='enemyOrb');g.update(1/120);
   if(g.dodgeDirector.velkoz>previousVel&&prior.some(s=>s.alive))found=true;
   previousVel=g.dodgeDirector.velkoz;
  }
 }
 assert.ok(found,'no natural Velkoz release joined an existing missile');
});
test('Velkoz defers an already unavoidable projectile or an active area effect',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const p=g.player,s=g.fire(p.x-30,p.y,500,0,'enemy',20,20,1);s.directed=true;
 assert.equal(g.canEvadeVelkoz({x:160,y:p.y},0,400,g.REFERENCE_SPELLS.velkozDodge),false);
 s.alive=false;g.hazards.push({directed:true,x:p.x,y:p.y,r:100,ttl:1});
 assert.equal(g.canEvadeVelkoz({x:160,y:p.y},0,400,g.REFERENCE_SPELLS.velkozDodge),false);
});
test('Velkoz forecast rejects a point-blank split with no ordinary escape',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const spec=g.REFERENCE_SPELLS.velkozDodge;
 assert.equal(g.canEvadeVelkoz({x:g.player.x-10,y:g.player.y},0,10,spec),false);
});
test('Ezreal and active Velkoz phases share an executable walking escape',()=>{
 const counts={main:0,delay:0,child:0};
 for(const phase of ['main','delay','child'])for(const side of [-1,1])for(let i=0;i<16;i++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;g.setTime(10);
  const p=g.player,y=p.y+side*(phase==='main'?70:200),group={hit:false,remaining:2,threatened:false};
  if(phase==='child')for(const branch of [-1,1]){const s=g.fire(750,y,0,branch*1050,'enemy',60,27.5,550/1050);Object.assign(s,{directed:true,spellName:'VELKOZ Q',velkoz:'child',group});}
  else{const s=g.fire(phase==='main'?350:750,y,phase==='main'?650:0,0,'enemy',60,30,phase==='main'?.4:.25);Object.assign(s,{directed:true,spellName:'VELKOZ Q',velkoz:phase,splitAngle:0,phaseResolved:phase==='delay'});}
  const a=i*Math.PI/8,origin={x:p.x+Math.cos(a)*450,y:p.y+Math.sin(a)*450},spec=g.REFERENCE_SPELLS.ezrealDodge,witness={};
  if(!g.canEvadeDodgeCast(origin,spec,witness))continue;
  const enemy=g.enemy(origin.x,origin.y);Object.assign(enemy,{dodgeVisitor:true,spell:spec,phase:'cast',charge:spec.cast,pending:{angle:Math.atan2(p.y-origin.y,p.x-origin.x),spell:spec,threat:true},entry:{...origin}});g.setFoes([enemy]);
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,2);
  assert.equal(g.stats.hits,0,`${phase} side ${side} angle ${i}`);counts[phase]++;
 }
 for(const phase of Object.keys(counts))assert.ok(counts[phase]>0,JSON.stringify(counts));
});
test('Expert Lux and Blitz share executable escapes with all Velkoz phases',()=>{
 for(const key of ['luxDodge','blitzDodge'])for(const phase of ['main','delay','child']){
  let accepted=0;
  for(const side of [-1,1])for(let i=0;i<16;i++){
   const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;g.setTime(10);
   const p=g.player,y=p.y+side*(phase==='main'?70:200),group={hit:false,remaining:2,threatened:false};
   if(phase==='child')for(const branch of [-1,1]){const s=g.fire(750,y,0,branch*1050,'enemy',60,27.5,550/1050);Object.assign(s,{directed:true,spellName:'VELKOZ Q',velkoz:'child',group});}
   else{const s=g.fire(phase==='main'?350:750,y,phase==='main'?650:0,0,'enemy',60,30,phase==='main'?.4:.25);Object.assign(s,{directed:true,spellName:'VELKOZ Q',velkoz:phase,splitAngle:0,phaseResolved:phase==='delay'});}
   const a=i*Math.PI/8,origin={x:p.x+Math.cos(a)*450,y:p.y+Math.sin(a)*450},spell=g.REFERENCE_SPELLS[key],witness={};
   if(!g.canEvadeDodgeCast(origin,spell,witness))continue;
   const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell,phase:'cast',charge:spell.cast,pending:{angle:Math.atan2(p.y-origin.y,p.x-origin.x),spell,threat:true},entry:{...origin}});g.setFoes([e]);
   advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,2);assert.equal(g.stats.hits,0,`${key} ${phase} ${side} ${i}`);accepted++;
  }
  assert.ok(accepted>0,`no valid ${key} ${phase} witnesses`);
 }
});
test('Expert naturally overlaps Velkoz missiles with Lux and Blitz',()=>{
 for(const name of ['LUX Q','BLITZ Q']){
  let found=false;
  for(let seed=1;seed<=6&&!found;seed++){
   const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(seed*1234567);g.player.hp=g.player.maxHp=1e6;
   for(let i=0;i<120*120&&!found;i++){
    g.update(1/120);found=g.shots.some(s=>s.alive&&s.velkoz&&s.velkoz!=='delay'&&!s.ignorePlayer&&!(s.group&&s.group.hit))&&g.shots.some(s=>s.alive&&s.spellName===name);
   }
  }
  assert.ok(found,`no Velkoz + ${name} projectile overlap found`);
 }
});
test('Velkoz overlap defers offscreen split predictions and non-Expert modes',()=>{
 for(const scenario of ['offscreen','normal','unsupported']){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:scenario==='normal'?'normal':'hard'}});g.reset('dodge');g.dodgeDirector.next=999;
  const s=g.fire(scenario==='offscreen'?1100:350,g.player.y+150,650,0,'enemy',60,30,.4);Object.assign(s,{directed:true,spellName:'VELKOZ Q',velkoz:'main',splitAngle:0});
  const spell=scenario==='unsupported'?g.REFERENCE_SPELLS.ahriDodge:g.REFERENCE_SPELLS.ezrealDodge;
  assert.equal(g.canEvadeDodgeCast({x:140,y:g.player.y},spell),false,scenario);
 }
});
test('Expert director naturally overlaps Ezreal and Velkoz missiles',()=>{
 let overlap=false;
 for(let seed=1;seed<=12&&!overlap;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(seed*1234567);g.player.hp=g.player.maxHp=1000000;
  for(let i=0;i<120*180&&!overlap;i++){
   g.update(1/120);
   overlap=g.shots.some(s=>s.alive&&s.directed&&s.velkoz)&&g.shots.some(s=>s.alive&&s.directed&&s.spellName==='EZREAL Q');
  }
 }
 assert.ok(overlap,'no Velkoz + Ezreal missile overlap appeared in twelve seeded Expert runs');
});
test('pending split follow-up is discarded if its original threat has resolved',()=>{
 for(const scenario of ['removed','main-hit','child-hit']){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setTime(50);g.dodgeDirector.next=999;g.dodgeDirector.splitFollow=true;
  if(scenario!=='removed'){
   const s=g.fire(700,150,0,0,'enemy',10,30,.2);
   Object.assign(s,{directed:true,velkoz:scenario==='main-hit'?'delay':'child',ignorePlayer:scenario==='main-hit',group:scenario==='child-hit'?{hit:true}:null});
  }
  g.update(1/120);assert.equal(g.dodgeDirector.splitFollow,false,scenario);assert.equal(g.foes.filter(e=>e.dodgeVisitor).length,0,scenario);
 }
});
test('pending split follow-up waits through pause and is cleared by restart',()=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.splitFollow=true;
 g.pause();advance(g,1);assert.equal(g.dodgeDirector.splitFollow,true);g.reset('dodge');assert.ok(!g.dodgeDirector.splitFollow);assert.equal(g.foes.length,0);
});
test('seeded Expert combat remains deterministic at 30, 60 and 120 FPS',()=>{
 const snapshots=[];
 for(const fps of [30,60,120]){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(1234567);g.player.hp=g.player.maxHp=1000000;
  g.loop(1000);for(let i=1;i<=fps*180;i++)g.loop(1000+i*1000/fps+.01);
  const d=g.dodgeDirector;snapshots.push([d.attempted,d.ezreal,d.lux,d.ahri,d.blitz,d.velkoz,d.xerath,d.xerathQ,g.stats.hits,Math.round(g.time*120)]);
 }
 assert.deepEqual(snapshots[0],snapshots[1]);assert.deepEqual(snapshots[1],snapshots[2]);assert.ok(snapshots[0][5]>0,'run must exercise Velkoz');
});

test('Orianna ball is shown before its shockwave, with no stun or pull on hit',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;
 assert.ok(g.spawnOriannaR());const h=g.hazards[0];assert.equal(g.foes.length,0);assert.equal(g.dodgeDirector.orianna,0);
 advance(g,1.55);assert.equal(h.casting,true);assert.equal(g.dodgeDirector.orianna,1);
 g.player.x=h.x;g.player.y=h.y;const pos={x:g.player.x,y:g.player.y};advance(g,.51);
 assert.equal(g.stats.hits,1);assert.equal(g.player.root,0);assert.equal(g.player.x,pos.x);assert.equal(g.player.y,pos.y);
 assert.ok(Math.abs(g.stats.damage-(225/1.3))<1e-7);assert.equal(g.dodgeDirector.outcomes['ORIANNA R'].hit,1);
});
test('Orianna cancels the shockwave if the player has no ordinary escape when it would cast',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;assert.ok(g.spawnOriannaR());const h=g.hazards[0];
 advance(g,.45);g.player.x=h.destination.x;g.player.y=h.destination.y;advance(g,1.15);assert.equal(g.dodgeDirector.orianna,0);assert.equal(g.stats.hits,0);assert.equal(g.hazards.length,0);
});
test('unsafe scheduled rare ultimates defer instead of consuming a full rare interval',()=>{
 for(const kind of ['orianna','malphite']){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=kind==='orianna'?0:999;g.dodgeDirector.malAt=kind==='malphite'?0:999;g.player.hp=g.player.maxHp=100000;
  advance(g,.025);const h=g.hazards.find(h=>h[kind]);assert.ok(h,kind);assert.ok(h.directorScheduled);
  if(kind==='orianna'){advance(g,.45);g.player.x=h.destination.x;g.player.y=h.destination.y;advance(g,1.1);}
  else{g.player.x=h.approach.x;g.player.y=h.approach.y;advance(g,1.3);}
  const next=kind==='orianna'?g.dodgeDirector.rareAt:g.dodgeDirector.malAt;
  assert.equal(g.dodgeDirector[kind],0,kind);assert.ok(next-g.time>4.7&&next-g.time<=5,kind);
  assert.ok(g.dodgeDirector.rareGuardUntil-g.time>4.7,kind);
  g.player.x=600;g.player.y=337.5;advance(g,7);assert.ok(g.dodgeDirector[kind]>0,`${kind} did not retry successfully`);
 }
});
test('committed rare ultimates retain their normal long interval',()=>{
 for(const kind of ['orianna','malphite']){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=kind==='orianna'?0:999;g.dodgeDirector.malAt=kind==='malphite'?0:999;g.player.hp=g.player.maxHp=100000;
  advance(g,2);assert.equal(g.dodgeDirector[kind],1,kind);
  const next=kind==='orianna'?g.dodgeDirector.rareAt:g.dodgeDirector.malAt;
  assert.ok(next-g.time>(kind==='orianna'?87:147),kind);assert.ok(g.dodgeDirector.rareGuardUntil-g.time>30,kind);
 }
});
test('Orianna ball blocks other encounters and its preparation freezes while paused',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;assert.ok(g.spawnOriannaR());const h=g.hazards[0];
 assert.equal(g.spawnDodgeVisitor(),false);assert.equal(g.spawnXerathQ(),false);const before=h.ttl;g.pause();advance(g,.5);assert.equal(h.ttl,before);g.pause();advance(g,.1);assert.ok(h.ttl<before);
});


test('rare Orianna event is not scheduled in the first 90 seconds',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.player.hp=g.player.maxHp=1000000;assert.ok(g.dodgeDirector.rareAt>=90&&g.dodgeDirector.rareAt<=150);advance(g,89.9);assert.equal(g.dodgeDirector.orianna,0);assert.ok(!g.hazards.some(h=>h.orianna));
});

test('Malphite approaches before dashing and hit deals damage without immobilization',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;
 assert.ok(g.spawnMalphiteR());const h=g.hazards[0];assert.equal(h.casting,false);assert.equal(g.spawnDodgeVisitor(),false);const startX=h.x,startY=h.y;advance(g,.5);assert.ok(Math.hypot(h.x-startX,h.y-startY)>1);advance(g,.8);
 assert.equal(h.casting,true);assert.equal(g.dodgeDirector.malphite,1);g.player.x=h.target.x;g.player.y=h.target.y;const pos={x:g.player.x,y:g.player.y};advance(g,.7);
 assert.equal(g.stats.hits,1);assert.ok(Math.abs(g.stats.damage-(200/1.3))<1e-7);assert.equal(g.player.root,0);assert.equal(g.player.x,pos.x);assert.equal(g.player.y,pos.y);
});
test('Malphite renders bounded stone art and retains a missing-image fallback',()=>{
 const {g,node,drawSizes}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const art=node('stoneArt');art.complete=true;art.naturalWidth=1211;
 assert.ok(g.spawnMalphiteR());g.render();assert.deepEqual(drawSizes.find(x=>x[0]===art).slice(1),[-42,-90,84,90]);
 art.naturalWidth=0;assert.doesNotThrow(()=>g.render());
 const missing=boot('ahri',{missingNodes:['stoneArt']});missing.g.reset('dodge');missing.g.dodgeDirector.next=999;assert.ok(missing.g.spawnMalphiteR());assert.doesNotThrow(()=>missing.g.render());
});
test('Malphite landing effect appears on impact and not as a target guide',()=>{
 const {g,arcs}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const target={x:g.player.x-350,y:g.player.y},start={x:target.x-100,y:target.y};
 const h={...start,target,start,remaining:.2,r:162.5,malphite:true,casting:true,ttl:.05,directed:true,spellName:'MALPHITE R'};g.hazards.push(h);
 g.render();assert.ok(!arcs.some(a=>a.r===h.r));g.update(.06);arcs.length=0;g.render();assert.ok(arcs.some(a=>a.r===h.r&&a.x===target.x&&a.y===target.y));
});
test('Malphite R has a walkable response after a 200ms reaction delay',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;
 assert.ok(g.spawnMalphiteR());const h=g.hazards[0];advance(g,1.26);assert.ok(h.casting);
 const dx=g.player.x-h.target.x,dy=g.player.y-h.target.y,d=Math.hypot(dx,dy);advance(g,.2);g.moveTo(g.player.x+dx/d*90,g.player.y+dy/d*90);advance(g,.6);
 assert.equal(g.stats.hits,0);assert.equal(g.dodgeDirector.outcomes['MALPHITE R'].avoided,1);
});
test('Malphite is not eligible in the first 150 seconds',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.player.hp=g.player.maxHp=1000000;assert.ok(g.dodgeDirector.malAt>=150&&g.dodgeDirector.malAt<=240);advance(g,149.9);assert.equal(g.dodgeDirector.malphite,0);
});


test('Orianna ball travels visibly from caster to its destination before Shockwave',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;assert.ok(g.spawnOriannaR());const h=g.hazards[0];
 assert.equal(h.x,h.source.x);assert.equal(h.y,h.source.y);const initial=Math.hypot(h.destination.x-h.x,h.destination.y-h.y);
 advance(g,.15);assert.ok(Math.hypot(h.destination.x-h.x,h.destination.y-h.y)<initial);assert.equal(g.dodgeDirector.orianna,0);
 advance(g,.3);assert.ok(Math.hypot(h.destination.x-h.x,h.destination.y-h.y)<1e-6);assert.equal(g.dodgeDirector.orianna,0);
 advance(g,1.1);assert.equal(h.casting,true);assert.equal(g.dodgeDirector.orianna,1);
});

test('Orianna encounter renders a caster and ball during setup',()=>{
 const {g,node,draws}=boot('ahri');node('clockworkArt').complete=true;node('clockworkArt').naturalWidth=100;
 g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;assert.ok(g.spawnOriannaR());g.render();assert.ok(draws.includes(node('clockworkArt')));
});
test('Orianna shockwave appears on impact without a pre-cast area guide',()=>{
 const {g,arcs}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const h={x:g.player.x-350,y:g.player.y,source:{x:g.player.x-400,y:g.player.y},r:207.5,orianna:true,casting:true,ttl:.05,directed:true,spellName:'ORIANNA R'};g.hazards.push(h);
 g.render();assert.ok(!arcs.some(a=>a.r===h.r));g.update(.06);arcs.length=0;g.render();assert.ok(arcs.some(a=>a.r===h.r));
});

test('Orianna Q hits along its moving path once and records its own damage',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;assert.ok(g.spawnOriannaR());const h=g.hazards[0];
 g.player.x=h.source.x+(h.destination.x-h.source.x)*.4;g.player.y=h.source.y+(h.destination.y-h.source.y)*.4;
 advance(g,.5);assert.equal(g.stats.hits,1);assert.ok(Math.abs(g.stats.damage-(60/1.3))<1e-7);assert.equal(g.dodgeDirector.outcomes['ORIANNA Q'].hit,1);assert.equal(g.dodgeDirector.oriannaQ,1);
});
test('Orianna Q arrival area uses its own radius without applying a second hit',()=>{
 for(const [offset,hit] of [[87.4,true],[87.6,false]]){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;assert.ok(g.spawnOriannaR());const h=g.hazards[0];
  const dx=h.destination.x-h.source.x,dy=h.destination.y-h.source.y,d=Math.hypot(dx,dy);g.player.x=h.destination.x-dy/d*offset;g.player.y=h.destination.y+dx/d*offset;
  advance(g,.5);assert.equal(g.stats.hits,hit?1:0,`offset ${offset}`);
 }
});
test('a lethal Orianna Q is recorded before the result screen',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;assert.ok(g.spawnOriannaR());const h=g.hazards[0];g.player.hp=1;
 g.player.x=h.source.x+(h.destination.x-h.source.x)*.4;g.player.y=h.source.y+(h.destination.y-h.source.y)*.4;advance(g,.3);
 assert.equal(g.state,'ended');assert.match(node('dodgeBreakdownText').textContent,/ORIANNA Q: 0 avoided \/ 1 hit/);assert.match(node('dodgeBreakdownText').textContent,/0 unresolved phases/);
});


test('Orianna Q counts escape from its threatened arrival area',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;assert.ok(g.spawnOriannaR());const h=g.hazards[0];
 const dx=h.destination.x-h.source.x,dy=h.destination.y-h.source.y,d=Math.hypot(dx,dy),nx=-dy/d,ny=dx/d;
 g.player.x=h.destination.x+nx*80;g.player.y=h.destination.y+ny*80;g.update(1/120);g.moveTo(g.player.x+nx*100,g.player.y+ny*100);advance(g,.5);
 assert.equal(g.stats.hits,0);assert.equal(g.dodgeDirector.outcomes['ORIANNA Q'].avoided,1);
});


test('Ahri charm interrupts a Dodge visitor before release and moves it toward her',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;
 const e=g.enemy(800,g.player.y),spec=g.REFERENCE_SPELLS.ezrealDodge;Object.assign(e,{hp:1000,maxHp:1000,dodgeVisitor:true,spell:spec,phase:'cast',charge:.2,pending:{angle:Math.PI,spell:spec},entry:{x:850,y:e.y},speed:120});g.setFoes([e]);
 g.fire(790,e.y,200,0,'charm',80,10,1);g.update(1/120);assert.equal(e.phase,'exit');assert.equal(e.pending,null);const before=e.x;advance(g,.2);assert.ok(e.x<before);assert.equal(g.dodgeDirector.attempted,0);assert.equal(g.shots.filter(s=>s.directed).length,0);
 advance(g,1.5);assert.equal(g.dodgeDirector.attempted,0);
});
test('charming a Dodge visitor preserves an already-fired projectile',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;
 const e=g.enemy(900,200),spec=g.REFERENCE_SPELLS.blitzDodge;Object.assign(e,{hp:1000,maxHp:1000,dodgeVisitor:true,spell:spec,phase:'hookFlight',entry:{x:950,y:200},speed:120});g.setFoes([e]);
 const bolt=g.fire(850,150,-100,0,'enemy',10,10,2);bolt.directed=true;bolt.spellName='BLITZ Q';e.orbShot=bolt;g.fire(890,200,200,0,'charm',80,10,1);g.update(1/120);assert.ok(e.charm>0);advance(g,.1);assert.ok(bolt.alive);assert.ok(e.charm>0);assert.equal(e.phase,'hookFlight');
});


test('an interrupted visitor routes back around terrain before despawning',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;
 const e=g.enemy(600,600);Object.assign(e,{dodgeVisitor:true,spell:g.REFERENCE_SPELLS.ezrealDodge,phase:'exit',entry:{x:850,y:600},speed:120});g.setFoes([e]);
 advance(g,5);assert.ok(!e.alive,'visitor remained stuck against the wall');
});


test('damage text is rounded without changing fractional damage or health',()=>{
 const {g,texts}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;
 const damage=98/1.21;g.fire(g.player.x-20,g.player.y,100,0,'enemy',damage,8,1);g.update(1/120);g.render();
 assert.ok(Math.abs(g.player.hp-(590-damage))<1e-9);assert.ok(texts.includes('−81'));assert.ok(!texts.some(t=>t.startsWith('−81.')));
});
test('CS deaths do not draw an artificial MISSED label',()=>{
 const {g,texts}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();const e=g.foes[0];
 g.applyImpact(e,{sourceId:-1,sourceTeam:'ally',kind:'minionMelee',raw:10000,damageType:'true'});assert.equal(g.stats.missed,1);g.render();assert.ok(!texts.includes('MISSED'));
});


test('result counts a pending Velkoz split as unresolved when it can still hit',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;
 const e=g.enemy(200,150),spec=g.REFERENCE_SPELLS.velkozDodge;Object.assign(e,{dodgeVisitor:true,pending:{angle:0,spell:spec,splitDistance:spec.speed*.25}});g.releaseEnemy(e);advance(g,.27);
 assert.ok(g.shots.some(s=>s.velkoz==='delay'));g.end(true);assert.match(node('dodgeBreakdownText').textContent,/1 unresolved phase/);
});
test('result excludes an already-ineligible Velkoz split branch',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;
 const e=g.enemy(400,g.player.y),spec=g.REFERENCE_SPELLS.velkozDodge;Object.assign(e,{dodgeVisitor:true,pending:{angle:0,spell:spec}});g.releaseEnemy(e);advance(g,.25);
 assert.ok(g.shots.some(s=>s.velkoz==='delay'&&s.ignorePlayer));g.end(true);assert.match(node('dodgeBreakdownText').textContent,/0 unresolved phases/);
});

test('pause freezes a pending Velkoz split and restart clears it and its outcomes',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;
 const e=g.enemy(200,150),spec=g.REFERENCE_SPELLS.velkozDodge;Object.assign(e,{dodgeVisitor:true,pending:{angle:0,spell:spec,splitDistance:spec.speed*.25}});g.releaseEnemy(e);advance(g,.27);
 const pending=g.shots.find(s=>s.velkoz==='delay');assert.ok(pending);const ttl=pending.ttl;g.pause();advance(g,1);assert.equal(pending.ttl,ttl);assert.equal(g.shots.filter(s=>s.velkoz==='child').length,0);
 g.pause();advance(g,.3);assert.equal(g.shots.filter(s=>s.velkoz==='child').length,2);g.reset('dodge');assert.equal(g.shots.length,0);assert.equal(g.dodgeDirector.attempted,0);assert.equal(Object.keys(g.dodgeDirector.outcomes).length,0);
});


test('Ahri flash respects cursor distance, maximum range and five-minute cooldown',()=>{
 for(const [targetX,expected] of [[650,50],[1000,200]]){
  const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;
  const start=g.player.x;node('arena').listeners.pointermove({clientX:targetX,clientY:g.player.y,buttons:0});g.cast('f');
  assert.ok(Math.abs(g.player.x-start-expected)<1e-8);assert.equal(g.player.cd.f,300);assert.equal(g.player.invuln,0);
  const after=g.player.x;g.cast('f');assert.equal(g.player.x,after);advance(g,1);assert.ok(g.player.cd.f>298&&g.player.cd.f<300);
 }
});
test('forward Flash preserves a move order and continues walking from the landing',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.moveTo(1100,337.5);advance(g,.1);
 node('arena').listeners.pointermove({clientX:1100,clientY:337.5,buttons:0});g.cast('f');const landed=g.player.x;
 assert.ok(g.player.target);assert.equal(g.player.target.x,1100);assert.equal(g.player.route.length,0);advance(g,.3);assert.ok(g.player.x>landed+40);
});
test('backward Flash or an overshot destination does not reverse movement',()=>{
 for(const overshot of [false,true]){
  const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.moveTo(overshot?650:1100,337.5);
  node('arena').listeners.pointermove({clientX:overshot?1100:100,clientY:337.5,buttons:0});g.cast('f');const landed=g.player.x;
  assert.equal(g.player.target,null);advance(g,.2);assert.equal(g.player.x,landed);
 }
});
test('Flash clears an attack chase rather than turning it into a move order',()=>{
 const {g,node}=boot('ahri');g.reset('kite');g.disableSpawn();const e=foe(g,1050);g.attackOrder(e);advance(g,.05);assert.equal(g.player.order.type,'attack');
 node('arena').listeners.pointermove({clientX:1100,clientY:337.5,buttons:0});g.cast('f');assert.equal(g.player.order,null);assert.equal(g.player.target,null);
});
test('forward Flash rebuilds a movement route around terrain',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.x=600;g.player.y=600;g.moveTo(850,600);advance(g,.05);
 const waypoint=g.player.route[0];assert.ok(waypoint);node('arena').listeners.pointermove({clientX:waypoint.x,clientY:waypoint.y,buttons:0});g.cast('f');
 assert.ok(g.player.target);assert.equal(g.player.route.length,0);advance(g,3);assert.ok(Math.hypot(g.player.x-850,g.player.y-600)<5);
});
test('Ahri can flash during a spell cast without cancelling the spell',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.rareAt=999;g.dodgeDirector.malAt=999;
 node('arena').listeners.pointermove({clientX:1000,clientY:g.player.y,buttons:0});g.cast('q');assert.ok(g.player.casting);const x=g.player.x;g.cast('f');assert.equal(g.player.x,x+200);assert.ok(g.player.casting);advance(g,.27);assert.ok(g.shots.some(s=>s.kind==='orb'));
});
test('Ahri flash in kite has no artificial damage immunity',()=>{
 const {g}=boot('ahri');g.reset('kite');g.disableSpawn();g.cast('f');assert.equal(g.player.invuln,0);
});


test('fresh later waves acquire matching melee rows instead of collapsing on one target',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();g.setAllies([]);g.setFoes([]);g.addWave();advance(g,2);
 for(const [friends,enemies] of [[g.allies,g.foes],[g.foes,g.allies]]){
  for(const unit of friends.filter(x=>x.wave===2&&x.minionType==='melee')){
   const target=enemies.find(x=>x.id===unit.targetId);
   assert.ok(target,`missing target for row ${unit.row}`);assert.equal(target.row,unit.row);
  }
 }
});


test('Ahri regenerates base health over time without exceeding max or while paused',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.hp=500;
 advance(g,10);assert.ok(Math.abs(g.player.hp-505)<1e-8);
 g.pause();advance(g,5);assert.ok(Math.abs(g.player.hp-505)<1e-8);g.pause();
 g.player.hp=589.9;advance(g,1);assert.equal(g.player.hp,590);
});
test('arcade presets do not receive Ahri health regeneration',()=>{
 const {g}=boot('standard');g.reset('kite');g.disableSpawn();g.player.hp=100;advance(g,3);assert.equal(g.player.hp,100);
});

test('regeneration restores health after damage without changing recorded damage',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 g.applyImpact(g.player,{sourceTeam:'enemy',kind:'test',raw:100,damageType:'true'});
 advance(g,8);assert.ok(Math.abs(g.player.hp-494)<1e-8);assert.equal(g.stats.damage,100);assert.equal(g.stats.hits,1);
 g.applyImpact(g.player,{sourceTeam:'enemy',kind:'test',raw:1000,damageType:'true'});advance(g,3);
 assert.equal(g.state,'ended');assert.equal(g.player.hp,0);
});


test('Xerath Q charge shows a short directional cue without drawing the full aim line',()=>{
 const {g,strokes,lines}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 g.hazards.push({x:300,y:300,endX:900,endY:300,r:36.25,ttl:.5,max:.528,beam:true,directed:true});g.render();
 assert.ok(strokes.includes('#9edcffaa'));
 assert.ok(lines.some(p=>p.x===345&&p.y===300));
 assert.ok(!lines.some(p=>p.x===900&&p.y===300));
});


test('expired hostile projectiles cannot hit later movement in the same frame',()=>{
 for(const kind of ['enemy','enemyOrb'])for(const dt of [1/30,.1]){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.moveTo(800,g.player.y);
  const s=g.fire(g.player.x+45,g.player.y,0,0,kind,10,8,.001);
  if(kind==='enemyOrb')Object.assign(s,{phase:'out',phaseHit:false,anchor:{x:900,y:g.player.y},casterId:-999});
  g.update(dt);assert.equal(g.stats.hits,0,`${kind} ${dt}`);
 }
});
test('a hostile projectile can still hit before expiring mid-frame',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.moveTo(800,g.player.y);
 g.fire(g.player.x+40,g.player.y,0,0,'enemy',10,8,.001);g.update(1/30);assert.equal(g.stats.hits,1);
});

test('minion missile expiry is compared against target motion only during its lifetime',()=>{
 const {g}=boot('ahri');g.reset('lastHit');g.disableSpawn();g.addWave();
 const ally=g.allies[0],enemy=g.foes[0];Object.assign(ally,{x:500,y:300,tick:999});Object.assign(enemy,{x:700,y:300,tick:999});
 g.setAllies([ally]);g.setFoes([enemy]);const initial=ally.hp;
 const shot=g.fire(540,300,0,0,'enemyMinion',21,3,.001);shot.targetId=ally.id;
 g.update(.1);assert.ok(ally.x>500);assert.equal(ally.hp,initial);
});

test('dodge director rejects a cast when the current move order enters an existing projectile before reaction',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const p=g.player,shot=g.fire(p.x,p.y+70,0,.01,'enemy',10,30,2);shot.directed=true;
 const origin={x:140,y:p.y},spell=g.REFERENCE_SPELLS.ezrealDodge;
 assert.equal(g.canEvadeDodgeCast(origin,spell),true);
 g.moveTo(p.x,p.y+200);assert.equal(g.canEvadeDodgeCast(origin,spell),false);
});

test('moving-player escape witnesses survive continuing the existing order during reaction',()=>{
 for(const side of [-1,1]){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
  const p=g.player,origin={x:140,y:p.y},spell=g.REFERENCE_SPELLS.ezrealDodge;
  g.moveTo(p.x,p.y+side*180);const witness={};assert.equal(g.canEvadeDodgeCast(origin,spell,witness),true);
  const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell,phase:'cast',entry:{...origin},speed:120,charge:spell.cast,pending:{angle:0,spell}});g.setFoes([e]);
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.5);assert.equal(g.stats.hits,0,`side ${side}`);
 }
});


test('Orianna safety checks consider movement toward the ball before reaction',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const ball={x:g.player.x+220,y:g.player.y,r:207.5};
 assert.equal(g.oriannaEscape(ball),true);
 g.moveTo(g.player.x+200,g.player.y);assert.equal(g.oriannaEscape(ball),false);
});
test('Orianna moving-player escape witness clears the actual impact',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const ball={x:g.player.x+220,y:g.player.y,r:207.5};g.moveTo(g.player.x-200,g.player.y);
 const witness={};assert.equal(g.oriannaEscape(ball,witness),true);
 g.hazards.push({...ball,orianna:true,casting:true,ttl:.5,max:.5,directed:true,spellName:'ORIANNA R'});
 advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,.35);assert.equal(g.stats.hits,0);
});


test('Xerath beam witness survives actual impact while the initial movement continues',()=>{
 for(const side of [-1,1]){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.moveTo(g.player.x,g.player.y+side*150);
  assert.ok(g.spawnXerathQ());const h=g.hazards[0],witness={};
  assert.ok(g.sampleAreaEscape(.2,.528,p=>g.beamTouchesPlayer(h,p,g.player.hitRadius+8),witness));
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,.4);assert.equal(g.stats.hits,0,`side ${side}`);
 }
});
test('Malphite planned landing remains escapable from a moving player',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.moveTo(g.player.x,g.player.y+180);
 const source={x:200,y:g.player.y},plan=g.aimMalphiteR(source),witness={};assert.ok(plan);
 assert.ok(g.sampleAreaEscape(.2,plan.duration,p=>Math.hypot(p.x-plan.target.x,p.y-plan.target.y)<=162.5+g.player.hitRadius+8,witness));
 g.hazards.push({...source,malphite:true,casting:true,target:plan.target,start:source,remaining:plan.duration,ttl:plan.duration,max:plan.duration,r:162.5,directed:true,spellName:'MALPHITE R'});
 advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,plan.duration);assert.equal(g.stats.hits,0);
});
test('Expert direct Malphite R provides a real Flash-and-move escape',()=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;g.setRng(1);
 const source={x:200,y:g.player.y},plan=g.aimMalphiteR(source);assert.ok(plan?.flashWitness);assert.equal(plan.target.x,g.player.x);assert.equal(plan.target.y,g.player.y);
 g.hazards.push({...source,malphite:true,casting:true,target:plan.target,start:source,remaining:plan.duration,ttl:plan.duration,max:plan.duration,r:162.5,directed:true,spellName:'MALPHITE R'});
 advance(g,.2);node('arena').listeners.pointermove({clientX:plan.flashWitness.x,clientY:plan.flashWitness.y,buttons:0});g.cast('f');advance(g,.1);g.moveTo(plan.walkWitness.x,plan.walkWitness.y);
 advance(g,plan.duration);assert.equal(g.stats.hits,0);assert.ok(g.player.cd.f>0);assert.equal(g.dodgeDirector.outcomes['MALPHITE R'].avoided,1);
});
test('Malphite does not require Flash when it is on cooldown',()=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;g.player.cd.f=20;g.setRng(1);
 const plan=g.aimMalphiteR({x:200,y:g.player.y}),witness={};assert.ok(plan);assert.equal(plan.flashWitness,undefined);
 assert.ok(g.sampleAreaEscape(.2,plan.duration,p=>Math.hypot(p.x-plan.target.x,p.y-plan.target.y)<=162.5+g.player.hitRadius+8,witness));
});
test('direct Malphite results report Flash use during the cast without claiming a dodge',()=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;g.setRng(1);
 const source={x:200,y:g.player.y};g.hazards.push({...source,approach:source,startApproach:source,malphite:true,casting:false,ttl:.001,max:1,r:162.5,directed:true,spellName:'MALPHITE R'});
 g.update(.01);assert.equal(g.dodgeDirector.malDirect,1);assert.equal(g.dodgeDirector.malDirectFlash,0);
 node('arena').listeners.pointermove({clientX:g.player.x+200,clientY:g.player.y,buttons:0});g.cast('f');g.cast('f');
 assert.equal(g.dodgeDirector.malDirectFlash,1);g.end(false);
 assert.match(node('dodgeBreakdownText').textContent,/Malphite direct casts: 1 \/ Flash used during 1/);
});
test('direct Malphite Flash witnesses survive existing movement and W decay',()=>{
 let checked=0;
 for(const side of [-1,1])for(const boosted of [false,true]){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;g.setRng(1);
  const source={x:g.player.x+side*400,y:g.player.y};g.moveTo(g.player.x,g.player.y+80);if(boosted)g.cast('w');
  const plan=g.aimMalphiteR(source);if(!plan?.flashWitness)continue;
  g.hazards.push({...source,malphite:true,casting:true,target:plan.target,start:source,remaining:plan.duration,ttl:plan.duration,max:plan.duration,r:162.5,directed:true,spellName:'MALPHITE R'});
  advance(g,.2);node('arena').listeners.pointermove({clientX:plan.flashWitness.x,clientY:plan.flashWitness.y,buttons:0});g.cast('f');advance(g,.1);g.moveTo(plan.walkWitness.x,plan.walkWitness.y);advance(g,plan.duration);
  assert.equal(g.stats.hits,0,`side ${side}, boosted ${boosted}`);checked++;
 }
 assert.ok(checked>=2,`only ${checked} Flash witnesses`);
});
test('direct Malphite Flash plans remain safe across sampled arena positions',()=>{
 let checked=0;
 for(const x of [450,600,750])for(const y of [230,337,480])for(const side of [-1,1])for(const boosted of [false,true])for(const [mx,my] of [[0,80],[0,-80],[80,0],[-80,0]]){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;g.setRng(1);
  const p=g.player;p.x=x;p.y=y;g.moveTo(x+mx,y+my);if(boosted)g.cast('w');
  const source={x:x+side*380,y},plan=g.aimMalphiteR(source);if(!plan?.flashWitness)continue;
  g.hazards.push({...source,malphite:true,casting:true,target:plan.target,start:source,remaining:plan.duration,ttl:plan.duration,max:plan.duration,r:162.5,directed:true,spellName:'MALPHITE R'});
  advance(g,.2);node('arena').listeners.pointermove({clientX:plan.flashWitness.x,clientY:plan.flashWitness.y,buttons:0});g.cast('f');advance(g,.1);g.moveTo(plan.walkWitness.x,plan.walkWitness.y);advance(g,plan.duration);
  assert.equal(g.stats.hits,0,`${x},${y} side ${side} boosted ${boosted} move ${mx},${my}`);checked++;
 }
 assert.ok(checked>=8,`only ${checked} accepted Flash witnesses`);
});


test('forecast accounts for W decay and soft caps across movement and expiration',()=>{
 for(const elapsed of [.2,.5,1.5,2.5]){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.cast('w');g.moveTo(1100,g.player.y);
  const predicted=g.forecastTravel(0,elapsed),start=g.player.x;advance(g,elapsed);
  assert.ok(Math.abs((g.player.x-start)-predicted)<.5,`elapsed ${elapsed}: actual ${g.player.x-start}, forecast ${predicted}`);
 }
});
test('W decays during root before the existing movement order resumes',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.cast('w');g.moveTo(1100,g.player.y);g.player.root=.1;
 const expected=g.dodgeReactionPath(.3).end,start=g.player.x;advance(g,.3);
 assert.ok(Math.abs(expected.x-g.player.x)<.5,`${start} to ${g.player.x}, expected ${expected.x}`);
});
test('boosted moving-player witness clears an actual Ezreal shot',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.cast('w');g.moveTo(g.player.x,g.player.y+160);
 const origin={x:140,y:g.player.y},spell=g.REFERENCE_SPELLS.ezrealDodge,witness={};assert.ok(g.canEvadeDodgeCast(origin,spell,witness));
 const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell,phase:'cast',entry:{...origin},speed:120,charge:spell.cast,pending:{angle:0,spell}});g.setFoes([e]);
 advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.5);assert.equal(g.stats.hits,0);
});

test('boosted area-escape witness survives Xerath impact after continuing its move',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.cast('w');g.moveTo(g.player.x,g.player.y+150);
 assert.ok(g.spawnXerathQ());const h=g.hazards[0],witness={};
 assert.ok(g.sampleAreaEscape(.2,.528,p=>g.beamTouchesPlayer(h,p,g.player.hitRadius+8),witness));
 advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,.4);assert.equal(g.stats.hits,0);
});


test('Orianna encounter draws its own clockwork sprite and supports missing art',()=>{
 const {g,node,draws,drawSizes}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const clockwork=node('clockworkArt'),mage=node('mageArt');clockwork.complete=mage.complete=true;clockwork.naturalWidth=mage.naturalWidth=100;
 g.hazards.push({x:800,y:300,source:{x:900,y:300},orianna:true,casting:false,ttl:1,max:1});g.render();
 assert.ok(draws.includes(clockwork));assert.ok(!draws.includes(mage));
 assert.deepEqual(drawSizes.find(a=>a[0]===clockwork).slice(1),[-27,-79,54,80]);
 clockwork.naturalWidth=0;draws.length=0;assert.doesNotThrow(()=>g.render());assert.ok(!draws.includes(clockwork));
});

test('moving dodge witnesses remain safe across positions, approach angles and W states',()=>{
 let accepted=0,boosted=0;
 for(const [px,py] of [[600,337],[320,300],[900,400]])for(let i=0;i<8;i++)for(const direction of [-1,1])for(const useW of [false,true]){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.x=px;g.player.y=py;
  const a=i*Math.PI/4,origin={x:px+Math.cos(a)*450,y:py+Math.sin(a)*450};
  if(origin.x<60||origin.x>1140||origin.y<145||origin.y>645)continue;
  g.moveTo(px-Math.sin(a)*direction*180,py+Math.cos(a)*direction*180);if(useW)g.cast('w');
  const spell=g.REFERENCE_SPELLS.ezrealDodge,witness={};if(!g.canEvadeDodgeCast(origin,spell,witness))continue;
  accepted++;if(useW)boosted++;
  const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell,phase:'cast',entry:{...origin},speed:120,charge:spell.cast,pending:{angle:Math.atan2(py-origin.y,px-origin.x),spell}});g.setFoes([e]);
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.5);
  assert.equal(g.stats.hits,0,`position ${px},${py}, angle ${i}, direction ${direction}, W ${useW}`);
 }
 assert.ok(accepted>=16,`only ${accepted} accepted cases`);assert.ok(boosted>=8,`only ${boosted} boosted cases`);
});

test('Orianna escape can stop at a nearby arena corner instead of needing a full-speed destination',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.x=1168;g.player.y=69;
 const ball={x:1000,y:235,r:207.5},witness={};assert.equal(g.oriannaEscape(ball,witness),true);
 g.hazards.push({...ball,orianna:true,casting:true,ttl:.5,max:.5,directed:true,spellName:'ORIANNA R'});
 advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,.35);assert.equal(g.stats.hits,0);
});

test('clipped area escape never claims a point through a wall is reachable',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.x=650;g.player.y=580;
 assert.equal(g.sampleAreaEscape(.2,.5,p=>p.x<=660),false);
});

test('moving-player seeded sessions sustain mixed pressure without impossible state',t=>{
 const runs=[];
 for(let seedIndex=0;seedIndex<3;seedIndex++){
  const {g,node}=boot('ahri');for(let n=0;n<seedIndex;n++)node('newSeed').listeners.click();
  g.reset('dodge');g.player.hp=g.player.maxHp=1e6;
  const points=[[500,250],[700,250],[700,450],[500,450]];
  for(let step=0;step<179*120;step++){
   if(step%360===0){const [x,y]=points[Math.floor(step/360)%points.length];g.moveTo(x,y);}
   if(step%1440===0)g.cast('w');g.update(1/120);
   assert.ok(Number.isFinite(g.player.x)&&Number.isFinite(g.player.y)&&Number.isFinite(g.player.hp));
   const d=g.dodgeDirector;assert.ok(d.lastRegular==='EZREAL Q'||d.regularStreak<=2,`seed ${seedIndex}: ${d.lastRegular} repeated`);
  }
  const d=g.dodgeDirector;runs.push({casts:d.attempted,ezreal:d.ezreal,orianna:d.orianna,malphite:d.malphite});
  assert.ok(d.attempted>25,`seed ${seedIndex}: ${d.attempted}`);assert.ok(d.ezreal>0);assert.equal(g.state,'playing');
 }
 t.diagnostic(JSON.stringify(runs));
});


test('a third identical complex visitor is deferred while repeated Ezreal remains allowed',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const d=g.dodgeDirector;
 for(const [name,spellKey,expected] of [['LUX Q','luxDodge','exit'],['EZREAL Q','ezrealDodge','cast']]){
  d.lastRegular=name;d.regularStreak=2;const origin={x:140,y:g.player.y},spell=g.REFERENCE_SPELLS[spellKey],e=g.enemy(origin.x,origin.y);
  Object.assign(e,{dodgeVisitor:true,spell,phase:'enter',origin:{...origin},entry:{...origin},speed:120});g.setFoes([e]);g.update(1/120);assert.equal(e.phase,expected,name);
 }
});


test('Dodge results separate compact summary from accessible spell breakdown and reset it',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const shot=g.fire(g.player.x-5,g.player.y,1,0,'enemy',10,8,1);shot.directed=true;shot.spellName='EZREAL Q';g.update(1/120);g.end(false);
 assert.equal(node('dodgeBreakdown').hidden,false);assert.match(node('menuDescription').textContent,/1 hits/);
 assert.doesNotMatch(node('menuDescription').textContent,/EZREAL Q:/);assert.match(node('dodgeBreakdownText').textContent,/EZREAL Q: 0 avoided \/ 1 hit/);
 node('dodgeBreakdown').open=true;g.reset('kite');g.pause();assert.equal(node('dodgeBreakdown').hidden,true);assert.equal(node('dodgeBreakdown').open,false);g.pause();g.end(false);assert.equal(node('dodgeBreakdown').hidden,true);
});


test('blocked third Xerath Q or W falls back to an Ezreal visitor',()=>{
 // Set the random generator so its next roll is in the desired ambient band.
 for(const [name,minimum,maximum] of [['XERATH Q',.94,1],['XERATH W',.91,.94]]){
  let found=false;
  for(let seed=0;seed<200&&!found;seed++){
   const initial=Math.imul(seed,2654435761)>>>0,next=(Math.imul(1664525,initial)+1013904223)>>>0,roll=next/4294967296;if(roll<minimum||roll>=maximum)continue;
   const {g}=boot('ahri');g.reset('dodge');g.setTime(60);g.dodgeDirector.next=999;g.dodgeDirector.lastRegular=name;g.dodgeDirector.regularStreak=2;g.setRng(initial);
   if(g.spawnDodgeVisitor()){assert.equal(g.foes[0].spell.name,'EZREAL Q',name);found=true;}
  }
  assert.ok(found,`no valid ${name} seed`);
 }
});

test('area impacts sample the player position at impact rather than frame end',()=>{
 for(const kind of ['xerathW','xerathQ','orianna','malphite']){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const p=g.player;g.moveTo(p.x+200,p.y);
  let h;if(kind==='xerathW')h={x:p.x+150,y:p.y,r:137.5,xerath:true};
  else if(kind==='xerathQ')h={x:p.x+80,y:p.y-200,endX:p.x+80,endY:p.y+200,r:36.25,beam:true};
  else if(kind==='orianna')h={x:p.x+250,y:p.y,r:207.5,orianna:true,casting:true};
  else h={x:p.x,y:p.y,r:162.5,malphite:true,casting:true,start:{x:p.x,y:p.y},target:{x:p.x+205,y:p.y},remaining:1};
  Object.assign(h,{ttl:.01,max:1,directed:true,spellName:kind});g.hazards.push(h);g.update(.1);
  assert.equal(g.stats.hits,0,`${kind}: player entered only after impact`);
 }
});
test('an area impact still hits when the player leaves later in the same frame',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const p=g.player;g.moveTo(p.x-200,p.y);
 g.hazards.push({x:p.x+136,y:p.y,r:137.5,xerath:true,ttl:.001,max:1,directed:true,spellName:'XERATH W'});g.update(.1);
 assert.equal(g.stats.hits,1);
});

test('Xerath W center damage uses the position at impact',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const p=g.player;g.moveTo(p.x+200,p.y);
 g.hazards.push({x:p.x+70,y:p.y,r:137.5,xerath:true,ttl:.01,max:1,directed:true,spellName:'XERATH W'});g.update(.1);
 assert.equal(g.stats.hits,1);assert.ok(Math.abs(g.stats.damage-50/1.3)<1e-8);
});

test('Orianna Q arrival ignores movement after the ball has arrived',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.x=500;g.player.y=400;g.moveTo(500,200);
 const q={directed:true,spellName:'ORIANNA Q',phaseResolved:false,threat:false};
 g.hazards.push({x:499,y:300,source:{x:400,y:300},destination:{x:500,y:300},travelDuration:1,ttl:1.01,max:2,orianna:true,casting:false,r:207.5,directed:true,q});
 g.update(.1);assert.equal(g.stats.hits,0);assert.equal(g.dodged,0);
});
test('Orianna Q arrival hits a player who leaves only after arrival',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.x=500;g.player.y=386;g.moveTo(500,550);
 const q={directed:true,spellName:'ORIANNA Q',phaseResolved:false,threat:false};
 g.hazards.push({x:499.9,y:300,source:{x:400,y:300},destination:{x:500,y:300},travelDuration:1,ttl:1.001,max:2,orianna:true,casting:false,r:207.5,directed:true,q});
 g.update(.1);assert.equal(g.stats.hits,1);assert.equal(g.dodgeDirector.outcomes['ORIANNA Q'].hit,1);
});

test('a seeded double Ezreal encounter admits a shared walking escape',()=>{
 let checked=0;
 for(let seedOffset=0;seedOffset<60;seedOffset++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'normal'}});for(let i=0;i<seedOffset;i++)node('newSeed').listeners.click();
  g.reset('dodge');g.setTime(50);g.dodgeDirector.next=999;const spell=g.REFERENCE_SPELLS.ezrealDodge;
  if(!g.spawnDodgeVisitor())continue;
  const follow=g.foes.find(x=>x.followUp&&x.spell===spell);if(!follow)continue;
  assert.ok(Math.hypot(follow.entry.x-follow.origin.x,follow.entry.y-follow.origin.y)>60);
  const first=g.foes.find(x=>x!==follow&&x.spell===spell);assert.ok(first);
  assert.ok(Math.hypot(follow.entry.x-first.entry.x,follow.entry.y-first.entry.y)>=100);
  assert.ok(Math.hypot(follow.origin.x-first.origin.x,follow.origin.y-first.origin.y)>=100);
  for(let i=0;i<120&&follow.phase==='enter';i++)g.update(1/120);
  if(follow.phase!=='cast')continue;
  const witness={};if(!g.canEvadeDodgeCast(follow,spell,witness))continue;
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.5);
  assert.equal(g.stats.hits,0,`seed ${seedOffset}`);assert.equal(g.dodgeDirector.ezreal,2);checked++;
 }
 assert.ok(checked>=2,`only ${checked} safe double Ezreal witnesses`);
});
test('double Ezreal projectiles occur naturally on Standard but not Foundation',t=>{
 for(const [difficulty,expected] of [['easy',false],['normal',true]]){
  let found=false;
  for(let seedOffset=0;seedOffset<5&&!found;seedOffset++){
   const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:difficulty}});for(let i=0;i<seedOffset;i++)node('newSeed').listeners.click();
   g.reset('dodge');g.player.hp=g.player.maxHp=1000000;
   while(g.time<179&&!found){g.update(1/120);found=g.shots.filter(s=>s.alive&&s.spellName==='EZREAL Q').length>=2;}
  }
  assert.equal(found,expected,difficulty);
 }
});
test('Expert does not generate scripted duplicate Ezreal pairs',()=>{
 for(let seed=1;seed<=80;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setTime(10);g.setRng(seed*2654435761>>>0);
  g.spawnDodgeVisitor();assert.ok(!g.foes.some(e=>e.followUp),'unexpected scripted duplicate');
 }
});
test('Dodge allows an Ahri skillshot followed by movement to evade an incoming attack',()=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;
 const p=g.player,e=g.enemy(p.x+220,p.y);e.speed=0;e.shoot=999;e.hp=e.maxHp=200;g.setFoes([e]);
 node('arena').listeners.pointermove({clientX:e.x,clientY:e.y,buttons:0});g.cast('q');
 const shot=g.fire(p.x-400,p.y,600,0,'enemy',20,5,1);Object.assign(shot,{directed:true,spellName:'LUX Q'});
 advance(g,.26);g.moveTo(p.x,p.y+150);advance(g,.8);
 assert.ok(e.hp<e.maxHp,'Ahri Q did not hit');assert.equal(g.stats.hits,0,'incoming attack hit');
});
test('Dodge counts Q once across both orb legs and counts a missed cast separately',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const e=g.enemy(g.player.x+220,g.player.y),spec=g.REFERENCE_SPELLS.ezrealDodge;
 Object.assign(e,{dodgeVisitor:true,spell:spec,phase:'cast',charge:999,pending:{angle:0,spell:spec},hp:1000,maxHp:1000});g.setFoes([e]);
 node('arena').listeners.pointermove({clientX:e.x,clientY:e.y,buttons:0});g.cast('q');advance(g,1.6);
 assert.equal(g.stats.dodgeQShots,1);assert.equal(g.stats.dodgeQHits,1);
 g.player.cd.q=0;node('arena').listeners.pointermove({clientX:g.player.x,clientY:g.player.y-300,buttons:0});g.cast('q');advance(g,1.6);
 assert.equal(g.stats.dodgeQShots,2);assert.equal(g.stats.dodgeQHits,1);g.end(false);
 assert.match(node('dodgeBreakdownText').textContent,/Q 1\/2 casts hit \(0 in flight\)/);
 assert.match(node('dodgeBreakdownText').textContent,/20 skill points/);
});
test('a piercing Q hitting multiple visitors earns one transparent skill bonus',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const spec=g.REFERENCE_SPELLS.ezrealDodge,visitors=[180,250].map(dx=>{
  const e=g.enemy(g.player.x+dx,g.player.y);Object.assign(e,{dodgeVisitor:true,spell:spec,phase:'cast',charge:999,pending:{angle:0,spell:spec},hp:1000,maxHp:1000});return e;
 });g.setFoes(visitors);node('arena').listeners.pointermove({clientX:g.player.x+300,clientY:g.player.y,buttons:0});g.cast('q');advance(g,1.6);
 assert.ok(visitors.every(e=>e.hp<1000));assert.equal(g.stats.dodgeQHits,1);g.end(false);
 assert.match(node('menuDescription').textContent,/20 from skillshots/);assert.match(node('dodgeBreakdownText').textContent,/20 skill points/);
});
test('Dodge skill results distinguish a released in-flight E from a miss',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 node('arena').listeners.pointermove({clientX:g.player.x+200,clientY:g.player.y,buttons:0});g.cast('e');advance(g,.26);
 assert.equal(g.stats.dodgeEShots,1);assert.equal(g.stats.dodgeEHits,0);g.end(false);
 assert.match(node('dodgeBreakdownText').textContent,/E 0\/1 casts hit \(1 in flight\)/);
});
test('Dodge counts Charm hits against a visitor once per released E',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const e=g.enemy(g.player.x+150,g.player.y),spec=g.REFERENCE_SPELLS.ezrealDodge;
 Object.assign(e,{dodgeVisitor:true,spell:spec,phase:'cast',charge:999,pending:{angle:0,spell:spec},hp:1000,maxHp:1000});g.setFoes([e]);
 node('arena').listeners.pointermove({clientX:e.x,clientY:e.y,buttons:0});g.cast('e');advance(g,.7);
 assert.equal(g.stats.dodgeEShots,1);assert.equal(g.stats.dodgeEHits,1);assert.ok(e.hp<1000);g.end(false);
 assert.match(node('dodgeBreakdownText').textContent,/30 skill points/);
});
test('skill-scored Dodge records stay separate while retaining the survival record',()=>{
 const {g,node,window}=boot('ahri'),values=new Map();window.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 const oldScore='lmg.best.v1.dodge.normal.director_v82.endless',survival=oldScore+'.survival';values.set(oldScore,'9999');values.set(survival,'120');
 g.reset('dodge');g.setTime(10);g.stats.dodgeQHits=1;g.stats.dodgeEHits=1;g.end(false);
 assert.match(node('menuDescription').textContent,/150 points/);assert.match(node('menuDescription').textContent,/Best survival: 120.0s/);
 assert.equal(values.get(oldScore),'9999');assert.equal(values.get(oldScore+'.skill_v3'),'150');assert.equal(values.get(survival),'120');
});

test('paired Ezreal escapes remain safe with existing movement and W decay',()=>{
 let accepted=0,boosted=0,led=0;
 for(let seedOffset=0;seedOffset<300;seedOffset++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'normal'}});for(let i=0;i<seedOffset;i++)node('newSeed').listeners.click();
  g.reset('dodge');g.setTime(50);g.dodgeDirector.next=999;const spell=g.REFERENCE_SPELLS.ezrealDodge;
  if(!g.spawnDodgeVisitor())continue;const follow=g.foes.find(x=>x.followUp&&x.spell===spell);if(!follow)continue;
  g.moveTo(g.player.x+(seedOffset%2?120:-120),g.player.y+100);if(seedOffset%2)g.cast('w');
  for(let i=0;i<120&&follow.phase==='enter';i++)g.update(1/120);
  if(follow.phase!=='cast')continue;
  const angle=follow.pending.angle,direct=Math.atan2(g.player.y-follow.y,g.player.x-follow.x);
  const aim={x:follow.x+Math.cos(angle)*400,y:follow.y+Math.sin(angle)*400},witness={};
  // The follow-up is the candidate, not an additional already committed shot.
  follow.phase='enter';const safe=g.canEvadeDodgeCast(follow,spell,witness,aim);follow.phase='cast';assert.ok(safe,`accepted cast lost its escape: seed ${seedOffset}`);
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.5);
  assert.equal(g.stats.hits,0,`seed ${seedOffset}`);accepted++;if(seedOffset%2)boosted++;if(Math.abs(angle-direct)>1e-5)led++;
 }
 assert.ok(accepted>=2,`only ${accepted} moving witnesses`);assert.ok(boosted>=1,`no W-boosted witnesses`);assert.ok(led>=1,`no led follow-up witnesses`);
});

test('Ahri Q forecast rejects a path safe outbound but crossed by the returning orb',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 g.player.x=600;g.player.y=170;
 const spell=g.REFERENCE_SPELLS.ahriDodge,origin={x:350,y:337},aim={x:800,y:337},destination={x:600,y:440};
 assert.equal(g.dodgeEscapeClear(origin,{...spell,returning:false},destination,.2,aim),true);
 assert.equal(g.dodgeEscapeClear(origin,spell,destination,.2,aim),false);
});

test('accepted Ahri Q walking witnesses avoid both orb phases',()=>{
 let checked=0;
 for(const angle of [0,Math.PI/4,Math.PI/2,3*Math.PI/4,Math.PI,5*Math.PI/4,3*Math.PI/2,7*Math.PI/4]){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.cassAt=Infinity;g.dodgeDirector.malAt=Infinity;g.dodgeDirector.rareAt=Infinity;
  const spec=g.REFERENCE_SPELLS.ahriDodge,origin={x:g.player.x+Math.cos(angle)*500,y:g.player.y+Math.sin(angle)*500},witness={};
  if(!g.canEvadeDodgeCast(origin,spec,witness))continue;
  const e=g.enemy(origin.x,origin.y),aim=Math.atan2(g.player.y-e.y,g.player.x-e.x);
  Object.assign(e,{dodgeVisitor:true,spell:spec,phase:'cast',charge:spec.cast,pending:{angle:aim,spell:spec,threat:true},entry:{...origin}});g.setFoes([e]);
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,2.4);
  assert.equal(g.stats.hits,0,`angle ${angle}`);checked++;
 }
 assert.ok(checked>=3,`only ${checked} walking witnesses`);
});
test('accepted Ahri Q overlap witnesses also avoid an incoming Ezreal shot',()=>{
 let checked=0;
 for(const side of [-1,1])for(const dy of [-1,1]){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.cassAt=Infinity;g.dodgeDirector.malAt=Infinity;g.dodgeDirector.rareAt=Infinity;
  const spec=g.REFERENCE_SPELLS.ahriDodge,p=g.player,origin={x:p.x+side*500,y:p.y},witness={};
  const shot=g.fire(p.x+side*50,p.y+dy*300,0,-dy*1000,'enemy',20,30,1);Object.assign(shot,{directed:true,spellName:'EZREAL Q'});
  if(!g.canEvadeDodgeCast(origin,spec,witness))continue;
  const e=g.enemy(origin.x,origin.y),aim=Math.atan2(p.y-e.y,p.x-e.x);
  Object.assign(e,{dodgeVisitor:true,spell:spec,phase:'cast',charge:spec.cast,pending:{angle:aim,spell:spec,threat:true},entry:{...origin}});g.setFoes([e]);
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,2.4);
  assert.equal(g.stats.hits,0,`side ${side}, shot direction ${dy}`);checked++;
 }
 assert.ok(checked>0,'no accepted overlap witnesses');
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const p=g.player,shot=g.fire(p.x,p.y-300,0,1000,'enemy',20,30,1);Object.assign(shot,{directed:true,spellName:'EZREAL Q'});
 assert.equal(g.canEvadeDodgeCast({x:p.x-500,y:p.y},g.REFERENCE_SPELLS.ahriDodge),false,'point-blank overlap must be deferred');
});


test('Ezreal-pattern sprite has normal dimensions and a safe fallback',()=>{
 const {g,node,draws,drawSizes}=boot('ahri');g.reset('dodge');const explorer=node('explorerArt');explorer.complete=true;explorer.naturalWidth=100;
 g.drawChampion(600,300,0,false,false,0,0,'ezreal');assert.ok(draws.includes(explorer));assert.deepEqual(drawSizes.find(x=>x[0]===explorer).slice(1),[-37,-79,74,80]);
 explorer.naturalWidth=0;draws.length=0;assert.doesNotThrow(()=>g.drawChampion(600,300,0,false,false,0,0,'ezreal'));assert.ok(!draws.includes(explorer));
});


test('cached HTML without new caster image nodes keeps the arena rendering',()=>{
 for(const [profile,id] of [['ezreal','explorerArt'],['void','voidArt'],['clockwork','clockworkArt']]){
  const {g}=boot('ahri',{missingNodes:[id]});g.reset('dodge');g.dodgeDirector.next=999;
  assert.doesNotThrow(()=>g.drawChampion(500,300,0,false,false,0,0,profile),profile);
 }
 const {g}=boot('ahri',{missingNodes:['ahriArt','ahriBackArt','rangerBackArt']});g.reset('dodge');
 assert.doesNotThrow(()=>g.drawChampion(500,300,-Math.PI/2,true,false,0,0));
});


test('visitor projectile travels only after its windup ends inside a simulation step',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const spec=g.REFERENCE_SPELLS.ezrealDodge, e=g.enemy(g.player.x-90,g.player.y);
 Object.assign(e,{dodgeVisitor:true,spell:spec,phase:'cast',charge:.09,pending:{angle:0,spell:spec,threat:true},entry:{x:e.x,y:e.y}});g.setFoes([e]);
 g.update(.1);assert.equal(g.stats.hits,0);assert.equal(g.shots.length,1);
 assert.ok(Math.abs(g.shots[0].x-(e.x+spec.speed*.01))<1e-6);
});
test('Ahri Q and E only travel after their cast finishes within the step',()=>{
 for(const [key,kind] of [['q','orb'],['e','charm']]){
  const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
  node('arena').listeners.pointermove({clientX:g.player.x+300,clientY:g.player.y,buttons:0});g.cast(key);g.player.casting.remaining=.09;
  const start=g.player.x;g.update(.1);const shot=g.shots.find(s=>s.kind===kind);assert.ok(shot,key);
  assert.ok(Math.abs(shot.x-start-7.75)<1e-7,`${key}: travelled ${shot.x-start}`);
 }
});
test('Ahri Q and E do not hit a target that left before release',()=>{
 for(const [key,kind] of [['q','orb'],['e','charm']]){
  const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
  const e=g.enemy(g.player.x+50,g.player.y);Object.assign(e,{speed:1000,shoot:999,spin:0,strafe:0,hp:1000,maxHp:1000});g.setFoes([e]);
  node('arena').listeners.pointermove({clientX:e.x,clientY:e.y,buttons:0});g.cast(key);g.player.casting.remaining=.09;g.update(.1);
  assert.ok(e.x>g.player.x+130,key);assert.equal(e.hp,1000,`${key}: hit before release`);assert.ok(g.shots.some(s=>s.kind===kind));
 }
});
test('Ahri Q and E can hit a target that enters during the active interval',()=>{
 for(const key of ['q','e']){
  const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
  const e=g.enemy(g.player.x+250,g.player.y);Object.assign(e,{speed:2000,shoot:999,spin:0,strafe:0,hp:1000,maxHp:1000});g.setFoes([e]);
  node('arena').listeners.pointermove({clientX:e.x,clientY:e.y,buttons:0});g.cast(key);g.player.casting.remaining=.09;g.update(.1);
  assert.ok(e.hp<1000,`${key}: missed a target during active interval`);
 }
});
test('queued movement starts only after a cast or root expires within the step',()=>{
 for(const lock of ['cast','root']){
  const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
  const x=g.player.x;if(lock==='cast'){node('arena').listeners.pointermove({clientX:x+200,clientY:g.player.y,buttons:0});g.cast('q');g.player.casting.remaining=.09;}else g.player.root=.09;
  g.moveTo(x+200,g.player.y);g.update(.1);assert.ok(Math.abs(g.player.x-x-1.65)<1e-7,`${lock}: moved ${g.player.x-x}`);
 }
});
test('area impact samples the player before queued movement begins',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const p=g.player;
 node('arena').listeners.pointermove({clientX:p.x+200,clientY:p.y,buttons:0});g.cast('q');p.casting.remaining=.09;g.moveTo(p.x+200,p.y);
 g.hazards.push({x:p.x-137,y:p.y,r:137.5,xerath:true,ttl:.05,max:1,directed:true,spellName:'XERATH W'});g.update(.1);
 assert.equal(g.stats.hits,1);
});
test('projectile collision respects movement beginning after a cast lock',()=>{
 for(const [lifetime,hits] of [[.085,0],[.095,1]]){
  const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const p=g.player;p.speed=1000;
  node('arena').listeners.pointermove({clientX:p.x+200,clientY:p.y,buttons:0});g.cast('q');p.casting.remaining=.08;g.moveTo(p.x+200,p.y);
  g.fire(p.x+45,p.y,0,0,'enemy',10,5,lifetime);g.update(.1);assert.equal(g.stats.hits,hits,`lifetime ${lifetime}`);
 }
});
test('Cassiopeia checks facing before a queued turn actually begins',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const p=g.player;
 node('arena').listeners.pointermove({clientX:p.x-200,clientY:p.y,buttons:0});g.cast('q');p.casting.remaining=.09;g.moveTo(p.x+200,p.y);
 g.hazards.push({x:p.x-200,y:p.y,angle:0,cassio:true,casting:true,ttl:.05,directed:true,spellName:'CASSIOPEIA R'});g.update(.1);
 assert.equal(g.dodgeDirector.cassFails,1);assert.equal(g.dodgeDirector.cassTurns,0);
});
test('area and missile impacts account for reaching a nearby move destination early',()=>{
 for(const kind of ['area','missile']){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const p=g.player;p.speed=1000;g.moveTo(p.x+5,p.y);
  if(kind==='area')g.hazards.push({x:p.x-134,y:p.y,r:137.5,xerath:true,ttl:.05,max:1,directed:true,spellName:'XERATH W'});
  else g.fire(p.x+40,p.y,0,0,'enemy',10,5,.03);
  g.update(.1);assert.equal(g.stats.hits,kind==='area'?0:1,kind);
 }
});
test('queued move does not reuse a completed dash step',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const x=g.player.x,y=g.player.y;
 node('arena').listeners.pointermove({clientX:x+10,clientY:y,buttons:0});g.cast('r');g.moveTo(x+200,y);
 g.update(.1);assert.ok(Math.abs(g.player.x-x-10)<1e-7);assert.equal(g.player.dashing,null);
 g.update(.1);assert.ok(g.player.x>x+10);
});

test('projectile does not collide with player movement before its release',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.speed=1000;
 const spec=g.REFERENCE_SPELLS.ezrealDodge, e=g.enemy(g.player.x+20,g.player.y);
 Object.assign(e,{dodgeVisitor:true,spell:spec,phase:'cast',charge:.09,pending:{angle:Math.PI,spell:spec,threat:true},entry:{x:e.x,y:e.y}});g.setFoes([e]);
 g.moveTo(g.player.x+200,g.player.y);g.update(.1);assert.equal(g.stats.hits,0);
});


test('Velkoz splits from first swept contact, including a moving champion',()=>{
 for(const moving of [false,true]){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
  const startX=g.player.x, startY=g.player.y;
  if(moving){g.player.speed=200;g.moveTo(startX+100,startY);}
  const spec=g.REFERENCE_SPELLS.velkozDodge,e=g.enemy(startX-100,startY);
  Object.assign(e,{dodgeVisitor:true,pending:{angle:0,spell:spec}});g.releaseEnemy(e);
  g.update(.1);const main=g.shots.find(s=>s.velkoz==='delay');assert.ok(main);
  const expectedContactTime=(100-spec.radius-g.player.hitRadius)/(spec.speed-(moving?200:0));
  assert.ok(Math.abs(main.x-(e.x+spec.speed*expectedContactTime))<1e-6,`moving=${moving}, split x=${main.x}`);
  assert.equal(g.stats.hits,1);
 }
});


test('Dodge still resolves lethal impacts beyond the former time limit',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.setTime(720);g.player.hp=10;
 g.fire(g.player.x-30,g.player.y,1000,0,'enemy',100,10,1);g.update(.1);assert.equal(g.state,'ended');assert.equal(g.stats.hits,1);
});

test('Velkoz split retains sub-step expiry and launches children within their active step',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const main=g.fire(200,150,100,0,'enemy',10,30,.005);main.directed=true;main.spellName='VELKOZ Q';main.velkoz='main';main.splitAngle=0;
 g.update(.01);assert.equal(main.velkoz,'delay');assert.ok(Math.abs(main.ttl-.245)<1e-9);
 g.update(.25);const children=g.shots.filter(s=>s.velkoz==='child');assert.equal(children.length,2);
 for(const child of children)assert.ok(Math.abs(Math.abs(child.y-150)-5.25)<1e-7,`child y=${child.y}`);
});

test('Velkoz children ignore champion movement before split activation',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.speed=300;
 const x=g.player.x,y=g.player.y,main=g.fire(x,y,0,0,'enemy',10,30,.245);
 Object.assign(main,{directed:true,spellName:'VELKOZ Q',velkoz:'delay',splitAngle:0,phaseResolved:true});
 g.moveTo(x,y+100);g.update(.25);assert.equal(g.stats.hits,0);assert.equal(g.shots.filter(s=>s.velkoz==='child').length,2);
});

test('Velkoz child can hit during the remainder of the split activation step',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const x=g.player.x,y=g.player.y-65,main=g.fire(x,y,0,0,'enemy',10,30,.24);
 Object.assign(main,{directed:true,spellName:'VELKOZ Q',velkoz:'delay',splitAngle:0,phaseResolved:true});
 g.update(.25);assert.equal(g.stats.hits,1);
});

test('seeded straight visitors sometimes lead existing movement and retain a walking escape',()=>{
 let led=0,direct=0;
 for(let seed=1;seed<=80;seed++){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.setRng((seed*2654435761)>>>0);
  const spell=g.REFERENCE_SPELLS.ezrealDodge,origin={x:130,y:g.player.y};
  const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell,phase:'enter',origin:{...origin},entry:{...origin},speed:120});g.setFoes([e]);
  g.moveTo(g.player.x,g.player.y+180);g.update(1/120);if(e.phase!=='cast')continue;
  const directAngle=Math.atan2(g.player.y-e.y,g.player.x-e.x),angle=e.pending.angle;
  if(Math.abs(angle-directAngle)<1e-5){direct++;continue;}
  led++;const aim={x:e.x+Math.cos(angle)*400,y:e.y+Math.sin(angle)*400},witness={};
  assert.ok(g.canEvadeDodgeCast(e,spell,witness,aim));
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.5);
  assert.equal(g.stats.hits,0,`seed ${seed}`);
 }
 assert.ok(led>0,`no led shots; direct=${direct}`);assert.ok(direct>0,'no direct shots');
});


test('unsafe lead falls back to a separately verified direct shot',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const spell=g.REFERENCE_SPELLS.ezrealDodge;
 let found=null;const blocker=g.fire(0,0,0,500,'enemy',10,20,2);Object.assign(blocker,{directed:true,spellName:'LUX Q'});
 search: for(const shift of [-100,-50,0,50,100])for(const distance of [340,470,620])for(const x of [250,400,600,800,950])for(const y of [130,210,340,480,590])for(let move=0;move<8;move++)for(let shot=0;shot<8;shot++){
  g.player.x=x;g.player.y=y;g.moveTo(x+Math.cos(move*Math.PI/4)*180,y+Math.sin(move*Math.PI/4)*180);
  blocker.x=x+shift;blocker.y=y-220;
  const origin={x:x+Math.cos(shot*Math.PI/4)*distance,y:y+Math.sin(shot*Math.PI/4)*distance},lead=g.dodgeReactionPath(spell.cast).end;
  if(Math.hypot(lead.x-x,lead.y-y)<5)continue;
  if(!g.canEvadeDodgeCast(origin,spell,null,lead)&&g.canEvadeDodgeCast(origin,spell)){found={origin};break search;}
 }
 assert.ok(found,'no case found');const e=g.enemy(found.origin.x,found.origin.y);Object.assign(e,{dodgeVisitor:true,spell,phase:'enter',origin:{...found.origin},entry:{...found.origin},speed:120});g.setFoes([e]);g.setRng(1);
 g.updateDodgeVisitor(e,1/120);assert.equal(e.phase,'cast');assert.ok(Math.abs(e.pending.angle-Math.atan2(g.player.y-e.y,g.player.x-e.x))<1e-10);
});


test('Dodge permits a W-boosted escape that base movement alone cannot make',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const origin={x:g.player.x-400,y:g.player.y},spell=g.REFERENCE_SPELLS.ezrealDodge,witness={};
 assert.equal(g.canEvadeDodgeCast(origin,spell),false);g.cast('w');
 assert.ok(g.canEvadeDodgeCast(origin,spell,witness));
 const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell,phase:'cast',entry:{...origin},speed:120,charge:spell.cast,pending:{angle:0,spell}});g.setFoes([e]);
 advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.5);assert.equal(g.stats.hits,0);
});


test('Flash faces its displacement and leaves facing unchanged on zero displacement',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.facing=0;
 node('arena').listeners.pointermove({clientX:g.player.x-100,clientY:g.player.y,buttons:0});g.cast('f');assert.ok(Math.abs(Math.abs(g.player.facing)-Math.PI)<1e-9);
 g.player.cd.f=0;g.player.facing=1.2;node('arena').listeners.pointermove({clientX:g.player.x,clientY:g.player.y,buttons:0});g.cast('f');assert.equal(g.player.facing,1.2);
});
test('Flash changes facing without redirecting an Ahri spell already casting',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 node('arena').listeners.pointermove({clientX:g.player.x+100,clientY:g.player.y,buttons:0});g.cast('q');assert.equal(g.player.casting.angle,0);
 node('arena').listeners.pointermove({clientX:g.player.x-100,clientY:g.player.y,buttons:0});g.cast('f');
 assert.ok(Math.abs(Math.abs(g.player.facing)-Math.PI)<1e-9);assert.equal(g.player.casting.angle,0);
 advance(g,.3);const orb=g.shots.find(s=>s.kind==='orb');assert.ok(orb&&orb.vx>0);
});


test('Xerath W and Ezreal Q witnesses remain safe with existing movement and W',()=>{
 let accepted=0;
 for(let i=0;i<24;i++){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.setRng((i*2654435761)>>>0);
  const a=i*Math.PI/12,shot=g.fire(g.player.x+Math.cos(a)*380,g.player.y+Math.sin(a)*380,-Math.cos(a)*1000,-Math.sin(a)*1000,'enemy',40,30,.6);
  shot.directed=true;shot.spellName='EZREAL Q';
  g.moveTo(g.player.x+Math.cos(a+.8)*120,g.player.y+Math.sin(a+.8)*120);g.cast('w');
  const witness={};if(!g.spawnXerathW(witness))continue;
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1);
  assert.equal(g.stats.hits,0,`angle ${i}`);accepted++;
 }
 assert.ok(accepted>=3,`only ${accepted} accepted combinations`);
});
test('Expert Xerath W can share one executable escape with multiple different missiles',()=>{
 let checked=0;
 for(let i=0;i<24;i++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;g.setRng((i*2654435761)>>>0);
  const p=g.player;
  for(const [x,y,vx,name] of [[p.x-300,p.y+120,500,'EZREAL Q'],[p.x+300,p.y-120,-500,'LUX Q']]){
   const s=g.fire(x,y,vx,0,'enemy',20,20,2);Object.assign(s,{directed:true,spellName:name});
  }
  const witness={};if(!g.spawnXerathW(witness))continue;
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.4);assert.equal(g.stats.hits,0,`seed ${i}`);checked++;
 }
 assert.ok(checked>=3,`only ${checked} shared escapes`);
});
test('Expert visitor witnesses avoid an already-active Xerath W at impact',()=>{
 let checked=0;
 for(let i=0;i<24;i++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;
  const p=g.player;g.hazards.push({x:p.x+90,y:p.y,r:137.5,ttl:.778,max:.778,xerath:true,directed:true,spellName:'XERATH W',threat:true});
  const a=i*Math.PI/12,origin={x:p.x+Math.cos(a)*470,y:p.y+Math.sin(a)*470},spell=g.REFERENCE_SPELLS.ezrealDodge,witness={};
  if(!g.canEvadeDodgeCast(origin,spell,witness))continue;
  const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell,phase:'cast',charge:spell.cast,entry:{...origin},pending:{angle:Math.atan2(p.y-origin.y,p.x-origin.x),spell,threat:true}});g.setFoes([e]);
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.2);assert.equal(g.stats.hits,0,`angle ${i}`);checked++;
 }
 assert.ok(checked>0,'no combined W and projectile response found');
});
test('Expert Xerath Q and two missiles share an executable walking escape',()=>{
 let checked=0;
 for(let i=0;i<24;i++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;g.setRng((i*2654435761)>>>0);
  const p=g.player;
  for(const [x,y,vx,name] of [[p.x-300,p.y+120,500,'EZREAL Q'],[p.x+300,p.y-120,-500,'LUX Q']]){
   const s=g.fire(x,y,vx,0,'enemy',20,20,2);Object.assign(s,{directed:true,spellName:name});
  }
  const witness={};if(!g.spawnXerathQ(witness))continue;
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.4);assert.equal(g.stats.hits,0,`seed ${i}`);checked++;
 }
 assert.ok(checked>=3,`only ${checked} shared escapes`);
});
test('Expert visitor witnesses avoid an already-active Xerath Q at impact',()=>{
 let checked=0;
 for(let i=0;i<24;i++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;g.setRng((i*2654435761)>>>0);
  if(!g.spawnXerathQ())continue;
  const p=g.player,a=i*Math.PI/12,origin={x:p.x+Math.cos(a)*470,y:p.y+Math.sin(a)*470},spell=g.REFERENCE_SPELLS.ezrealDodge,witness={};
  if(!g.canEvadeDodgeCast(origin,spell,witness))continue;
  const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell,phase:'cast',charge:spell.cast,entry:{...origin},pending:{angle:Math.atan2(p.y-origin.y,p.x-origin.x),spell,threat:true}});g.setFoes([e]);
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.2);assert.equal(g.stats.hits,0,`seed ${i}`);checked++;
 }
 assert.ok(checked>0,'no combined Q and projectile response found');
});
test('Expert naturally combines Xerath Q with a live straight missile',()=>{
 let found=false;
 for(let seed=1;seed<=5&&!found;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(seed*1234567);g.player.hp=g.player.maxHp=1e6;
  for(let i=0;i<120*120&&!found;i++){
   g.update(1/120);found=g.hazards.some(h=>h.beam&&h.ttl>0)&&g.shots.some(s=>s.alive&&s.directed&&['EZREAL Q','LUX Q','BLITZ Q'].includes(s.spellName));
  }
 }
 assert.ok(found,'no natural Xerath Q plus missile overlap found');
});
test('Expert naturally combines Xerath W with multiple live straight missiles',()=>{
 let found=false;
 for(let seed=1;seed<=5&&!found;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(seed*1234567);g.player.hp=g.player.maxHp=1e6;
  for(let i=0;i<120*150&&!found;i++){
   g.update(1/120);found=g.hazards.some(h=>h.xerath&&h.ttl>0)&&g.shots.filter(s=>s.alive&&s.directed&&['EZREAL Q','LUX Q','BLITZ Q'].includes(s.spellName)).length>=2;
  }
 }
 assert.ok(found,'no Xerath W with two live missiles in seeded sessions');
});
test('queued Xerath follow-up expires without its missiles and resets cleanly',()=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.areaFollow=true;
 g.pause();advance(g,1);assert.equal(g.dodgeDirector.areaFollow,true);g.pause();g.update(1/120);
 assert.equal(g.dodgeDirector.areaFollow,false);assert.equal(g.hazards.length,0);
 g.dodgeDirector.areaFollow=true;g.reset('dodge');assert.ok(!g.dodgeDirector.areaFollow);
});

test('Xerath W may use a safe shortened route near arena boundaries',()=>{
 let checked=0;
 for(const [x,y] of [[35,340],[1165,340],[600,70],[600,630]])for(let seed=1;seed<=16;seed++){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.x=x;g.player.y=y;g.setRng((seed*2654435761)>>>0);g.cast('w');
  const start=g.dodgeReactionPath(.2).end,witness={};if(!g.spawnXerathW(witness))continue;
  if(Math.hypot(start.x-witness.destination.x,start.y-witness.destination.y)>=g.forecastTravel(.2,.778)-.1)continue;
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,.7);assert.equal(g.stats.hits,0,`${x},${y} seed ${seed}`);checked++;
 }
 assert.ok(checked>0,'no clipped safe path was exercised');
});


test('Xerath W can select a safe lateral response against an incoming Ezreal Q',()=>{
 let lateral=0;
 for(let i=0;i<96;i++){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.setRng((i*2654435761)>>>0);
  const angle=i*Math.PI/48,ux=Math.cos(angle),uy=Math.sin(angle);g.cast('w');
  const shot=g.fire(g.player.x+ux*450-uy*45,g.player.y+uy*450+ux*45,-ux*1000,-uy*1000,'enemy',30,30,.7);
  Object.assign(shot,{directed:true,spellName:'EZREAL Q'});const start={x:g.player.x,y:g.player.y},witness={};
  if(!g.spawnXerathW(witness))continue;const h=g.hazards[0],ax=start.x-h.x,ay=start.y-h.y,bx=witness.destination.x-start.x,by=witness.destination.y-start.y;
  if(Math.abs(ax*by-ay*bx)<Math.hypot(ax,ay)*Math.hypot(bx,by)*.1)continue;
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1);assert.equal(g.stats.hits,0,`seed ${i}`);lateral++;
 }
 assert.ok(lateral>0,'no lateral witness was exercised');
});

test('Xerath W shared escape respects a committed led Ezreal cast while moving',()=>{
 let accepted=0;
 for(let i=0;i<48;i++){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.setRng((i*2654435761)>>>0);
  const a=i*Math.PI/24,p=g.player,origin={x:p.x+Math.cos(a)*450,y:p.y+Math.sin(a)*450},spell=g.REFERENCE_SPELLS.ezrealDodge;
  const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell,phase:'cast',entry:{...origin},speed:120,hp:10000,charge:spell.cast});
  g.setFoes([e]);g.moveTo(p.x-Math.sin(a)*140,p.y+Math.cos(a)*140);if(i%2)g.cast('w');
  const predicted=g.dodgeReactionPath(spell.cast).end;
  e.pending={angle:Math.atan2(predicted.y-e.y,predicted.x-e.x),spell,threat:true};
  const witness={};if(!g.spawnXerathW(witness))continue;
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.5);
  assert.equal(g.stats.hits,0,`angle ${i}`);accepted++;
 }
 assert.ok(accepted>=2,`only ${accepted} accepted combinations`);
});

test('straight-shot director can use an oblique escape against a second missile',()=>{
 let accepted=0;
 for(let i=0;i<96;i++){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const p=g.player,origin={x:p.x-450,y:p.y},spell=g.REFERENCE_SPELLS.ezrealDodge;
  const a=i*Math.PI/48,ux=Math.cos(a),uy=Math.sin(a);g.cast('w');
  const s=g.fire(p.x+ux*450-uy*45,p.y+uy*450+ux*45,-ux*1000,-uy*1000,'enemy',30,30,.7);Object.assign(s,{directed:true,spellName:'EZREAL Q'});
  const witness={};if(!g.canEvadeDodgeCast(origin,spell,witness))continue;
  if(Math.abs(witness.destination.x-p.x)<5)continue;
  const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell,phase:'cast',charge:spell.cast,entry:{...origin},speed:120,hp:10000,pending:{angle:0,spell}});g.setFoes([e]);
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.5);assert.equal(g.stats.hits,0,`angle ${i}`);accepted++;
 }
 assert.ok(accepted>0,'no oblique route was exercised');
});


test('straight-shot director can accept a safe shortened route near a boundary',()=>{
 let accepted=0;
 for(const [x,y] of [[400,65],[600,65],[800,65],[400,630],[600,630],[800,630]])for(let m=0;m<8;m++)for(let a=0;a<8;a++){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.x=x;g.player.y=y;g.cast('w');
  g.moveTo(x+Math.cos(m*Math.PI/4)*120,y+Math.sin(m*Math.PI/4)*120);
  const spell=g.REFERENCE_SPELLS.ezrealDodge,origin={x:x+Math.cos(a*Math.PI/4)*470,y:y+Math.sin(a*Math.PI/4)*470},start=g.dodgeReactionPath(.2).end,witness={};
  if(!g.canEvadeDodgeCast(origin,spell,witness))continue;
  if(Math.hypot(witness.destination.x-start.x,witness.destination.y-start.y)>=spell.radius+g.player.hitRadius+7.9)continue;
  const e=g.enemy(origin.x,origin.y);Object.assign(e,{dodgeVisitor:true,spell,phase:'cast',charge:spell.cast,entry:{...origin},speed:120,hp:10000,pending:{angle:Math.atan2(y-origin.y,x-origin.x),spell}});g.setFoes([e]);
  advance(g,.2);g.moveTo(witness.destination.x,witness.destination.y);advance(g,1.2);assert.equal(g.stats.hits,0,`${x},${y} move ${m} angle ${a}`);accepted++;
 }
 assert.ok(accepted>0,'no shortened safe route was exercised');
});


test('enemy Ahri orb returns and can hit during the remainder of its turn step',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const s=g.fire(g.player.x+83,g.player.y,1000,0,'enemyOrb',35,50,.005);
 Object.assign(s,{phase:'out',phaseHit:false,anchor:{x:g.player.x-200,y:g.player.y},casterId:-1,directed:true,spellName:'AHRI Q'});
 g.update(.05);assert.equal(g.stats.hits,1);assert.equal(g.stats.damage,35);assert.equal(s.phase,'return');
 assert.equal(g.dodgeDirector.outcomes['AHRI Q'].hit,1);
});
test('player Ahri orb returns and hits during the remainder of its turn step',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const e=g.enemy(g.player.x,g.player.y);Object.assign(e,{speed:0,shoot:999,hp:1000,maxHp:1000,mr:30});g.setFoes([e]);
 const s=g.fire(g.player.x+83,g.player.y,1000,0,'orb',35,50,.005);Object.assign(s,{phase:'out',hitIds:new Set()});
 g.update(.05);assert.equal(e.hp,965);assert.equal(s.phase,'return');
});
test('player Ahri orb does not hit target movement after its return ends',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const e=g.enemy(g.player.x+250,g.player.y);Object.assign(e,{speed:2000,shoot:999,spin:0,strafe:0,hp:1000,maxHp:1000});g.setFoes([e]);
 const s=g.fire(g.player.x+4,g.player.y,1000,0,'orb',35,50,.001);Object.assign(s,{phase:'out',hitIds:new Set()});
 g.update(.1);assert.equal(e.hp,1000);assert.equal(s.alive,false);
});
test('enemy Ahri return does not hit movement completed before the turn',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.speed=300;g.moveTo(g.player.x-150,g.player.y);
 const s=g.fire(g.player.x+100,g.player.y,1000,0,'enemyOrb',35,50,.005);
 Object.assign(s,{phase:'out',phaseHit:false,anchor:{x:g.player.x-200,y:g.player.y},casterId:-1,directed:true,spellName:'AHRI Q'});
 g.update(.05);assert.equal(g.stats.hits,0);assert.equal(s.phase,'return');
});


test('Expert encounter interval is fast and consistent from the start',()=>{
 for(const time of [0,50,78,86,500]){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setTime(time);g.setRng(1);g.dodgeDirector.next=0;g.dodgeDirector.cassAt=g.dodgeDirector.malAt=g.dodgeDirector.rareAt=Infinity;
  g.update(1/120);assert.ok(g.dodgeDirector.next>=.16*.88&&g.dodgeDirector.next<=.16*1.12);
 }
});
test('Velkoz split awards one dodge only after both threatened branches miss',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const group={hit:false,remaining:2,threatened:false};
 for(const ttl of [.01,.03]){const s=g.fire(100,100,1,0,'enemy',10,5,ttl);Object.assign(s,{directed:true,spellName:'VELKOZ Q',velkoz:'child',group,threat:true});}
 g.update(.02);assert.equal(g.dodged,0);assert.equal(g.dodgeDirector.outcomes['VELKOZ Q'],undefined);
 g.update(.02);assert.equal(g.dodged,1);assert.equal(g.stats.hits,0);assert.equal(g.dodgeDirector.outcomes['VELKOZ Q'].avoided,1);
});
test('Velkoz split awards no dodge when a later branch hits',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const group={hit:false,remaining:2,threatened:false};
 const first=g.fire(100,100,1,0,'enemy',10,5,.01);Object.assign(first,{directed:true,spellName:'VELKOZ Q',velkoz:'child',group,threat:true});
 const second=g.fire(g.player.x+100,g.player.y,-1000,0,'enemy',10,5,1);Object.assign(second,{directed:true,spellName:'VELKOZ Q',velkoz:'child',group,threat:true});
 g.update(.02);assert.equal(g.dodged,0);g.update(.1);assert.equal(g.stats.hits,1);assert.equal(g.dodged,0);
 assert.equal(g.dodgeDirector.outcomes['VELKOZ Q'].avoided,0);assert.equal(g.dodgeDirector.outcomes['VELKOZ Q'].hit,1);
});
test('Velkoz split counts as one unresolved opportunity while both branches are active',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;const group={hit:false,remaining:2,threatened:false};
 for(const x of [100,200]){const s=g.fire(x,100,1,0,'enemy',10,5,1);Object.assign(s,{directed:true,spellName:'VELKOZ Q',velkoz:'child',group});}
 g.end(false);assert.match(node('dodgeBreakdownText').textContent,/1 unresolved phase/);
});


test('Expert pressure does not wait minutes to become difficult',()=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(1);g.update(1/120);
 assert.ok(g.dodgeDirector.next<.18);
});
test('endless Dodge keeps best survival separately from score',()=>{
 const {g,node,window}=boot('ahri'),values=new Map();window.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 g.reset('dodge');g.setTime(130);g.end(false);assert.match(node('menuDescription').textContent,/Best survival: 130.0s/);
 g.reset('dodge');g.setTime(90);g.end(false);assert.match(node('menuDescription').textContent,/Best survival: 130.0s/);
 assert.ok([...values.keys()].some(k=>k.endsWith('.endless.survival')));
});

test('Expert endless round remains active beyond twelve simulated minutes and ends on death',()=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.player.hp=g.player.maxHp=1000000;
 advance(g,780);assert.equal(g.state,'playing');assert.ok(g.dodgeDirector.attempted>100);
 g.applyImpact(g.player,{sourceTeam:'enemy',kind:'test',raw:2000000,damageType:'true'});assert.equal(g.state,'ended');
 assert.match(node('menuDescription').textContent,/Survived 780/);
});

test('Expert endless cadence stays active across twelve simulated minutes',t=>{
 const runs=[],mix=[],phases=[],overlaps=[];
 for(let seed=0;seed<3;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});for(let i=0;i<seed;i++)node('newSeed').listeners.click();g.reset('dodge');g.player.hp=g.player.maxHp=1e6;
  const buckets=[],points=[[500,250],[700,250],[700,450],[500,450]];let last=0,priorEz=0,overlapCasts=0;
  for(let step=0;step<720*120;step++){
   if(step%360===0){const [x,y]=points[Math.floor(step/360)%4];g.moveTo(x,y);}if(step%1440===0)g.cast('w');g.update(1/120);
   if(g.dodgeDirector.ezreal>priorEz&&g.shots.some(s=>s.alive&&s.kind==='enemyOrb'))overlapCasts+=g.dodgeDirector.ezreal-priorEz;
   priorEz=g.dodgeDirector.ezreal;
   if((step+1)%(60*120)===0){buckets.push(g.dodgeDirector.attempted-last);last=g.dodgeDirector.attempted;}
  }
  runs.push(buckets);overlaps.push(overlapCasts);const d=g.dodgeDirector;mix.push({ezreal:d.ezreal,ahri:d.ahri,lux:d.lux,blitz:d.blitz,velkoz:d.velkoz,xerath:d.xerath+d.xerathQ,orianna:d.orianna,malphite:d.malphite,malDirect:d.malDirect,cassio:d.cassio});
  phases.push(Object.values(d.outcomes).reduce((a,v)=>({avoided:a.avoided+v.avoided,hit:a.hit+v.hit,blocked:a.blocked+v.blocked,harmless:a.harmless+v.harmless}),{avoided:0,hit:0,blocked:0,harmless:0}));
  assert.equal(g.state,'playing');assert.ok(buckets.every(n=>n>=5));
  for(const name of ['ezreal','ahri','lux','blitz','velkoz'])assert.ok(d[name]>0,`seed ${seed}: no ${name} casts`);
  assert.ok(d.ezreal>d.ahri,`seed ${seed}: Ezreal should remain more common than Ahri`);
 }
 t.diagnostic(`casts/min per seed ${JSON.stringify(runs)}`);
 t.diagnostic(`cast mix per seed ${JSON.stringify(mix)}`);
 t.diagnostic(`resolved phase outcomes per seed ${JSON.stringify(phases)}`);
 t.diagnostic(`Ezreal releases during Ahri orb per seed ${JSON.stringify(overlaps)}`);
});
test('Expert idle survival is shorter than Standard across a seeded sample',t=>{
 const results={normal:[],hard:[]};
 for(const difficulty of Object.keys(results))for(let seed=0;seed<8;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:difficulty}});for(let i=0;i<seed;i++)node('newSeed').listeners.click();g.reset('dodge');
  while(g.state==='playing'&&g.time<90)g.update(1/120);
  results[difficulty].push(Number(g.time.toFixed(2)));
 }
 const average=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
 assert.ok(average(results.hard)<average(results.normal),JSON.stringify(results));
 assert.ok(results.hard.every(t=>t<90),`Expert idle survived the sample: ${results.hard}`);
 t.diagnostic(`idle survival seconds ${JSON.stringify(results)}`);
});


test('Expert recovery defers new overlaps without canceling committed missiles',()=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.dodgeDirector.next=999;g.setTime(86);
 const shot=g.fire(g.player.x-100,g.player.y,1000,0,'enemy',10,30,.6);Object.assign(shot,{directed:true,spellName:'EZREAL Q'});
 assert.equal(g.spawnXerathW(),false);assert.equal(g.spawnDodgeVisitor(g.REFERENCE_SPELLS.ezrealDodge),false);
 advance(g,.1);assert.equal(g.stats.hits,1);
});
test('Expert recovery still schedules an isolated encounter',()=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setTime(86);g.setRng(1);g.dodgeDirector.next=0;
 g.update(1/120);assert.ok(g.foes.length||g.hazards.length);
});


test('Expert director may select Xerath Q alongside an existing straight shot',()=>{
 for(const [lo,hi,name] of [[.94,1,'Xerath Q']]){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setTime(50);g.dodgeDirector.next=999;
  const active=g.fire(100,100,1,0,'enemy',10,1,5);Object.assign(active,{directed:true,spellName:'EZREAL Q'});
  let seed=0;while(seed<100000){const roll=((Math.imul(1664525,seed)+1013904223)>>>0)/4294967296;if(roll>=lo&&roll<hi)break;seed++;}
  assert.ok(seed<100000);g.setRng(seed);assert.equal(g.spawnDodgeVisitor(),true,name);assert.ok(g.hazards.some(h=>h.beam),name);
 }
});
test('Expert spawn respects its five-threat cap',()=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setTime(50);
 for(let i=0;i<5;i++){const shot=g.fire(100,100+i*30,1,0,'enemy',10,1,5);Object.assign(shot,{directed:true,spellName:'EZREAL Q'});}
 assert.equal(g.spawnDodgeVisitor(),false);assert.equal(g.foes.length,0);
});
test('visitor spacing detects intersecting entry paths, including a stationary caster',()=>{
 const {g}=boot('ahri');
 const moving={x:200,y:100,phase:'enter',origin:{x:100,y:100},speed:120};
 assert.equal(g.visitorPathsCrowded({x:100,y:100},{x:200,y:100},moving),true);
 assert.equal(g.visitorPathsCrowded({x:100,y:350},{x:200,y:350},moving),false);
 const stationary={x:150,y:150,phase:'cast'};
 assert.equal(g.visitorPathsCrowded({x:100,y:100},{x:200,y:100},stationary),true);
 assert.equal(g.visitorPathsCrowded({x:100,y:300},{x:200,y:300},stationary),false);
});
test('different entering Dodge casters keep separated trajectories',()=>{
 let checked=0;
 for(let seed=0;seed<50;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setTime(50);g.dodgeDirector.next=999;g.setRng((seed*2654435761)>>>0);
  const first=g.enemy(160,260);Object.assign(first,{dodgeVisitor:true,spell:g.REFERENCE_SPELLS.luxDodge,phase:'enter',origin:{x:220,y:260},entry:{x:160,y:260},speed:120});g.setFoes([first]);
  if(!g.spawnDodgeVisitor(g.REFERENCE_SPELLS.ezrealDodge,65))continue;const second=g.foes[1];
  assert.equal(g.visitorPathsCrowded(second.entry,second.origin,first),false);checked++;
 }
 assert.ok(checked>0,'no mixed-caster entries sampled');
});

test('visible Dodge casters wind up during their actual cast without drawing an aim line',()=>{
 for(const [key,art] of [['ezrealDodge','explorerArt'],['blitzDodge',null]]){
  const {g,node,rotations,lines}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
  if(art){node(art).complete=true;node(art).naturalWidth=100;}
  const spec=g.REFERENCE_SPELLS[key],e=g.enemy(800,300);
  Object.assign(e,{dodgeVisitor:true,spell:spec,phase:'cast',pending:{angle:0,spell:spec},charge:spec.cast});g.setFoes([e]);
  g.render();const early=rotations.find(a=>a<0);assert.ok(early<0,key);
  rotations.length=0;lines.length=0;e.charge=spec.cast*.1;g.render();
  const late=rotations.find(a=>a<0);assert.ok(late<early,key);
  assert.ok(!lines.some(p=>Math.abs(p.x-(e.x+spec.range))<1e-6),key);
 }
});


test('Cassiopeia cone and facing distinguish turn-away, face and escape',()=>{
 for(const [scenario,facing,dy,hit] of [['face',Math.PI,0,true],['turn',0,0,true],['outside',Math.PI,300,false]]){
  const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.facing=facing;
  const h={x:g.player.x-200,y:g.player.y+dy,angle:0,cassio:true,casting:true,ttl:.005,directed:true,spellName:'CASSIOPEIA R',threat:true};g.hazards.push(h);
  g.update(.01);assert.equal(g.stats.hits,Number(hit),scenario);assert.equal(g.player.root,0);
  assert.equal(g.dodgeDirector.cassFails,Number(scenario==='face'));assert.equal(g.dodgeDirector.cassTurns,Number(scenario==='turn'));assert.equal(g.dodgeDirector.cassEscapes,Number(scenario==='outside'));
  if(hit)assert.ok(Math.abs(g.stats.damage-125/1.3)<1e-8);
 }
});
test('Dodge uses Tier-1 boots and compact readable collision',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.update(0);
 assert.equal(g.AHRI.speed,177.5);assert.equal(g.player.hitRadius,27);
 assert.equal(g.DODGE_DIRECTOR.hard.interval,.19);
 const e=g.enemy(900,330),spell=g.REFERENCE_SPELLS.ezrealDodge;
 Object.assign(e,{dodgeVisitor:true,pending:{spell,angle:Math.PI,threat:true},charge:0});g.releaseEnemy(e);
 assert.equal(g.shots[0].r,spell.radius*.9);
});
test('Cassiopeia has a short 1.05-second reaction window and visibly departs',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;assert.ok(g.spawnCassioR());
 const h=g.hazards[0];assert.equal(h.ttl,.55);advance(g,.56);assert.equal(h.casting,true);assert.ok(h.ttl>.48&&h.ttl<=.5);
 g.player.facing=0;advance(g,.51);assert.equal(h.departing,true);assert.equal(h.casting,false);assert.ok(h.ttl>0&&h.ttl<=.32);
});
test('Cassiopeia spawn is isolated and appears before committing her cast',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;assert.ok(g.spawnCassioR());
 const h=g.hazards[0];assert.equal(h.casting,false);assert.equal(g.spawnDodgeVisitor(),false);advance(g,.56);
 assert.equal(h.casting,true);assert.equal(g.dodgeDirector.cassio,1);assert.ok(h.ttl>0);
});


test('moving away from Cassiopeia changes facing before impact without immobilization',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.facing=Math.PI;
 const h={x:g.player.x-200,y:g.player.y,angle:0,cassio:true,casting:true,ttl:.5,directed:true,spellName:'CASSIOPEIA R',threat:true};g.hazards.push(h);
 advance(g,.1);g.moveTo(g.player.x+150,g.player.y);advance(g,.42);
 assert.equal(g.dodgeDirector.cassTurns,1);assert.equal(g.dodgeDirector.cassFails,0);assert.equal(g.stats.hits,1);assert.equal(g.player.root,0);
});
test('Cassiopeia defers an unreactable cast rather than immobilizing the player',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.root=.6;
 const h={x:g.player.x-200,y:g.player.y,cassio:true,casting:false,ttl:.001,directed:true,spellName:'CASSIOPEIA R',directorScheduled:true};g.hazards.push(h);
 g.update(.01);assert.equal(g.dodgeDirector.cassio,0);assert.equal(g.hazards.length,0);assert.ok(g.dodgeDirector.cassAt>g.time);
});
test('Cassiopeia defers if the player leaves range during setup, without a false dodge',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const h={x:g.player.x-426,y:g.player.y,cassio:true,casting:false,ttl:.001,directed:true,spellName:'CASSIOPEIA R',directorScheduled:true};g.hazards.push(h);
 g.update(.01);assert.equal(g.dodgeDirector.cassio,0);assert.equal(g.dodgeDirector.attempted,0);
 assert.equal(g.dodgeDirector.cassEscapes,0);assert.equal(g.dodged,0);assert.equal(g.hazards.length,0);assert.ok(g.dodgeDirector.cassAt>g.time);
});
test('Cassiopeia can commit at the range boundary and credit a subsequent escape',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const h={x:g.player.x-375,y:g.player.y,cassio:true,casting:false,ttl:.001,directed:true,spellName:'CASSIOPEIA R'};g.hazards.push(h);
 g.update(.01);assert.equal(h.casting,true);assert.equal(g.dodgeDirector.cassio,1);
 g.moveTo(g.player.x+100,g.player.y);advance(g,.51);assert.equal(g.dodgeDirector.cassEscapes,1);assert.equal(g.dodged,1);
});
test('Cassiopeia outcome is preserved in the result after a lethal hit',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.hp=1;g.player.facing=Math.PI;
 const h={x:g.player.x-200,y:g.player.y,angle:0,cassio:true,casting:true,ttl:.001,directed:true,spellName:'CASSIOPEIA R'};g.hazards.push(h);
 g.update(.01);assert.equal(g.state,'ended');assert.match(node('dodgeBreakdownText').textContent,/1 facing her/);assert.match(node('dodgeBreakdownText').textContent,/CASSIOPEIA R: 0 avoided \/ 1 hit/);
});
test('Cassiopeia results explain the turn-away lesson only after a cast',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 g.end(false);assert.doesNotMatch(node('dodgeBreakdownText').textContent,/Turning away avoids/);
 g.reset('dodge');g.dodgeDirector.next=999;g.dodgeDirector.cassio=1;g.end(false);
 const text=node('dodgeBreakdownText').textContent;
 assert.match(text,/Turning away avoids the stun in League, but still takes damage inside the cone/);
 assert.match(text,/This drill applies neither stun nor slow/);
});

test('Cassiopeia is scheduled in sustained Expert endless play',()=>{
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.player.hp=g.player.maxHp=1000000;
 advance(g,600);assert.equal(g.state,'playing');assert.ok(g.dodgeDirector.cassio>=1);
});

test('Flash away changes the Cassiopeia facing outcome while still in the cone',()=>{
 const {g,node}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;g.player.facing=Math.PI;
 const h={x:g.player.x-200,y:g.player.y,angle:0,cassio:true,casting:true,ttl:.25,directed:true,spellName:'CASSIOPEIA R'};g.hazards.push(h);
 node('arena').listeners.pointermove({clientX:g.player.x+80,clientY:g.player.y,buttons:0});g.cast('f');advance(g,.26);
 assert.equal(g.dodgeDirector.cassTurns,1);assert.equal(g.stats.hits,1);assert.equal(g.player.root,0);
});
test('Cassiopeia setup and cast freeze during pause and render without extra assets',()=>{
 const {g}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;assert.ok(g.spawnCassioR());const h=g.hazards[0],ttl=h.ttl;
 assert.doesNotThrow(()=>g.render());g.pause();advance(g,.5);assert.equal(h.ttl,ttl);g.pause();advance(g,.1);assert.ok(h.ttl<ttl);
});

test('Cassiopeia training cone and facing boundaries use centre geometry',()=>{
 const {g}=boot('ahri'),h={x:0,y:0,angle:0};
 const at=(distance,degrees)=>({x:distance*Math.cos(degrees*Math.PI/180),y:distance*Math.sin(degrees*Math.PI/180)});
 assert.equal(g.cassioConeContains(h,at(375,0)),true);assert.equal(g.cassioConeContains(h,at(375.1,0)),false);
 assert.equal(g.cassioConeContains(h,at(300,39.9)),true);assert.equal(g.cassioConeContains(h,at(300,40.1)),false);
 assert.equal(g.facingCassio(h,{x:200,y:0},Math.PI),true);assert.equal(g.facingCassio(h,{x:200,y:0},0),false);
});


test('Cassiopeia uses a bounded sprite with a safe missing-image fallback',()=>{
 const {g,node,drawSizes}=boot('ahri');g.reset('dodge');const art=node('serpentArt');art.complete=true;art.naturalWidth=100;
 g.drawChampion(600,300,0,false,false,1,0,'cassio');assert.deepEqual(drawSizes.find(x=>x[0]===art).slice(1),[-37,-79,74,80]);
 art.naturalWidth=0;assert.doesNotThrow(()=>g.drawChampion(600,300,0,false,false,1,0,'cassio'));
 const missing=boot('ahri',{missingNodes:['serpentArt']});missing.g.reset('dodge');assert.doesNotThrow(()=>missing.g.drawChampion(600,300,0,false,false,1,0,'cassio'));
});


test('Cassiopeia release shows its effect only at impact, not as a targeting guide',()=>{
 const {g,arcs}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const h={x:g.player.x-200,y:g.player.y,angle:0,cassio:true,casting:true,ttl:.05,directed:true,spellName:'CASSIOPEIA R'};g.hazards.push(h);
 g.render();assert.ok(!arcs.some(a=>a.r===375));g.update(.06);arcs.length=0;g.render();assert.ok(arcs.some(a=>a.r===375));
});

test('Cassiopeia cast cue grows during windup without revealing the cone',()=>{
 const {g,node,arcs}=boot('ahri');g.reset('dodge');g.dodgeDirector.next=999;
 const art=node('serpentArt');art.complete=true;art.naturalWidth=100;
 const h={x:g.player.x-200,y:g.player.y,angle:0,cassio:true,casting:true,ttl:.45,directed:true,spellName:'CASSIOPEIA R'};g.hazards.push(h);
 g.render();const early=arcs.find(a=>a.x===0&&a.y===-57);assert.ok(early);
 arcs.length=0;h.ttl=.1;g.render();const late=arcs.find(a=>a.x===0&&a.y===-57);
 assert.ok(late.r>early.r);assert.ok(!arcs.some(a=>a.r===425));
 arcs.length=0;h.casting=false;g.render();assert.ok(!arcs.some(a=>a.x===0&&a.y===-57));
});
