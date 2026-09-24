(function(){
'use strict';
const BUILD='1.71.0-CEVNI-LIBRARY-PREVIEW';
if(typeof CEVNI_MODULES==='undefined'||!CEVNI_MODULES[3])return;
const m=CEVNI_MODULES[3];
let ready=false,patterns={},DRILL=[];
const read=async url=>{const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw Error(url+' HTTP '+r.status);return r.json()};
const readyPromise=Promise.all([read('libraries/cevni/module04-briefings-1.69.0.json'),read('project-watch-cevni-question-bank-1.70.3.json'),read('libraries/cevni/module04-visuals-1.69.0.json')]).then(([lesson,bank,visuals])=>{
 if(lesson.build!=='1.69.0-M04-LIBRARY-PREVIEW'||visuals.build!=='1.69.0-M04-LIBRARY-PREVIEW')throw Error('Module 4 library version mismatch');
 const live=bank.filter(q=>q.module===4&&q.liveInBuild==='1.69.0-M04-LIBRARY-PREVIEW');
 const rehearsal=live.filter(q=>q.stage==='REHEARSAL').sort((a,b)=>a.order-b.order);
 const check=live.find(q=>q.stage==='CHECK'&&q.id==='PW-CEVNI-M04-LIVE-C01');
 if(lesson.sections.length!==17||rehearsal.length!==10||!check)throw Error('Module 4 library incomplete');
 m.desc=lesson.desc;m.sections=lesson.sections;m.check=[check.question,check.answers,check.correct];
 DRILL=rehearsal.map(q=>[q.question,q.answers,q.correct,q.explanation]);
 patterns=visuals.steps;ready=true;identity();return true;
}).catch(err=>{console.error('Module 4 library failed',err);const a=document.getElementById('cevniLessonArea');if(a)a.innerHTML='<div class="cvLessonShell"><h2>Module 4 could not load</h2><p>Check your connection and reload the page.</p></div>';throw err});
function escapeAttribute(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function art(x){if(!x)return '';return '<figure class="pw166Art"><div class="pw166Name">'+escapeText(x.name)+'</div><div class="pw169VisualPair">'+x.items.map(item=>'<div><img src="'+escapeAttribute(item.src)+'" alt="'+escapeAttribute(item.alt)+'"><b>'+escapeText(item.label)+'</b></div>').join('')+'</div><figcaption>'+escapeText(x.note)+' <small>'+escapeText(x.footer)+'</small></figcaption></figure>'}
const style=document.createElement('style');style.textContent='#cevniPage .pw166Art{margin:12px 0 0;padding:12px;background:#031923;border:1px solid #3795b4;border-radius:12px;text-align:center}#cevniPage .pw166Name{font-size:13px;font-weight:900;color:#b5efff}#cevniPage .pw166Art figcaption{font-size:12px;color:#c8dce4}#cevniPage .pw169VisualPair{display:flex;justify-content:center;gap:24px;flex-wrap:wrap;margin:8px auto 10px}#cevniPage .pw169VisualPair>div{flex:1 1 170px;max-width:250px}#cevniPage .pw169VisualPair img{display:block;width:100%;height:112px;max-width:150px;margin:auto}#cevniPage .pw169VisualPair b{display:block;font-size:12px;color:#deeff6;line-height:1.35}';document.head.appendChild(style);
let currentDrill=0,drillCorrect=false;
function escapeText(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderDrill(n){
 currentDrill=n;drillCorrect=false;
 const area=document.getElementById('cevniLessonArea');if(!area)return;
 const item=DRILL[n],opts=item[1].map((v,i)=>({v,ok:i===item[2]}));
 for(let k=opts.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[opts[k],opts[j]]=[opts[j],opts[k]]}
 area.innerHTML='<div class="cvLessonShell"><div class="cvLessonTop"><div><div class="ver">MODULE 04 • RECOGNITION REHEARSAL</div><h2>Read the complete display</h2><p class="cevniLead">Ten questions using only concepts taught in this module. Work through each answer before the module check.</p></div><div class="cvLessonCounter">'+(n+1)+' / '+DRILL.length+'</div></div><div class="cvLessonProgress"><i style="width:'+Math.round(n/DRILL.length*100)+'%"></i></div><div class="cevniKnowledge cvKnowledgeOnly"><h3>'+escapeText(item[0])+'</h3><div class="cevniAnswers">'+opts.map((o,i)=>'<button data-correct="'+o.ok+'" onclick="pw167Answer(this)">'+String.fromCharCode(65+i)+' • '+escapeText(o.v)+'</button>').join('')+'</div><div id="pw167Feedback"></div></div><div class="cvLessonNav"><button onclick="cevniOpenLesson(3,'+Math.max(0,m.sections.length-1)+')">← LAST BRIEFING</button><span></span><button id="pw167Next" style="display:none" onclick="'+(n<DRILL.length-1?'pw167Next()':'cevniOpenLesson(3,'+(m.sections.length+1)+')')+'">'+(n<DRILL.length-1?'NEXT QUESTION →':'MODULE CHECK →')+'</button></div></div>';
 area.scrollIntoView({behavior:'smooth',block:'start'});identity();
}
window.pw167Answer=function(btn){
 if(drillCorrect)return;
 const ok=btn.dataset.correct==='true',fb=document.getElementById('pw167Feedback');
 if(!ok){btn.disabled=true;btn.classList.add('bad');if(fb)fb.textContent='Review the full display and try another answer.';return}
 drillCorrect=true;btn.classList.add('good');
 document.querySelectorAll('#cevniLessonArea .cevniAnswers button').forEach(x=>x.disabled=true);
 if(fb)fb.textContent=DRILL[currentDrill][3];
 const next=document.getElementById('pw167Next');if(next)next.style.display='';
};
window.pw167Next=function(){if(drillCorrect&&currentDrill<DRILL.length-1)renderDrill(currentDrill+1)};
const prior=window.cevniOpenLesson;
window.cevniOpenLesson=function(i,step=0){
 if(i===3&&!ready){const area=document.getElementById('cevniLessonArea');if(area)area.innerHTML='<div class="cvLessonShell"><p>Loading the Module 4 library…</p></div>';readyPromise.then(()=>window.cevniOpenLesson(i,step)).catch(()=>{});return}
 if(i===3&&step===m.sections.length){renderDrill(0);return}
 const result=(i===3&&step>m.sections.length)?prior.call(this,3,m.sections.length):prior.apply(this,arguments);
 identity();
 if(i===3&&step<m.sections.length){
  const area=document.getElementById('cevniLessonArea'),card=area&&area.querySelector('.cvBriefingCard');
  if(card&&patterns[step])card.insertAdjacentHTML('beforeend',art(patterns[step]));
 }
 return result;
};
function identity(){window.PROJECT_WATCH_BUILD=BUILD;const v=document.getElementById('pwVisibleBuild');if(v)v.textContent='BUILD '+BUILD;document.title='Project Watch '+BUILD}
function start(){const a=document.getElementById('cevniLessonArea');if(a)new MutationObserver(()=>setTimeout(identity,0)).observe(a,{childList:true,subtree:true});identity()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.PW1710_M04={build:BUILD,source:'CEVNI Rev.6 Chapter 3 / Annex 3',phase:'library-preview',questionBankIntegrated:true,visualsAssessmentReady:false,module3Changed:false};
})();
