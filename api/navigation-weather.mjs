import {download} from '../js/navigation/compact-weather/wind-server.mjs';
import {downloadWaves} from '../js/navigation/compact-weather/waves-server.mjs';
import windSeed from '../data/navigation/compact-weather/wind.json' with {type:'json'};
import waveSeed from '../data/navigation/compact-weather/waves.json' with {type:'json'};
const cached=new Map(),pending=new Map();
export const maxDuration=60;
export default async function handler(req,res){
 if(req.method!=='GET'){res.statusCode=405;res.end();return;}
 const url=new URL(req.url,'https://helmlore.com'),kind=url.searchParams.get('kind')||'wind';if(!['wind','waves'].includes(kind)){res.statusCode=400;res.end('Invalid weather layer');return;}
 const now=Date.now(),force=url.searchParams.get('refresh')==='1';let saved=cached.get(kind),result;
 if(saved&&now-Date.parse(saved.downloaded_at)<(force?900000:10800000)&&Date.parse(saved.frames.at(-1).valid_time)>now)result={forecast:saved,refresh:'cached'};
 else try{if(!pending.has(kind))pending.set(kind,(kind==='waves'?downloadWaves():download()).then(d=>{cached.set(kind,d);return d;}).finally(()=>pending.delete(kind)));result={forecast:await pending.get(kind),refresh:'downloaded'};}
 catch{if(!saved)try{saved=kind==='waves'?waveSeed:windSeed;}catch{}result=saved?{forecast:saved,refresh:'failed',warning:'Refresh unavailable; last available forecast retained.'}:{error:'Forecast download unavailable. Saved device copy retained.'};}
 res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control',force||result.refresh==='failed'||result.error?'no-store':'public, max-age=0, s-maxage=900, stale-while-revalidate=900');res.statusCode=result.error?503:200;res.end(JSON.stringify(result));
}
