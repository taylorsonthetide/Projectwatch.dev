export function normalise(message,receivedAt=Date.now()){
 const meta=message?.MetaData||{},body=message?.Message?.[message.MessageType]||{},mmsi=String(meta.MMSI??body.UserID??'');if(!/^\d{9}$/.test(mmsi))return null;
 const name=String(meta.ShipName||body.Name||body.ShipName||'').replace(/@/g,'').trim().slice(0,80);
 const lat=body.Latitude??meta.latitude??meta.Latitude,lon=body.Longitude??meta.longitude??meta.Longitude;
 const position=['PositionReport','StandardClassBPositionReport','ExtendedClassBPositionReport'].includes(message.MessageType);
 if(!position)return name?{mmsi,name}:null;
 if(body.Valid===false||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return null;
 const speed=Number.isFinite(body.Sog)&&body.Sog>=0&&body.Sog<102.3?body.Sog:null;
 const course=Number.isFinite(body.Cog)&&body.Cog>=0&&body.Cog<360?body.Cog:null;
 const heading=Number.isFinite(body.TrueHeading)&&body.TrueHeading>=0&&body.TrueHeading<360?body.TrueHeading:null;
 const rawTime=Date.parse(String(meta.time_utc||'').replace(' +0000 UTC','Z').replace(' ','T'));
 return {mmsi,name,lat,lon,speed,course,heading,receivedAt,reportedAt:Number.isFinite(rawTime)&&rawTime<=receivedAt+60000?rawTime:null};
}
export function bounds(value){if(typeof value!=='string')return null;const v=value.split(',').map(Number);if(v.length!==4||v.some(n=>!Number.isFinite(n)))return null;const [south,west,north,east]=v;if(south>=north||west>=east||south< -90||north>90||west< -180||east>180||north-south>8||east-west>12)return null;return {south,west,north,east};}
