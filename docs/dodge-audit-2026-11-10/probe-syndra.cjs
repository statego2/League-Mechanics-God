// Read-only audit: run against the bundled or patched checkout, not the old active version.
// Usage: node docs/dodge-audit-2026-11-10/probe-syndra.cjs /absolute/checkout
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || '.');
const testPath = path.join(root, 'tests/game.test.cjs');
const source = fs.readFileSync(testPath, 'utf8');
const marker = "test('visible build";
if (!source.includes(marker)) throw new Error('Test harness changed; review extraction before running.');
const harness = source.slice(0, source.indexOf(marker));
new Function('require', harness + '\n' + "let outside=[],drift=[],others=[];\nfor(let seed=1;seed<=20;seed++){\n const {g,node}=boot('ahri');node('difficulty').listeners.change({target:{value:'hard'}});g.reset('dodge');g.setRng(seed*7919);g.player.hp=g.player.maxHp=1e7;\n const seen=new Set();\n for(let i=0;i<60*120;i++){\n if(i%120===0)g.moveTo(200+(i/120%5)*190,220+(i/120%3)*110);\n g.update(1/120);\n for(const h of g.hazards)if(h.syndra&&h.combo){const c=g.foes.find(e=>e.id===h.casterId&&e.alive);if(!seen.has(h)){seen.add(h);const d=Math.hypot(h.x-h.source.x,h.y-h.source.y);if(d>g.SYNDRA.eDirectRange)outside.push({seed,d});}if(h.phase==='e'&&c){let d=Math.hypot(c.x-h.source.x,c.y-h.source.y);if(d>5&&drift.length<5)drift.push({seed,d,source:h.source,caster:{x:c.x,y:c.y}});}}\n }\n const d=g.dodgeDirector;others.push({seed,attempted:d.attempted,q:d.syndra,e:d.syndraE,combo:d.syndraCombo,naiveOther:d.attempted-d.syndra,actualOther:d.attempted-d.syndra-(d.syndraE||0)});\n}\nconsole.log(JSON.stringify({outOfDirectRange:outside.length,examples:outside.slice(0,5),sourceDrift:drift,counters:others.slice(0,3)},null,2));\n")(createRequire(testPath));
