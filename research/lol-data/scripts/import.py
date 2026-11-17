#!/usr/bin/env python3
"""Normalize a pinned Riot roster and a separately downloaded Meraki snapshot."""
import argparse, hashlib, json, pathlib, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
VERSION = '16.21.1'
RIOT = f'https://ddragon.leagueoflegends.com/cdn/{VERSION}/data/en_US/champion.json'
MERAKI = 'https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions.json'
NAMES = ['Ahri','Tristana','Blitzcrank','Velkoz','Lux','Ezreal','Morgana','Orianna','Thresh','Syndra','Varus','Xerath']
def read(path):
    with open(path, encoding='utf8') as f: return json.load(f)
def write(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False)+'\n', encoding='utf8')
def download(url, path):
    with urllib.request.urlopen(url, timeout=60) as r: data = r.read()
    json.loads(data)
    path.write_bytes(data)
def main():
    p=argparse.ArgumentParser(); p.add_argument('--riot', type=pathlib.Path, default=ROOT/'source/riot-champion-16.21.1.json'); p.add_argument('--meraki', type=pathlib.Path); p.add_argument('--download-riot', action='store_true'); p.add_argument('--download-meraki', action='store_true'); a=p.parse_args()
    if a.download_riot: download(RIOT,a.riot)
    if a.download_meraki:
        if not a.meraki: p.error('--download-meraki requires --meraki PATH')
        download(MERAKI,a.meraki)
    raw=read(a.riot)
    if raw['version'] != VERSION: raise ValueError('Unexpected Riot version')
    roster={}
    for key,c in sorted(raw['data'].items()):
        if c['version'] != VERSION: raise ValueError(key+' has wrong version')
        roster[key]={'name':c['name'],'id':c['key'],'stats':{k:{'value':v,'unit': {'movespeed':'game_units_per_second','attackrange':'game_units','attackspeed':'attacks_per_second','attackspeedperlevel':'percent_per_level'}.get(k,'riot_stat_units'), 'source_url':RIOT,'json_path':f'$.data.{key}.stats.{k}','patch':VERSION,'conditions':'base champion stat or growth, no items/runes','confidence':'direct_source','status':'direct'} for k,v in c['stats'].items()}}
    write(ROOT/'champions/riot-roster.json',{'version':VERSION,'source_sha256':hashlib.sha256(a.riot.read_bytes()).hexdigest(),'champions':roster})
    if a.meraki:
        data=read(a.meraki)
        for name in NAMES:
            c=data[name]; icon=c.get('icon',''); observed=icon.split('/cdn/')[1].split('/')[0] if '/cdn/' in icon else None
            out={'champion':name,'source_url':MERAKI,'observed_asset_version':observed,'patch':None,'confidence':'historical_unverified','status':'direct','warning':'Asset version is an age clue, not proof of all field versions; do not treat as current. Values are unparsed source strings.','source_sha256':hashlib.sha256(a.meraki.read_bytes()).hexdigest(),'stats':c['stats'],'abilities':c['abilities'],'json_paths':{'stats':f'$.{name}.stats','abilities':f'$.{name}.abilities'}}
            write(ROOT/f'champions/historical/{name.lower()}.json',out)
if __name__=='__main__': main()
