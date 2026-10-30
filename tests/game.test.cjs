// Run the actual game in a minimal DOM. No test-only globals ship to players.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function boot(preset="standard"){
 const nodes=new Map(),draws=[];
 function node(id){if(!nodes.has(id))nodes.set(id,{textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},listeners:{},addEventListener(k,f){this.listeners[k]=f;},closest(){return this;},setAttribute(k,v){this[k]=v;},getBoundingClientRect(){return {left:0,top:0,width:1200,height:675};}});return nodes.get(id);}
 const ctx=new Proxy({drawImage(img){draws.push(img)},createRadialGradient(){return {addColorStop(){}};}},{get(o,k){return o[k]||(()=>{});}});
 node('arena').getContext=()=>ctx;
 const window={devicePixelRatio:1,listeners:{},addEventListener(k,f){this.listeners[k]=f;}};
 const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){}};
 const sandbox={document,window,requestAnimationFrame(){},Math:Object.create(Math)};
 sandbox.Math.random=()=>.5;
 vm.createContext(sandbox);
 vm.runInContext(fs.readFileSync(require.resolve("../world.js"),"utf8"),sandbox);
 const source=fs.readFileSync(require.resolve('../game.js'),'utf8').replace(/\}\)\(\);\s*$/,`globalThis.g={reset,update,loop,render,drawChampion,enemy,damageEnemy,fire,moveTo,attackOrder,cast,pause,end,segmentDistance,threatening,shootEnemy,releaseEnemy,addWave,addTarget,get bait(){return bait},get sweeps(){return sweeps},get hazards(){return hazards},get player(){return player},get foes(){return foes},get shots(){return shots},get stats(){return stats},get time(){return time},get dodged(){return dodged},get state(){return state},setFoes(v){foes=v},disableSpawn(){spawn=999},setTime(v){time=v},setKills(v){kills=v}};})();`);
 vm.runInContext(source,sandbox);
 const g=sandbox.g;node('attackSpeed').listeners.change({target:{value:preset}});g.reset('kite');g.disableSpawn();
 return {g,node,window,draws,click(x,y,button=2){node('arena').listeners.pointerdown({clientX:x,clientY:y,button,preventDefault(){}});},key(key){window.listeners.keydown({key,repeat:false,preventDefault(){}});}};
}
function foe(g,x=800,y=337.5){const e=g.enemy(x,y);e.speed=0;e.shoot=999;e.hp=e.maxHp=10000;g.setFoes([e]);return e;}
function advance(g,seconds){for(let i=0;i<Math.round(seconds*120);i++)g.update(1/120);}
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
 const {g,node}=boot();g.reset('dodge');g.disableSpawn();g.setTime(59.999);advance(g,.1);assert.equal(g.state,'ended');assert.match(node('menuDescription').textContent,/threats avoided/);g.end(false);assert.match(node('menuTitle').innerHTML,/COMPLETE/);
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
test('last-hit offensive spells are disabled and health threshold renders',()=>{
 const {g,node}=boot();g.reset('lastHit');g.addWave();for(const key of ['q','e','r']){g.cast(key);assert.equal(g.player.cd[key],0);}assert.equal(g.shots.length,0);assert.equal(node('cdQ').textContent,'—');g.render();
});
test('holding right mouse retargets movement immediately',()=>{
 const {g,node}=boot();node('arena').listeners.pointermove({clientX:900,clientY:400,buttons:2});assert.equal(g.player.target.x,900);node('arena').listeners.pointermove({clientX:350,clientY:250,buttons:2});assert.equal(g.player.target.x,350);assert.equal(g.player.target.y,250);
});

