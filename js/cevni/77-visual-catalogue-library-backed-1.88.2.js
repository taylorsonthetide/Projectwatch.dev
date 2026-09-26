
(()=>{
window.PROJECT_WATCH_BUILD='1.49.0-CEVNI-VISUAL-CURRICULUM-FOUNDATION';
const PW1490_SOURCES=window.PW_CEVNI_VISUAL_CATALOGUES.foundation.PW1490_SOURCES;
const PW1490_SIGN_FAMILIES=window.PW_CEVNI_VISUAL_CATALOGUES.foundation.PW1490_SIGN_FAMILIES;
const PW1490_SIGNS=window.PW_CEVNI_VISUAL_CATALOGUES.foundation.PW1490_SIGNS;
const PW1490_MARKS=window.PW_CEVNI_VISUAL_CATALOGUES.foundation.PW1490_MARKS;
const PW1490_LIGHTS=window.PW_CEVNI_VISUAL_CATALOGUES.foundation.PW1490_LIGHTS;
const PW1490_STRUCTURES=window.PW_CEVNI_VISUAL_CATALOGUES.foundation.PW1490_STRUCTURES;
window.PW_CEVNI_VISUAL_LIBRARIES={version:'1.0.0',sources:PW1490_SOURCES,signFamilies:PW1490_SIGN_FAMILIES,signs:PW1490_SIGNS,marks:PW1490_MARKS,lights:PW1490_LIGHTS,structures:PW1490_STRUCTURES};
function cv1490SignArt(r){if(r.art!==null&&window.CEVNI_SIGNS&&CEVNI_SIGNS[r.art])return `<div class="cv1490Sign">${CEVNI_SIGNS[r.art].svg}</div>`;return `<div class="cv1490Family">${r.code}</div>`}
function cv1490Scene(type){let extra='';if(type==='bridge')extra='<div class="cv1490Bridge"></div>';if(type==='obstruction')extra='<div class="mark" style="left:20%">×</div>';if(type==='split')extra='<div class="lane" style="left:50%;transform:rotate(18deg);transform-origin:bottom;height:130px"></div>';return `<div class="cv1490Scene"><div class="lane" style="left:33%"></div><div class="lane" style="left:66%"></div>${extra}<div class="boat"></div></div>`}
function cv1490LightArt(kind){if(kind==='shapes')return `<div class="cv1490Shape"><span class="cv1490Ball"></span><span class="cv1490Diamond"></span><span class="cv1490Cone"></span></div>`;let x=kind==='stern'?'50%':'50%';let dots=kind==='sides'?`<i class="cv1490Light cv1490Red" style="left:28%;top:45%"></i><i class="cv1490Light cv1490Green" style="right:28%;top:45%"></i>`:`<i class="cv1490Light cv1490White" style="left:${x};top:42%;transform:translateX(-50%)"></i>`;return `<div class="cv1490Lights">${dots}</div>`}
function cv1490Card(ver,title,body,visual,status='SOURCE-ALIGNED'){return `<article class="cv1490Card">${visual||''}<div class="ver">${ver}</div><h3>${title}</h3><p>${body}</p><span class="cv1490Status ${status==='ARTWORK QUEUED'?'queue':''}">${status}</span></article>`}
function cv1490Render(tab='signs'){
 const out=document.getElementById('cv1490Content');if(!out)return;document.querySelectorAll('.cv1490Tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));let html='';
 if(tab==='signs'){html=`<div class="cv1490Grid">${PW1490_SIGN_FAMILIES.map(x=>cv1490Card(`ANNEX 7 • FAMILY ${x.code}`,x.title,x.teach,`<div class="cv1490Family">${x.code}</div>`)).join('')}</div><div class="cv1490Footer"><b>Verified sign records</b> — existing source-aligned artwork is reused from the Signs Library. New signs remain text/source records until their artwork is verified; the course will not invent regulatory pictograms.</div><div class="cv1490Grid" style="margin-top:12px">${PW1490_SIGNS.map(x=>cv1490Card(`ANNEX 7 • ${x.code}`,x.title,x.meaning,cv1490SignArt(x),x.art===null?'ARTWORK QUEUED':'SOURCE-ALIGNED')).join('')}</div>`}
 if(tab==='marks')html=`<div class="cv1490Grid">${PW1490_MARKS.map(x=>cv1490Card('ANNEX 8 / SIGNI',x.title,x.teach,cv1490Scene(x.scene))).join('')}</div>`;
 if(tab==='lights')html=`<div class="cv1490Grid">${PW1490_LIGHTS.map(x=>cv1490Card('CHAPTER 3 / ANNEX 3',x.title,x.teach,cv1490LightArt(x.kind))).join('')}</div><div class="cv1490Footer"><b>Next visual layer:</b> individual vessel-operation displays will be added only from verified Chapter 3 / Annex 3 records, then paired with day marks and fed into recognition/scenario practice.</div>`;
 if(tab==='structures')html=`<div class="cv1490Grid">${PW1490_STRUCTURES.map(x=>cv1490Card('BRIDGES • LOCKS • WEIRS',x.title,x.teach,cv1490Scene(x.scene))).join('')}</div><div class="cv1490Footer"><b>Simulator integration:</b> these structure records are content records. The existing Waterway Scenario Engine renders referenced structure/sign/mark/vessel records rather than owning their regulatory meaning.</div>`;
 out.innerHTML=html;
}
window.cv1490Open=function(tab='signs'){
 document.querySelectorAll('#cevniPage .cevniSection').forEach(x=>x.classList.remove('active'));const s=document.getElementById('cevniVisualSchool');if(s){s.style.display='block';s.classList.add('active')}cv1490Render(tab);s?.scrollIntoView({behavior:'smooth',block:'start'});
};
window.cv1490Render=cv1490Render;
function cv1490Install(){
 const page=document.getElementById('cevniPage');if(!page||document.getElementById('cevniVisualSchool'))return;
 const sec=document.createElement('div');sec.id='cevniVisualSchool';sec.className='cevniSection';sec.innerHTML=`<div class="cv1490Shell"><div class="cv1490Top"><div><div class="ver">VISUAL CURRICULUM FOUNDATION • LIBRARY-DRIVEN</div><h2>See it → recognise it → use it</h2><p class="cevniLead">A source-aligned visual teaching layer for signs, fairway marking, vessel lights/day signals and infrastructure. This layer supplies the existing scenario engine; it does not create a second progression system.</p></div><span class="cv1490Pill">NO PROGRESSION LOGIC INSIDE</span></div><div class="cv1490Tabs"><button data-tab="signs" onclick="cv1490Render('signs')">ANNEX 7 • SIGNS</button><button data-tab="marks" onclick="cv1490Render('marks')">ANNEX 8 • MARKING</button><button data-tab="lights" onclick="cv1490Render('lights')">LIGHTS & DAY SIGNALS</button><button data-tab="structures" onclick="cv1490Render('structures')">BRIDGES / LOCKS / WEIRS</button><button onclick="cevniShow('scenarios');document.getElementById('cevniVisualSchool').style.display='none'">OPEN SIMULATOR →</button></div><div id="cv1490Content"></div><div class="cv1490Footer"><b>Architecture contract:</b> Signs own signs; Marks own waterway marking; Structures own bridges/locks/weirs; Vessels own vessel graphics/state; Sounds own audio; Scenarios reference those records; the Scenario Engine only renders/evaluates them. The course progression remains separate from this visual library.</div></div>`;
 const nav=page.querySelector('.cevniNav');if(nav){const b=document.createElement('button');b.textContent='VISUAL SCHOOL';b.onclick=()=>cv1490Open('signs');nav.appendChild(b)}
 const first=page.querySelector('.cevniSection');if(first)first.parentNode.insertBefore(sec,first);else page.appendChild(sec);
}
function cv1490Label(){const txt='BUILD 1.49.0-CEVNI-VISUAL-CURRICULUM-FOUNDATION';document.querySelectorAll('#cevniPage .pwBuild,.pwBuild,#cevniPage .build').forEach(x=>{if(/CEVNI|1\.4/i.test(x.textContent||''))x.textContent=txt});const vb=document.getElementById('pwVisibleBuild');if(vb)vb.textContent=txt}
cv1490Install();cv1490Label();setTimeout(()=>{cv1490Install();cv1490Label()},250);
})();
