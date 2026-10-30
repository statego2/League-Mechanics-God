const {test}=require('node:test');
const assert=require('node:assert/strict');
const world=require('../world.js');
test('a route goes around the wall and all segments clear the player radius',()=>{
 const start={x:35,y:150},goal={x:400,y:150},route=world.path(start,goal);
 assert.ok(route.length>1);let previous=start;
 for(const waypoint of route){assert.ok(world.pointWalkable(waypoint));assert.ok(world.segmentClear(previous,waypoint));previous=waypoint;}
 assert.deepEqual(route.at(-1),goal);
});
test('a click inside a wall resolves to a nearby walkable destination',()=>{
 const desired={x:125,y:150},actual=world.nearestWalkable(desired);
 assert.ok(world.pointWalkable(actual));assert.ok(Math.hypot(actual.x-desired.x,actual.y-desired.y)<100);
});
test('a dash stops before the wall and cannot tunnel across in one update',()=>{
 const start={x:35,y:150},end={x:400,y:150},actual=world.clip(start,end);
 assert.ok(actual.x<85);assert.ok(world.segmentClear(start,actual));assert.ok(world.pointWalkable(actual));
});
test('unobstructed paths remain direct',()=>{
 const start={x:600,y:337},goal={x:800,y:337};assert.deepEqual(world.path(start,goal),[goal]);
});
test('routes for varied starts and goals stay walkable and reach a valid destination',()=>{
 let seed=39;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
 for(let i=0;i<500;i++){
  const start=world.nearestWalkable({x:22+rand()*1156,y:59+rand()*580});
  const goal=world.nearestWalkable({x:22+rand()*1156,y:59+rand()*580});
  const route=world.path(start,goal);assert.ok(route.length>0,`missing route at sample ${i}`);
  let prior=start;for(const point of route){assert.ok(world.pointWalkable(point),`blocked waypoint ${i}`);assert.ok(world.segmentClear(prior,point),`blocked segment ${i}`);prior=point;}
  assert.ok(Math.hypot(prior.x-goal.x,prior.y-goal.y)<.01);
 }
});
