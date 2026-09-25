/* Module 9 delivery layer. Curriculum and questions stay in separate data libraries. */
(function(){
'use strict';
const brief=window.PW_CEVNI_M09_BRIEFINGS.briefings;
const bank=window.PW_CEVNI_M09_QUESTIONS;
const visualById=Object.fromEntries(window.PW_CEVNI_M09_VISUALS.visuals.map(v=>[v.id,v]));
const moduleIndex=8;
CEVNI_MODULES[moduleIndex].sections=brief.map(x=>[x.title,x.body]);
const stages=['rehearsal','context','assessment'];
const items=Object.fromEntries(stages.map(stage=>[stage,bank.questions.filter(q=>q.stage===stage)]));
for(const stage of stages)CEVNI_1480[moduleIndex][stage]=items[stage];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const visual=id=>{const v=visualById[id];return v?`<figure class="m09Visual"><img src="${escape(v.url)}" alt="${escape(v.title)}" loading="lazy"><figcaption>${escape(v.title)} • scenario geometry</figcaption></figure>`:''};
const area=()=>document.getElementById('cevniLessonArea');
let state=null;
function start(stage='rehearsal'){state={stage,index:0,score:0,answered:false,options:{}};render()}
function render(){
 const a=area();if(!a||!state)return;
 const q=items[state.stage][state.index];if(!q){complete();return}
 if(!state.options[q.id])state.options[q.id]=pwShuffle(q.answers.map((value,i)=>({value,ok:i===q.correct})));
 const options=state.options[q.id];state.answered=false;
 a.innerHTML=`<div class="cvLessonShell m09Shell"><div class="cvLessonTop"><div><div class="ver">MODULE 09 • ${escape(state.stage.toUpperCase())}</div><h2>Environment, Emergencies & Passage Readiness</h2><p class="cevniLead">${state.stage==='assessment'?`Choose once, then move to the next question. Pass at least ${bank.passMark} of ${items.assessment.length}.`:'Read the traffic, choose, then check the coaching.'}</p></div><div class="cvLessonCounter">${state.index+1} / ${items[state.stage].length}</div></div><div class="cvLessonProgress"><i style="width:${Math.round((state.index+1)/items[state.stage].length*100)}%"></i></div><article class="cvBriefingCard m09Question">${visual(q.visualId)}<h3>${escape(q.prompt)}</h3><div class="cevniAnswers">${options.map((o,i)=>`<button type="button" data-index="${i}">${String.fromCharCode(65+i)} • ${escape(o.value)}</button>`).join('')}</div><div class="m09Feedback" role="status" aria-live="polite"></div><small class="m09Source">${escape(q.sourceRefs.join(' • '))}</small></article><div class="cvLessonNav"><button class="cvClose" type="button">CLOSE</button><span></span><span>${state.stage==='assessment'?'ONE ANSWER • RESULTS AT END':'RETRIES AND COACHING'}</span></div></div>`;
 a.querySelector('.cvClose').onclick=cevniCloseLesson;
 a.querySelectorAll('.cevniAnswers button').forEach(b=>b.onclick=()=>answer(q,options,Number(b.dataset.index)));
 a.scrollIntoView({behavior:'smooth',block:'start'});
}
function answer(q,options,index){
 if(state.answered)return;
 const a=area(),buttons=a.querySelectorAll('.cevniAnswers button'),chosen=buttons[index],fb=a.querySelector('.m09Feedback');
 const ok=options[index].ok;
 if(state.stage==='assessment'){
  state.answered=true;if(ok)state.score++;
  buttons.forEach((b,i)=>{b.disabled=true;if(i===index)b.classList.add('selected')});
  fb.innerHTML=`Answer recorded.<br><button type="button" class="m09Next">${state.index+1===items.assessment.length?'VIEW RESULTS →':'NEXT QUESTION →'}</button>`;
 }else if(!ok){
  chosen.classList.add('bad');chosen.disabled=true;
  fb.textContent='Not quite. Try another answer.';
  return;
 }else{
  state.answered=true;buttons.forEach(b=>b.disabled=true);chosen.classList.add('good');
  fb.innerHTML=`<strong>Correct.</strong> ${escape(q.explanation)}<br><button type="button" class="m09Next">${state.index+1===items[state.stage].length?'NEXT STAGE →':'NEXT QUESTION →'}</button>`;
 }
 fb.querySelector('.m09Next').onclick=()=>{state.index++;render()};
}
function complete(){
 const a=area();
 if(state.stage!=='assessment'){state.stage=stages[stages.indexOf(state.stage)+1];state.index=0;render();return}
 const passed=state.score>=bank.passMark;
 a.innerHTML=`<div class="cvLessonShell m09Shell"><div class="ver">MODULE 09 • ASSESSMENT COMPLETE</div><h2>${passed?'Module 9 passed':'Review and retry'}</h2><p class="cevniLead">${state.score} / ${items.assessment.length} correct. Passing mark: ${bank.passMark} / ${items.assessment.length}.</p><div class="cvLessonNav"><button type="button" class="m09Review">REVIEW BRIEFINGS</button><button type="button" class="m09Retry">RETRY ASSESSMENT</button>${passed?'<button type="button" class="m09Pass">FINISH COURSE →</button>':''}</div></div>`;
 a.querySelector('.m09Review').onclick=()=>window.cevniOpenLesson(moduleIndex,0);
 a.querySelector('.m09Retry').onclick=()=>start('assessment');
 a.querySelector('.m09Pass')?.addEventListener('click',()=>{cevniMark(moduleIndex);a.innerHTML=`<div class="cvLessonShell m09Shell"><div class="ver">MODULE 09 • COMPLETE</div><h2>Project Watch CEVNI training complete</h2><p class="cevniLead">You passed Module 9 with ${state.score} / ${items.assessment.length}. All nine modules can now be reviewed from the course map.</p><p>This is Project Watch practice training, not an official examination result.</p><div class="cvLessonNav"><button class="m09Hub" type="button">RETURN TO COURSE MAP</button><button class="m09Review" type="button">REVIEW MODULE 9</button></div></div>`;a.querySelector('.m09Hub').onclick=()=>window.cv1480OpenHub();a.querySelector('.m09Review').onclick=()=>window.cevniOpenLesson(moduleIndex,0);a.scrollIntoView({behavior:'smooth',block:'start'});});
}
const oldOpen=window.cevniOpenLesson;
window.cevniOpenLesson=function(i,step=0){
 if(i!==moduleIndex)return oldOpen.apply(this,arguments);
 if(!cevniModuleUnlocked(i))return;
 if(step>=brief.length){start();return}
 const result=oldOpen.call(this,i,step);
 const target=area()?.querySelector('.cvBriefingCard');if(target)target.insertAdjacentHTML('beforeend',visual(brief[step].visualId)+`<small class="m09Source">${escape(brief[step].sourceRefs.join(' • '))}</small>`);
 cevniRenderModules();return result;
};
const oldHub=window.cv1480OpenHub;
window.cv1480OpenHub=function(){
 oldHub();
 const hub=area()?.querySelector('.cv148Hero');
 if(hub){
  const stats=hub.querySelectorAll('.cv148Stat b');
  if(stats.length>=5){stats[1].textContent=CEVNI_MODULES.reduce((n,x)=>n+x.sections.length,0);for(const [j,stage] of [[2,'rehearsal'],[3,'context'],[4,'assessment']])stats[j].textContent=CEVNI_1480.reduce((n,x)=>n+x[stage].length,0)}
  const lead=hub.querySelector('p.cevniLead');if(lead)lead.textContent='Nine modules follow teaching, rehearsal, operational context and assessment. Module 9 now covers Chapter 10 pollution prevention, emergencies and passage readiness.';
 }
 const card=area()?.querySelectorAll('.cv148Mod')[moduleIndex];if(card)card.querySelector('button').onclick=()=>window.cevniOpenLesson(moduleIndex,0);
};
const oldStart=window.cv1480Start;
window.cv1480Start=function(i,stage){if(i===moduleIndex){window.cevniOpenLesson(moduleIndex,stage==='assessment'?brief.length:0);return}return oldStart.apply(this,arguments)};
window.PW1760_M09={build:'1.76.0',briefings:brief.length,questions:Object.fromEntries(stages.map(s=>[s,items[s].length])),visuals:Object.keys(visualById).length,passMark:bank.passMark};
cevniRenderModules();
})();
