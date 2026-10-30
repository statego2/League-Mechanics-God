// Run the actual game in a minimal DOM. No test-only globals ship to players.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function boot(){
 const nodes=new Map();
 function node(id){if(!nodes.has(id))nodes.set(id,{textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},listeners:{},addEventListener(k,f){this.listeners[k]=f;},closest(){return this;},getBoundingClientRect(){return {left:0,top:0,width:1200,height:675};}});return nodes.get(id);}
 const ctx=new Proxy({createRadialGradient(){return {addColorStop(){}};}},{get(o,k){return o[k]||(()=>{});}});
 node('arena').getContext=()=>ctx;
 const window={devicePixelRatio:1,listeners:{},addEventListener(k,f){this.listeners[k]=f;}};
 const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){}};
 const sandbox={document,window,requestAnimationFrame(){},Math:Object.create(Math)};
 sandbox.Math.random=()=>.5;
 vm.createContext(sandbox);
 const source=fs.readFileSync(require.resolve('../game.js'),'utf8').replace(/\}\)\(\);\s*$/,`globalThis.g={reset,update,loop,render,enemy,fire,moveTo,attackOrder,cast,pause,end,segmentDistance,threatening,shootEnemy,releaseEnemy,addWave,get hazards(){return hazards},get player(){return player},get foes(){return foes},get shots(){return shots},get stats(){return stats},get time(){return time},get dodged(){return dodged},get state(){return state},setFoes(v){foes=v},disableSpawn(){spawn=999},setTime(v){time=v}};})();`);
 vm.runInContext(source,sandbox);
 const g=sandbox.g;g.reset('kite');g.disableSpawn();
 return {g,node,window,click(x,y,button=2){node('arena').listeners.pointerdown({clientX:x,clientY:y,button,preventDefault(){}});},key(key){window.listeners.keydown({key,repeat:false,preventDefault(){}});}};
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
 const {g,node}=boot();node('arena').listeners.pointermove({clientX:900,clientY:400,buttons:2});assert.equal(g.player.target.x,900);node('arena').listeners.pointermove({clientX:300,clientY:200,buttons:2});assert.equal(g.player.target.x,300);assert.equal(g.player.target.y,200);
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
