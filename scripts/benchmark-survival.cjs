'use strict';
// Normal-HP input smoke test, not a model of human play or a balance score.
// Usage: node scripts/benchmark-survival.cjs /absolute/path/to/checkout
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),testPath=path.join(root,'tests/game.test.cjs'),source=fs.readFileSync(testPath,'utf8'),marker="test('visible build";
if(!source.includes(marker))throw Error('Test harness marker changed');
const code=`
const runs=[];
for(let seed=1;seed<=20;seed++){
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(seed*7919);
 let commands=0;
 for(let i=0;i<120*60&&g.state==='playing';i++){
  if(i%72===0){const angle=((seed*17+commands++*7)%16)*Math.PI/8;g.moveTo(g.player.x+Math.cos(angle)*180,g.player.y+Math.sin(angle)*180);}
  g.update(1/120);
 }
 runs.push({seed,time:+g.time.toFixed(2),ended:g.state==='ended',hits:g.stats.hits,syndraQ:g.dodgeDirector.syndra||0,syndraE:g.dodgeDirector.syndraE||0});
}
console.log(JSON.stringify({fixture:'normal HP, scripted movement every 0.6 s, no abilities or Flash',runs},null,2));`;
new Function('require',source.slice(0,source.indexOf(marker))+'\n'+code)(createRequire(testPath));
