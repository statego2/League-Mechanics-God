import { reachable } from './brain.mjs';
const xy = u => ({x:u.x,y:u.y});
const unit = u => ({id:u.id,position:xy(u),radius:u.hitRadius ?? u.r,alive:!!u.alive});
const finitePoint = p => Number.isFinite(p?.x) && Number.isFinite(p?.y);

// Input is an explicitly visibility-filtered projection, never the engine's raw global state.
// The caller owns estimates and must compute them without private orders or future events.
export function makeObservation(view) {
  const s=view.self, p=view.visiblePlayer?.visible === true ? view.visiblePlayer : null;
  if (!s || !finitePoint(s) || !Number.isFinite(view.time)) throw new Error('invalid visible view');
  const self={...unit(s),moveSpeed:s.speed,health:s.hp,maxHealth:s.maxHp,mana:s.mana,committed:!!s.committed,
    attack:{ready:!!s.attack.ready,range:s.attack.range,windup:s.attack.windup,projectileSpeed:s.attack.projectileSpeed,damage:s.attack.damage},
    abilities:(s.abilities || []).map(a=>({id:a.id,ready:!!a.ready,range:a.range,damage:a.damage,manaCost:a.manaCost,lineClear:a.lineClear===true}))};
  const player=p ? {...unit(p),visible:true,health:p.hp,windingUp:!!p.windingUp,exposed:!!p.exposed,threatReady:!!p.threatReady,threatDamage:p.threatDamage} : null;
  const minions=(view.visibleMinions || []).filter(m=>m.visible === true).map(m=>({...unit(m),visible:true,team:m.team,health:m.hp,value:m.value,
    incoming:(m.visibleIncoming || []).filter(i=>i.visible === true).map(i=>({visible:true,eta:i.eta,damage:i.damage}))}));
  const skillshots=(view.visibleSkillshots || []).filter(q=>q.visible === true).map(q=>({visible:true,position:xy(q),velocity:{x:q.vx,y:q.vy},radius:q.r,remainingRange:q.remainingRange}));
  return {time:view.time,self,player,minions,skillshots,tradeValue:view.tradeValue,tradeRisk:view.tradeRisk,minionRetaliation:view.minionRetaliation,positionalRisk:view.positionalRisk,farmRiskLimit:view.farmRiskLimit};
}

// Fail closed. Validation does not execute or mutate the engine; re-run at command consumption.
export function validateAction(action, view, rules) {
  if (!action || !view?.self || !rules) return {ok:false,reason:'missing context'};
  if (action.type === 'hold') return {ok:true,action};
  const s=view.self;
  if (!s.alive || s.committed || !finitePoint(s.position) || !Number.isFinite(s.radius) || s.radius < 0) return {ok:false,reason:'actor unavailable'};
  if (action.type === 'move') return finitePoint(action.destination) && rules.canMove?.(action.destination) === true ? {ok:true,action} : {ok:false,reason:'invalid movement'};
  const target = [view.player,...(view.minions || [])].find(t=>t && t.id===action.targetId && t.visible && t.alive);
  if (!target || !finitePoint(target.position) || !Number.isFinite(target.radius) || target.radius < 0 || !rules.canTarget || rules.canTarget(target,action) !== true) return {ok:false,reason:'invalid target'};
  if (action.type === 'attack') return s.attack?.ready && Number.isFinite(s.attack.range) && s.attack.range >= 0 && reachable(s,target,s.attack.range) && rules.canAttack?.(target) === true ? {ok:true,action} : {ok:false,reason:'invalid attack'};
  if (action.type === 'cast') {
    const a=(s.abilities || []).find(a=>a.id===action.abilityId);
    return a?.ready && Number.isFinite(a.range) && a.range >= 0 && Number.isFinite(s.mana) && Number.isFinite(a.manaCost) && a.manaCost >= 0 && s.mana>=a.manaCost && finitePoint(action.aim) && reachable(s,target,a.range) && rules.canCast?.(a,target,action.aim) === true ? {ok:true,action} : {ok:false,reason:'invalid cast'};
  }
  return {ok:false,reason:'unknown action'};
}