test('drill menu exits simulation and repeated pause keys never toggle twice',()=>{
 const {g,node,window,key}=boot();key('p');assert.equal(g.state,'paused');window.listeners.keydown({key:'p',repeat:true,preventDefault(){}});assert.equal(g.state,'paused');node('menuBtn').listeners.click();assert.equal(g.state,'menu');assert.equal(node('settings').hidden,false);g.reset('lastHit');assert.equal(g.state,'playing');assert.equal(node('pauseBtn').disabled,false);
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
 const {g}=boot(),world=require('../world.js');g.player.x=120;g.player.y=150;g.moveTo(400,150);
 let diverted=false;for(let i=0;i<360;i++){g.update(1/120);assert.ok(world.pointWalkable(g.player));if(Math.abs(g.player.y-150)>20)diverted=true;}assert.ok(diverted);assert.ok(Math.hypot(g.player.x-400,g.player.y-150)<2);
});
test('dash stops at a wall, while flash can cross and ends in walkable space',()=>{
 const {g,node}=boot(),world=require('../world.js');g.player.x=100;g.player.y=150;node('arena').listeners.pointermove({clientX:600,clientY:150,buttons:0});g.cast('w');assert.ok(g.player.x<205);assert.ok(world.pointWalkable(g.player));
 g.reset('kite');g.disableSpawn();g.player.x=100;g.player.y=150;g.cast('f');assert.ok(g.player.x>312);assert.ok(world.pointWalkable(g.player));
});
test('a pursuing enemy routes around a wall rather than crossing or getting stuck',()=>{
 const {g}=boot(),world=require('../world.js');g.player.x=500;g.player.y=150;
 const e=foe(g,80,150);e.speed=100;let diverted=false;for(let i=0;i<720;i++){g.update(1/120);assert.ok(world.pointWalkable(e,e.r));if(Math.abs(e.y-150)>10)diverted=true;}
 assert.ok(diverted);assert.ok(Math.hypot(e.x-g.player.x,e.y-g.player.y)<260);
});
test('attack-move navigates around a wall before acquiring a destination',()=>{
 const {g,key,click}=boot(),world=require('../world.js');g.player.x=120;g.player.y=150;
 key('a');click(400,150,0);let diverted=false;for(let i=0;i<360;i++){g.update(1/120);assert.ok(world.pointWalkable(g.player));if(Math.abs(g.player.y-150)>20)diverted=true;}
 assert.ok(diverted);assert.ok(Math.hypot(g.player.x-400,g.player.y-150)<2);
});
test('a fresh move order interrupts a detour immediately',()=>{
 const {g}=boot(),world=require('../world.js');g.player.x=120;g.player.y=150;g.moveTo(400,150);advance(g,.3);g.moveTo(100,350);
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
 advance(g,.02);assert.equal(node('killsValue').textContent,1);g.setTime(59.99);advance(g,.02);assert.equal(g.state,'ended');assert.match(node('menuDescription').textContent,/1 \/ 15 CS · 2 missed · 1 enemies defeated/);
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
 const e=foe(g,730,550);e.targetDummy=true;e.anchorX=700;e.anchorY=550;e.phase=0;e.speed=90;
 for(let i=0;i<1200;i++){g.update(1/120);assert.ok(world.pointWalkable(e,e.r),`target entered a wall at ${e.x}, ${e.y}`);}
});

test('Ahri timing uses level-one cadence and 20 percent windup',()=>{
 for(const fps of [30,60,120]){const {g,node}=boot();node('attackSpeed').listeners.change({target:{value:'ahri'}});g.reset('kite');g.disableSpawn();const e=foe(g);g.attackOrder(e);advance(g,.28);assert.equal(g.stats.released,0);advance(g,.04);assert.equal(g.stats.released,1);g.loop(1000);for(let i=1;i<=fps*4;i++)g.loop(1000+i*1000/fps);assert.equal(g.stats.released,3);assert.match(node('encounterValue').textContent,/AS 0.668/);}
});

test('Ahri CS profile uses 53 damage and separates old timing-only records',()=>{
 const {g,node,window}=boot(),values=new Map();window.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 node('attackSpeed').listeners.change({target:{value:'ahri'}});g.reset('lastHit');g.disableSpawn();g.addWave();const e=g.foes[0];assert.equal(e.hp,465);assert.equal(g.player.speed,165);e.x=820;e.tick=999;e.hp=54;g.attackOrder(e);advance(g,.7);assert.equal(e.hp,1);assert.equal(g.stats.cs,0);
 g.moveTo(600,337.5);e.hp=53;g.attackOrder(e);advance(g,2);assert.equal(e.alive,false);assert.equal(node('killsValue').textContent,1);g.end(true);assert.equal(values.get('lmg.best.v1.lastHit.normal.cs_ahri_v2'),'1');assert.match(node('menuDescription').textContent,/53 damage/);
});
test('Ahri CS unattended waves resolve without breaking the drill',()=>{
 for(const difficulty of ['easy','normal','hard']){const {g,node}=boot();node('attackSpeed').listeners.change({target:{value:'ahri'}});node('difficulty').listeners.change({target:{value:difficulty}});g.reset('lastHit');advance(g,60.02);assert.equal(g.state,'ended');assert.equal(g.stats.missed,12);}
});

test('auto attacks apply armor mitigation at impact and CS lethal boundary',()=>{
 for(const [hp,lethal] of [[26.5,true],[26.6,false]]){const {g,node}=boot();node('attackSpeed').listeners.change({target:{value:'ahri'}});g.reset('lastHit');g.disableSpawn();g.addWave();const e=g.foes[0];e.x=820;e.tick=999;e.armor=100;e.hp=hp;g.attackOrder(e);advance(g,.7);assert.equal(!e.alive,lethal);assert.equal(node('killsValue').textContent,lethal?1:0);if(!lethal)assert.ok(Math.abs(e.hp-.1)<1e-7);g.render();}
});

