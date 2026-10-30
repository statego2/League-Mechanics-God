// Tracks a counterfactual stationary threat; expiration before the crossing is not a dodge.
export function createThreatTracker() {
  let threatened = false;
  return {
    observe(shot, actor) {
      const {x:vx,y:vy}=shot.velocity, speed=Math.hypot(vx,vy);
      if (!speed) return;
      const dx=actor.position.x-shot.position.x, dy=actor.position.y-shot.position.y;
      const along=(dx*vx+dy*vy)/speed, lateral=Math.abs(dx*vy-dy*vx)/speed;
      if (along>=0 && along<=shot.remainingRange && along/speed<=2 && lateral<=shot.radius+actor.radius) threatened=true;
    },
    resolve(outcome) { return outcome === 'passed' && threatened ? 'avoided' : outcome === 'hit' ? 'hit' : 'miss'; }
  };
}
