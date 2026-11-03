// Run after editing game.js so the executing build label and cache key agree.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const gamePath=path.join(root,'game.js'),htmlPath=path.join(root,'index.html');
const game=fs.readFileSync(gamePath,'utf8'),html=fs.readFileSync(htmlPath,'utf8');
const gamePattern=/const BUILD_ID="[^"]+"/g,htmlPattern=/game\.js\?v=[^"']+/g;
if([...game.matchAll(gamePattern)].length!==1||[...html.matchAll(htmlPattern)].length!==1)throw new Error('Expected exactly one build ID and one game.js cache key');
const normalized=game.replace(gamePattern,'const BUILD_ID="<content-hash>"');
const id=crypto.createHash('sha256').update(normalized).digest('hex').slice(0,12);
const updatedGame=game.replace(gamePattern,`const BUILD_ID="${id}"`),updatedHtml=html.replace(htmlPattern,`game.js?v=${id}`);
if(updatedGame!==game)fs.writeFileSync(gamePath,updatedGame);
if(updatedHtml!==html)fs.writeFileSync(htmlPath,updatedHtml);
console.log(`Build: ${id}`);
