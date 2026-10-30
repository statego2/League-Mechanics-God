"use strict";
(()=>{
const cv=document.getElementById("arena"),ctx=cv.getContext("2d"),world=LaneWorld;
const $=id=>document.getElementById(id),ui={overlay:$("overlay"),title:$("menuTitle"),desc:$("menuDescription"),buttons:$("modeButtons"),foot:$("menuFooter"),resume:$("resumeBtn"),mode:$("modeValue"),time:$("timeValue"),kills:$("killsValue"),dodged:$("dodgedValue"),health:$("healthText"),fill:$("healthFill"),pause:$("pauseBtn"),restart:$("restartBtn"),toast:$("toast")};
const W=1200,H=675,TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),rand=(a,b)=>a+random()*(b-a);
const PRESETS={easy:{speed:.8,warning:.6,spawn:1.3,cap:4},normal:{speed:1,warning:.42,spawn:1,cap:6},hard:{speed:1.18,warning:.3,spawn:.78,cap:7}};
let difficulty="hard",seed=73129,rng=seed,hazards=[],sweeps=[],sweepTimer=14,waves=0,bait=null,laneEnemyTimer=0;
function random(){rng=(Math.imul(1664525,rng)+1013904223)>>>0;return rng/4294967296;}
const cosmetic=(a,b)=>a+Math.random()*(b-a);
const COLORS={player:"#6ff5df",enemy:"#ff858d",bullet:"#ffb17f"};
const ATTACK={range:275,windup:.18,period:.72};
const ATTACK_PRESETS={ahri:{period:1/.668,windup:.2/.668,label:"0.668"},slow:{period:1.25,windup:.3125,label:"0.80"},standard:{period:.72,windup:.18,label:"1.39"},fast:{period:.5,windup:.125,label:"2.00"}};
let attackPreset="ahri";
// Reference snapshot; positions and collision use an approximate 0.5 canvas-unit scale.
const REFERENCE_SPELLS={luxDodge:{name:"LUX Q",speed:600,range:650,radius:35,cast:.25,raw:80,resist:30,root:2},ezrealDodge:{name:"EZREAL Q",speed:1000,range:600,radius:30,cast:.25,raw:98,resist:21,root:0}};
const referenceSpell=()=>REFERENCE_SPELLS[mode];
const ahriCS=()=>mode==="lastHit"&&attackPreset==="ahri";
const ahriBase=()=>attackPreset==="ahri"&&mode!=="bait";
const autoDamage=()=>ahriBase()?53:28;
const physicalDamage=(raw,armor=0)=>raw*(armor>=0?100/(100+armor):2-100/(100-armor));
const autoThreshold=e=>physicalDamage(autoDamage(),e.armor||0);
const autoSpeed=()=>ahriBase()?875:920; // 0.5 canvas units per League unit, an initial approximation.
function recordSuffix(){return ahriCS()?".cs_ahri_v3":mode==="dodge"&&ahriBase()?".ahri_spells_v2":attackPreset==="standard"?"":".as_"+attackPreset;}
const targetHitRadius=e=>ahriBase()?(e.minion?24:32.5):e.r;
const attackReach=e=>ahriBase()?275+32.5+targetHitRadius(e):ATTACK.range;
function recordLabel(){return difficulty+(attackPreset==="standard"?"":", "+ATTACK_PRESETS[attackPreset].label+" AS");}
const STEP=1/120;let accumulator=0;
// Closest approach of two moving circles, also used for fast missiles.
function segmentDistance(ax,ay,bx,by){const dx=bx-ax,dy=by-ay;const t=clamp(-(ax*dx+ay*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(ax+dx*t,ay+dy*t);}
// Earliest swept-circle contact, in [0,1], or Infinity when paths miss.
function segmentHitTime(ax,ay,bx,by,r){const dx=bx-ax,dy=by-ay,c=ax*ax+ay*ay-r*r;if(c<=0)return 0;const a=dx*dx+dy*dy;if(a<1e-12)return Infinity;const b=2*(ax*dx+ay*dy),disc=b*b-4*a*c;if(disc<0)return Infinity;const t=(-b-Math.sqrt(disc))/(2*a);return t>=0&&t<=1?t:Infinity;}
function threatening(s){const v2=s.vx*s.vx+s.vy*s.vy;if(!v2)return false;const t=((player.x-s.x)*s.vx+(player.y-s.y)*s.vy)/v2;return t>0&&t<=Math.min(.8,s.ttl)&&Math.hypot(s.x+s.vx*t-player.x,s.y+s.vy*t-player.y)<=s.r+player.hitRadius;}
const CD={q:3,w:6,e:9,r:15,f:18};
// Optional synthesized cues: created only after the player enables sound.
const audio={enabled:false,context:null,last:{}};
function toggleSound(){
 if(audio.enabled){audio.enabled=false;$("soundBtn").textContent="SOUND OFF";$("soundBtn").setAttribute("aria-pressed","false");return;}
 try{
  const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)throw Error("unavailable");
  audio.context=audio.context||new AudioContext();audio.enabled=true;$("soundBtn").textContent="SOUND ON";$("soundBtn").setAttribute("aria-pressed","true");
  const resume=audio.context.resume();if(resume&&resume.catch)resume.catch(()=>{});cue("ready");
 }catch{audio.enabled=false;$("soundBtn").textContent="SOUND UNAVAILABLE";$("soundBtn").disabled=true;}
}
function cue(kind){
 if(!audio.enabled||!audio.context)return;
 try{
  const context=audio.context,t=context.currentTime;if(t-(audio.last[kind]??-1)<.08)return;audio.last[kind]=t;
  const tones={attack:[560,390,.07],hit:[190,100,.12],impact:[320,185,.09],dodge:[720,940,.12],ready:[480,720,.1]};
  const [start,end,duration]=tones[kind];const osc=context.createOscillator(),gain=context.createGain();
  osc.type=kind==="hit"?"triangle":"sine";osc.frequency.setValueAtTime(start,t);osc.frequency.exponentialRampToValueAtTime(end,t+duration);
  gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.035,t+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  osc.connect(gain);gain.connect(context.destination);osc.start(t);osc.stop(t+duration+.01);
 }catch{/* audio must never interrupt the drill */}
}
let state="menu",mode="dodge",time=0,last=0,kills=0,dodged=0,spawn=0,aim={x:W/2+120,y:H/2},mouse={x:W/2,y:H/2},player,foes=[],allies=[],shots=[],fx=[],keys=new Set(),attackMove=false,toastTime=0,enemySeq=0,stats;
function reset(nextMode){Object.assign(ATTACK,ATTACK_PRESETS[attackPreset]);mode=nextMode;time=0;kills=0;dodged=0;spawn=0;toastTime=0;ui.toast.classList.remove("show");enemySeq=0;rng=seed;hazards=[];sweeps=[];sweepTimer=14;waves=0;laneEnemyTimer=0;bait=nextMode==="bait"?{phase:"setup",round:0,casts:0,dodges:0,cs:0,missed:0,timer:0}:null;stats={released:0,cancelled:0,hits:0,blocked:0,damage:0,moving:0,autoDamage:0,readyIdle:0,missed:0,cs:0,skillShots:0,skillHits:0};accumulator=0;foes=[];allies=[];shots=[];fx=[];keys.clear();attackMove=false;player={x:W/2,y:H/2,r:17,hitRadius:referenceSpell()||ahriBase()?32.5:12.75,hp:referenceSpell()||ahriBase()?590:160,maxHp:referenceSpell()||ahriBase()?590:160,speed:ahriBase()||referenceSpell()?165:270,target:null,route:[],routeGoal:null,focus:null,order:null,facing:0,motion:0,hitFlash:0,attackTimer:0,windup:0,windupTarget:null,casting:null,fox:null,boost:0,essence:0,rushWindow:0,rushCharges:0,rushLock:0,dashing:null,cd:{q:0,w:0,e:0,r:0,f:0},invuln:0,root:0,flashTrail:0};state="playing";ui.pause.textContent="PAUSE P";$("encounterValue").textContent=difficulty.toUpperCase()+" · AS "+ATTACK_PRESETS[attackPreset].label+" · SEED "+seed;ui.overlay.classList.add("hidden");ui.pause.disabled=false;ui.restart.disabled=false;$("settings").hidden=false;ui.mode.textContent=referenceSpell()?referenceSpell().name+" DODGE":mode==="dodge"?"DODGE TRIAL":mode==="lastHit"?"LAST-HIT LAB":mode==="lane"?"LANE SCENARIO":mode==="bait"?"BAIT · DODGE · CS":mode==="skillshot"?"SKILLSHOT LAB":"KITE ARENA";$("killsLabel").textContent=referenceSpell()?"HITS":(mode==="lastHit"||mode==="bait"||mode==="lane")?"CS":mode==="skillshot"?"HITS":"KILLS";$("dodgedLabel").textContent=mode==="bait"?"DODGES":mode==="lastHit"?"MISSED":mode==="skillshot"?"SHOTS":"DODGED";updateUI();}
function showMenu(title,desc,finished=false){$("menu").scrollTop=0;attackMove=false;ui.pause.disabled=true;state=finished?"ended":"menu";ui.overlay.classList.remove("hidden");ui.title.innerHTML=title;ui.desc.textContent=desc;ui.buttons.hidden=false;ui.foot.hidden=false;ui.resume.hidden=true;$("settings").hidden=false;ui.pause.textContent="PAUSE P";}
function pause(){attackMove=false;if(state==="playing"){$("menu").scrollTop=0;state="paused";ui.overlay.classList.remove("hidden");ui.title.innerHTML="PAUSED<span>.</span>";ui.desc.textContent="Take a moment, then return to the arena.";ui.buttons.hidden=true;ui.foot.hidden=true;ui.resume.hidden=false;$("settings").hidden=true;ui.pause.textContent="RESUME P";}else if(state==="paused"){state="playing";ui.overlay.classList.add("hidden");ui.pause.textContent="PAUSE P";}}
// Records are local and partitioned by drill and difficulty; storage can be unavailable.
function saveRecord(value){
 try{
  const key="lmg.best.v1."+mode+"."+difficulty+recordSuffix();
  const previous=Number(window.localStorage.getItem(key));
  const best=Math.max(Number.isFinite(previous)?previous:0,value);
  window.localStorage.setItem(key,String(best));return best;
 }catch{return null;}
}
function saveKiteRecord(win){
 try{
  const key="lmg.best.v2.kite."+difficulty+recordSuffix();
  const raw=window.localStorage.getItem(key);let old=null;
  try{old=JSON.parse(raw);}catch{/* discard invalid stored data */}
  if(!old||typeof old.won!=="boolean"||!Number.isFinite(old.kills)||!Number.isFinite(old.time))old=null;
  const run={won:win,kills,time:Math.round(time*10)/10};
  const better=!old||(run.won&&!old.won)||(run.won===old.won&&(run.won?run.time<old.time:(run.kills>old.kills||(run.kills===old.kills&&run.time>old.time))));
  const best=better?run:old;window.localStorage.setItem(key,JSON.stringify(best));return best;
 }catch{return null;}
}
function end(win){
 if(state!=="playing")return;
 if(mode==="lastHit"||mode==="lane"){for(const e of foes)if(e.alive&&e.minion){e.alive=false;stats.missed++;}}
 updateUI();
 const score=mode==="dodge"||referenceSpell()?Math.round(time*10+dodged*15):kills*100+Math.round(player.hp);
 let description;
 if(mode==="lane")description=`${stats.cs} / 15 CS · ${stats.missed} missed · ${kills} enemies defeated · ${dodged} threats avoided · ${stats.hits} hits · ${Number(stats.damage.toFixed(1))} damage taken.`;
 else if(mode==="bait")description=`${bait.casts} spells baited · ${bait.dodges} dodged · ${bait.cs} / 3 CS · ${bait.missed} missed · ${Number(stats.damage.toFixed(1))} damage taken.`;
 else if(mode==="skillshot")description=`${stats.skillHits} / ${stats.skillShots} skillshots hit · ${stats.skillShots?Math.round(stats.skillHits/stats.skillShots*100):0}% accuracy · ${kills} targets defeated.`;
 else if(mode==="lastHit")description=`${kills} / ${ahriCS()?12:15} CS · ${stats.missed} missed · ${stats.released} autos · ${stats.cancelled} cancelled. Gold bars mark last-hit health (${autoDamage()} damage).`;
 else if(mode==="dodge"||referenceSpell())description=`Survived ${time.toFixed(1)}s · ${dodged} threats avoided · ${stats.hits} hits · ${Number(stats.damage.toFixed(1))} damage · ${stats.blocked} blocked · ${score} points.`;
 else description=`Defeated ${kills} enemies · ${(stats.autoDamage/Math.max(time,1)).toFixed(1)} auto DPS · ${stats.released} autos · ${stats.cancelled} cancelled · ${Math.round(stats.moving/Math.max(time,1)*100)}% moving · ${stats.readyIdle.toFixed(1)}s ready but not attacking in range · ${stats.hits} hits taken.`;
 const recordValue=mode==="dodge"||referenceSpell()?score:mode==="lane"?stats.cs:(mode==="lastHit"||mode==="bait")?kills:mode==="skillshot"?stats.skillHits:kills;
 const best=mode==="kite"?saveKiteRecord(win):saveRecord(recordValue);
 if(best!==null){
  const label=mode==="kite"?(best.won?`win in ${best.time.toFixed(1)}s`:`${best.kills} kills, ${best.time.toFixed(1)}s`):`${best} ${(mode==="dodge"||referenceSpell())?"points":(mode==="lastHit"||mode==="bait"||mode==="lane")?"CS":"hits"}`;
  description=description.replace(/\.$/,"")+` · Local best (${recordLabel()}): ${label}.`;
 }
 showMenu(win?"TRIAL <span>COMPLETE.</span>":"YOU <span>FELL.</span>",description,true);
}
function notify(s){ui.toast.textContent=s;ui.toast.classList.add("show");toastTime=1.35;}
function updateUI(){ui.time.textContent=String(Math.floor(time/60)).padStart(2,"0")+":"+String(Math.floor(time%60)).padStart(2,"0");ui.kills.textContent=referenceSpell()?stats.hits:mode==="skillshot"?stats.skillHits:mode==="lane"?stats.cs:kills;ui.dodged.textContent=mode==="bait"?bait.dodges:mode==="skillshot"?stats.skillShots:mode==="lastHit"?stats.missed:dodged;ui.health.textContent=Math.max(0,Math.ceil(player.hp))+" / "+player.maxHp;ui.fill.style.width=(100*clamp(player.hp/player.maxHp,0,1))+"%";for(const key of Object.keys(CD)){const locked=(referenceSpell()&&key!=="f"||((mode==="lastHit"||mode==="bait")&&(["q","e","r"].includes(key)||(mode==="lastHit"&&ahriBase()&&key==="w"))||mode==="skillshot"&&["e","r"].includes(key)));const cd=player.cd[key],el=$("cd"+key.toUpperCase());el.textContent=locked?"—":key==="r"&&ahriBase()&&player.rushWindow>0&&player.rushCharges>0?(player.rushLock>0?player.rushLock.toFixed(1):"×"+player.rushCharges):cd>0?cd.toFixed(cd<1?1:0):"";el.closest(".ability").classList.toggle("on-cd",locked||(cd>0&&!(key==="r"&&ahriBase()&&player.rushWindow>0&&player.rushCharges>0&&player.rushLock<=0)));}}
function burst(x,y,color,n=11){for(let i=0;i<n;i++){const a=cosmetic(0,TAU),v=cosmetic(50,200);fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,ttl:cosmetic(.25,.55),max:.55,color,r:cosmetic(1,3.8)});}}
function number(x,y,value,color){fx.push({x,y:y-30,vx:0,vy:-38,ttl:.7,max:.7,color,text:String(value)});}
function enemy(x,y){return {id:++enemySeq,x,y,r:20,hp:mode==="kite"?88:58,maxHp:mode==="kite"?88:58,speed:mode==="kite"?rand(75,108):rand(85,135),shoot:rand(.5,1.1),strafe:random()<.5?-1:1,spin:rand(0,TAU),hit:0,castCount:0,charge:0,pending:null,alive:true};}
function addWave(){
 if(waves>=(ahriCS()?2:5))return;waves++;
 for(let i=0;i<(ahriCS()?6:3);i++){
  const caster=ahriCS()&&i>=3;const row=i%3;const e=enemy(910+(caster?45:0),200+row*100+(caster?35:0));e.minion=true;e.minionType=caster?"caster":"melee";e.wave=waves;e.row=row;e.r=14;e.hp=e.maxHp=ahriCS()?(caster?284:465):88;e.speed=65;e.tick=1+i*.12;e.meleeTick=1+i*.12;e.destination=waves%2?820:875;foes.push(e);
 }
 if(ahriCS())for(let i=0;i<6;i++){
  const caster=i>=3,row=i%3,hp=caster?284:465;
  allies.push({id:-(waves*10+i+1),x:caster?685:725,y:200+row*100+(caster?35:0),r:14,hp,maxHp:hp,armor:0,minion:true,ally:true,minionType:caster?"caster":"melee",wave:waves,row,alive:true,hit:0,tick:1+i*.12,targetId:null});
 }
 notify("WAVE "+waves+" / "+(ahriCS()?2:5)+" — TIME YOUR LAST HITS");
}
function updateMinion(e,dt){
 e.hit=Math.max(0,e.hit-dt);
 if(e.x>e.destination){e.x=Math.max(e.destination,e.x-e.speed*dt);return;}
 if(ahriCS())return;
 e.tick-=dt;if(e.tick<=0){
  const damage=difficulty==="easy"?6:difficulty==="hard"?12:8;e.tick=.85;
  const shot=fire(e.destination-80,e.y,380,0,"allied",damage,3,1);shot.targetId=e.id;

 }
}
// Independent opposing minions: acquire the nearest melee first, keep their target
// until it dies, then retarget. The simplified fixed positions are a training model.
function updateCSWave(dt){
 const red=foes.filter(e=>e.alive&&e.minion),blue=allies.filter(e=>e.alive);
 for(const unit of [...blue,...red]){
  if(!unit.alive)continue;unit.hit=Math.max(0,unit.hit-dt);
  if(!unit.ally&&unit.x>unit.destination)continue;
  const targets=unit.ally?red:blue;
  let target=targets.find(t=>t.alive&&t.id===unit.targetId);
  if(!target){const choices=targets.filter(t=>t.alive&&t.wave===unit.wave);choices.sort((a,b)=>(a.minionType!=="melee")-(b.minionType!=="melee")||dist(unit,a)-dist(unit,b)||a.id-b.id);target=choices[0];unit.targetId=target?target.id:null;}
  if(!target)continue;
  const range=unit.minionType==="melee"?103:323;
  if(dist(unit,target)>range){const dx=target.x-unit.x,dy=target.y-unit.y,d=Math.hypot(dx,dy)||1,step=Math.min(65*dt,Math.max(0,d-range));const next=world.clip(unit,{x:unit.x+dx/d*step,y:unit.y+dy/d*step},unit.r);unit.x=next.x;unit.y=next.y;continue;}
  unit.tick-=dt;if(unit.tick>0)continue;
  if(unit.minionType==="melee"){
   unit.tick+=.8;target.hp-=physicalDamage(11+target.hp*.02,target.armor||0);target.hit=.08;
   if(target.hp<=0){target.alive=false;if(!target.ally){stats.missed++;number(target.x,target.y,"MISSED","#eaa7a1");}}
  }else{
   unit.tick+=1/.667;const a=Math.atan2(target.y-unit.y,target.x-unit.x),s=fire(unit.x,unit.y,Math.cos(a)*380,Math.sin(a)*380,unit.ally?"allied":"enemyMinion",21,3,2);s.targetId=target.id;s.minionBonus=.035;
  }
 }
}
function baitLabel(){
 if(bait.phase==="approach")return `ROUND ${bait.round} / 3 · ${bait.armed?"ENTER":"LEAVE, THEN ENTER"} THE ENEMY THREAT RING`;
 if(bait.phase==="cast"||bait.phase==="dodge")return "DODGE THE LOCKED SKILLSHOT";
 if(bait.phase==="window")return `LAST HIT THE MINION · ${Math.ceil(bait.timer)}s`;
 return "NEXT WAVE";
}
function beginBaitRound(){
 bait.round++;if(bait.round>3){end(true);return;}
 foes=[];shots=[];player.order=null;player.focus=null;cancelAttack();
 const offset=bait.round-2;
 const caster=enemy(910+offset*20,235+offset*10);caster.baitCaster=true;caster.speed=0;
 caster.baitX=caster.x;caster.baitY=caster.y;caster.baitPhase=rand(0,TAU);foes.push(caster);
 const minion=enemy(720+offset*20,380+offset*10);minion.minion=true;minion.r=14;
 minion.hp=minion.maxHp=difficulty==="easy"?34:difficulty==="hard"?40:36;
 minion.destination=minion.x;minion.tick=1.1+(.15*(bait.round-1));foes.push(minion);
 bait.phase="approach";bait.armed=dist(player,caster)>260;notify("ROUND "+bait.round+" — BAIT THE CAST");
}
function resolveBait(didDodge){
 if(bait.phase!=="dodge")return;
 if(didDodge){bait.dodges++;cue("dodge");}
 bait.phase="window";bait.timer=3;
 notify(didDodge?"DODGED — LAST HIT NOW":"HIT — SECURE THE MINION");
}
function updateBait(dt){
 if(bait.phase==="setup"){beginBaitRound();return;}
 const caster=foes.find(e=>e.baitCaster);
 if(bait.phase==="approach"&&caster){
  caster.baitPhase+=dt*(difficulty==="easy"?.7:difficulty==="hard"?1.4:1);
  caster.x=caster.baitX+Math.sin(caster.baitPhase)*24;caster.y=caster.baitY+Math.cos(caster.baitPhase*.7)*12;
 }
 if(bait.phase==="approach"&&caster&&dist(player,caster)>260)bait.armed=true;
 if(bait.phase==="approach"&&bait.armed&&caster&&dist(player,caster)<=260){
  shootEnemy(caster);bait.phase="cast";bait.casts++;notify("CAST BAITED — DODGE!");
 }else if(bait.phase==="cast"&&caster){
  caster.charge-=dt;if(caster.charge<=0){releaseEnemy(caster);bait.phase="dodge";}
 }else if(bait.phase==="window"||bait.phase==="next"){
  bait.timer-=dt;if(bait.timer<=0){if(bait.phase==="window")bait.missed++;beginBaitRound();}
 }
}
// A telegraphed wall with one guaranteed open corridor.
function updateSweeps(dt){
 sweepTimer-=dt;
 if(sweepTimer<=0&&time<55){
  // Keep the gap on the unobstructed central lane for both wall proxies.
  sweeps.push({gap:rand(270,400),remaining:1.4,max:1.4});
  sweepTimer=18;notify("SWEEP INCOMING — FIND THE GAP");
 }
 for(const wall of sweeps){wall.remaining-=dt;if(wall.remaining<=0){
  const speed=230*PRESETS[difficulty].speed;
  for(let y=70;y<=H-40;y+=40)if(Math.abs(y-wall.gap)>=75)fire(0,y,speed,0,"enemy",ahriBase()?45:16,9,W/speed+.5);
 }}
 sweeps=sweeps.filter(w=>w.remaining>0);
}
function addTarget(){
 if(foes.filter(e=>e.targetDummy&&e.alive).length>=3)return;
 let point=null;
 for(let i=0;i<16;i++){const x=rand(720,1040);const candidate={x,y:clamp(610-x*.42+rand(-100,100),105,H-85)};if(world.pointWalkable(candidate,20)&&dist(candidate,player)>250&&foes.every(e=>!e.alive||dist(candidate,e)>85)){point=candidate;break;}}
 if(!point)return;
 const e=enemy(point.x,point.y);e.targetDummy=true;e.hp=e.maxHp=45;e.r=20;
 e.anchorX=e.x;e.anchorY=e.y;e.phase=rand(0,TAU);e.speed=difficulty==="easy"?55:difficulty==="hard"?135:90;
 foes.push(e);
}
function updateTarget(e,dt){
 e.hit=Math.max(0,e.hit-dt);e.phase+=dt*e.speed/65;
 const desired={x:clamp(e.anchorX+Math.sin(e.phase)*85,55,W-55),y:clamp(e.anchorY+Math.sin(e.phase*.57)*45,105,H-85)};
 const next=world.clip(e,desired,e.r);e.x=next.x;e.y=next.y;
}
function addEnemy(){
 if(foes.length>=(mode==="kite"?5:PRESETS[difficulty].cap))return;
 // Enter from the two ends of the lane, not through the painted river and walls.
 const blueEnd=random()<.5;
 const x=blueEnd?rand(25,160):rand(W-160,W-25);
 const y=blueEnd?rand(H-150,H-45):rand(70,180);
 foes.push(enemy(x,y));
}
function fire(x,y,vx,vy,kind,damage,r=8,life=4){shots.push({x,y,px:x,py:y,vx,vy,kind,damage,r,ttl:life,alive:true,hit:false,threat:false});return shots[shots.length-1];}
// Lock aim at telegraph start; players can read and bait the cast.
function shootEnemy(e){
 const spell=referenceSpell()||(mode==="dodge"&&ahriBase()?(e.castCount++%2===0?REFERENCE_SPELLS.luxDodge:REFERENCE_SPELLS.ezrealDodge):null);
 if(spell){e.pending={angle:Math.atan2(player.y-e.y,player.x-e.x),fan:false,spell};e.charge=spell.cast;e.shoot=999;return;}
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
 if(p.spell){const spec=p.spell;const shot=fire(e.x,e.y,Math.cos(p.angle)*spec.speed,Math.sin(p.angle)*spec.speed,"enemy",physicalDamage(spec.raw,spec.resist),spec.radius,spec.range/spec.speed);shot.root=spec.root;e.pending=null;e.charge=0;e.shoot=3.5;return;}
 const speed=(mode==="dodge"?340+Math.min(90,time*2):340)*PRESETS[difficulty].speed;
 for(const offset of p.fan?[-.23,0,.23]:[0]){
 const shot=fire(e.x,e.y,Math.cos(p.angle+offset)*speed,Math.sin(p.angle+offset)*speed,"enemy",18,7);
 if(e.baitCaster){shot.bait=true;shot.threat=true;}
}
 e.pending=null;e.charge=0;e.shoot=rand(1.35,2.2)*PRESETS[difficulty].spawn*Math.max(.6,1-time/120);
}
function damageEnemy(e,d){if(!e.alive||state!=="playing")return;cue("impact");e.hp-=d;e.hit=.18;number(e.x,e.y,d,"#b8fff0");burst(e.x,e.y,"#80f9eb",5);if(e.hp<=0){e.alive=false;if(mode==="lane"&&e.minion)stats.cs++;else kills++;burst(e.x,e.y,"#ffbd85",20);if(ahriBase()){if(e.minion){player.essence++;if(player.essence>=9){player.essence=0;player.hp=Math.min(player.maxHp,player.hp+35);}}else{player.hp=Math.min(player.maxHp,player.hp+75);if(player.rushWindow>0){player.rushCharges=Math.min(3,player.rushCharges+1);player.rushWindow=Math.max(player.rushWindow,10);}}}else if(!e.minion)player.hp=Math.min(player.maxHp,player.hp+5);if(mode==="bait"&&e.minion){bait.cs++;bait.phase="next";bait.timer=.6;}if(mode==="kite"&&kills>=10)end(true);}}
function takeHit(d){if(player.invuln>0||state!=="playing")return;cue("hit");player.hp-=d;stats.hits++;stats.damage+=d;player.hitFlash=.22;number(player.x,player.y,"−"+d,"#ff9c98");player.invuln=referenceSpell()?0:.14;burst(player.x,player.y,"#ff8e91",14);if(player.hp<=0){player.hp=0;end(false);}}
// Orders persist until superseded. Movement cancels only the uncommitted windup.
function cancelAttack(){if(player.windup>0){stats.cancelled++;player.windup=0;player.windupTarget=null;}}
function startAttack(e){
if(!e||!e.alive||player.casting||(mode==="bait"&&(!e.minion||bait.phase!=="window"))||player.attackTimer>0||player.windup>0||dist(player,e)>attackReach(e))return;
player.target=null;player.windup=ATTACK.windup;player.windupTarget=e.id;
player.facing=Math.atan2(e.y-player.y,e.x-player.x);
}
function attackOrder(e){if(referenceSpell()||mode==="skillshot"||(mode==="bait"&&!e.minion))return;if(player.windupTarget!==e.id)cancelAttack();player.order={type:"attack",id:e.id};player.focus=e.id;player.target=null;}
function updateOrder(){
const order=player.order;if(!order)return;
if(order.type==="attack"){
 const t=foes.find(e=>e.id===order.id&&e.alive);
 if(!t){player.order=null;player.focus=null;player.target=null;cancelAttack();return;}
 player.focus=t.id;
 if(dist(player,t)>attackReach(t)){player.target={x:t.x,y:t.y};}else{player.target=null;startAttack(t);}
}else if(order.type==="attackMove"){
 // Prefer a unit near the clicked point among units already inside attack range.
 let t=null,best=Infinity;
 for(const e of foes)if(e.alive&&!e.baitCaster&&!e.referenceCaster&&dist(player,e)<=attackReach(e)){const d=dist(e,order);if(d<best){best=d;t=e;}}
 player.focus=t?t.id:null;
 if(t){player.target=null;startAttack(t);}else player.target=dist(player,order)>1?{x:order.x,y:order.y}:null;
}
}
function nearestEnemy(x,y,r=Infinity){let best=null,bd=r;for(const e of foes)if(e.alive&&!e.baitCaster&&!e.referenceCaster){const ground=Math.hypot(e.x-x,e.y-y);const body=Math.hypot(e.x-x,Math.max(0,Math.abs(y-(e.y-(e.minion?20:38)))-(e.minion?16:30)));const d=Math.min(ground,body);if(d<bd){best=e;bd=d;}}return best;}
function cast(key){if(state!=="playing"||player.casting||(player.dashing&&key!=="w")||(player.cd[key]>0&&!(key==="r"&&ahriBase()&&player.rushWindow>0&&player.rushCharges>0&&player.rushLock<=0)))return;if(referenceSpell()&&key!=="f"){notify("REFERENCE DODGE — MOVE OR FLASH");return;}if(((mode==="lastHit"||mode==="bait")&&(["q","e","r"].includes(key)||(mode==="lastHit"&&ahriBase()&&key==="w")))||(mode==="skillshot"&&["e","r"].includes(key))){notify(mode==="skillshot"?"SKILLSHOT LAB — AIM WITH Q":`USE AUTO ATTACKS (${autoDamage()} DAMAGE)`);return;}const a=Math.atan2(aim.y-player.y,aim.x-player.x),d={x:Math.cos(a),y:Math.sin(a)};if(key==="r"&&ahriBase()){
 if(player.root>0||player.rushLock>0)return;
 if(player.rushWindow<=0){player.rushWindow=15;player.rushCharges=3;player.cd.r=140;}
 if(player.rushCharges<=0)return;cancelAttack();player.rushCharges--;player.rushLock=1;player.target=null;player.order=null;player.focus=null;player.route=[];player.routeGoal=null;
 const length=Math.min(250,dist(player,aim));player.dashing={x:clamp(player.x+d.x*length,22,W-22),y:clamp(player.y+d.y*length,59,H-36)};player.facing=a;updateUI();return;
 }if(key==="w"&&ahriBase()){
 player.cd.w=9;player.boost=2;player.fox={remaining:2.5,next:.4,count:3,hits:{}};burst(player.x,player.y,"#a1d7ff",8);updateUI();return;
 }cancelAttack();if((key==="e"||key==="q")&&ahriBase()){
 player.cd[key]=key==="e"?12:7;player.casting={kind:key==="e"?"charm":"orb",angle:a,remaining:.25};player.facing=a;player.target=null;player.order=null;player.focus=null;updateUI();return;
 }player.cd[key]=mode==="skillshot"&&key==="q"?.8:CD[key];if(key==="q"){if(mode==="skillshot")stats.skillShots++;fire(player.x+d.x*24,player.y+d.y*24,d.x*770,d.y*770,"q",45,10,1);burst(player.x,player.y,"#76ffff",7);}
if(key==="w"||key==="f"){const len=key==="w"?135:240;const x=player.x,y=player.y;const desired={x:clamp(player.x+d.x*len,25,W-25),y:clamp(player.y+d.y*len,65,H-38)};const landing=key==="w"?world.clip(player,desired):world.nearestWalkable(desired);player.x=landing.x;player.y=landing.y;player.route=[];player.routeGoal=null;player.target=null;player.focus=null;player.order=null;player.windup=0;player.invuln=(referenceSpell()||mode==="dodge"&&ahriBase())&&key==="f"?0:key==="w"?.26:.16;for(let i=0;i<13;i++)fx.push({x:x+(player.x-x)*i/13,y:y+(player.y-y)*i/13,vx:cosmetic(-20,20),vy:cosmetic(-20,20),ttl:.35,max:.35,color:key==="f"?"#f8cf7c":"#74f0eb",r:cosmetic(2,6)});}
if(key==="e"){for(const foe of foes){if(state!=="playing")break;if(foe.alive&&dist(player,foe)<175)damageEnemy(foe,38);}if(state==="playing")for(const s of shots)if(s.kind==="enemy"&&dist(player,s)<165){s.alive=false;stats.blocked++;}burst(player.x,player.y,"#85fbe4",28);}
if(key==="r"){for(const offset of [-.35,-.18,0,.18,.35]){const v=a+offset;fire(player.x+Math.cos(v)*25,player.y+Math.sin(v)*25,Math.cos(v)*630,Math.sin(v)*630,"r",32,8,1.4);}}
updateUI();}
function moveTo(x,y){cancelAttack();attackMove=false;player.order=null;player.target=world.nearestWalkable({x,y});player.route=[];player.routeGoal=null;player.focus=null;}
function update(dt){if(state!=="playing")return;time+=dt;if(((mode==="dodge"||mode==="lastHit"||mode==="lane"||referenceSpell())&&time>=60)||(mode==="skillshot"&&time>=45)){end(true);return;}
if(referenceSpell()&&!foes.length){const caster=enemy(970,337.5);caster.referenceCaster=true;caster.shoot=1.5;foes.push(caster);}
spawn-=dt;if(spawn<=0&&!referenceSpell()){if(mode==="lastHit"||mode==="lane")addWave();else if(mode==="bait"){}else if(mode==="skillshot")addTarget();else addEnemy();spawn=(mode==="dodge"?Math.max(1.35,3.5-time*.026):Math.max(.9,1.6-time*.015))*PRESETS[difficulty].spawn;if(mode==="lastHit"||mode==="lane")spawn=ahriCS()?30:10;else if(mode==="bait")spawn=999;else if(mode==="skillshot")spawn=.8;}
if(mode==="dodge")updateSweeps(dt);
if(mode==="lane"){
 laneEnemyTimer-=dt;
 if(laneEnemyTimer<=0&&!foes.some(e=>e.alive&&!e.minion)){
  const opponent=enemy(1050,160);opponent.hp=opponent.maxHp=88;opponent.speed=75;opponent.shoot=2.5;foes.push(opponent);laneEnemyTimer=12;
 }
}
if(mode==="bait")updateBait(dt);if(state!=="playing")return;
for(const k of Object.keys(CD))player.cd[k]=Math.max(0,player.cd[k]-dt);player.hitFlash=Math.max(0,player.hitFlash-dt);player.root=Math.max(0,player.root-dt);player.boost=Math.max(0,player.boost-dt);player.rushWindow=Math.max(0,player.rushWindow-dt);player.rushLock=Math.max(0,player.rushLock-dt);player.invuln=Math.max(0,player.invuln-dt);player.attackTimer=Math.max(0,player.attackTimer-dt);
if(player.casting){player.casting.remaining-=dt;if(player.casting.remaining<=0){const cast=player.casting;player.casting=null;const speed=775,orb=cast.kind==="orb";const s=fire(player.x,player.y,Math.cos(cast.angle)*speed,Math.sin(cast.angle)*speed,cast.kind,orb?35:80,orb?50:30,(orb?450:500)/speed);if(orb){s.phase="out";s.hitIds=new Set();}burst(player.x,player.y,orb?"#8cf4ff":"#f6a7da",7);}}
if(player.fox){const f=player.fox;f.remaining-=dt;f.next-=dt;
 if(f.count>0&&f.next<=0){const targets=foes.filter(e=>e.alive&&!e.baitCaster&&!e.referenceCaster&&dist(player,e)<=275).sort((a,b)=>(b.charm>0)-(a.charm>0)||dist(player,a)-dist(player,b));
  if(targets.length){const target=targets[0],angle=Math.atan2(target.y-player.y,target.x-player.x),shot=fire(player.x,player.y,Math.cos(angle)*700,Math.sin(angle)*700,"fox",40,7,1);shot.targetId=target.id;shot.foxCast=f;f.count--;f.next=.12;}}
 if(f.remaining<=0||(f.count===0))player.fox=null;
}
const oldX=player.x,oldY=player.y;
if(player.dashing){const dest=player.dashing,dx=dest.x-player.x,dy=dest.y-player.y,len=Math.hypot(dx,dy),step=Math.min(len,765*dt);const next=world.clip(player,{x:player.x+(len?dx/len*step:0),y:player.y+(len?dy/len*step:0)});const blocked=Math.hypot(next.x-player.x,next.y-player.y)<step-1e-4;player.x=next.x;player.y=next.y;
 if(len<=step+1e-6||blocked){player.dashing=null;const targets=foes.filter(e=>e.alive&&!e.minion&&!e.baitCaster&&!e.referenceCaster&&dist(player,e)<=300).sort((a,b)=>dist(player,a)-dist(player,b)).slice(0,3);for(const target of targets){const a=Math.atan2(target.y-player.y,target.x-player.x),s=fire(player.x,player.y,Math.cos(a)*700,Math.sin(a)*700,"rush",75,7,1);s.targetId=target.id;}burst(player.x,player.y,"#b4eaff",10);}}
if(!player.casting&&!player.dashing)updateOrder();
// Time with a target in range and the attack ready, but no windup. This is
// descriptive feedback; positioning or dodging can make waiting intentional.
if(mode==="kite"&&player.attackTimer<=0&&player.windup<=0&&foes.some(e=>e.alive&&dist(player,e)<=attackReach(e)))stats.readyIdle+=dt;
if(player.windup>0){player.windup=Math.max(0,player.windup-dt);if(player.windup<1e-8){player.windup=0;const t=foes.find(e=>e.id===player.windupTarget&&e.alive);
 if(t&&dist(player,t)<=attackReach(t)+35){const a=Math.atan2(t.y-player.y,t.x-player.x);const shot=fire(player.x,player.y,Math.cos(a)*autoSpeed(),Math.sin(a)*autoSpeed(),"auto",autoDamage(),5,1.5);shot.targetId=t.id;stats.released++;cue("attack");player.attackTimer=ATTACK.period-ATTACK.windup;}else stats.cancelled++;
 player.windupTarget=null;
}}
if(player.target&&player.windup<=0&&player.root<=0&&!player.casting&&!player.dashing){
 const goal=world.nearestWalkable(player.target);
 if(!player.routeGoal||dist(player.routeGoal,goal)>14||(!player.route.length&&dist(player,goal)>1)){
  player.route=world.path(player,goal);player.routeGoal=goal;
 }
 const waypoint=player.route[0];
 if(waypoint){const dx=waypoint.x-player.x,dy=waypoint.y-player.y,len=Math.hypot(dx,dy),step=Math.min(player.speed*(1+.4*player.boost/2)*dt,len);
  if(len>0){const next=world.clip(player,{x:player.x+dx/len*step,y:player.y+dy/len*step});player.x=next.x;player.y=next.y;player.facing=Math.atan2(dy,dx);if(step>0){stats.moving+=dt;player.motion+=dt*15;}}
  if(len<=step+1e-6){player.route.shift();if(!player.route.length&&dist(player,goal)<1)player.target=null;}
 }else if(dist(player,goal)<1)player.target=null;
}

player.x=clamp(player.x,22,W-22);player.y=clamp(player.y,59,H-36);
const previousFoes=new Map(foes.map(e=>[e.id,{x:e.x,y:e.y}])),previousAllies=new Map(allies.map(e=>[e.id,{x:e.x,y:e.y}]));
for(const e of foes){if(!e.alive)continue;if(e.referenceCaster){if(e.pending){e.charge-=dt;if(e.charge<=0)releaseEnemy(e);}else{e.shoot-=dt;if(e.shoot<=0)shootEnemy(e);}continue;}if(e.baitCaster)continue;if(e.charm>0){e.charm=Math.max(0,e.charm-dt);const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy)||1,step=Math.min(d,e.speed*.35*dt);const next=world.clip(e,{x:e.x+dx/d*step,y:e.y+dy/d*step},e.r);e.x=next.x;e.y=next.y;continue;}if(e.minion){if(mode!=="bait"||bait.phase==="window")updateMinion(e,dt);continue;}if(e.targetDummy){updateTarget(e,dt);continue;}e.hit=Math.max(0,e.hit-dt);e.spin+=dt*e.strafe;const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy)||1;let vx=0,vy=0;if(d>230){vx=dx/d;vy=dy/d;}else if(d<155){vx=-dx/d;vy=-dy/d;}vx+=(-dy/d)*Math.sin(e.spin)*.5;vy+=(dx/d)*Math.sin(e.spin)*.5;const mag=Math.hypot(vx,vy)||1;if(!e.pending){
 // Chase around walls when direct pursuit is blocked; refresh as the player moves.
 if(d>230&&!world.segmentClear(e,player,e.r)){
  e.routeAge=(e.routeAge||0)-dt;
  if(e.routeAge<=0||!e.route||!e.route.length){e.route=world.path(e,player,e.r);e.routeAge=.35;}
  while(e.route&&e.route.length&&dist(e,e.route[0])<3)e.route.shift();
  if(e.route&&e.route.length){const p=e.route[0],rd=dist(e,p)||1;vx=(p.x-e.x)/rd;vy=(p.y-e.y)/rd;}
 }
 const m=Math.hypot(vx,vy)||1;const target={x:clamp(e.x+vx/m*e.speed*dt,25,W-25),y:clamp(e.y+vy/m*e.speed*dt,60,H-35)};
 const next=world.clip(e,target,e.r);e.x=next.x;e.y=next.y;e.shoot-=dt;if(e.shoot<=0&&d<650)shootEnemy(e);}else{e.charge-=dt;if(e.charge<=0)releaseEnemy(e);}if(d<e.r+player.r+1)takeHit(11);if(state!=="playing")break;}
