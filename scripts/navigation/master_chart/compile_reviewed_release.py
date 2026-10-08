"""Compile exact source-record depiction decisions, retaining original observations.
No distance inference, source movement, or online mark removal occurs here.
"""
import argparse,base64,gzip,json,hashlib,sqlite3,shutil,datetime
from pathlib import Path

def digest(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,d):p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,separators=(',',':'))+'\n')
def compile_release(root,database,review,output,release):
 root,output=Path(root),Path(output);output.mkdir(parents=True,exist_ok=True)
 final=json.loads(Path(review).read_text());prior=json.loads((root/'data/navigation/master-chart/mark-suppression-20261008.json').read_text())
 assert final['schema']=='helmlore-mark-corrections-v1'
 corrections={r['source_external_id']:r for r in final['corrections']};assert len(corrections)==len(final['corrections'])
 kept={p.split('|')[0] for p,v in final['pair_decisions'].items() if v['decision']=='keep-separate'}
 confirmed={p.split('|')[0] for p,v in final['pair_decisions'].items() if v['decision']=='confirm-hide'}
 assert not kept&confirmed and confirmed<=corrections.keys() and not kept&corrections.keys()
 hidden=(set(prior['suppressed_ids'])|corrections.keys())-kept
 db=sqlite3.connect(database);db.row_factory=sqlite3.Row
 before=db.execute('SELECT count(*) FROM observations').fetchone()[0]
 observations={}
 for id in hidden|kept:
  rows=db.execute("SELECT o.* FROM observations o JOIN entities e ON e.id=o.entity_id AND e.current_observation=o.id WHERE o.source='cm93-2011' AND o.external_id=?",(id,)).fetchall()
  if len(rows)!=1:raise ValueError('Missing/ambiguous original observation '+id)
  r=rows[0];g=json.loads(r['geometry'])
  if r['layer']!='marks' or g['type']!='Point':raise ValueError('Not a chart mark '+id)
  if id in corrections:
   c=corrections[id]
   if c['source']!='cm93-2011' or c['action']!='retire' or not c.get('evidence') or c['coordinates']!=g['coordinates'] or c['mark_type']!=r['class']:raise ValueError('Source differs from user review '+id)
  observations[id]=r
 # A depiction register rather than deletion or a claim that a physical object ceased to exist.
 db.executescript('''CREATE TABLE IF NOT EXISTS chart_mark_decisions(source_external_id TEXT PRIMARY KEY, action TEXT,evidence TEXT,decided_at TEXT,review_sha256 TEXT);
 CREATE TABLE IF NOT EXISTS chart_pair_decisions(pair_id TEXT PRIMARY KEY,historical_id TEXT,online_id TEXT,decision TEXT,evidence TEXT,decided_at TEXT,review_sha256 TEXT);''')
 review_sha=digest(review);now=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with db:
  for id in hidden|kept:
   c=corrections.get(id);evidence=c['evidence'] if c else 'Explicit final keep-separate review' if id in kept else 'Published conservative reconciliation; original source preserved'
   db.execute('INSERT OR REPLACE INTO chart_mark_decisions VALUES(?,?,?,?,?)',(id,'retain' if id in kept else 'hide',evidence,c.get('decided_at',now) if c else now,review_sha))
  for pair,v in final['pair_decisions'].items():
   old,new=pair.split('|');db.execute('INSERT OR REPLACE INTO chart_pair_decisions VALUES(?,?,?,?,?,?,?)',(pair,old,new,v['decision'],v['evidence'],v['decided_at'],review_sha))
  db.execute('INSERT OR REPLACE INTO releases VALUES(?,?,?,?)',(release,now,'user-reviewed-release',json.dumps({'hidden_source_records':len(hidden),'restored_records':len(kept),'review_sha256':review_sha})))
 assert db.execute('SELECT count(*) FROM observations').fetchone()[0]==before
 source=root/'data/navigation/historical-tiles-2011-v1';tiles=output/'historical-tiles';tiles.mkdir(exist_ok=True)
 index=json.loads((source/'index.json').read_text());patched={};seen_hidden=set();seen_kept=set();removed_rows=0;changed=[];original_rows=0;retained_rows=0
 for entry in index['cells']:
  key=entry['id'];src=source/(key+'.json');dst=tiles/(key+'.json');dst.parent.mkdir(parents=True,exist_ok=True)
  payload=json.loads(src.read_text());rows=json.loads(gzip.decompress(base64.b64decode(payload['gzip'])));assert len(rows)==entry['records']
  original_rows+=len(rows);clean=[]
  for r in rows:
   id=r[4].get('record_id')
   if r[0]==4 and id in hidden:seen_hidden.add(id);removed_rows+=1;continue
   if r[0]==4 and id in kept:seen_kept.add(id)
   clean.append(r)
  retained_rows+=len(clean)
  if len(clean)!=len(rows):
   raw=json.dumps(clean,separators=(',',':')).encode();payload={'gzip':base64.b64encode(gzip.compress(raw,6,mtime=0)).decode()};write(dst,payload)
   entry.update(records=len(clean),layer_mask=sum(1<<n for n in {r[0] for r in clean}),bytes=dst.stat().st_size,expanded_bytes=len(raw));patched[key]={'entry':entry.copy()};changed.append((key,payload))
  else:shutil.copyfile(src,dst)
 index.update(release=release,note='Original 2011 land, contours and soundings; reviewed mark depictions compiled 8 October 2026. Source observations retained.')
 write(tiles/'index.json',index)
 # Only revised tiles need publication. Small versioned bundles preserve original tile IDs.
 patches=output/'patches';patches.mkdir(exist_ok=True);bundle={};size=0;num=0
 def flush():
  nonlocal bundle,size,num
  if not bundle:return
  name=f'bundle-{num:03d}.json';write(patches/name,{'schema':'helmlore-tile-bundle-v1','tiles':bundle})
  for key in bundle:patched[key]['bundle']=name
  bundle={};size=0;num+=1
 for key,payload in changed:
  n=len(json.dumps(payload))
  if size+n>256000:flush()
  bundle[key]=payload;size+=n
 flush()
 summary={'release':release,'review_exported_at':final['exported_at'],'review_sha256':review_sha,'manual_hidden_records':len(corrections),'reconciled_hidden_records':len(prior['suppressed_ids']),'combined_hidden_records':len(hidden),'restored_records':len(kept),'confirmed_recheck_hidden_records':len(confirmed),'compiled_tiles':len(index['cells']),'changed_tiles':len(changed),'tile_bundles':num,'original_tile_rows':original_rows,'retained_tile_rows':retained_rows,'removed_mark_tile_rows':removed_rows,'hidden_ids_in_tiles':len(seen_hidden),'hidden_ids_outside_tile_pack':sorted(hidden-seen_hidden),'restored_ids_missing_from_tiles':sorted(kept-seen_kept),'original_observations_preserved':before,'online_records_removed':0,'non_mark_rows_changed':0,'historical_source_date':'2011-10','online_snapshot_date':'2026-10-07','note':'Custom research chart, not an official ENC or verified current depths. Chart-scale versions counted separately.'}
 assert not kept-seen_kept
 write(patches/'manifest.json',{'schema':'helmlore-reviewed-tiles-v1','release':release,'patches':patched,'summary':summary})
 write(output/'release-summary.json',summary)
 write(output/'depiction-register.json',{'schema':'helmlore-mark-suppression-v1','release':release,'suppressed_ids':sorted(hidden),'retained_ids':sorted(kept),'review_sha256':review_sha})
 shutil.copyfile(review,output/'final-user-review.json')
 db.close();print(json.dumps(summary),flush=True);return summary
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--root',required=True);p.add_argument('--database',required=True);p.add_argument('--review',required=True);p.add_argument('--output',required=True);p.add_argument('--release',default='20261008-reviewed-v2');a=p.parse_args();compile_release(a.root,a.database,a.review,a.output,a.release)
