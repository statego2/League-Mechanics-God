import {test} from 'node:test';import assert from 'node:assert/strict';import {DodgeEngine,swept} from './engine.mjs';
const run=(g,t,dt=1/120)=>{for(let i=0;i<Math.round(t/dt);i++)g.step(dt)};
test('swept collision catches fast crossing',()=>assert.equal(swept({x:-100,y:0},{x:100,y:0},5),true));
test('off-axis missile is not a dodge',()=>{const g=new DodgeEngine({director:false});g.cast('ezreal',{x:0,y:0},{x:1200,y:0});run(g,2);assert.equal(g.stats.dodges,0);assert.equal(g.stats.hits,0)});
test('first target blocks Ezreal but Lux hits two targets',()=>{for(const [type,expected] of [['ezreal',0],['lux',1]]){const g=new DodgeEngine({director:false});g.blockers.push({id:'minion',x:700,y:675,radius:30});g.cast(type,{x:200,y:675},{x:1200,y:675});run(g,2);assert.equal(g.stats.hits,expected,type)}});
test('Ahri returns and can hit once per pass',()=>{const g=new DodgeEngine({director:false});g.cast('ahri',{x:500,y:675},{x:1200,y:675});run(g,2);assert.equal(g.stats.hits,2)});
test('seeded director produces identical state',()=>{const a=new DodgeEngine({seed:9}),b=new DodgeEngine({seed:9});run(a,30);run(b,30);assert.deepEqual(a,b)});
test('same fixed-step simulation is independent of display frame grouping',()=>{const a=new DodgeEngine({seed:7}),b=new DodgeEngine({seed:7});for(let i=0;i<1200;i++)a.step(1/120);for(let i=0;i<300;i++)for(let j=0;j<4;j++)b.step(1/120);assert.deepEqual(a,b)});