if(state!=="playing")return;
if(ahriCS())updateCSWave(dt);
for(const h of hazards){
 if(dist(player,h)<=h.r+player.hitRadius)h.threat=true;
 h.ttl-=dt;if(h.ttl<=0){
  if(dist(player,h)<=h.r+player.hitRadius){if(player.invuln>0)stats.blocked++;else takeHit(25);}else if(h.threat){dodged++;cue("dodge");}
  if(state!=="playing")return;
  burst(h.x,h.y,"#f5b57d",24);
 }
}
hazards=hazards.filter(h=>h.ttl>0);
for(const s of shots){if(!s.alive)continue;
 if(s.kind==="auto"||s.kind==="allied"||s.kind==="enemyMinion"||s.kind==="fox"||s.kind==="rush"){
  const t=(s.kind==="enemyMinion"?allies:foes).find(e=>e.id===s.targetId&&e.alive);
  if(!t){s.alive=false;continue;}
  const a=Math.atan2(t.y-s.y,t.x-s.x);const speed=s.kind==="auto"?autoSpeed():(s.kind==="fox"||s.kind==="rush")?700:380;s.vx=Math.cos(a)*speed;s.vy=Math.sin(a)*speed;
 }
 if(s.kind==="orb"&&s.phase==="return"){const dx=player.x-s.x,dy=player.y-s.y,d=Math.hypot(dx,dy)||1;s.vx=dx/d*700;s.vy=dy/d*700;}
 if(s.kind==="enemy"&&threatening(s))s.threat=true;
 s.px=s.x;s.py=s.y;const travelDt=Math.max(0,Math.min(dt,s.ttl,s.kind==="orb"&&s.phase==="return"?dist(s,player)/700:dt));s.x+=s.vx*travelDt;s.y+=s.vy*travelDt;s.ttl-=dt;
 if(s.kind==="orb"){
  for(const e of foes){if(!e.alive||s.hitIds.has(e.id))continue;const prev=previousFoes.get(e.id)||e;
   if(segmentDistance(s.px-prev.x,s.py-prev.y,s.x-e.x,s.y-e.y)<=s.r+targetHitRadius(e)){s.hitIds.add(e.id);damageEnemy(e,s.phase==="out"?physicalDamage(s.damage,e.mr||0):s.damage);if(state!=="playing")break;}}
  if(s.phase==="out"&&s.ttl<=0){s.phase="return";s.ttl=3;s.hitIds.clear();}
  else if(s.phase==="return"&&(dist(s,player)<1||s.ttl<=0))s.alive=false;
 }else if(s.kind==="enemyMinion"){
  const target=allies.find(e=>e.id===s.targetId&&e.alive),prev=target&&(previousAllies.get(target.id)||target);
  if(target&&segmentDistance(s.px-prev.x,s.py-prev.y,s.x-target.x,s.y-target.y)<=s.r+target.r){target.hp-=physicalDamage(s.damage+s.minionBonus*target.hp,target.armor||0);target.hit=.08;if(target.hp<=0)target.alive=false;s.alive=false;}
  if(s.ttl<=0)s.alive=false;
 }else if(s.kind==="enemy"){
  const collision=segmentDistance(s.px-oldX,s.py-oldY,s.x-player.x,s.y-player.y)<=s.r+player.hitRadius;
  if(collision){s.alive=false;if(player.invuln>0)stats.blocked++;else {takeHit(s.damage);if(state==="playing"&&s.root&&mode!=="dodge"){player.root=s.root;player.dashing=null;}}if(s.bait&&state==="playing")resolveBait(false);}
  else if(s.ttl<=0||s.x<0||s.x>W||s.y<0||s.y>H||(s.bait&&((player.x-s.x)*s.vx+(player.y-s.y)*s.vy)<=0)){s.alive=false;if(s.threat){dodged++;if(!s.bait)cue("dodge");}if(s.bait)resolveBait(true);}
 }else{
  let hit=null,first=Infinity;
  for(const e of foes){if(!e.alive||((s.kind==="auto"||s.kind==="allied"||s.kind==="fox"||s.kind==="rush")&&e.id!==s.targetId))continue;const prev=previousFoes.get(e.id)||e;
   const t=segmentHitTime(s.px-prev.x,s.py-prev.y,s.x-e.x,s.y-e.y,s.r+targetHitRadius(e));if(t<first){first=t;hit=e;}
  }
  if(hit){
   if(s.kind==="allied"){hit.hp-=physicalDamage(s.damage+(s.minionBonus||0)*hit.hp,hit.armor||0);hit.hit=.08;if(hit.hp<=0){hit.alive=false;stats.missed++;number(hit.x,hit.y,"MISSED","#eaa7a1");}}
   else{if(s.kind==="q"&&mode==="skillshot")stats.skillHits++;if(s.kind==="charm"){hit.charm=1.2;hit.pending=null;hit.charge=0;hit.shoot=Math.max(hit.shoot,1.2);}const foxHits=s.kind==="fox"?(s.foxCast.hits[hit.id]||0):0;if(s.kind==="fox")s.foxCast.hits[hit.id]=foxHits+1;const damage=s.kind==="auto"?physicalDamage(s.damage,hit.armor||0):s.kind==="charm"||s.kind==="fox"||s.kind==="rush"?physicalDamage(s.kind==="fox"&&foxHits?s.damage*.4:s.damage,hit.mr||0):s.damage;if(s.kind==="auto")stats.autoDamage+=Math.min(hit.hp,damage);damageEnemy(hit,damage);}s.alive=false;
  }
  if(s.ttl<=0||s.x<0||s.x>W||s.y<0||s.y>H)s.alive=false;
 }
 if(state!=="playing")break;
}
foes=foes.filter(e=>e.alive);allies=allies.filter(e=>e.alive);if(mode==="lastHit"&&waves===(ahriCS()?2:5)&&foes.length===0){end(true);return;}shots=shots.filter(s=>s.alive);
for(const f of fx){f.x+=f.vx*dt;f.y+=f.vy*dt;f.ttl-=dt;}fx=fx.filter(f=>f.ttl>0);
if(toastTime>0){toastTime-=dt;if(toastTime<=0)ui.toast.classList.remove("show");}
updateUI();}
function circle(x,y,r,color,fill=true,width=1){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx[fill?"fillStyle":"strokeStyle"]=color;if(!fill)ctx.lineWidth=width;ctx[fill?"fill":"stroke"]();}
function polygon(x,y,r,n,rotation,fill,stroke){ctx.beginPath();for(let i=0;i<=n;i++){const a=rotation+i*TAU/n;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.fill();ctx.stroke();}
// Original vector ranger and enemy mage silhouettes with facing and articulated steps.
function drawChampion(x,y,a,friendly,hit,windup,motion){
 const ahriSprite=$("ahriArt"),backSprite=$("ahriBackArt"),useAhri=friendly&&ahriBase()&&ahriSprite.complete&&ahriSprite.naturalWidth;
 const useBack=useAhri&&Math.sin(a)<-.65&&backSprite.complete&&backSprite.naturalWidth;
 let sprite=useBack?backSprite:useAhri?ahriSprite:$(friendly?"rangerArt":"mageArt");
 if(friendly&&!useAhri&&Math.abs(Math.sin(a))>.65){const directional=$(Math.sin(a)<0?"rangerBackArt":"rangerFrontArt");if(directional.complete&&directional.naturalWidth)sprite=directional;}
 if(sprite.complete&&sprite.naturalWidth){
  ctx.save();ctx.translate(x,y);ctx.save();ctx.scale(1,.43);circle(0,3,25,"#0009");ctx.restore();
  const side=Math.cos(a)>=0?1:-1;const bob=(friendly?player.target:!windup)?Math.abs(Math.sin(motion))*2:0;
  ctx.translate(0,-bob);ctx.scale(side,1);ctx.rotate(windup*-.08);if(useAhri)ctx.drawImage(sprite,useBack?-33:-60,-58,77,63);else ctx.drawImage(sprite,-37,-79,74,80);
  if(hit){ctx.globalAlpha=.45;circle(0,-34,24,"#fff1dc");}ctx.restore();return;
 }
 const moving=friendly?!!player.target:!windup;
 const stride=moving?Math.sin(motion)*4:0;
 const teal=friendly, cloth=hit?"#fff1d6":teal?"#286c72":"#793e50", edge=teal?"#8dc4ad":"#c88888";
 ctx.save();ctx.translate(x,y);
 // The ground anchor is the collision centre; the body rises above it.
 ctx.save();ctx.scale(1,.43);circle(2,4,25,"#0009");ctx.restore();
 ctx.lineWidth=7;ctx.lineCap="round";ctx.strokeStyle="#222e32";
 ctx.beginPath();ctx.moveTo(-6,-13);ctx.lineTo(-8+stride,1);ctx.moveTo(7,-13);ctx.lineTo(9-stride,1);ctx.stroke();
 ctx.fillStyle="#1c3130";ctx.beginPath();ctx.moveTo(-12,-30);ctx.lineTo(-17,-8);ctx.lineTo(0,-12);ctx.lineTo(15,-7);ctx.lineTo(11,-31);ctx.closePath();ctx.fill();
 ctx.fillStyle=cloth;ctx.strokeStyle=edge;ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(-13,-38);ctx.lineTo(10,-38);ctx.lineTo(14,-18);ctx.lineTo(0,-12);ctx.lineTo(-14,-18);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle=teal?"#a58c5e":"#9a7460";ctx.fillRect(-11,-23,22,4);
 circle(0,-43,10,hit?"#fff3dc":teal?"#c7b690":"#d4aea0");
 ctx.fillStyle=teal?"#324c4e":"#543543";ctx.beginPath();ctx.arc(0,-46,10,Math.PI,TAU);ctx.lineTo(10,-43);ctx.lineTo(-10,-43);ctx.closePath();ctx.fill();
 const side=Math.cos(a)>=0?1:-1;ctx.strokeStyle=edge;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(side*9,-33);ctx.lineTo(side*(18+windup*4),-25);ctx.stroke();
 ctx.strokeStyle=teal?"#e3bd79":"#c293d2";ctx.lineWidth=3;ctx.beginPath();
 if(teal){ctx.arc(side*(20+windup*4),-24,14,side>0?-1.2:Math.PI-1.2,side>0?1.2:Math.PI+1.2);ctx.stroke();ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(side*25,-37);ctx.lineTo(side*(17-windup*5),-24);ctx.lineTo(side*25,-11);ctx.stroke();}
 else{ctx.moveTo(side*12,-16);ctx.lineTo(side*25,-39);ctx.stroke();circle(side*25,-39,4,windup?"#ffe0a5":"#dba6df");}
 ctx.restore();
}
function render(){const vw=cv.width,vh=cv.height;ctx.setTransform(vw/W,0,0,vh/H,0,0);ctx.fillStyle="#091b29";ctx.fillRect(0,0,W,H);
const g=ctx.createRadialGradient(W/2,H/2,80,W/2,H/2,700);g.addColorStop(0,"#173d4b");g.addColorStop(.65,"#0f2938");g.addColorStop(1,"#081522");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
ctx.save();
// Painted, oblique lane: all marks remain on the same world plane as hitboxes.
const arenaArt=$("arenaArt");
if(arenaArt.complete&&arenaArt.naturalWidth){ctx.drawImage(arenaArt,0,0,W,H);ctx.fillStyle="#0a1a0d35";ctx.fillRect(0,0,W,H);}else{
ctx.fillStyle="#233d2c";ctx.fillRect(0,0,W,H);
for(let i=0;i<220;i++){
 const x=((i*197)%W),y=((i*113)%H),n=(Math.sin(i*83.1)+1)/2;
 ctx.fillStyle=n>.5?"#35543a55":"#172d2055";
 ctx.beginPath();ctx.ellipse(x,y,22+n*34,7+n*12,(n-.5)*.6,0,TAU);ctx.fill();
}
ctx.fillStyle="#4b493c";ctx.beginPath();ctx.moveTo(-80,540);ctx.bezierCurveTo(120,450,170,350,380,335);ctx.bezierCurveTo(520,300,510,210,760,200);ctx.bezierCurveTo(920,185,1040,100,1280,90);ctx.lineTo(1280,260);ctx.bezierCurveTo(1040,250,970,330,790,344);ctx.bezierCurveTo(610,355,565,440,405,465);ctx.bezierCurveTo(225,500,150,620,-80,690);ctx.closePath();ctx.fill();
ctx.strokeStyle="#7d756055";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,614);ctx.bezierCurveTo(250,490,290,430,450,407);ctx.bezierCurveTo(650,370,660,267,900,260);ctx.bezierCurveTo(1040,250,1100,190,1200,190);ctx.stroke();
for(let i=0;i<75;i++){
 const x=(i*193+41)%W,y=(i*97+67)%H,n=(Math.sin(i*17)+1)/2;
 if(i%3===0){ctx.save();ctx.translate(x,y);ctx.scale(1,.55);polygon(0,0,8+n*11,5,n,"#3c5041","#62746255");ctx.restore();}
 else{ctx.strokeStyle=i%2?"#72905a55":"#98a56c44";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x,y-8-n*5);ctx.lineTo(x+2,y);ctx.moveTo(x,y-3);ctx.lineTo(x+6,y-8);ctx.stroke();}
}
}
// Mark collision proxies so their physical edges are visible against painted art.
for(const wall of world.walls){ctx.fillStyle="#172b2a33";ctx.fillRect(wall.left,wall.top,wall.right-wall.left,wall.bottom-wall.top);ctx.strokeStyle="#e2c99588";ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.strokeRect(wall.left,wall.top,wall.right-wall.left,wall.bottom-wall.top);ctx.setLineDash([]);}
// Soft arena boundary, kept clear for combat readability.
ctx.strokeStyle="#b7c79a55";ctx.lineWidth=2;ctx.strokeRect(34,55,W-68,H-94);
for(const [x,y] of [[34,55],[W-34,55],[34,H-39],[W-34,H-39]]){ctx.save();ctx.translate(x,y);ctx.scale(1,.6);polygon(0,0,16,5,.2,"#536556","#9caa86");circle(0,0,4,"#92c9a8");ctx.restore();}
ctx.restore();

