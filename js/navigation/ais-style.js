/* AIS categories follow broadcast ship-type codes; never infer type from station class. */
(function(root){'use strict';const categories=[
 {key:'cargo',label:'Cargo',color:'#16834d'},
 {key:'tanker',label:'Tanker',color:'#d93649'},
 {key:'passenger',label:'Passenger',color:'#2563db'},
 {key:'fishing',label:'Fishing',color:'#dc7416'},
 {key:'service',label:'Tugs / service',color:'#008b9b'},
 {key:'sailing',label:'Sailing',color:'#9250bd'},
 {key:'pleasure',label:'Pleasure craft',color:'#c99c05'},
 {key:'other',label:'Other type',color:'#526680'},
 {key:'unknown',label:'Type unknown',color:'#737982'}
];function vesselStyle(type){let key='unknown';if(Number.isInteger(type)&&type>0&&type<=99){key=type>=70&&type<=79?'cargo':type>=80&&type<=89?'tanker':type>=60&&type<=69?'passenger':type===30?'fishing':type===36?'sailing':type===37?'pleasure':[31,32,50,51,52,53,54,55,58,59].includes(type)?'service':'other';}return categories.find(c=>c.key===key);}const api={categories,vesselStyle};if(typeof module==='object'&&module.exports)module.exports=api;else root.HelmloreAISStyle=api;
})(typeof window==='undefined'?globalThis:window);

