'use strict';
// Node VM diagnostic only: excludes browser rendering and is not a frame-rate guarantee.
// Usage: node scripts/benchmark-dodge-performance.cjs /absolute/path/to/checkout
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),testPath=path.join(root,'tests/game.test.cjs'),source=fs.readFileSync(testPath,'utf8'),marker="test('visible build";
if(!source.includes(marker))throw Error('Test harness marker changed');
const code=`
const {performance}=require('node:perf_hooks'),samples=[],slowSteps=[];let slow=0,syndraCasts=0;
for(let seed=1;seed<=6;seed++){
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(seed*7919);g.player.hp=g.player.maxHp=1e7;
 for(let i=0;i<120*90;i++){
  if(i%144===0){const k=i/144;g.moveTo(200+((k*373+seed*97)%800),210+((k*211+seed*53)%380));}
  const before=g.dodgeDirector.syndra||0,t=performance.now();g.update(1/120);const elapsed=performance.now()-t;samples.push(elapsed);if(elapsed>8.33){slow++;slowSteps.push({ms:elapsed,seed,time:g.time,syndraCast:(g.dodgeDirector.syndra||0)>before,syndraPresent:g.foes.some(e=>e.alive&&e.syndraCaster),hazards:g.hazards.length,shots:g.shots.length});}syndraCasts+=(g.dodgeDirector.syndra||0)-before;
 }
}
samples.sort((a,b)=>a-b);const q=p=>samples[Math.min(samples.length-1,Math.floor((samples.length-1)*p))];
console.log(JSON.stringify({environment:'Node VM, simulation only, 6 seeds, scripted movement and high HP',updates:samples.length,syndraCasts,medianMs:q(.5),p95Ms:q(.95),p99Ms:q(.99),p999Ms:q(.999),maxMs:q(1),over8_33ms:slow,slowSteps:slowSteps.sort((a,b)=>b.ms-a.ms).slice(0,10)},null,2));`;
new Function('require',source.slice(0,source.indexOf(marker))+'\n'+code)(createRequire(testPath));
