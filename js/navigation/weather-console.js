/* One shared dock for navigation and directly accessible weather switches. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.HelmloreWeatherConsole=api;root.addEventListener('navigation-map-ready',()=>api.start(root,document));}})(typeof window==='object'?window:globalThis,()=>{'use strict';
function extents(dock,width,height){return {top:dock==='top'?height:0,bottom:dock==='bottom'?height:0,left:dock==='left'?width:0,right:dock==='right'?width:0};}
function start(win,doc){const $=id=>doc.getElementById(id),ids=['windLayer','currentLayer','waveLayer','tideLayer'],key='helmlore-weather-controls-v1';let preferred={};try{preferred=JSON.parse(win.localStorage.getItem(key)||'{}')||{};}catch{}
const persist=()=>{const p={collapsed:$('weatherLayerControls').hidden};for(const id of ids)p[id]=$(id).checked;try{win.localStorage.setItem(key,JSON.stringify(p));}catch{}};
const sync=()=>{for(const id of ids){const on=$(id).checked,b=$(id+'Button');b.setAttribute('aria-pressed',String(on));b.querySelector('small').textContent=on?'On':'Off';}};
const measure=()=>{const r=$('navigationConsole').getBoundingClientRect(),offset=extents(doc.body.dataset.dock,r.width,r.height);for(const [edge,value] of Object.entries(offset))doc.body.style.setProperty('--bar-'+edge,Math.ceil(value)+'px');doc.body.style.setProperty('--timeline-height',$('weatherTimeline').hidden?'0px':Math.ceil($('weatherTimeline').getBoundingClientRect().height)+'px');};
const collapsed=value=>{$('weatherLayerControls').hidden=value;$('weatherControlsToggle').setAttribute('aria-expanded',String(!value));$('weatherControlsToggle').textContent=value?'Show controls':'Hide controls';if(value){$('weatherSymbolKey').hidden=true;$('weatherKeyToggle').setAttribute('aria-expanded','false');}measure();persist();};
for(const id of ids){if(typeof preferred[id]==='boolean')$(id).checked=preferred[id];$(id+'Button').onclick=()=>{$(id).checked=!$(id).checked;$(id).dispatchEvent(new win.Event('change'));};$(id).addEventListener('change',()=>{sync();persist();});}
$('clearWeatherLayers').onclick=()=>{ids.forEach(id=>$(id).checked=false);$(ids[0]).dispatchEvent(new win.Event('change'));if(!$('weatherTimeline').hidden)$('closeWeatherTimeline').click();$('weatherSymbolKey').hidden=true;$('weatherKeyToggle').setAttribute('aria-expanded','false');measure();};
$('weatherControlsToggle').onclick=()=>collapsed(!$('weatherLayerControls').hidden);
$('weatherKeyToggle').onclick=()=>{const show=$('weatherSymbolKey').hidden;$('weatherSymbolKey').hidden=!show;$('weatherKeyToggle').setAttribute('aria-expanded',String(show));measure();};
collapsed(preferred.collapsed===true);sync();$(ids[0]).dispatchEvent(new win.Event('change'));
win.addEventListener('navigation-dock-changed',measure);win.addEventListener('resize',measure);win.visualViewport?.addEventListener('resize',measure);
if(win.ResizeObserver){const observer=new win.ResizeObserver(measure);observer.observe($('navigationConsole'));observer.observe($('weatherTimeline'));}
if(win.MutationObserver){new win.MutationObserver(measure).observe($('weatherTimeline'),{attributes:true,attributeFilter:['hidden']});}
measure();return {measure,sync};}
return {extents,start};});
