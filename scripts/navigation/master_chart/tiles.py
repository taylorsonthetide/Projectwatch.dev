"""Rebuild only queued historical native-scale tiles from the master database.

The first build can copy the existing tile pack, then queue its index entries with
--queue-all. Original source records remain in SQLite; tiled fragments are outputs.
Modern vector layers are exported separately by export.py.
"""
import argparse,base64,gzip,json,sqlite3
from pathlib import Path
import mercantile
from shapely.geometry import shape,box,mapping
from shapely import make_valid

SCALES={3:'A',5:'B',7:'C',9:'D',11:'E',12:'F',13:'G'}
LAYERS={'coast':0,'contours':2,'soundings':3,'marks':4}

def rebuild(database, output, queue_all=False):
    db=sqlite3.connect(database);db.row_factory=sqlite3.Row;db.execute('CREATE TABLE IF NOT EXISTS chart_mark_decisions(source_external_id TEXT PRIMARY KEY,action TEXT,evidence TEXT,decided_at TEXT,review_sha256 TEXT)');out=Path(output);out.mkdir(parents=True,exist_ok=True)
    index_path=out/'index.json'
    index=json.loads(index_path.read_text()) if index_path.exists() else {'year':2011,'layers':['coast','depthareas','contours','soundings','marks','hazards'],'cells':[],'bounds':[-12,49,3,61]}
    entries={c['id']:c for c in index['cells']}
    if queue_all:
        for key in entries:
            z,x,y=map(int,key.split('/'));db.execute('INSERT OR IGNORE INTO dirty_tiles VALUES(?,?,?,?)',(z,x,y,'initial master build'))
        db.commit()
    rebuilt=[]
    # Leave infrastructure zooms queued for their own modern-vector renderer.
    for tile in db.execute('SELECT z,x,y,reason FROM dirty_tiles').fetchall():
        z,x,y,reason=tile;scale=SCALES.get(z)
        if not scale:continue
        t=mercantile.Tile(x,y,z);b=mercantile.bounds(t);clip=box(b.west,b.south,b.east,b.north)
        rows=[]
        query="""SELECT o.* FROM observation_bounds b JOIN observations o ON o.rowid=b.row_id
          JOIN entities e ON o.id=e.current_observation
          WHERE e.decision NOT IN ('retired','merged') AND o.source='cm93-2011' AND o.scale=? AND o.on_chart=1 AND NOT EXISTS (SELECT 1 FROM chart_mark_decisions d WHERE o.source='cm93-2011' AND d.source_external_id=o.external_id AND d.action='hide')
          AND b.minx<=? AND b.maxx>=? AND b.miny<=? AND b.maxy>=?"""
        for o in db.execute(query,(scale,b.east,b.west,b.north,b.south)):
            if o['layer'] not in LAYERS:continue
            geo=json.loads(o['geometry']);g=shape(geo)
            if geo['type']=='Point':
                # Single owner tile prevents boundary-point duplication.
                if mercantile.tile(g.x,g.y,z)!=t:continue
                parts=[g]
            else:
                if not g.is_valid:g=make_valid(g)
                g=g.intersection(clip)
                if g.is_empty:continue
                parts=list(g.geoms) if g.geom_type=='GeometryCollection' else [g]
            for part in parts:
                if part.geom_type not in ('Point','LineString','MultiLineString','Polygon','MultiPolygon'):continue
                if part.geom_type!='Point':part=part.simplify(360/(2**z*256)*.25,preserve_topology=True)
                geo=mapping(part);props=json.loads(o['properties'])
                props.update({'cell':o['external_id'].split(':')[0],'scale':scale,'source_year':2011,'record_id':o['external_id'],
                    'helmlore_id':o['entity_id'],'source_observation':o['id']})
                rows.append([LAYERS[o['layer']],o['class'],geo['type'],geo['coordinates'],props])
        key=f'{z}/{x}/{y}';p=out/(key+'.json');p.parent.mkdir(parents=True,exist_ok=True)
        raw=json.dumps(rows,separators=(',',':')).encode();packed=json.dumps({'gzip':base64.b64encode(gzip.compress(raw,6,mtime=0)).decode()},separators=(',',':'))
        tmp=p.with_suffix('.tmp');tmp.write_text(packed);tmp.replace(p)
        if rows:
            entries[key]={'id':key,'cell':'XYZ '+key,'scale':scale,'bbox':[b.west,b.south,b.east,b.north],'records':len(rows),
                'layer_mask':sum(1<<li for li in {r[0] for r in rows}),'bytes':len(packed),'expanded_bytes':len(raw)}
        else:entries.pop(key,None)
        rebuilt.append((z,x,y));print('Rebuilt',key,len(rows),flush=True)
    index['cells']=list(entries.values());index['note']='Derived from the versioned Helmlore master catalogue; historical source date 2011, not an official ENC.'
    tmp=index_path.with_suffix('.tmp');tmp.write_text(json.dumps(index,separators=(',',':')));tmp.replace(index_path)
    # Clear only after every requested file and the index were successfully written.
    for z,x,y in rebuilt:db.execute('DELETE FROM dirty_tiles WHERE z=? AND x=? AND y=?',(z,x,y))
    db.commit();db.close();return len(rebuilt)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--database',required=True);p.add_argument('--output',required=True);p.add_argument('--queue-all',action='store_true');a=p.parse_args();print('Rebuilt tiles:',rebuild(a.database,a.output,a.queue_all))
