"""Import user-selected GPX light positions inside saved wind-farm polygons.
Usage: python3 scripts/navigation/master_chart/import_windfarm_lights.py INPUT.gpx
The input remains local; unrelated personal waypoints are not published.
"""
import json, math, hashlib, sys, xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
NS={'g':'http://www.topografix.com/GPX/1/1'}
def in_ring(x,y,ring):
    inside=False
    for a,b in zip(ring,ring[1:]+ring[:1]):
        if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]: inside=not inside
    return inside

def contains(g,x,y):
    polygons=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    return any(in_ring(x,y,p[0]) and not any(in_ring(x,y,h) for h in p[1:]) for p in polygons)

def build(path):
    data=path.read_bytes();waypoints=ET.fromstring(data).findall('g:wpt',NS)
    farms=json.loads((ROOT/'data/navigation/emodnet-uk-ireland-windfarms-areas-20261007.geojson').read_text())['features']
    features=[];excluded=0;seen=set();counts={}
    for w in waypoints:
        x,y=float(w.attrib['lon']),float(w.attrib['lat'])
        if not (-180<=x<=180 and -90<=y<=90):raise ValueError('Invalid coordinate')
        matches=[f for f in farms if f['properties'].get('status')=='Production' and contains(f['geometry'],x,y)]
        if not matches:excluded+=1;continue
        key=(x,y)
        if key in seen:continue
        seen.add(key);farm=sorted(matches,key=lambda f:f['properties']['name'])[0]['properties']['name'];counts[farm]=counts.get(farm,0)+1
        # The single supplied screenshot identifies A06 and Fl Y 5s 5M at this coordinate.
        is_a06=math.hypot((x+(3+31.397/60))*math.cos(math.radians(y)),y-(53+58.508/60))*111195<3
        p={'name':'A06' if is_a06 else f'{farm} · imported light {counts[farm]:02d}',
           'name_status':'Screenshot identification' if is_a06 else 'Generated display label; official name not exported',
           'mark_type':'wind_farm_light','structure':'wind_turbine' if is_a06 else 'Not specified in export',
           'colour':'yellow','light':'Fl Y 5s 5M',
           'wind_farm':farm,'source_file':path.name,'source':'User-supplied TimeZero GPX export',
           'position_status':'User-selected chart position exported 8 October 2026; not independently surveyed',
           'confirmed_on':'2026-10-08','captured_at':w.findtext('g:time','',NS),
           'raw_position':f'{y:.7f}, {x:.7f}',
           'description_status':'Fl Y 5s 5M confirmed for all selected wind-farm lights by Clifton Taylor on 8 October 2026; A06 also shown in IMG_1409.png'}
        features.append({'type':'Feature','id':'user-windlight-'+hashlib.sha256(f'{x},{y}'.encode()).hexdigest()[:16],'geometry':{'type':'Point','coordinates':[x,y]},'properties':p})
    out={'type':'FeatureCollection','source_sha256':hashlib.sha256(data).hexdigest(),'imported_at':'2026-10-08','input_count':len(waypoints),'excluded_outside_windfarms':excluded,'features':features}
    target=ROOT/'data/navigation/user-windfarm-lights-20261008.geojson';target.write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n')
    print(json.dumps({'imported':len(features),'excluded':excluded,'farms':counts}))
if __name__=='__main__':build(Path(sys.argv[1]))
