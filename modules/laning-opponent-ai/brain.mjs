// A policy, not a combat simulator. Times are seconds; distances share engine units.
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const point = p => ({ x: p.x, y: p.y });
const reachable = (a, b, range) => dist(a, b) <= range + (a.radius || 0) + (b.radius || 0);
const hold = reason => ({ type: 'hold', reason });

export function createLaningOpponent(options = {}) {
  const cfg = { reactionDelay: 0.2, spacing: 0.85, tradeMargin: 1.2, baitInterval: 5, ...options };
  if (!(cfg.reactionDelay > 0)) throw new Error('reactionDelay must be positive');
  let history = [], lastTime = -Infinity, lastBait = -Infinity;

  function reset() { history = []; lastTime = -Infinity; lastBait = -Infinity; }

  function decide(state) {
    if (!Number.isFinite(state.time) || state.time < lastTime) throw new Error('time must be finite and monotonic; reset for a new session');
    lastTime = state.time;
    // Clone at observation time; a mutable engine state must not rewrite the past.
    const snapshot = structuredClone(state);
    history.push(snapshot);
    const cutoff = state.time - cfg.reactionDelay + 1e-9;
    while (history.length > 1 && history[1].time <= cutoff) history.shift();
    const seen = history[0].time <= cutoff ? history[0] : null;
    if (!seen) return hold('reacting');
    const me = seen.self, player = seen.player;
    if (!me || !state.self || !me.alive || !state.self.alive) return hold('unavailable');
    // The engine owns commitment, cooldown, collision, damage and pathfinding.
    if (state.self.committed || me.committed) return hold('committed');
    const validPoint = p => Number.isFinite(p?.x) && Number.isFinite(p?.y);
    if (!validPoint(me.position) || !validPoint(state.self.position)) return hold('invalid position');
    const move = (destination, reason) => validPoint(destination) ? { type: 'move', destination, reason } : hold('invalid destination');
    const visiblePlayer = player?.visible && player.alive && validPoint(player.position);
    const currentPlayer = state.player?.visible && state.player.alive && validPoint(state.player.position);
    const canAttack = state.self.attack?.ready && me.attack?.ready;
    const liveTarget = id => (state.minions || []).find(m => m.id === id && m.visible && m.alive && m.team === 'player');
    // Only already visible, linear projectiles are considered; no future player input.
    for (const shot of seen.skillshots || []) {
      if (!shot.visible || !validPoint(shot.position) || !validPoint(shot.velocity)) continue;
      const v2 = shot.velocity.x ** 2 + shot.velocity.y ** 2;
      if (!v2) continue;
      const rel = { x: me.position.x - shot.position.x, y: me.position.y - shot.position.y };
      const t = (rel.x * shot.velocity.x + rel.y * shot.velocity.y) / v2;
      const lateral = Math.abs(rel.x * shot.velocity.y - rel.y * shot.velocity.x) / Math.sqrt(v2);
      if (t > cfg.reactionDelay && t < 1.2 && lateral < (shot.radius || 0) + (me.radius || 0) + 8) {
        const sign = rel.x * -shot.velocity.y + rel.y * shot.velocity.x >= 0 ? 1 : -1;
        const step = (shot.radius || 0) + (me.radius || 0) + 30;
        return move({ x: me.position.x - sign * shot.velocity.y / Math.sqrt(v2) * step, y: me.position.y + sign * shot.velocity.x / Math.sqrt(v2) * step }, 'dodge visible projectile');
      }
    }
    const candidates = (seen.minions || []).filter(m => m.visible && m.alive && m.team === 'player' && validPoint(m.position));
    const farm = candidates.map(m => {
      const travel = me.attack.projectileSpeed > 0 ? dist(me.position, m.position) / me.attack.projectileSpeed : 0;
      const impact = me.attack.windup + travel;
      // Incoming impacts are estimates of visible, already launched attacks, not future attacks.
      const incoming = (m.incoming || []).filter(i => i.visible && i.eta >= 0 && i.eta <= impact).reduce((sum, i) => sum + i.damage, 0);
      return { m, hp: m.health - incoming, impact };
    }).filter(x => x.hp > 0 && x.hp <= me.attack.damage && reachable(me.position, x.m.position, me.attack.range));
    farm.sort ( (a,b) => (b.m.value || 1) - (a.m.value || 1) || a.hp - b.hp || String(a.m.id).localeCompare(String(b.m.id)) );
    const target = farm.find(x => {
      const now = liveTarget(x.m.id);
      return now && now.health > 0 && reachable(state.self.position, now.position, state.self.attack.range);
    });
    const cost = Math.max(0, seen.tradeRisk || 0);
    const trade = visiblePlayer && currentPlayer && (player.windingUp || player.exposed) && (seen.tradeValue || 0) > cost * cfg.tradeMargin;
    const spell = (me.abilities || []).find(a => a.ready && a.damage > 0 && a.lineClear && reachable(me.position, player?.position || me.position, a.range) && (state.self.abilities || []).some(b => b.id === a.id && b.ready && b.lineClear && currentPlayer && reachable(state.self.position, state.player.position, b.range)));
    // A good trade can outweigh a low-value CS, but not a high-value minion by default.
    if (trade && spell && (!target || (seen.tradeValue - cost) > (target.m.value || 1))) {
      return { type: 'cast', abilityId: spell.id, targetId: player.id, aim: point(player.position), reason: player.windingUp ? 'punish visible windup' : 'punish exposed position' };
    }
    if (target && canAttack) return { type: 'attack', targetId: target.m.id, reason: 'last hit' };
    if (trade && canAttack && reachable(me.position, player.position, me.attack.range) && reachable(state.self.position, state.player.position, state.self.attack.range)) return { type: 'attack', targetId: player.id, reason: 'punish commitment' };
    if (visiblePlayer && currentPlayer) {
      const d = dist(me.position, player.position), desired = me.attack.range * cfg.spacing;
      if (d < desired * 0.7 && d > 0) return move({ x: me.position.x + (me.position.x-player.position.x)/d * (desired-d), y: me.position.y + (me.position.y-player.position.y)/d * (desired-d) }, 'maintain spacing');
      if (d > desired * 1.2 && d > 0 && cost < (seen.tradeValue || 0)) return move({ x: me.position.x + (player.position.x-me.position.x)/d * (d-desired), y: me.position.y + (player.position.y-me.position.y)/d * (d-desired) }, 'approach range');
      if (!target && player.threatReady && state.time - lastBait >= cfg.baitInterval && d > desired * 0.9 && d < desired * 1.4 && cost < (seen.tradeValue || 0)) {
        lastBait = state.time;
        return move({ x: me.position.x + (player.position.x-me.position.x)/d * Math.min(25, d-desired*0.8), y: me.position.y + (player.position.y-me.position.y)/d * Math.min(25, d-desired*0.8) }, 'bait approach');
      }
    }
    return hold(target && !canAttack ? 'attack cooldown' : 'no favorable action');
  }
  return { decide, reset };
}
