"""Versioned Helmlore research-chart catalogue. Never infer removals or merge proximity matches.

Run from the repository root. Original CM93 cells are the authoritative import units;
the clipped display tiles are validated separately and are never imported as new features.
"""
import argparse, base64, collections, datetime, gzip, hashlib, json, math, re, sqlite3, uuid
from pathlib import Path

BOUNDS = (-12, 49, 3, 61)
NAMESPACE = uuid.UUID('45158b51-22dc-4d81-b63a-180926f67811')
SELECTED = {'coast', 'contours', 'soundings', 'marks', 'seamarks', 'ukfibrecables', 'platforms', 'portlocations', 'oenergy'}
LAYERS = ['coast', 'depthareas', 'contours', 'soundings', 'marks', 'hazards']
UK_IE = {'United Kingdom', 'Ireland', 'UK', 'GB', 'IE'}

def dump(value): return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False, allow_nan=False)
def digest(value): return hashlib.sha256(value if isinstance(value, bytes) else value.encode()).hexdigest()
def uid(value): return str(uuid.uuid5(NAMESPACE, value))
def name(props): return str(next((props[k] for k in ('OBJNAM', 'name', 'portname', 'port', 'location') if props.get(k)), ''))
def norm(value): return re.sub(r'[^a-z0-9]', '', value.lower())
def coordinate_pairs(coords):
    if len(coords) >= 2 and isinstance(coords[0], (int, float)):
        yield coords[:2]
    else:
        for part in coords: yield from coordinate_pairs(part)
def bounds(geometry):
    pts = list(coordinate_pairs(geometry['coordinates']))
    if not pts: raise ValueError('empty geometry')
    if any(not math.isfinite(x) or not math.isfinite(y) or not -180 <= x <= 180 or not -90 <= y <= 90 for x,y in pts):
        raise ValueError('invalid WGS84 coordinate')
    return (min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts))
def intersects(b): return b[0] <= BOUNDS[2] and b[2] >= BOUNDS[0] and b[1] <= BOUNDS[3] and b[3] >= BOUNDS[1]
def distance(a,b):
    x1,y1,x2,y2 = map(math.radians, (*a,*b))
    h=math.sin((y2-y1)/2)**2+math.cos(y1)*math.cos(y2)*math.sin((x2-x1)/2)**2
    return 12742000*math.asin(min(1,math.sqrt(h)))
def external_id(feature):
    p=feature.get('properties',{})
    return str(next((p[k] for k in ('facid','platformid','port_id') if p.get(k)), feature.get('id') or digest(dump(feature))))

SCHEMA = '''
CREATE TABLE IF NOT EXISTS sources(id TEXT PRIMARY KEY,provider TEXT,url TEXT,licence TEXT);
CREATE TABLE IF NOT EXISTS files(path TEXT PRIMARY KEY,sha256 TEXT,bytes INTEGER,role TEXT,records INTEGER,error TEXT);
CREATE TABLE IF NOT EXISTS entities(id TEXT PRIMARY KEY,kind TEXT,current_observation TEXT,decision TEXT DEFAULT 'source_baseline');
CREATE TABLE IF NOT EXISTS observations(id TEXT PRIMARY KEY,entity_id TEXT,source TEXT,external_id TEXT,snapshot_sha TEXT,
 source_date TEXT,retrieved_at TEXT,layer TEXT,class TEXT,name TEXT,status TEXT,scale TEXT,geometry TEXT,properties TEXT,
 minx REAL,miny REAL,maxx REAL,maxy REAL,fingerprint TEXT,on_chart INTEGER, UNIQUE(source,external_id,snapshot_sha));
CREATE INDEX IF NOT EXISTS observation_identity ON observations(source,external_id);
CREATE INDEX IF NOT EXISTS observation_fingerprint ON observations(fingerprint);
CREATE INDEX IF NOT EXISTS observation_entity ON observations(entity_id);
CREATE INDEX IF NOT EXISTS observation_layer ON observations(layer);
CREATE TABLE IF NOT EXISTS reviews(id TEXT PRIMARY KEY,type TEXT,left_id TEXT,right_id TEXT,distance_m REAL,
 reason TEXT,decision TEXT DEFAULT 'pending',evidence_url TEXT,decided_at TEXT);
CREATE TABLE IF NOT EXISTS releases(id TEXT PRIMARY KEY,created_at TEXT,source_revision TEXT,summary TEXT);
CREATE TABLE IF NOT EXISTS dirty_tiles(z INTEGER,x INTEGER,y INTEGER,reason TEXT,PRIMARY KEY(z,x,y));
CREATE TABLE IF NOT EXISTS dirty_layers(layer TEXT PRIMARY KEY,reason TEXT);
CREATE VIRTUAL TABLE IF NOT EXISTS observation_bounds USING rtree(row_id,minx,maxx,miny,maxy);
CREATE VIEW IF NOT EXISTS current_features AS SELECT o.* FROM entities e JOIN observations o ON o.id=e.current_observation WHERE e.decision NOT IN ('retired','merged');
'''

