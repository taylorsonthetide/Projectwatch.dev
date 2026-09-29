/* Independent invariants for the projection and short-leg navigation model. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const c={window:{},document:{readyState:'loading',addEventListener(){}},localStorage:{getItem(){return null}},console};
vm.createContext(c);
for(const f of ['libraries/project-watch/chartwork-1.96.0.js','js/chartwork-1.96.0.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);
const m=c.window.PW_CHARTWORK_MATH,data=c.window.PW_CHARTWORK,P={lat:50+4/60,lon:-4-10/60};
const near=(a,b,t=1e-10)=>assert(Math.abs(a-b)<t,`${a} differs from ${b}`);
for(let lat=50;lat<=50+10/60;lat+=.01)for(let lon=-4-20/60;lon<=-4;lon+=.015){const p=m.project(lat,lon),back=m.unproject(p.x,p.y);near(back.lat,lat);near(back.lon,lon)}
const north=m.advance(P.lat,P.lon,0,1),south=m.advance(P.lat,P.lon,180,1),east=m.advance(P.lat,P.lon,90,3),west=m.advance(P.lat,P.lon,270,3);
near(north.lat,P.lat+1/60);near(south.lat,P.lat-1/60);near(north.lon,P.lon);near(east.lat,P.lat);near(east.lon-P.lon,3/(60*Math.cos(P.lat*Math.PI/180)));near(east.lon-P.lon,P.lon-west.lon);near(m.distance(P,east),3,1e-8);
const ep=m.advance(east.lat,east.lon,0,1);near(ep.lat,50+5/60);near(ep.lon,east.lon);
assert.equal(m.coords(P),'50°04.000′ N, 004°10.000′ W');assert.match(m.coords(east),/004°05\.326′ W/);assert.equal(m.coords({lat:49.99999999,lon:0}),'50°00.000′ N, 000°00.000′ E');
// Independent course-to-steer vector: 6 kn with 2 kn north, no leeway.
const heading=Math.PI/2+Math.asin(2/6);near(6*Math.cos(heading)+2,0);near(6*Math.sin(heading),Math.sqrt(32));near(heading*180/Math.PI,109.471220634,1e-8);
assert.equal(data.lessons.length,12);assert.equal(data.beginner.length,4);assert.equal(data.practice.length,4);assert.equal(new Set(data.lessons.map(l=>l.id)).size,12);
for(const q of data.quiz){assert.equal(q[1].length,3);assert(q[2]>=0&&q[2]<3);assert(q[3].length>20)}
for(const l of [...data.lessons,...data.beginner])assert(fs.existsSync(path.join(root,'assets/chartwork',l.art+'.svg')));
const meta=JSON.parse(fs.readFileSync(path.join(root,'assets/chartwork/chart-metadata.json')));near(m.project(meta.bounds.south,meta.bounds.east).y,meta.panel.y+meta.panel.height,1e-8);
console.log('PASS: Mercator round trips, cardinal runs, DR/EP, coordinates, current vector and lesson assets.');
