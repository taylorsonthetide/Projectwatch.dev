"""Import user-reviewed mark retirements, preserving provenance and queuing tiles.
No fuzzy matching. A changed position or unknown source aborts the entire batch.
"""
import argparse, json, sqlite3, uuid, math
from pathlib import Path

def import_file(db, path):
    data=json.loads(Path(path).read_text())
    if data.get('schema')!='helmlore-mark-corrections-v1' or not isinstance(data.get('corrections'),list):
        raise ValueError('Invalid correction schema')
    ready=[]
    for c in data['corrections']:
        if c.get('source') not in ('cm93-2011','user-local-marks') or c.get('action')!='retire' or not isinstance(c.get('evidence'),str) or not c['evidence'].strip():
            raise ValueError('Unsupported or unevidenced correction')
        coords=c.get('coordinates')
        if not isinstance(coords,list) or len(coords)!=2 or not all(isinstance(v,(int,float)) and math.isfinite(v) for v in coords):raise ValueError('Invalid coordinates')
        rows=db.execute('SELECT DISTINCT o.entity_id,e.current_observation,e.decision FROM observations o JOIN entities e ON e.id=o.entity_id WHERE o.source=? AND o.external_id=?',(c['source'],c['source_external_id'])).fetchall()
        if len(rows)!=1:raise ValueError('Unknown or ambiguous source ID: '+c['source_external_id'])
        eid,oid,decision=rows[0]
        if decision=='retired':continue
        if decision=='merged':raise ValueError('Record was merged; review its current lineage')
        geometry,layer=db.execute('SELECT geometry,layer FROM observations WHERE id=?',(oid,)).fetchone()
        g=json.loads(geometry)
        if layer not in ('marks','localmarks') or g['type']!='Point' or any(abs(a-b)>1e-7 for a,b in zip(g['coordinates'],coords)):
            raise ValueError('Position or classification changed; review again: '+c['source_external_id'])
        rid=str(uuid.uuid5(uuid.NAMESPACE_URL,'helmlore:manual-retire:'+eid+':'+oid))
        ready.append((rid,oid,c['evidence']))
    # Validate every source identity before changing any record.
    db.execute('BEGIN')
    try:
        for rid,oid,evidence in ready:
            db.execute("INSERT OR IGNORE INTO reviews(id,type,left_id,right_id,reason) VALUES(?,?,?,?,?)",(rid,'manual_mark_retirement',oid,oid,'Imported user mark correction'))
            # Explicit retirement only, no duplicate inference.
            from review import dirty
            eid=db.execute('SELECT entity_id FROM observations WHERE id=?',(oid,)).fetchone()[0]
            db.execute("UPDATE entities SET decision='retired' WHERE id=?",(eid,))
            dirty(db,[oid],rid)
            db.execute("UPDATE reviews SET decision='retire',evidence_url=?,decided_at=datetime('now') WHERE id=?",(evidence,rid))
        db.commit()
    except Exception:
        db.rollback();raise
    return len(ready)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--database',required=True);p.add_argument('--file',required=True);a=p.parse_args()
    db=sqlite3.connect(a.database)
    try:print(json.dumps({'retired':import_file(db,a.file),'next':'Run tiles.py and export.py, then publish the reviewed release.'}))
    finally:db.close()
