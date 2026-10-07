"""Apply an explicit, evidence-backed correction and queue affected display tiles."""
import argparse, datetime, json, sqlite3
from pathlib import Path
import mercantile
from shapely.geometry import shape, box

ZOOMS={'A':3,'B':5,'C':7,'D':9,'E':11,'F':12,'G':13}

def dirty(db, observations, reason):
    for oid in set(observations):
        row=db.execute('SELECT geometry,scale,layer FROM observations WHERE id=?',(oid,)).fetchone()
        if not row:continue
        if row[1] not in ZOOMS:
            db.execute('INSERT OR REPLACE INTO dirty_layers VALUES(?,?)',(row[2],reason))
            continue
        g=shape(json.loads(row[0]))
        levels=[ZOOMS[row[1]]]
        for z in levels:
            if g.geom_type=='Point':tiles=[mercantile.tile(g.x,g.y,z)]
            else:tiles=mercantile.tiles(*g.bounds,z)
            for t in tiles:
                b=mercantile.bounds(t)
                if g.geom_type=='Point' or g.intersects(box(b.west,b.south,b.east,b.north)):
                    db.execute('INSERT OR REPLACE INTO dirty_tiles VALUES(?,?,?,?)',(t.z,t.x,t.y,reason))

def apply(db, review_id, action, evidence):
    if not evidence.strip():raise ValueError('A notice URL, chart reference or explicit verification note is required')
    row=db.execute('SELECT type,left_id,right_id,decision FROM reviews WHERE id=?',(review_id,)).fetchone()
    if not row:raise ValueError('Unknown review ID')
    typ,left,right,decision=row
    if decision!='pending':raise ValueError('Review already decided')
    now=datetime.datetime.now(datetime.timezone.utc).isoformat()
    with db:
        if action=='accept-change':
            if typ not in ('source_change','geometry_detail_difference'):raise ValueError('Only a source-change review can use accept-change')
            old=db.execute('SELECT entity_id FROM observations WHERE id=?',(left,)).fetchone()[0]
            new=db.execute('SELECT entity_id FROM observations WHERE id=?',(right,)).fetchone()[0]
            if old!=new:raise ValueError('Entity lineage mismatch')
            current=db.execute('SELECT current_observation FROM entities WHERE id=?',(old,)).fetchone()[0]
            if current!=left:raise ValueError('Current observation changed since this review was created; review the newer lineage first')
            db.execute("UPDATE entities SET current_observation=?,decision='corrected' WHERE id=?",(right,old))
            dirty(db,[left,right],review_id)
        elif action=='merge':
            if typ not in ('same_name_nearby','close_cross_source'):raise ValueError('This review is not a duplicate candidate')
            a=db.execute('SELECT entity_id FROM observations WHERE id=?',(left,)).fetchone()[0]
            b=db.execute('SELECT entity_id FROM observations WHERE id=?',(right,)).fetchone()[0]
            if a==b:raise ValueError('Entities already associated')
            # Retain the left current observation; choosing a newer position is a
            # separate source-change correction, not an implicit side effect.
            db.execute('UPDATE observations SET entity_id=? WHERE entity_id=?',(a,b))
            db.execute("UPDATE entities SET decision='merged' WHERE id=?",(b,))
            db.execute("UPDATE entities SET decision='corrected' WHERE id=?",(a,))
            dirty(db,[left,right],review_id)
        elif action=='retire':
            eid=db.execute('SELECT entity_id FROM observations WHERE id=?',(left,)).fetchone()[0]
            db.execute("UPDATE entities SET decision='retired' WHERE id=?",(eid,))
            dirty(db,[left],review_id)
        elif action!='keep-separate':raise ValueError('Unknown action')
        db.execute('UPDATE reviews SET decision=?,evidence_url=?,decided_at=? WHERE id=?',(action,evidence,now,review_id))

def main():
    p=argparse.ArgumentParser();p.add_argument('--database',required=True);p.add_argument('--review',required=True)
    p.add_argument('--action',choices=['accept-change','merge','retire','keep-separate'],required=True);p.add_argument('--evidence',required=True);a=p.parse_args()
    db=sqlite3.connect(a.database);apply(db,a.review,a.action,a.evidence)
    print(json.dumps({'review':a.review,'action':a.action,'queued_tiles':db.execute('SELECT count(*) FROM dirty_tiles').fetchone()[0]}));db.close()
if __name__=='__main__':main()
