/* Regression checks for the approved October 2026 editorial corrections. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const ctx={window:{PW_CEVNI_VISUAL_CATALOGUES:JSON.parse(read('libraries/cevni/visual-catalogues-1.71.2.json'))}};
vm.createContext(ctx);
for(const f of ['annex7-A-register-1.80.0.js','annex7-B-register-1.81.0.js','annex7-C-register-1.82.0.js','annex7-E-register-1.83.0.js','annex7-official-plates-1.84.0.js'])vm.runInContext(read('libraries/cevni/'+f),ctx);
const source=read('js/cevni/90-signs-marks-1.85.5.js');
const start=source.indexOf('  function signQuizChoices('),end=source.indexOf('  let quizIndex=',start);
assert(start>=0&&end>start);vm.runInContext(source.slice(start,end),ctx);
const rows=ctx.window.PW_CEVNI_VISUAL_CATALOGUES.signs.records.filter(r=>ctx.window.PW_CEVNI_ANNEX7_OFFICIAL_PLATES[r.code]&&!['A.1','E.1'].includes(r.code));
for(let i=0;i<30000;i++){
 const row=rows[i%rows.length],choices=ctx.signQuizChoices(rows,row,i);
 assert.equal(choices.length,3);assert.equal(choices.filter(r=>r.code===row.code).length,1);assert.equal(choices[i%3].code,row.code);
 assert.equal(new Set(choices.map(r=>r.title.trim().toLowerCase().replace(/\s+/g,' '))).size,3,'Each visible meaning must be distinct');
 assert.equal(new Set(choices.map(r=>r.code.replace(/[a-f]$/,''))).size,3,'Variants of one sign cannot be wrong answers');
}
for(const base of ['module05-question-bank-1.72.0','module06-question-bank-1.73.2','module07-question-bank-1.74.1','module08-question-bank-1.75.0','module09-question-bank-1.76.0','mock-exam-bank-1.77.1']){
 const c={window:{}};vm.runInNewContext(read('libraries/cevni/'+base+'.js'),c);const data=Object.values(c.window).find(v=>v&&Array.isArray(v.questions));
 assert.deepEqual(JSON.parse(JSON.stringify(data)),JSON.parse(read('libraries/cevni/'+base+'.json')),'JS/JSON mirrors agree: '+base);
 for(const q of data.questions){assert(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.answers.length);assert.equal(new Set(q.answers).size,q.answers.length);}
}
const c={window:{}};vm.runInNewContext(read('libraries/project-watch/ais-content-1.88.0.js'),c);
assert.equal(c.window.PW_ORIGINAL_LIBRARIES.AIS_STAGE8_Q.length,10);
assert(c.window.PW_ORIGINAL_LIBRARIES.AIS_STAGE8_Q.every(q=>typeof q.why==='string'&&q.why.length>40));
console.log('PASS: 30,000 generated sign questions, six CEVNI mirrors, answer validity and AIS explanations.');
