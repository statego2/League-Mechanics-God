import { createLaningOpponent } from './brain.mjs';
const brain = createLaningOpponent();
const state = { time:0, self:{alive:true, position:{x:0,y:0}, radius:10, attack:{ready:true,range:150,windup:.25,projectileSpeed:600,damage:50}, abilities:[{id:'Q',ready:true,range:250,damage:70,lineClear:true}]}, player:{id:'human',visible:true,alive:true,position:{x:120,y:0},windingUp:false}, minions:[{id:'minion',team:'player',visible:true,alive:true,position:{x:70,y:0},health:40,value:1}], skillshots:[],tradeValue:30,tradeRisk:10 };
console.log('initial:', brain.decide(state));
state.time = .2; console.log('farm:', brain.decide(state));
state.time = .4; state.player.windingUp = true; console.log('commitment starts:', brain.decide(state));
state.time = .6; console.log('reaction:', brain.decide(state));
