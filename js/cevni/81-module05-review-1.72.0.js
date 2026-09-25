/* Module 5 review layer: source-aligned teaching, practice, context and assessment. */
(function(){
'use strict';
const brief=window.PW_CEVNI_M05_BRIEFINGS.briefings;
const bank=window.PW_CEVNI_M05_QUESTIONS;
const visuals=window.PW_CEVNI_M05_VISUALS.visuals;
const visualById=Object.fromEntries(visuals.map(v=>[v.id,v]));
const m=CEVNI_MODULES[4];
m.sections=brief.map(x=>[x.title,x.body]);
CEVNI_SOUNDS.push(
 ['Two long + two short','— — • •','OVERTAKING • Request to pass on port side',[4,4,1,1]],
 ['Two long + one short','— — •','OVERTAKING • Request to pass on starboard side',[4,4,1]],
 ['Long blasts repeated','— — —','DISTRESS • Repeated long blasts',[4,4,4]]
);
CEVNI_WAV_AUDIO.push('assets/cevni/module05/overtake-port.wav','assets/cevni/module05/overtake-starboard.wav','assets/cevni/module05/distress-long.wav');
const stages=['rehearsal','context','assessment'];
for(const stage of stages)CEVNI_1480[4][stage]=bank.questions.filter(q=>q.stage===stage);
const counts=Object.fromEntries(stages.map(s=>[s,bank.questions.filter(q=>q.stage===s).length]));
const oldOpen=window.cevniOpenLesson;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const visual=id=>{const v=visualById[id];return v?`<figure class="m05Visual"><img src="${escape(v.url)}" alt="${escape(v.title)}" loading="lazy"><figcaption>${escape(v.title)} • training diagram</figcaption></figure>`:''};
let state=null;
function start(stage='rehearsal') {state={stage,index:0,score:0,answered:false,options:{}};render()}
function render(){
 const area=document.getElementById('cevniLessonArea'); if(!area||!state)return;
 const items=bank.questions.filter(q=>q.stage===state.stage),q=items[state.index];
 if(!q){complete();return}
 if(!state.options[q.id])state.options[q.id]=pwShuffle(q.answers.map((value,i)=>({value,ok:i===q.correct})));
 const options=state.options[q.id];state.answered=false;
 area.innerHTML=`<div class="cvLessonShell m05Shell"><div class="cvLessonTop"><div><div class="ver">MODULE 05 • ${escape(state.stage.toUpperCase())}</div><h2>Sound Signals &amp; Radiotelephony</h2><p class="cevniLead">${state.stage==='assessment'?'First answer counts. Pass at least 10 of 12.':'Listen, choose, then read the coaching.'}</p></div><div class="cvLessonCounter">${state.index+1} / ${items.length}</div></div><div class="cvLessonProgress"><i style="width:${Math.round((state.index+1)/items.length*100)}%"></i></div><article class="cvBriefingCard m05Question">${visual(q.visualId)}<h3>${escape(q.prompt)}</h3>${Number.isInteger(q.audioIndex)?'<button type="button" class="m05Play">▶ PLAY SIGNAL</button>':''}<div class="cevniAnswers">${options.map((o,i)=>`<button type="button" data-index="${i}">${String.fromCharCode(65+i)} • ${escape(o.value)}</button>`).join('')}</div><div class="m05Feedback" role="status" aria-live="polite"></div><small class="m05Source">${escape((q.sourceRefs||[]).join(' • '))}</small></article><div class="cvLessonNav"><button class="cvClose" type="button">CLOSE</button><span></span><span>${state.stage==='assessment'?'FIRST ANSWER COUNTS':'RETRIES AND COACHING'}</span></div></div>`;
 area.querySelector('.cvClose').onclick=cevniCloseLesson;
 area.querySelector('.m05Play')?.addEventListener('click',e=>cevniPlayIndex(q.audioIndex,e.currentTarget));
 area.querySelectorAll('.cevniAnswers button').forEach(b=>b.onclick=()=>answer(q,options,Number(b.dataset.index)));
 area.scrollIntoView({behavior:'smooth',block:'start'});
}
function answer(q,options,index){
 if(state.answered)return;
 const ok=options[index].ok, assessed=state.stage==='assessment',area=document.getElementById('cevniLessonArea');
 const fb=area.querySelector('.m05Feedback');
 if(!ok&&!assessed){fb.innerHTML=`<strong>Try again.</strong> ${escape(q.explanation)}`;area.querySelectorAll('.cevniAnswers button')[index].disabled=true;return}
 state.answered=true;if(assessed&&ok)state.score++;
 area.querySelectorAll('.cevniAnswers button').forEach((b,i)=>{b.disabled=true;if(options[i].ok)b.classList.add('good');else if(i===index)b.classList.add('bad')});
 fb.innerHTML=`<strong>${ok?'Correct.':'First answer recorded.'}</strong> ${escape(q.explanation)}<br><button type="button" class="m05Next">${state.index+1===counts[state.stage]?'NEXT STAGE →':'NEXT QUESTION →'}</button>`;
 fb.querySelector('.m05Next').onclick=()=>{state.index++;render()};
}
function complete(){
 const area=document.getElementById('cevniLessonArea');
 if(state.stage!=='assessment'){state.stage=stages[stages.indexOf(state.stage)+1];state.index=0;render();return}
 const passed=state.score>=bank.passMark;
 area.innerHTML=`<div class="cvLessonShell m05Shell"><div class="ver">MODULE 05 • ASSESSMENT COMPLETE</div><h2>${passed?'Module 5 passed':'Review and retry'}</h2><p class="cevniLead">${state.score} / ${counts.assessment} correct. Passing mark: ${bank.passMark} / ${counts.assessment}.</p><div class="cvLessonNav"><button type="button" class="m05Review">REVIEW BRIEFINGS</button><button type="button" class="m05Retry">RETRY ASSESSMENT</button>${passed?'<button type="button" class="m05Pass">MARK REVIEWED &amp; CONTINUE →</button>':''}</div></div>`;
 area.querySelector('.m05Review').onclick=()=>window.cevniOpenLesson(4,0);
 area.querySelector('.m05Retry').onclick=()=>start('assessment');
 area.querySelector('.m05Pass')?.addEventListener('click',()=>cevniMark(4));
}
window.cevniOpenLesson=function(i,step=0){
 if(i!==4)return oldOpen.apply(this,arguments);
 if(!cevniModuleUnlocked(i))return;
 if(step>=brief.length){start();return}
 const result=oldOpen.call(this,i,step);const card=document.querySelector('#cevniLessonArea .cvBriefingCard');
 if(card){card.insertAdjacentHTML('beforeend',visual(brief[step].visualId)+`<small class="m05Source">${escape(brief[step].sourceRefs.join(' • '))}</small>`)}
 cevniRenderModules();return result;
};
const oldHub=window.cv1480OpenHub;
window.cv1480OpenHub=function(){oldHub();const hub=document.querySelector('#cevniLessonArea .cv148Hero');if(hub){const stats=hub.querySelectorAll('.cv148Stat b');if(stats.length>=4){stats[1].textContent=CEVNI_MODULES.reduce((n,x)=>n+x.sections.length,0);stats[2].textContent=40+counts.rehearsal;stats[3].textContent=24+counts.context;stats[4].textContent=40+counts.assessment;const labels=hub.querySelectorAll('.cv148Stat small');if(labels[1])labels[1].textContent='TEACHING BRIEFINGS'}hub.querySelector('p.cevniLead').textContent='Nine modules follow teaching, rehearsal, operational context and assessment. Module 5 uses the expanded sound and radio curriculum.'}const card=document.querySelectorAll('#cevniLessonArea .cv148Mod')[4];if(card)card.querySelector('button').onclick=()=>window.cevniOpenLesson(4,0)};
const oldStart=window.cv1480Start;
window.cv1480Start=function(i,stage){if(i===4){window.cevniOpenLesson(4,stage==='assessment'?brief.length:0);return}return oldStart.apply(this,arguments)};
window.PW1720_M05={build:'1.72.0',briefings:brief.length,questions:counts,visuals:visuals.length,audio:3,passMark:bank.passMark};
cevniRenderModules();
cevniRenderSounds();
})();
