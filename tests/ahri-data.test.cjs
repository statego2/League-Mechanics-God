const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
test('checked-in Ahri data matches its provenance-bearing snapshot',()=>{
 const run=spawnSync(process.execPath,[path.join(root,'scripts/build-ahri-data.cjs'),'--check'],{encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);
});
test('data generator rejects null, mismatched patch and incorrect units',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'lmg-ahri-'));
 try{
  fs.mkdirSync(path.join(temp,'scripts'));fs.mkdirSync(path.join(temp,'data'));
  fs.copyFileSync(path.join(root,'scripts/build-ahri-data.cjs'),path.join(temp,'scripts/build-ahri-data.cjs'));
  const original=JSON.parse(fs.readFileSync(path.join(root,'data/ahri-snapshot.json'),'utf8'));
  for(const mutation of [s=>s.roster.movespeed.value=null,s=>s.featured.q_range.patch='15.15.1',s=>s.featured.q_width.unit='pixels']){
   const snapshot=structuredClone(original);mutation(snapshot);fs.writeFileSync(path.join(temp,'data/ahri-snapshot.json'),JSON.stringify(snapshot));
   const run=spawnSync(process.execPath,[path.join(temp,'scripts/build-ahri-data.cjs')],{encoding:'utf8'});
   assert.notEqual(run.status,0);assert.match(run.stderr,/Invalid/);assert.equal(fs.existsSync(path.join(temp,'ahri-data.js')),false);
  }
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
