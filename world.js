"use strict";
// Hand-authored collision proxies for the prominent stone walls in the painted arena.
// The visual background is illustrative, not an exact Summoner's Rift collision mesh.
(function(root){
const bounds={left:22,right:1178,top:59,bottom:639};
const walls=[{left:205,top:105,right:295,bottom:205},{left:610,top:485,right:705,bottom:590}];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const expanded=(r,pad)=>({left:r.left-pad,right:r.right+pad,top:r.top-pad,bottom:r.bottom+pad});
function inside(p,r){return p.x>r.left&&p.x<r.right&&p.y>r.top&&p.y<r.bottom;}
function pointWalkable(p,pad=17){return p.x>=bounds.left&&p.x<=bounds.right&&p.y>=bounds.top&&p.y<=bounds.bottom&&!walls.some(r=>inside(p,expanded(r,pad)));}
function nearestWalkable(p,pad=17){
 let q={x:clamp(p.x,bounds.left,bounds.right),y:clamp(p.y,bounds.top,bounds.bottom)};
 for(let pass=0;pass<walls.length+1;pass++){
  const r=walls.map(w=>expanded(w,pad)).find(w=>inside(q,w));if(!r)break;
  const candidates=[{x:r.left-1,y:q.y},{x:r.right+1,y:q.y},{x:q.x,y:r.top-1},{x:q.x,y:r.bottom+1}].filter(v=>v.x>=bounds.left&&v.x<=bounds.right&&v.y>=bounds.top&&v.y<=bounds.bottom);
  candidates.sort((a,b)=>Math.hypot(a.x-q.x,a.y-q.y)-Math.hypot(b.x-q.x,b.y-q.y));
  if(!candidates.length)break;q=candidates[0];
 }
 return q;
}
// Slab intersection with expanded walls; prevents crossing even at low frame rates.
function segmentClear(a,b,pad=17){
 for(const w of walls){const r=expanded(w,pad);let lo=0,hi=1;
  for(const [v,d,min,max] of [[a.x,b.x-a.x,r.left,r.right],[a.y,b.y-a.y,r.top,r.bottom]]){
   if(Math.abs(d)<1e-9){if(v<=min||v>=max){lo=2;break;}continue;}
   let t0=(min-v)/d,t1=(max-v)/d;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>=hi)break;
  }
  if(lo<hi&&hi>0&&lo<1)return false;
 }
 return true;
}
// A small visibility graph around padded wall corners gives exact straight segments
// and avoids grid stair-stepping. Returns [] when no route is available.
function path(start,destination,pad=17){
 const goal=nearestWalkable(destination,pad);if(segmentClear(start,goal,pad))return [goal];
 const nodes=[start,goal];for(const wall of walls){const r=expanded(wall,pad+2);for(const x of [r.left,r.right])for(const y of [r.top,r.bottom]){const p={x,y};if(pointWalkable(p,pad))nodes.push(p);}}
 const n=nodes.length,weights=Array(n).fill(Infinity),prev=Array(n).fill(-1),done=Array(n).fill(false);weights[0]=0;
 for(let iteration=0;iteration<n;iteration++){
  let u=-1;for(let i=0;i<n;i++)if(!done[i]&&(u<0||weights[i]<weights[u]))u=i;
  if(u<0||!Number.isFinite(weights[u])||u===1)break;done[u]=true;
  for(let v=1;v<n;v++)if(!done[v]&&segmentClear(nodes[u],nodes[v],pad)){
   const cost=weights[u]+Math.hypot(nodes[u].x-nodes[v].x,nodes[u].y-nodes[v].y);
   if(cost<weights[v]){weights[v]=cost;prev[v]=u;}
  }
 }
 if(!Number.isFinite(weights[1]))return [];
 const route=[];for(let i=1;i!==0;i=prev[i]){if(i<0)return [];route.push(nodes[i]);}return route.reverse();
}
// Walk/dash stops at the first obstacle rather than tunnelling through it.
function clip(a,b,pad=17){
 if(segmentClear(a,b,pad))return b;let lo=0,hi=1;
 for(let i=0;i<20;i++){const t=(lo+hi)/2,p={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};if(segmentClear(a,p,pad))lo=t;else hi=t;}
 return {x:a.x+(b.x-a.x)*lo,y:a.y+(b.y-a.y)*lo};
}
root.LaneWorld={walls,bounds,pointWalkable,nearestWalkable,segmentClear,path,clip};
if(typeof module!=="undefined")module.exports=root.LaneWorld;
})(typeof globalThis!=="undefined"?globalThis:this);
