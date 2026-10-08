"""Conservative A/B mark reconciliation. B is unchanged; original A is retained.
50 metres is a candidate radius, not proof of identity. No hazard layers touched.
"""
import argparse, base64, gzip, hashlib, json, math, re
from collections import defaultdict, Counter
from pathlib import Path

def distance(a,b):
    x,y,u,v=map(math.radians,(*a,*b));h=math.sin((v-y)/2)**2+math.cos(y)*math.cos(v)*math.sin((u-x)/2)**2
    return 12742000*math.asin(min(1,math.sqrt(h)))
def name(p):
    s=str(p.get('OBJNAM') or p.get('NOBJNM') or p.get('seamark:name') or p.get('name') or '').lower()
    return re.sub(r'[^a-z0-9]','',re.sub(r'\b(buoy|beacon|light|mark)\b','',s))
def family(cls):
    for suffix,kind in [('LAT','lateral'),('CAR','cardinal'),('SAW','safe_water'),('ISD','isolated_danger'),('SPP','special_purpose')]:
        if cls.startswith(('BOY','BCN')) and cls.endswith(suffix):return ('buoy_' if cls.startswith('BOY') else 'beacon_')+kind
    return None

def compatible(a,b):
    p,q=a['properties'],b['properties'];typ=q.get('seamark:type')
    if family(p['class'])!=typ:return False,'different mark type'
    subtype=q.get('seamark:'+typ+':category')
    if typ.endswith('lateral') and p.get('CATLAM') in (1,2) and subtype in ('port','starboard'):
        if {1:'port',2:'starboard'}[p['CATLAM']]!=subtype:return False,'opposite lateral hand'
    if typ.endswith('cardinal') and p.get('CATCAM') in (1,2,3,4) and subtype in ('north','east','south','west'):
        if {1:'north',2:'east',3:'south',4:'west'}[p['CATCAM']]!=subtype:return False,'different cardinal direction'
    # Only interpretable colour codes; packed CM93 COLMAR values are not guessed.
    colours={1:'white',2:'black',3:'red',4:'green',6:'yellow'}
    raw=p.get('COLOUR');old=set(colours[v] for v in raw if v in colours) if isinstance(raw,list) else ({colours[raw]} if raw in colours else set())
    new=set(str(q.get('seamark:'+typ+':colour','')).split(';'))-{''}
    if old and new and old!=new:return False,'colour conflict'
    return True,'compatible mark type'

