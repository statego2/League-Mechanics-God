'use strict';
// Compare Q→E outcomes against scripted responses in an isolated Node VM.
// Usage: node scripts/benchmark-syndra.cjs /absolute/path/to/checkout
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),testPath=path.join(root,'tests/game.test.cjs'),source=fs.readFileSync(testPath,'utf8'),marker="test('visible build";
if(!source.includes(marker))throw Error('Test harness marker changed');
const harness=source.slice(0,source.indexOf(marker));
const code=`
const results={};
for(const behavior of ['straight','reverse02','reverse04','sidestep','juke','witness']){
 let accepted=0,hits=0,witnessHits=0;
 for(let seed=1;seed<=40;seed++){
  const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');Object.assign(g.dodgeDirector,{next:999,syndraAt:Infinity,cassAt:Infinity,rareAt:Infinity,malAt:Infinity,luxRAt:Infinity});g.player.hp=g.player.maxHp=1e7;
  const angle=(seed%8)*Math.PI/4,ux=Math.cos(angle),uy=Math.sin(angle),spots=[[600,330],[450,300],[750,420],[200,300],[950,550]],[x,y]=spots[seed%spots.length];g.player.x=x;g.player.y=y;g.moveTo(x+ux*500,y+uy*500);advance(g,.4);g.setRng(seed*7919);
  const witness={};if(!g.spawnSyndra(true,witness))continue;accepted++;
  for(let i=0;i<240;i++){
   if((behavior==='reverse02'||behavior==='witness'||behavior==='sidestep'||behavior==='juke')&&i===24){
    if(behavior==='witness')g.moveTo(witness.destination.x,witness.destination.y);
    else if(behavior==='reverse02')g.moveTo(g.player.x-ux*400,g.player.y-uy*400);
    else if(behavior==='sidestep')g.moveTo(g.player.x-uy*400,g.player.y+ux*400);
    else g.moveTo(g.player.x-ux*400,g.player.y-uy*400);
   }
   if(behavior==='reverse04'&&i===48)g.moveTo(g.player.x-ux*400,g.player.y-uy*400);
   if(behavior==='juke'&&i===54)g.moveTo(g.player.x+ux*400,g.player.y+uy*400);
   g.update(1/120);
  }
  if(g.dodgeDirector.outcomes['SYNDRA E']?.hit)hits++;
  if(behavior==='witness'&&g.stats.hits)witnessHits++;
 }
 results[behavior]={accepted,eHits:hits,witnessHits};
}
console.log(JSON.stringify(results,null,2));`;
new Function('require',harness+'\n'+code)(createRequire(testPath));
