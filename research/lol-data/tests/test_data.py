import hashlib, importlib.util, json, pathlib, unittest
R=pathlib.Path(__file__).resolve().parents[1]
def load(p): return json.loads((R/p).read_text())
class DataTests(unittest.TestCase):
 def test_all_json_and_measurements(self):
  required={'value','unit','source_url','json_path','patch','conditions','confidence','status'}
  for p in R.rglob('*.json'):
   obj=json.loads(p.read_text())
   if p.parts[-2] in ('historical','source','schemas'): continue
   def visit(x):
    if isinstance(x,dict):
     if 'source_url' in x and 'value' in x:
      self.assertEqual(set(x),required,str(p)); self.assertTrue(x['source_url'].startswith('https://')); self.assertTrue(x['unit']); self.assertTrue(x['conditions']); self.assertIn(x['status'],['direct','unknown']); self.assertIn(x['confidence'],['direct_source','source_reported','conflicting']); self.assertEqual(x['value'] is None,x['status']=='unknown')
     else:
      for v in x.values(): visit(v)
    elif isinstance(x,list):
     for v in x: visit(v)
   visit(obj)
 def test_roster_matches_original(self):
  src=load('source/riot-champion-16.21.1.json'); roster=load('champions/riot-roster.json')
  self.assertEqual(src['version'],'16.21.1'); self.assertEqual(set(src['data']),set(roster['champions']))
  self.assertEqual(roster['source_sha256'],hashlib.sha256((R/'source/riot-champion-16.21.1.json').read_bytes()).hexdigest())
  for name in src['data']:
   for key,value in src['data'][name]['stats'].items(): self.assertEqual(value,roster['champions'][name]['stats'][key]['value'])
 def test_known_patch_changes_and_conversions(self):
  waves=load('minions/waves.json'); self.assertEqual(waves['first_spawn']['value'],30)
  self.assertEqual([x['interval_seconds'] for x in waves['intervals']['value']],[30,25,20])
  f=load('champions/featured.json'); self.assertEqual(f['Tristana']['q_bonus_attack_speed']['value'],[40,60,80,100,120]); self.assertEqual(f['Ahri']['q_width']['value']/2,100)
  self.assertAlmostEqual(0.2/0.668,0.2994011976)
  s=load('skillshots/abilities.json'); self.assertEqual(s['Velkoz.Q']['widths']['value'][1]/2,45)
 def test_historical_is_labeled(self):
  for p in (R/'champions/historical').glob('*.json'):
   data=json.loads(p.read_text()); self.assertIsNone(data['patch']); self.assertEqual(data['confidence'],'historical_unverified'); self.assertTrue(data['json_paths'])
if __name__=='__main__': unittest.main()
