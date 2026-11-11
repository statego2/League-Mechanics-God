'use strict';
// Deterministic high-HP idle fixture; not a human balance test.
// Usage: node scripts/benchmark-overlap.cjs /absolute/path/to/checkout
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),testPath=path.join(root,'tests/game.test.cjs'),source=fs.readFileSync(testPath,'utf8'),marker="test('visible build";
if(!source.includes(marker))throw Error('Test harness marker changed');
const code=`
const results={sessions:20,secondsPerSession:120,overlap:{ezreal:0,lux:0,blitz:0},attempted:0,ahri:0,syndraQ:0,syndraE:0};
for(let seed=1;seed<=results.sessions;seed++){
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(seed*7919);g.player.hp=g.player.maxHp=1e7;
 const saw={ezreal:false,lux:false,blitz:false};
 for(let i=0;i<120*120;i++){
  g.update(1/120);
  if(g.shots.some(s=>s.alive&&s.kind==='enemyOrb'))for(const [key,name] of [['ezreal','EZREAL Q'],['lux','LUX Q'],['blitz','BLITZ Q']])if(g.shots.some(s=>s.alive&&s.spellName===name))saw[key]=true;
 }
 for(const key of Object.keys(saw))results.overlap[key]+=Number(saw[key]);
 const d=g.dodgeDirector;results.attempted+=d.attempted;results.ahri+=d.ahri;results.syndraQ+=d.syndra||0;results.syndraE+=d.syndraE||0;
}
console.log(JSON.stringify(results,null,2));`;
new Function('require',source.slice(0,source.indexOf(marker))+'\n'+code)(createRequire(testPath));
