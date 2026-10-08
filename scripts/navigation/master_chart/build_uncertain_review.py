"""Build the focused comparison dataset from a mark reconciliation run."""
import argparse,base64,gzip,json
from collections import defaultdict
from pathlib import Path

def build(scan,historical,output):
    pending=[p for p in json.loads((scan/'duplicate-candidates.json').read_text()) if p['decision']=='pending']
    old={f['id']:f for f in json.loads((scan/'retained-2011-marks.geojson').read_text())['features']}
    new={f['id']:f for f in json.loads((scan/'online-marks.geojson').read_text())['features']}
    needed={p['historical_id'] for p in pending};cache={}
    for aid in needed-set(old):
        cid,index=aid.split(':')
        if cid not in cache:cache[cid]=json.loads(gzip.decompress(base64.b64decode(json.loads((historical/(cid+'.json')).read_text())['gzip'])))
        layer,cls,typ,coords,props=cache[cid][int(index)]
        if layer!=4:raise ValueError('Non-mark review feature')
        old[aid]={'type':'Feature','id':aid,'geometry':{'type':typ,'coordinates':coords},'properties':{**props,'class':cls,'source':'CM93 2011','source_external_id':aid,'source_date':'2011-10'}}
    groups=defaultdict(list)
    for p in pending:p['pair_id']=p['historical_id']+'|'+p['online_id'];groups[p['online_id']].append(p)
    register=json.loads((scan/'suppression-register.json').read_text())
    result={'schema':'helmlore-uncertain-marks-v1','radius_m':50,'snapshot_date':str(register.get('snapshot_retrieved_at',''))[:10],'pair_count':len(pending),'case_count':len(groups),'historical':{k:old[k] for k in sorted(needed)},'online':{k:new[k] for k in sorted(groups)},'cases':[{'id':bid,'pairs':ps} for bid,ps in sorted(groups.items(),key=lambda x:(new[x[0]]['geometry']['coordinates'][1],new[x[0]]['geometry']['coordinates'][0]))],'already_suppressed_ids':sorted(needed&set(register['suppressed_ids']))}
    if any(f['geometry']['type']!='Point' for f in [*result['historical'].values(),*result['online'].values()]):raise ValueError('Review requires point positions')
    raw=json.dumps(result,separators=(',',':')).encode()
    output.write_text(json.dumps({'schema':'helmlore-uncertain-marks-compressed-v1','pair_count':len(pending),'case_count':len(groups),'gzip':base64.b64encode(gzip.compress(raw,compresslevel=9,mtime=0)).decode()},separators=(',',':'))+'\n')
    return {'pairs':len(pending),'locations':len(groups),'bytes':output.stat().st_size}
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--scan',type=Path,required=True);p.add_argument('--historical',type=Path,required=True);p.add_argument('--output',type=Path,required=True);a=p.parse_args();print(build(a.scan,a.historical,a.output))
