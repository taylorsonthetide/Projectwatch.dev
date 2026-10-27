// Forecast-derived marine wind alert, independent of personal comfort settings.
// Thresholds: Met Office marine forecasts glossary / Beaufort scale.
export const HOUR=3600000, KNOTS=1.943844;
export function severity(wind,gust){
 if(wind>=64)return 5;
 if(wind>=56||gust>=69)return 4;
 if(wind>=48||gust>=61)return 3;
 if(wind>=41||gust>=52)return 2;
 if(wind>=34||gust>=43)return 1;
 return 0;
}
export const SEVERITY_NAMES=['','GALE','SEVERE GALE','STORM','VIOLENT STORM','HURRICANE-FORCE WINDS'];
export function severeWeather(pack,now=Date.now()){
 const end=now+72*HOUR,rows=[];let missing=false,maxWind=null,maxGust=null,maxWave=null,peak=null,level=0;
 const points=pack.coordinates||[];
 if(pack.scope!=='area'||!points.length||!pack.seaMask)missing=true;
 const eligible=points.map((p,i)=>({p,i})).filter(({i})=>pack.seaMask?.[i]===true);
 if(!eligible.length)missing=true;
 for(let index=0;index<pack.frames.length;index++){
  const f=pack.frames[index];if(f.time+HOUR<=now||f.time>=end)continue;
  let rowLevel=0;for(const{p,i}of eligible){
   const validWind=Number.isFinite(f.u?.[i])&&Number.isFinite(f.v?.[i]);
   const w=validWind?Math.hypot(f.u[i],f.v[i])*KNOTS:null,g=Number.isFinite(f.gust?.[i])?f.gust[i]*KNOTS:null;
   if(w===null||g===null)missing=true;
   if(w!==null)maxWind=Math.max(maxWind??0,w);if(g!==null)maxGust=Math.max(maxGust??0,g);
   if(Number.isFinite(f.height?.[i]))maxWave=Math.max(maxWave??0,f.height[i]);
   const n=severity(w??-Infinity,g??-Infinity);rowLevel=Math.max(rowLevel,n);
   if(n>level){level=n;peak={location:p,index,wind:w,gust:g};}
  }
  rows.push({start:Math.max(now,f.time),end:Math.min(end,f.time+HOUR),level:rowLevel});
 }
 let cursor=now;for(const r of rows){if(r.start>cursor)missing=true;cursor=Math.max(cursor,r.end);}if(cursor<end)missing=true;
 const events=rows.filter(r=>r.level>0),windows=[];
 for(const r of events){const last=windows.at(-1);if(last&&last.end===r.start){last.end=r.end;last.level=Math.max(last.level,r.level);}else windows.push({...r});}
 return{level,label:SEVERITY_NAMES[level],peak,windows,first:events[0]?.start,last:events.at(-1)?.end,maxWind,maxGust,maxWave,incomplete:missing,stale:now-Date.parse(pack.downloaded_at)>12*HOUR,downloaded:pack.downloaded_at};
}
