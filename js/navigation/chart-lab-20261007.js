/* UK and Ireland online research map; no GPS or account changes. */
async function initialiseReviewedChart(shared){'use strict';
let offlineChart=document.body.dataset.offlineChart==='true';
const $=id=>document.getElementById(id),bounds=[[49,-12],[61,3]];
const map=shared?.map||L.map('map',{minZoom:4,maxZoom:18,zoomAnimation:false,fadeAnimation:false}).fitBounds(bounds);
if(!shared)L.control.scale({imperial:true,metric:true}).addTo(map);
const options={maxZoom:18,maxNativeZoom:14,keepBuffer:0,updateWhenIdle:true,updateWhenZooming:false,noWrap:true};
map.createPane('depthPane');map.getPane('depthPane').style.zIndex=250;map.getPane('depthPane').style.pointerEvents='none';
map.createPane('contourPane');map.getPane('contourPane').style.zIndex=300;map.getPane('contourPane').style.pointerEvents='none';
map.createPane('markPane');map.getPane('markPane').style.zIndex=350;map.getPane('markPane').style.pointerEvents='none';
const base=shared?.base||L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{...options,maxNativeZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors / ODbL</a>'});if(!offlineChart||navigator.onLine){if(!shared||offlineChart)base.addTo(map);}else $('status').textContent='Local chart package · 2011 chart detail and saved 7 October sea marks.';
let baseError=false;
base.on('tileerror',()=>{baseError=true;$('status').textContent='Some online basemap tiles failed. Check your connection.';});
base.on('load',()=>{if(!baseError)$('status').textContent='UK & Ireland basemap loaded · reviewed chart release '+(chartRelease?.id||'baseline')+'. Online basemap and live sea marks require internet.';});
const extent=L.rectangle(bounds,{color:'#176993',weight:2,dashArray:'7 5',fill:false,interactive:false});
$('boundary').onchange=()=>{$('boundary').checked?extent.addTo(map):map.removeLayer(extent);};
$('reset').onclick=()=>{$('region').value='all';map.fitBounds(bounds);};
$('region').onchange=()=>{const p={preston:[53.73,-2.9,11],barrow:[54.062,-3.175,12],whitehaven:[54.54,-3.61,10],irish:[54,-4.8,9],ireland:[53.3,-6.1,9],solent:[50.8,-1.2,10],north:[57,1,8],scotland:[58,-3.5,8]}[$('region').value];if(p)map.setView([p[0],p[1]],p[2]);else map.fitBounds(bounds);};
const marks=shared?.seamarks||L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',{...options,pane:'markPane',attribution:'Sea marks: <a href="https://www.openseamap.org/">OpenSeaMap</a>'});
let markErrors=0;
marks.on('tileerror',()=>{markErrors++;$('marksStatus').textContent='Some sea-mark tiles failed. Missing symbols do not establish clear water.';});
marks.on('loading',()=>{if(!markErrors)$('marksStatus').textContent='Requesting online sea-mark tiles…';});
marks.on('load',()=>{if(!markErrors)$('marksStatus').textContent='Sea-mark tiles loaded. Community coverage varies; zoom in to see available symbols.';});
$('seamarks').onchange=()=>{if(offlineChart){drawSnapshotMarks();return;}markErrors=0;if($('seamarks').checked)marks.addTo(map);else{map.removeLayer(marks);$('marksStatus').textContent='Sea marks hidden.';}};
if(shared){$('seamarks').addEventListener('change',()=>{for(const id of ['seamarksToggle','seaVisible'])$(id).checked=$('seamarks').checked;});$('seamarksToggle').addEventListener('change',()=>{$('seamarks').checked=$('seamarksToggle').checked;$('seamarks').dispatchEvent(new Event('change'));});}
const wms='https://ows.emodnet-bathymetry.eu/wms';
const depths=L.tileLayer.wms(wms,{...options,pane:'depthPane',layers:'emodnet:mean',styles:'atlas_land',format:'image/png',transparent:true,version:'1.1.1',opacity:.45,attribution:'Depths: <a href="https://emodnet.ec.europa.eu/en/bathymetry">EMODnet Bathymetry</a> · research only'});
const contours=L.tileLayer.wms(wms,{...options,pane:'contourPane',layers:'emodnet:contours',format:'image/png',transparent:true,version:'1.1.1',attribution:'Contours: EMODnet Bathymetry'});
let depthFailed=false;
function depthMessage(){if(!depthFailed)$('depthStatus').textContent=$('depths').checked||$('contours').checked?'EMODnet depth tiles loaded. Broad seabed data; not live water depth or verified harbour soundings.':'Depth layers hidden.';}
for(const layer of [depths,contours]){layer.on('loading',()=>{if(!depthFailed)$('depthStatus').textContent='Requesting EMODnet depth tiles…';});layer.on('tileerror',()=>{depthFailed=true;$('depthStatus').textContent='Some depth tiles failed. The missing area has no displayed depth information.';});layer.on('load',depthMessage);}
for(const [id,layer] of [['depths',depths],['contours',contours]]){$(id).onchange=()=>{depthFailed=false;if($(id).checked)layer.addTo(map);else map.removeLayer(layer);depthMessage();};}
map.on('zoomend',()=>{$('zoomStatus').textContent='Display zoom '+map.getZoom()+'. Zooming in does not increase the accuracy of the depth source.';});
if($('depths').checked)depths.addTo(map);if($('contours').checked)contours.addTo(map);if($('seamarks').checked&&!offlineChart)marks.addTo(map);

const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Custom wreck glyph; a display symbol, not an official hazard classification.
const MarineCanvas=L.Canvas.extend({
_updateCircle(layer){
if(!layer.options.wreckSymbol)return L.Canvas.prototype._updateCircle.call(this,layer);
if(!this._drawing||layer._empty())return;
const p=layer._point,ctx=this._ctx;ctx.save();ctx.translate(p.x,p.y);
ctx.beginPath();ctx.moveTo(-7,1);ctx.lineTo(-4,4);ctx.lineTo(-1,3);ctx.lineTo(1,5);ctx.lineTo(5,3);ctx.lineTo(7,0);
ctx.moveTo(-4,0);ctx.lineTo(5,0);ctx.moveTo(0,0);ctx.lineTo(0,-5);ctx.lineTo(4,-3);ctx.moveTo(-6,6);ctx.lineTo(6,-6);
this._fillStroke(ctx,layer);ctx.restore();
}});
const renderer=new MarineCanvas({padding:.1,tolerance:8});
const configs=[
{id:'windareas',label:'Wind farm areas',url:'data/navigation/emodnet-uk-ireland-windfarms-areas-20261007.geojson',color:'#b535a5',zoom:5,source:'EMODnet / CETMAR · CC BY 4.0'},
{id:'windpoints',label:'Wind farm points',url:'data/navigation/emodnet-uk-ireland-windfarms-points-20261007.geojson',color:'#a06a18',zoom:7,source:'EMODnet / CETMAR · CC BY 4.0'},
{id:'wreckpoints',label:'UKHO wreck positions',color:'#b62d45',zoom:9,source:'UK Hydrographic Office · OGL · positions/names only'},
{id:'wreckareas',label:'UKHO wreck areas',color:'#b62d45',zoom:8,source:'UK Hydrographic Office · OGL · positions/names only'},
{id:'ukfibrecables',label:'Fibre cables',color:'#d044a9',zoom:7,source:'EMODnet / Cogea · CC BY 4.0'},
{id:'pipelines',label:'Pipelines',color:'#d044a9',zoom:8,source:'EMODnet / Cogea · CC BY 4.0 · simplified display lines'},
{id:'platforms',label:'Offshore installations',color:'#323d55',zoom:7,source:'EMODnet / Cogea · CC BY 4.0'},
{id:'portlocations',label:'Main ports',color:'#17799a',zoom:6,source:'EMODnet / Eurofish & Cogea · CC BY 4.0'},
{id:'oenergy',label:'Ocean energy sites',color:'#268357',zoom:7,source:'EMODnet / AZTI · CC BY 4.0'},
{id:'oenergytests',label:'Energy test areas',color:'#268357',zoom:6,source:'EMODnet / AZTI · CC BY 4.0'}
];
let managedVersion='20261007-master-v1',chartRelease=null;
try{const response=await fetch('data/navigation/master-chart/published-release.json',{cache:'no-store'});if(!response.ok)throw Error('Master release unavailable');const release=await response.json();if(typeof release.id!=='string'||!release.layers)throw Error('Invalid master release');chartRelease=release;managedVersion=release.id;for(const c of configs){if(['ukfibrecables','platforms','portlocations','oenergy'].includes(c.id)&&typeof release.layers[c.id]==='string'&&release.layers[c.id].startsWith('data/navigation/master-chart/'))c.url=release.layers[c.id];}}catch(e){console.warn('Using saved chart sources: '+e.message);}
function bbox(g){let b=[Infinity,Infinity,-Infinity,-Infinity];function scan(a){if(typeof a[0]==='number'){b[0]=Math.min(b[0],a[0]);b[1]=Math.min(b[1],a[1]);b[2]=Math.max(b[2],a[0]);b[3]=Math.max(b[3],a[1]);}else a.forEach(scan);}if(g)scan(g.coordinates);return b;}
function status(f){const p=f.properties||{};return String(p.status??p.current_status??p.project_status??p.site_status??p.lease_status??'');}
function proposed(f){return /planned|approved|propos|application/i.test(status(f));}
function inactive(f){return /dismant|decomm|abandon|completed|removed|closed|inactive|cancelled|canceled/i.test(status(f));}
function popup(f,c){const p=f.properties||{},name=p.name||p.objnam||p.portname||p.testsite||p.pipe_name||'Unnamed record';const box=document.createElement('div');box.innerHTML='<b>'+escape(name)+'</b><p>'+escape(c.label)+' · '+escape(c.source)+'</p>'+(p.helmlore_id?'<p><b>Helmlore feature:</b> '+escape(p.helmlore_id)+'<br><b>Source record:</b> '+escape(p.source_external_id||'')+'<br><b>Source date:</b> '+escape(p.source_date||'unknown')+'</p>':'')+Object.entries(p).filter(([k,v])=>v!==null&&v!==''&&!/globalid|^fid$|shape_|helmlore_id|source_observation|source_external_id/i.test(k)).slice(0,18).map(([k,v])=>'<div><b>'+escape(k.replaceAll('_',' '))+':</b> '+escape(v)+'</div>').join('')+(c.id.startsWith('wreck')?'<p>No depth or current hazard status supplied by this export.</p>':'')+'<p>Research record; coverage and status may be incomplete.</p>';return box;}
async function redraw(c){
const note=$('note-'+c.id);
if(!$(c.id).checked){if(c.layer)map.removeLayer(c.layer);note.textContent='Hidden';return;}
if(map.getZoom()<c.zoom){if(c.layer)map.removeLayer(c.layer);note.textContent='Zoom in to level '+c.zoom+' to show this layer.';return;}
if(!c.data){if(c.loading)return;c.loading=true;note.textContent='Loading saved data…';try{const r=await fetch((c.url||'data/navigation/collected-20261007/'+c.id+'.geojson')+'?v='+encodeURIComponent(managedVersion));if(!r.ok)throw Error('HTTP '+r.status);const d=await r.json();if(d.type!=='FeatureCollection')throw Error('Invalid dataset');c.data=d.features.map(f=>({f,b:bbox(f.geometry)}));}catch(e){note.textContent='Unavailable: '+e.message;c.loading=false;return;}c.loading=false;return redraw(c);}
if(c.layer){map.removeLayer(c.layer);c.layer.clearLayers();}
const b=map.getBounds(),showPlanned=$('proposals').checked;
const available=c.data.filter(o=>o.b[0]<=b.getEast()&&o.b[2]>=b.getWest()&&o.b[1]<=b.getNorth()&&o.b[3]>=b.getSouth()&&(showPlanned||!proposed(o.f)));
const selected=available.slice(0,1500).map(o=>o.f);
c.layer=L.geoJSON(selected,{renderer,style:f=>({renderer,color:proposed(f)||inactive(f)?'#8b8d94':c.color,weight:c.id==='windareas'?2.2:['pipelines','ukfibrecables'].includes(c.id)?1.4:1.5,opacity:c.id==='windareas'?1:.85,fillOpacity:c.id==='windareas'?0:.09,dashArray:proposed(f)||inactive(f)?'5 5':c.id==='windareas'?'8 4':['pipelines','ukfibrecables'].includes(c.id)?'2 5':null}),pointToLayer:(f,ll)=>L.circleMarker(ll,{renderer,radius:c.id==='wreckpoints'?8:5,wreckSymbol:c.id==='wreckpoints',fill:c.id!=='wreckpoints',color:proposed(f)||inactive(f)?'#8b8d94':c.color,fillColor:c.color,fillOpacity:inactive(f)?.2:.7,weight:c.id==='wreckpoints'?1.4:1}),onEachFeature:(f,l)=>l.bindPopup(()=>popup(f,c),{autoPan:true,maxHeight:180})}).addTo(map);
note.textContent=selected.length+' displayed / '+c.data.length+' saved'+(available.length>1500?' · '+(available.length-1500)+' more nearby; zoom in for detail.':'')+(showPlanned?' · proposals included.':' · known proposals hidden.');
}
for(const c of configs){$(c.id).onchange=()=>redraw(c);}
$('proposals').onchange=()=>configs.forEach(redraw);
let vectorTimer;map.on('moveend',()=>{clearTimeout(vectorTimer);vectorTimer=setTimeout(()=>{if(!document.querySelector('.leaflet-popup'))configs.forEach(redraw);},180);});
configs.forEach(redraw);
map.on('popupclose',()=>{clearTimeout(vectorTimer);vectorTimer=setTimeout(()=>configs.forEach(redraw),180);});

// A source directory, kept separate from chart marks and soundings.
const guideLayer=L.layerGroup(),guideMarkers=new Map();let directory=null;
function openPanel(guides){$('layers-panel').hidden=guides;$('guides-panel').hidden=!guides;$('layers-tab').setAttribute('aria-expanded',String(!guides));$('guides-tab').setAttribute('aria-expanded',String(guides));}
$('layers-tab').onclick=()=>openPanel(false);$('guides-tab').onclick=()=>openPanel(true);
function safeLink(url){try{const u=new URL(url,location.href);return u.protocol==='https:'||u.protocol==='http:'?u.href:'#';}catch{return '#';}}
function showGuide(g,focus=false){openPanel(true);const card=$('guide-card');card.replaceChildren();const box=document.createElement('article');box.className='guide-card';const title=document.createElement('h3');title.textContent=g.name;box.append(title);for(const value of [g.kind,g.detail]){const p=document.createElement('p');p.textContent=value;box.append(p);}for(const source of g.sources){const a=document.createElement('a');a.href=safeLink(source.url);a.textContent=source.title+' ↗';a.target='_blank';a.rel='noopener noreferrer';box.append(a);}const note=document.createElement('p');note.className='small';note.textContent=g.review+'. Map symbol: approximate directory location, not an aid to navigation.';box.append(note);const b=document.createElement('button');b.type='button';b.textContent='Show this area on map';b.onclick=()=>{map.setView(g.centre,11);$('map').scrollIntoView({block:'start',behavior:'auto'});};box.append(b);card.append(box);if(focus)card.scrollIntoView({block:'nearest',behavior:'auto'});}
function renderGuides(){if(!directory)return;const query=$('harbour-search').value.trim().toLocaleLowerCase();const matches=directory.harbours.filter(g=>(g.name+' '+g.area+' '+g.kind).toLocaleLowerCase().includes(query));$('guide-status').textContent=matches.length+' of '+directory.harbours.length+' local source locations'+(matches.length?'':' · Try a harbour or region name.');const list=$('guide-list');list.replaceChildren();for(const g of matches){const b=document.createElement('button');b.type='button';b.className='guide-result';const n=document.createElement('b');n.textContent=g.name;const area=document.createElement('span');area.textContent=g.area+' · '+g.kind;b.append(n,area);b.onclick=()=>showGuide(g,true);list.append(b);}}
$('harbour-search').addEventListener('input',renderGuides);
$('harbourguides').onchange=()=>{$('harbourguides').checked?guideLayer.addTo(map):map.removeLayer(guideLayer);};
const viewIds=['seamarks','depths','contours',...configs.map(c=>c.id)];
const coastal=['seamarks','portlocations'];const infrastructure=['seamarks','windareas','windpoints','ukfibrecables','pipelines','platforms','oenergy','oenergytests','portlocations'];
for(const button of document.querySelectorAll('[data-view]'))button.onclick=()=>{const chosen=button.dataset.view==='coast'?coastal:button.dataset.view==='infrastructure'?infrastructure:viewIds.filter(id=>id!=='contours');for(const id of viewIds){$(id).checked=chosen.includes(id);$(id).dispatchEvent(new Event('change'));}for(const b of document.querySelectorAll('[data-view]'))b.setAttribute('aria-pressed',String(b===button));};
for(const id of viewIds)$(id).addEventListener('change',()=>{for(const b of document.querySelectorAll('[data-view]'))b.setAttribute('aria-pressed','false');});
fetch('data/navigation/pilotage-sources-20261007.json?v=12').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(d=>{if(!Array.isArray(d.harbours)||!Array.isArray(d.regional))throw Error('Invalid directory');directory=d;renderGuides();const icon=L.divIcon({className:'guide-pin',html:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1zM12 6v14" fill="none" stroke="currentColor" stroke-width="2"/></svg>',iconSize:[28,28],iconAnchor:[14,14]});for(const g of d.harbours){const marker=L.marker(g.centre,{icon,title:g.name+' — pilotage sources',alt:g.name+' harbour guide'}).on('click',()=>showGuide(g,true));guideLayer.addLayer(marker);guideMarkers.set(g.id,marker);}if($('harbourguides').checked)guideLayer.addTo(map);const regional=$('regional-guides');for(const g of d.regional){const a=document.createElement('a');a.className='regional-link';a.href=safeLink(g.url);a.target='_blank';a.rel='noopener noreferrer';a.textContent=g.title+' ↗';const p=document.createElement('p');p.className='small';p.textContent=g.edition;regional.append(a,p);}}).catch(e=>{$('guide-status').textContent='Source directory unavailable: '+e.message;});


// Coordinate mentions stay separate from charted aids until independently checked.
let reviewData=null,reviewLayer=L.layerGroup(),reviewTimer;
function reviewPopup(point){
 const root=document.createElement('div');let index=0;
 const body=document.createElement('div'),nav=document.createElement('div');
 const previous=document.createElement('button'),next=document.createElement('button'),count=document.createElement('span');
 previous.textContent='Previous source';next.textContent='Next source';
 function show(){const m=point.mentions[index];body.innerHTML='<b>'+escape(m.name||'Unverified pilotage point')+'</b><p>'+point.coordinates[1].toFixed(6)+', '+point.coordinates[0].toFixed(6)+'</p><p><b>Source date:</b> '+escape(m.date||'Unknown')+'<br>'+escape(m.file)+' · PDF page '+escape(m.page)+'<br><b>Datum:</b> '+escape(m.datum||'Not established')+'</p><p><b>Original position:</b> '+escape(m.raw||'Manual transcription')+'</p><p>'+escape(m.context)+'</p><p><a href="'+escape(safeLink(m.url))+'" target="_blank" rel="noopener noreferrer">Open original source ↗</a></p>';count.textContent=' Source '+(index+1)+' of '+point.mentions.length+' ';previous.disabled=index===0;next.disabled=index===point.mentions.length-1;}
 previous.onclick=()=>{index--;show();};next.onclick=()=>{index++;show();};
 nav.append(previous,count,next);root.append(body,nav);show();return root;
}
function drawReview(){
 reviewLayer.clearLayers();if(!reviewData)return;
 if(!$('pilotreview').checked){map.removeLayer(reviewLayer);$('reviewStatus').textContent='Pilotage review points hidden. '+reviewData.total_positions.toLocaleString()+' positions available.';return;}
 const b=map.getBounds();let visible=0;
 for(const p of reviewData.points){const ll=L.latLng(p.coordinates[1],p.coordinates[0]);if(!b.contains(ll))continue;visible++;L.circleMarker(ll,{renderer,radius:map.getZoom()<7?3:5,color:'#a014a8',fillColor:'#fff',fillOpacity:.65,weight:1.5}).bindPopup(()=>reviewPopup(p),{maxWidth:380,maxHeight:300}).addTo(reviewLayer);}
 reviewLayer.addTo(map);$('reviewStatus').textContent=visible.toLocaleString()+' positions in this view · '+reviewData.total_positions.toLocaleString()+' total · '+reviewData.total_mentions.toLocaleString()+' source mentions. Purple circles are unverified.';
}
$('pilotreview').onchange=drawReview;
map.on('moveend',()=>{clearTimeout(reviewTimer);reviewTimer=setTimeout(()=>{if(!document.querySelector('.leaflet-popup'))drawReview();},180);});
map.on('popupclose',()=>{clearTimeout(reviewTimer);reviewTimer=setTimeout(drawReview,180);});
fetch('data/navigation/research/pilotage-review-points-20261007.json?v=13').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(d=>{if(!Array.isArray(d.points)||d.points.length!==d.total_positions||d.points.reduce((n,p)=>n+p.mentions.length,0)!==d.total_mentions)throw Error('Invalid review dataset');reviewData=d;drawReview();}).catch(e=>{$('reviewStatus').textContent='Pilotage review points unavailable: '+e.message;});


let localMarks=null,localLayer=L.layerGroup(),localTimer;
function localTitle(p){return p.name||({port:'Port-hand',starboard:'Starboard-hand',cardinal_south:'South cardinal',safe_water:'Safe-water',special:'Special-purpose',landmark:'Light landmark'}[p.mark_type]+' '+p.structure);}
function localIcon(p){
 const colour=p.colour==='black'?'#202b35':p.mark_type==='port'?'#dc323e':p.mark_type==='starboard'?'#07894c':'#f2c52a';
 let body;
 if(p.mark_type==='cardinal_south')body='<path d="M7 3h10l-5 6zM7 9h10l-5 6z" fill="#17222b"/><path d="M10 15h4v6h-4z" fill="#e4bd20"/>';
 else if(p.structure==='tower')body='<path d="M8 21l2-15h4l2 15zM9 6V3h6v3z" fill="'+colour+'" stroke="#fff" stroke-width="1.5"/>';
 else if(p.structure==='beacon')body='<path d="M11 9h2v12h-2z" fill="#273747"/><path d="'+(p.mark_type==='starboard'?'M7 9l5-8 5 8z':'M7 2h10v8H7z')+'" fill="'+colour+'" stroke="#fff" stroke-width="1.5"/>';
 else if(p.mark_type==='safe_water')body='<path d="M8 20l1-14h6l1 14z" fill="#fff" stroke="#c52e3b" stroke-width="2"/><path d="M12 6v14" stroke="#c52e3b" stroke-width="2"/><circle cx="12" cy="3" r="2" fill="#c52e3b"/>';
 else if(p.structure==='sphere')body='<circle cx="12" cy="12" r="6" fill="'+colour+'" stroke="#fff" stroke-width="1.5"/>';
 else body='<path d="'+(p.mark_type==='starboard'?'M5 19l7-15 7 15z':'M6 6h12v13H6z')+'" fill="'+colour+'" stroke="#fff" stroke-width="1.5"/>';
 return L.divIcon({className:'local-mark-icon',html:'<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">'+body+'<path d="M3 22h18" stroke="#273747" stroke-width="1.4"/></svg>',iconSize:[24,24],iconAnchor:[12,22],popupAnchor:[0,-22]});
}
function localPopup(f){const p=f.properties;return '<b>'+escape(localTitle(p))+'</b><p>'+escape(p.raw_position)+'</p><p><b>Mark:</b> '+escape(p.mark_type.replaceAll('_',' '))+'<br><b>Structure:</b> '+escape(p.structure)+'<br><b>Colour:</b> '+escape(p.colour||'Not specified in panel')+'<br><b>Light:</b> '+escape(p.light||'Not specified in panel')+'</p><p><b>Reference:</b> '+escape(p.source_file)+'<br>'+escape(p.source)+'<br>'+escape(p.position_status)+'</p><p>Chart edition and datum are not displayed in the supplied panel.</p>';}
function drawLocal(){localLayer.clearLayers();if(!localMarks)return;if(!$('localmarks').checked){map.removeLayer(localLayer);$('localMarkStatus').textContent='Local chartplotter marks hidden · '+localMarks.features.length+' saved.';return;}
 const b=map.getBounds();let visible=0;for(const f of localMarks.features){const ll=L.latLng(f.geometry.coordinates[1],f.geometry.coordinates[0]);if(!b.contains(ll)||window.MarkReview?.hidden(f,'user-local-marks'))continue;visible++;const p=f.properties;const m=map.getZoom()>=9?L.marker(ll,{icon:localIcon(p),title:localTitle(p),alt:localTitle(p)}):L.circleMarker(ll,{renderer,radius:4,color:'#163f58',fillColor:p.mark_type==='port'?'#dc323e':p.mark_type==='starboard'?'#07894c':'#e4bd20',fillOpacity:1,weight:1});m.on('click',()=>window.MarkReview?.select(f,'user-local-marks'));m.bindPopup(()=>localPopup(f),{maxWidth:380,maxHeight:310}).addTo(localLayer);}
 localLayer.addTo(map);$('localMarkStatus').textContent=visible+' local features in view · '+localMarks.features.length+' total. Positions confirmed by you on 7 October 2026. Zoom in for mark symbols.';
}
$('localmarks').onchange=drawLocal;map.on('moveend',()=>{clearTimeout(localTimer);localTimer=setTimeout(()=>{if(!document.querySelector('.leaflet-popup'))drawLocal();},180);});map.on('popupclose',()=>{clearTimeout(localTimer);localTimer=setTimeout(drawLocal,180);});
fetch('data/navigation/user-local-marks-20261007.geojson?v=14').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(d=>{if(d.type!=='FeatureCollection'||d.features.length!==41)throw Error('Invalid local mark data');localMarks=d;drawLocal();}).catch(e=>{$('localMarkStatus').textContent='Local marks unavailable: '+e.message;});

// Separate historical CM93 display. Source values retain their 2011 status.
map.createPane('historyPane');map.getPane('historyPane').style.zIndex=320;const TileCanvas=MarineCanvas.extend({_updatePoly(layer,closed){const clips=layer.options.clipRects;if(!clips||!this._drawing)return MarineCanvas.prototype._updatePoly.call(this,layer,closed);const ctx=this._ctx;ctx.save();ctx.beginPath();for(const b of clips){const a=map.latLngToLayerPoint([b[3],b[0]]),d=map.latLngToLayerPoint([b[1],b[2]]);ctx.rect(a.x,a.y,d.x-a.x,d.y-a.y);}ctx.clip();MarineCanvas.prototype._updatePoly.call(this,layer,closed);ctx.restore();}});const historicalRenderer=new TileCanvas({padding:.1,tolerance:8,pane:'historyPane'});
let historyTiles=new Map(),historyIndex=null,historyGeneration=0,historyTimer,historyLayers=[],historyCache=new Map();
// Reviewed depiction precedence: retain source records, prefer the online mark.
const superseded2011=new Set(['51265e2c8e87:483','55f8599bea1b:565','1dcebc5b4d87:1336','51265e2c8e87:549','55f8599bea1b:621','1dcebc5b4d87:1359']);
try{
const response=await fetch(chartRelease?.depiction_register||'data/navigation/master-chart/mark-suppression-20261008.json?v=1');
if(!response.ok)throw Error('HTTP '+response.status);
const register=await response.json();
if(register.schema!=='helmlore-mark-suppression-v1'||!Array.isArray(register.suppressed_ids)||!register.suppressed_ids.every(id=>typeof id==='string'&&/^[a-f0-9]{12}:\d+$/.test(id)))throw Error('Invalid mark suppression register');
for(const id of register.suppressed_ids)superseded2011.add(id);window.MarkReview?.publishedRetains(register.retained_ids||[],chartRelease?.review_exported_at||'');
}catch(error){console.warn('Mark reconciliation unavailable; retaining historical marks except the reviewed Gut correction.',error);}
const historyIds=['hcoast','hdepthareas','hcontours','hsoundings','hmarks','hhazards'];
const historyScales=['Z','A','B','C','D','E','F','G'];
const historyRoot='data/navigation/historical-tiles-2011-v1/';
let reviewedTileManifest=null;const reviewedBundles=new Map();
if(chartRelease?.reviewed_tiles_root){try{const r=await fetch(chartRelease.reviewed_tiles_manifest);if(!r.ok)throw Error('HTTP '+r.status);const m=await r.json();if(m.schema!=='helmlore-reviewed-tiles-v1'||m.release!==chartRelease.id)throw Error('Invalid compiled tile manifest');reviewedTileManifest=m;}catch(e){$('historyStatus').textContent='Compiled tile patch unavailable; exact shared mark filters remain active.';console.warn(e);}}
async function tilePayload(c){const r=await fetch(historyRoot+c.id+'.json?v=18');if(!r.ok)throw Error(c.cell+' HTTP '+r.status);return r.json();}
function historicalIntersect(a,b){return a[0]<=b[2]&&a[2]>=b[0]&&a[1]<=b[3]&&a[3]>=b[1];}
function unusedHistoricalBox(coords,type){const ps=type==='Point'?[coords]:type==='LineString'?coords:coords.flat();return [ps.reduce((n,p)=>Math.min(n,p[0]),Infinity),ps.reduce((n,p)=>Math.min(n,p[1]),Infinity),ps.reduce((n,p)=>Math.max(n,p[0]),-Infinity),ps.reduce((n,p)=>Math.max(n,p[1]),-Infinity)];}
function historicalBox(coords,type){return bbox({coordinates:coords});}
async function historicalCell(c){if(historyCache.has(c.id)){const v=historyCache.get(c.id);historyCache.delete(c.id);historyCache.set(c.id,v);return v;}const payload=await tilePayload(c);if(typeof DecompressionStream==='undefined')throw Error('This browser needs gzip stream support for historical cells.');const bytes=Uint8Array.from(atob(payload.gzip),x=>x.charCodeAt(0));const content=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();let records=JSON.parse(content);const patch=reviewedTileManifest?.patches[c.id];if(patch){const ids=new Set(patch.removed_ids);records=records.filter(row=>!(row[0]===4&&ids.has(row[4].record_id)));}if(records.length!==c.records)throw Error('Incomplete cell '+c.cell);const features=records.map(row=>{const [layer,cls,type,coords,a]=row;return {type:'Feature',geometry:{type,coordinates:coords},bbox:historicalBox(coords,type),properties:{layer,class:cls,scale:c.scale,cell:c.cell,source_year:2011,...a}};});historyCache.set(c.id,features);while(historyCache.size>48)historyCache.delete(historyCache.keys().next().value);return features;}
function historicalPopup(f){const p=f.properties;let s='<b>'+escape(p.OBJNAM||p.NOBJNM||p.class)+'</b><p>Historical CM93 · 2011<br>Cell '+escape(p.cell)+' · scale '+escape(p.scale)+'</p>';if(f.geometry.type==='Point')s+='<p>'+f.geometry.coordinates[1].toFixed(6)+', '+f.geometry.coordinates[0].toFixed(6)+'</p>';s+='<p>These are historical chart values, not current surveyed positions or live water depth.</p><dl>';for(const [k,v] of Object.entries(p)){if(['layer','class','scale','cell','source_year','record_id'].includes(k))continue;s+='<dt>'+escape(k)+'</dt><dd>'+escape(Array.isArray(v)?v.join(', '):v)+'</dd>';}return s+'</dl>';}
function historicalMark(f,ll){const p=f.properties;if(p.class==='LIGHTS')return L.circleMarker(ll,{renderer:historicalRenderer,radius:4,color:'#94650a',fillColor:'#ffe079',fillOpacity:.9,weight:1.2});if(p.class==='LNDMRK')return L.circleMarker(ll,{renderer:historicalRenderer,radius:4,color:'#4e4b51',fillOpacity:.4,weight:1});const port=p.CATLAM===1,starboard=p.CATLAM===2;const colors={1:'white',2:'black',3:'red',4:'green',6:'yellow'};const raw=p.COLMAR??p.COLOUR;const first=Array.isArray(raw)?raw[0]:raw;const colour=colors[first]|| (port?'red':starboard?'green':'yellow');if(p.class.endsWith('CAR')&&p.CATCAM!==3)return L.circleMarker(ll,{renderer:historicalRenderer,radius:5,color:'#222',fillColor:'#e4c742',fillOpacity:.65,weight:1.5});if(p.class.endsWith('ISD'))return L.circleMarker(ll,{renderer:historicalRenderer,radius:5,color:'#222',fillColor:'#ca3345',fillOpacity:.7,weight:1.5});const kind=p.class.endsWith('LAT')?(port?'port':starboard?'starboard':'special'):p.class.endsWith('CAR')&&p.CATCAM===3?'cardinal_south':p.class.endsWith('SAW')?'safe_water':'special';return L.marker(ll,{icon:localIcon({mark_type:kind,structure:p.class.startsWith('BCN')?'beacon':'buoy',colour}),title:(p.OBJNAM||p.class)+' — historical 2011',alt:(p.OBJNAM||p.class)+' historical 2011',pane:'historyPane',opacity:.65});}
function historicalMatched(f){if(!$('localmarks').checked||!localMarks||!f.properties.OBJNAM||f.geometry.type!=='Point')return false;const name=f.properties.OBJNAM.toLowerCase().replace(/\b(buoy|beacon|light|mark)\b/g,'').replace(/[^a-z0-9]/g,'');return localMarks.features.some(n=>n.properties.name&&n.properties.name.toLowerCase().replace(/\b(buoy|beacon|light|mark)\b/g,'').replace(/[^a-z0-9]/g,'')===name&&L.latLng(f.geometry.coordinates[1],f.geometry.coordinates[0]).distanceTo(L.latLng(n.geometry.coordinates[1],n.geometry.coordinates[0]))<200);}
async function drawHistory(){const generation=++historyGeneration;if(!historyIndex)return;const enabled=historyIds.map(id=>$(id).checked);if(!enabled.some(Boolean)){for(const l of historyLayers)map.removeLayer(l);historyLayers=[];$('historyStatus').textContent='Historical layers hidden. Your newer layers remain available.';return;}const z=map.getZoom(),b=map.getBounds(),box=[b.getWest(),b.getSouth(),b.getEast(),b.getNorth()];const requested=$('historyScale').value==='auto'?(z>=13?'G':z>=12?'F':z>=11?'E':z>=9?'D':z>=8?'C':z>=6?'B':'A'):$('historyScale').value;
const tileZoom=historyIndex.tile_zooms[requested];
function tileXY(lon,lat,level){const n=2**level,r=Math.max(-85,Math.min(85,lat))*Math.PI/180;return [Math.floor((lon+180)/360*n),Math.floor((1-Math.asinh(Math.tan(r))/Math.PI)/2*n)];}
function tileBox(x,y,level){const n=2**level,lat=t=>Math.atan(Math.sinh(Math.PI*(1-2*t/n)))*180/Math.PI;return [x/n*360-180,lat(y+1),(x+1)/n*360-180,lat(y)];}
if(box[2]<-12||box[0]>3||box[3]<49||box[1]>61){for(const l of historyLayers)map.removeLayer(l);historyLayers=[];$('historyStatus').textContent='Outside UK & Ireland tile coverage.';return;}
const nw=tileXY(Math.max(-12,box[0]),Math.min(61,box[3]),tileZoom),se=tileXY(Math.min(3,box[2]),Math.max(49,box[1]),tileZoom);
if((se[0]-nw[0]+1)*(se[1]-nw[1]+1)>64){$('historyStatus').textContent='Choose a broader chart scale or zoom in to load fewer tiles.';return;}
const grouped=new Map();let broader=0;
for(let x=nw[0];x<=se[0];x++)for(let y=nw[1];y<=se[1];y++)for(let layer=0;layer<6;layer++){
 if(!enabled[layer])continue;let c=null;
 for(let si=historyScales.indexOf(requested);si>0;si--){const scale=historyScales[si],level=historyIndex.tile_zooms[scale];if(level===undefined)continue;const d=tileZoom-level,id=level+'/'+Math.floor(x/2**d)+'/'+Math.floor(y/2**d),candidate=historyTiles.get(id);if(candidate&&(candidate.layer_mask&(1<<layer))){c=candidate;break;}}
 if(!c)continue;if(c.scale!==requested)broader++;
 if(!grouped.has(c.id))grouped.set(c.id,{cell:c,clipsByLayer:Array.from({length:6},()=>[])});grouped.get(c.id).clipsByLayer[layer].push(tileBox(x,y,tileZoom));
}
const cells=[...grouped.values()];if(cells.reduce((n,c)=>n+c.cell.expanded_bytes,0)>40000000){$('historyStatus').textContent='This tile view is too detailed; zoom in or select a broader scale.';return;}
$('historyStatus').textContent='Loading '+cells.length+' individual chart tiles…';
try{let all=[],cursor=0;const result=new Array(cells.length);
await Promise.all(Array.from({length:Math.min(4,cells.length)},async()=>{while(cursor<cells.length){const i=cursor++,c=cells[i];if(generation!==historyGeneration)return;const fs=await historicalCell(c.cell);result[i]=fs.filter(f=>c.clipsByLayer[f.properties.layer].length&&(f.geometry.type!=='Point'||c.clipsByLayer[f.properties.layer].some(b=>f.geometry.coordinates[0]>=b[0]&&f.geometry.coordinates[0]<=b[2]&&f.geometry.coordinates[1]>=b[1]&&f.geometry.coordinates[1]<=b[3]))).map(f=>({...f,clipRects:c.clipsByLayer[f.properties.layer]}));}}));
if(generation!==historyGeneration)return;for(const fs of result)if(fs)all=all.concat(fs);
if(generation!==historyGeneration)return;window.MarkReview?.visible(all.filter(f=>f.properties.layer===4&&f.geometry.type==='Point'&&historicalIntersect(f.bbox,box)),map,localMarks);const visible=all.filter(f=>enabled[f.properties.layer]&&historicalIntersect(f.bbox,box));let omitted=0,matched=0,superseded=0;const budgets=[1500,1500,1500,2000,1500,1000],counts=[0,0,0,0,0,0],chosen=[];for(const f of visible){if(f.properties.layer===4&&$('seamarks').checked&&superseded2011.has(f.properties.record_id)){superseded++;continue;}if(f.properties.layer===4&&window.MarkReview?.hidden(f,'cm93-2011'))continue;if(f.properties.layer===4&&historicalMatched(f)){matched++;continue;}if(f.properties.layer===3&&z<12){omitted++;continue;}if(counts[f.properties.layer]>=budgets[f.properties.layer]){omitted++;continue;}counts[f.properties.layer]++;chosen.push(f);}for(const l of historyLayers)map.removeLayer(l);historyLayers=[];let labels=new Set();for(let group=0;group<6;group++){const selected=chosen.filter(f=>f.properties.layer===group);if(!selected.length)continue;const layer=L.geoJSON(selected,{renderer:historicalRenderer,style:f=>{if(group===3)return {opacity:0,fillOpacity:0,weight:0};const depth=f.properties.DRVAL1;return {clipRects:f.clipRects,renderer:historicalRenderer,color:group===0?'#6a715e':group===1?'#7cb1c5':group===2?'#528ca8':'#6e5483',weight:group===0?(f.geometry.type.includes('Polygon')?0:1):group===1?0:group===2?.8:1,fillColor:group===0?'#eee6cb':Number.isFinite(depth)&&depth<2?'#bddbcf':Number.isFinite(depth)&&depth<5?'#b0d4e8':Number.isFinite(depth)&&depth<10?'#d3e7ef':'#f4f8f9',fillOpacity:group===0?1:group===1?.38:.08,opacity:.7};},pointToLayer:(f,ll)=>{if(group===4)return historicalMark(f,ll);const m=L.circleMarker(ll,{renderer:historicalRenderer,radius:group===3?4:6,opacity:group===3?0:1,color:group===5?'#865b73':'#3f6078',fillOpacity:group===3?0:group===5?.5:.7,weight:1,wreckSymbol:f.properties.class==='WRECKS'});if(group===3){const p=map.latLngToContainerPoint(ll),key=Math.floor(p.x/44)+','+Math.floor(p.y/28);if(!labels.has(key)&&labels.size<250){labels.add(key);const depth=f.properties.depth_m;if(Number.isFinite(depth)){const text=String(depth),parts=text.split('.');m.bindTooltip(escape(parts[0])+(parts[1]?'<sub>'+escape(parts[1])+'</sub>':''),{permanent:true,direction:'center',className:'historic-sounding'+(depth<=3?' shallow':'')});}}}return m;},onEachFeature:(f,l)=>{if(f.clipRects&&l._containsPoint){const contains=l._containsPoint;l._containsPoint=function(p){const ll=map.layerPointToLatLng(p);return f.clipRects.some(b=>ll.lng>=b[0]&&ll.lng<=b[2]&&ll.lat>=b[1]&&ll.lat<=b[3])&&contains.call(this,p);};}if(f.properties.layer===4)l.on('click',()=>window.MarkReview?.select(f,'cm93-2011'));l.bindPopup(()=>historicalPopup(f),{maxHeight:260,maxWidth:370});}}).addTo(map);historyLayers.push(layer);}$('historyStatus').textContent=chosen.length.toLocaleString()+' historical features displayed · '+cells.length+' XYZ tiles · requested '+requested+' · 2011 source'+(reviewedTileManifest?' · compiled release '+reviewedTileManifest.release:'')+'.'+(broader?' '+broader+' layer sections use broader source tiles.':'')+(omitted?' '+omitted.toLocaleString()+' additional records held back at this view; zoom in for soundings/detail.':'')+(superseded?' '+superseded+' superseded 2011 mark/light record(s) hidden beneath the online layer.':'')+(matched?' '+matched+' old named marks matched to your newer positions and hidden.':'');}catch(e){if(generation===historyGeneration)$('historyStatus').textContent='Historical layer unavailable: '+e.message;}}
for(const id of historyIds)$(id).addEventListener('change',drawHistory);$('historyScale').onchange=drawHistory;map.on('moveend',()=>{clearTimeout(historyTimer);historyTimer=setTimeout(()=>{if(!document.querySelector('.leaflet-popup'))drawHistory();},250);});map.on('popupclose',()=>{clearTimeout(historyTimer);historyTimer=setTimeout(drawHistory,250);});fetch(historyRoot+'index.json?v=18').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(d=>{if(reviewedTileManifest){d.cells=d.cells.map(c=>reviewedTileManifest.patches[c.id]?.entry||c);}historyIndex=d;historyTiles=new Map(d.cells.map(c=>[c.id,c]));drawHistory();}).catch(e=>{$('historyStatus').textContent='Historical index unavailable: '+e.message;});

$('seamarks').addEventListener('change',()=>{map.closePopup();drawHistory();});
window.addEventListener('mark-corrections-changed',()=>{map.closePopup();drawLocal();drawHistory();});

// The download package uses the frozen source snapshot, never a network seamark tile request.
let snapshotData=null,snapshotLoading=false,snapshotAudit=null;const snapshotMarkers=new Map();const snapshotLayer=L.layerGroup([],{attribution:'Saved sea marks © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> / <a href="https://www.openseamap.org/">OpenSeaMap</a>'});
async function drawSnapshotMarks(){if(!offlineChart)return;if(!$('seamarks').checked){map.removeLayer(snapshotLayer);$('marksStatus').textContent='Saved sea marks hidden.';return;}if(!snapshotData){if(snapshotLoading)return;snapshotLoading=true;try{const r=await fetch((chartRelease?.reviewed_tiles_root||'data/navigation/master-chart/20261008-reviewed-v2/')+'online-seamarks.json');if(!r.ok)throw Error('HTTP '+r.status);let d=await r.json();if(d.gzip){const bytes=Uint8Array.from(atob(d.gzip),x=>x.charCodeAt(0));d=JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());}if(d.type!=='FeatureCollection')throw Error('Invalid saved sea marks');snapshotData=d.features;snapshotAudit=window.HelmloreMarkDataAudit(snapshotData);}catch(e){$('marksStatus').textContent='Saved sea marks unavailable: '+e.message;snapshotLoading=false;return;}snapshotLoading=false;}const b=map.getBounds().pad(.15),z=map.getZoom();
const fs=snapshotData.filter(f=>f.geometry.type==='Point'&&b.contains([f.geometry.coordinates[1],f.geometry.coordinates[0]]));
// Always allocate navigation marks first. Turbine density must not displace channel marks.
const priority=f=>/^(buoy_|beacon_|light_)/.test(f.properties['seamark:type']||'')?0:window.HelmloreIsTurbine(f)?2:1;fs.sort((a,b)=>priority(a)-priority(b));
const wanted=new Set(),turbineCells=new Set();let count=0;
for(const f of fs){const p=f.properties,t=p['seamark:type'],ll=[f.geometry.coordinates[1],f.geometry.coordinates[0]];
if(window.HelmloreIsTurbine(f)&&z<14){const pt=map.project(ll,z),cell=Math.floor(pt.x/48)+','+Math.floor(pt.y/48);if(turbineCells.has(cell))continue;turbineCells.add(cell);}
if(count>=1500)break;const key=String(f.id||ll.join(',')+':'+t);wanted.add(key);
let marker=snapshotMarkers.get(key);
if(!marker){const icon=L.divIcon({className:'snapshot-mark',html:window.HelmloreMarkSymbol(f),iconSize:window.HelmloreIsTurbine(f)?[18,22]:[26,32],iconAnchor:window.HelmloreIsTurbine(f)?[9,19]:[13,27]});
marker=L.marker(ll,{icon,title:p['seamark:name']||t||'Sea mark',pane:'markPane'}).bindPopup(()=>'<b>'+escape(p['seamark:name']||t||'Sea mark')+'</b>'+(/^(light_minor|light_major)$/.test(t)&&p.man_made!=='lighthouse'?'<p><b>Light record:</b> a physical buoy/beacon type is not supplied unless listed below. Light colour alone does not establish a lateral mark.</p>':'')+'<p>Saved OpenSeaMap snapshot · '+escape(chartRelease?.reviewed_mark_counts?.online_snapshot_date||'2026-10-07')+'</p><p>'+escape(f.id)+'</p><pre>'+escape(JSON.stringify(p,null,2))+'</pre>',{maxHeight:220});snapshotMarkers.set(key,marker);marker.addTo(snapshotLayer);}count++;}
for(const [key,marker] of snapshotMarkers)if(!wanted.has(key)){snapshotLayer.removeLayer(marker);snapshotMarkers.delete(key);}
snapshotLayer.addTo(map);$('marksStatus').textContent=count+' saved sea marks shown / '+snapshotData.length+' points · snapshot '+(chartRelease?.reviewed_mark_counts?.online_snapshot_date||'2026-10-07')+(fs.length>1500?' · zoom in for further marks':'')+(snapshotAudit?' · '+snapshotAudit.lightOnly+' light-only source records need physical mark classification':'');}
const portLabels=L.layerGroup();let portLabelsLoaded=false;
async function showSavedPortLabels(){if(portLabelsLoaded)return;portLabelsLoaded=true;try{const response=await fetch(chartRelease?.layers?.portlocations||'data/navigation/master-chart/current-v1/portlocations.geojson');if(!response.ok)throw Error('Ports unavailable');const data=await response.json();for(const f of data.features){if(f.geometry.type!=='Point')continue;const p=f.properties,name=p.portname||p.port;if(!name)continue;L.circleMarker([f.geometry.coordinates[1],f.geometry.coordinates[0]],{renderer,radius:2,color:'#385667',interactive:false}).bindTooltip(escape(name),{permanent:true,direction:'right',className:'saved-port-label'}).addTo(portLabels);}portLabels.addTo(map);}catch(e){portLabelsLoaded=false;console.warn(e);}}
window.addEventListener('offline',()=>{if(offlineChart)map.removeLayer(base);});
window.addEventListener('online',()=>{if(offlineChart)base.addTo(map);});
window.addEventListener('navigation-saved-chart',()=>{offlineChart=true;if(!navigator.onLine)map.removeLayer(base);else base.addTo(map);map.removeLayer(marks);map.getPane('markPane').style.pointerEvents='auto';map.off('moveend',drawSnapshotMarks);map.on('moveend',drawSnapshotMarks);showSavedPortLabels();drawSnapshotMarks();});
offlineChart=document.body.dataset.offlineChart==='true';if(offlineChart){if(!navigator.onLine)map.removeLayer(base);else base.addTo(map);map.removeLayer(marks);map.getPane('markPane').style.pointerEvents='auto';map.on('moveend',drawSnapshotMarks);showSavedPortLabels();drawSnapshotMarks();}

}
if(document.body.dataset.navigationChart==='true'){window.addEventListener('navigation-map-ready',e=>initialiseReviewedChart(e.detail).catch(error=>{document.getElementById('historyStatus').textContent='Reviewed chart could not load: '+error.message;console.error(error);}),{once:true});}else initialiseReviewedChart();
