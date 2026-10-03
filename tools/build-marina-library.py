#!/usr/bin/env python3
"""Build a versioned ODbL marina library from a UK Overpass JSON snapshot.

Query: [out:json][timeout:45];area["ISO3166-1"="GB"][admin_level=2]->.uk;
nwr[leisure=marina](area.uk);out center tags;
Download once with an identifying User-Agent; do not query per website visitor.
"""
import datetime
import json
import math
import pathlib
import sys
import unicodedata

raw = json.loads(pathlib.Path(sys.argv[1]).read_text())
if raw.get('remark') or not raw.get('elements'):
    raise SystemExit('Incomplete/empty Overpass response; keep the existing library.')
records = []
for element in raw['elements']:
    tags = element.get('tags', {})
    point = element if element['type'] == 'node' else element.get('center', {})
    lat, lon = point.get('lat'), point.get('lon')
    if not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)) or not (49 <= lat <= 61.5 and -9 <= lon <= 2.5):
        raise SystemExit(f'Invalid/missing UK coordinates: {element["type"]}/{element["id"]}')
    identity = f'osm-{element["type"]}-{element["id"]}'
    name = tags.get('name') or tags.get('official_name') or tags.get('name:en')
    aliases = sorted(set(v.strip() for key in ['alt_name', 'official_name', 'name:en', 'short_name', 'old_name'] for v in tags.get(key, '').split(';') if v.strip() and v.strip() != name))
    # The mapped harbour is operated and branded as Whitehaven Marina.
    if identity == 'osm-way-1296018079':
        aliases.append('Whitehaven Marina')
    locality = tags.get('addr:city') or tags.get('addr:town') or tags.get('addr:village') or tags.get('addr:hamlet') or ''
    record = dict(id=identity, name=name or f'Unnamed marina ({element["type"]} {element["id"]})', named=bool(name), aliases=aliases, lat=lat, lon=lon,
                  coordinateBasis='osm-node' if element['type'] == 'node' else 'osm-area-centre', entranceVerified=False,
                  locality=locality, postcode=tags.get('addr:postcode', ''), address=', '.join(tags[k] for k in ['addr:housenumber', 'addr:street', 'addr:county'] if tags.get(k)),
                  operator=tags.get('operator', ''), website=tags.get('website') or tags.get('contact:website') or '', access=tags.get('access', ''),
                  sourceUrl=f'https://www.openstreetmap.org/{element["type"]}/{element["id"]}', sourceIds=[identity])
    records.append(record)

def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFKD', s.casefold()) if not unicodedata.combining(c)).strip()

def metres(a, b):
    lat1, lat2 = math.radians(a['lat']), math.radians(b['lat'])
    dlat, dlon = lat2-lat1, math.radians(b['lon']-a['lon'])
    return 6371000 * 2 * math.asin(min(1, math.sqrt(math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2)))

unique = []
for record in sorted(records, key=lambda m: (not m['named'], m['name'].casefold(), m['id'])):
    duplicate = next((m for m in unique if record['named'] and m['named'] and fold(m['name']) == fold(record['name']) and metres(m, record) < 30), None)
    if duplicate:
        duplicate['sourceIds'].extend(record['sourceIds'])
        duplicate['aliases'] = sorted(set(duplicate['aliases'] + record['aliases']))
        for key in ['locality', 'postcode', 'address', 'operator', 'website', 'access']:
            duplicate[key] = duplicate[key] or record[key]
    else:
        unique.append(record)

output = pathlib.Path(sys.argv[2])
output.parent.mkdir(parents=True, exist_ok=True)
library = dict(schemaVersion=1, generatedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(), sourceTimestamp=raw.get('osm3s', {}).get('timestamp_osm_base'),
               source='OpenStreetMap via Overpass API', scope='United Kingdom (including Northern Ireland), leisure=marina; coastal and inland',
               completeness='All marina-tagged records in this source snapshot. Not verified as every UK marina; community data may be missing, duplicated or outdated.',
               coordinateWarning='Node positions or mapped area centres, not verified marina entrances or safe approach waypoints.',
               licence='ODbL-1.0', licenceUrl='https://opendatacommons.org/licenses/odbl/1-0/', attribution='© OpenStreetMap contributors',
               sourceQuery='[out:json][timeout:45];area["ISO3166-1"="GB"][admin_level=2]->.uk;nwr[leisure=marina](area.uk);out center tags;',
               rawRecordCount=len(records), deduplicatedCount=len(records)-len(unique), namedCount=sum(m['named'] for m in unique), marinas=unique)
output.write_text(json.dumps(library, ensure_ascii=False, separators=(',', ':')) + '\n')
print(f'{len(unique)} locations; {library["namedCount"]} named; {library["deduplicatedCount"]} near-identical duplicates consolidated')