def scan(root, snapshot, output, radius=50, reviewed=None):
    if not 0<radius<=100:raise ValueError('Candidate radius must be between 0 and 100 metres')
    output.mkdir(parents=True,exist_ok=True)
    online=json.loads(snapshot.read_text());B=[]
    for n in online['elements']:
        q=n.get('tags',{});typ=q.get('seamark:type','')
        if not typ.startswith(('buoy_','beacon_')):continue
        if not -12<=n['lon']<=3 or not 49<=n['lat']<=61:continue
        B.append({'type':'Feature','id':'osm-node-'+str(n['id']),'geometry':{'type':'Point','coordinates':[n['lon'],n['lat']]},'properties':{**q,'source':'OpenStreetMap / OpenSeaMap','source_external_id':str(n['id']),'source_date':n.get('timestamp'),'retrieved_at':online.get('retrieved_at')}})
    A=[];index=json.loads((root/'index.json').read_text())
    for c in index['cells']:
        data=json.loads(gzip.decompress(base64.b64decode(json.loads((root/(c['id']+'.json')).read_text())['gzip'])))
        for i,(layer,cls,typ,coords,props) in enumerate(data):
            if layer!=4:continue
            A.append({'type':'Feature','id':c['id']+':'+str(i),'geometry':{'type':typ,'coordinates':coords},'properties':{**props,'class':cls,'scale':c['scale'],'source':'CM93 2011','source_external_id':c['id']+':'+str(i),'source_date':'2011-10'}})
    # A latitude cell is >=111m; longitude cell is >=53m throughout this extent.
    grid=defaultdict(list)
    for b in B:
        x,y=b['geometry']['coordinates'];grid[(math.floor(x/.002),math.floor(y/.002))].append(b)
    pairs=[];matched={};allpoint=defaultdict(list)
    for a in A:
        if a['geometry']['type']!='Point':continue
        pos=a['geometry']['coordinates'];allpoint[(a['properties']['scale'],tuple(pos))].append(a)
        if not family(a['properties']['class']):continue
        x,y=pos;gx,gy=math.floor(x/.002),math.floor(y/.002);local=[]
        for ix in range(gx-1,gx+2):
            for iy in range(gy-1,gy+2):
                for b in grid[(ix,iy)]:
                    metres=distance(pos,b['geometry']['coordinates'])
                    if metres>=radius:continue
                    ok,reason=compatible(a,b);an,bn=name(a['properties']),name(b['properties'])
                    identity=ok and bool(an) and an==bn
                    p={'historical_id':a['id'],'online_id':b['id'],'historical_name':a['properties'].get('OBJNAM'),'online_name':b['properties'].get('seamark:name') or b['properties'].get('name'),'historical_class':a['properties']['class'],'online_type':b['properties'].get('seamark:type'),'distance_m':round(metres,2),'identity_match':identity,'reason':reason if not ok else 'same name and compatible type' if identity else 'proximity only; identity unconfirmed','decision':'pending'}
                    local.append(p);pairs.append(p)
        strong=[p for p in local if p['identity_match']]
        if len(strong)==1:
            p=strong[0];matched[a['id']]=p['online_id'];p['decision']='suppress_2011'
        elif strong:
            for p in strong:p['reason']='multiple online identity matches; retain for review'
    # A single B object must not consume two distinct records at the same A scale.
    reverse=defaultdict(list)
    amap={a['id']:a for a in A}
    for aid,bid in matched.items():reverse[(amap[aid]['properties']['scale'],bid)].append(aid)
    for aids in reverse.values():
        if len(aids)>1:
            for aid in aids:
                del matched[aid]
                for pair in pairs:
                    if pair['historical_id']==aid and pair['decision']=='suppress_2011':
                        pair['decision']='pending';pair['reason']='Multiple old marks at this scale match one online mark; retain for review'
    # Match light components only at the identical old buoy position, with matching
    # period/colour and no second physical mark at that coordinate.
    bmap={b['id']:b for b in B};associated=[]
    for a in A:
        if a['id'] not in matched or not family(a['properties']['class']):continue
        siblings=allpoint[(a['properties']['scale'],tuple(a['geometry']['coordinates']))]
        physical=[x for x in siblings if family(x['properties']['class'])]
        if len(physical)!=1:continue
        b=bmap[matched[a['id']]];bp=b['properties']
        for l in siblings:
            lp=l['properties']
            if lp['class']!='LIGHTS' or (name(lp) and name(lp)!=name(a['properties'])):continue
            try:period=abs(float(lp.get('SIGPER'))-float(bp.get('seamark:light:period')))<.01
            except (TypeError,ValueError):period=False
            colour=lp.get('COLOUR')==[1] and bp.get('seamark:light:colour')=='white'
            if period and colour:
                matched[l['id']]=b['id'];associated.append({'historical_id':l['id'],'online_id':b['id'],'reason':'Exact old buoy coordinate, unique buoy, matching white light and period'})
    reviewed_ids=[]
    if reviewed:
        prior=json.loads(reviewed.read_text())
        gut=[b for b in B if name(b['properties'])=='gut' and b['properties'].get('seamark:type')=='buoy_safe_water']
        if len(gut)!=1:raise ValueError('Reviewed Gut override has no unique online replacement')
        expected={r['id']:r for r in prior['historical_records']}
        for aid in [*expected,*prior.get('associated_light_records',[])]:
            a=amap.get(aid)
            if not a:raise ValueError('Reviewed historical record missing: '+aid)
            if aid in expected and a['geometry']!=expected[aid]['geometry']:raise ValueError('Reviewed geometry changed')
            if aid not in matched:reviewed_ids.append(aid)
            matched[aid]=gut[0]['id']
    removed=set(matched);cleanA=[a for a in A if a['id'] not in removed]
    def write(name,data):
        (output/name).write_text(json.dumps(data,separators=(',',':'))+'\n')
    write('cleaned-marks.geojson',{'type':'FeatureCollection','features':cleanA+B})
    write('retained-2011-marks.geojson',{'type':'FeatureCollection','features':cleanA})
    write('online-marks.geojson',{'type':'FeatureCollection','features':B})
    write('duplicate-candidates.json',pairs)
    write('suppression-register.json',{'schema':'helmlore-mark-suppression-v1','radius_m':radius,'snapshot_retrieved_at':online.get('retrieved_at'),'source_sha256':hashlib.sha256(snapshot.read_bytes()).hexdigest(),'suppressed_ids':sorted(removed),'matches':matched,'associated_lights':associated,'prior_reviewed_ids':reviewed_ids,'policy':'Online display priority. Original historical source retained. Uncertain proximity pairs preserved.'})
    assert len(cleanA)==len(A)-len(removed)
    assert set(a['id'] for a in cleanA).isdisjoint(removed)
    assert set(matched.values())<=set(bmap)
    assert set(b['id'] for b in B)<=set(f['id'] for f in cleanA+B)
    summary={'radius_m':radius,'historical_mark_records':len(A),'online_buoy_beacon_records':len(B),'cross_layer_candidate_pairs':len(pairs),'suppressed_2011_buoy_beacon_records':sum(bool(family(amap[i]['properties']['class'])) for i in removed),'suppressed_associated_light_records':sum(amap[i]['properties']['class']=='LIGHTS' for i in removed),'additional_prior_reviewed_records':len(reviewed_ids),'retained_2011_mark_records':len(cleanA),'retained_online_records':len(B),'pending_candidate_pairs':sum(p['decision']=='pending' for p in pairs),'hazard_layers_changed':0,'online_records_removed':0,'snapshot_retrieved_at':online.get('retrieved_at'),'scope':'UK/Ireland within [-12,49,3,61], saved OSM extract coverage only; this is not a real-time feed or proof of complete offshore coverage. Multi-scale source records counted separately.'}
    write('scan-summary.json',summary);print(json.dumps(summary,indent=2));return summary
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--historical',type=Path,required=True);p.add_argument('--online',type=Path,required=True);p.add_argument('--output',type=Path,required=True);p.add_argument('--reviewed',type=Path);p.add_argument('--radius',type=float,default=50);a=p.parse_args();scan(a.historical,a.online,a.output,a.radius,a.reviewed)
