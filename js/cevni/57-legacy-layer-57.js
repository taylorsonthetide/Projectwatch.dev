
(()=>{
window.PROJECT_WATCH_BUILD='1.49.0-CEVNI-VISUAL-CURRICULUM-FOUNDATION';
const PW1490_SOURCES={rev6:'UNECE CEVNI Revision 6 + Corrigenda 1/2',annex7:'CEVNI Annex 7',annex8:'CEVNI Annex 8',ch3:'CEVNI Chapter 3 / Annex 3',signi:'UNECE SIGNI context',local:'Competent authority / national-local rules'};
const PW1490_SIGN_FAMILIES=[
 {code:'A',title:'Prohibitory',teach:'Something is prohibited. Treat the instruction as a restriction, not advice.',source:'annex7'},
 {code:'B',title:'Mandatory',teach:'An action or direction is prescribed. Identify the instruction early enough to comply.',source:'annex7'},
 {code:'C',title:'Restrictive',teach:'A navigational dimension or condition is restricted. Compare the displayed value with the vessel.',source:'annex7'},
 {code:'D',title:'Recommendatory',teach:'Recommended navigation is indicated, including recommended openings or areas.',source:'annex7'},
 {code:'E',title:'Informative',teach:'Information relevant to navigation, facilities, conditions or permitted actions.',source:'annex7'}
];
const PW1490_SIGNS=[
 {code:'A.1',title:'No entry',meaning:'General prohibition on entry.',art:0,source:'annex7'},
 {code:'A.2',title:'No overtaking',meaning:'Overtaking is prohibited where the sign applies.',art:1,source:'annex7'},
 {code:'B.1',title:'Proceed in direction shown',meaning:'Mandatory direction/course instruction.',art:2,source:'annex7'},
 {code:'B.7',title:'Give a sound signal',meaning:'Mandatory requirement to give the indicated sound signal.',art:3,source:'annex7'},
 {code:'C.1',title:'Depth limited',meaning:'Available depth is restricted; read any displayed figure with the restriction.',art:4,source:'annex7'},
 {code:'D.1',title:'Recommended opening',meaning:'Identifies a recommended opening for passage.',art:5,source:'annex7'},
 {code:'E.1',title:'Entry permitted',meaning:'General indication that entry is permitted.',art:6,source:'annex7'},
 {code:'E.2',title:'Overhead cable crossing',meaning:'Warns/informs of an overhead cable crossing.',art:7,source:'annex7'},
 {code:'E.3',title:'Weir',meaning:'Identifies a weir.',art:null,source:'annex7'},
 {code:'E.4',title:'Ferry',meaning:'Identifies a ferry crossing; variants distinguish ferry operation.',art:null,source:'annex7'},
 {code:'E.5',title:'Berthing permitted',meaning:'Berthing is permitted on the side of the waterway where the sign is placed, subject to the applicable provision.',art:null,source:'annex7'}
];
const PW1490_MARKS=[
 {id:'bank',title:'Bank / fairway relationship',teach:'First establish where the navigable fairway lies relative to the physical banks. Bank is not automatically fairway edge.',source:'annex8',scene:'banks'},
 {id:'edge',title:'Fairway edge marking',teach:'Use the applicable bank/floating marks to build the safe navigable corridor before choosing a route.',source:'annex8',scene:'edges'},
 {id:'obstruction',title:'Obstruction and clear side',teach:'A hazard can close part of the waterway while another side remains available. Read the marking before committing.',source:'annex8',scene:'obstruction'},
 {id:'bridge',title:'Bridge approach marking',teach:'Approach marks and bridge signs work together. Identify the authorised/recommended opening before the manoeuvre becomes constrained.',source:'annex8',scene:'bridge'},
 {id:'bifurcation',title:'Bifurcation / route choice',teach:'Where the waterway divides, identify the navigable branch and any route-specific marking before altering course.',source:'annex8',scene:'split'},
 {id:'reference',title:'Reference points',teach:'Bank marks may also provide reference points for boatmasters; interpret them as part of the complete waterway picture.',source:'signi',scene:'reference'}
];
const PW1490_LIGHTS=[
 {id:'masthead',title:'Masthead light',teach:'White light visible over a 225° horizontal arc: from ahead to 22°30′ abaft the beam on each side.',kind:'arc',source:'ch3'},
 {id:'sides',title:'Side lights',teach:'Green to starboard and red to port; each visible over 112°30′ from ahead to 22°30′ abaft the beam on its side.',kind:'sides',source:'ch3'},
 {id:'stern',title:'Stern light',teach:'White light visible over a 135° horizontal arc centred astern.',kind:'stern',source:'ch3'},
 {id:'allround',title:'All-round light',teach:'A light visible through an uninterrupted horizontal arc of 360°.',kind:'all',source:'ch3'},
 {id:'aspect',title:'Aspect changes the picture',teach:'The same vessel presents different visible lights from ahead, abeam and astern. Describe what is actually visible before identifying the display.',kind:'aspect',source:'ch3'},
 {id:'daynight',title:'Day / night pairing',teach:'Project Watch will pair day marks and night displays by operational meaning instead of teaching two disconnected lists.',kind:'shapes',source:'ch3'}
];
const PW1490_STRUCTURES=[
 {id:'fixedbridge',title:'Fixed bridge • choose the opening',teach:'Read the complete sign/marking arrangement before committing to an opening. Recommended and prohibited indications are operationally different.',scene:'bridge',source:'rev6'},
 {id:'clearance',title:'Bridge • headroom decision',teach:'Compare actual air draught with applicable clearance/water-level information and any restriction before entering the constrained approach.',scene:'bridge',source:'rev6'},
 {id:'movable',title:'Movable bridge • signal state',teach:'Treat bridge signals as operating instructions. Do not infer permission from another vessel moving.',scene:'bridge',source:'rev6'},
 {id:'lockwait',title:'Lock • waiting position',teach:'Establish the waiting position, traffic signal and local procedure before drifting into the approach.',scene:'lock',source:'rev6'},
 {id:'lockentry',title:'Lock • entry preparation',teach:'Prepare lines, fenders and crew before entry and comply with the installation’s signals/instructions.',scene:'lock',source:'rev6'},
 {id:'lockinside',title:'Lock • control during level change',teach:'Maintain vessel control as the water level changes and follow the applicable lock-keeper/local instructions.',scene:'lock',source:'rev6'},
 {id:'weir',title:'Weir • recognise before route choice',teach:'A weir is a significant infrastructure hazard. Identify the marked navigable route and prohibitions before approach.',scene:'weir',source:'rev6'},
 {id:'local',title:'Local operating layer',teach:'Bridges, locks and weirs can be subject to competent-authority requirements. Core CEVNI teaching does not replace the applicable local procedure.',scene:'local',source:'local'}
];
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
 const sec=document.createElement('div');sec.id='cevniVisualSchool';sec.className='cevniSection';sec.innerHTML=`<div class="cv1490Shell"><div class="cv1490Top"><div><div class="ver">VISUAL CURRICULUM FOUNDATION • LIBRARY-DRIVEN</div><h2>See it → recognise it → use it</h2><p class="cevniLead">A source-aligned visual teaching layer for signs, fairway marking, vessel lights/day signals and infrastructure. This layer supplies the existing scenario engine; it does not create a second progression system.</p></div><span class="cv1490Pill">NO PROGRESSION LOGIC INSIDE</span></div><div class="cv1490Tabs"><button data-tab="signs" onclick="cv1490Render('signs')">ANNEX 7 • SIGNS</button><button data-tab="marks" onclick="cv1490Render('marks')">ANNEX 8 • MARKING</button><button data-tab="lights" onclick="cv1490Render('lights')">LIGHTS & DAY SIGNALS</button><button data-tab="structures" onclick="cv1490Render('structures')">BRIDGES / LOCKS / WEIRS</button><button onclick="cevniShow('scenarios');document.getElementById('cevniVisualSchool').style.display='none'">OPEN SIMULATOR →</button></div><div id="cv1490Content"></div><div class="cv1490Footer"><b>Architecture contract:</b> Signs own signs; Marks own waterway marking; Structures own bridges/locks/weirs; Vessels own vessel graphics/state; Sounds own audio; Scenarios reference those records; the Scenario Engine only renders/evaluates them. The locked 1.48.4 progression and Test Mode contracts are untouched.</div></div>`;
 const nav=page.querySelector('.cevniNav');if(nav){const b=document.createElement('button');b.textContent='VISUAL SCHOOL';b.onclick=()=>cv1490Open('signs');nav.appendChild(b)}
 const first=page.querySelector('.cevniSection');if(first)first.parentNode.insertBefore(sec,first);else page.appendChild(sec);
}
function cv1490Label(){const txt='BUILD 1.49.0-CEVNI-VISUAL-CURRICULUM-FOUNDATION';document.querySelectorAll('#cevniPage .pwBuild,.pwBuild,#cevniPage .build').forEach(x=>{if(/CEVNI|1\.4/i.test(x.textContent||''))x.textContent=txt});const vb=document.getElementById('pwVisibleBuild');if(vb)vb.textContent=txt}
cv1490Install();cv1490Label();setTimeout(()=>{cv1490Install();cv1490Label()},250);
})();
