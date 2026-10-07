"""Export reviewed current records; unresolved candidates do not replace the baseline."""
import argparse,gzip,json,sqlite3
from pathlib import Path

def export(database,output):
    db=sqlite3.connect(database);db.row_factory=sqlite3.Row;out=Path(output);out.mkdir(parents=True,exist_ok=True)
    groups={};counts={}
    # Remove prior exported layer files when all features of a layer were retired.
    # Only this dedicated output directory is managed by the exporter.
    for p in out.glob('*.geojson'):p.unlink()
    query="SELECT o.*,e.decision FROM entities e JOIN observations o ON o.id=e.current_observation WHERE e.decision NOT IN ('retired','merged') AND o.on_chart=1"
    with gzip.open(out/'current-features.jsonl.gz','wt',encoding='utf-8') as all_features:
        for r in db.execute(query):
            props=json.loads(r['properties']);props.update({'helmlore_id':r['entity_id'],'source_observation':r['id'],'source_external_id':r['external_id'],'source':r['source'],
                         'source_date':r['source_date'],'retrieved_at':r['retrieved_at'],'chart_status':r['status'],'correction_status':r['decision']})
            f={'type':'Feature','id':r['entity_id'],'geometry':json.loads(r['geometry']),'properties':props}
            all_features.write(json.dumps({'layer':r['layer'],'class':r['class'],'scale':r['scale'],'feature':f},separators=(',',':'))+'\n')
            counts[r['layer']]=counts.get(r['layer'],0)+1
            if r['source']!='cm93-2011':groups.setdefault(r['layer'],[]).append(f)
    for layer,features in groups.items():(out/(layer+'.geojson')).write_text(json.dumps({'type':'FeatureCollection','features':features},separators=(',',':')))
    (out/'export-manifest.json').write_text(json.dumps({'counts':counts,'pending_reviews':db.execute("SELECT count(*) FROM reviews WHERE decision='pending'").fetchone()[0],
       'dirty_tiles':[dict(r) for r in db.execute('SELECT * FROM dirty_tiles')],
       'dirty_layers':[dict(r) for r in db.execute('SELECT * FROM dirty_layers')],
       'note':'Original dated chart and reviewed corrections only. Not an official ENC.'},indent=2))
    db.close();return counts

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--database',required=True);p.add_argument('--output',required=True);a=p.parse_args();print(export(a.database,a.output))
