(function(){
 'use strict';
 const data=window.PW_SAFETY_AWARENESS;
 const key='pw-safety-awareness-reviewed-v1';
 let current=0,quizChoices=[],submitted=false;
 function completed(){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v.filter(x=>data.lessons.some(l=>l.id===x)):[]}catch(_){return []}}
 function save(id){const done=new Set(completed());done.add(id);try{localStorage.setItem(key,JSON.stringify([...done]))}catch(_){}updateNav()}
 function updateNav(){
  const done=completed(),nav=document.getElementById('pwSafetyLessonNav');if(!nav)return;
  nav.replaceChildren();
  data.lessons.forEach((l,i)=>{const b=document.createElement('button');b.type='button';b.textContent=String(i+1).padStart(2,'0')+'  '+l.title;b.className=(current===i?'active ':'')+(done.includes(l.id)?'completed':'');b.setAttribute('aria-current',current===i?'step':'false');b.addEventListener('click',()=>showLesson(i));nav.append(b)});
  const progress=document.getElementById('pwSafetyProgress');if(progress)progress.textContent=done.length+' / '+data.lessons.length+' LESSONS REVIEWED';
 }
 function showLesson(i,scroll=true){
  current=i;submitted=false;updateNav();const l=data.lessons[i],root=document.getElementById('pwSafetyContent');if(!root)return;
  root.innerHTML='<div class="homeEyebrow">LESSON '+String(i+1).padStart(2,'0')+' / '+data.lessons.length+'</div><h2>'+l.title+'</h2><p class="pwSafetyLead">'+l.lead+'</p><div class="pwSafetyVisualPair"><figure><img src="'+l.image+'" alt="'+l.alt+'" loading="lazy"><figcaption>AT A GLANCE</figcaption></figure>'+(l.photo?'<figure><img src="'+l.photo+'" alt="'+l.photoAlt+'" loading="lazy"><figcaption>'+l.photoCaption+'</figcaption></figure>':'')+'</div><div class="pwSafetyPoints">'+l.points.map(p=>'<div class="pwSafetyPoint"><h3>'+p[0]+'</h3><p>'+p[1]+'</p></div>').join('')+'</div><div class="pwSafetyScenario"><b>ON THE WATER</b><p>'+l.scenario+'</p></div><div class="pwSafetyActions"><button type="button" id="pwSafetyMark">MARK LESSON REVIEWED ✓</button><button type="button" class="secondary" id="pwSafetyNext">'+(i<data.lessons.length-1?'NEXT LESSON →':'KNOWLEDGE CHECK →')+'</button></div>';
  root.querySelector('#pwSafetyMark').addEventListener('click',()=>{save(l.id);root.querySelector('#pwSafetyMark').textContent='REVIEWED ✓'});
  root.querySelector('#pwSafetyNext').addEventListener('click',()=>i<data.lessons.length-1?showLesson(i+1):showQuiz());
  if(scroll)root.scrollIntoView({block:'start',behavior:'smooth'});
 }
 function shuffledChoices(){return data.questions.map(q=>{const a=q.choices.map((_,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a})}
 function showQuiz(){
  current=-1;updateNav();submitted=false;quizChoices=shuffledChoices();const root=document.getElementById('pwSafetyContent');if(!root)return;
  root.innerHTML='<div class="homeEyebrow">ORIGINAL PROJECT WATCH ASSESSMENT</div><h2>Safety knowledge check</h2><p class="pwSafetyLead">12 questions drawn only from these six lessons. Choose one answer for each question, then review your reasoning. This is practice, not a certificate.</p><form id="pwSafetyQuizForm">'+data.questions.map((q,i)=>'<fieldset class="pwSafetyQuestion"><legend>'+(i+1)+'. '+q.q+'</legend>'+(q.image?'<img class="pwSafetyQuestionImage" src="'+q.image+'" alt="'+q.imageAlt+'" loading="lazy">':'')+quizChoices[i].map((choice,j)=>'<label><input type="radio" name="safety-q'+i+'" value="'+choice+'"> '+q.choices[choice]+'</label>').join('')+'<p class="feedback" id="pwSafetyFeedback'+i+'" hidden></p></fieldset>').join('')+'<button type="submit">CHECK ANSWERS →</button><div id="pwSafetyQuizResult" role="status" aria-live="polite"></div></form>';
  root.querySelector('form').addEventListener('submit',grade);root.scrollIntoView({block:'start',behavior:'smooth'});
 }
 function grade(e){
  e.preventDefault();const form=e.currentTarget,answers=data.questions.map((_,i)=>form.querySelector('input[name="safety-q'+i+'"]:checked'));
  if(answers.some(a=>!a)){const out=document.getElementById('pwSafetyQuizResult');out.textContent='Answer all 12 questions before checking.';out.scrollIntoView({block:'nearest',behavior:'smooth'});return}
  if(submitted)return;submitted=true;let score=0;
  answers.forEach((a,i)=>{const q=data.questions[i],correct=Number(a.value)===q.correct;if(correct)score++;const field=a.closest('fieldset');field.querySelectorAll('input').forEach(input=>{input.disabled=true;const label=input.closest('label');if(Number(input.value)===q.correct)label.classList.add('correct');else if(input.checked)label.classList.add('incorrect')});const feedback=field.querySelector('.feedback');feedback.hidden=false;feedback.textContent=(correct?'Correct. ':'Review this. ')+q.why});
  const out=document.getElementById('pwSafetyQuizResult');out.className='pwSafetyResults';out.innerHTML='<b>'+score+' / '+data.questions.length+'</b><p>'+((score>=10)?'Strong understanding. Revisit any question you missed.':'Review the lessons behind the missed answers and try again.')+'</p><button type="button" id="pwSafetyRetry">TRY AGAIN ↻</button>';out.querySelector('button').addEventListener('click',showQuiz);out.scrollIntoView({block:'start',behavior:'smooth'});
 }
 function init(){if(!data||!document.getElementById('safetyPage'))return;const links=document.getElementById('pwSafetySourceLinks');Object.values(data.sources).forEach(s=>{const a=document.createElement('a');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=s.label+' ↗';links.append(a)});showLesson(0,false)}
 window.pwSafetyOpen=function(){showModule('safety');if(!document.getElementById('pwSafetyLessonNav').children.length)init();document.getElementById('moduleContextNo').textContent='SA';document.getElementById('moduleContextTitle').textContent='Safety Awareness at Sea';document.getElementById('moduleContextDesc').textContent='Six visual lessons and an original knowledge check.';document.getElementById('moduleContextState').textContent='INDEPENDENT PATHWAY'};
 window.pwSafetyShowQuiz=showQuiz;
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
