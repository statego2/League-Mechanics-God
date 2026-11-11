'use strict';
// Synthetic response immediately at the E cue, not a human-reaction study.
// Usage: node scripts/benchmark-syndra-e-reaction.cjs /absolute/path/to/checkout [--reaction=0.15] [--edges]
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),testPath=path.join(root,'tests/game.test.cjs'),source=fs.readFileSync(testPath,'utf8'),marker="test('visible build";
if(!source.includes(marker))throw Error('Test harness marker changed');
const code=`
const result={},bySeed={};
for(const behavior of ['continue','perpendicularLeft','perpendicularRight','verifiedWitness']){
 let accepted=0,eHits=0,qHits=0,spellCount={};
 for(let seed=1;seed<=80;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');Object.assign(g.dodgeDirector,{next:999,syndraAt:Infinity,cassAt:Infinity,rareAt:Infinity,malAt:Infinity,luxRAt:Infinity});g.player.hp=g.player.maxHp=1e7;
  const spots=process.argv.includes('--edges')?[[50,80],[1150,80],[50,620],[1150,620],[205,220],[650,530]]:[[600,330],[450,300],[750,420],[200,300],[950,550]],angle=(seed%8)*Math.PI/4,[x,y]=spots[seed%spots.length];g.player.x=x;g.player.y=y;g.moveTo(x+Math.cos(angle)*450,y+Math.sin(angle)*450);advance(g,.4);g.setRng(seed*7919);
  if(!g.spawnSyndra(true))continue;const h=g.hazards.find(h=>h.syndra);accepted++;spellCount[h.aimPattern]=(spellCount[h.aimPattern]||0)+1;
  while(g.state==='playing'&&h.phase==='q')g.update(1/120);
  if(h.phase==='e'&&behavior!=='continue'){const option=process.argv.find(x=>x.startsWith('--reaction=')),reaction=option?Number(option.slice(11)):.08;advance(g,reaction);const side=behavior==='perpendicularLeft'?1:-1,world=require('../world.js'),raw={x:Math.max(world.bounds.left,Math.min(world.bounds.right,g.player.x-Math.sin(h.angle)*side*80)),y:Math.max(world.bounds.top,Math.min(world.bounds.bottom,g.player.y+Math.cos(h.angle)*side*80))},target=behavior==='verifiedWitness'?h.eEscape:world.clip(g.player,raw,g.player.r);if(target)g.moveTo(target.x,target.y);}
  advance(g,1.5);const hit=Number(!!g.dodgeDirector.outcomes['SYNDRA E']?.hit);eHits+=hit;qHits+=Number(!!g.dodgeDirector.outcomes['SYNDRA Q']?.hit);(bySeed[seed]||(bySeed[seed]={}))[behavior]=hit;
 }
 result[behavior]={accepted,qHits,eHits,spellCount};
}
result.eitherSideAvoids=Object.values(bySeed).filter(v=>v.perpendicularLeft===0||v.perpendicularRight===0).length;
result.bothSidesHit=Object.values(bySeed).filter(v=>v.perpendicularLeft===1&&v.perpendicularRight===1).length;
result.bothSidesHitSeeds=Object.keys(bySeed).filter(k=>bySeed[k].perpendicularLeft===1&&bySeed[k].perpendicularRight===1).map(Number);
result.witnessHitSeeds=Object.keys(bySeed).filter(k=>bySeed[k].verifiedWitness===1).map(Number);
console.log(JSON.stringify(result,null,2));`;
new Function('require',source.slice(0,source.indexOf(marker))+'\n'+code)(createRequire(testPath));
