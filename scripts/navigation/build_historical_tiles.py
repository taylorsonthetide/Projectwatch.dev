"""Build clipped, independently loadable XYZ tiles from historical chart records."""
import json,gzip,base64,math,collections,hashlib,argparse
from pathlib import Path
import mercantile
from shapely.geometry import shape,box,mapping
from shapely import make_valid
parser=argparse.ArgumentParser();parser.add_argument('--input',default='data/navigation/historical-2011');parser.add_argument('--output',default='data/navigation/historical-tiles-2011-v1');args=parser.parse_args()
ROOT=Path(args.input);OUT=Path(args.output);OUT.mkdir(exist_ok=True)
TMP=OUT/'tmp';TMP.mkdir(exist_ok=True)
for p in TMP.glob('*.jsonl'):p.unlink()
ZOOMS={'A':3,'B':5,'C':7,'D':9,'E':11,'F':12,'G':13};STUDY=box(-12,49,3,61)
index=json.loads((ROOT/'index.json').read_text());handles=collections.OrderedDict();counts=collections.Counter();failures=[];features=0;clipped=0

def emit(t,row):
 key=f'{t.z}_{t.x}_{t.y}'
 if key not in handles:
  if len(handles)>=128:_,h=handles.popitem(last=False);h.close()
  handles[key]=(TMP/(key+'.jsonl')).open('a',buffering=1)
 else:handles.move_to_end(key)
 handles[key].write(json.dumps(row,separators=(',',':'))+'\n');counts[key]+=1
for ci,c in enumerate(index['cells']):
 if c['scale'] not in ZOOMS:continue
 z=ZOOMS[c['scale']]
 records=json.loads(gzip.decompress(base64.b64decode(json.loads((ROOT/(c['id']+'.json')).read_text())['gzip'])))
 for ri,row in enumerate(records):
  layer,cls,typ,coords,attrs=row;features+=1
  props={**attrs,'cell':c['cell'],'scale':c['scale'],'source_year':2011,'record_id':c['id']+':'+str(ri)}
  if typ=='Point':
   lon,lat=coords
   if -12<=lon<=3 and 49<=lat<=61:emit(mercantile.tile(lon,lat,z),[layer,cls,typ,coords,props])
   continue
  try:
   geom=shape({'type':typ,'coordinates':coords})
   if not geom.is_valid:geom=make_valid(geom)
   geom=geom.intersection(STUDY)
   if geom.is_empty:continue
   west,south,east,north=geom.bounds
   for t in mercantile.tiles(west,south,east,north,z):
    b=mercantile.bounds(t);g=geom.intersection(box(b.west,b.south,b.east,b.north))
    if g.is_empty:continue
    parts=list(g.geoms) if g.geom_type=='GeometryCollection' else [g]
    for part in parts:
     if part.geom_type not in ['LineString','MultiLineString','Polygon','MultiPolygon']:continue
     # Simplification stays below one display pixel at this native tile level.
     tolerance=360/(2**z*256)*.25
     part=part.simplify(tolerance,preserve_topology=True)
     data=mapping(part);emit(t,[layer,cls,data['type'],data['coordinates'],props]);clipped+=1
  except Exception as e:failures.append({'cell':c['cell'],'record':ri,'error':str(e)})
 if ci%50==0:print(f'Cells {ci+1}/{len(index["cells"])}; tiles {len(counts)}',flush=True)
for h in handles.values():
 h.flush();h.close()
(OUT/'build-checkpoint.json').write_text(json.dumps({'counts':dict(counts),'failures':failures,'features':features,'clipped':clipped}))
entries=[]
for key,n in counts.items():
 z,x,y=map(int,key.split('_'));t=mercantile.Tile(x,y,z);b=mercantile.bounds(t)
 records=[json.loads(line) for line in (TMP/(key+'.jsonl')).open()];assert len(records)==n,(key,len(records),n)
 raw=json.dumps(records,separators=(',',':')).encode();packed=json.dumps({'gzip':base64.b64encode(gzip.compress(raw,6,mtime=0)).decode()},separators=(',',':'))
 p=OUT/str(z)/str(x)/(str(y)+'.json');p.parent.mkdir(parents=True,exist_ok=True);p.write_text(packed)
 scale=next(s for s,v in ZOOMS.items() if v==z)
 entries.append({'id':f'{z}/{x}/{y}','cell':f'XYZ {z}/{x}/{y}','scale':scale,'bbox':[b.west,b.south,b.east,b.north],'records':n,'layer_mask':sum(1<<layer for layer in set(r[0] for r in records)),'bytes':len(packed),'expanded_bytes':len(raw)})
manifest={'year':2011,'layers':index['layers'],'cells':entries,'tile_zooms':ZOOMS,'bounds':[-12,49,3,61],'note':'Clipped XYZ vector display tiles. Historical source; quarter-pixel simplification per native level. Broader tiles can fill missing fine tile coverage.'}
(OUT/'index.json').write_text(json.dumps(manifest,separators=(',',':')))
report={'input_records':features,'tile_records':sum(counts.values()),'tiles':len(entries),'packed_bytes':sum(c['bytes'] for c in entries),'failed_records':failures}
(OUT/'report.json').write_text(json.dumps(report,indent=2));print(report|{'failed_records':len(failures)},flush=True)
