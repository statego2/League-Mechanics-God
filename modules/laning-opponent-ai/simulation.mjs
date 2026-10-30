// Deterministic test harness, not a replacement for the game's minion simulation.
import { createLaningOpponent } from './brain.mjs';
import { pathToFileURL } from 'node:url';
export function runSimulation(duration = 180) {
  const brain = createLaningOpponent(), dt = .1;
  const metrics = { csAttempts:0, successfulCS:0, missedOpportunities:0, damageDealt:0, damageTaken:0, invalidCommands:0, dodges:0, reposition:0, poke:0 };
  const self = {alive:true,position:{x:0,y:0},radius:8,moveSpeed:80,health:500,maxHealth:500,mana:100,attack:{ready:true,range:100,windup:.2,projectileSpeed:400,damage:50},abilities:[{id:'Q',ready:true,range:180,damage:35,manaCost:10,lineClear:true}]};
  const player = {id:'player',alive:true,visible:true,position:{x:145,y:0},windingUp:false,exposed:false,threatReady:true};
  let minions=[], shots=[], attacks=[], attackReady=0, spellReady=0, nextWave=0, nextShot=4, seq=0;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  for(let tick=0; tick<=Math.round(duration/dt);tick++) {
    const time=+(tick*dt).toFixed(6);
    if(time >= nextWave) { minions.push({id:`m${seq++}`,team:'player',visible:true,alive:true,position:{x:130,y:0},health:80,value:12,hitAt:time+1.5,expireAt:time+4}); nextWave+=6; }
    if(time >= nextShot) {shots.push({visible:true,position:{x:self.position.x+160,y:self.position.y},velocity:{x:-100,y:0},radius:8,remainingRange:300});nextShot+=12;}
    player.windingUp = time % 6 >= 2 && time % 6 < 3;
    self.attack.ready=time>=attackReady;self.abilities[0].ready=time>=spellReady;
    for(const m of minions) if(m.alive && time>=m.hitAt && !m.hit) {m.health-=40;m.hit=true;}
    for(const a of attacks) if(!a.done && time>=a.at) { const m=minions.find(x=>x.id===a.id); if(m?.alive){m.health-=50;if(m.health<=0){m.alive=false;metrics.successfulCS++;}} a.done=true; }
    for(const m of minions) if(m.alive && time>=m.expireAt) {m.alive=false;metrics.missedOpportunities++;}
    for(const shot of shots) {shot.position.x+=shot.velocity.x*dt;shot.remainingRange-=Math.abs(shot.velocity.x*dt); if(!shot.resolved && distance(shot.position,self.position)<shot.radius+self.radius){metrics.damageTaken+=20;shot.resolved=true;} if(!shot.resolved && shot.position.x<self.position.x-20){metrics.dodges++;shot.resolved=true;}}
    shots=shots.filter(s=>s.remainingRange>0 && !s.resolved);
    const snapshot = {time,self,player,minions:minions.map(m=>({...m,incoming:!m.hit?[{visible:true,eta:Math.max(0,m.hitAt-time),damage:40}]:[]})),skillshots:shots,tradeValue:30,tradeRisk:4,minionRetaliation:3,positionalRisk:2};
    const action=brain.decide(snapshot);
    if(action.type==='move') {const d=distance(self.position,action.destination);if(!Number.isFinite(d)) metrics.invalidCommands++;else if(d>0){const step=Math.min(d,self.moveSpeed*dt);self.position.x+=(action.destination.x-self.position.x)/d*step;self.position.y+=(action.destination.y-self.position.y)/d*step;metrics.reposition++;}}
    if(action.type==='attack') {const m=minions.find(x=>x.id===action.targetId);if(action.targetId==='player') {if(!self.attack.ready || distance(self.position,player.position)>self.attack.range+self.radius) metrics.invalidCommands++;else {attackReady=time+1;metrics.damageDealt+=20;metrics.poke++;}} else if(!m?.alive || !self.attack.ready || distance(self.position,m.position)>self.attack.range+self.radius+(m.radius||0)) metrics.invalidCommands++;else {attackReady=time+1;metrics.csAttempts++;attacks.push({id:m.id,at:time+self.attack.windup+distance(self.position,m.position)/self.attack.projectileSpeed});}}
    if(action.type==='cast') {if(!self.abilities[0].ready || self.mana<10 || distance(self.position,player.position)>180) metrics.invalidCommands++;else {spellReady=time+4;self.mana-=10;metrics.damageDealt+=35;metrics.poke++;}}
    self.mana=Math.min(100,self.mana+.1);
  }
  return metrics;
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) console.log(JSON.stringify(runSimulation(),null,2));