if(player){
for(const wall of sweeps){
 const top=clamp(wall.gap-75,59,H-36),bottom=clamp(wall.gap+75,59,H-36);
 ctx.fillStyle="#ff665022";ctx.fillRect(0,59,W,top-59);ctx.fillRect(0,bottom,W,H-36-bottom);
 ctx.save();ctx.setLineDash([12,8]);ctx.lineWidth=2;ctx.strokeStyle="#ffb18bbb";
 ctx.beginPath();ctx.moveTo(0,top);ctx.lineTo(W,top);ctx.moveTo(0,bottom);ctx.lineTo(W,bottom);ctx.stroke();ctx.restore();
 ctx.font="bold 12px ui-monospace,monospace";ctx.textAlign="left";ctx.fillStyle="#ffe1b5";ctx.fillText("SAFE GAP",46,wall.gap+4);
}
for(const h of hazards){circle(h.x,h.y,h.r,"#e58c6422");circle(h.x,h.y,h.r,"#ffbc80",false,2);circle(h.x,h.y,h.r*(1-h.ttl/h.max),"#ffc08d99",false,3);ctx.font="bold 12px ui-monospace,monospace";ctx.textAlign="center";ctx.fillStyle="#ffd5aa";ctx.fillText("IMPACT",h.x,h.y+4);}
if(mode==="bait"&&bait.phase==="approach"){const caster=foes.find(e=>e.baitCaster);if(caster){ctx.save();ctx.setLineDash([6,7]);circle(caster.x,caster.y,260,"#ffbb8890",false,2);ctx.restore();}}
for(const e of foes)if(e.pending){
 ctx.save();for(const offset of e.pending.fan?[-.23,0,.23]:[0]){
  const a=e.pending.angle+offset;ctx.beginPath();ctx.moveTo(e.x,e.y);const range=e.pending.spell?e.pending.spell.range:1400;ctx.lineTo(e.x+Math.cos(a)*range,e.y+Math.sin(a)*range);
  ctx.setLineDash([]);ctx.strokeStyle="#ff80634a";ctx.lineWidth=e.pending.spell?e.pending.spell.radius*2:14;ctx.stroke();
  ctx.setLineDash([9,7]);ctx.strokeStyle="#ffd1a4cc";ctx.lineWidth=2;ctx.stroke();
 }
 ctx.setLineDash([]);ctx.strokeStyle="#ffcf87";ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,29,-Math.PI/2,-Math.PI/2+TAU*clamp(1-e.charge/(e.pending.spell?e.pending.spell.cast:PRESETS[difficulty].warning),0,1));ctx.stroke();ctx.restore();
}
}
if(player){
if(attackMove||player.order){ctx.save();ctx.setLineDash([5,7]);circle(player.x,player.y,ahriBase()?331.5:ATTACK.range,"#8af0d755",false,1);ctx.restore();}
const focus=foes.find(e=>e.id===player.focus);if(focus)circle(focus.x,focus.y,focus.r+9,"#f7d184",false,2);
ctx.strokeStyle=player.windup>0?"#f7d184":"#7ce8d0";ctx.lineWidth=4;ctx.beginPath();ctx.arc(player.x,player.y,32,-Math.PI/2,-Math.PI/2+TAU*(player.windup>0?1-player.windup/ATTACK.windup:1-player.attackTimer/(ATTACK.period-ATTACK.windup)));ctx.stroke();
ctx.font="bold 10px ui-monospace,monospace";ctx.textAlign="center";ctx.fillStyle="#c5eadf";ctx.fillText(player.root>0?`ROOTED ${player.root.toFixed(1)}s`:referenceSpell()?"DODGE":player.windup>0?"WINDUP":player.attackTimer>0?"RECOVERY":"READY",player.x,player.y+49);
if(player.target){circle(player.target.x,player.target.y,13,"#7ee7d288",false,2);ctx.strokeStyle="#7ee7d288";ctx.beginPath();ctx.moveTo(player.target.x-8,player.target.y);ctx.lineTo(player.target.x+8,player.target.y);ctx.moveTo(player.target.x,player.target.y-8);ctx.lineTo(player.target.x,player.target.y+8);ctx.stroke();}
const actors=[...foes,...allies,{isPlayer:true,x:player.x,y:player.y}].sort((a,b)=>a.y-b.y);
for(const e of actors){
 if(e.isPlayer){
drawChampion(player.x,player.y,player.facing,true,player.hitFlash>0,player.windup/ATTACK.windup,player.motion);
circle(player.x,player.y,player.hitRadius,"#bcffe944",false,1);
if(player.invuln>0)circle(player.x,player.y,25,"#ffe4ad",false,2);
if(player.fox){for(let i=0;i<player.fox.count;i++){const a=time*3+i*TAU/3;circle(player.x+Math.cos(a)*25,player.y-20+Math.sin(a)*10,5,"#a4e6ff");}}
ctx.fillStyle="#102d27";ctx.fillRect(player.x-22,player.y-86,44,4);ctx.fillStyle="#8ceebd";ctx.fillRect(player.x-22,player.y-86,44*player.hp/player.maxHp,4);
 continue;
 }
 if(e.ally){
 const art=$("minionArt");ctx.save();ctx.translate(e.x,e.y);ctx.save();ctx.scale(1,.45);circle(0,3,15,"#0007");ctx.restore();
 if(art.complete&&art.naturalWidth){ctx.filter="hue-rotate(165deg) saturate(.8)";ctx.scale(-1,1);ctx.drawImage(art,-24,-48,48,49);}else polygon(0,-10,12,5,0,"#317c78","#8ec9a5");ctx.restore();
 ctx.fillStyle="#13252b";ctx.fillRect(e.x-25,e.y-57,50,5);ctx.fillStyle="#76cde4";ctx.fillRect(e.x-25,e.y-57,50*clamp(e.hp/e.maxHp,0,1),5);continue;
 }
 if(e.minion){
 // Allied caster and enemy melee minion, with an auto-damage threshold on the bar.
 const minionArt=$("minionArt");
 if(!ahriCS()){
  ctx.save();ctx.translate(e.destination-80,e.y);ctx.save();ctx.scale(1,.45);circle(0,3,15,"#0007");ctx.restore();
  if(minionArt.complete&&minionArt.naturalWidth){ctx.filter="hue-rotate(165deg) saturate(.8)";ctx.scale(-1,1);ctx.drawImage(minionArt,-24,-48,48,49);}else polygon(0,-10,12,5,0,"#317c78","#8ec9a5");ctx.restore();
 }
 ctx.save();ctx.translate(e.x,e.y);ctx.save();ctx.scale(1,.45);circle(0,3,17,"#0007");ctx.restore();
 if(minionArt.complete&&minionArt.naturalWidth){ctx.drawImage(minionArt,-24,-48,48,49);if(e.hit>0){ctx.globalAlpha=.4;circle(0,-26,16,"#fff0dc");}}else polygon(0,-10,14,5,Math.PI/2,e.hit?"#fff0dc":"#ac6a57","#dfb68c");ctx.restore();
 const threshold=autoThreshold(e);const last=e.hp<=threshold;ctx.fillStyle="#13252b";ctx.fillRect(e.x-25,e.y-57,50,6);ctx.fillStyle=last?"#f8cf77":"#d9827d";ctx.fillRect(e.x-25,e.y-57,50*Math.max(0,e.hp/e.maxHp),6);ctx.fillStyle="#fff3bf";ctx.fillRect(e.x-25+50*threshold/e.maxHp,e.y-58,1,8);
 ctx.font="bold 11px ui-monospace,monospace";ctx.textAlign="center";ctx.fillStyle=last?"#ffe09b":"#d6cec1";ctx.fillText(Math.ceil(e.hp)+(last?" • LAST HIT":""),e.x,e.y-65);continue;
}drawChampion(e.x,e.y,Math.atan2(player.y-e.y,player.x-e.x),false,e.hit>0,e.pending?1:0,time*7);
if(e.charm>0){ctx.font="bold 12px ui-monospace,monospace";ctx.textAlign="center";ctx.fillStyle="#ffb2df";ctx.fillText("♥ CHARMED",e.x,e.y-96);}
ctx.fillStyle="#101e23";ctx.fillRect(e.x-25,e.y-86,50,5);ctx.fillStyle="#ff9290";ctx.fillRect(e.x-25,e.y-86,50*clamp(e.hp/e.maxHp,0,1),5);}
for(const s of shots){const visualRadius=s.kind==="orb"?13:s.kind==="charm"?10:s.kind==="enemy"&&s.r>15?11:s.r;ctx.strokeStyle=(s.kind==="enemy"||s.kind==="enemyMinion")?"#f1797999":s.kind==="charm"?"#ffa8d999":"#7bf4e899";ctx.lineWidth=visualRadius*1.5;ctx.beginPath();ctx.moveTo(s.x-s.vx*.04,s.y-s.vy*.04);ctx.lineTo(s.x,s.y);ctx.stroke();if(s.kind==="enemy"&&s.r>15)circle(s.x,s.y,s.r,"#ffbda866",false,1);circle(s.x,s.y,visualRadius,(s.kind==="enemy"||s.kind==="enemyMinion")?"#ff9c85":s.kind==="charm"?"#ffb1df":s.kind==="r"?"#f5d47d":"#81fdf1");circle(s.x,s.y,visualRadius*1.7,(s.kind==="enemy"||s.kind==="enemyMinion")?"#fe626344":"#8df5dd44");}
}
for(const f of fx){ctx.globalAlpha=clamp(f.ttl/f.max,0,1);if(f.text){ctx.font="bold 15px ui-monospace,monospace";ctx.textAlign="center";ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);}else circle(f.x,f.y,f.r,f.color);}ctx.globalAlpha=1;
if(state==="playing"&&(referenceSpell()||mode==="dodge"||mode==="lastHit"||mode==="lane"||mode==="skillshot"||mode==="bait")){ctx.font="700 12px ui-monospace,monospace";ctx.textAlign="center";ctx.fillStyle="#b7d9d9aa";ctx.fillText(referenceSpell()?`${referenceSpell().name} · MOVE OR FLASH · ${Math.max(0,60-Math.floor(time))}s`:mode==="lane"?"FARM, EVADE AND TRADE · "+Math.max(0,60-Math.floor(time))+"s":mode==="bait"?baitLabel():mode==="skillshot"?"AIM WITH THE CURSOR · Q TO FIRE · "+Math.max(0,45-Math.floor(time))+"s":mode==="lastHit"?`${autoDamage()} AUTO DAMAGE · GOLD HEALTH = LAST HIT · WAVE `+waves+(ahriCS()?" / 2":" / 5"):"SURVIVE "+Math.max(0,60-Math.floor(time))+"s",W/2,90);}
}
function loop(ts){const dt=last?Math.min((ts-last)/1000,.25):0;last=ts;if(state==="playing"){accumulator+=dt;while(accumulator>=STEP&&state==="playing"){update(STEP);accumulator-=STEP;}}else accumulator=0;render();requestAnimationFrame(loop);}
function coords(e){const b=cv.getBoundingClientRect();return{x:(e.clientX-b.left)*W/b.width,y:(e.clientY-b.top)*H/b.height};}
cv.addEventListener("contextmenu",e=>e.preventDefault());
cv.addEventListener("pointermove",e=>{mouse=coords(e);aim=mouse;if(state==="playing"&&(e.buttons&2)){if(mode==="skillshot"){moveTo(mouse.x,mouse.y);return;}const t=nearestEnemy(mouse.x,mouse.y,30);if(t)attackOrder(t);else moveTo(mouse.x,mouse.y);}});
cv.addEventListener("pointerdown",e=>{if(state!=="playing")return;e.preventDefault();mouse=coords(e);aim=mouse;
if(e.button===2){attackMove=false;if(mode==="skillshot"){moveTo(mouse.x,mouse.y);return;}const t=nearestEnemy(mouse.x,mouse.y,30);if(t)attackOrder(t);else moveTo(mouse.x,mouse.y);}
else if(e.button===0){if(attackMove){cancelAttack();player.order={type:"attackMove",...world.nearestWalkable(mouse)};player.route=[];player.routeGoal=null;player.target=null;player.focus=null;attackMove=false;notify("ATTACK MOVE");}else{const t=nearestEnemy(mouse.x,mouse.y,24);if(t)attackOrder(t);}}
});
window.addEventListener("keydown",e=>{const k=e.key.toLowerCase();if(e.repeat)return;if(["q","w","e","r","f","a","s","p","t","escape"].includes(k))e.preventDefault();if(k==="t"&&player&&state!=="menu"){reset(mode);return;}if(k==="p"||k==="escape"){if(state==="playing"||state==="paused")pause();return;}if(state!=="playing"||e.repeat)return;if(k==="s"){moveTo(player.x,player.y);return;}if(k==="a"&&mode==="skillshot"){notify("SKILLSHOT LAB — AIM WITH Q");return;}if(k==="a"){attackMove=true;notify("ATTACK MOVE — LEFT CLICK");return;}if(CD[k])cast(k);});
window.addEventListener("blur",()=>{if(state==="playing")pause();});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&state==="playing")pause();});
$("soundBtn").addEventListener("click",toggleSound);
$("attackSpeed").addEventListener("change",e=>{if(ATTACK_PRESETS[e.target.value])attackPreset=e.target.value;});
$("difficulty").addEventListener("change",e=>{difficulty=e.target.value;});
$("newSeed").addEventListener("click",()=>{seed=(seed+104729)%1000000;$("seedLabel").textContent="SEED "+seed;});
document.querySelectorAll("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>reset(btn.dataset.mode)));
$("menuBtn").addEventListener("click",()=>showMenu("CHOOSE YOUR <span>DRILL.</span>","Practice a mechanic, choose your difficulty, then repeat the same encounter to measure improvement."));
ui.resume.addEventListener("click",pause);ui.pause.addEventListener("click",pause);ui.restart.addEventListener("click",()=>{if(player)reset(mode);});
function resize(){const b=cv.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.max(1,Math.round(b.width*dpr));cv.height=Math.max(1,Math.round(b.height*dpr));}
window.addEventListener("resize",resize);resize();requestAnimationFrame(loop);
})();
