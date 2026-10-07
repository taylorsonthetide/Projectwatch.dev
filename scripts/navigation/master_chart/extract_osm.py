"""Extract seamark nodes and tagged ways from a Geofabrik OSM PBF, without a huge node cache.

Two streaming passes retain only seamark nodes and node positions needed by tagged
seamark ways. Relation records are retained for follow-up geometry assembly, never
silently promoted to guessed positions.
"""
import argparse,datetime,json,hashlib
from pathlib import Path
import osmium
from shapely.geometry import LineString,mapping
from shapely.ops import polygonize,unary_union

class Marks(osmium.SimpleHandler):
    def __init__(self):super().__init__();self.nodes=[];self.ways=[];self.relations=[];self.needed=set()
    def node(self,n):
        if 'seamark:type' in n.tags and n.location.valid():
            self.nodes.append({'type':'node','id':n.id,'lat':n.location.lat,'lon':n.location.lon,
                              'timestamp':str(n.timestamp),'version':n.version,'tags':dict(n.tags)})
    def way(self,w):
        if 'seamark:type' in w.tags:
            ids=[n.ref for n in w.nodes];self.needed.update(ids)
            self.ways.append({'id':w.id,'nodes':ids,'tags':dict(w.tags),'timestamp':str(w.timestamp),'version':w.version})
    def relation(self,r):
        if 'seamark:type' in r.tags:
            self.relations.append({'id':r.id,'tags':dict(r.tags),'members':[{'type':m.type,'ref':m.ref,'role':m.role} for m in r.members],
                                   'timestamp':str(r.timestamp),'version':r.version})
class Positions(osmium.SimpleHandler):
    def __init__(self,needed):super().__init__();self.needed=needed;self.positions={}
    def node(self,n):
        if n.id in self.needed and n.location.valid():self.positions[n.id]=[n.location.lon,n.location.lat]
class MemberWays(osmium.SimpleHandler):
    def __init__(self,wanted):super().__init__();self.wanted=wanted;self.ways={}
    def way(self,w):
        if w.id in self.wanted:self.ways[w.id]=[n.ref for n in w.nodes]

def main():
    p=argparse.ArgumentParser();p.add_argument('--pbf',required=True);p.add_argument('--output',default='data/navigation/master-chart/snapshots');p.add_argument('--source-url',required=True);a=p.parse_args()
    source=Path(a.pbf);out=Path(a.output);out.mkdir(parents=True,exist_ok=True)
    h=Marks();osmium.apply(str(source),osmium.filter.KeyFilter('seamark:type'),h);print('Tagged nodes/ways/relations:',len(h.nodes),len(h.ways),len(h.relations),flush=True)
    wanted={m['ref'] for r in h.relations for m in r['members'] if m['type']=='w'}
    members=MemberWays(wanted);osmium.apply(str(source),osmium.filter.IdFilter(wanted),members)
    for ids in members.ways.values():h.needed.update(ids)
    loc=Positions(h.needed);osmium.apply(str(source),osmium.filter.IdFilter(h.needed),loc)
    features=[];missing=[]
    for w in h.ways:
        if any(n not in loc.positions for n in w['nodes']):missing.append(w['id']);continue
        coords=[loc.positions[n] for n in w['nodes']]
        if len(coords)<2:missing.append(w['id']);continue
        features.append({'type':'Feature','id':'way/'+str(w['id']),'geometry':{'type':'LineString','coordinates':coords},
                         'properties':{**w['tags'],'osm_timestamp':w['timestamp'],'osm_version':w['version']}})
    timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
    (out/'openseamap-nodes.json').write_text(json.dumps({'elements':h.nodes,'retrieved_at':timestamp,'source_url':a.source_url},separators=(',',':')))
    (out/'openseamap-ways.geojson').write_text(json.dumps({'type':'FeatureCollection','features':features},separators=(',',':')))
    (out/'openseamap-relations.json').write_text(json.dumps(h.relations,indent=2))
    areas=[];unresolved=[]
    for r in h.relations:
        try:
            if r['tags'].get('type') not in ('multipolygon','boundary'):raise ValueError('relation type needs a separate assembler')
            outer=[];inner=[]
            for m in r['members']:
                if m['type']!='w':
                    if m['role'] in ('label','admin_centre'):continue
                    raise ValueError('non-way geometry member')
                coords=[loc.positions[n] for n in members.ways[m['ref']]]
                if m['role']=='inner':inner.append(LineString(coords))
                elif m['role'] in ('outer',''):outer.append(LineString(coords))
                else:raise ValueError('unhandled member role '+m['role'])
            polys=list(polygonize(unary_union(outer)))
            if not polys:raise ValueError('outer members do not form a closed area')
            g=unary_union(polys)
            if inner:g=g.difference(unary_union(list(polygonize(unary_union(inner)))))
            if g.is_empty or not g.is_valid:raise ValueError('empty/invalid assembled area')
            areas.append({'type':'Feature','id':'relation/'+str(r['id']),'geometry':mapping(g),'properties':{**r['tags'],'osm_timestamp':r['timestamp'],'osm_version':r['version']}})
        except Exception as e:unresolved.append({'id':r['id'],'reason':str(e)})
    (out/'openseamap-areas.geojson').write_text(json.dumps({'type':'FeatureCollection','features':areas},separators=(',',':')))
    sha=hashlib.sha256()
    with source.open('rb') as f:
        for chunk in iter(lambda:f.read(8*1024*1024),b''):sha.update(chunk)
    report={'source_url':a.source_url,'pbf_sha256':sha.hexdigest(),'pbf_bytes':source.stat().st_size,'retrieved_at':timestamp,
            'nodes':len(h.nodes),'tagged_ways':len(h.ways),'exported_ways':len(features),'missing_way_positions':missing,
            'assembled_relations':len(areas),'relations_pending_geometry':unresolved,
            'coverage':'Geofabrik Britain and Ireland extract; not an assertion of all offshore data within the chart bounding box.',
            'licence':'OpenStreetMap ODbL 1.0; source attribution and derived database obligations apply'}
    (out/'openseamap-extraction-report.json').write_text(json.dumps(report,indent=2));print(report,flush=True)
if __name__=='__main__':main()