class Catalogue:
    def __init__(self, root, output):
        self.root=Path(root);self.output=Path(output);self.output.mkdir(parents=True,exist_ok=True)
        self.db=sqlite3.connect(self.output/'helmlore-master.sqlite');self.db.executescript(SCHEMA)
        self.db.execute('DROP VIEW IF EXISTS current_features')
        self.db.execute("CREATE VIEW current_features AS SELECT o.* FROM entities e JOIN observations o ON o.id=e.current_observation WHERE e.decision NOT IN ('retired','merged')")
        self.db.execute('PRAGMA journal_mode=WAL'); self.db.execute('PRAGMA synchronous=NORMAL')
        self.db.execute('INSERT OR IGNORE INTO observation_bounds SELECT rowid,minx,maxx,miny,maxy FROM observations')
        self.db.commit()
        self.now=datetime.datetime.now(datetime.timezone.utc).isoformat();self.errors=[];self.counts=collections.Counter()
        self.exact_cache={};self.identity_cache={}
    def source(self, sid, provider, url, licence):
        self.db.execute('INSERT OR REPLACE INTO sources VALUES(?,?,?,?)',(sid,provider,url,licence))
    def file(self,path,role,records=None,error=None):
        raw=path.read_bytes();sha=digest(raw)
        self.db.execute('INSERT OR REPLACE INTO files VALUES(?,?,?,?,?,?)',(str(path.relative_to(self.root)),sha,len(raw),role,records,error))
        return sha
    def review(self,typ,left,right,reason,metres=None):
        key=uid('|'.join((typ,str(left),str(right))))
        self.db.execute('INSERT OR IGNORE INTO reviews(id,type,left_id,right_id,distance_m,reason) VALUES(?,?,?,?,?,?)',
                        (key,typ,left,right,metres,reason))
    def add(self,source,ext,snapshot,layer,cls,geometry,props,source_date=None,scale=None,on_chart=None):
        try: b=bounds(geometry)
        except Exception as e:
            self.errors.append({'source':source,'external_id':ext,'error':str(e)});return
        # Keep records outside the chart extent in the catalogue for provenance;
        # display exports are limited to the UK/Ireland study bounds.
        geom=dump(geometry);attr=dump(props)
        fp=digest(dump([layer,cls,geometry,props]));identity=(source,ext)
        oid=uid('|'.join((source,ext,snapshot)))
        if self.db.execute('SELECT 1 FROM observations WHERE id=?',(oid,)).fetchone():return
        previous=self.identity_cache.get(identity)
        if previous is None:
            previous=self.db.execute('SELECT entity_id,id,fingerprint FROM observations WHERE source=? AND external_id=? ORDER BY rowid DESC LIMIT 1',identity).fetchone()
        exact=self.exact_cache.get(fp)
        if exact is None: exact=self.db.execute('SELECT entity_id,id FROM observations WHERE fingerprint=? LIMIT 1',(fp,)).fetchone()
        eid=previous[0] if previous else exact[0] if exact else uid(source+'|'+ext)
        chart=int((layer in SELECTED if on_chart is None else on_chart) and intersects(b))
        status=str(props.get('current_status') or props.get('status') or ('historical' if source=='cm93-2011' else 'unknown'))
        self.db.execute('INSERT OR IGNORE INTO entities(id,kind,current_observation) VALUES(?,?,?)',(eid,layer,oid))
        self.db.execute('INSERT INTO observations VALUES('+','.join('?'*20)+')',
                        (oid,eid,source,ext,snapshot,source_date,self.now,layer,cls,name(props),status,scale,geom,attr,*b,fp,chart))
        self.db.execute('INSERT OR IGNORE INTO observation_bounds VALUES(?,?,?,?,?)',(self.db.execute('SELECT last_insert_rowid()').fetchone()[0],b[0],b[2],b[1],b[3]))
        if previous and previous[2] != fp:
            old_attr=self.db.execute('SELECT properties FROM observations WHERE id=?',(previous[1],)).fetchone()[0]
            typ='geometry_detail_difference' if old_attr==attr else 'source_change'
            self.review(typ,previous[1],oid,'Same source identity differs in geometry detail; saved display simplification may explain this. Staged, not applied.' if typ=='geometry_detail_difference' else 'Same source identity has changed attributes (and possibly geometry); staged, not applied.')
        elif exact:
            self.counts['exact_repeat_observations']+=1
        self.exact_cache.setdefault(fp,(eid,oid));self.identity_cache[identity]=(eid,oid,fp)
        self.counts['imported_observations']+=1
    def history(self):
        folder=self.root/'data/navigation/historical-2011';index=json.loads((folder/'index.json').read_text())
        self.source('cm93-2011','User-supplied CM93 October 2011','User supplied CM93 Oct 2011 Perry archive','Third-party historical chart; redistribution rights not established by conversion')
        self.file(folder/'index.json','historical-index',len(index['cells']))
        for ci,c in enumerate(index['cells']):
            path=folder/(c['id']+'.json')
            try:
                rows=json.loads(gzip.decompress(base64.b64decode(json.loads(path.read_text())['gzip'])))
                sha=self.file(path,'historical-original-cell',len(rows))
                if len(rows)!=c['records']:raise ValueError('index count mismatch')
                for ri,(li,cls,typ,coords,attrs) in enumerate(rows):
                    self.add('cm93-2011',c['id']+':'+str(ri),sha,LAYERS[li],cls,{'type':typ,'coordinates':coords},attrs,'2011-10',c['scale'])
            except Exception as e:self.errors.append({'file':str(path),'error':str(e)})
            if ci%100==0:
                self.db.commit();print(f'Historical cells {ci+1}/{len(index["cells"])}',flush=True)
        self.db.commit();self.exact_cache.clear();self.identity_cache.clear()
    def geojson(self,path,source,layer,live=False):
        doc=json.loads(path.read_text());fs=doc.get('features',[]);sha=self.file(path,'live-snapshot' if live else 'saved-source',len(fs))
        self.source(source,'EMODnet Human Activities' if source.startswith('emodnet:') else 'Helmlore collected research',
                    'https://ows.emodnet-humanactivities.eu/wfs' if source.startswith('emodnet:') else str(path.relative_to(self.root)),
                    'CC BY 4.0; retain originator attribution' if source.startswith('emodnet:') else 'See original source metadata')
        seen=set()
        for f in fs:
            p=f.get('properties',{});g=f.get('geometry')
            if not g:continue
            if live and p.get('country') and p['country'] not in UK_IE:continue
            ext=external_id(f);seen.add(ext)
            self.add(source,ext,sha,layer,layer,g,p,str(p.get('updateyear') or p.get('date_of_la') or 'unknown'),on_chart=layer in SELECTED)
        if live:
            # An absent record is not proof of a removed physical object. Bounding
            # coverage and source catalogues can differ between fetches.
            older=self.db.execute('SELECT external_id,id FROM observations WHERE source=? AND snapshot_sha<>?',(source,sha)).fetchall()
            for ext,oid in older:
                if ext not in seen:self.review('not_in_latest_extract',oid,None,'Absent from latest UK/Ireland bounding-box extract; coverage/status must be checked. No removal inferred.')
        self.db.commit()
    def modern(self):
        nav=self.root/'data/navigation'
        for path in sorted((nav/'collected-20261007').glob('*.geojson')):
            self.geojson(path,('ukho:' if path.stem.startswith('wreck') else 'emodnet:')+path.stem,path.stem)
        for path,layer,sid in [(nav/'emodnet-uk-ireland-windfarms-points-20261007.geojson','windfarms','emodnet:windfarms'),
                               (nav/'emodnet-uk-ireland-windfarms-areas-20261007.geojson','windfarmspoly','emodnet:windfarmspoly'),
                               (nav/'user-local-marks-20261007.geojson','localmarks','user-local-marks')]:
            self.geojson(path,sid,layer)
        for path in sorted((nav/'research').glob('*.geojson')):self.geojson(path,'research:'+path.stem,'research')
        pilot=nav/'research/pilotage-review-points-20261007.json'
        if pilot.exists():
            doc=json.loads(pilot.read_text());sha=self.file(pilot,'unverified-pilotage-candidates',len(doc['points']))
            self.source('pilotage-candidates','Pilotage extraction','See per-mention URLs and page references','Source-specific; extraction does not establish reuse permission')
            for f in doc['points']:
                coords=f['coordinates'];props={'mentions':f['mentions'],'status':'unverified reference position; not necessarily a physical mark'}
                self.add('pilotage-candidates',digest(dump(coords)),sha,'pilotage','reference_position',{'type':'Point','coordinates':coords},props,on_chart=False)
        for path in sorted((nav/'master-chart/snapshots').glob('*.geojson')):
            if path.stem in ('openseamap-ways','openseamap-areas'):continue
            self.geojson(path,'emodnet:'+path.stem,path.stem,True)
        osm=nav/'master-chart/snapshots/openseamap-nodes.json'
        if osm.exists():
            doc=json.loads(osm.read_text())
            if doc.get('remark'):self.errors.append({'source':'osm-seamarks','error':doc['remark']})
            else:
                sha=self.file(osm,'live-osm-nodes',len(doc['elements']))
                self.source('osm-seamarks','OpenStreetMap / OpenSeaMap','https://www.openstreetmap.org','ODbL 1.0; derived database obligations require separate review')
                for f in doc['elements']:
                    if f['type']!='node':continue
                    self.add('osm-seamarks','node/'+str(f['id']),sha,'seamarks',f.get('tags',{}).get('seamark:type','unknown'),
                             {'type':'Point','coordinates':[f['lon'],f['lat']]},f.get('tags',{}),f.get('timestamp'))
        self.db.commit()
        for osmways in (nav/'master-chart/snapshots/openseamap-ways.geojson',nav/'master-chart/snapshots/openseamap-areas.geojson'):
            if not osmways.exists():continue
            doc=json.loads(osmways.read_text());sha=self.file(osmways,'live-osm-geometry',len(doc['features']))
            for f in doc['features']:
                props=f['properties'];self.add('osm-seamarks',f['id'],sha,'seamarks',props.get('seamark:type','unknown'),f['geometry'],props,props.get('osm_timestamp'))
            self.db.commit()
    def tiles(self):
        folder=self.root/'data/navigation/historical-tiles-2011-v1';index=json.loads((folder/'index.json').read_text());self.file(folder/'index.json','tile-index',len(index['cells']))
        count=0
        for ti,t in enumerate(index['cells']):
            path=folder/(t['id']+'.json')
            try:
                rows=json.loads(gzip.decompress(base64.b64decode(json.loads(path.read_text())['gzip'])))
                self.file(path,'derived-tile',len(rows));count+=len(rows)
                if len(rows)!=t['records']:raise ValueError('tile record count mismatch')
                mask=sum(1<<li for li in {r[0] for r in rows})
                if mask!=t['layer_mask']:raise ValueError('layer mask mismatch')
                for row in rows:
                    rid=row[4].get('record_id')
                    if not rid or not self.db.execute('SELECT 1 FROM observations WHERE source=? AND external_id=?',('cm93-2011',rid)).fetchone():
                        raise ValueError('unknown original record reference '+str(rid))
            except Exception as e:self.errors.append({'file':str(path),'error':str(e)})
            if ti%500==0:self.db.commit();print(f'Validated tiles {ti+1}/{len(index["cells"])}',flush=True)
        self.counts['derived_tile_records']=count;self.db.commit()
    def proximity(self):
        # Candidate review only. Names and distances do not establish identity.
        points=self.db.execute("SELECT id,entity_id,layer,class,name,minx,miny,source,properties FROM current_features WHERE minx=maxx AND miny=maxy AND layer IN ('marks','seamarks','localmarks','platforms','portlocations','windfarms','oenergy')").fetchall()
        bins=collections.defaultdict(list)
        for row in points:
            x,y=row[5],row[6];bx,by=math.floor(x/.005),math.floor(y/.003)
            for dx in range(-2,3):
                for dy in range(-1,2):
                    for other in bins[(bx+dx,by+dy)]:
                        if row[1]==other[1]:continue
                        d=distance((x,y),(other[5],other[6]))
                        compatible=row[2]==other[2] or {row[2],other[2]} <= {'marks','seamarks','localmarks'}
                        if compatible and row[4] and norm(row[4])==norm(other[4]) and d<=250:
                            self.review('same_name_nearby',other[0],row[0],'Same normalized name within 250 m; check type, light, epoch and source before merging.',round(d,2))
                        elif compatible and d<=30 and row[7]!=other[7]:
                            self.review('close_cross_source',other[0],row[0],'Different source records within 30 m; may be distinct objects, light components or duplicates.',round(d,2))
            bins[(bx,by)].append(row)
        self.db.commit()
    def wind_sites(self):
        # Point/polygon association is not a duplicate deletion. A farm can have
        # several phases and polygons; retain each source observation.
        rows=self.db.execute("SELECT id,name,layer,status FROM current_features WHERE layer IN ('windfarms','windfarmspoly')").fetchall()
        names=collections.defaultdict(list)
        for r in rows:names[norm(r[1])].append(r)
        for group in names.values():
            if len(group)>1:
                for r in group[1:]:self.review('wind_site_association',group[0][0],r[0],'Same farm name across point/boundary or phases; associate as a site, retain individual geometries.')
        self.db.commit()
        for oid,status in self.db.execute("SELECT id,status FROM current_features WHERE source<>'cm93-2011'").fetchall():
            if any(word in status.lower() for word in ('dismantled','decommission','cancelled','closed','abandon')):
                self.review('inactive_source_status',oid,None,'Source status is '+status+'; verify what structures remain before changing chart depiction.')
        self.db.commit()
    def finish(self,revision):
        master=self.root/'data/navigation/master-chart'
        for path in sorted((master/'snapshots').glob('*')):
            if path.is_file() and not self.db.execute('SELECT 1 FROM files WHERE path=?',(str(path.relative_to(self.root)),)).fetchone():self.file(path,'source-metadata-or-unassembled-records')
        if (master/'manual-corrections.json').exists():self.file(master/'manual-corrections.json','explicit-evidence-backed-corrections')
        for path in sorted((self.root/'data/navigation').rglob('*')):
            if path.is_file() and 'master-chart' not in path.parts:
                if not self.db.execute('SELECT 1 FROM files WHERE path=?',(str(path.relative_to(self.root)),)).fetchone():self.file(path,'supporting-or-reference')
        self.counts['observations']=self.db.execute('SELECT count(*) FROM observations').fetchone()[0]
        self.counts['entities']=self.db.execute('SELECT count(*) FROM entities').fetchone()[0]
        self.counts['files']=self.db.execute('SELECT count(*) FROM files').fetchone()[0]
        self.counts['reviews']=self.db.execute('SELECT count(*) FROM reviews').fetchone()[0]
        self.counts['exact_duplicate_entity_groups']=self.db.execute("SELECT count(*) FROM (SELECT entity_id FROM observations GROUP BY entity_id HAVING count(DISTINCT source||'|'||external_id)>1)").fetchone()[0]
        self.counts['retired_entities']=self.db.execute("SELECT count(*) FROM entities WHERE decision='retired'").fetchone()[0]
        report={'created_at':self.now,'source_revision':revision,'bounds':BOUNDS,'counts':dict(self.counts),
                'osm_extraction':json.loads((master/'snapshots/openseamap-extraction-report.json').read_text()) if (master/'snapshots/openseamap-extraction-report.json').exists() else None,
                'review_types':dict(self.db.execute('SELECT type,count(*) FROM reviews GROUP BY type').fetchall()),
                'layers':dict(self.db.execute('SELECT layer,count(*) FROM observations GROUP BY layer').fetchall()),
                'errors':self.errors,'limitations':['Custom research chart, not an official ENC.','Source retrieval date is not a survey/update date.',
                'Proximity and missing records never trigger automatic deletion.','Live OpenSeaMap raster remains separate until vector reconciliation is reviewed.',
                'Historic depth/survey currency has not been verified.','Notices to Mariners are not yet an exhaustive reconciled correction series.',
                'Wind-farm audit does not assert complete turbine-level coverage.']}
        release=uid(self.now+'|'+revision)
        self.db.execute('INSERT INTO releases VALUES(?,?,?,?)',(release,self.now,revision,dump(report)))
        (self.output/'audit-report.json').write_text(json.dumps(report,indent=2))
        reviews=[dict(zip(('id','type','left_id','right_id','distance_m','reason','decision','evidence_url','decided_at'),r)) for r in self.db.execute('SELECT * FROM reviews')]
        (self.output/'review-queue.json').write_text(json.dumps(reviews,indent=2))
        manifest=[dict(zip(('path','sha256','bytes','role','records','error'),r)) for r in self.db.execute('SELECT * FROM files ORDER BY path')]
        (self.output/'file-manifest.json').write_text(json.dumps(manifest,indent=2))
        self.db.commit();self.db.execute('PRAGMA wal_checkpoint(TRUNCATE)');self.db.close()
        print(json.dumps(report,indent=2),flush=True)

def main():
    p=argparse.ArgumentParser();p.add_argument('--root',default='.');p.add_argument('--output',default='data/navigation/master-chart/build');p.add_argument('--revision',required=True)
    p.add_argument('--incremental',action='store_true',help='Reuse already imported historical cells and previously validated tiles; refresh modern source snapshots only');a=p.parse_args()
    report=Path(a.output)/'audit-report.json'
    if a.incremental and not report.exists():p.error('--incremental requires an existing audited catalogue')
    previous=json.loads(report.read_text()) if a.incremental else None
    c=Catalogue(a.root,a.output)
    if previous:c.counts.update(previous['counts'])
    else:c.history()
    c.modern()
    if not previous:c.tiles()
    c.proximity();c.wind_sites();c.finish(a.revision)
if __name__=='__main__':main()
