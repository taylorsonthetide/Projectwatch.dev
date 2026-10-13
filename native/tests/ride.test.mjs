import test from 'node:test';
import assert from 'node:assert/strict';
import {encounter,rideProfile,compareRide,G,KNOT} from '../ride.mjs';
import {profile} from '../forecast.mjs';
const wave={height:1,period:6,direction:0};
const settings=(extra={})=>rideProfile({rideEnabled:true,boatLength:12,rideHeading:0,minSpeed:3,maxSpeed:8,...extra});
test('Deep-water encounter periods shorten ahead, remain unchanged abeam and lengthen astern; bearings wrap',()=>{
 assert.ok(encounter(6,7,0,0).period<6);
 assert.ok(Math.abs(encounter(6,7,0,90).period-6)<1e-10);
 assert.ok(encounter(6,7,0,180).period>6);
 assert.equal(encounter(6,7,359,1).angle,2);
 const c=G*6/(2*Math.PI)/KNOT;
 assert.equal(encounter(6,c,0,180).matching,true);
 assert.equal(encounter(6,c,0,180).period,null);
 assert.equal(encounter(6,c+1,0,180).overtaking,true);
});
test('Profiles preserve existing saved limits and support all hull types without invented response coefficients',()=>{
 const old=profile({name:'Boat',waveLimit:2,periodLimit:5,windForce:5});assert.equal(old.rideEnabled,false);assert.equal(old.boatLength,null);
 for(const hullType of ['displacement','semi-displacement','planing','multihull','other']){const p=settings({hullType});assert.equal(p.hullType,hullType);assert.equal(compareRide(wave,p).rows[0].period,compareRide(wave,settings()).rows[0].period);}
 assert.throws(()=>settings({boatLength:''}),/waterline/);assert.throws(()=>settings({rideHeading:''}),/heading/);assert.throws(()=>settings({minSpeed:9,maxSpeed:8}),/range/);assert.throws(()=>settings({rideHeading:360}),/rideHeading/);
 assert.equal(settings({hullType:'planing',minSpeed:20,maxSpeed:45}).maxSpeed,45);
});
test('Suggestions require actual saved rhythm and close match; missing, stale/above-limit, beam/following and roll conflicts withhold them',()=>{
 const target=encounter(6,5,0,0).period,p=settings({preferredEncounter:target});
 assert.equal(compareRide(wave,p).recommendation.speed,5);
 assert.equal(compareRide(wave,settings()).recommendation,null);
 assert.equal(compareRide(wave,p,{blocked:true}).recommendation,null);
 assert.equal(compareRide(null,p).status,'missing');assert.equal(compareRide({...wave,period:0},p).status,'missing');
 for(const direction of [90,180])assert.equal(compareRide({...wave,direction},p).recommendation,null);
 assert.equal(compareRide(wave,settings({preferredEncounter:20})).recommendation,null);
 const conflict=compareRide(wave,settings({preferredEncounter:target,rollPeriod:target}));assert.equal(conflict.recommendation,null);assert.ok(conflict.rows.some(r=>r.resonance));
 assert.equal(compareRide({...wave,height:.01},p).recommendation,null);
});
test('Vessel length and wave height change geometry, not fabricated motion, and arbitrary range endpoints are retained',()=>{
 const a=compareRide(wave,settings()),b=compareRide({...wave,height:2},settings({boatLength:24}));assert.equal(a.lengthRatio,2*b.lengthRatio);assert.equal(a.heightRatio,b.heightRatio);assert.equal(b.steepness,2*a.steepness);
 const rows=compareRide(wave,settings({minSpeed:3.2,maxSpeed:5.3})).rows;assert.equal(rows[0].speed,3.2);assert.equal(rows.at(-1).speed,5.3);
});
