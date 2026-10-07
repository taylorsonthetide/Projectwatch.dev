"""Apply the explicit, version-controlled Helmlore correction register."""
import argparse,json,sqlite3,uuid
from review import apply

def corrections(database,register):
    db=sqlite3.connect(database);done=[]
    for rule in json.loads(open(register).read()):
        row=db.execute('SELECT o.id,o.name,e.decision FROM entities e JOIN observations o ON o.id=e.current_observation WHERE o.source=? AND o.external_id=?',(rule['source'],rule['external_id'])).fetchone()
        if not row:raise ValueError('Correction source identity not found: '+rule['external_id'])
        if row[1]!=rule['name']:raise ValueError('Correction name changed; recheck evidence before applying')
        rid=str(uuid.uuid5(uuid.NAMESPACE_URL,json.dumps(rule,sort_keys=True)))
        db.execute('INSERT OR IGNORE INTO reviews(id,type,left_id,reason) VALUES(?,?,?,?)',(rid,'confirmed_platform_removal',row[0],rule['reason']))
        db.commit()
        decision=db.execute('SELECT decision FROM reviews WHERE id=?',(rid,)).fetchone()[0]
        if decision=='pending':apply(db,rid,rule['action'],rule['evidence_url']+' | '+rule['evidence_location'])
        done.append({'review_id':rid,'source_id':rule['external_id'],'action':rule['action']})
    db.close();return done
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--database',required=True);p.add_argument('--register',default='data/navigation/master-chart/manual-corrections.json');a=p.parse_args();print(corrections(a.database,a.register))
