(function(){
'use strict';
const BUILD='1.66.0-M04-TEACHING-REVIEW';
if(typeof CEVNI_MODULES==='undefined'||!CEVNI_MODULES[3])return;
const m=CEVNI_MODULES[3];
m.desc='Read a complete CEVNI vessel display by aspect, operation and formation. Learn the day and night signals before assessment.';
m.sections=[
 ['READ A DISPLAY FROM YOUR ASPECT','Identify the vessel and your viewing aspect first. Record each visible light by colour, number, vertical order and position. A stern light cannot be seen directly ahead.'],
 ['ORDINARY MOTOR VESSEL','Article 3.08: a motorized vessel proceeding alone shows the prescribed masthead light, sidelights and stern light. From directly ahead the masthead and both sidelights can be visible; the stern light faces aft.'],
 ['SAIL WITH MACHINERY','Article 3.12(3): a vessel simultaneously using sail and mechanical propulsion displays a black cone with its point downwards by day. Do not infer this status from sails alone.'],
 ['TOWED AND PUSHED FORMATIONS','Articles 3.09–3.10: read the entire formation. A tow leader uses a yellow stern light instead of the ordinary white stern light; a pushed convoy has three masthead lights in a triangle at its head. These are different displays.'],
 ['BLUE DANGEROUS-SUBSTANCE MARKS','Article 3.14 adds the prescribed blue lights or downward cones to the normal marking. The number matters: two belong to the specified health-hazard category. Check the current article and ADN reference before associating a display with cargo.'],
 ['FERRY AND STATIONARY VESSELS','Articles 3.16 and 3.20: a ferry not moving independently displays green above white all-round lights at night. Stationary vessels have prescribed white-light marking with specified alternatives and exceptions.'],
 ['WORKING VESSELS AND CLEAR PASSAGE','Articles 3.25 and 3.34 distinguish floating equipment at work from a vessel restricted by its operation. Green signals identify the side where the fairway is clear; red signals identify the obstruction or prohibited side in the applicable display. Read the full arrangement.'],
 ['FISHING, DISTRESS AND LOCAL RULES','A trawler uses green over white all-round lights under Article 3.35. Article 3.30 includes a red flare as a distress signal. Chapter 9 allows specified regional or national variations: check the applicable local rules.']
];
const patterns={
 1:{name:'Ahead aspect · ordinary motorized vessel',lights:[['W',50,25],['R',24,77],['G',76,77]],note:'Stern light lies outside this viewing sector.'},
 2:{name:'Day shape · sail plus machinery',shape:'cone',note:'Black cone with point downwards.'},
 3:{name:'Formation comparison',lights:[['W',25,22],['W',25,56],['Y',25,88],['W',72,20],['W',57,54],['W',87,54]],note:'Left: tow leader; right: pushed-convoy head. Separate displays, shown side by side.'},
 4:{name:'Additional blue marking',lights:[['B',50,30],['B',50,70]],note:'Two additional blue signals; ordinary vessel marking also applies.'},
 5:{name:'Ferry not moving independently',lights:[['G',50,28],['W',50,72]],note:'Green above white; both all-round.'},
 6:{name:'Work-limited manoeuvrability',lights:[['R',50,18],['W',50,48],['R',50,78],['G',82,42],['G',82,75],['R',18,42],['R',18,75]],note:'Central red–white–red; green clear side and red obstruction side, where prescribed.'},
 7:{name:'Trawler by night',lights:[['G',50,30],['W',50,70]],note:'Green above white. Interpret with the vessel and activity.'}
};
const colour={W:'#fff',R:'#f45c60',G:'#47e693',Y:'#ffd15c',B:'#499fff'};
function art(x){
 if(!x)return '';
 const body=x.shape==='cone'?'<polygon points="50,90 17,18 83,18" fill="#101820" stroke="#fff" stroke-width="2"/>':
 '<path d="M8 96h84" stroke="#87b5cc" stroke-width="2"/>'+x.lights.map(v=>'<circle cx="'+v[1]+'" cy="'+v[2]+'" r="7" fill="'+colour[v[0]]+'" stroke="#fff" stroke-width="1.2"/>').join('');
 return '<figure class="pw166Art"><div class="pw166Name">'+x.name+'</div><svg viewBox="0 0 100 104" role="img" aria-label="'+x.name+'">'+body+'</svg><figcaption>'+x.note+'</figcaption></figure>';
}
const style=document.createElement('style');style.textContent='#cevniPage .pw166Art{margin:12px 0 0;padding:12px;background:#031923;border:1px solid #3795b4;border-radius:12px;text-align:center}#cevniPage .pw166Art svg{display:block;width:100%;height:150px;max-width:320px;margin:auto}#cevniPage .pw166Name{font-size:13px;font-weight:900;color:#b5efff}#cevniPage .pw166Art figcaption{font-size:12px;color:#c8dce4}';document.head.appendChild(style);
const prior=window.cevniOpenLesson;
window.cevniOpenLesson=function(i,step=0){
 const result=prior.apply(this,arguments);
 identity();
 if(i===3&&step<m.sections.length){
  const area=document.getElementById('cevniLessonArea'),card=area&&area.querySelector('.cvBriefingCard');
  if(card&&patterns[step])card.insertAdjacentHTML('beforeend',art(patterns[step]));
 }
 return result;
};
function identity(){window.PROJECT_WATCH_BUILD=BUILD;const v=document.getElementById('pwVisibleBuild');if(v)v.textContent='BUILD '+BUILD;document.title='Project Watch '+BUILD}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',identity,{once:true});else identity();
window.PW1660_M04={build:BUILD,source:'CEVNI Rev.6 Chapter 3 / Annex 3',phase:'teaching-review',questionBankIntegrated:false,visualsAssessmentReady:false,module3Changed:false};
})();
