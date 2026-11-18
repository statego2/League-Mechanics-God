const {test}=require('node:test');
const assert=require('node:assert/strict');
const data=require('../data/tristana-16.21.1.json');
test('pinned PC Tristana snapshot identifies the training reference',()=>{
 assert.equal(data.version,'16.21.1');
 const c=data.data.Tristana;assert.equal(c.stats.attackrange,550);assert.equal(c.passive.name,'Draw a Bead');
 assert.deepEqual(c.spells.map(s=>s.name),['Rapid Fire','Rocket Jump','Explosive Charge','Buster Shot']);
 assert.deepEqual(c.spells.map(s=>s.cooldown[0]),[20,22,16,100]);
 assert.equal(c.spells[1].range[0],900);assert.equal(c.spells[2].range[0],550);assert.equal(c.spells[3].range[0],550);
});
