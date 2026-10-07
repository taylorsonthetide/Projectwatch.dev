import json,sqlite3,tempfile,unittest
from pathlib import Path
from build import Catalogue,digest,dump
from export import export
from review import apply
from tiles import rebuild

class WorkflowTest(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.out=Path(self.tmp.name)/'build';self.c=Catalogue(self.tmp.name,self.out)
    def tearDown(self):self.c.db.close();self.tmp.cleanup()
    def add(self,ext,snapshot,x=-3.6,props=None):
        self.c.add('test',ext,snapshot,'marks','BOYLAT',{'type':'Point','coordinates':[x,54.55]},props or {'name':'Test buoy'},'2026-10-07','F')
    def test_exact_repeat_preserves_provenance(self):
        self.add('1','old');self.add('2','old')
        self.assertEqual(self.c.db.execute('SELECT count(*) FROM entities').fetchone()[0],1)
        self.assertEqual(self.c.db.execute('SELECT count(*) FROM observations').fetchone()[0],2)
    def test_move_staged_until_evidence_backed_acceptance(self):
        self.add('1','old');eid,old=self.c.db.execute('SELECT id,current_observation FROM entities').fetchone()
        self.add('1','new',-3.61)
        self.assertEqual(self.c.db.execute('SELECT current_observation FROM entities').fetchone()[0],old)
        rid=self.c.db.execute('SELECT id FROM reviews').fetchone()[0]
        with self.assertRaises(ValueError):apply(self.c.db,rid,'accept-change','')
        self.c.db.commit();apply(self.c.db,rid,'accept-change','Test authority notice URL')
        self.assertEqual(self.c.db.execute('SELECT id FROM entities').fetchone()[0],eid)
        self.assertNotEqual(self.c.db.execute('SELECT current_observation FROM entities').fetchone()[0],old)
        self.assertGreater(self.c.db.execute('SELECT count(*) FROM dirty_tiles').fetchone()[0],0)
        with self.assertRaises(ValueError):apply(self.c.db,rid,'accept-change','Already decided')
    def test_nearby_records_remain_separate(self):
        self.add('1','old');self.add('2','old',-3.6001)
        self.c.proximity()
        self.assertEqual(self.c.db.execute('SELECT count(*) FROM entities').fetchone()[0],2)
        self.assertEqual(self.c.db.execute("SELECT count(*) FROM reviews WHERE type='same_name_nearby'").fetchone()[0],1)
    def test_export_omits_retired_and_preserves_ids(self):
        self.add('1','old');oid=self.c.db.execute('SELECT id FROM observations').fetchone()[0]
        self.c.review('not_in_latest_extract',oid,None,'Absent is not removal');self.c.db.commit()
        rid=self.c.db.execute('SELECT id FROM reviews').fetchone()[0]
        export(self.out/'helmlore-master.sqlite',self.out/'export');self.assertEqual(json.loads((self.out/'export/export-manifest.json').read_text())['counts']['marks'],1)
        apply(self.c.db,rid,'retire','Explicit removal notice example')
        counts=export(self.out/'helmlore-master.sqlite',self.out/'export');self.assertNotIn('marks',counts)
    def test_invalid_position_not_imported(self):
        self.add('1','old',400)
        self.assertEqual(self.c.db.execute('SELECT count(*) FROM observations').fetchone()[0],0)
        self.assertEqual(len(self.c.errors),1)
    def test_refresh_same_snapshot_is_idempotent(self):
        self.add('1','old');self.add('1','old')
        self.assertEqual(self.c.db.execute('SELECT count(*) FROM observations').fetchone()[0],1)
    def test_only_queued_tile_rebuilt_and_queue_cleared(self):
        import mercantile,base64,gzip
        self.c.add('cm93-2011','cell:0','old','marks','BOYLAT',{'type':'Point','coordinates':[-3.6,54.55]},{'OBJNAM':'Test buoy'},'2011-10','F')
        t=mercantile.tile(-3.6,54.55,12);self.c.db.execute('INSERT INTO dirty_tiles VALUES(?,?,?,?)',(t.z,t.x,t.y,'test correction'));self.c.db.commit()
        out=self.out/'tiles';self.assertEqual(rebuild(self.out/'helmlore-master.sqlite',out),1)
        p=out/f'{t.z}/{t.x}/{t.y}.json';records=json.loads(gzip.decompress(base64.b64decode(json.loads(p.read_text())['gzip'])))
        self.assertEqual(len(records),1);self.assertIn('helmlore_id',records[0][4])
        self.assertEqual(self.c.db.execute('SELECT count(*) FROM dirty_tiles').fetchone()[0],0)

if __name__=='__main__':unittest.main()
