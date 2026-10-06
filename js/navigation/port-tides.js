/* Selected UK major ports and tidal-network locations, not a live station feed.
 * Harbour-area coordinates are display anchors, not approach waypoints.
 * Catalogue: https://ntslf.org/tides/uk-network ; coordinates rounded from
 * UK network site information / GLOSS UK 2001 report. Whitehaven included
 * explicitly for local use (54 33.18 N, 003 35.82 W). */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HelmlorePortTides=api;})(typeof window==='object'?window:globalThis,()=>{'use strict';
const catalogue=[
['Whitehaven',54.553,-3.597],['Workington',54.651,-3.566],['Heysham',54.032,-2.920],['Liverpool',53.450,-3.018],['Holyhead',53.309,-4.631],['Fishguard',52.013,-4.983],['Milford Haven',51.707,-5.051],['Mumbles',51.570,-3.974],['Newport',51.550,-2.986],['Portbury',51.500,-2.729],['Plymouth (Devonport)',50.368,-4.184],['Newlyn',50.102,-5.542],['Portsmouth',50.800,-1.110],['Weymouth',50.608,-2.446],['Newhaven',50.781,.059],['Dover',51.114,1.324],['Harwich',51.948,1.291],['Sheerness',51.445,.745],['Lowestoft',52.472,1.751],['Immingham',53.633,-.187],['Whitby',54.490,-.613],['North Shields',55.007,-1.438],['Leith',55.990,-3.181],['Aberdeen',57.144,-2.079],['Wick',58.441,-3.085],['Lerwick',60.154,-1.138],['Stornoway',58.208,-6.388],['Ullapool',57.895,-5.157],['Portpatrick',54.842,-5.119],['Bangor',54.665,-5.669],['Portrush',55.200,-6.667],['Port Erin',54.085,-4.767],['St Helier',49.183,-2.117]
].map(([name,lat,lon])=>({id:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),name,lat,lon}));
function select(b){return catalogue.filter(p=>p.lat>=b.south&&p.lat<=b.north&&p.lon>=b.west&&p.lon<=b.east);}
function valid(p){const m=p?.model;return catalogue.some(c=>c.id===p?.id&&c.lat===p.lat&&c.lon===p.lon&&c.name===p.name)&&(!m||(Number.isFinite(m.latitude)&&Number.isFinite(m.longitude)&&Array.isArray(m.hourly?.time)&&m.hourly.time.length>=2&&m.hourly.time.length<=100&&m.hourly.time.every((t,i,a)=>Number.isFinite(t)&&(!i||t>a[i-1]))&&Array.isArray(m.hourly.sea_level_height_msl)&&m.hourly.sea_level_height_msl.length===m.hourly.time.length));}
function attach(ports,rows){return ports.map((p,i)=>{const item={...p,model:rows?.length===ports.length?rows[i]:null};return valid(item)?item:{...p,model:null};});}
function state(m,t){const ts=m?.hourly?.time,vs=m?.hourly?.sea_level_height_msl,i=ts?.indexOf(t);if(!(i>=0)||!Number.isFinite(vs?.[i]))return null;const height=vs[i],before=vs[i-1],after=vs[i+1],change=Number.isFinite(after)?after-height:Number.isFinite(before)?height-before:null;
// Local predicted low/high bracket: surrounding turning points, with a
// twelve-hour window fallback at the edges of the downloaded forecast.
const extrema=[];for(let j=Math.max(1,i-18);j<Math.min(vs.length-1,i+19);j++){if([vs[j-1],vs[j],vs[j+1]].every(Number.isFinite)&&((vs[j]>=vs[j-1]&&vs[j]>vs[j+1])||(vs[j]<=vs[j-1]&&vs[j]<vs[j+1])))extrema.push(j);}
const a=extrema.filter(j=>j<=i).at(-1),b=extrema.find(j=>j>=i);let range=a!==undefined&&b!==undefined&&a!==b?[vs[a],vs[b]]:vs.slice(Math.max(0,i-6),Math.min(vs.length,i+7)).filter(Number.isFinite);range.push(height);const low=Math.min(...range),high=Math.max(...range),fill=high-low>.05?Math.max(0,Math.min(1,(height-low)/(high-low))):null;
return {height,low,high,fill,label:change===null?'State unavailable':Math.abs(change)<.03?'Turning':change>0?'Rising':'Falling',symbol:change===null?'?':Math.abs(change)<.03?'↔':change>0?'↑':'↓'};}
return {catalogue,select,valid,attach,state};});
