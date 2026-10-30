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
    const age = state.time - seen.time;
    // Extrapolate only a previously visible projectile's linear motion, never hidden input.
    for (const shot of seen.skillshots || []) {
      if (!shot.visible || !validPoint(shot.position) || !validPoint(shot.velocity)) continue;
      const v2 = shot.velocity.x ** 2 + shot.velocity.y ** 2;
      if (!v2) continue;
      const speed = Math.sqrt(v2);
      const pos = { x: shot.position.x + shot.velocity.x * age, y: shot.position.y + shot.velocity.y * age };
      const rel = { x: state.self.position.x - pos.x, y: state.self.position.y - pos.y };
      const t = (rel.x * shot.velocity.x + rel.y * shot.velocity.y) / v2;
      const cross = (rel.x * -shot.velocity.y + rel.y * shot.velocity.x) / speed;
      const width = (shot.radius || 0) + (state.self.radius || 0);
      const movementSpeed = state.self.moveSpeed || 0;
      const clearance = width + 8 - Math.abs(cross);
      // A move is useful only if there is enough time to clear the swept hitbox.
      if (t > 0 && t < 1.2 && clearance > 0 && movementSpeed > 0 && clearance / movementSpeed < t && (shot.remainingRange == null || speed * (age + t) <= shot.remainingRange)) {
        const sign = cross >= 0 ? 1 : -1;
        return move({ x: state.self.position.x - sign * shot.velocity.y / speed * clearance, y: state.self.position.y + sign * shot.velocity.x / speed * clearance }, 'dodge visible projectile');
      }
    }
    const candidates = (seen.minions || []).filter(m => m.visible && m.alive && m.team === 'player' && validPoint(m.position));
    const farm = candidates.map(m => {
      const speed = me.moveSpeed || 0;
      const distance = dist(me.position, m.position);
      const reach = me.attack.range + (me.radius || 0) + (m.radius || 0);
      const walk = speed > 0 ? Math.max(0, distance - reach * .95) / speed : Infinity;
      const impact = (distance <= reach ? 0 : walk) + me.attack.windup + (me.attack.projectileSpeed > 0 ? Math.min(distance, reach) / me.attack.projectileSpeed : 0);
      const incoming = (m.incoming || []).filter(i => i.visible && i.eta >= age && i.eta <= age + impact).reduce((sum, i) => sum + i.damage, 0);
      // Account for shots that should already have landed in the delayed observation.
      const past = (m.incoming || []).filter(i => i.visible && i.eta >= 0 && i.eta < age).reduce((sum, i) => sum + i.damage, 0);
      return { m, hp: m.health - past - incoming, distance, reach, walk };
    }).filter(x => x.hp > 0 && x.hp <= me.attack.damage);
    farm.sort((a,b) => (b.m.value || 1) - (a.m.value || 1) || a.hp - b.hp || String(a.m.id).localeCompare(String(b.m.id)));
    const target = farm.find(x => {
      const now = liveTarget(x.m.id);
      return now && now.health > 0 && reachable(state.self.position, now.position, state.self.attack.range + (state.self.radius || 0) + (now.radius || 0));
    });
    // Values are expressed in the same utility units by the adapter; missing data uses legacy estimates.
    const hpFraction = me.maxHealth > 0 ? Math.max(0, Math.min(1, me.health / me.maxHealth)) : 1;
    const cost = Math.max(0, (seen.tradeRisk || 0) + (seen.minionRetaliation || 0) + (seen.positionalRisk || 0) + (player?.threatReady ? (player.threatDamage || 0) : 0));
    const value = Math.min(seen.tradeValue || 0, Number.isFinite(player?.health) ? Math.max(0, player.health) : Infinity);
    const riskAdjusted = cost * cfg.tradeMargin / Math.max(.25, hpFraction);
    const trade = visiblePlayer && currentPlayer && (player.windingUp || player.exposed) && value > riskAdjusted;
    const spell = (me.abilities || []).find(a => a.ready && a.damage > 0 && a.lineClear && (a.manaCost || 0) <= (me.mana ?? Infinity) && reachable(me.position, player?.position || me.position, a.range) && (state.self.abilities || []).some(b => b.id === a.id && b.ready && b.lineClear && (b.manaCost || 0) <= (state.self.mana ?? Infinity) && currentPlayer && reachable(state.self.position, state.player.position, b.range)));
    // A good trade can outweigh a low-value CS, but not a high-value minion by default.
    if (trade && spell && (!target || (value - riskAdjusted) > (target.m.value || 1))) {
      return { type: 'cast', abilityId: spell.id, targetId: player.id, aim: point(player.position), reason: player.windingUp ? 'punish visible windup' : 'punish exposed position' };
    }
    if (target && canAttack) return { type: 'attack', targetId: target.m.id, reason: 'last hit' };
    const approach = farm.find(x => x.distance > x.reach && Number.isFinite(x.walk) && x.walk <= 2 && liveTarget(x.m.id));
    if (approach && !target && cost < (seen.farmRiskLimit ?? Infinity)) {
      const dx = approach.m.position.x - me.position.x, dy = approach.m.position.y - me.position.y;
      const step = Math.max  (0, approach.distance - approach.reach * .9);
      return move({x: me.position.x + dx / approach.distance * step, y: me.position.y + dy / approach.distance * step}, 'approach last hit');
    }
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
