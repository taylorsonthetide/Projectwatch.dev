/* UK and Ireland online research map; no GPS or account changes. */
(()=>{'use strict';
const $=id=>document.getElementById(id),bounds=[[49,-12],[61,3]];
const map=L.map('map',{minZoom:4,maxZoom:14,zoomAnimation:false,fadeAnimation:false}).fitBounds(bounds);
L.control.scale({imperial:true,metric:true}).addTo(map);
const options={maxZoom:14,keepBuffer:0,updateWhenIdle:true,updateWhenZooming:false,noWrap:true};
map.createPane('depthPane');map.getPane('depthPane').style.zIndex=250;map.getPane('depthPane').style.pointerEvents='none';
map.createPane('contourPane');map.getPane('contourPane').style.zIndex=300;map.getPane('contourPane').style.pointerEvents='none';
map.createPane('markPane');map.getPane('markPane').style.zIndex=400;
const base=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{...options,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors / ODbL</a>'}).addTo(map);
let baseError=false;
base.on('tileerror',()=>{baseError=true;$('status').textContent='Some online basemap tiles failed. Check your connection.';});
base.on('load',()=>{if(!baseError)$('status').textContent='UK & Ireland online basemap loaded. These layers are not an offline chart pack.';});
const extent=L.rectangle(bounds,{color:'#176993',weight:2,dashArray:'7 5',fill:false,interactive:false});
$('boundary').onchange=()=>{$('boundary').checked?extent.addTo(map):map.removeLayer(extent);};
$('reset').onclick=()=>map.fitBounds(bounds);
const marks=L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',{...options,pane:'markPane',attribution:'Sea marks: <a href="https://www.openseamap.org/">OpenSeaMap</a>'});
let markErrors=0;
marks.on('tileerror',()=>{markErrors++;$('marksStatus').textContent='Some sea-mark tiles failed. Missing symbols do not establish clear water.';});
marks.on('loading',()=>{if(!markErrors)$('marksStatus').textContent='Requesting online sea-mark tiles…';});
marks.on('load',()=>{if(!markErrors)$('marksStatus').textContent='Sea-mark tiles loaded. Community coverage varies; zoom in to see available symbols.';});
$('seamarks').onchange=()=>{markErrors=0;if($('seamarks').checked)marks.addTo(map);else{map.removeLayer(marks);$('marksStatus').textContent='Sea marks hidden.';}};
const wms='https://ows.emodnet-bathymetry.eu/wms';
const depths=L.tileLayer.wms(wms,{...options,pane:'depthPane',layers:'emodnet:mean_multicolour',format:'image/png',transparent:true,version:'1.1.1',opacity:.78,attribution:'Depths: <a href="https://emodnet.ec.europa.eu/en/bathymetry">EMODnet Bathymetry</a> · research only'});
const contours=L.tileLayer.wms(wms,{...options,pane:'contourPane',layers:'emodnet:contours',format:'image/png',transparent:true,version:'1.1.1',attribution:'Contours: EMODnet Bathymetry'});
let depthFailed=false;
function depthMessage(){if(!depthFailed)$('depthStatus').textContent=$('depths').checked||$('contours').checked?'EMODnet depth tiles loaded. Broad seabed data; not live water depth or verified harbour soundings.':'Depth layers hidden.';}
for(const layer of [depths,contours]){layer.on('loading',()=>{if(!depthFailed)$('depthStatus').textContent='Requesting EMODnet depth tiles…';});layer.on('tileerror',()=>{depthFailed=true;$('depthStatus').textContent='Some depth tiles failed. The missing area has no displayed depth information.';});layer.on('load',depthMessage);}
for(const [id,layer] of [['depths',depths],['contours',contours]]){$(id).onchange=()=>{depthFailed=false;if($(id).checked)layer.addTo(map);else map.removeLayer(layer);depthMessage();};}
map.on('zoomend',()=>{$('zoomStatus').textContent='Display zoom '+map.getZoom()+'. Zooming in does not increase the accuracy of the depth source.';});
if($('depths').checked)depths.addTo(map);if($('contours').checked)contours.addTo(map);if($('seamarks').checked)marks.addTo(map);
})();
