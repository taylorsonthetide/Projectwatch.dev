import json,gzip,base64,math,re,unicodedata,collections
from pathlib import Path
r=Path(__file__).resolve().parents[3];root=r/'data/navigation'
hist=[]
for cell in json.loads((root/'historical-2011/index.json').read_text())['cells']:
 payload=json.loads((root/'historical-2011'/(cell['id']+'.json')).read_text())
 rows=json.loads(gzip.decompress(base64.b64decode(payload['gzip'])))
 for index,row in enumerate(rows):
  if row[0]==4 and row[2]=='Point' and row[1].startswith(('BOY','BCN')):
   hist.append([cell['id'],row[1],row[3],row[4],cell['id']+':'+str(index)])
p=json.load(open(root/'master-chart/20261008-reviewed-v2/online-seamarks.json'));online=json.loads(gzip.decompress(base64.b64decode(p['gzip'])))['features']
review=json.load(open(root/'master-chart/uncertain-mark-review-20261008.json'));review=json.loads(gzip.decompress(base64.b64decode(review['gzip'])))
supp=set(json.load(open(root/'master-chart/20261008-reviewed-v2/depiction-register.json'))['suppressed_ids'])
links=collections.defaultdict(set)
for case in review['cases']:
 for pair in case['pairs']:
  if pair['historical_id'] in supp:links[pair['online_id']].add(pair['historical_id'])
reviewlookup={(f['properties'].get('class'),tuple(f['geometry']['coordinates']),f['properties'].get('OBJNAM')):key for key,f in review['historical'].items()}
def name(s):
 s=unicodedata.normalize('NFKD',s or '').encode('ascii','ignore').decode().lower()
 s=re.sub(r'\b(buoy|beacon|light|mark)\b','',s);s=re.sub('[^a-z0-9]','',s)
 return {'hawespointwest':'hawspoint','hawespointeast':'hawspointeast'}.get(s,s)
def distance(a,b):return 111195*math.hypot((a[0]-b[0])*math.cos(math.radians(a[1])),a[1]-b[1])
buckets=collections.defaultdict(list)
for h in hist:buckets[(math.floor(h[2][0]*1000),math.floor(h[2][1]*1000))].append(h)
kind={'LAT':'lateral','CAR':'cardinal','SAW':'safe_water','ISD':'isolated_danger','SPP':'special_purpose'}
result={};rejected=collections.Counter()
for f in online:
 p=f['properties'];t=p.get('seamark:type','');light=t in ('light_minor','light_major') and p.get('man_made')!='lighthouse'
 if not light and not t.startswith(('buoy_','beacon_')):continue
 if not light and p.get('seamark:'+t+':category') and p.get('seamark:'+t+':shape'):continue
 coords=f['geometry']['coordinates'];bx,by=math.floor(coords[0]*1000),math.floor(coords[1]*1000);candidates=[]
 for dx in (-1,0,1):
  for dy in (-1,0,1):
   for h in buckets[(bx+dx,by+dy)]:
    dist=distance(coords,h[2]);old=h[3];rid=h[4]
    if dist>50:continue
    matched=name(p.get('seamark:name') or p.get('name')) and name(p.get('seamark:name') or p.get('name'))==name(old.get('OBJNAM'))
    linked=rid in links[f['id']]
    if not matched and not linked:continue
    ot=('buoy_' if h[1].startswith('BOY') else 'beacon_')+kind.get(h[1][3:],'unknown')
    if not light and ot!=t:continue
    cat=({1:'port',2:'starboard'}.get(old.get('CATLAM')) if ot.endswith('lateral') else {1:'north',2:'east',3:'south',4:'west'}.get(old.get('CATCAM')) if ot.endswith('cardinal') else None)
    if ot.endswith(('lateral','cardinal')) and not cat:continue
    newcat=p.get('seamark:'+t+':category')
    if newcat and cat and newcat!=cat:rejected['category_conflict']+=1;continue
    lightcolour=p.get('seamark:light:colour')
    if light and cat in ('port','starboard') and lightcolour in ('red','green') and lightcolour!=({'port':'red','starboard':'green'}[cat]):rejected['light_colour_conflict']+=1;continue
    candidates.append((ot,cat,h,dist,rid,'name and proximity' if matched else 'reviewed suppressed counterpart'))
 if not candidates:continue
 signatures={(c[0],c[1]) for c in candidates}
 if len(signatures)>1:
  # Unclassified special-purpose representations at broader scales must not override a specifically classified lateral/cardinal record of the same named beacon.
  specific=[c for c in candidates if c[1] is not None]
  if specific and len({(c[0],c[1]) for c in specific})==1 and all(c[0].endswith('special_purpose') or c in specific for c in candidates):candidates=specific
  else:rejected['ambiguous_counterparts']+=1;continue
 ot,cat,h,dist,rid,basis=min(candidates,key=lambda c:c[3]);props={}
 if light:props['seamark:type']=ot
 if cat and not p.get('seamark:'+ot+':category'):props['seamark:'+ot+':category']=cat
 shape={1:'conical',2:'can',3:'spherical',4:'pillar',5:'spar'}.get(h[3].get('BOYSHP'))
 if shape and not p.get('seamark:'+ot+':shape'):props['seamark:'+ot+':shape']=shape
 if not props:continue
 result[f['id']]={'properties':props,'historical_cell':h[0],'historical_record':rid,'historical_class':h[1],'historical_name':h[3].get('OBJNAM'),'historical_position':h[2],'distance_m':round(dist,2),'basis':basis,'source_year':2011,'verification':'Inherited historical appearance; current classification requires verification'}
out=r/'js/navigation/snapshot-mark-enrichment.js';out.write_text('/* Appearance only: newer coordinates and existing source attributes are never replaced. */\nwindow.HelmloreMarkEnrichment='+json.dumps(result,separators=(',',':'))+';\n')
print(json.dumps({'enriched_records':len(result),'light_records':sum('seamark:type' in v['properties'] for v in result.values()),'rejected':rejected,'hawes':[v for k,v in result.items() if k in ['osm-node-1556403619','osm-node-5613181886']]}))
