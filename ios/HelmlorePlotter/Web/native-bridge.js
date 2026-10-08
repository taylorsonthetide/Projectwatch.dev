/* Native gateway data never changes the selected position source implicitly. */
(()=>{'use strict';let selected='none';const values=new Map();let ais=0;
window.addEventListener('helmlore-native-source',e=>{selected=e.detail.source;});
const stream=new HelmloreNMEA.Stream(record=>{
 if(record.kind==='position'&&selected==='gateway'&&Math.abs(Date.now()-record.fix.time)<=15000&&record.fix.time<=Date.now()+5000)window.dispatchEvent(new CustomEvent('helmlore-native-fix',{detail:record.fix}));
 if(record.kind==='instrument'){for(const [key,value] of Object.entries(record)){if(!['kind','type','talker'].includes(key))values.set(key,{value,time:Date.now()});}}
 if(record.kind==='ais-sentence')ais++;
});
window.addEventListener('helmlore-nmea-data',e=>stream.push(e.detail));
window.addEventListener('helmlore-nmea-reset',()=>{stream.reset();values.clear();ais=0;});
document.addEventListener('click',async e=>{const a=e.target.closest?.('a[download]');if(!a||!a.href.startsWith('blob:'))return;e.preventDefault();try{const text=await (await fetch(a.href)).text();window.HelmloreNative?.send('export',{filename:a.download,text});}catch{alert('Export could not be prepared.');}},true);
setInterval(()=>{const parts=[];for(const [key,item] of values){if(Date.now()-item.time>15000){values.delete(key);continue;}const labels={depthBelowTransducer:['Transducer depth',' m'],depthOffset:['Sensor offset',' m'],headingTrue:['True heading','°'],windKnots:['Wind',' kn'],windAngle:['Wind angle','°'],windReference:['Wind reference','']};const label=labels[key];if(label)parts.push(label[0]+': '+item.value+label[1]);}if(ais)parts.push('AIS sentences received: '+ais+' (target decoding pending)');window.HelmloreNative?.send('instruments',parts.join(' · ')||'No fresh boat instruments');},1000);
})();
