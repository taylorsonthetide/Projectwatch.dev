/* UK and Ireland online research map; no GPS or account changes. */
(()=>{'use strict';
const $=id=>document.getElementById(id),bounds=[[49,-12],[61,3]];
const map=L.map('map',{minZoom:4,maxZoom:14,zoomAnimation:false,fadeAnimation:false}).fitBounds(bounds);
L.control.scale({imperial:true,metric:true}).addTo(map);
const options={maxZoom:14,keepBuffer:0,updateWhenIdle:true,updateWhenZooming:false,noWrap:true};
map.createPane('depthPane');map.getPane('depthPane').style.zIndex=250;map.getPane('depthPane').style.pointerEvents='none';
map.createPane('contourPane');map.getPane('contourPane').style.zIndex=300;map.getPane('contourPane').style.pointerEvents='none';
map.createPane('markPane');map.getPane('markPane').style.zIndex=350;map.getPane('markPane').style.pointerEvents='none';
const base=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{...options,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors / ODbL</a>'}).addTo(map);
let baseError=false;
base.on('tileerror',()=>{baseError=true;$('status').textContent='Some online basemap tiles failed. Check your connection.';});
base.on('load',()=>{if(!baseError)$('status').textContent='UK & Ireland online basemap loaded. These layers are not an offline chart pack.';});
const extent=L.rectangle(bounds,{color:'#176993',weight:2,dashArray:'7 5',fill:false,interactive:false});
$('boundary').onchange=()=>{$('boundary').checked?extent.addTo(map):map.removeLayer(extent);};
$('reset').onclick=()=>{$('region').value='all';map.fitBounds(bounds);};
$('region').onchange=()=>{const p={irish:[54,-4.8,9],ireland:[53.3,-6.1,9],solent:[50.8,-1.2,10],north:[57,1,8],scotland:[58,-3.5,8]}[$('region').value];if(p)map.setView([p[0],p[1]],p[2]);else map.fitBounds(bounds);};
const marks=L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',{...options,pane:'markPane',attribution:'Sea marks: <a href="https://www.openseamap.org/">OpenSeaMap</a>'});
let markErrors=0;
marks.on('tileerror',()=>{markErrors++;$('marksStatus').textContent='Some sea-mark tiles failed. Missing symbols do not establish clear water.';});
marks.on('loading',()=>{if(!markErrors)$('marksStatus').textContent='Requesting online sea-mark tiles…';});
marks.on('load',()=>{if(!markErrors)$('marksStatus').textContent='Sea-mark tiles loaded. Community coverage varies; zoom in to see available symbols.';});
$('seamarks').onchange=()=>{markErrors=0;if($('seamarks').checked)marks.addTo(map);else{map.removeLayer(marks);$('marksStatus').textContent='Sea marks hidden.';}};
const wms='https://ows.emodnet-bathymetry.eu/wms';
const depths=L.tileLayer.wms(wms,{...options,pane:'depthPane',layers:'emodnet:mean',styles:'atlas_land',format:'image/png',transparent:true,version:'1.1.1',opacity:.45,attribution:'Depths: <a href="https://emodnet.ec.europa.eu/en/bathymetry">EMODnet Bathymetry</a> · research only'});
const contours=L.tileLayer.wms(wms,{...options,pane:'contourPane',layers:'emodnet:contours',format:'image/png',transparent:true,version:'1.1.1',attribution:'Contours: EMODnet Bathymetry'});
let depthFailed=false;
function depthMessage(){if(!depthFailed)$('depthStatus').textContent=$('depths').checked||$('contours').checked?'EMODnet depth tiles loaded. Broad seabed data; not live water depth or verified harbour soundings.':'Depth layers hidden.';}
for(const layer of [depths,contours]){layer.on('loading',()=>{if(!depthFailed)$('depthStatus').textContent='Requesting EMODnet depth tiles…';});layer.on('tileerror',()=>{depthFailed=true;$('depthStatus').textContent='Some depth tiles failed. The missing area has no displayed depth information.';});layer.on('load',depthMessage);}
for(const [id,layer] of [['depths',depths],['contours',contours]]){$(id).onchange=()=>{depthFailed=false;if($(id).checked)layer.addTo(map);else map.removeLayer(layer);depthMessage();};}
map.on('zoomend',()=>{$('zoomStatus').textContent='Display zoom '+map.getZoom()+'. Zooming in does not increase the accuracy of the depth source.';});
if($('depths').checked)depths.addTo(map);if($('contours').checked)contours.addTo(map);if($('seamarks').checked)marks.addTo(map);

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
{id:'windareas',label:'Wind farm areas',url:'data/navigation/emodnet-uk-ireland-windfarms-areas-20261007.geojson',color:'#a06a18',zoom:5,source:'EMODnet / CETMAR · CC BY 4.0'},
{id:'windpoints',label:'Wind farm points',url:'data/navigation/emodnet-uk-ireland-windfarms-points-20261007.geojson',color:'#a06a18',zoom:7,source:'EMODnet / CETMAR · CC BY 4.0'},
{id:'wreckpoints',label:'UKHO wreck positions',color:'#b62d45',zoom:9,source:'UK Hydrographic Office · OGL · positions/names only'},
{id:'wreckareas',label:'UKHO wreck areas',color:'#b62d45',zoom:8,source:'UK Hydrographic Office · OGL · positions/names only'},
{id:'ukfibrecables',label:'Fibre cables',color:'#8a4bb5',zoom:7,source:'EMODnet / Cogea · CC BY 4.0'},
{id:'pipelines',label:'Pipelines',color:'#955b36',zoom:8,source:'EMODnet / Cogea · CC BY 4.0 · simplified display lines'},
{id:'platforms',label:'Offshore installations',color:'#323d55',zoom:7,source:'EMODnet / Cogea · CC BY 4.0'},
{id:'portlocations',label:'Main ports',color:'#17799a',zoom:6,source:'EMODnet / Eurofish & Cogea · CC BY 4.0'},
{id:'oenergy',label:'Ocean energy sites',color:'#268357',zoom:7,source:'EMODnet / AZTI · CC BY 4.0'},
{id:'oenergytests',label:'Energy test areas',color:'#268357',zoom:6,source:'EMODnet / AZTI · CC BY 4.0'}
];
function bbox(g){let b=[Infinity,Infinity,-Infinity,-Infinity];function scan(a){if(typeof a[0]==='number'){b[0]=Math.min(b[0],a[0]);b[1]=Math.min(b[1],a[1]);b[2]=Math.max(b[2],a[0]);b[3]=Math.max(b[3],a[1]);}else a.forEach(scan);}if(g)scan(g.coordinates);return b;}
function status(f){const p=f.properties||{};return String(p.status??p.current_status??p.project_status??p.site_status??p.lease_status??'');}
function proposed(f){return /planned|approved|propos|application/i.test(status(f));}
function inactive(f){return /dismant|decomm|abandon|completed|removed|closed|inactive/i.test(status(f));}
function popup(f,c){const p=f.properties||{},name=p.name||p.objnam||p.portname||p.testsite||p.pipe_name||'Unnamed record';const box=document.createElement('div');box.innerHTML='<b>'+escape(name)+'</b><p>'+escape(c.label)+' · '+escape(c.source)+'</p>'+Object.entries(p).filter(([k,v])=>v!==null&&v!==''&&!/globalid|^fid$|shape_/i.test(k)).slice(0,18).map(([k,v])=>'<div><b>'+escape(k.replaceAll('_',' '))+':</b> '+escape(v)+'</div>').join('')+(c.id.startsWith('wreck')?'<p>No depth or current hazard status supplied by this export.</p>':'')+'<p>Research record; coverage and status may be incomplete.</p>';return box;}
async function redraw(c){
const note=$('note-'+c.id);
if(!$(c.id).checked){if(c.layer)map.removeLayer(c.layer);note.textContent='Hidden';return;}
if(map.getZoom()<c.zoom){if(c.layer)map.removeLayer(c.layer);note.textContent='Zoom in to level '+c.zoom+' to show this layer.';return;}
if(!c.data){if(c.loading)return;c.loading=true;note.textContent='Loading saved data…';try{const r=await fetch((c.url||'data/navigation/collected-20261007/'+c.id+'.geojson')+'?v=20261007-full');if(!r.ok)throw Error('HTTP '+r.status);const d=await r.json();if(d.type!=='FeatureCollection')throw Error('Invalid dataset');c.data=d.features.map(f=>({f,b:bbox(f.geometry)}));}catch(e){note.textContent='Unavailable: '+e.message;c.loading=false;return;}c.loading=false;return redraw(c);}
if(c.layer){map.removeLayer(c.layer);c.layer.clearLayers();}
const b=map.getBounds(),showPlanned=$('proposals').checked;
const available=c.data.filter(o=>o.b[0]<=b.getEast()&&o.b[2]>=b.getWest()&&o.b[1]<=b.getNorth()&&o.b[3]>=b.getSouth()&&(showPlanned||!proposed(o.f)));
const selected=available.slice(0,1500).map(o=>o.f);
c.layer=L.geoJSON(selected,{renderer,style:f=>({renderer,color:proposed(f)||inactive(f)?'#8b8d94':c.color,weight:1.5,opacity:.85,fillOpacity:.09,dashArray:proposed(f)||inactive(f)?'5 5':null}),pointToLayer:(f,ll)=>L.circleMarker(ll,{renderer,radius:c.id==='wreckpoints'?8:5,wreckSymbol:c.id==='wreckpoints',fill:c.id!=='wreckpoints',color:proposed(f)||inactive(f)?'#8b8d94':c.color,fillColor:c.color,fillOpacity:inactive(f)?.2:.7,weight:c.id==='wreckpoints'?1.4:1}),onEachFeature:(f,l)=>l.bindPopup(()=>popup(f,c),{autoPan:true,maxHeight:180})}).addTo(map);
note.textContent=selected.length+' displayed / '+c.data.length+' saved'+(available.length>1500?' · '+(available.length-1500)+' more nearby; zoom in for detail.':'')+(showPlanned?' · proposals included.':' · known proposals hidden.');
}
for(const c of configs){$(c.id).onchange=()=>redraw(c);}
$('proposals').onchange=()=>configs.forEach(redraw);
let vectorTimer;map.on('moveend',()=>{clearTimeout(vectorTimer);vectorTimer=setTimeout(()=>{if(!document.querySelector('.leaflet-popup'))configs.forEach(redraw);},180);});
configs.forEach(redraw);
map.on('popupclose',()=>{clearTimeout(vectorTimer);vectorTimer=setTimeout(()=>configs.forEach(redraw),180);});

})();