test('Ahri can secure a minion after allied damage on each difficulty',()=>{
 for(const difficulty of ['easy','normal','hard']){const {g,node}=boot();node('attackSpeed').listeners.change({target:{value:'ahri'}});node('difficulty').listeners.change({target:{value:difficulty}});g.reset('lastHit');g.disableSpawn();g.addWave();const e=g.foes[1];g.player.x=650;g.player.y=e.y;
 for(let i=0;i<1800&&e.alive&&e.hp>53;i++)g.update(1/120);assert.ok(e.alive&&e.hp>0&&e.hp<=53,`${difficulty} has a last-hit window`);g.attackOrder(e);
 for(let i=0;i<120&&e.alive;i++)g.update(1/120);assert.equal(node('killsValue').textContent,1,`${difficulty} secures CS`);}
});

test('reference spells use stated cast, speed, range and mitigated damage',()=>{
 for(const [mode,speed,radius,ttl,damage,root] of [['luxDodge',600,35,650/600,80/1.3,2],['ezrealDodge',1000,30,.6,98/1.21,0]]){const {g,node}=boot();g.reset(mode);advance(g,1.52);const caster=g.foes[0];assert.ok(caster.pending);assert.equal(g.shots.length,0);advance(g,.26);const s=g.shots[0];assert.ok(s);assert.ok(Math.abs(Math.hypot(s.vx,s.vy)-speed)<1e-6);assert.equal(s.r,radius);assert.ok(s.ttl<=ttl&&s.ttl>ttl-.03);advance(g,1);assert.ok(Math.abs(g.stats.damage-damage)<1e-6);assert.equal(g.stats.hits,1);assert.equal(node('killsValue').textContent,1);if(root)assert.ok(g.player.root>1);else assert.equal(g.player.root,0);}
});
test('Lux root prevents movement while flash remains usable and pause freezes it',()=>{
 const {g}=boot();g.reset('luxDodge');advance(g,2.6);assert.ok(g.player.root>0);const x=g.player.x;g.moveTo(x-200,g.player.y);advance(g,.3);assert.equal(g.player.x,x);const root=g.player.root;g.pause();advance(g,1);assert.equal(g.player.root,root);g.pause();g.cast('f');assert.notEqual(g.player.x,x);advance(g,2);assert.equal(g.player.root,0);
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
 const e=g.foes[0];e.x=931;e.y=g.player.y;e.tick=e.meleeTick=999;g.attackOrder(e);advance(g,.31);assert.equal(g.stats.released,1);
});
test('Ahri CS allied melee and caster damage use minion ratios',()=>{
 const {g,node}=boot();node('attackSpeed').listeners.change({target:{value:'ahri'}});g.reset('lastHit');g.disableSpawn();g.addWave();const e=g.foes[0];e.x=e.destination;e.tick=999;e.meleeTick=0;g.update(1/120);assert.ok(Math.abs(e.hp-(465-11-465*.02))<1e-8);
 e.tick=0;e.meleeTick=999;advance(g,.5);const hpAfterMelee=465-11-465*.02;assert.ok(Math.abs(e.hp-(hpAfterMelee-21-hpAfterMelee*.035))<1e-7);
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
test('Ahri Fox-Fire does not cancel an auto windup and is locked in auto-only CS',()=>{
 const {g,node}=boot('ahri');g.reset('kite');g.disableSpawn();const e=foe(g,800);g.attackOrder(e);advance(g,.1);const windup=g.player.windup;g.cast('w');assert.equal(g.player.windup,windup);advance(g,.25);assert.equal(g.stats.released,1);g.reset('lastHit');g.cast('w');assert.equal(g.player.cd.w,0);assert.equal(node('cdW').textContent,'—');
});

test('Ahri Spirit Rush has three timed charges and fires magic bolts',()=>{
 const {g,node}=boot('ahri');g.reset('kite');g.disableSpawn();const e=foe(g,800);e.mr=100;const x=g.player.x;g.cast('r');assert.equal(g.player.rushCharges,2);assert.equal(g.player.cd.r,140);g.cast('r');assert.equal(g.player.rushCharges,2);advance(g,.7);assert.ok(g.player.x>x);assert.ok(Math.abs(e.hp-9962.5)<1e-8);advance(g,.4);assert.match(node('cdR').textContent,/×2/);g.cast('r');assert.equal(g.player.rushCharges,1);advance(g,1.1);g.cast('r');assert.equal(g.player.rushCharges,0);advance(g,1.1);g.cast('r');assert.equal(g.player.rushCharges,0);assert.ok(g.player.cd.r>130);
});
test('Spirit Rush cannot ignore enemy collisions or cast while rooted',()=>{
 const {g}=boot('ahri');g.reset('kite');g.disableSpawn();g.player.root=1;g.cast('r');assert.equal(g.player.cd.r,0);g.player.root=0;g.fire(670,g.player.y,0,0,'enemy',18,5,1);g.cast('r');advance(g,.3);assert.equal(g.stats.hits,1);assert.equal(g.player.invuln,0);
});
