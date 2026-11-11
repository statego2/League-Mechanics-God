'use strict';
// Sample the Expert director with normal and high HP; not a human balance test.
// Usage: node scripts/benchmark-director-roster.cjs /absolute/path/to/checkout
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),testPath=path.join(root,'tests/game.test.cjs'),source=fs.readFileSync(testPath,'utf8'),marker="test('visible build";
if(!source.includes(marker))throw Error('Test harness marker changed');
const code=`
const runs=[];for(let seed=1;seed<=30;seed++){
 const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(seed*7919);g.player.hp=g.player.maxHp=1e7;let cassAppeared=false;
 for(let i=0;i<120*90;i++){g.update(1/120);if(g.hazards.some(h=>h.cassio))cassAppeared=true;}
 const d=g.dodgeDirector;runs.push({seed,ahri:d.ahri,cass:d.cassio,cassAppeared,mal:d.malphite,ori:d.orianna,syndraQ:d.syndra||0,syndraE:d.syndraE||0,casts:d.attempted});
}
const has=key=>runs.filter(r=>r[key]>0).length;
console.log(JSON.stringify({sessions:runs.length,seconds:90,withAhri:has('ahri'),withCassCast:has('cass'),withCassAppearance:runs.filter(r=>r.cassAppeared).length,withMalphite:has('mal'),withOrianna:has('ori'),minAhri:Math.min(...runs.map(r=>r.ahri)),minSyndraE:Math.min(...runs.map(r=>r.syndraE)),runs},null,2));`;
new Function('require',source.slice(0,source.indexOf(marker))+'\n'+code)(createRequire(testPath));
