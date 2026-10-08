"""Cross-reference user-confirmed positions without pruning marks by proximity alone."""
import json,sqlite3,gzip,base64,math,hashlib,collections
from pathlib import Path
root=Path(__file__).resolve().parents[3];nav=root/'data/navigation'
def unpack(path):
 d=json.loads(path.read_text());return json.loads(gzip.decompress(base64.b64decode(d['gzip']))) if 'gzip' in d else d
def dist(a,b):return 111195*math.hypot((a[0]-b[0])*math.cos(math.radians(a[1])),a[1]-b[1])
def category(p):
 t=p.get('seamark:type','');c=p.get('seamark:'+t+':category')
 if t.endswith('lateral'):return c or 'unknown_lateral'
 if p.get('class','').endswith('LAT'):return {1:'port',2:'starboard'}.get(p.get('CATLAM'),'unknown_lateral')
 if p.get('mark_type') in ('port','starboard'):return p['mark_type']
 if t=='wind_turbine' or p.get('seamark:landmark:category')=='windmotor':return 'wind_turbine'
 return t or p.get('class') or p.get('mark_type') or 'unknown'
def build(database):
 db=sqlite3.connect(database);db.row_factory=sqlite3.Row
 rows=db.execute("select m.*,s.filename,s.sha256 from marks m join imports i on m.import_id=i.id join sources s on i.source_id=s.id where review_status='pending_review' order by m.import_id,source_index").fetchall()
 existing=[];hidden=set(json.loads((nav/'master-chart/20261008-reviewed-v2/depiction-register.json').read_text())['suppressed_ids'])
 for f in unpack(nav/'master-chart/20261008-reviewed-v2/online-seamarks.json')['features']:
  if f['geometry']['type']=='Point':existing.append((f['id'],'online',f['geometry']['coordinates'],category(f['properties']),True))
 for f in json.loads((nav/'user-local-marks-20261007.geojson').read_text())['features']:existing.append((f['id'],'local',f['geometry']['coordinates'],category(f['properties']),True))
 hist={};files=list((nav/'historical-2011').glob('*.json'))
 for path in files:
  for i,row in enumerate(unpack(path)):
   if row[0]!=4 or row[2]!='Point':continue
   rid=path.stem+':'+str(i);hist[rid]=(rid,'historical',row[3],category({'class':row[1],**row[4]}),rid not in hidden)
 review=unpack(nav/'master-chart/uncertain-mark-review-20261008.json')
 for rid,f in review['historical'].items():hist.setdefault(rid,(rid,'historical',f['geometry']['coordinates'],category(f['properties']),rid not in hidden))
 existing.extend(hist.values());buckets=collections.defaultdict(list)
 for e in existing:buckets[(math.floor(e[2][0]*500),math.floor(e[2][1]*500))].append(e)
 features=[];checks=[];seen=set();stats=collections.Counter();suppress={'online':[],'historical':[],'local':[]}
 for row in rows:
  xy=[row['longitude'],row['latitude']];wanted='port' if row['mark_type']=='port_lateral' else 'wind_farm_light';uid='confirmed-'+hashlib.sha256(row['id'].encode()).hexdigest()[:20]
  if tuple(xy) in seen:stats['repeated_import_positions']+=1;continue
  seen.add(tuple(xy));near=[]
  kx,ky=math.floor(xy[0]*500),math.floor(xy[1]*500)
  for dx in (-1,0,1):
   for dy in (-1,0,1):
    for e in buckets[(kx+dx,ky+dy)]:
     d=dist(xy,e[2])
     if d>50:continue
     exact=xy==list(e[2]);compatible=(wanted=='port' and e[3]=='port') or (wanted=='wind_farm_light' and e[3] in ('wind_turbine','light_minor','light_major'))
     near.append({'id':e[0],'source':e[1],'distance_m':round(d,3),'category':e[3],'active':e[4],'exact':exact,'compatible':compatible})
     if exact and compatible and e[4]:suppress[e[1]].append(e[0])
  stats['positions_with_nearby_active_records']+=any(e['active'] for e in near)
  stats['positions_with_exact_active_repeats']+=any(e['exact'] and e['active'] for e in near)
  stats['port_positions_near_starboard']+=wanted=='port' and any(e['category']=='starboard' and e['active'] for e in near)
  p=json.loads(row['derived_properties_json']);name=row['display_name'];p.update({'name':name,'mark_type':'port' if wanted=='port' else 'wind_farm_light','structure':row['structure'] or 'Not specified in export','colour':row['light_colour'] if wanted=='wind_farm_light' else None,'light':'Fl Y 5s 5M' if wanted=='wind_farm_light' else None,'wind_farm':row['wind_farm'],'source_file':row['filename'],'source_sha256':row['sha256'],'source':'User-supplied TimeZero GPX export; classification confirmed by Clifton Taylor','position_status':p.get('position_status','Coordinates confirmed by Clifton Taylor on 8 October 2026; not independently surveyed'),'raw_position':f"{xy[1]:.9f}, {xy[0]:.9f}",'confirmed_on':'2026-10-08','cross_reference_id':uid,'nearby_record_count':sum(e['active'] for e in near)})
  if wanted=='port':p['colour']='red';p['colour_basis']='Port lateral classification; physical colour not exported separately';p['description_status']='Port lateral type and latest TimeZero chart update provenance confirmed by Clifton Taylor; light rhythm and physical structure not supplied'
  features.append({'type':'Feature','id':uid,'geometry':{'type':'Point','coordinates':xy},'properties':p});checks.append({'id':uid,'matches_within_50m':sorted(near,key=lambda e:e['distance_m'])})
 out={'type':'FeatureCollection','release':'20261008-confirmed-positions-v1','confirmed_date':'2026-10-08','verification':'User-confirmed positions and classifications; not independently surveyed or an official chart','features':features,'suppress_exact_compatible_ids':{k:sorted(set(v)) for k,v in suppress.items()}}
 report={'schema':'helmlore-confirmed-position-cross-reference-v1','release':out['release'],'radius_m':50,'exact_match_rule':'Identical coordinates; hide only compatible depictions, retain all source records','scope':{'online_points':20177,'local_points':41,'historical_cells_loaded':len(files),'historical_cells_unavailable':9,'historical_mark_records':len(hist),'note':'Nine large original cells exceeded connector read limits. Review records supplement the loaded historical cells. No proximity-only pruning.'},'counts':dict(stats),'published_candidates':len(features),'checks':checks}
 (nav/'user-confirmed-marks-20261008.geojson').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n');(nav/'confirmed-marks-cross-reference-20261008.json').write_text(json.dumps(report,ensure_ascii=False,separators=(',',':'))+'\n')
 print(json.dumps({'features':len(features),'counts':dict(stats),'historical_records':len(hist),'historical_cells':len(files),'exact_suppressed':out['suppress_exact_compatible_ids']}))
if __name__=='__main__':import sys;build(sys.argv[1])
