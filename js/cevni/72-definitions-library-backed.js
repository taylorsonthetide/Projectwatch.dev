
const CEVNI_14717_DEFINITIONS=window.PW_CEVNI_EARLY_TEACHING.definitions;
const CEVNI_14717_FAMILY_NAMES={I:'TYPES OF VESSELS',II:'CONVOYS',III:'LIGHT & SOUND SIGNALS',IV:'OTHER TERMS'};
function cevni14717TeachingSections(){
 const intro=[
 ['ARTICLE 1.01 — HOW TO LEARN THE DEFINITIONS','CEVNI uses defined terms throughout the later rules. We will learn them in four families, then reuse them in recognition, sound, visual and scenario work. A definition is taught here before it is allowed to become an assessment point.'],
 ['FAMILY 1 — TYPES OF VESSELS','First learn how CEVNI classifies craft. Pay particular attention to definitions that change with use: a sailing vessel using mechanical propulsion at the same time is treated as motorized, and a hull under 20 m is not automatically “small craft” because exclusions apply.'],
 ['FAMILY 2 — CONVOYS','Next learn to read the complete traffic unit: towed, pushed or side-by-side. Later practical exercises will ask you to recognise the formation before applying conduct rules.'],
 ['FAMILY 3 — LIGHT & SOUND TERMS','These definitions establish the vocabulary used later in Lights & Day Signals and Sound Lab. Here we learn what the terms mean; the dedicated libraries will teach recognition and rehearsal.'],
 ['FAMILY 4 — OPERATIONAL TERMS','Finally learn the terms used repeatedly in navigation rules: stationary, under way, reduced visibility, safe speed, fairway, banks, upstream/downstream, radar and Inland AIS.']
 ];
 return intro.concat(CEVNI_14717_DEFINITIONS.map((d,idx)=>[`${d[0]}.${String(idx+1).padStart(2,'0')} — ${d[1]}`,`${d[2]}\n\nPROJECT WATCH TEACHING POINT: ${d[3]}`]));
}
function cevni14717InstallCourseContent(){
 if(!window.CEVNI_MODULES||!CEVNI_MODULES[1])return;
 CEVNI_MODULES[1].desc='Learn the defined inland vocabulary first, then recognise it in vessels, formations, signals and real waterway situations.';
 CEVNI_MODULES[1].sections=cevni14717TeachingSections();
 CEVNI_MODULES[1].check=['DEVELOPMENT GATE — Article 1.01 assessment is not released yet.',['Return to the teaching route; recognition and practical dependencies must be built first.'],0];
}
cevni14717InstallCourseContent();
const cevni14717OpenLessonBase=window.cevniOpenLesson;
window.cevniOpenLesson=function(i,step=0){
 if(i===1 && step>=CEVNI_MODULES[1].sections.length){
   const a=document.getElementById('cevniLessonArea'); if(!a)return;
   a.innerHTML=`<div class="cvLessonShell"><div class="cvLessonTop"><div><div class="ver">MODULE 02 • DEVELOPMENT GATE</div><h2>Vessels, Marks & Definitions</h2><p class="cevniLead">Article 1.01 teaching is installed. Assessment remains locked until recognition/rehearsal and practical dependencies are built.</p></div><div class="cvLessonCounter">TEACH FIRST</div></div><div class="cvLessonProgress"><i style="width:100%"></i></div><div class="cvNoAssess">NO QUESTION RELEASED — this is deliberate. Next build layers recognition and guided practice onto the definitions before any knowledge check is permitted.</div><div class="cvLessonNav"><button class="cvClose" onclick="cevniCloseLesson()">CLOSE</button><button class="cvBack" onclick="cevniOpenLesson(1,${CEVNI_MODULES[1].sections.length-1})">← LAST BRIEFING</button><span></span></div></div>`;
   return;
 }
 cevni14717OpenLessonBase(i,step);
 if(i===1 && step<CEVNI_MODULES[1].sections.length){
   const card=document.querySelector('#cevniLessonArea .cvBriefingCard');
   if(card){
     const p=card.querySelector('p');
     if(p){const parts=p.textContent.split('PROJECT WATCH TEACHING POINT:'); if(parts.length>1){p.textContent=parts[0].trim();const tp=document.createElement('div');tp.className='cvTeachPoint';tp.innerHTML='<b>PROJECT WATCH TEACHING POINT</b><br>'+parts.slice(1).join('PROJECT WATCH TEACHING POINT:').trim();p.after(tp);}}
     const chip=document.createElement('span');chip.className='cvSourceChip';chip.textContent='SOURCE • CEVNI REV.6 • ARTICLE 1.01';card.appendChild(chip);
   }
 }
};
function cevni14717InjectRegister(){
 const host=document.querySelector('#cevniPage .cevniShell')||document.getElementById('cevniPage'); if(!host||document.getElementById('cevni14717Panel'))return;
 const panel=document.createElement('section');panel.id='cevni14717Panel';panel.className='cv101Panel';
 const counts={I:0,II:0,III:0,IV:0};CEVNI_14717_DEFINITIONS.forEach(d=>counts[d[0]]++);
 panel.innerHTML=`<div class="cv101Eyebrow">PRODUCTION CONTENT · ARTICLE 1.01 · v1.0.0</div><h3>DEFINITIONS → LEARNER TEACHING INVENTORY</h3><div class="cv101Rule">SOURCE DEFINITION → TEACHING BRIEFING → RECOGNITION / REHEARSAL → GUIDED PRACTICE → CONTEXT PRACTICE → ASSESSMENT</div><div class="cv101Summary"><div><b>${CEVNI_14717_DEFINITIONS.length}</b>definition records</div><div><b>4</b>teaching families</div><div><b>${CEVNI_MODULES[1].sections.length}</b>Module 02 briefings</div><div><b>0</b>questions released</div></div><div class="cv101Families">${Object.keys(counts).map(k=>`<article class="cv101Family"><span>FAMILY ${k}</span><h4>${CEVNI_14717_FAMILY_NAMES[k]}</h4><p>${counts[k]} individual source definitions now represented as learner teaching records.</p></article>`).join('')}</div><div class="cv101Foot"><b>Course placement:</b> Article 1.01 definitions are learner-facing content in Module 02 — Vessels, Marks & Definitions. Cross-links are retained for later modules: signal terminology feeds Lights & Day Signals and Sound Lab; operational terms feed Rules of the Road, radar/AIS and practical scenarios. Assessment is intentionally withheld until those dependencies exist.</div>`;
 const anchor=document.getElementById('cevniChapter1Audit'); if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(panel,anchor.nextSibling); else host.appendChild(panel);
}
document.addEventListener('DOMContentLoaded',()=>{setTimeout(cevni14717InjectRegister,10);window.PROJECT_WATCH_BUILD='1.47.17-CEVNI-ARTICLE101-TEACHING';const vb=document.getElementById('pwVisibleBuild');if(vb)vb.textContent='BUILD 1.47.17-CEVNI-ARTICLE101-TEACHING';});
