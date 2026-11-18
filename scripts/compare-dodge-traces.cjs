// Compare deterministic Dodge simulation snapshots against a committed baseline.
// Usage: node scripts/compare-dodge-traces.cjs [baseline-ref]
const fs=require('fs'),{execFileSync}=require('child_process');
const ref=process.argv[2]||'cafb8a4';
const baseline=execFileSync('git',['show',`${ref}:game.js`],{encoding:'utf8'});
const candidate=fs.readFileSync(require.resolve('../game.js'),'utf8');
const prefix=fs.readFileSync(require.resolve('../tests/game.test.cjs'),'utf8').split("test('visible build")[0]
 .replace("fs.readFileSync(require.resolve('../game.js'),'utf8')",'gameSource')
 .replace('adcLiveCasts,adcStartSpecial,adcBeam,addEnemy,','');
const run=new Function('require','gameSource','traceSeed',prefix+`
 const {g}=boot('ahri');g.reset('dodge');g.setRng(traceSeed);const trace=[];
 for(let i=0;i<7200&&g.state==='playing';i++){
  if(i%480===0)g.moveTo(350+(i/480%3)*180,200+(i/480%2)*250);
  g.update(1/120);
  if(i%60===0)trace.push({t:g.time,hp:g.player.hp,p:[g.player.x,g.player.y],foes:g.foes.map(e=>[e.id,e.spell?.name,e.phase,e.x,e.y]),shots:g.shots.map(s=>[s.kind,s.spellName,s.x,s.y,s.phase]),hazards:g.hazards.map(h=>[h.spellName,h.phase,h.x,h.y,h.ttl]),outcomes:JSON.parse(JSON.stringify(g.dodgeDirector.outcomes))});
 }
 return JSON.stringify(trace);`);
for(const seed of [123456,82473,90421]){
 const a=run(require,baseline,seed),b=run(require,candidate,seed);
 if(a!==b){console.error(`Dodge trace differs for seed ${seed}`);process.exitCode=1;}
 else console.log(`Dodge trace matched for seed ${seed}: ${JSON.parse(a).length} snapshots`);
}
