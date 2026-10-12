const jobs=new Map();let sequence=0;
const worker=new Worker(new URL('./chart-worker.js',import.meta.url));
worker.onmessage=({data:m})=>{const job=jobs.get(m.id);if(!job)return;jobs.delete(m.id);clearTimeout(job.timer);m.error?job.reject(Error(m.error)):job.resolve(m.result);};
worker.onerror=e=>{for(const job of jobs.values()){clearTimeout(job.timer);job.reject(Error(e.message||'Chart worker failed'));}jobs.clear();};
function job(type,data,transfer=[]){return new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>{jobs.delete(id);reject(Error('Chart processing timed out'));},60000);jobs.set(id,{resolve,reject,timer});worker.postMessage({id,type,...data},transfer);});}
async function load(name){const r=await fetch(new URL(name,import.meta.url));if(!r.ok)throw Error(name+' unavailable');return (await WebAssembly.instantiate(await r.arrayBuffer())).instance.exports;}
const [chart,weather]=await Promise.all([load('chart.wasm'),load('weather.wasm')]);
const chartCache='helmlore-native-tiles-v1';
let currentFrame=null,currentMode=null;
export const Native={
 async decode(cell,payload,patch){return job('decode',{cell,payload,patch});},
 async filter(features,enabled,view){const out=[];for(let offset=0;offset<features.length;offset+=60000){const chunk=features.slice(offset,offset+60000),boxes=new Float64Array(chunk.length*6);chunk.forEach((f,i)=>{boxes.set([...f.bbox,f.properties.layer,0],i*6);});const indices=await job('filter',{count:chunk.length,boxes,view,mask:enabled.reduce((m,on,i)=>m|(on?1<<i:0),0)},[boxes.buffer]);for(const i of indices)out.push(chunk[i]);}return out;},
 async tile(url,signal){const cache=await caches.open(chartCache),key=new URL(url,document.baseURI);key.search='';const old=await cache.match(key);if(old)return old.json();const r=await fetch(url,{signal});if(!r.ok)throw Error('Chart tile HTTP '+r.status);return r.json();},
 async keepTile(url,payload){try{const cache=await caches.open(chartCache),key=new URL(url,document.baseURI);key.search='';await cache.put(key,new Response(JSON.stringify(payload),{headers:{'Content-Type':'application/json'}}));return true;}catch(e){console.warn('Tile could not be saved',e);return false;}},
 sample(data,step,lon,lat,mode){const frame=data?.frames[step];if(!frame)return null;
 if(frame!==currentFrame||mode!==currentMode){const values=new Float64Array(weather.memory.buffer,weather.frame_ptr(),data.nx*data.ny*4);for(let i=0;i<data.nx*data.ny;i++){if(mode==='waves'){const d=frame.direction[i];values.set([frame.height[i]??NaN,frame.period[i]??NaN,d===null?NaN:Math.sin(d*Math.PI/180),d===null?NaN:Math.cos(d*Math.PI/180)],i*4);}else values.set([frame.u[i],frame.v[i],frame.gust[i],0],i*4);}currentFrame=frame;currentMode=mode;}
 if(!weather.sample(data.nx,data.ny,(lon-data.west)/data.spacing,(lat-data.south)/data.spacing,mode==='waves'?1:0))return null;
 const q=new Float64Array(weather.memory.buffer,weather.output_ptr(),4);return mode==='waves'?{height:q[0],period:q[1],direction:(Math.atan2(q[2],q[3])*180/Math.PI+360)%360,u:-q[2],v:-q[3]}:{u:q[0],v:q[1],gust:q[2]};
 },
 labels(points){if(points.length>200000)throw Error('Too many sounding labels');const v=new Float64Array(chart.memory.buffer,chart.points_ptr(),points.length*2);points.forEach((p,i)=>v.set([p.x,p.y],i*2));const count=chart.declutter(points.length,44,28,250);return Array.from(new Int32Array(chart.memory.buffer,chart.selected_ptr(),count));},
 chart,weather
};
window.HelmloreNative=Native;
