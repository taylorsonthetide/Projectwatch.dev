"""Build reproducible byte/hash inventory for explicit full chart downloads."""
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[2]
release=json.loads((root/'data/navigation/master-chart/published-release.json').read_text())
files=[]
for folder in ['data/navigation','data/marinas']:
 for p in sorted((root/folder).rglob('*')):
  if not p.is_file() or p.suffix not in ['.json','.geojson']:continue
  rel=p.relative_to(root).as_posix()
  if '/historical-2011/' in rel or '/snapshots/' in rel or rel.endswith('offline-chart-manifest.json'):continue
  b=p.read_bytes();files.append({'path':rel,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
identity=hashlib.sha256(json.dumps(files,separators=(',',':')).encode()).hexdigest()[:16]
m={'schema':'helmlore-chart-pack-v1','id':release['id']+'-'+identity,'release':release['id'],'bounds':[-12,49,3,61],'sourceDates':{'historical':'2011-10','seamarks':release['reviewed_mark_counts']['online_snapshot_date'],'review':release['review_exported_at']},'bytes':sum(f['bytes'] for f in files),'files':files}
(root/'data/navigation/offline-chart-manifest.json').write_text(json.dumps(m,separators=(',',':'))+'\n')
print(m['id'],len(files),m['bytes'])
