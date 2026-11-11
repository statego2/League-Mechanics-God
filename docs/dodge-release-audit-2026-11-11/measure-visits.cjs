"use strict";
// Read-only release fixture. Usage: node measure-visits.cjs /absolute/checkout
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),testPath=path.join(root,'tests/game.test.cjs');
const source=fs.readFileSync(testPath,'utf8'),marker="test('visible build";
if(!source.includes(marker))throw Error('Review changed harness');
const code=`
const result={baselineContract:'20 seeds x (30 s warmup + 120 s measured), high HP, 120 Hz',profiles:{}};
for(const profile of ['stationary','moving']){
 const runs=[];
 for(let seed=1;seed<=20;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(seed*7919);g.player.hp=g.player.maxHp=1e7;
  let before=null,presence=0,lastCount=0,arrivals=[];
  for(let i=0;i<150*120;i++){
   if(profile==='moving'&&i%144===0){const k=i/144;g.moveTo(200+((k*373+seed*97)%800),210+((k*211+seed*53)%380));}
   if(i===30*120){const d=g.dodgeDirector;before={visits:d.syndraStays||0,q:d.syndra||0,e:d.syndraE||0,casts:d.attempted};}
   g.update(1/120);const d=g.dodgeDirector;
   if(i>=30*120){if((d.syndraStays||0)>lastCount)arrivals.push(g.time);if(g.foes.some(e=>e.alive&&e.syndraCaster))presence+=1/120;}
   lastCount=d.syndraStays||0;
  }
  const d=g.dodgeDirector,q=(d.syndra||0)-before.q,e=(d.syndraE||0)-before.e;
  runs.push({seed,visits:(d.syndraStays||0)-before.visits,q,e,otherCasts:d.attempted-before.casts-q-e,presenceSeconds:+presence.toFixed(3),arrivals:arrivals.map(t=>+t.toFixed(3))});
 }
 const sum=k=>runs.reduce((s,r)=>s+r[k],0),minutes=runs.length*2;
 result.profiles[profile]={visitsPerMinute:sum('visits')/minutes,qPerMinute:sum('q')/minutes,ePerMinute:sum('e')/minutes,otherCastsPerMinute:sum('otherCasts')/minutes,presenceFraction:sum('presenceSeconds')/(minutes*60),runs};
}
console.log(JSON.stringify(result,null,2));`;
new Function('require',source.slice(0,source.indexOf(marker))+'\n'+code)(createRequire(testPath));
