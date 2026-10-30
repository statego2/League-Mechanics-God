// World coordinates are League units. The host owns time, input and rendering.
export const SPELLS = Object.freeze({
 ezreal:{name:'Ezreal Q',cast:.25,speed:2000,range:1200,radius:60,damage:81,limit:1,color:'#f9c96c'},
 lux:{name:'Lux Q',cast:.25,speed:1200,range:1300,radius:70,damage:62,limit:2,root:2,color:'#f6e4ff'},
 ahri:{name:'Ahri Q',cast:.25,speed:1550,range:900,radius:100,damage:27,limit:Infinity,color:'#69e7f6'},
 blitz:{name:'Blitzcrank Q',cast:.25,speed:1800,range:1080,radius:70,damage:81,limit:1,color:'#f5b454'},
 velkoz:{name:"Vel'Koz Q",cast:.25,speed:1300,range:1100,radius:50,damage:62,limit:1,color:'#dc8cff'},
 xerathq:{name:'Xerath Q',cast:1.1,range:1400,radius:75,damage:62,color:'#65aaff'},
 xerathw:{name:'Xerath W',cast:1.0,radius:200,damage:54,color:'#65aaff'},
 orianna:{name:'Orianna R',cast:.75,radius:410,damage:120,color:'#e38dff'},
 malphite:{name:'Malphite R',cast:.65,radius:270,damage:120,color:'#ff9c7f'}
});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const unit=(x,y)=>{const d=Math.hypot(x,y)||1;return {x:x/d,y:y/d}};
// Relative swept circles avoid tunnelling, including movement of the player.
export function swept(a,b,r){const dx=b.x-a.x,dy=b.y-a.y,t=clamp(-(a.x*dx+a.y*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(a.x+t*dx,a.y+t*dy)<=r;}
export class DodgeEngine {
 constructor({seed=73129,width=2400,height=1350,director=true}={}){this.width=width;this.height=height;this.seed=seed>>>0;this.randomState=this.seed;this.director=director;this.time=0;this.next=1;this.rareO=90+this.rand()*60;this.rareM=150+this.rand()*90;this.lastMajor=-40;this.active=[];this.finished=[];this.blockers=[];this.player={x:width/2,y:height/2,radius:65,speed:330,hp:590,maxHp:590,root:0,flashCooldown:0};this.target={x:width/2,y:height/2};this.stats={hits:0,damage:0,dodges:0,flashDodges:0,combinations:0,byAbility:{}};this.nextId=1;}
 rand(){this.randomState=(Math.imul(this.randomState,1664525)+1013904223)>>>0;return this.randomState/4294967296;}
 moveTo(x,y){this.target={x:clamp(x,0,this.width),y:clamp(y,0,this.height)};}
 flash(x,y){const p=this.player;if(p.flashCooldown>0)return false;const u=unit(x-p.x,y-p.y),d=Math.min(400,Math.hypot(x-p.x,y-p.y));p.x=clamp(p.x+u.x*d,p.radius,this.width-p.radius);p.y=clamp(p.y+u.y*d,p.radius,this.height-p.radius);p.flashCooldown=300;for(const s of this.active)if(s.threatened&&!s.hit)s.flashed=true;return true;}
 cast(type,source,aim,options={}){const spec=SPELLS[type];if(!spec)throw Error('Unknown spell '+type);const dir=unit(aim.x-source.x,aim.y-source.y);const s={id:this.nextId++,type,spec,source:{...source},aim:{...aim},x:source.x,y:source.y,dir,age:0,phase:'tell',travel:0,hit:false,threatened:false,flashed:false,hits:new Set(),contacts:0,returning:false,children:[],ball:options.ball?{...options.ball}:{...aim},combo:false};for(const other of this.active){s.combo=true;other.combo=true;}this.active.push(s);return s;}
 schedule(){if(!this.director||this.player.hp<=0)return;if(this.time>=this.next){const cap=this.time<45?1:2;if(this.active.length<cap){let type;const roll=this.rand();if(this.time<45)type=roll<.75?'ezreal':'lux';else if(this.time<120)type=roll<.45?'ezreal':roll<.60?'lux':roll<.72?'blitz':roll<.83?'ahri':roll<.91?'velkoz':roll<.97?'xerathq':'xerathw';else type=roll<.45?'ezreal':roll<.60?'lux':roll<.72?'blitz':roll<.83?'ahri':roll<.91?'velkoz':roll<.97?'xerathq':'xerathw';
 // Only overlap Ezreal with a single compatible threat; defer CC chains.
 if(this.active.length&&(type!=='ezreal'||!['ezreal','lux','ahri','xerathw','velkoz'].includes(this.active[0].type)))type=null;
 if(type){const angle=this.rand()*Math.PI*2,dist=type==='ahri'?800:1000,source={x:this.player.x+Math.cos(angle)*dist,y:this.player.y+Math.sin(angle)*dist};source.x=clamp(source.x,80,this.width-80);source.y=clamp(source.y,80,this.height-80);const aim={x:this.player.x,y:this.player.y};this.cast(type,source,aim);}}
 this.next=this.time+2.8+this.rand()*.8;}
 if(this.active.length===0&&this.time-this.lastMajor>30){let t=null;if(this.time>=this.rareO){t='orianna';this.rareO=this.time+90+this.rand()*60;}else if(this.time>=this.rareM){t='malphite';this.rareM=this.time+150+this.rand()*90;}if(t){const p=this.player;this.cast(t,{x:p.x-1000,y:p.y},{x:p.x,y:p.y});this.lastMajor=this.time;}}
 }
 step(dt){if(!(dt>0)||dt>.1)throw Error('step requires 0 < dt <= 0.1');if(this.player.hp<=0)return;this.time+=dt;this.schedule();const p=this.player,old={x:p.x,y:p.y};p.root=Math.max(0,p.root-dt);p.flashCooldown=Math.max(0,p.flashCooldown-dt);if(!p.root){const d=distance(p,this.target),n=Math.min(d,p.speed*dt),v=unit(this.target.x-p.x,this.target.y-p.y);p.x=clamp(p.x+v.x*n,p.radius,this.width-p.radius);p.y=clamp(p.y+v.y*n,p.radius,this.height-p.radius);}
 for(const s of [...this.active])this.updateSpell(s,dt,old);}
 updateSpell(s,dt,old){const p=this.player,q=s.spec;s.age+=dt;if(s.phase==='tell'){if(s.type==='orianna'||s.type==='malphite'||s.type==='xerathw'){if(distance(p,s.ball)<=q.radius+p.radius)s.threatened=true;}if(s.age<q.cast+.55)return;s.phase='flight';s.age=0;if(['xerathw','orianna','malphite'].includes(s.type)){if(distance(p,s.ball)<=q.radius+p.radius)this.impact(s,p);this.resolve(s);return;}if(s.type==='xerathq'){const end={x:s.source.x+s.dir.x*q.range,y:s.source.y+s.dir.y*q.range};if(swept({x:s.source.x-p.x,y:s.source.y-p.y},{x:end.x-p.x,y:end.y-p.y},q.radius+p.radius)){s.threatened=true;this.impact(s,p);}this.resolve(s);return;}}
 const from={x:s.x,y:s.y};if(s.returning){s.dir=unit(s.source.x-s.x,s.source.y-s.y);}const speed=s.returning?2000:q.speed;const remaining=s.returning?distance(s,s.source):q.range-s.travel;const move=Math.min(remaining,speed*dt);s.x+=s.dir.x*move;s.y+=s.dir.y*move;s.travel+=move;
 const relA={x:from.x-old.x,y:from.y-old.y},relB={x:s.x-p.x,y:s.y-p.y};const phase=s.returning?'return':'out';
 // A cast qualifies only if the current trajectory would intersect the stationary player.
 const left=s.returning?distance(s,s.source):q.range-s.travel;const horizon=Math.min(left,(s.returning?2000:q.speed)*.8);if(swept({x:s.x-p.x,y:s.y-p.y},{x:s.x+s.dir.x*horizon-p.x,y:s.y+s.dir.y*horizon-p.y},q.radius+p.radius))s.threatened=true;
 const contacts=[];for(const b of this.blockers){if(!s.hits.has(b.id)&&swept({x:from.x-b.x,y:from.y-b.y},{x:s.x-b.x,y:s.y-b.y},q.radius+b.radius))contacts.push({target:b,at:distance(from,b)});}if(!s.hits.has('player:'+phase)&&swept(relA,relB,q.radius+p.radius))contacts.push({target:p,at:distance(from,p)});contacts.sort((a,b)=>a.at-b.at);
 for(const c of contacts){const isPlayer=c.target===p,key=isPlayer?'player:'+phase:c.target.id;if(s.hits.has(key))continue;s.hits.add(key);s.contacts++;if(isPlayer){s.threatened=true;this.impact(s,p);}if(s.type!=='ahri'&&s.contacts>=q.limit){this.resolve(s);return;}}
 if(move>=remaining-1e-7){if(s.type==='ahri'&&!s.returning){s.returning=true;s.travel=0;}else this.resolve(s);}}
 impact(s,p){s.hit=true;this.stats.hits++;this.stats.damage+=s.spec.damage;p.hp=Math.max(0,p.hp-s.spec.damage);if(s.spec.root)p.root=Math.max(p.root,s.spec.root);if(s.type==='blitz'){p.x=clamp(s.source.x,p.radius,this.width-p.radius);p.y=clamp(s.source.y,p.radius,this.height-p.radius);this.target={x:p.x,y:p.y};p.root=.25;}}
 resolve(s){const i=this.active.indexOf(s);if(i<0)return;this.active.splice(i,1);const stat=this.stats.byAbility[s.type]??={threats:0,dodges:0,hits:0};if(s.threatened){stat.threats++;if(s.hit)stat.hits++;else{stat.dodges++;this.stats.dodges++;if(s.flashed)this.stats.flashDodges++;if(s.combo)this.stats.combinations++;}}this.finished.push(s);}
}
