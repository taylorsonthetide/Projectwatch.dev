#!/usr/bin/env python3
"""Extract coordinate candidates, never infer navigation marks or missing positions."""
import argparse, csv, hashlib, json, re, subprocess, tempfile, logging
from pathlib import Path
from datetime import datetime, timezone
from pypdf import PdfReader

NUM=r'\d{1,3}(?:\.\d+)?'
# Explicit degree symbols prevent interpreting ordinary measurements as coordinates.
ANGLE=rf'(?P<deg>{NUM})\s*[°º]\s*(?:(?P<min>\d{{1,2}}(?:\.\d+)?)\s*[′\x27]\s*(?:(?P<sec>\d{{1,2}}(?:\.\d+)?)\s*[″\x22])?)?\s*(?P<dir>[NSEW])'
ANGLE_RE=re.compile(ANGLE,re.I)
SPACE_RE=re.compile(r'(?<![\d.])(?P<deg>\d{1,3})\s+(?P<min>\d{1,2}(?:\.\d+)?)\s*(?P<dir>[NSEW])\b',re.I)
DD_RE=re.compile(r'(?<![\d.])(?P<deg>\d{1,3}\.\d+)\s*°?\s*(?P<dir>[NSEW])\b',re.I)
LABEL_DD_RE=re.compile(r'\b(?:latitude|lat)\s*[:=]\s*([+-]?\d{1,2}\.\d+)\s*[,;\s]+(?:longitude|lon|long)\s*[:=]\s*([+-]?\d{1,3}\.\d+)',re.I)

def angle(m):
    d=float(m['deg']);minutes=float(m.groupdict().get('min') or 0);seconds=float(m.groupdict().get('sec') or 0)
    direction=m['dir'].upper();limit=90 if direction in 'NS' else 180
    if minutes>=60 or seconds>=60 or d>limit or (d==limit and (minutes or seconds)):
        raise ValueError('Invalid coordinate range')
    if m.groupdict().get('min') and not d.is_integer():raise ValueError('Fractional degrees with minutes')
    if seconds and not minutes.is_integer():raise ValueError('Fractional minutes with seconds')
    return (d+minutes/60+seconds/3600)*(-1 if direction in 'SW' else 1)

def coordinate_pairs(text):
    """All adjacent latitude/longitude pairs, allowing newlines and reverse order."""
    matches=[];occupied=[]
    for pattern,label in [(ANGLE_RE,'DMS/DDM/degree'),(SPACE_RE,'space DDM'),(DD_RE,'decimal hemisphere')]:
        for m in pattern.finditer(text):
            if any(m.start()<b and m.end()>a for a,b in occupied):continue
            occupied.append(m.span());matches.append((m,label))
    matches.sort(key=lambda item:item[0].start());out=[];rejected=[];i=0
    while i<len(matches)-1:
        a,fmt=matches[i];b,bfmt=matches[i+1]
        da,db=a['dir'].upper(),b['dir'].upper();gap=text[a.end():b.start()]
        opposite=(da in 'NS')!=(db in 'NS')
        # Pair only coordinates separated by punctuation/whitespace, not explanatory prose.
        if opposite and len(gap)<=25 and not re.search(r'[A-Za-z0-9]',gap):
            raw=text[a.start():b.end()]
            try:
                av,bv=angle(a),angle(b);lat,lon=(av,bv) if da in 'NS' else (bv,av)
                out.append(dict(latitude=lat,longitude=lon,start=a.start(),end=b.end(),raw_coordinate=raw,format=fmt+' + '+bfmt))
            except ValueError as e:rejected.append(dict(raw_coordinate=raw,reason=str(e),start=a.start()))
            i+=2
        else:i+=1
    for m in LABEL_DD_RE.finditer(text):
        lat,lon=map(float,m.groups())
        if abs(lat)<=90 and abs(lon)<=180:
            out.append(dict(latitude=lat,longitude=lon,start=m.start(),end=m.end(),raw_coordinate=m.group(),format='labelled decimal'))
        else:rejected.append(dict(raw_coordinate=m.group(),reason='Invalid labelled decimal range',start=m.start()))
    return sorted(out,key=lambda r:r['start']),rejected

def ocr_page(path,page):
    with tempfile.TemporaryDirectory(prefix='pilot-ocr-') as tmp:
        stem=str(Path(tmp)/'page')
        subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-singlefile','-r','200','-png',str(path),stem],check=True,capture_output=True,timeout=60)
        r=subprocess.run(['tesseract',stem+'.png','stdout','--psm','3'],check=True,capture_output=True,text=True,timeout=60)
        return r.stdout

