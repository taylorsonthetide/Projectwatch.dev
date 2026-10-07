import concurrent.futures,json,urllib.request,urllib.parse,pathlib,hashlib,datetime
out=pathlib.Path('data/navigation/master-chart/snapshots');out.mkdir(parents=True,exist_ok=True)
names=['ukfibrecables','platforms','portlocations','oenergy','windfarms','windfarmspoly','pipelines','oenergytests']
def fetch(n):
 params={'service':'WFS','version':'2.0.0','request':'GetFeature','typeNames':'emodnet:'+n,'outputFormat':'application/json','srsName':'EPSG:4326','bbox':'-12,49,3,61,EPSG:4326','count':'100000'}
 url='https://ows.emodnet-humanactivities.eu/wfs?'+urllib.parse.urlencode(params)
 try:
  with urllib.request.urlopen(url,timeout=120) as r: raw=r.read()
  d=json.loads(raw);assert d['type']=='FeatureCollection'
  assert not d.get('numberMatched') or int(d['numberMatched'])<=len(d['features']), 'truncated response'
  p=out/(n+'.geojson');p.write_bytes(raw)
  result={'source':n,'url':url,'retrieved_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'features':len(d['features']),'sha256':hashlib.sha256(raw).hexdigest(),'ok':True}
 except Exception as e:result={'source':n,'url':url,'ok':False,'error':str(e)}
 print(json.dumps(result),flush=True);return result
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex: results=list(ex.map(fetch,names))
(out/'refresh-manifest.json').write_text(json.dumps(results,indent=2))
