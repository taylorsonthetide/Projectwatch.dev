"""Build local UK/Ireland orientation geography from OSMCoastline land polygons.
Input: land-polygons-split-4326/land_polygons.shp from osmdata.openstreetmap.de.
Coastline simplified to approximately 8 m; no roads, charts, depths or AIS relocation.
"""
import sys,json,gzip
from pathlib import Path
import shapefile
from shapely.geometry import shape,box,Polygon
from shapely.ops import unary_union
from shapely.strtree import STRtree
from concurrent.futures import ThreadPoolExecutor
REGION=(-12,49,3,62)
reader=shapefile.Reader(sys.argv[1]);clip=box(*REGION);pieces=[]
for record in reader.iterShapes(bbox=REGION):
    geom=shape(record.__geo_interface__)
    if not geom.is_valid: geom=geom.buffer(0)
    if geom.intersects(clip):pieces.append(geom.intersection(clip).simplify(.00002,preserve_topology=True))
print('Coastal pieces',len(pieces),flush=True)
# Work in bounded cells; avoid an expensive union of the whole archipelago.
waters=[]
if Path('native/harbour-basins.json').exists():
    for b in json.loads(Path('native/harbour-basins.json').read_text())['basins']:
        g=Polygon(b['r'])
        if g.is_valid:waters.append(g)
water_index=STRtree(waters) if waters else None
index=STRtree(pieces)
def build_cell(cell):
    x,y=cell;bounds=box(x,y,x+1,y+1)
    nearby=[pieces[i].intersection(bounds) for i in index.query(bounds) if pieces[i].intersects(bounds)]
    if not nearby:return [],[]
    part=unary_union(nearby).simplify(.000075,preserve_topology=False)
    if water_index:
        selected=[waters[i] for i in water_index.query(bounds) if waters[i].intersects(bounds)]
        if selected:part=part.difference(unary_union(selected))
    polygons=[];lines=[]
    for g in ([part] if part.geom_type=='Polygon' else getattr(part,'geoms',[])):
        if g.geom_type!='Polygon' or g.area<.00000002:continue
        rings=[g.exterior,*g.interiors]
        polygons.append({'b':[round(v,5) for v in g.bounds],'r':[[[round(a,5),round(b,5)] for a,b in ring.coords] for ring in rings]})
        boundary=g.boundary.intersection(box(x+.0000001,y+.0000001,x+1-.0000001,y+1-.0000001))
        for line in getattr(boundary,'geoms',[boundary]):
            if line.geom_type=='LineString':lines.append({'b':list(line.bounds),'r':[[[round(a,5),round(b,5)] for a,b in line.coords]]})
    print('Cell',x,y,'done',flush=True)
    return polygons,lines
polygons=[];lines=[]
with ThreadPoolExecutor(max_workers=4) as pool:
    for ps,ls in pool.map(build_cell,[(x,y) for x in range(-12,3) for y in range(49,62)]):polygons+=ps;lines+=ls
out={'source':'OpenStreetMap contributors; OSMCoastline land polygons, 2026-10-13','license':'ODbL 1.0','coverage':list(REGION),'polygons':polygons,'shorelines':[],'simplification_degrees':.000075,'partitioned':True}
path=Path('native/harbour-coast.json.gz');path.write_bytes(gzip.compress(json.dumps(out,separators=(',',':')).encode(),mtime=0));print('Saved',len(polygons),len(lines),path.stat().st_size,flush=True)
