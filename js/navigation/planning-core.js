/* Vessel settings and manual passage calculations; no chart-depth inference. */
(function(root,factory){const n=typeof module==='object'&&module.exports?require('./core.js'):root.HelmloreNav;const api=factory(n);if(typeof module==='object'&&module.exports)module.exports=api;else root.HelmlorePlanning=api;})(typeof globalThis!=='undefined'?globalThis:this,function(N){
'use strict';
const PROFILE='helmlore-vessel-v1',DRAFT='helmlore-plan-draft-v1',ACTIVE='helmlore-confirmed-plan-v1';
function profile(raw){const p={name:String(raw.name||'').trim().slice(0,80),draught:Number(raw.draught),cruise:Number(raw.cruise),maximum:raw.maximum===''||raw.maximum==null?null:Number(raw.maximum),shallow:Number(raw.shallow)};
if(!p.name)throw Error('Enter your vessel name.');
if(raw.draught===''||!Number.isFinite(p.draught)||p.draught<=0||p.draught>30)throw Error('Draught must be greater than 0 and at most 30 metres.');
if(raw.cruise===''||!Number.isFinite(p.cruise)||p.cruise<=0||p.cruise>100)throw Error('Cruising speed must be greater than 0 and at most 100 knots.');
if(p.maximum!==null&&(!Number.isFinite(p.maximum)||p.maximum<p.cruise||p.maximum>100))throw Error('Maximum speed must be at least cruising speed and at most 100 knots.');
if(raw.shallow===''||!Number.isFinite(p.shallow)||p.shallow<p.draught||p.shallow>100)throw Error('Shallow-water threshold must be at least your draught and at most 100 metres.');return p;}
function points(raw){if(!Array.isArray(raw)||raw.length>100||!raw.every(N.valid))throw Error('Invalid route: use up to 100 valid positions.');return raw.map((p,i)=>({lat:p.lat,lon:p.lon,name:String(p.name||'Waypoint '+(i+1)).slice(0,80),locked:!!p.locked}));}
function summary(raw,speed){const p=points(raw),legs=p.slice(1).map((to,i)=>({from:p[i],to,nm:N.distance(p[i],to)/1852,bearing:N.bearing(p[i],to)}));const nm=legs.reduce((sum,l)=>sum+l.nm,0);return{legs,nm,hours:Number.isFinite(speed)&&speed>0?nm/speed:null};}
function insert(raw,leg,p){const route=points(raw);if(route.length>=100)throw Error('Maximum 100 waypoints.');if(!N.valid(p)||!Number.isInteger(leg)||leg<0||leg>=route.length-1)throw Error('Choose a route leg.');route.splice(leg+1,0,{lat:p.lat,lon:p.lon,name:'Waypoint '+(leg+2),locked:false});return route;}
function move(raw,i,p){const route=points(raw);if(!route[i]||route[i].locked)throw Error('Unlock this waypoint before moving it.');if(!N.valid(p))throw Error('Invalid position.');route[i]={...route[i],lat:p.lat,lon:p.lon};return route;}
function confirmed(raw){const p=points(raw.points);if(p.length<2)throw Error('Choose a start and destination.');const vessel=profile(raw.vessel);if(summary(p,vessel.cruise).nm<0.001)throw Error('Start and destination must be different positions.');return{id:String(raw.id||Date.now()),name:String(raw.name||'Planned passage').slice(0,80),points:p,vessel,confirmedAt:Date.now(),checkedForSafeWater:false};}
function duration(hours){if(hours===null)return '—';const minutes=Math.round(hours*60);return Math.floor(minutes/60)+'h '+String(minutes%60).padStart(2,'0')+'m';}
return{PROFILE,DRAFT,ACTIVE,profile,points,summary,insert,move,confirmed,duration};
});
