(function(){
'use strict';
const BUILD='1.67.0-M04-EXPANDED-REVIEW';
if(typeof CEVNI_MODULES==='undefined'||!CEVNI_MODULES[3])return;
const m=CEVNI_MODULES[3];
m.desc='Read a complete CEVNI vessel display by aspect, operation and formation. Learn the day and night signals before assessment.';
m.sections=[
 ['READ THE WHOLE DISPLAY','Begin with viewing aspect, vessel type and operation. Describe every visible light or shape, its colour, number and position before assigning a meaning. A single colour can belong to more than one vessel.'],
 ['LIGHT SECTORS AND ASPECT','An all-round light covers 360°. A masthead light covers 225° forward; sidelights each cover 112.5° and the stern light covers 135° aft. A hidden light cannot be used as evidence from your aspect.'],
 ['MOTORIZED VESSEL PROCEEDING ALONE','Article 3.08: learn the masthead, sidelights and stern-light arrangement as a complete vessel display. From directly ahead, the white masthead and the red and green sidelights may be visible; the stern light is not.'],
 ['SMALL CRAFT HAVE THEIR OWN RULE','Article 3.13 contains alternatives for small craft. First identify whether the craft qualifies and how it is propelled. Do not blindly apply the full-size motor-vessel pattern to every boat.'],
 ['SAIL AND MOTOR-SAILING','Article 3.12: connect night marking to propulsion and aspect. A vessel using sail and mechanical propulsion at the same time carries a black cone point downwards by day. Sails alone do not establish that the engine is stopped.'],
 ['LEADING AND TOWED VESSELS','Article 3.09: the towing leader and the towed units form one convoy. The leader has the prescribed vertical masthead pair and yellow stern light in place of the usual white one; read the tow’s full length and arrangement.'],
 ['PUSHED CONVOYS','Article 3.10: the head of a pushed convoy has three masthead lights forming an equilateral triangle with a horizontal base. Identify the complete rigid formation before choosing a passing action.'],
 ['SIDE-BY-SIDE FORMATIONS','Article 3.11 has its own arrangement for vessels coupled side by side. Do not classify a moored raft, a pushed convoy or an ordinary tow as this formation merely because vessels appear close together.'],
 ['DANGEROUS-SUBSTANCE MARKING','Article 3.14 adds blue lights by night or downward blue cones by day to the ordinary marking. One, two and three signals are different categories; two relate to specified health-hazard substances under ADN.'],
 ['FERRIES AND PASSENGER MARKS','Article 3.16: a ferry not moving independently shows a bright green light above a bright white light, both all-round, by night; its day marking is a green ball. A ferry moving independently also has the prescribed sidelights and stern light. Article 3.15 separately covers the yellow bicone of qualifying passenger vessels.'],
 ['STATIONARY VESSELS','Article 3.20: identify a vessel at rest from its prescribed white light or permitted arrangement. Size, berth position and local provisions can affect the detail. Do not assume that every solitary white light is an underway vessel.'],
 ['FLOATING EQUIPMENT AT WORK','Article 3.25: two green lights (or day bicones) identify the side where the fairway is clear. The obstructed side may carry the prescribed red signal. A distinct red-over-white arrangement is used where protection from wash is required: do not treat it as a normal clear-side indication.'],
 ['ABILITY TO MANOEUVRE LIMITED BY WORK','Article 3.34: a vessel whose ability to manoeuvre is limited by work or underwater operations uses red–white–red all-round lights vertically and ball–bicone–ball by day. When passage sides are marked, two green indicate the clear side and two red the obstruction side.'],
 ['FISHING OPERATIONS','Article 3.35: a trawler shows green above white all-round lights; fishing other than trawling uses red above white. The trawler day shape is two black cones point to point. Identify the actual operation and full marking.'],
 ['DISTRESS AND DIVING','Article 3.30 includes a red hand or parachute flare among visual distress signals. Article 3.36 has additional marking for underwater diving. Treat these as operational status, and distinguish distress from ordinary navigation lights.'],
 ['GREEN OVER WHITE: FERRY OR TRAWLER?','The same two colours in the same vertical order can be part of two different CEVNI displays. A non-self-propelled ferry is identified with ferry context and a green ball by day. A trawler is engaged in fishing and uses two black cones point to point by day. Never identify either from the pair alone.'],
 ['LOCAL VARIATIONS AND FINAL READ','Chapter 9 allows specified regional or national departures. Before navigating, check the competent authority’s current provisions. Combine the full display with aspect, vessel, operation, fairway situation and local rule.']
];
m.check=['You see a green light above a white all-round light at night. What is the safest conclusion?',['Identify the vessel, operation and any additional signals before deciding whether it is a ferry or trawler','It must be a trawler','It must be a ferry'],0];
const patterns={
 2:{name:'Directly ahead · ordinary motorized vessel',lights:[['W',50,25],['R',24,77],['G',76,77]],note:'The stern light is outside this viewing sector.'},
 4:{name:'Day marking · sail plus machinery',shape:'cone',note:'Black cone, point downwards.'},
 6:{name:'Head of a pushed convoy',lights:[['W',50,18],['W',30,62],['W',70,62]],note:'Three masthead lights: one above two forming a horizontal base.'},
 8:{name:'Additional blue marking · two-signal category',lights:[['B',50,25],['B',50,70]],note:'Two additional blue all-round lights; ordinary vessel marking still applies.'},
 9:{name:'Ferry not moving independently',lights:[['G',50,28],['W',50,72]],note:'Bright green above bright white, both all-round. Day marking: green ball.'},
 10:{name:'Stationary vessel · basic night cue',lights:[['W',50,50]],note:'Ordinary all-round white; article-specific alternatives must be considered.'},
 11:{name:'Floating equipment · fairway sides',lights:[['G',75,25],['G',75,68],['R',25,25]],note:'Clear side: two green. Obstructed side: prescribed red signal. Schematic shows the basic arrangement.'},
 12:{name:'Work-limited ability to manoeuvre',lights:[['R',50,14],['W',50,45],['R',50,76],['G',82,35],['G',82,70],['R',18,35],['R',18,70]],note:'Red–white–red status; green and red sides where applicable.'},
 13:{name:'Trawler · night marking',lights:[['G',50,30],['W',50,70]],note:'Green above white; additional marking and aspect can matter.'},
 15:{name:'Day-shape contrast · ferry and trawler',shape:'compare',note:'Ferry: green ball. Trawler: two black cones point to point. At night both can show green over white.'}
};
const colour={W:'#fff',R:'#f45c60',G:'#47e693',Y:'#ffd15c',B:'#499fff'};
function art(x){
 if(!x)return '';
 if(x.shape==='compare')return '<figure class="pw166Art"><div class="pw166Name">'+x.name+'</div><div style="display:flex;justify-content:center;gap:22px;flex-wrap:wrap"><div><svg viewBox="0 0 100 104" role="img" aria-label="Ferry green ball"><circle cx="50" cy="52" r="18" fill="#47e693" stroke="#fff" stroke-width="2"/></svg><b>Ferry · green ball</b></div><div><svg viewBox="0 0 100 104" role="img" aria-label="Trawler two black cones point to point"><polygon points="20,16 80,16 50,52" fill="#101820" stroke="#fff" stroke-width="2"/><polygon points="50,52 20,88 80,88" fill="#101820" stroke="#fff" stroke-width="2"/></svg><b>Trawler · point-to-point cones</b></div></div><figcaption>'+x.note+' <small>Teaching schematic; exact Annex 3 plate check pending.</small></figcaption></figure>';
 const body=x.shape==='cone'?'<polygon points="50,90 17,18 83,18" fill="#101820" stroke="#fff" stroke-width="2"/>':
 '<path d="M8 96h84" stroke="#87b5cc" stroke-width="2"/>'+x.lights.map(v=>'<circle cx="'+v[1]+'" cy="'+v[2]+'" r="7" fill="'+colour[v[0]]+'" stroke="#fff" stroke-width="1.2"/>').join('');
 return '<figure class="pw166Art"><div class="pw166Name">'+x.name+'</div><svg viewBox="0 0 100 104" role="img" aria-label="'+x.name+'">'+body+'</svg><figcaption>'+x.note+' <small>Teaching schematic; exact Annex 3 plate check pending.</small></figcaption></figure>';
}
const style=document.createElement('style');style.textContent='#cevniPage .pw166Art{margin:12px 0 0;padding:12px;background:#031923;border:1px solid #3795b4;border-radius:12px;text-align:center}#cevniPage .pw166Art svg{display:block;width:100%;height:150px;max-width:320px;margin:auto}#cevniPage .pw166Name{font-size:13px;font-weight:900;color:#b5efff}#cevniPage .pw166Art figcaption{font-size:12px;color:#c8dce4}';document.head.appendChild(style);
const DRILL=[
 ['From directly ahead, which ordinary light should not be expected?',['The stern light','Both sidelights','The masthead light'],0,'The stern light covers the after sector.'],
 ['A vessel is sailing and also using its engine. Which day shape identifies this?',['A black cone point downwards','A green ball','Two black cones point to point'],0,'The point-down black cone marks simultaneous sail and machinery.'],
 ['What replaces the normal white stern light on the tow-leading motorized vessel?',['A yellow stern light','A blue all-round light','A red stern light'],0,'Article 3.09 specifies a yellow stern light for the tow leader.'],
 ['What arrangement is distinctive at the head of a pushed convoy?',['Three masthead lights in a triangle','Green over white','One blue light'],0,'The three masthead lights form a triangle with a horizontal base.'],
 ['Two blue all-round lights are which additional marking family?',['Specified health-hazard substances','An ordinary ferry','A fishing trawler'],0,'Article 3.14 ties the two blue lights to the specified ADN health-hazard category.'],
 ['Which side of floating equipment is indicated as clear in the basic work display?',['The side marked with two green lights','The side marked with a red light','The side with no marking'],0,'Article 3.25 places two green signals on the clear side.'],
 ['A work vessel shows red–white–red vertically. What does the central pattern tell you?',['Its ability to manoeuvre is limited by its work','It is a non-self-propelled ferry','It is an ordinary vessel at rest'],0,'Article 3.34 identifies a vessel limited in its ability to manoeuvre by work.'],
 ['What is the trawler’s day shape?',['Two black cones point to point','A green ball','A single downward blue cone'],0,'Article 3.35 prescribes two black cones point to point.'],
 ['A green-over-white pair appears at night. What must you establish before naming the vessel?',['Vessel and operation context plus any additional marking','Only whether the green lamp is bright','That it must be a trawler'],0,'Ferry and trawler displays can share the pair.'],
 ['Why can a stationary vessel not be classified from one white light alone?',['Other prescribed arrangements and vessel context may apply','All white lights identify ferries','One white light always means making way'],0,'Article 3.20 includes permitted arrangements and qualifications.']
];
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
window.PW1660_M04={build:BUILD,source:'CEVNI Rev.6 Chapter 3 / Annex 3',phase:'teaching-review',questionBankIntegrated:false,visualsAssessmentReady:false,module3Changed:false};
})();
