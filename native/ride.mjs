// Linear deep-water encounter kinematics, not a vessel-motion/RAO model.
export const G=9.80665, KNOT=.514444;
const optional=(raw,key,min,max)=>{const v=raw[key];if(v===undefined||v===null||v==='')return null;const n=Number(v);if(!Number.isFinite(n)||n<min||n>max)throw Error('Check ride setting: '+key);return n;};
export function rideProfile(raw){
 const p={rideEnabled:raw.rideEnabled===true||raw.rideEnabled==='on',hullType:['displacement','semi-displacement','planing','multihull','other'].includes(raw.hullType)?raw.hullType:'other',boatLength:optional(raw,'boatLength',1,400),rideHeading:optional(raw,'rideHeading',0,359.9),minSpeed:optional(raw,'minSpeed',0,100)??3,maxSpeed:optional(raw,'maxSpeed',0,100)??8,preferredEncounter:optional(raw,'preferredEncounter',1,30),rollPeriod:optional(raw,'rollPeriod',1,30)};
 if(p.minSpeed>=p.maxSpeed||p.maxSpeed-p.minSpeed>40)throw Error('Choose a ride speed range with maximum above minimum (up to 40 knots wide)');
 if(p.rideEnabled&&(p.boatLength===null||p.rideHeading===null))throw Error('Enter waterline length and a heading for the ride comparison');return p;
}
export function encounter(period,speed,heading,direction){
 if(![period,speed,heading,direction].every(Number.isFinite)||period<=0||speed<0)return null;
 const angle=Math.abs(((direction-heading+540)%360)-180),cos=Math.cos(angle*Math.PI/180),wavelength=G*period**2/(2*Math.PI),celerity=wavelength/period,relative=celerity+speed*KNOT*cos;
 return {angle,wavelength,celerity,period:Math.abs(relative)<1e-6?null:wavelength/Math.abs(relative),overtaking:relative<0,matching:Math.abs(relative)<1e-6};
}
export function compareRide(waves,p,{blocked=false}={}){
 if(!p?.rideEnabled)return {status:'disabled',rows:[],recommendation:null};
 if(!Number.isFinite(p.boatLength)||!Number.isFinite(p.rideHeading))return {status:'setup',rows:[],recommendation:null};
 if(!waves||![waves.height,waves.period,waves.direction].every(Number.isFinite)||waves.height<0||waves.period<=0)return {status:'missing',rows:[],recommendation:null};
 const base=encounter(waves.period,0,p.rideHeading,waves.direction),rows=[];
 for(let speed=p.minSpeed;speed<p.maxSpeed+1e-7;speed+=.5)rows.push(row(Math.min(speed,p.maxSpeed)));
 if(Math.abs(rows.at(-1).speed-p.maxSpeed)>1e-7)rows.push(row(p.maxSpeed));
 function row(speed){const e=encounter(waves.period,speed,p.rideHeading,waves.direction),resonance=p.rollPeriod!==null&&e.period!==null&&[p.rollPeriod,p.rollPeriod/2].some(t=>Math.abs(e.period-t)/t<.15);return {speed,...e,resonance};}
 let recommendation=null,reason='Enter a personally observed comfortable encounter period to compare speeds with that rhythm.';
 if(blocked)reason='No speed suggestion: forecast is incomplete, stale or outside your personal limits.';
 else if(waves.height<.1)reason='Waves are too small for a useful rhythm-based speed suggestion.';
 else if(base.angle>=80)reason='Speed matching is withheld for beam and following seas; roll and steering response need vessel-specific assessment.';
 else if(p.preferredEncounter!==null){const ranked=rows.filter(r=>r.period!==null&&!r.resonance).sort((a,b)=>Math.abs(a.period-p.preferredEncounter)-Math.abs(b.period-p.preferredEncounter));const best=ranked[0];if(best&&Math.abs(best.period-p.preferredEncounter)<=.15){recommendation=best;reason='Closest match to your saved comfortable wave rhythm, on this heading. This is not a predicted smoothest or safe speed.';}else reason='Your saved comfortable rhythm cannot be matched in this speed range without a possible roll-period conflict.';}
 return {status:'ready',rows,recommendation,reason,angle:base.angle,wavelength:base.wavelength,lengthRatio:base.wavelength/p.boatLength,heightRatio:waves.height/p.boatLength,steepness:waves.height/base.wavelength};
}
