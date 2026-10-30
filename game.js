"use strict";
(()=>{
const cv=document.getElementById("arena"),ctx=cv.getContext("2d");
const $=id=>document.getElementById(id),ui={overlay:$("overlay"),title:$("menuTitle"),desc:$("menuDescription"),buttons:$("modeButtons"),foot:$("menuFooter"),resume:$("resumeBtn"),mode:$("modeValue"),time:$("timeValue"),kills:$("killsValue"),dodged:$("dodgedValue"),health:$("healthText"),fill:$("healthFill"),pause:$("pauseBtn"),restart:$("restartBtn"),toast:$("toast")};
const W=1200,H=675,TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),rand=(a,b)=>a+random()*(b-a);
const PRESETS={easy:{speed:.8,warning:.6,spawn:1.3,cap:4},normal:{speed:1,warning:.42,spawn:1,cap:6},hard:{speed:1.18,warning:.3,spawn:.78,cap:7}};
let difficulty="normal",seed=73129,rng=seed,hazards=[],waves=0;
function random(){rng=(Math.imul(1664525,rng)+1013904223)>>>0;return rng/4294967296;}
const cosmetic=(a,b)=>a+Math.random()*(b-a);
const COLORS={player:"#6ff5df",enemy:"#ff858d",bullet:"#ffb17f"};
const ATTACK={range:275,windup:.18,period:.72};
const STEP=1/120;let accumulator=0;
// Closest approach of two moving circles, also used for fast missiles.
function segmentDistance(ax,ay,bx,by){const dx=bx-ax,dy=by-ay;const t=clamp(-(ax*dx+ay*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(ax+dx*t,ay+dy*t);}
function threatening(s){const v2=s.vx*s.vx+s.vy*s.vy;if(!v2)return false;const t=((player.x-s.x)*s.vx+(player.y-s.y)*s.vy)/v2;return t>0&&t<=Math.min(.8,s.ttl)&&Math.hypot(s.x+s.vx*t-player.x,s.y+s.vy*t-player.y)<=s.r+player.r*.75;}
const CD={q:3,w:6,e:9,r:15,f:18};
let state="menu",mode="dodge",time=0,last=0,kills=0,dodged=0,spawn=0,aim={x:W/2+120,y:H/2},mouse={x:W/2,y:H/2},player,foes=[],shots=[],fx=[],keys=new Set(),attackMove=false,toastTime=0,enemySeq=0,stats;
function reset(nextMode){mode=nextMode;time=0;kills=0;dodged=0;spawn=0;enemySeq=0;rng=seed;hazards=[];waves=0;stats={released:0,cancelled:0,hits:0,blocked:0,damage:0,moving:0,autoDamage:0,missed:0};accumulator=0;foes=[];shots=[];fx=[];keys.clear();attackMove=false;player={x:W/2,y:H/2,r:17,hp:160,maxHp:160,speed:270,target:null,focus:null,order:null,facing:0,motion:0,hitFlash:0,attackTimer:0,windup:0,windupTarget:null,cd:{q:0,w:0,e:0,r:0,f:0},invuln:0,flashTrail:0};state="playing";ui.pause.textContent="PAUSE P";$("encounterValue").textContent=difficulty.toUpperCase()+" · SEED "+seed;ui.overlay.classList.add("hidden");ui.pause.disabled=false;ui.restart.disabled=false;$("settings").hidden=false;ui.mode.textContent=mode==="dodge"?"DODGE TRIAL":mode==="lastHit"?"LAST-HIT LAB":"KITE ARENA";$("killsLabel").textContent=mode==="lastHit"?"CS":"KILLS";$("dodgedLabel").textContent=mode==="lastHit"?"MISSED":"DODGED";updateUI();}
function showMenu(title,desc,finished=false){attackMove=false;ui.pause.disabled=true;state=finished?"ended":"menu";ui.overlay.classList.remove("hidden");ui.title.innerHTML=title;ui.desc.textContent=desc;ui.buttons.hidden=false;ui.foot.hidden=false;ui.resume.hidden=true;$("settings").hidden=false;ui.pause.textContent="PAUSE P";}
function pause(){attackMove=false;if(state==="playing"){state="paused";ui.overlay.classList.remove("hidden");ui.title.innerHTML="PAUSED<span>.</span>";ui.desc.textContent="Take a moment, then return to the arena.";ui.buttons.hidden=true;ui.foot.hidden=true;ui.resume.hidden=false;$("settings").hidden=true;ui.pause.textContent="RESUME P";}else if(state==="paused"){state="playing";ui.overlay.classList.add("hidden");ui.pause.textContent="PAUSE P";}}
function end(win){
 if(state!=="playing")return;
 if(mode==="lastHit"){for(const e of foes)if(e.alive&&e.minion){e.alive=false;stats.missed++;}}
 updateUI();
 const score=mode==="dodge"?Math.round(time*10+dodged*15):kills*100+Math.round(player.hp);
 let description;
 if(mode==="lastHit")description=`${kills} / 15 CS · ${stats.missed} missed · ${stats.released} autos · ${stats.cancelled} cancelled. Gold bars mark last-hit health (28 damage).`;
 else if(mode==="dodge")description=`Survived ${time.toFixed(1)}s · ${dodged} threats avoided · ${stats.hits} hits · ${stats.blocked} blocked · ${score} points.`;
 else description=`Defeated ${kills} enemies · ${(stats.autoDamage/Math.max(time,1)).toFixed(1)} auto DPS · ${stats.released} autos · ${stats.cancelled} cancelled · ${Math.round(stats.moving/Math.max(time,1)*100)}% moving · ${stats.hits} hits taken.`;
 showMenu(win?"TRIAL <span>COMPLETE.</span>":"YOU <span>FELL.</span>",description,true);
}
function notify(s){ui.toast.textContent=s;ui.toast.classList.add("show");toastTime=1.35;}
function updateUI(){ui.time.textContent=String(Math.floor(time/60)).padStart(2,"0")+":"+String(Math.floor(time%60)).padStart(2,"0");ui.kills.textContent=kills;ui.dodged.textContent=mode==="lastHit"?stats.missed:dodged;ui.health.textContent=Math.max(0,Math.ceil(player.hp))+" / "+player.maxHp;ui.fill.style.width=(100*clamp(player.hp/player.maxHp,0,1))+"%";for(const key of Object.keys(CD)){const locked=mode==="lastHit"&&["q","e","r"].includes(key);const cd=player.cd[key],el=$("cd"+key.toUpperCase());el.textContent=locked?"—":cd>0?cd.toFixed(cd<1?1:0):"";el.closest(".ability").classList.toggle("on-cd",locked||cd>0);}}
function burst(x,y,color,n=11){for(let i=0;i<n;i++){const a=cosmetic(0,TAU),v=cosmetic(50,200);fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,ttl:cosmetic(.25,.55),max:.55,color,r:cosmetic(1,3.8)});}}
function number(x,y,value,color){fx.push({x,y:y-30,vx:0,vy:-38,ttl:.7,max:.7,color,text:String(value)});}
function enemy(x,y){return {id:++enemySeq,x,y,r:20,hp:mode==="kite"?88:58,maxHp:mode==="kite"?88:58,speed:mode==="kite"?rand(75,108):rand(85,135),shoot:rand(.5,1.1),strafe:random()<.5?-1:1,spin:rand(0,TAU),hit:0,castCount:0,charge:0,pending:null,alive:true};}
function addWave(){
 if(waves>=5)return;waves++;
 for(let i=0;i<3;i++){
  const e=enemy(910+i*8,245+i*90);e.minion=true;e.r=14;e.hp=e.maxHp=88;e.speed=65;e.tick=1+i*.32;e.destination=waves%2?820:875;foes.push(e);
 }
 notify("WAVE "+waves+" / 5 — TIME YOUR LAST HITS");
}
function updateMinion(e,dt){
 e.hit=Math.max(0,e.hit-dt);
 if(e.x>e.destination){e.x=Math.max(e.destination,e.x-e.speed*dt);return;}
 e.tick-=dt;if(e.tick<=0){
  const damage=difficulty==="easy"?6:difficulty==="hard"?12:8;e.tick=.85;
  const shot=fire(e.destination-80,e.y,380,0,"allied",damage,3,1);shot.targetId=e.id;

 }
}
function addEnemy(){if(foes.length>= (mode==="kite"?5:PRESETS[difficulty].cap))return;const edge=Math.floor(rand(0,4));let x=edge===0?-30:edge===1?W+30:rand(70,W-70),y=edge===2?-30:edge===3?H+30:rand(90,H-90);foes.push(enemy(x,y));}
function fire(x,y,vx,vy,kind,damage,r=8,life=4){shots.push({x,y,px:x,py:y,vx,vy,kind,damage,r,ttl:life,alive:true,hit:false,threat:false});return shots[shots.length-1];}
// Lock aim at telegraph start; players can read and bait the cast.
function shootEnemy(e){
 const preset=PRESETS[difficulty];e.castCount++;
 const a=Math.atan2(player.y-e.y,player.x-e.x);
 if(mode==="dodge"&&e.castCount%3===0){
  const h={x:clamp(player.x,65,W-65),y:clamp(player.y,100,H-70),r:64,ttl:preset.warning+.45,max:preset.warning+.45,threat:false};hazards.push(h);
  e.shoot=2.2*preset.spawn;e.pending=null;e.charge=0;
 }else{
  e.pending={angle:a,fan:mode==="dodge"&&e.castCount%2===0};e.charge=preset.warning;e.shoot=999;
 }
}
function releaseEnemy(e){
 const p=e.pending;if(!p)return;
 const speed=(mode==="dodge"?340+Math.min(90,time*2):340)*PRESETS[difficulty].speed;
 for(const offset of p.fan?[-.23,0,.23]:[0])fire(e.x,e.y,Math.cos(p.angle+offset)*speed,Math.sin(p.angle+offset)*speed,"enemy",18,7);
 e.pending=null;e.charge=0;e.shoot=rand(1.35,2.2)*PRESETS[difficulty].spawn*Math.max(.6,1-time/120);
}
function damageEnemy(e,d){if(!e.alive)return;e.hp-=d;e.hit=.18;number(e.x,e.y,d,"#b8fff0");burst(e.x,e.y,"#80f9eb",5);if(e.hp<=0){e.alive=false;kills++;burst(e.x,e.y,"#ffbd85",20);player.hp=Math.min(player.maxHp,player.hp+5);if(mode==="kite"&&kills>=10)end(true);}}
function takeHit(d){if(player.invuln>0||state!=="playing")return;player.hp-=d;stats.hits++;stats.damage+=d;player.hitFlash=.22;number(player.x,player.y,"−"+d,"#ff9c98");player.invuln=.14;burst(player.x,player.y,"#ff8e91",14);if(player.hp<=0){player.hp=0;end(false);}}
// Orders persist until superseded. Movement cancels only the uncommitted windup.
function cancelAttack(){if(player.windup>0){stats.cancelled++;player.windup=0;player.windupTarget=null;}}
function startAttack(e){
if(!e||!e.alive||player.attackTimer>0||player.windup>0||dist(player,e)>ATTACK.range)return;
player.target=null;player.windup=ATTACK.windup;player.windupTarget=e.id;
player.facing=Math.atan2(e.y-player.y,e.x-player.x);
}
function attackOrder(e){if(player.windupTarget!==e.id)cancelAttack();player.order={type:"attack",id:e.id};player.focus=e.id;player.target=null;}
function updateOrder(){
const order=player.order;if(!order)return;
if(order.type==="attack"){
 const t=foes.find(e=>e.id===order.id&&e.alive);
 if(!t){player.order=null;player.focus=null;player.target=null;cancelAttack();return;}
 player.focus=t.id;
 if(dist(player,t)>ATTACK.range){player.target={x:t.x,y:t.y};}else{player.target=null;startAttack(t);}
}else if(order.type==="attackMove"){
 // Prefer a unit near the clicked point among units already inside attack range.
 let t=null,best=Infinity;
 for(const e of foes)if(e.alive&&dist(player,e)<=ATTACK.range){const d=dist(e,order);if(d<best){best=d;t=e;}}
 player.focus=t?t.id:null;
 if(t){player.target=null;startAttack(t);}else player.target=dist(player,order)>1?{x:order.x,y:order.y}:null;
}
}
function nearestEnemy(x,y,r=Infinity){let best=null,bd=r;for(const e of foes)if(e.alive){const d=Math.hypot(e.x-x,e.y-y);if(d<bd){best=e;bd=d;}}return best;}
function cast(key){if(state!=="playing"||player.cd[key]>0)return;if(mode==="lastHit"&&["q","e","r"].includes(key)){notify("LAST-HIT LAB — USE AUTO ATTACKS (28 DAMAGE)");return;}const a=Math.atan2(aim.y-player.y,aim.x-player.x),d={x:Math.cos(a),y:Math.sin(a)};cancelAttack();player.cd[key]=CD[key];if(key==="q"){fire(player.x+d.x*24,player.y+d.y*24,d.x*770,d.y*770,"q",45,10,1);burst(player.x,player.y,"#76ffff",7);}
if(key==="w"||key==="f"){const len=key==="w"?135:240;const x=player.x,y=player.y;player.x=clamp(player.x+d.x*len,25,W-25);player.y=clamp(player.y+d.y*len,65,H-38);player.target=null;player.focus=null;player.order=null;player.windup=0;player.invuln=key==="w"?.26:.16;for(let i=0;i<13;i++)fx.push({x:x+(player.x-x)*i/13,y:y+(player.y-y)*i/13,vx:cosmetic(-20,20),vy:cosmetic(-20,20),ttl:.35,max:.35,color:key==="f"?"#f8cf7c":"#74f0eb",r:cosmetic(2,6)});}
if(key==="e"){for(const foe of foes)if(foe.alive&&dist(player,foe)<175)damageEnemy(foe,38);for(const s of shots)if(s.kind==="enemy"&&dist(player,s)<165){s.alive=false;stats.blocked++;}burst(player.x,player.y,"#85fbe4",28);}
if(key==="r"){for(const offset of [-.35,-.18,0,.18,.35]){const v=a+offset;fire(player.x+Math.cos(v)*25,player.y+Math.sin(v)*25,Math.cos(v)*630,Math.sin(v)*630,"r",32,8,1.4);}}
updateUI();}
function moveTo(x,y){cancelAttack();attackMove=false;player.order=null;player.target={x:clamp(x,20,W-20),y:clamp(y,60,H-35)};player.focus=null;}
function update(dt){if(state!=="playing")return;time+=dt;if((mode==="dodge"||mode==="lastHit")&&time>=60){end(true);return;}
spawn-=dt;if(spawn<=0){if(mode==="lastHit")addWave();else addEnemy();spawn=(mode==="dodge"?Math.max(1.35,3.5-time*.026):Math.max(.9,1.6-time*.015))*PRESETS[difficulty].spawn;if(mode==="lastHit")spawn=10;}
for(const k of Object.keys(CD))player.cd[k]=Math.max(0,player.cd[k]-dt);player.hitFlash=Math.max(0,player.hitFlash-dt);player.invuln=Math.max(0,player.invuln-dt);player.attackTimer=Math.max(0,player.attackTimer-dt);
updateOrder();
const oldX=player.x,oldY=player.y;
if(player.windup>0){player.windup=Math.max(0,player.windup-dt);if(player.windup<1e-8){player.windup=0;const t=foes.find(e=>e.id===player.windupTarget&&e.alive);
 if(t&&dist(player,t)<=ATTACK.range+35){const a=Math.atan2(t.y-player.y,t.x-player.x);const shot=fire(player.x,player.y,Math.cos(a)*920,Math.sin(a)*920,"auto",28,5,1.1);shot.targetId=t.id;stats.released++;player.attackTimer=ATTACK.period-ATTACK.windup;}
 player.windupTarget=null;
}}
if(player.target&&player.windup<=0){const dx=player.target.x-player.x,dy=player.target.y-player.y,len=Math.hypot(dx,dy);if(len<1)player.target=null;else{const step=Math.min(player.speed*dt,len);player.x+=dx/len*step;player.y+=dy/len*step;player.facing=Math.atan2(dy,dx);stats.moving+=dt;player.motion+=dt*15;}}
player.x=clamp(player.x,22,W-22);player.y=clamp(player.y,59,H-36);
const previousFoes=new Map(foes.map(e=>[e.id,{x:e.x,y:e.y}]));
for(const e of foes){if(!e.alive)continue;if(e.minion){updateMinion(e,dt);continue;}e.hit=Math.max(0,e.hit-dt);e.spin+=dt*e.strafe;const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy)||1;let vx=0,vy=0;if(d>230){vx=dx/d;vy=dy/d;}else if(d<155){vx=-dx/d;vy=-dy/d;}vx+=(-dy/d)*Math.sin(e.spin)*.5;vy+=(dx/d)*Math.sin(e.spin)*.5;const mag=Math.hypot(vx,vy)||1;if(!e.pending){e.x=clamp(e.x+vx/mag*e.speed*dt,25,W-25);e.y=clamp(e.y+vy/mag*e.speed*dt,60,H-35);e.shoot-=dt;if(e.shoot<=0&&d<650)shootEnemy(e);}else{e.charge-=dt;if(e.charge<=0)releaseEnemy(e);}if(d<e.r+player.r+1)takeHit(11);}
for(const h of hazards){
 if(dist(player,h)<=h.r+player.r*.75)h.threat=true;
 h.ttl-=dt;if(h.ttl<=0){
  if(dist(player,h)<=h.r+player.r*.75){if(player.invuln>0)stats.blocked++;else takeHit(25);}else if(h.threat)dodged++;
  burst(h.x,h.y,"#f5b57d",24);
 }
}
hazards=hazards.filter(h=>h.ttl>0);
for(const s of shots){if(!s.alive)continue;
 if(s.kind==="auto"||s.kind==="allied"){
  const t=foes.find(e=>e.id===s.targetId&&e.alive);
  if(!t){s.alive=false;continue;}
  const a=Math.atan2(t.y-s.y,t.x-s.x);const speed=s.kind==="auto"?920:380;s.vx=Math.cos(a)*speed;s.vy=Math.sin(a)*speed;
 }
 if(s.kind==="enemy"&&threatening(s))s.threat=true;
 s.px=s.x;s.py=s.y;s.x+=s.vx*dt;s.y+=s.vy*dt;s.ttl-=dt;
 if(s.kind==="enemy"){
  const collision=segmentDistance(s.px-oldX,s.py-oldY,s.x-player.x,s.y-player.y)<=s.r+player.r*.75;
  if(collision){s.alive=false;if(player.invuln>0)stats.blocked++;else takeHit(s.damage);}
  else if(s.ttl<=0||s.x<0||s.x>W||s.y<0||s.y>H){s.alive=false;if(s.threat)dodged++;}
 }else{
  let hit=null,first=Infinity;
  for(const e of foes){if(!e.alive||((s.kind==="auto"||s.kind==="allied")&&e.id!==s.targetId))continue;const prev=previousFoes.get(e.id)||e;
   if(segmentDistance(s.px-prev.x,s.py-prev.y,s.x-e.x,s.y-e.y)<=s.r+e.r){const d=dist({x:s.px,y:s.py},prev);if(d<first){first=d;hit=e;}}
  }
  if(hit){
   if(s.kind==="allied"){hit.hp-=s.damage;hit.hit=.08;if(hit.hp<=0){hit.alive=false;stats.missed++;number(hit.x,hit.y,"MISSED","#eaa7a1");}}
   else{if(s.kind==="auto")stats.autoDamage+=Math.min(hit.hp,s.damage);damageEnemy(hit,s.damage);}s.alive=false;
  }
  if(s.ttl<=0||s.x<0||s.x>W||s.y<0||s.y>H)s.alive=false;
 }
 if(state!=="playing")break;
}
foes=foes.filter(e=>e.alive);if(mode==="lastHit"&&waves===5&&foes.length===0){end(true);return;}shots=shots.filter(s=>s.alive);
for(const f of fx){f.x+=f.vx*dt;f.y+=f.vy*dt;f.ttl-=dt;}fx=fx.filter(f=>f.ttl>0);
if(toastTime>0){toastTime-=dt;if(toastTime<=0)ui.toast.classList.remove("show");}
updateUI();}
function circle(x,y,r,color,fill=true,width=1){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx[fill?"fillStyle":"strokeStyle"]=color;if(!fill)ctx.lineWidth=width;ctx[fill?"fill":"stroke"]();}
function polygon(x,y,r,n,rotation,fill,stroke){ctx.beginPath();for(let i=0;i<=n;i++){const a=rotation+i*TAU/n;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.fill();ctx.stroke();}
// Original vector ranger and enemy mage silhouettes with facing and articulated steps.
function drawChampion(x,y,a,friendly,hit,windup,motion){
 const walk=friendly?!!player.target:!windup;const stride=walk?Math.sin(motion)*4:0;
 ctx.save();ctx.translate(x,y);ctx.scale(1,.62);circle(0,22,24,"#0006");ctx.restore();
 ctx.save();ctx.translate(x,y);ctx.rotate(a);
 ctx.fillStyle="#122a30";ctx.fillRect(-8,-10+stride,17,7);ctx.fillRect(-8,3-stride,17,7);
 ctx.beginPath();ctx.moveTo(9,-10);ctx.lineTo(-21,-16+stride*.4);ctx.quadraticCurveTo(-14,0,-21,16+stride*.4);ctx.lineTo(9,10);ctx.closePath();ctx.fillStyle=friendly?"#1a6668":"#673951";ctx.fill();ctx.strokeStyle=friendly?"#58b9ad":"#b86a81";ctx.lineWidth=1.5;ctx.stroke();
 polygon(0,0,14,6,0,hit?"#fff3dc":friendly?"#327d88":"#883f58",friendly?"#8eebcf":"#db8d9e");
 circle(3,0,8,hit?"#fff":friendly?"#c3d4b1":"#d4b5b6");
 ctx.fillStyle=friendly?"#2f586b":"#482e48";ctx.fillRect(-3,-8,8,16);ctx.fillStyle="#c6fff0";ctx.fillRect(5,-5,3,10);
 ctx.strokeStyle=friendly?"#edce89":"#bf91dc";ctx.lineWidth=3;ctx.beginPath();
 if(friendly){ctx.arc(13+windup*5,0,18,-1.15,1.15);ctx.stroke();ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(20,-16);ctx.lineTo(13-windup*9,0);ctx.lineTo(20,16);ctx.stroke();ctx.beginPath();ctx.moveTo(6-windup*9,0);ctx.lineTo(34,0);ctx.stroke();}
 else{ctx.moveTo(-4,21);ctx.lineTo(25,15);ctx.stroke();circle(25,15,5,windup?"#ffe0a5":"#e1a3de");}
 ctx.restore();
}
function render(){const vw=cv.width,vh=cv.height;ctx.setTransform(vw/W,0,0,vh/H,0,0);ctx.fillStyle="#091b29";ctx.fillRect(0,0,W,H);
const g=ctx.createRadialGradient(W/2,H/2,80,W/2,H/2,700);g.addColorStop(0,"#173d4b");g.addColorStop(.65,"#0f2938");g.addColorStop(1,"#081522");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
ctx.save();
// A stone practice court surrounded by grass and carved boundary markers.
ctx.fillStyle="#142e30";ctx.fillRect(0,0,W,H);
for(let y=0;y<H;y+=42)for(let x=0;x<W;x+=70){const n=(Math.sin(x*13+y*7)+1)/2;ctx.fillStyle=`rgba(91,116,95,${.055+n*.075})`;ctx.fillRect(x+(y%84?35:0),y,68,40);}
ctx.fillStyle="#44534a55";ctx.beginPath();ctx.moveTo(100,H);ctx.lineTo(0,H-110);ctx.lineTo(W-100,45);ctx.lineTo(W,140);ctx.closePath();ctx.fill();
ctx.strokeStyle="#9b9c7855";ctx.lineWidth=6;ctx.strokeRect(34,55,W-68,H-94);
ctx.strokeStyle="#d4bc7d33";ctx.lineWidth=1;ctx.strokeRect(42,63,W-84,H-110);
for(let i=0;i<22;i++){const x=15+i*57;for(const y of [43,H-26]){ctx.fillStyle="#284236";polygon(x,y,14,5,i,"#253e34","#385747");}}
circle(W/2,H/2,115,"#aecba011",false,3);circle(W/2,H/2,120,"#aecba011",false,1);
polygon(W/2,H/2,34,4,Math.PI/4,"#49665a22","#a3bd9b22");
for(const [x,y] of [[34,55],[W-34,55],[34,H-39],[W-34,H-39]]){circle(x,y,16,"#152e30");polygon(x,y,12,4,Math.PI/4,"#576b5c","#adad7c");circle(x,y,4,"#95dcc6");}
ctx.restore();
if(player){
for(const h of hazards){circle(h.x,h.y,h.r,"#e58c6422");circle(h.x,h.y,h.r,"#ffbc80",false,2);circle(h.x,h.y,h.r*(1-h.ttl/h.max),"#ffc08d99",false,3);ctx.font="bold 12px ui-monospace,monospace";ctx.textAlign="center";ctx.fillStyle="#ffd5aa";ctx.fillText("IMPACT",h.x,h.y+4);}
for(const e of foes)if(e.pending){ctx.save();ctx.strokeStyle="#ffc18488";ctx.lineWidth=2;ctx.setLineDash([9,7]);for(const offset of e.pending.fan?[-.23,0,.23]:[0]){const a=e.pending.angle+offset;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(a)*740,e.y+Math.sin(a)*740);ctx.stroke();}ctx.restore();circle(e.x,e.y,29,"#ffcf87",false,2);}
}
if(player){
if(attackMove||player.order){ctx.save();ctx.setLineDash([5,7]);circle(player.x,player.y,ATTACK.range,"#8af0d755",false,1);ctx.restore();}
const focus=foes.find(e=>e.id===player.focus);if(focus)circle(focus.x,focus.y,focus.r+9,"#f7d184",false,2);
ctx.strokeStyle=player.windup>0?"#f7d184":"#7ce8d0";ctx.lineWidth=4;ctx.beginPath();ctx.arc(player.x,player.y,32,-Math.PI/2,-Math.PI/2+TAU*(player.windup>0?1-player.windup/ATTACK.windup:1-player.attackTimer/(ATTACK.period-ATTACK.windup)));ctx.stroke();
ctx.font="bold 10px ui-monospace,monospace";ctx.textAlign="center";ctx.fillStyle="#c5eadf";ctx.fillText(player.windup>0?"WINDUP":player.attackTimer>0?"RECOVERY":"READY",player.x,player.y+49);
if(player.target){circle(player.target.x,player.target.y,13,"#7ee7d288",false,2);ctx.strokeStyle="#7ee7d288";ctx.beginPath();ctx.moveTo(player.target.x-8,player.target.y);ctx.lineTo(player.target.x+8,player.target.y);ctx.moveTo(player.target.x,player.target.y-8);ctx.lineTo(player.target.x,player.target.y+8);ctx.stroke();}
for(const e of foes){if(e.minion){
 // Allied caster and enemy melee minion, with an auto-damage threshold on the bar.
 circle(e.destination-80,e.y+10,15,"#0005");polygon(e.destination-80,e.y,12,5,0,"#317c78","#8ec9a5");
 circle(e.x,e.y+10,17,"#0006");polygon(e.x,e.y,14,5,Math.PI/2,e.hit?"#fff0dc":"#ac6a57","#dfb68c");ctx.fillStyle="#3b333e";ctx.fillRect(e.x+3,e.y-9,10,18);
 const last=e.hp<=28;ctx.fillStyle="#13252b";ctx.fillRect(e.x-25,e.y-30,50,6);ctx.fillStyle=last?"#f8cf77":"#d9827d";ctx.fillRect(e.x-25,e.y-30,50*Math.max(0,e.hp/e.maxHp),6);ctx.fillStyle="#fff3bf";ctx.fillRect(e.x-25+50*28/e.maxHp,e.y-31,1,8);
 ctx.font="bold 11px ui-monospace,monospace";ctx.textAlign="center";ctx.fillStyle=last?"#ffe09b":"#d6cec1";ctx.fillText(Math.ceil(e.hp)+(last?" • LAST HIT":""),e.x,e.y-39);continue;
}drawChampion(e.x,e.y,Math.atan2(player.y-e.y,player.x-e.x),false,e.hit>0,e.pending?1:0,time*7);
ctx.fillStyle="#101e23";ctx.fillRect(e.x-25,e.y-39,50,5);ctx.fillStyle="#ff9290";ctx.fillRect(e.x-25,e.y-39,50*clamp(e.hp/e.maxHp,0,1),5);}
for(const s of shots){ctx.strokeStyle=s.kind==="enemy"?"#f1797999":"#7bf4e899";ctx.lineWidth=s.r*1.5;ctx.beginPath();ctx.moveTo(s.x-s.vx*.04,s.y-s.vy*.04);ctx.lineTo(s.x,s.y);ctx.stroke();circle(s.x,s.y,s.r,s.kind==="enemy"?"#ff9c85":s.kind==="r"?"#f5d47d":"#81fdf1");circle(s.x,s.y,s.r*1.7,s.kind==="enemy"?"#fe626344":"#8df5dd44");}
drawChampion(player.x,player.y,player.facing,true,player.hitFlash>0,player.windup/ATTACK.windup,player.motion);
circle(player.x,player.y,player.r*.75,"#bcffe944",false,1);
if(player.invuln>0)circle(player.x,player.y,25,"#ffe4ad",false,2);
ctx.fillStyle="#102d27";ctx.fillRect(player.x-22,player.y-38,44,4);ctx.fillStyle="#8ceebd";ctx.fillRect(player.x-22,player.y-38,44*player.hp/player.maxHp,4);
}
for(const f of fx){ctx.globalAlpha=clamp(f.ttl/f.max,0,1);if(f.text){ctx.font="bold 15px ui-monospace,monospace";ctx.textAlign="center";ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);}else circle(f.x,f.y,f.r,f.color);}ctx.globalAlpha=1;
if(state==="playing"&&(mode==="dodge"||mode==="lastHit")){ctx.font="700 12px ui-monospace,monospace";ctx.textAlign="center";ctx.fillStyle="#b7d9d9aa";ctx.fillText(mode==="lastHit"?"28 AUTO DAMAGE · GOLD HEALTH = LAST HIT · WAVE "+waves+" / 5":"SURVIVE "+Math.max(0,60-Math.floor(time))+"s",W/2,90);}
}
function loop(ts){const dt=last?Math.min((ts-last)/1000,.25):0;last=ts;if(state==="playing"){accumulator+=dt;while(accumulator>=STEP&&state==="playing"){update(STEP);accumulator-=STEP;}}else accumulator=0;render();requestAnimationFrame(loop);}
function coords(e){const b=cv.getBoundingClientRect();return{x:(e.clientX-b.left)*W/b.width,y:(e.clientY-b.top)*H/b.height};}
cv.addEventListener("contextmenu",e=>e.preventDefault());
cv.addEventListener("pointermove",e=>{mouse=coords(e);aim=mouse;if(state==="playing"&&(e.buttons&2)){const t=nearestEnemy(mouse.x,mouse.y,30);if(t)attackOrder(t);else moveTo(mouse.x,mouse.y);}});
cv.addEventListener("pointerdown",e=>{if(state!=="playing")return;e.preventDefault();mouse=coords(e);aim=mouse;
if(e.button===2){attackMove=false;const t=nearestEnemy(mouse.x,mouse.y,30);if(t)attackOrder(t);else moveTo(mouse.x,mouse.y);}
else if(e.button===0){if(attackMove){cancelAttack();player.order={type:"attackMove",x:clamp(mouse.x,22,W-22),y:clamp(mouse.y,59,H-36)};player.target=null;player.focus=null;attackMove=false;notify("ATTACK MOVE");}else{const t=nearestEnemy(mouse.x,mouse.y,24);if(t)attackOrder(t);}}
});
window.addEventListener("keydown",e=>{const k=e.key.toLowerCase();if(e.repeat)return;if(["q","w","e","r","f","a","s","p","escape"].includes(k))e.preventDefault();if(k==="p"||k==="escape"){if(state==="playing"||state==="paused")pause();return;}if(state!=="playing"||e.repeat)return;if(k==="s"){moveTo(player.x,player.y);return;}if(k==="a"){attackMove=true;notify("ATTACK MOVE — LEFT CLICK");return;}if(CD[k])cast(k);});
window.addEventListener("blur",()=>{if(state==="playing")pause();});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&state==="playing")pause();});
$("difficulty").addEventListener("change",e=>{difficulty=e.target.value;});
$("newSeed").addEventListener("click",()=>{seed=(seed+104729)%1000000;$("seedLabel").textContent="SEED "+seed;});
document.querySelectorAll("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>reset(btn.dataset.mode)));
$("menuBtn").addEventListener("click",()=>showMenu("CHOOSE YOUR <span>DRILL.</span>","Practice a mechanic, choose your difficulty, then repeat the same encounter to measure improvement."));
ui.resume.addEventListener("click",pause);ui.pause.addEventListener("click",pause);ui.restart.addEventListener("click",()=>{if(player)reset(mode);});
function resize(){const b=cv.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.max(1,Math.round(b.width*dpr));cv.height=Math.max(1,Math.round(b.height*dpr));}
window.addEventListener("resize",resize);resize();requestAnimationFrame(loop);
})();
