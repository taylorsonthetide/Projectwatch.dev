/* Independent data prototype; no GPS, accounts or training-state changes. */
(async()=>{'use strict';
const $=id=>document.getElementById(id),bounds=[[54.4,-3.75],[54.75,-3.35]];
const map=L.map('map',{minZoom:9,maxZoom:19}).fitBounds(bounds);
L.control.scale({imperial:true,metric:true}).addTo(map);
const extent=L.rectangle(bounds,{color:'#176993',weight:2,dashArray:'7 5',fill:false,interactive:false}).addTo(map);
$('boundary').onchange=()=>{$('boundary').checked?extent.addTo(map):map.removeLayer(extent);};
$('reset').onclick=()=>map.fitBounds(bounds);
const marks=L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',{maxZoom:18,attribution:'Sea marks: <a href="https://www.openseamap.org/">OpenSeaMap</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors / ODbL</a>'});
let markErrors=0;
marks.on('tileerror',()=>{markErrors++;$('marksStatus').textContent='Some sea-mark tiles failed to load. Missing symbols do not establish clear water.';});
marks.on('loading',()=>{if(!markErrors)$('marksStatus').textContent='Requesting online sea-mark tiles…';});
marks.on('load',()=>{if(!markErrors)$('marksStatus').textContent='Online sea-mark tiles loaded. Symbols and coverage are community data, not verified chart coverage.';});
$('seamarks').onchange=()=>{markErrors=0;if($('seamarks').checked)marks.addTo(map);else{map.removeLayer(marks);$('marksStatus').textContent='Sea marks hidden. This overlay needs an internet connection.';}};
map.on('zoomend',()=>{$('zoomStatus').textContent=map.getZoom()>14?'Display zoom '+map.getZoom()+': enlarged source data; no additional stored detail beyond zoom 14.':'Source detail extends to zoom 14. Display zoom '+map.getZoom()+'.';});
try{
const response=await fetch('data/navigation/whitehaven.pmtiles');if(!response.ok)throw Error('Basemap download returned '+response.status);
const blob=await response.blob();if(blob.size!==3457012)throw Error('Incomplete basemap');
const digest=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()),hash=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
if(hash!=='9a48396384e4e21628254e4785814981a7c07116ce392f77e5b25a85ad4a2c1f')throw Error('Basemap integrity mismatch');
const pm=new pmtiles.PMTiles(new pmtiles.FileSource(new File([blob],'whitehaven.pmtiles')));
const header=await pm.getHeader();if(header.tileType!==1||header.maxZoom!==14)throw Error('Unexpected basemap format');
protomapsL.leafletLayer({url:pm,flavor:'light',lang:'en',maxDataZoom:14,levelDiff:0,maxZoom:19,noWrap:true,bounds,attribution:'<a href="https://protomaps.com/">Protomaps</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors / ODbL</a> · build 2026-10-03'}).addTo(map);
extent.bringToFront();$('status').textContent='Whitehaven basemap loaded and integrity checked.';
}catch(e){$('status').textContent='Basemap unavailable: '+e.message+'. No chart coverage is displayed.';}
})();
