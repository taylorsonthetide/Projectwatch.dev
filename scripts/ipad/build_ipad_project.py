#!/usr/bin/env python3
"""Build a chartplotter-only Xcode source project with reviewed local chart assets."""
import argparse, hashlib, json, re, shutil, subprocess
from pathlib import Path


def build(repo, output):
    repo, output = Path(repo).resolve(), Path(output).resolve()
    if output == repo or repo in output.parents:
        raise ValueError('Use an output directory outside the repository')
    if output.exists(): raise ValueError('Output must be a new directory')
    output.mkdir(parents=True)
    src=repo/'ios/HelmlorePlotter'; app=output/'HelmlorePlotter'
    shutil.copytree(src,app)
    web=app/'AppWeb'; web.mkdir()
    for folder in ['js/navigation','js/vendor/leaflet','data/marinas','data/weather']:
        shutil.copytree(repo/folder,web/folder)
    # Preserve native-scale chart tiles and selected infrastructure; exclude original source-cell files.
    shutil.copytree(repo/'data/navigation',web/'data/navigation',ignore=shutil.ignore_patterns('historical-2011','build'))
    css=['navigation.css','navigation-polish.css','navigation-weather.css','navigation-chart.css']
    (web/'css').mkdir()
    for name in css: shutil.copy2(repo/'css'/name,web/'css'/name)
    for name in ['navigation.webmanifest']:shutil.copy2(repo/name,web/name)
    for p in (repo/'docs').glob('*.md'):
        (web/'docs').mkdir(exist_ok=True);shutil.copy2(p,web/'docs'/p.name)
    html=(repo/'navigation.html').read_text()
    html=html.replace('data-navigation-chart="true"','data-navigation-chart="true" data-offline-chart="true"')
    html=re.sub(r'<link[^>]+href="css/languages[^>]+>','',html)
    html=re.sub(r'<script[^>]+src="js/(?:languages|website-traffic)[^>]+></script>','',html)
    html=re.sub(r'<a[^>]+href="(?:index|planning|chart-mark-review)\.html"[^>]*>.*?</a>','',html,flags=re.S)
    html=html.replace('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css','js/vendor/leaflet/leaflet.css').replace('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','js/vendor/leaflet/leaflet.js')
    html=re.sub(r'<script src="js/navigation/offline.js[^"]*"></script>','',html)
    html=html.replace('<script src="js/navigation/app.js?v=0.10.2"></script>','<script src="js/navigation/snapshot-mark-symbols.js"></script><script src="nmea-core.js"></script><script src="native-bridge.js"></script><script src="js/navigation/app.js?v=ipad-0.1"></script>')
    html=html.replace('Online sea marks','Saved sea marks · 7 October 2026')
    html=html.replace('Map tiles and AIS require internet.','Charts are installed locally. Internet AIS and weather requests require enabling online services in Connections.')
    html=html.replace('Map tiles still need internet.','Charts are installed locally.')
    html=html.replace('Online map only; keep the page open for GPS recording.','Charts are local; foreground position recording only.')
    (web/'navigation.html').write_text(html)
    for p in (app/'Web').glob('*.js'):shutil.copy2(p,web/p.name)
    # Adapt existing navigation code only in the generated native app, not the public website.
    p=web/'js/navigation/app.js';s=p.read_text()
    s=s.replace("function startGPS(){","function startGPS(){if(window.HelmloreNative){window.HelmloreNative.send('gps.start');return;}",1)
    s=s.replace("function resetSource(mode){state.epoch++;","function resetSource(mode){if(window.HelmloreNative&&mode!=='gps')window.HelmloreNative.send('gps.stop');state.epoch++;",1)
    s=s.replace("}).addTo(map);\n seamarks=L.tileLayer", "});if(!window.HelmloreNative)base.addTo(map);\n seamarks=L.tileLayer",1)
    s=s.replace("}).addTo(map);\n L.control.scale", "});if(!window.HelmloreNative)seamarks.addTo(map);\n L.control.scale",1)
    s=s.replace("$('seamarksToggle').onchange=e=>{if(e.target.checked)seamarks.addTo(map);else map.removeLayer(seamarks);};", "$('seamarksToggle').onchange=e=>{if(window.HelmloreNative)return;if(e.target.checked)seamarks.addTo(map);else map.removeLayer(seamarks);};")
    s=s.replace("function download(data,name){", "function download(data,name){if(window.HelmloreNative){window.HelmloreNative.send('export',{filename:name,text:data});return;}",1)
    s=s.replace("window.dispatchEvent(new CustomEvent(\"navigation-map-ready\"", "window.addEventListener('helmlore-native-source',e=>{resetSource(e.detail.source==='none'?'explore':'gps');status(e.detail.source==='gateway'?'Gateway GNSS selected · waiting for fresh RMC':e.detail.source==='device'?'iPad position selected':'Position stopped');});window.addEventListener('helmlore-native-fix',e=>{if(state.mode==='gps')updateFix(e.detail);});\n window.dispatchEvent(new CustomEvent(\"navigation-map-ready\"",1)
    s=s.replace("$('accuracy').textContent=p?(", "$('accuracy').textContent=p?.source==='gateway'?(stale()?'OLD gateway fix':'Gateway GNSS · accuracy not supplied'):p?(",1)
    s=s.replace("Online map · sea-mark coverage varies by area", "Local reviewed chart · saved sea marks")
    p.write_text(s)
    p=web/'js/navigation/core.js';s=p.read_text();s=s.replace("if(fix.accuracy>100)","if(fix.source==='gateway')return {speed:speed===null?null:knots(speed),course:speed===null||speed<0.3?null:course,estimated:false};\n  if(fix.accuracy>100)",1);p.write_text(s)
    p=web/'js/navigation/logbook-core.js';s=p.read_text().replace("Number.isFinite(f.accuracy)&&f.accuracy>=0&&f.accuracy<=100", "((f.source==='gateway'&&f.accuracy===null)||(Number.isFinite(f.accuracy)&&f.accuracy>=0&&f.accuracy<=100))");p.write_text(s)
    # Complete compiled tiles make the app independent of patching an online tile source.
    # The published exact-ID patch is still applied idempotently by the existing renderer.
    manifest=json.loads((web/'data/navigation/master-chart/20261008-reviewed-v2/tile-patches.json').read_text())
    import base64,gzip
    hist=web/'data/navigation/historical-tiles-2011-v1'
    for tile,patch in manifest['patches'].items():
        path=hist/(tile+'.json');payload=json.loads(path.read_text());rows=json.loads(gzip.decompress(base64.b64decode(payload['gzip'])))
        hidden=set(patch['removed_ids']);rows=[r for r in rows if not(r[0]==4 and r[4].get('record_id') in hidden)]
        assert len(rows)==patch['entry']['records']
        payload['gzip']=base64.b64encode(gzip.compress(json.dumps(rows,separators=(',',':')).encode(),mtime=0)).decode();path.write_text(json.dumps(payload,separators=(',',':')))
    make_project(output)
    shutil.copy2(repo/'ios/README.md',output/'README.md')
    files={str(p.relative_to(output)):hashlib.sha256(p.read_bytes()).hexdigest() for p in output.rglob('*') if p.is_file()}
    (output/'FILE_CHECKSUMS.json').write_text(json.dumps(files,indent=2))
    return {'files':len(files),'reviewed_tiles':len(json.loads((hist/'index.json').read_text())['cells']),'changed_tiles':len(manifest['patches']),'web_bytes':sum(p.stat().st_size for p in web.rglob('*') if p.is_file())}


