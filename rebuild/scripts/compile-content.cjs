const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'rebuild/data');fs.mkdirSync(out,{recursive:true});
const selected=['home-pathways-1.99.1','safety-awareness-1.90.0','tides-1.93.3','machinery-artwork-20261018','boat-systems-1.94.0','compass-1.95.4','chartwork-1.96.0','passage-1.97.0','diesel-1.98.0','foundations-1.88.0','course-content-1.88.0','buoyage-reference-1.88.0','buoyage-1.88.0'];
const lockPath=path.join(out,'approved-source-lock.json');
if(fs.existsSync(lockPath)){for(const item of JSON.parse(fs.readFileSync(lockPath,'utf8')).sources){const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,item.path))).digest('hex');if(actual!==item.sha256)throw Error('Approved source changed: '+item.path);}}
const w={},context=vm.createContext({window:w});const hashes=[];
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
for(const name of selected){const file='libraries/project-watch/'+name+'.js',s=fs.readFileSync(path.join(root,file),'utf8');vm.runInContext(s,context,{timeout:3000,filename:file});hashes.push({path:file,sha256:hash(s)});}
const map={safety:['PW_SAFETY_AWARENESS','safety-awareness-1.90.0'],tides:['PW_TIDES_LIBRARY','tides-1.93.3'],systems:['PW_BOAT_SYSTEMS','boat-systems-1.94.0'],compass:['PW_COMPASS','compass-1.95.4'],chartwork:['PW_CHARTWORK','chartwork-1.96.0'],passage:['PW_PASSAGE','passage-1.97.0'],diesel:['PW_DIESEL','diesel-1.98.0']};
function question(raw,i,source,course){const array=Array.isArray(raw);const prompt=array?raw[0]:raw.q??raw.question;const options=array?raw[1]:raw.choices??raw.options;const correct=array?raw[2]:raw.correct??raw.answer;const explanation=array?raw[3]:raw.why??raw.explanation;if(typeof prompt!=='string'||!Array.isArray(options)||!Number.isInteger(correct)||correct<0||correct>=options.length)throw Error('Invalid approved question '+source+':'+i);return{id:course+':q:'+i,prompt,options,correct,explanation:explanation||'',image:raw.image||null,alt:raw.imageAlt||'',source,index:i,sourceValueHash:hash(JSON.stringify(raw))};}
const courses=w.PW_HOME_PATHWAYS.map(p=>{let entry=map[p.id],source,data,lessons=[],questions=[];
 if(entry){source='libraries/project-watch/'+entry[1]+'.js';data=w[entry[0]];lessons=data.lessons.map((l,i)=>({...l,id:p.id+':l:'+i,source,sourceIndex:i}));questions=(data.quiz||data.questions||[]).map((q,i)=>question(q,i,source,p.id));}
 if(p.id==='bridge'){source='libraries/project-watch/course-content-1.88.0.js';const keys=['ORIENTATION_LESSONS','LS_LESSONS','SIG_LESSONS','COLLISION_TUTORIAL_LESSONS','STAGE5_LESSONS','AIS_STAGE8_LESSONS'];for(const key of keys){(w.PW_ORIGINAL_LIBRARIES[key]||[]).forEach((l,i)=>lessons.push({...l,id:'bridge:'+key+':'+i,source,section:key,sourceIndex:i}));}questions=w.PW_ORIGINAL_LIBRARIES.CR_QUIZ.map((q,i)=>question(q,i,'libraries/project-watch/foundations-1.88.0.js','bridge'));}
 return {id:p.id,title:p.title,description:p.description,group:p.group,image:p.image,alt:p.alt,topics:p.topics,lessons,questions,sources:data?.sources||[],specialistMigrationPending:['bridge','cevni','chartwork','tides','systems','compass','passage','diesel'].includes(p.id)};
});
// Preserve a complete source register, including specialist CEVNI banks that require their own adapter.
const active=fs.readFileSync(path.join(root,'training.html'),'utf8');const files=[...active.matchAll(/<script[^>]+src="([^"?]+)(?:\?[^\"]*)?"/g)].map(m=>m[1]).filter(p=>p.startsWith('libraries/'));
for(const file of [...new Set(files)])if(!hashes.some(h=>h.path===file)){const s=fs.readFileSync(path.join(root,file));hashes.push({path:file,sha256:hash(s)});}
for(const file of ['libraries/cevni/mock-exam-bank-1.77.1.json','banks/public/west-cardinal.json']){const s=fs.readFileSync(path.join(root,file));hashes.push({path:file,sha256:hash(s)});}
const catalogue={version:'0.1.0',baseline:'0d340a9ce339c17c5fac46c281107bb4bcc5cca1',courses};
fs.writeFileSync(path.join(out,'courses.json'),JSON.stringify(catalogue,null,2)+'\n');fs.writeFileSync(path.join(out,'source-register.json'),JSON.stringify({baseline:catalogue.baseline,sources:hashes},null,2)+'\n');
console.log(`${courses.length} pathways; ${courses.reduce((n,c)=>n+c.lessons.length,0)} source-backed lessons; ${courses.reduce((n,c)=>n+c.questions.length,0)} preserved questions; ${hashes.length} protected source files.`);
module.exports={catalogue,question};