def run(folder,manifest,out,ocr=False):
    out.mkdir(parents=True,exist_ok=True);records=[];rejects=[];files=[]
    for path in sorted(folder.iterdir()):
        if path.suffix.lower() not in ('.pdf','.txt','.md'):continue
        if path.name not in manifest:continue
        meta=manifest[path.name];sha=hashlib.sha256(path.read_bytes()).hexdigest()
        pages=PdfReader(path).pages if path.suffix.lower()=='.pdf' else [None]
        info=dict(file=path.name,pages=len(pages),sha256=sha,candidates=0,low_text_pages=[],ocr_pages=[],text_warnings=[],errors=[])
        class PageWarnings(logging.Handler):
            def emit(self,record):
                info['text_warnings'].append(dict(page=page_n,message=record.getMessage()))
        warning_handler=PageWarnings(level=logging.WARNING); logging.getLogger('pypdf').addHandler(warning_handler)
        for page_n,page in enumerate(pages,1):
            text=(page.extract_text(extraction_mode='layout',layout_mode_strip_rotated=False) or '') if page is not None else path.read_text(encoding='utf-8')
            mode='pdf_text' if page is not None else 'text'
            if page is not None and len(text.strip())<45:
                info['low_text_pages'].append(page_n)
                if ocr:
                    try:text=ocr_page(path,page_n);mode='ocr';info['ocr_pages'].append(page_n)
                    except Exception as e:info['errors'].append(dict(page=page_n,error=str(e)));continue
            # Preserve coordinate spelling; only normalise typographic quotes and soft hyphens.
            text=text.replace('\u00ad','').replace('’',"'").replace('“','"').replace('”','"')
            found,bad=coordinate_pairs(text)
            for b in bad:rejects.append(dict(source_file=path.name,pdf_page=page_n,**b))
            for c in found:
                if not (49<=c['latitude']<=61 and -12<=c['longitude']<=3):
                    rejects.append(dict(source_file=path.name,pdf_page=page_n,reason='Outside UK/Ireland study extent',**c));continue
                ident=hashlib.sha256(f'{sha}:{page_n}:{c["start"]}:{c["raw_coordinate"]}'.encode()).hexdigest()[:18]
                records.append(dict(candidate_id=ident,source_file=path.name,source_sha256=sha,source_url=meta['url'],pdf_page=page_n,edition=meta.get('edition'),source_updated_to=meta.get('updated_to'),retrieved=datetime.now(timezone.utc).date().isoformat(),horizontal_datum=meta.get('horizontal_datum','not established'),extraction_method=mode,latitude=c['latitude'],longitude=c['longitude'],raw_coordinate=c['raw_coordinate'],coordinate_format=c['format'],name=None,seamark_type=None,colour=None,light_characteristic=None,verification_status='unreviewed_coordinate_candidate',current_position_verified=False,review_reasons='Identify referenced feature; check datum, precision, age and current notices'+('; OCR characters require visual confirmation' if mode=='ocr' else ''),source_character_offset=c['start'],context_before=text[max(0,c['start']-140):c['start']].strip(),context_after=text[c['end']:c['end']+140].strip()))
                info['candidates']+=1
        logging.getLogger('pypdf').removeHandler(warning_handler)
        files.append(info);print(path.name,info['candidates'],'candidates',flush=True)
    # Preserve repeated mentions: they may be different dates, references or conflicting positions.
    (out/'coordinate_candidates.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
    geo=dict(type='FeatureCollection',description='Unreviewed coordinate mentions, not a buoyage or hazard inventory.',features=[dict(type='Feature',id=r['candidate_id'],geometry=dict(type='Point',coordinates=[r['longitude'],r['latitude']]),properties={k:v for k,v in r.items() if k not in ('longitude','latitude')}) for r in records])
    (out/'coordinate_candidates.geojson').write_text(json.dumps(geo,ensure_ascii=False)+'\n')
    with (out/'coordinate_candidates.csv').open('w',newline='') as f:
        fields=list(records[0]) if records else ['candidate_id','latitude','longitude']
        w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(records)
    (out/'rejected_coordinates.json').write_text(json.dumps(rejects,ensure_ascii=False,indent=2)+'\n')
    report=dict(input_files=files,total_candidates=len(records),rejected_count=len(rejects),bounds=[-12,49,3,61],not_navigation_data=True,limitations=['No missing coordinates inferred','Bare decimal pairs without labels ignored','OCR superscript zero/degree confusion not silently repaired','No feature names, classes or light rhythms assigned automatically','Repeated mentions preserved; candidates are not unique marks','Unknown datum is not claimed to be WGS84','Low-text pages receive OCR only when enabled; image labels on text-heavy pages may be missed','Rotated text warnings are retained for manual review','Local context is for identification review, not an asserted name or navigation instruction'])
    (out/'extraction_report.json').write_text(json.dumps(report,indent=2)+'\n')
    return report

if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('input',type=Path);a.add_argument('manifest',type=Path);a.add_argument('output',type=Path);a.add_argument('--ocr',action='store_true');args=a.parse_args()
    print(json.dumps(run(args.input,json.loads(args.manifest.read_text()),args.output,args.ocr),indent=2))
