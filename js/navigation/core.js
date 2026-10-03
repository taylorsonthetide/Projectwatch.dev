/* Helmlore navigation prototype: calculations use true bearings and nautical miles. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HelmloreNav=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const rad=x=>x*Math.PI/180,deg=x=>x*180/Math.PI,R=6371008.8;
 const wrap=x=>((x%360)+360)%360;
 function valid(p){return p&&Number.isFinite(p.lat)&&Math.abs(p.lat)<=90&&Number.isFinite(p.lon)&&Math.abs(p.lon)<=180;}
 function distance(a,b){const dl=rad(b.lat-a.lat),dn=rad(b.lon-a.lon),h=Math.sin(dl/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dn/2)**2;return R*2*Math.atan2(Math.sqrt(Math.min(1,h)),Math.sqrt(Math.max(0,1-h)));}
 function bearing(a,b){const p=rad(a.lat),q=rad(b.lat),l=rad(b.lon-a.lon);return wrap(deg(Math.atan2(Math.sin(l)*Math.cos(q),Math.cos(p)*Math.sin(q)-Math.sin(p)*Math.cos(q)*Math.cos(l))));}
 function destination(a,course,metres){const d=metres/R,t=rad(course),p=rad(a.lat),l=rad(a.lon),q=Math.asin(Math.sin(p)*Math.cos(d)+Math.cos(p)*Math.sin(d)*Math.cos(t)),n=l+Math.atan2(Math.sin(t)*Math.sin(d)*Math.cos(p),Math.cos(d)-Math.sin(p)*Math.sin(q));return {lat:deg(q),lon:((deg(n)+540)%360)-180};}
 const knots=mps=>mps*3600/1852;
 function motion(fix,previous){let speed=Number.isFinite(fix.speed)&&fix.speed>=0?fix.speed:null,course=Number.isFinite(fix.heading)&&fix.heading>=0?wrap(fix.heading):null,estimated=false;
  if(fix.accuracy>100)return {speed:null,course:null,estimated:false};
  if(speed===null&&previous&&previous.accuracy<=100){const dt=(fix.time-previous.time)/1000,d=distance(previous,fix),noise=Math.max(3,fix.accuracy,previous.accuracy);if(dt>=2&&dt<=30&&d>noise){speed=d/dt;course=bearing(previous,fix);estimated=true;}}
  if(speed===null||speed<0.3)course=null;
  return {speed:speed===null?null:knots(speed),course,estimated};
 }
 function coordinate(n,lat){let a=Math.abs(n),d=Math.floor(a),m=(a-d)*60;if(m>=59.9995){d++;m=0;}return `${String(d).padStart(lat?2:3,'0')}° ${m.toFixed(3).padStart(6,'0')}′ ${lat?(n<0?'S':'N'):(n<0?'W':'E')}`;}
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 function gpx(points,type,name){const rows=points.map(p=>`<${type==='route'?'rtept':'trkpt'} lat="${p.lat.toFixed(7)}" lon="${p.lon.toFixed(7)}">${p.name?'<name>'+escape(p.name)+'</name>':''}${p.time?'<time>'+new Date(p.time).toISOString()+'</time>':''}</${type==='route'?'rtept':'trkpt'}>`).join('\n');return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Helmlore prototype" xmlns="http://www.topografix.com/GPX/1/1"><${type==='route'?'rte':'trk'}><name>${escape(name)}</name>${type==='route'?rows:points.reduce((groups,p)=>{let g=groups[groups.length-1];if(!g||g.segment!==p.segment){g={segment:p.segment,points:[]};groups.push(g);}g.points.push(p);return groups;},[]).map(g=>'<trkseg>'+g.points.map(p=>`<trkpt lat="${p.lat.toFixed(7)}" lon="${p.lon.toFixed(7)}"><time>${new Date(p.time).toISOString()}</time></trkpt>`).join('\n')+'</trkseg>').join('\n')}</${type==='route'?'rte':'trk'}></gpx>`;}
 return {valid,distance,bearing,destination,knots,motion,coordinate,gpx};
});