def make_project(root):
    # Standard PBX project: five Swift source files plus a blue-folder resource reference.
    sources=sorted((root/'HelmlorePlotter/Sources').glob('*.swift'))
    refs=[];builds=[];children=[];sourceids=[]
    for i,p in enumerate(sources):
        ref=f'{100+i:024X}';bid=f'{200+i:024X}';children.append(ref);sourceids.append(bid)
        refs.append(f'{ref} = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = "{p.name}"; sourceTree = "<group>"; }};')
        builds.append(f'{bid} = {{isa = PBXBuildFile; fileRef = {ref}; }};')
    ids=lambda v:', '.join(v)+','
    text='''// !$*UTF8*$!
{ archiveVersion = 1; classes = {}; objectVersion = 56; objects = {
REFS
BUILDS
000000000000000000000001 = {isa = PBXProject; attributes = {LastUpgradeCheck = 1600; }; buildConfigurationList = 000000000000000000000010; compatibilityVersion = "Xcode 14.0"; developmentRegion = en; knownRegions = (en, Base); mainGroup = 000000000000000000000002; productRefGroup = 000000000000000000000003; projectDirPath = ""; projectRoot = ""; targets = (000000000000000000000004,); };
000000000000000000000002 = {isa = PBXGroup; children = (000000000000000000000005,000000000000000000000006,000000000000000000000003,); sourceTree = "<group>"; };
000000000000000000000003 = {isa = PBXGroup; children = (000000000000000000000007,); name = Products; sourceTree = "<group>"; };
000000000000000000000004 = {isa = PBXNativeTarget; buildConfigurationList = 000000000000000000000011; buildPhases = (000000000000000000000008,000000000000000000000009,); buildRules = (); dependencies = (); name = HelmlorePlotter; productName = HelmlorePlotter; productReference = 000000000000000000000007; productType = "com.apple.product-type.application"; };
000000000000000000000005 = {isa = PBXGroup; children = (CHILDREN); path = HelmlorePlotter/Sources; sourceTree = "<group>"; };
000000000000000000000006 = {isa = PBXFileReference; lastKnownFileType = folder; name = AppWeb; path = HelmlorePlotter/AppWeb; sourceTree = "<group>"; };
000000000000000000000007 = {isa = PBXFileReference; explicitFileType = wrapper.application; path = HelmlorePlotter.app; sourceTree = BUILT_PRODUCTS_DIR; };
000000000000000000000008 = {isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = (SOURCES); runOnlyForDeploymentPostprocessing = 0; };
000000000000000000000009 = {isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = (000000000000000000000012,); runOnlyForDeploymentPostprocessing = 0; };
000000000000000000000012 = {isa = PBXBuildFile; fileRef = 000000000000000000000006; };
000000000000000000000010 = {isa = XCConfigurationList; buildConfigurations = (000000000000000000000013,000000000000000000000014,); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; };
000000000000000000000011 = {isa = XCConfigurationList; buildConfigurations = (000000000000000000000015,000000000000000000000016,); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; };
000000000000000000000013 = {isa = XCBuildConfiguration; buildSettings = {SDKROOT = iphoneos; IPHONEOS_DEPLOYMENT_TARGET = 17.0; CLANG_ENABLE_MODULES = YES; }; name = Debug; };
000000000000000000000014 = {isa = XCBuildConfiguration; buildSettings = {SDKROOT = iphoneos; IPHONEOS_DEPLOYMENT_TARGET = 17.0; CLANG_ENABLE_MODULES = YES; }; name = Release; };
000000000000000000000015 = {isa = XCBuildConfiguration; buildSettings = {SETTINGS SWIFT_OPTIMIZATION_LEVEL = "-Onone"; }; name = Debug; };
000000000000000000000016 = {isa = XCBuildConfiguration; buildSettings = {SETTINGS SWIFT_OPTIMIZATION_LEVEL = "-O"; }; name = Release; };
}; rootObject = 000000000000000000000001; }
'''
    settings='CODE_SIGN_STYLE = Automatic; PRODUCT_BUNDLE_IDENTIFIER = com.helmlore.plotter; PRODUCT_NAME = "$(TARGET_NAME)"; INFOPLIST_FILE = HelmlorePlotter/Info.plist; SWIFT_VERSION = 5.0; TARGETED_DEVICE_FAMILY = 2; IPHONEOS_DEPLOYMENT_TARGET = 17.0; SUPPORTED_PLATFORMS = "iphoneos iphonesimulator"; SWIFT_STRICT_CONCURRENCY = minimal;'
    for k,v in [('REFS','\n'.join(refs)),('BUILDS','\n'.join(builds)),('CHILDREN',ids(children)),('SOURCES',ids(sourceids)),('SETTINGS',settings)]:text=text.replace(k,v)
    project=root/'HelmlorePlotter.xcodeproj';project.mkdir();(project/'project.pbxproj').write_text(text)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--repo',default=str(Path(__file__).resolve().parents[2]));p.add_argument('--output',required=True);a=p.parse_args();print(json.dumps(build(a.repo,a.output)))
