const $=id=>document.getElementById(id);
export function flashPhase(elapsed,kind){
 const cycle=kind==='q'?15000:10000,interval=kind==='q'?1000:500,on=kind==='q'?300:150;
 const phase=((elapsed%cycle)+cycle)%cycle,number=Math.floor(phase/interval);
 return {on:number<9&&phase%interval<on,number:Math.min(number+1,9),gap:number>=9};
}
let frame=null,started=0;
function stopLight(){cancelAnimationFrame(frame);frame=null;$('lamp').classList.remove('on');$('light-play').textContent='Play light sequence';$('light-play').setAttribute('aria-pressed','false');$('flash-count').textContent='9 white flashes';}
function tick(now){const p=flashPhase(now-started,$('rhythm').value);$('lamp').classList.toggle('on',p.on);$('flash-count').textContent=p.gap?'Dark interval':`Flash ${p.number} / 9`;frame=requestAnimationFrame(tick);}
$('light-play').onclick=()=>{if(frame!==null){stopLight();return;}started=performance.now();$('light-play').textContent='Stop light sequence';$('light-play').setAttribute('aria-pressed','true');frame=requestAnimationFrame(tick);};
$('rhythm').onchange=()=>{stopLight();$('rhythm-caption').textContent=$('rhythm').value==='q'?'Q(9) 15s · quick':'VQ(9) 10s · very quick';};
for(const button of document.querySelectorAll('[data-view]'))button.onclick=()=>{stopLight();for(const tab of document.querySelectorAll('[data-view]')){const active=tab===button;tab.setAttribute('aria-pressed',String(active));$(tab.dataset.view).hidden=!active;}$('light-controls').hidden=button.dataset.view!=='night';};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopLight();});window.addEventListener('pagehide',stopLight);
function el(tag,text,cls){const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;}
fetch('../banks/public/west-cardinal.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(bank=>{
 let queue=[...bank],index=0,missed=new Set(),review=false,firstCorrect=0;
 function start(){queue=[...bank];index=0;missed=new Set();review=false;firstCorrect=0;render();}
 function finish(){const host=$('quiz');host.replaceChildren();$('quiz-progress').value=queue.length;$('quiz-status').textContent=review?'Review complete':`First pass: ${firstCorrect} of ${bank.length} correct`;
 host.append(el('h3',review?'You’ve revisited your missed questions.':'Your first pass is complete.'));
 host.append(el('p',review?'Keep practising until you can explain the colour bands, topmark, compass side and light rhythm without a prompt.':missed.size?`${missed.size} topic${missed.size===1?' needs':'s need'} another look. Review just those questions next.`:'All four correct on the first attempt. Try recognising the mark again without the labels.'));
 if(!review&&missed.size){const b=el('button','Review missed questions');b.onclick=()=>{queue=bank.filter(q=>missed.has(q.id));review=true;index=0;render();};host.append(b);}const reset=el('button','Practise all four again');reset.onclick=start;host.append(reset);
 }
 function render(){
 if(index>=queue.length){finish();return;}
 const q=queue[index],host=$('quiz');host.replaceChildren();$('quiz-progress').max=queue.length;$('quiz-progress').value=index;$('quiz-status').textContent=`${review?'Focused review':'Practice'} · Question ${index+1} of ${queue.length}`;
 const form=el('form'),fieldset=el('fieldset');fieldset.style.border='0';fieldset.style.padding='0';fieldset.style.margin='0';const legend=el('legend',q.prompt,'question');fieldset.append(legend);const options=el('div',null,'options');
 q.options.forEach((text,i)=>{const label=el('label'),input=el('input');input.type='radio';input.name='answer';input.value=i;label.append(input,el('span',text));options.append(label);});fieldset.append(options);form.append(fieldset);
 const check=el('button','Check answer'),next=el('button','Next question →');check.type='submit';next.type='button';next.hidden=true;const feedback=el('div');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');let first=true;
 form.append(check,next,feedback);host.append(form);
 form.onsubmit=e=>{e.preventDefault();const selected=form.querySelector('input:checked');if(!selected){feedback.className='feedback';feedback.textContent='Choose an answer first.';return;}
 const correct=Number(selected.value)===q.correct;if(first&&!review){if(correct)firstCorrect++;else missed.add(q.id);}first=false;
 feedback.replaceChildren();feedback.className='feedback'+(correct?' good':'');feedback.append(el('strong',correct?'Correct.':'Not quite.'));feedback.append(el('p',q.why));const link=el('a','Revisit the explanation ↑');link.href='#'+q.review;feedback.append(link);
 if(correct){fieldset.disabled=true;check.hidden=true;next.hidden=false;next.focus();}else{check.textContent='Check another answer';}
 };
 next.onclick=()=>{index++;render();const heading=host.querySelector('legend,h3');if(heading){heading.tabIndex=-1;heading.focus();}};
 }
 start();
}).catch(()=>{$('quiz-status').textContent='Practice could not load. Refresh to try again; the lesson above is still available.';});
