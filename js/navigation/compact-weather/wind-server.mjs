const KEY='irish-sea/ecmwf-v2.json',TTL=3*3600000;
let inflight;
export function validate(d){
 if(!d||d.schema!=='helmlore-wind-v1'||d.nx!==25||d.ny!==21||d.spacing!==.25||d.west!==-8||d.east!==-2||d.south!==51||d.north!==56||!Number.isFinite(Date.parse(d.downloaded_at))||!Array.isArray(d.frames)||d.frames.length<8||d.frames.length>100)throw Error('Invalid forecast package');
 let previous=0;
 for(const f of d.frames){const t=Date.parse(f.valid_time);if(!Number.isFinite(t)||t<=previous)throw Error('Invalid forecast times');previous=t;for(const key of ['u','v','gust'])if(!Array.isArray(f[key])||f[key].length!==525||f[key].some(x=>typeof x!=='number'||!Number.isFinite(x)||Math.abs(x)>150||(key==='gust'&&x<0)))throw Error('Invalid forecast values');}return d;
}
export async function download(fetcher=fetch,now=Date.now()){
 const latitude=[],longitude=[];for(let j=0;j<21;j++)for(let i=0;i<25;i++){latitude.push(51+j*.25);longitude.push(-8+i*.25);}
 const url=new URL('https://api.open-meteo.com/v1/ecmwf');url.search=new URLSearchParams({latitude:latitude.join(','),longitude:longitude.join(','),hourly:'wind_speed_10m,wind_direction_10m,wind_gusts_10m',wind_speed_unit:'ms',forecast_days:'3',models:'ecmwf_ifs025',cell_selection:'nearest',timezone:'GMT'});
 const r=await fetcher(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error('Weather provider unavailable ('+r.status+')');const points=await r.json();if(!Array.isArray(points)||points.length!==525)throw Error('Incomplete regional forecast');
 const times=points[0].hourly?.time;if(!Array.isArray(times)||times.length<48)throw Error('Missing forecast times');
 const frames=[];for(let h=0;h<times.length;h+=3){const frame={valid_time:times[h]+'Z',u:[],v:[],gust:[]};for(const p of points){if(p.hourly?.time?.[h]!==times[h])throw Error('Forecast times do not match');const speed=p.hourly.wind_speed_10m?.[h],direction=p.hourly.wind_direction_10m?.[h],gust=p.hourly.wind_gusts_10m?.[h];if(![speed,direction,gust].every(x=>typeof x==='number'&&Number.isFinite(x))||speed<0||direction<0||direction>360)throw Error('Incomplete weather field');const rad=direction*Math.PI/180;frame.u.push(Math.round(-speed*Math.sin(rad)*100)/100);frame.v.push(Math.round(-speed*Math.cos(rad)*100)/100);frame.gust.push(gust);}frames.push(frame);}
 const d=validate({schema:'helmlore-wind-v1',model:'ECMWF IFS 0.25°',source:'ECMWF via Open-Meteo',run_time:null,downloaded_at:new Date(now).toISOString(),west:-8,east:-2,south:51,north:56,spacing:.25,nx:25,ny:21,frames});if(Date.parse(d.frames.at(-1).valid_time)<=now)throw Error('Provider forecast has expired');return d;
}
const json=(d,status=200)=>new Response(JSON.stringify(d),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
export async function forecast(request,env,seed){
 if(!env.BUCKET)return json({error:'Forecast storage is unavailable'},503);
 let saved;try{const o=await env.BUCKET.get(KEY);if(o)saved=validate(await o.json());}catch{}
 if(!saved&&seed){try{saved=validate(seed);await env.BUCKET.put(KEY,JSON.stringify(saved),{httpMetadata:{contentType:'application/json'}});}catch{saved=null;}}
 const now=Date.now(),force=new URL(request.url).searchParams.get('refresh')==='1';
 if(saved&&now-Date.parse(saved.downloaded_at)<(force?15*60000:TTL)&&Date.parse(saved.frames.at(-1).valid_time)>now)return json({forecast:saved,refresh:'cached'});
 try{if(!inflight)inflight=(async()=>{const fresh=await download();await env.BUCKET.put(KEY,JSON.stringify(fresh),{httpMetadata:{contentType:'application/json'}});return fresh;})().finally(()=>{inflight=null;});return json({forecast:await inflight,refresh:'downloaded'});}catch{return saved?json({forecast:saved,refresh:'failed',warning:'Refresh failed. Last saved forecast retained.'}):json({error:'Could not download a complete forecast. Try again shortly.'},503);}
}
