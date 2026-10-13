"""Build public-domain Natural Earth detail data; source files remain external.
Input: NE 10m land GeoJSON, NE 10m geography-regions GeoJSON, repository port data.
Usage: python native/tools/build-coastal-map.py /tmp/ne-land.geojson /tmp/ne-regions.geojson /tmp/ne-elevation.geojson
"""
import json,gzip,sys,math
from pathlib import Path
root=Path(__file__).resolve().parents[1]
B=(-30,38,20,72)
def clip(ring):
 p=ring[:-1] if ring[0]==ring[-1] else ring[:]
 for axis,value,keep in [(0,B[0],1),(0,B[2],-1),(1,B[1],1),(1,B[3],-1)]:
  out=[]
  for i,a in enumerate(p):
   b=p[(i+1)%len(p)];inside=(a[axis]-value)*keep>=0;next_inside=(b[axis]-value)*keep>=0
   if inside:out.append(a)
   if inside!=next_inside:
    t=(value-a[axis])/(b[axis]-a[axis]);out.append([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])])
  p=out
  if len(p)<3:return []
 return p+[p[0]]
def simplify(p,tol=.0006):
 # Douglas-Peucker, small angular tolerance for a lightweight orientation map.
 if len(p)<5:return p
 def recurse(a,b):
  x,y=p[a];dx=p[b][0]-x;dy=p[b][1]-y;den=dx*dx+dy*dy;best=-1;index=None
  for i in range(a+1,b):
   q=p[i];t=max(0,min(1,((q[0]-x)*dx+(q[1]-y)*dy)/den)) if den else 0;d=(q[0]-x-t*dx)**2+(q[1]-y-t*dy)**2
   if d>best:best=d;index=i
  if best>tol*tol:return recurse(a,index)[:-1]+recurse(index,b)
  return [p[a],p[b]]
 mid=len(p)//2;q=recurse(0,mid)[:-1]+recurse(mid,len(p)-1);return [[round(x,5),round(y,5)] for x,y in q]
def polygons(geometry):
 if geometry['type']=='Polygon':return [geometry['coordinates']]
 if geometry['type']=='MultiPolygon':return geometry['coordinates']
 return []
def process(geometry):
 out=[]
 for rings in polygons(geometry):
  points=rings[0];xs=[p[0] for p in points];ys=[p[1] for p in points]
  if max(xs)<B[0] or min(xs)>B[2] or max(ys)<B[1] or min(ys)>B[3]:continue
  new=[simplify(clip(r)) for r in rings if len(r)>3];new=[r for r in new if len(r)>3]
  if not new:continue
  xs=[p[0] for p in new[0]];ys=[p[1] for p in new[0]];out.append({'b':[min(xs),min(ys),max(xs),max(ys)],'r':new})
 return out
land=[]
for f in json.load(open(sys.argv[1]))['features']:land.extend(process(f['geometry']))
content={'source':'Natural Earth 1:10m land v5.1.2, public domain; clipped NW Europe, simplified 0.0006 degrees for weather orientation','sourceUrl':'https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_land.geojson','coverage':B,'polygons':land}
raw=json.dumps(content,separators=(',',':')).encode();(root/'coast.json.gz').write_bytes(gzip.compress(raw,mtime=0))
terrain=[]
if len(sys.argv)>2:
 for f in json.load(open(sys.argv[2]))['features']:
  a={k.lower():v for k,v in f['properties'].items()};name=str(a.get('name',''));kind=str(a.get('featurecla','')).lower()
  if any(k in kind for k in ['range','plateau','highland']) or any(k in name.lower() for k in ['highlands','pennines','cumbrian','grampian','cambrian','mourne','wicklow']):
   for g in process(f['geometry']):terrain.append({**g,'name':name})
peaks=[]
if len(sys.argv)>3:
 for f in json.load(open(sys.argv[3]))['features']:
  lon,lat=f['geometry']['coordinates'];a=f['properties']
  if B[0]<=lon<=B[2] and B[1]<=lat<=B[3] and a.get('featurecla')=='mountain':peaks.append({'name':a.get('name'),'lon':lon,'lat':lat,'elevation':a.get('elevation',0)})
(root/'terrain.json').write_text(json.dumps({'peaks':peaks,'source':'Natural Earth 1:10m geography regions, public domain; geographic upland shading, not elevation contours','polygons':terrain},separators=(',',':')))
print('Detailed coast polygons',len(land),'compressed bytes',(root/'coast.json.gz').stat().st_size,'terrain polygons',len(terrain))
