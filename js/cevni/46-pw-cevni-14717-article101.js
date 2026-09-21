
const CEVNI_14717_DEFINITIONS=[
// I — Types of vessels
['I','Vessel','The umbrella CEVNI term covers inland craft and also includes small craft, ferry-boats, floating equipment and seagoing vessels.','Recognise this as the broad parent category.'],
['I','Motorized vessel','A craft using its own mechanical propulsion is motorized, subject to the limited CEVNI exceptions for engines used only for short local movements or handling while towed/pushed.','Do not decide from appearance alone; decide from how propulsion is being used.'],
['I','Floating equipment','A floating structure carrying machinery for work on waterways or in harbours, such as dredging or lifting plant.','Treat working plant separately from an ordinary navigating vessel.'],
['I','Ferry-boat','A vessel providing transport across a waterway and classed as a ferry-boat by the competent authority; a non-self-propelled vessel providing that service is still a ferry-boat.','Classification and service matter, not just propulsion.'],
['I','High-speed vessel','A motorized vessel other than small craft, certified as capable of more than 40 km/h relative to the water.','The certificate and threshold are part of the definition.'],
['I','Passenger vessel','A day-trip or cabin vessel constructed and equipped to carry more than 12 passengers.','Remember the more-than-12 passenger threshold.'],
['I','Pushed barge','A vessel designed or specially equipped to be pushed.','Recognise the intended mode of operation.'],
['I','Shipborne barge','A pushed barge designed to be carried aboard a seagoing vessel and then navigate inland waterways.','This is a particular pushed-barge type.'],
['I','Sailing vessel','A vessel proceeding under sail only. If sail and mechanical propulsion are used at the same time, CEVNI treats it as a motorized vessel.','This distinction changes which rules and signals may apply.'],
['I','Small craft','Generally a vessel with hull length under 20 m, measured without rudder or bowsprit, but specified towing/pushing craft, craft authorized for more than 12 passengers, ferry-boats and pushed barges are excluded.','Under 20 m is not the whole test; check the exclusions.'],
['I','Water bike','A mechanically propelled small craft designed for one or more persons and for skiing over the water or performing figures, including personal-watercraft-type craft.','It is a defined small-craft subtype.'],
['I','Sports or pleasure craft','A vessel used for sport or recreation rather than financial gain.','Purpose of use is the defining feature.'],
// II — Convoys
['II','Convoy','The collective term covering a towed convoy, pushed convoy or side-by-side formation.','First identify which convoy family you are looking at.'],
['II','Towed convoy','One or more vessels, floating establishments or assemblies of floating material towed by one or more motorized vessels; the towing motorized vessel forms part of the convoy as a tug.','Judge the whole connected traffic unit.'],
['II','Pushed convoy','A rigid assembly in which at least one vessel is ahead of the motorized vessel propelling it; guided articulation can still count as rigid for this definition.','Look for the pusher behind the pushed craft.'],
['II','Side-by-side formation','Vessels coupled alongside one another with none positioned ahead of the motorized vessel propelling the assembly.','Distinguish alongside propulsion from a pushed convoy.'],
// III — Light and sound signals
['III','Signal-light colours','White, red, green, yellow and blue signal lights use the technical colour standards referenced by CEVNI.','Recognition later belongs in Lights & Day Signals.'],
['III','Signal-light intensity classes','CEVNI distinguishes strong, bright and ordinary lights using referenced technical intensity/range standards.','Intensity is a defined technical property, not a casual description.'],
['III','Scintillating / quick scintillating light','Scintillating lights flash 40–60 times per minute; quick scintillating lights 100–120 times per minute.','Learn the rhythm difference before visual assessment.'],
['III','Short / long blast','A short blast is about 1 second and a long blast about 4 seconds; consecutive blasts normally have about a 1-second interval.','This definition feeds directly into Sound Lab.'],
['III','Series of very short blasts','At least six very short blasts, each about a quarter-second, separated by roughly quarter-second intervals.','Hear this later as a rapid series, not ordinary short blasts.'],
['III','Three-tone signal','Three different-pitch blasts with no interval, about two seconds overall, repeated three times; the sequence rises from the lowest to highest note.','This is a distinct acoustic signal, not three ordinary short blasts.'],
// IV — Other terms
['IV','Floating establishment','A floating installation that is normally stationary, such as a dock, wharf, boat-shed or swimming-bath installation.','Normally stationary is the key distinction.'],
['IV','Assembly of floating material','A navigable raft, construction, assembly or object that is neither a vessel nor a floating establishment.','Use this category when the object can navigate but is not classed as the other two.'],
['IV','Stationary','A vessel, assembly of floating material or floating establishment is stationary when directly or indirectly anchored or made fast to the shore.','Stationary has a specific CEVNI meaning.'],
['IV','Under way / proceeding','Neither anchored, made fast to shore nor grounded. For these craft, “stop” is considered relative to the land.','Do not equate zero speed through water with being stationary under the definition.'],
['IV','Vessel engaged in fishing','A vessel fishing with gear that restricts manoeuvrability; trolling lines or other gear that does not restrict manoeuvrability do not qualify.','The effect of the fishing gear on manoeuvrability is decisive.'],
['IV','Night','The period between sunset and sunrise.','Use the regulatory definition, not an informal idea of darkness.'],
['IV','Day','The period between sunrise and sunset.','The counterpart to the CEVNI definition of night.'],
['IV','State of fatigue','A state resulting from insufficient rest or sickness and shown by abnormal behaviour or reaction speed.','This is an operational safety definition.'],
['IV','State of intoxication','A state resulting from alcohol, narcotics, medicines or similar substances, determined under applicable national law and practice.','The national legal layer matters here.'],
['IV','Reduced visibility','Conditions in which visibility is reduced, for example by fog, haze, snow or rain.','This definition later activates specific navigation requirements.'],
['IV','Safe speed','A speed allowing a vessel or convoy to navigate and manoeuvre safely and stop within the distance required by the prevailing circumstances and conditions.','Safe speed is contextual, not a single fixed number.'],
['IV','Waterway','Any inland water open to navigation.','This is the broad navigable-water setting.'],
['IV','Fairway','The part of the waterway that can actually be used for navigation.','Waterway and fairway are not interchangeable.'],
['IV','Left and right banks','For rivers, bank sides are determined while facing from the source toward the mouth; canals, lakes and broad waterways can be assigned by the competent authority.','Always establish the local reference direction before using left/right bank.'],
['IV','Right-hand / left-hand side of waterway or fairway','Normally understood for an observer facing downstream; canals, lakes and broad waterways may be defined by the competent authority.','This is a direction-of-view definition, not your vessel’s current heading.'],
['IV','Upstream / downstream','Upstream is toward the river source, including tidal sections where current direction changes; on canals the competent authority determines the reference direction. Downstream is the opposite.','Do not infer upstream solely from the momentary current.'],
['IV','ADN','The regulations annexed to the European Agreement concerning international carriage of dangerous goods by inland waterways.','Recognise ADN as the dangerous-goods regulatory reference.'],
['IV','Navigation by radar','Navigation in reduced visibility using radar.','The definition combines the visibility condition and radar use.'],
['IV','Inland AIS device','An onboard AIS device used within the inland-navigation tracking-and-tracing standard.','Inland AIS is a defined navigation-information device, not a substitute for lookout.']
];
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
