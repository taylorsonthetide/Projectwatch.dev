export function normalise(message,receivedAt=Date.now()){
 const kind=message?.MessageType,meta=message?.MetaData||{},body=message?.Message?.[kind]||{},mmsi=String(meta.MMSI??body.UserID??'');if(!/^\d{9}$/.test(mmsi)||body.Valid===false)return null;
 const classB=['StandardClassBPositionReport','ExtendedClassBPositionReport','StaticDataReport'].includes(kind),classA=['PositionReport','ShipStaticData'].includes(kind);
 const name=String(body.Name||body.ReportA?.Name||meta.ShipName||body.ShipName||'').replace(/@/g,'').trim().slice(0,80);
 const rawType=kind==='StaticDataReport'?(body.PartNumber===true||body.PartNumber===1?body.ReportB?.ShipType:undefined):body.Type;
 const shipType=Number.isInteger(rawType)&&rawType>0&&rawType<=99?rawType:undefined;
 const info={mmsi,...(name?{name}:{}),...(shipType!==undefined?{shipType}:{}),...(classB||classA?{aisClass:classB?'B':'A'}:{})};
 const lat=body.Latitude??meta.latitude??meta.Latitude,lon=body.Longitude??meta.longitude??meta.Longitude;
 const position=['PositionReport','StandardClassBPositionReport','ExtendedClassBPositionReport'].includes(kind);
 if(!position)return classB||classA?{...info,staticReceivedAt:receivedAt}:null;
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return null;
 const speed=Number.isFinite(body.Sog)&&body.Sog>=0&&body.Sog<102.3?body.Sog:null;
 const course=Number.isFinite(body.Cog)&&body.Cog>=0&&body.Cog<360?body.Cog:null;
 const heading=Number.isFinite(body.TrueHeading)&&body.TrueHeading>=0&&body.TrueHeading<360?body.TrueHeading:null;
 const rawTime=Date.parse(String(meta.time_utc||'').replace(' +0000 UTC','Z').replace(' ','T'));
 return {...info,lat,lon,speed,course,heading,receivedAt,reportedAt:Number.isFinite(rawTime)&&rawTime<=receivedAt+60000?rawTime:null};
}
export function mergeVessel(old={},update){return {...old,...update};}
export function bounds(value){if(typeof value!=='string')return null;const v=value.split(',').map(Number);if(v.length!==4||v.some(n=>!Number.isFinite(n)))return null;const [south,west,north,east]=v;if(south>=north||west>=east||south< -90||north>90||west< -180||east>180||north-south>8||east-west>12)return null;return {south,west,north,east};}

