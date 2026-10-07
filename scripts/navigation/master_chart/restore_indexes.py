"""Recreate secondary lookup/spatial indexes after restoring the compact master backup."""
import argparse,sqlite3
from build import SCHEMA

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--database',required=True);a=p.parse_args()
    db=sqlite3.connect(a.database);db.executescript(SCHEMA)
    db.execute('INSERT OR IGNORE INTO observation_bounds SELECT rowid,minx,maxx,miny,maxy FROM observations')
    db.commit();print('Restored indexes for',db.execute('SELECT count(*) FROM observations').fetchone()[0],'observations');db.close()
