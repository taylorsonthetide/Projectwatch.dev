/* Receive-only 0183 decoder. Raw NMEA 2000 PGNs require a gateway-specific adapter. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HelmloreNMEA=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
function number(s){return typeof s==='string'&&/^-?\d+(?:\.\d+)?$/.test(s)?Number(s):null;}
function coordinate(value,hemisphere,lat){const digits=lat?2:3;if(!new RegExp('^\\d{'+(digits+2)+'}(?:\\.\\d+)?$').test(value)||!(lat?['N','S']:['E','W']).includes(hemisphere))return null;const d=Number(value.slice(0,digits)),m=Number(value.slice(digits));if(m>=60||d>(lat?90:180)||(d===(lat?90:180)&&m!==0))return null;return (d+m/60)*(['S','W'].includes(hemisphere)?-1:1);}
function timestamp(t,d){if(!/^\d{6}(?:\.\d+)?$/.test(t)||!/^\d{6}$/.test(d))return null;const day=+d.slice(0,2),month=+d.slice(2,4),yy=+d.slice(4),year=yy>=80?1900+yy:2000+yy,h=+t.slice(0,2),m=+t.slice(2,4),s=+t.slice(4);if(h>23||m>59||s>=60)return null;const date=new Date(Date.UTC(year,month-1,day,h,m,Math.floor(s),Math.round((s%1)*1000)));if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return null;return date.getTime();}
function decode(line){if(typeof line!=='string'||line.length>512)return null;const match=/^([$!])([^*\r\n]+)\*([0-9A-Fa-f]{2})$/.exec(line.trim());if(!match)return null;let checksum=0;for(const c of match[2]){if(c.charCodeAt(0)>127)return null;checksum^=c.charCodeAt(0);}if(checksum!==parseInt(match[3],16))return null;const f=match[2].split(','),id=f[0];if(!/^[A-Z0-9]{5}$/.test(id))return null;const type=id.slice(2),base={type,talker:id.slice(0,2)};
if(type==='RMC'){
 if(f.length<10||f[2]!=='A'||(f[12]&&!['A','D','F','R','P'].includes(f[12]))||f[13]==='V')return null;
 const lat=coordinate(f[3],f[4],true),lon=coordinate(f[5],f[6],false),time=timestamp(f[1],f[9]),speed=number(f[7]),course=number(f[8]);
 if(lat===null||lon===null||time===null||speed!==null&&(speed<0||speed>300)||course!==null&&(course<0||course>=360))return null;
 return {...base,kind:'position',fix:{lat,lon,time,speed:speed===null?null:speed*1852/3600,heading:course,accuracy:null,source:'gateway'}};
}
if(type==='HDT'){const heading=number(f[1]);return heading!==null&&heading>=0&&heading<360&&f[2]==='T'?{...base,kind:'instrument',headingTrue:heading}:null;}
if(type==='DPT'){const depth=number(f[1]),offset=number(f[2]);return depth!==null&&depth>=0&&depth<12000?{...base,kind:'instrument',depthBelowTransducer:depth,depthOffset:offset}:null;}
if(type==='MWV'){let speed=number(f[3]);const angle=number(f[1]);if(f[5]!=='A'||!['R','T'].includes(f[2])||angle===null||angle<0||angle>=360||speed===null||speed<0||!['N','M','K'].includes(f[4]))return null;if(f[4]==='M')speed*=3600/1852;if(f[4]==='K')speed/=1.852;return {...base,kind:'instrument',windKnots:speed,windAngle:angle,windReference:f[2]==='R'?'apparent':'true'};}
if(match[1]==='!'&&['VDM','VDO'].includes(type))return {...base,kind:'ais-sentence',raw:line.trim()};
return {...base,kind:'unsupported'};
}
class Stream{constructor(onRecord){this.onRecord=onRecord;this.pending='';}reset(){this.pending='';}push(chunk){if(typeof chunk!=='string')return;for(const c of chunk){if(c==='\n'){const record=decode(this.pending.replace(/\r$/,''));this.pending='';if(record)this.onRecord(record);}else {this.pending+=c;if(this.pending.length>512)this.pending='';}}}}
return {decode,Stream,coordinate,timestamp};
});
