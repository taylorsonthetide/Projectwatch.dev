
const $=id=>document.getElementById(id), rad=x=>x*Math.PI/180, norm=x=>(x%360+360)%360;
let own,tgt,running=false,lastTs=0,elapsed=0,mult=1,rudder=0,actualRudder=0,rotRate=0,cmdSpeed=7,orientation='north',trainingMode='guided',scenarioId='cross_stbd',ownVesselMode='power',targetAvoiding=false,targetRudder=0,targetROT=0;
let ownHist=[],tgtHist=[],events=[],minSep=999,crashed=false,lastAlarm='',firstAction=null,initialCPA=0,initialTCPA=0,lastQuality='',qualityEvents=[],spokenWarnings=new Set(),minSepTime=0,autoEnding=false;

function updateScenarioStage(stage){
 const map={brief:'stageBrief',watch:'stageWatch',debrief:'stageDebrief'};
 ['stageBrief','stageWatch','stageDebrief'].forEach(id=>{
   const e=$(id);if(e){e.classList.remove('active','done')}
 });
 if(stage==='brief'){
   if($('stageBrief'))$('stageBrief').classList.add('active');
 }else if(stage==='watch'){
   if($('stageBrief'))$('stageBrief').classList.add('done');
   if($('stageWatch'))$('stageWatch').classList.add('active');
 }else if(stage==='debrief'){
   if($('stageBrief'))$('stageBrief').classList.add('done');
   if($('stageWatch'))$('stageWatch').classList.add('done');
   if($('stageDebrief'))$('stageDebrief').classList.add('active');
 }
}

function go(id){
  document.querySelectorAll('.appPage.active,.screen.active').forEach(s=>s.classList.remove('active'));
  const target=$(id);
  if(!target)return;
  updateHeaderNav('scenarios');
  updateModuleContext('scenarios');
  if(id==='watch')updateScenarioStage('watch');
  else if(id==='debrief')updateScenarioStage('debrief');
  else updateScenarioStage('brief');
  target.classList.add('active');
  if(id==='watch')setTimeout(()=>{initHelmControl();updateHelmControl(rudder)},0);
  window.scrollTo(0,0);
}
function vel(o){return{x:o.s*Math.sin(rad(o.h)),y:o.s*Math.cos(rad(o.h))}}
const SCENARIOS=window.PW_ORIGINAL_LIBRARIES.SCENARIOS;

const COLLISION_EXAM_BANK=window.PW_ORIGINAL_LIBRARIES.COLLISION_EXAM_BANK;
const COLLISION_ORAL_BANK=window.PW_ORIGINAL_LIBRARIES.COLLISION_ORAL_BANK;

let collisionExamSet=[],collisionExamAnswers=[],collisionExamIndex=0,collisionExamSubmitted=false;
let collisionOralSet=[],collisionOralAnswers=[],collisionOralIndex=0,collisionOralSubmitted=false;

function showCollisionExamCentre(){
  document.querySelectorAll('.appPage.active,.screen.active').forEach(p=>p.classList.remove('active'));
  updateHeaderNav('scenarios');updateModuleContext('scenarios');
  $('collisionExamPage').classList.add('active');
  showCollisionExamMode('knowledge');
  renderPracticalExamDeck();
  window.scrollTo({top:0,behavior:'smooth'});
}
function showCollisionExamMode(mode){
  ['Knowledge','Oral','Practical'].forEach(x=>{
    const sec=$('collision'+x+'Exam'),tab=$('examTab'+x);
    if(sec)sec.classList.toggle('active',x.toLowerCase()===mode);
    if(tab)tab.classList.toggle('active',x.toLowerCase()===mode);
  });
}
function pwShuffle(arr){
  let a=[...arr];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a;
}
function buildBalancedCollisionExam(n=20){
  const groups={};
  COLLISION_EXAM_BANK.forEach(q=>(groups[q.cat]||(groups[q.cat]=[])).push(q));
  let chosen=[];
  Object.values(groups).forEach(g=>chosen.push(pwShuffle(g)[0]));
  const remaining=pwShuffle(COLLISION_EXAM_BANK.filter(q=>!chosen.includes(q)));
  while(chosen.length<n&&remaining.length)chosen.push(remaining.shift());
  return pwShuffle(chosen).slice(0,n);
}
function startCollisionKnowledgeExam(){
  collisionExamSet=buildBalancedCollisionExam(20);
  collisionExamAnswers=new Array(collisionExamSet.length).fill(null);
  collisionExamIndex=0;collisionExamSubmitted=false;
  renderCollisionKnowledgeQuestion();
}
function renderCollisionKnowledgeQuestion(){
  const area=$('ckQuestionArea');if(!collisionExamSet.length)return;
  const q=collisionExamSet[collisionExamIndex],ans=collisionExamAnswers[collisionExamIndex];
  $('ckProgress').textContent=`Question ${collisionExamIndex+1} of ${collisionExamSet.length} • ${collisionExamAnswers.filter(x=>x!==null).length} answered`;
  area.innerHTML=`<div class="examQTop"><span class="tag">${q.cat} • ${q.rule}</span>${q.critical?'<span class="tag critical">SAFETY-CRITICAL</span>':''}</div>
    <div class="examQuestion">${q.q}</div>
    <div class="examChoices">${q.a.map((a,i)=>`<button class="${ans===i?'selected':''}" onclick="answerCollisionKnowledge(${i})"><b>${String.fromCharCode(65+i)}.</b> ${a}</button>`).join('')}</div>
    <div class="examNav">
      <button onclick="collisionExamPrev()">← PREVIOUS</button>
      <button onclick="collisionExamNext()">NEXT →</button>
      <button class="submit" onclick="submitCollisionKnowledgeExam()">SUBMIT EXAM</button>
    </div>`;
}
function answerCollisionKnowledge(i){if(collisionExamSubmitted)return;collisionExamAnswers[collisionExamIndex]=i;renderCollisionKnowledgeQuestion()}
function collisionExamPrev(){if(collisionExamIndex>0){collisionExamIndex--;renderCollisionKnowledgeQuestion()}}
function collisionExamNext(){if(collisionExamIndex<collisionExamSet.length-1){collisionExamIndex++;renderCollisionKnowledgeQuestion()}}
function submitCollisionKnowledgeExam(){
  if(!collisionExamSet.length||collisionExamSubmitted)return;
  const unanswered=collisionExamAnswers.filter(x=>x===null).length;
  if(unanswered && !confirm(`${unanswered} question(s) are unanswered. Submit anyway?`))return;
  collisionExamSubmitted=true;
  const correct=collisionExamSet.filter((q,i)=>collisionExamAnswers[i]===q.correct).length;
  const pct=Math.round(correct/collisionExamSet.length*100);
  const criticalWrong=collisionExamSet.filter((q,i)=>q.critical&&collisionExamAnswers[i]!==q.correct);
  const pass=pct>=90&&criticalWrong.length===0;
  courseRecordScore('collision',pct,pass);
  $('ckProgress').textContent=`Complete • ${correct}/${collisionExamSet.length} • ${pct}%`;
  $('ckQuestionArea').innerHTML=`<div class="examResultsHero ${pass?'pass':'fail'}"><div><div class="ver">PROJECT WATCH MOCK RESULT</div><h2>${pass?'PASS':'NOT YET PASSED'}</h2><p class="note">${pass?'Knowledge standard achieved with no safety-critical error.':'Review the debrief below, retrain weak areas and generate a new mock.'}</p></div><div class="examScoreBig">${pct}%</div></div>
    <div class="examStandardNote"><b>Project Watch pass rule:</b> 90% overall and no wrong answer on a designated safety-critical item. This is an independent training standard, not an MCA/RYA certificate.</div>
    ${criticalWrong.length?`<div class="examStandardNote"><b>Safety-critical errors:</b> ${criticalWrong.length}. A designated critical item was answered incorrectly or left unanswered.</div>`:''}
    <div class="examResultGrid">${collisionExamSet.map((q,i)=>examReviewHTML(q,collisionExamAnswers[i],i)).join('')}</div>
    <div class="examNav"><button onclick="startCollisionKnowledgeExam()">NEW RANDOM MOCK</button><button onclick="showCollisionExamMode('oral')">CAPTAIN'S ORAL →</button><button onclick="showCollisionExamMode('practical')">PRACTICAL →</button></div>`;
}
function examReviewHTML(q,user,i){
  const ok=user===q.correct;
  const userText=user===null?'No answer':q.a[user];
  return `<div class="examReview ${ok?'ok':'bad'}"><b>${i+1}. ${q.cat} • ${q.rule} ${q.critical?'• SAFETY-CRITICAL':''}</b><p>${q.q}</p><p>Your answer: <span class="answerKey">${userText}</span></p><p>Correct answer: <span class="answerKey">${q.a[q.correct]}</span></p><p class="why">${q.why}</p></div>`;
}
function startCollisionOralExam(){
  collisionOralSet=pwShuffle(COLLISION_ORAL_BANK).slice(0,8);
  collisionOralAnswers=new Array(collisionOralSet.length).fill(null);
  collisionOralIndex=0;collisionOralSubmitted=false;renderCollisionOralQuestion();
}
function renderCollisionOralQuestion(){
  const area=$('coQuestionArea');if(!collisionOralSet.length)return;
  const q=collisionOralSet[collisionOralIndex],ans=collisionOralAnswers[collisionOralIndex];
  area.innerHTML=`<div class="examQTop"><span class="tag">ORAL ${collisionOralIndex+1}/${collisionOralSet.length} • ${q.rule}</span>${q.critical?'<span class="tag critical">SAFETY-CRITICAL</span>':''}</div>
    <div class="examScenarioStem">Examiner prompt</div><div class="examQuestion">${q.prompt}</div>
    <div class="examChoices">${q.a.map((a,i)=>`<button class="${ans===i?'selected':''}" onclick="answerCollisionOral(${i})">${a}</button>`).join('')}</div>
    <div class="examNav"><button onclick="collisionOralPrev()">← PREVIOUS</button><button onclick="collisionOralNext()">NEXT →</button><button class="submit" onclick="submitCollisionOralExam()">SUBMIT ORAL MOCK</button></div>`;
}
function answerCollisionOral(i){if(collisionOralSubmitted)return;collisionOralAnswers[collisionOralIndex]=i;renderCollisionOralQuestion()}
function collisionOralPrev(){if(collisionOralIndex>0){collisionOralIndex--;renderCollisionOralQuestion()}}
function collisionOralNext(){if(collisionOralIndex<collisionOralSet.length-1){collisionOralIndex++;renderCollisionOralQuestion()}}
function submitCollisionOralExam(){
  if(!collisionOralSet.length||collisionOralSubmitted)return;
  const correct=collisionOralSet.filter((q,i)=>collisionOralAnswers[i]===q.correct).length;
  const pct=Math.round(correct/collisionOralSet.length*100);
  const criticalWrong=collisionOralSet.filter((q,i)=>q.critical&&collisionOralAnswers[i]!==q.correct);
  const pass=pct>=80&&criticalWrong.length===0;
  $('coQuestionArea').innerHTML=`<div class="examResultsHero ${pass?'pass':'fail'}"><div><div class="ver">PROJECT WATCH ORAL MOCK</div><h2>${pass?'PASS':'NOT YET PASSED'}</h2><p class="note">Project Watch oral benchmark: 80% plus no safety-critical error. The detailed reasoning is now revealed.</p></div><div class="examScoreBig">${pct}%</div></div>
  <div class="examResultGrid">${collisionOralSet.map((q,i)=>examReviewHTML({cat:"Captain's Oral",rule:q.rule,critical:q.critical,q:q.prompt,a:q.a,correct:q.correct,why:q.why},collisionOralAnswers[i],i)).join('')}</div>
  <div class="examNav"><button onclick="startCollisionOralExam()">NEW ORAL MOCK</button><button onclick="showCollisionExamMode('knowledge')">KNOWLEDGE →</button><button onclick="showCollisionExamMode('practical')">PRACTICAL →</button></div>`;
}
const PRACTICAL_EXAM_SCENARIOS=window.PW_ORIGINAL_LIBRARIES.PRACTICAL_EXAM_SCENARIOS;
function renderPracticalExamDeck(){
  const deck=$('practicalExamDeck');if(!deck)return;
  deck.innerHTML=PRACTICAL_EXAM_SCENARIOS.map(([id,title,desc],i)=>`<div class="practicalExamCard"><div class="ver">PRACTICAL ${String(i+1).padStart(2,'0')} • ${SCENARIOS[id]?.mode==='sail'?'SAILING':'POWER-DRIVEN'}</div><h4>${title}</h4><p>${desc}</p><button onclick="launchCollisionPracticalExam('${id}')">LAUNCH EXAM SCENARIO →</button></div>`).join('');
}
function launchCollisionPracticalExam(id){
  const s=SCENARIOS[id];if(!s)return;
  scenarioId=id;setOwnVesselMode(s.mode);scenarioId=id;setTrainingMode('exam');
  renderScenarioList();initScenario();startWatch();
}

const POWER_SCENARIO_ORDER=window.PW_ORIGINAL_LIBRARIES.POWER_SCENARIO_ORDER;
const SAIL_SCENARIO_ORDER=window.PW_ORIGINAL_LIBRARIES.SAIL_SCENARIO_ORDER;

const SCENARIO_VISUALS=window.PW_ORIGINAL_LIBRARIES.SCENARIO_VISUALS;

function scenarioInitialRelative(s){
  const vo={x:s.ownS*Math.sin(rad(s.ownH)),y:s.ownS*Math.cos(rad(s.ownH))};
  const vt={x:s.tgtS*Math.sin(rad(s.tgtH)),y:s.tgtS*Math.cos(rad(s.tgtH))};
  let rv={x:vt.x-vo.x,y:vt.y-vo.y},rvm=Math.hypot(rv.x,rv.y);
  if(rvm<1e-9)rvm=1e-9;
  let ux=-rv.x/rvm,uy=-rv.y/rvm;
  let px=ux*2+(-uy)*(s.offset||0),py=uy*2+ux*(s.offset||0);
  const pm=Math.hypot(px,py)||1;
  return{x:px*2/pm,y:py*2/pm};
}
function scenarioRole(id){
  const s=SCENARIOS[id];
  if(s.kind==='cross_giveway'||s.kind==='overtaking'||s.kind==='power_give_sail'||s.kind==='sail_giveway')return['GIVE-WAY','chartGive'];
  if(s.kind==='cross_standon'||s.kind==='cross_standon_fail'||s.kind==='overtaken'||s.kind==='sail_standon')return['STAND-ON','chartStand'];
  if(s.kind==='head_on')return['BOTH ALTER TO STARBOARD','chartGive'];
  return['ASSESS','chartStand'];
}
function scenarioChartHTML(id){
  const s=SCENARIOS[id],r=scenarioInitialRelative(s),spec=SCENARIO_VISUALS[id]||['COLREG SCENARIO',''];
  const a=-rad(s.ownH);
  const rx=r.x*Math.cos(a)+r.y*Math.sin(a);
  const ry=-r.x*Math.sin(a)+r.y*Math.cos(a);

  const ownX=90,ownY=66,scale=34/2;
  const tx=ownX+rx*scale,ty=ownY-ry*scale;
  const tgtRelH=((s.tgtH-s.ownH)%360+360)%360;

  const boat=(x,y,h,kind)=>`
    <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${h.toFixed(1)})">
      <line class="${kind==='own'?'chartCourseOwn':'chartCourseTarget'}" x1="0" y1="7" x2="0" y2="-29"/>
      <path class="${kind==='own'?'chartOwn':'chartTarget'}" d="M0,-8 L5,6 L0,4 L-5,6 Z"/>
    </g>`;

  const role=scenarioRole(id);
  let wind='';
  if(s.ownType==='sail'){
    const wf=(typeof s.windFrom==='number'?s.windFrom:(s.ownTack==='port'?270:90));
    const rel=((wf-s.ownH)%360+360)%360;
    const cx=31,cy=27,L=25;
    const sx=cx+Math.sin(rad(rel))*L/2, sy=cy-Math.cos(rad(rel))*L/2;
    const ex=cx-Math.sin(rad(rel))*L/2, ey=cy+Math.cos(rad(rel))*L/2;
    const ah=5, ang=Math.atan2(ey-sy,ex-sx);
    const p1x=ex-ah*Math.cos(ang-Math.PI/6), p1y=ey-ah*Math.sin(ang-Math.PI/6);
    const p2x=ex-ah*Math.cos(ang+Math.PI/6), p2y=ey-ah*Math.sin(ang+Math.PI/6);
    wind=`<g>
      <line class="chartWind" x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}"/>
      <path d="M${ex.toFixed(1)},${ey.toFixed(1)} L${p1x.toFixed(1)},${p1y.toFixed(1)} L${p2x.toFixed(1)},${p2y.toFixed(1)} Z" fill="#256f9a"/>
      <text class="chartWindText" x="8" y="11">WIND FROM ${String(s.ownTack||'').toUpperCase()} SIDE</text>
    </g>`;
  }

  let rel='AHEAD';
  if(rx>.18)rel='TARGET ON STARBOARD';
  else if(rx<-.18)rel='TARGET ON PORT';
  else if(ry<-.15)rel='TARGET ASTERN';

  return `<span class="scenarioChart">
    <span class="scenarioChartTitle">${rel}</span>
    <span class="scenarioChartKey"><span><i class="ownKey"></i>OWN</span><span><i class="targetKey"></i>TARGET</span></span>
    <span class="scenarioChartRule">${spec[1]}</span>
    <svg viewBox="0 0 180 104" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <line class="chartBearing" x1="${ownX}" y1="${ownY}" x2="${tx.toFixed(1)}" y2="${ty.toFixed(1)}"/>
      ${wind}
      ${boat(ownX,ownY,0,'own')}
      ${boat(tx,ty,tgtRelH,'target')}
      <rect class="chartRolePill ${role[1]}" x="91" y="7" width="81" height="12" rx="4"/>
      <text class="chartRolePillText" x="131.5" y="15" text-anchor="middle">${role[0]}</text>
    </svg>
  </span>`;
}

function scenarioSubtitle(id){
  const s=SCENARIOS[id];
  if(id==='power_vs_sail') return 'Rule 18 • power normally keeps clear of sail • subject to Rules 9, 10 & 13';
  if(id==='sail_vs_power') return 'Rule 18 • own sailing vessel is normally stand-on';
  if(id==='sail_port_tack') return 'Rule 12 • port tack gives way to starboard tack';
  if(id==='sail_starboard_tack') return 'Rule 12 • target on port tack gives way';
  if(id==='sail_windward') return 'Rule 12 • same tack • windward vessel gives way';
  if(id==='sail_leeward') return 'Rule 12 • same tack • leeward vessel stand-on';
  if(id==='sail_overtaking') return 'Rule 13 overrides vessel-type hierarchy • overtaking vessel gives way';
  if(s.kind==='head_on') return 'Power / power • reciprocal or nearly reciprocal';
  if(s.kind==='overtaking') return 'Rule 13 • overtaking vessel responsible';
  if(s.kind==='overtaken') return 'Rule 13 • target overtaking vessel responsible';
  if(s.kind==='cross_standon') return 'Power / power • stand-on: maintain course and speed initially; keep monitoring';
  if(s.kind==='cross_standon_fail') return 'Rule 17 escalation • STAND-ON → MONITOR → MAY ACT → MUST ACT';
  return 'Power / power • give-way assessment';
}

let scenarioFilter='all';
function scenarioFamily(id){
  if(id.includes('sail')||id==='power_vs_sail')return 'sail';
  if(id.includes('head_on'))return 'headon';
  if(id.includes('overtake')||id==='overtaken')return 'overtaking';
  return 'crossing';
}
function setScenarioFilter(filter,el){
  scenarioFilter=filter;
  document.querySelectorAll('#scenarioFilters button').forEach(b=>b.classList.toggle('active',b===el));
  renderScenarioList();
}
function scenarioRules(id){
  const map={cross_stbd:'Rules 5, 7, 8, 15 & 16',cross_port:'Rules 5, 7, 8, 15 & 17',rule17_fail:'Rules 5, 7, 8, 15 & 17',head_on:'Rules 5, 7, 8 & 14',overtake:'Rules 5, 7, 8 & 13',overtaken:'Rules 5, 7, 8 & 13',cross_stbd_offset:'Rules 5, 7, 8, 15 & 16',head_on_offset:'Rules 5, 7, 8 & 14',overtake_port:'Rules 5, 7, 8 & 13',power_vs_sail:'Rules 5, 7, 8, 9, 10, 13 & 18',sail_vs_power:'Rules 5, 7, 8 & 18',sail_port_tack:'Rules 5, 7, 8 & 12',sail_starboard_tack:'Rules 5, 7, 8 & 12',sail_windward:'Rules 5, 7, 8 & 12',sail_leeward:'Rules 5, 7, 8 & 12',sail_overtaking:'Rules 5, 7, 8 & 13'};
  return map[id]||'COLREG encounter rules';
}
function scenarioObjective(id){
  const s=SCENARIOS[id];
  if(s.kind==='cross_standon_fail')return 'Maintain course and speed initially. If it becomes apparent the give-way vessel is not taking appropriate action, you may act; when collision cannot be avoided by her action alone, you must take the action that will best aid avoidance.';
  if(s.kind==='cross_standon'||s.kind==='overtaken'||s.kind==='sail_standon')return 'Maintain course and speed initially while continuously assessing risk and monitoring the give-way vessel; be ready to apply Rule 17 where applicable.';
  if(s.kind==='head_on')return 'Recognise reciprocal or nearly reciprocal courses with risk of collision: each power-driven vessel alters course to starboard so they pass port-to-port.';
  if(s.kind==='overtaking')return 'Keep out of the way until finally past and clear.';
  if(id==='cross_stbd_offset')return 'Do not judge risk from CPA alone. Assess bearing, range, CPA/TCPA and the developing encounter using all available means.';
  if(id==='power_vs_sail')return 'Apply Rule 18 to this ordinary power-versus-sail encounter while remembering that Rules 9, 10 and 13, and other vessel-status circumstances, can change the simple hierarchy.';
  if(s.kind==='power_give_sail'||s.kind==='sail_giveway')return 'Apply vessel-status responsibilities and take early, substantial avoiding action.';
  return 'Recognise developing risk and take early, substantial action to keep well clear.';
}
function scenarioRoleLabel(id){return scenarioRole(id)[0];}
function updateScenarioBrief(){
  const box=$('scenarioSelectedBrief'),sum=$('scenarioHandoverSummary'),s=SCENARIOS[scenarioId];if(!s)return;
  const role=scenarioRoleLabel(scenarioId),mode=(typeof trainingMode!=='undefined'?trainingMode:'guided').toUpperCase();
  if(box)box.innerHTML=`<div class="csSelectedBriefTop"><div><div class="ver">SELECTED ENCOUNTER • BRIDGE BRIEF</div><h3>${s.name}</h3><span class="note">${scenarioSubtitle(scenarioId)}</span></div><span class="csBriefRole">YOUR ROLE • ${role}</span></div><div class="csBriefGrid"><div><small>PRIMARY RULE SET</small><b>${scenarioRules(scenarioId)}</b></div><div><small>WATCH OBJECTIVE</small><b>${scenarioObjective(scenarioId)}</b></div><div><small>STARTING PICTURE</small><b>${SCENARIO_VISUALS[scenarioId]?.[0]||'COLREG encounter'}</b></div><div><small>ASSESSMENT FOCUS</small><b>Risk • timing • clarity of action • safe passing outcome</b></div></div>`;
  if(sum)sum.innerHTML=`<div><small>VESSEL</small><b>${ownVesselMode==='sail'?'Sailing • engine off':'Power-driven'}</b></div><div><small>ENCOUNTER</small><b>${s.name}</b></div><div><small>ROLE</small><b>${role}</b></div><div><small>MODE</small><b>${mode}</b></div><div><small>VISIBILITY</small><b>Good</b></div><div><small>START RANGE</small><b>2.00 NM</b></div>`;
}
function renderScenarioList(){
  let ids=ownVesselMode==='sail'?SAIL_SCENARIO_ORDER:POWER_SCENARIO_ORDER;
  if(scenarioFilter!=='all')ids=ids.filter(id=>scenarioFamily(id)===scenarioFilter);
  if(!ids.length){scenarioFilter='all';document.querySelectorAll('#scenarioFilters button').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'));ids=ownVesselMode==='sail'?SAIL_SCENARIO_ORDER:POWER_SCENARIO_ORDER;}
  const box=$('scenarioList');
  box.innerHTML=ids.map((id,i)=>{
    const s=SCENARIOS[id];
    return `<button class="scenarioBtn ${id===scenarioId?'active':''}" data-sid="${id}" onclick="selectScenario('${id}',this)">
      ${scenarioChartHTML(id)}
      <span class="scenarioCopy"><b>${String(i+1).padStart(2,'0')} • ${s.name}</b><span>${scenarioSubtitle(id)}</span><span class="csRoleLine"><i class="${scenarioRoleLabel(id)==='GIVE-WAY'?'roleGive':scenarioRoleLabel(id)==='STAND-ON'?'roleStand':'roleBoth'}">${scenarioRoleLabel(id)}</i><i>${scenarioRules(id)}</i></span></span>
    </button>`;
  }).join('');
  updateScenarioBrief();
}

function setOwnVesselMode(mode){
  ownVesselMode=mode;
  $('powerModeBtn').classList.toggle('active',mode==='power');
  $('sailModeBtn').classList.toggle('active',mode==='sail');

  if(mode==='sail'){
    scenarioId='sail_vs_power';
    $('ownModeExplainer').innerHTML='<b>SAILING VESSEL:</b> under sail with propelling machinery not being used. Engine controls are disabled for these exercises.';
    $('handoverStrap').textContent='Training vessel • Sailing vessel • machinery OFF';
    $('enginePanel').classList.add('sailing-disabled');
    $('enginePanel').style.display='none';
    $('sailPanel').style.display='block';
  }else{
    scenarioId='cross_stbd';
    $('ownModeExplainer').innerHTML='<b>POWER-DRIVEN VESSEL:</b> machinery is propelling the vessel. This classification still applies if sails happen to be set.';
    $('handoverStrap').textContent='Training vessel • Power-driven vessel';
    $('enginePanel').classList.remove('sailing-disabled');
    $('enginePanel').style.display='block';
    $('sailPanel').style.display='none';
  }
  renderScenarioList();
}

function selectScenario(id,el){
  scenarioId=id;
  document.querySelectorAll('.scenarioBtn').forEach(b=>b.classList.remove('active'));
  if(el)el.classList.add('active');
  updateScenarioBrief();
}

function updateWindIndicator(){
  const s=SCENARIOS[scenarioId], box=$('windIndicator');
  if(!box)return;
  if(s.ownType!=='sail'){
    box.classList.remove('show');
    return;
  }
  const side=(s.ownTack||'starboard').toLowerCase();
  box.classList.add('show');
  if($('windArrow')) $('windArrow').textContent=side==='port'?'WIND →':'← WIND';
  if($('windText')) $('windText').textContent='WIND FROM '+side.toUpperCase();
  let detail='OWN VESSEL • '+side.toUpperCase()+' TACK';
  if(s.tgtType==='sail' && s.tgtTack) detail+=' • TARGET '+s.tgtTack.toUpperCase()+' TACK';
  if(s.ownWindward===true) detail+=' • OWN WINDWARD';
  if(s.ownWindward===false) detail+=' • OWN LEEWARD';
  if($('windSub')) $('windSub').textContent=detail;
}
function initScenario(){
  const s=SCENARIOS[scenarioId];
  ownVesselMode=s.mode;
  own={x:0,y:0,h:s.ownH,s:s.ownS};
  cmdSpeed=s.ownS;

  if($('handoverStrap')) $('handoverStrap').textContent=s.ownType==='sail'
    ?'Training vessel • Sailing vessel • machinery OFF'
    :'Training vessel • Power-driven vessel';
  if($('watchVesselStatus')) $('watchVesselStatus').textContent=s.ownType==='sail'
    ?'OWN VESSEL • SAILING • MACHINERY OFF'
    :'OWN VESSEL • POWER-DRIVEN';
  updateWindIndicator();

  let vo=vel(own), vt=vel({h:s.tgtH,s:s.tgtS});
  let rv={x:vt.x-vo.x,y:vt.y-vo.y}, rvm=Math.hypot(rv.x,rv.y);
  if(rvm<1e-9) rvm=1e-9;
  let ux=-rv.x/rvm, uy=-rv.y/rvm;
  let px=ux*2 + (-uy)*(s.offset||0), py=uy*2 + ux*(s.offset||0);
  let pm=Math.hypot(px,py);
  px=px*2/pm; py=py*2/pm;

  tgt={x:px,y:py,h:s.tgtH,s:s.tgtS};

  running=false;lastTs=0;elapsed=0;mult=1;
  rudder=0;actualRudder=0;rotRate=0;cmdSpeed=s.ownS;
  ownHist=[];tgtHist=[];events=[];
  minSep=999;minSepTime=0;crashed=false;autoEnding=false;
  lastAlarm='';firstAction=null;lastQuality='';qualityEvents=[];
  spokenWarnings=new Set();targetAvoiding=false;targetRudder=0;targetROT=0;

  let d=enc();
  initialCPA=d.cpa;initialTCPA=d.H;

  if($('cmdSpeedText')) $('cmdSpeedText').textContent=cmdSpeed.toFixed(1)+' kn';
  if($('rudderText')) $('rudderText').textContent='MIDSHIPS';
  if($('play')) $('play').textContent='▶ PLAY';
}

const BUOY_EXAM_BANK=window.PW_ORIGINAL_LIBRARIES.BUOY_EXAM_BANK;

let buoyExamSet=[],buoyExamAnswers=[],buoyExamIndex=0,buoyExamSubmitted=false,bxAnim=null,bxAnimStart=0;

function showBuoyageExam(){
 document.querySelectorAll('.appPage.active,.screen.active').forEach(p=>p.classList.remove('active'));
 updateHeaderNav('buoyage');updateModuleContext('buoyage');
 $('buoyageExamPage').classList.add('active');
 stopBxAnimation();window.scrollTo({top:0,behavior:'smooth'});
}
function bxShuffle(a){let x=[...a];for(let i=x.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
function startBuoyageExam(){
 stopBxAnimation();
 buoyExamSet=bxShuffle(BUOY_EXAM_BANK);
 buoyExamAnswers=new Array(buoyExamSet.length).fill(null);
 buoyExamIndex=0;buoyExamSubmitted=false;renderBuoyExamQuestion();
}
function stopBxAnimation(){if(bxAnim){cancelAnimationFrame(bxAnim);bxAnim=null}}
function startBxAnimation(item){
 stopBxAnimation();bxAnimStart=0;
 function frame(ts){
   if(!bxAnimStart)bxAnimStart=ts;
   let lamp=$('bxQuestionArea')?.querySelector('.buoyLamp');
   if(!lamp||!item){stopBxAnimation();return}
   let on=isLampOn(item,(ts-bxAnimStart)/1000);
   if(!on)lamp.style.opacity='0';
   else{
     lamp.style.opacity='1';
     let c=on==='red'?'#ff3434':on==='green'?'#23e36e':on==='yellow'?'#ffd231':on==='blue'?'#2f74ff':'#fff';
     lamp.setAttribute('fill',c);lamp.style.color=c;
   }
   bxAnim=requestAnimationFrame(frame);
 }
 bxAnim=requestAnimationFrame(frame);
}
function bxVisualHTML(q,review=false){
 const b=BUOY_DATA.find(x=>x.id===q.mark);if(!b)return '';
 const night=q.mode==='night';
 return `<div class="${review?'bxReviewVisual':'bxVisual'} ${night?'night':''}" data-buoy-id="${b.id}">${buoySVG(b)}</div>${review?'':`<div class="bxVisualHead"><span>${night?'NIGHT LIGHT / RHYTHM':'DAY MARK'}</span><span>${b.family}</span></div>`}`;
}
function renderBuoyExamQuestion(){
 stopBxAnimation();if(!buoyExamSet.length)return;
 const q=buoyExamSet[buoyExamIndex],b=BUOY_DATA.find(x=>x.id===q.mark),ans=buoyExamAnswers[buoyExamIndex];
 $('bxProgress').textContent=`Question ${buoyExamIndex+1} of ${buoyExamSet.length} • ${buoyExamAnswers.filter(x=>x!==null).length} answered`;
 $('bxQuestionArea').innerHTML=`<div class="bxLayout">
   <div class="bxVisualCard">${bxVisualHTML(q)}</div>
   <div class="bxQuestionCard">
     <div class="examQTop"><span class="tag">${q.cat} • ${b.family}</span>${q.critical?'<span class="tag critical">SAFETY-CRITICAL</span>':''}</div>
     <div class="bxTypeNote">${q.mode==='night'?'Watch the live light carefully. The mark itself is deliberately dimmed so the light characteristic is the primary clue.':'Use body colour, bands and topmark before answering.'}</div>
     <div class="examQuestion">${q.q}</div>
     <div class="examChoices">${q.a.map((a,i)=>`<button class="${ans===i?'selected':''}" onclick="answerBuoyExam(${i})"><b>${String.fromCharCode(65+i)}.</b> ${a}</button>`).join('')}</div>
     <div class="examNav" style="margin-top:auto"><button onclick="buoyExamPrev()">← PREVIOUS</button><button onclick="buoyExamNext()">NEXT →</button><button class="submit" onclick="submitBuoyageExam()">SUBMIT EXAM</button></div>
   </div></div>`;
 if(q.mode==='night')startBxAnimation(b); else {let l=$('bxQuestionArea').querySelector('.buoyLamp');if(l)l.style.opacity='0'}
}
function answerBuoyExam(i){if(buoyExamSubmitted)return;buoyExamAnswers[buoyExamIndex]=i;renderBuoyExamQuestion()}
function buoyExamPrev(){if(buoyExamIndex>0){buoyExamIndex--;renderBuoyExamQuestion()}}
function buoyExamNext(){if(buoyExamIndex<buoyExamSet.length-1){buoyExamIndex++;renderBuoyExamQuestion()}}
function submitBuoyageExam(){
 stopBxAnimation();if(!buoyExamSet.length||buoyExamSubmitted)return;
 const unanswered=buoyExamAnswers.filter(x=>x===null).length;
 if(unanswered&&!confirm(`${unanswered} question(s) are unanswered. Submit anyway?`))return;
 buoyExamSubmitted=true;
 const correct=buoyExamSet.filter((q,i)=>buoyExamAnswers[i]===q.correct).length;
 const pct=Math.round(correct/buoyExamSet.length*100);
 const criticalWrong=buoyExamSet.filter((q,i)=>q.critical&&buoyExamAnswers[i]!==q.correct);
 const pass=pct>=90&&criticalWrong.length===0;
 courseRecordScore('buoyage',pct,pass);
 $('bxProgress').textContent=`Complete • ${correct}/${buoyExamSet.length} • ${pct}%`;
 $('bxQuestionArea').innerHTML=`<div class="bxResultsSummary ${pass?'pass':'fail'}">
   <div><div class="ver">PROJECT WATCH BUOYAGE MOCK</div><h2>${pass?'PASS':'NOT YET PASSED'}</h2>
   <p class="note">${pass?'Buoyage standard achieved with no safety-critical passage error.':'Review the incorrect marks below, return to the tutorial where necessary, then sit a new mock.'}</p></div>
   <div class="bxScore">${pct}%</div></div>
   <div class="examStandardNote"><b>Project Watch standard:</b> 90% overall plus no incorrect designated safety-critical light/passage item. This is a training benchmark, not an RYA or MCA certificate.</div>
   ${criticalWrong.length?`<div class="examStandardNote"><b>Safety-critical errors:</b> ${criticalWrong.length}. One or more important passage/light decisions were wrong or unanswered.</div>`:''}
   <div class="examResultGrid">${buoyExamSet.map((q,i)=>bxReviewHTML(q,buoyExamAnswers[i],i)).join('')}</div>
   <div class="examNav"><button onclick="startBuoyageExam()">NEW FULL MOCK</button><button onclick="showModule('buoyage')">RETURN TO BUOYAGE</button><button onclick="showBuoyTutorial()">REVIEW BEGINNER COURSE</button></div>`;
}
function bxReviewHTML(q,user,i){
 const b=BUOY_DATA.find(x=>x.id===q.mark),ok=user===q.correct,userText=user===null?'No answer':q.a[user];
 return `<div class="examReview ${ok?'ok':'bad'}"><b>${i+1}. ${b.name} • ${q.cat} ${q.critical?'• SAFETY-CRITICAL':''}</b>${bxVisualHTML({...q,mode:'day'},true)}<p>${q.q}</p><p>Your answer: <span class="answerKey">${userText}</span></p><p>Correct answer: <span class="answerKey">${q.a[q.correct]}</span></p><p class="why">${q.why}</p></div>`;
}

const BUOY_TRAINING=window.PW_ORIGINAL_LIBRARIES.BUOY_TRAINING;

const BUOY_ORDER=window.PW_ORIGINAL_LIBRARIES.BUOY_ORDER;
let btI=0,btNight=false,btAnim=null;

function showBuoyTutorial(){
 document.querySelectorAll('.appPage.active,.screen.active').forEach(p=>p.classList.remove('active'));
 updateHeaderNav('buoyage');updateModuleContext('buoyage');
 $('buoyTutorialPage').classList.add('active');renderBuoyTutorial();window.scrollTo({top:0,behavior:'smooth'});
}
function renderBuoyTutorial(){
 let id=BUOY_ORDER[btI],b=BUOY_DATA.find(x=>x.id===id),t=BUOY_TRAINING[id];
 $('btIndex').textContent=`${btI+1} / ${BUOY_ORDER.length}`;$('btProgress').style.width=((btI+1)/BUOY_ORDER.length*100)+'%';
 $('btList').innerHTML=BUOY_ORDER.map((x,i)=>{let d=BUOY_DATA.find(b=>b.id===x);return `<button class="${i===btI?'active':''}" onclick="btSelect(${i})"><span>${String(i+1).padStart(2,'0')}</span><div><b>${d.name}</b><small>${d.family}</small></div></button>`}).join('');
 $('btFamily').textContent=b.family;$('btTitle').textContent=b.name;$('btMeaning').textContent=b.meaning;
 $('btDay').textContent=t.day;$('btLight').textContent=b.light;$('btPattern').textContent=t.flash;$('btPass').textContent=t.pass;$('btExplain').textContent=t.explain;
 $('btPassBadge').textContent=t.pass;
 let w=$('btVisual').parentElement;w.classList.toggle('night',btNight);$('btVisual').innerHTML=buoySVG(b);
 let lamp=$('btVisual').querySelector('.buoyLamp');
 if(!btNight){if(lamp)lamp.style.opacity='0';stopBtAnim()}else{startBtAnim(b,lamp)}
}
function stopBtAnim(){if(btAnim){cancelAnimationFrame(btAnim);btAnim=null}}
function startBtAnim(b,lamp){stopBtAnim();let start=null;function frame(ts){if(!start)start=ts;if(!btNight||!lamp){stopBtAnim();return}let on=isLampOn(b,(ts-start)/1000);if(!on)lamp.style.opacity='0';else{lamp.style.opacity='1';let c=on==='red'?'#ff3434':on==='green'?'#23e36e':on==='yellow'?'#ffd231':on==='blue'?'#2f74ff':'#fff';lamp.setAttribute('fill',c);lamp.style.color=c}btAnim=requestAnimationFrame(frame)}btAnim=requestAnimationFrame(frame)}
function btSelect(i){btI=Math.max(0,Math.min(BUOY_ORDER.length-1,i));renderBuoyTutorial()}
function btPrev(){btSelect(btI-1)}function btNext(){btSelect(btI+1)}
function btNightToggle(){btNight=!btNight;renderBuoyTutorial()}
function btHear(){let id=BUOY_ORDER[btI],b=BUOY_DATA.find(x=>x.id===id),t=BUOY_TRAINING[id];speakMarine(`${b.name}. ${b.meaning}. How to pass: ${t.pass}. Day identification: ${t.day}. Light characteristic: ${t.flash}. ${t.explain}`,'instruction')}

let bpMode='guided',bpI=0,bpScore=0,bpAnswered=false;
function showBuoyPassage(mode){
 bpMode=mode;bpI=0;bpScore=0;bpAnswered=false;
 document.querySelectorAll('.appPage.active,.screen.active').forEach(p=>p.classList.remove('active'));
 updateHeaderNav('buoyage');updateModuleContext('buoyage');
 $('buoyPassagePage').classList.add('active');
 $('bpKicker').textContent=mode==='guided'?'GUIDED PASSAGE • IALA REGION A':'CHALLENGE PASSAGE • IALA REGION A';
 $('bpIntro').textContent=mode==='guided'?'Take the wooden training vessel through every mark. Read the explanation, make the passing decision, then continue.':'No coaching before the answer. Decide how you would pass each mark and complete all 12 for a final score.';
 renderBuoyLane();renderBuoyPassageStep();window.scrollTo({top:0,behavior:'smooth'});
}
function renderBuoyLane(){
 const lane=$('bpLane');
 lane.innerHTML=BUOY_ORDER.map((id,i)=>{
   let b=BUOY_DATA.find(x=>x.id===id);
   let col=i%4,row=Math.floor(i/4),x=16+col*22.5,y=30+row*22;
   return `<div id="bpMark_${id}" class="bpLaneMark" style="left:${x}%;top:${y}%">${buoySVG(b)}<b>${i+1}. ${b.name}</b></div>`;
 }).join('');
}
function bpExpectedChoices(t){
 if(t.choice==='port')return [['port','LEAVE MARK TO PORT'],['starboard','LEAVE MARK TO STARBOARD'],['other','OTHER / CHECK CHART']];
 if(t.choice==='starboard')return [['port','LEAVE MARK TO PORT'],['starboard','LEAVE MARK TO STARBOARD'],['other','OTHER / CHECK CHART']];
 if(t.choice==='north'||t.choice==='east'||t.choice==='south'||t.choice==='west')return [['north','PASS NORTH'],['east','PASS EAST'],['south','PASS SOUTH'],['west','PASS WEST']];
 if(t.choice==='either')return [['either','NO FIXED SIDE / WATER AROUND'],['port','PORT ONLY'],['starboard','STARBOARD ONLY']];
 return [['chart','CHECK CHART / KEEP CLEAR AS DIRECTED'],['port','ALWAYS PORT'],['starboard','ALWAYS STARBOARD']];
}
function renderBuoyPassageStep(){
 let id=BUOY_ORDER[bpI],b=BUOY_DATA.find(x=>x.id===id),t=BUOY_TRAINING[id];
 document.querySelectorAll('.bpLaneMark').forEach((e,i)=>{e.classList.toggle('current',i===bpI);e.classList.toggle('passed',i<bpI)});
 let activeCol=bpI%4;
 $('bpDecisionOverlay').classList.toggle('moveLeft',activeCol>=2);
 $('bpProgress').textContent=`${bpI+1} / ${BUOY_ORDER.length}`;$('bpScoreText').textContent=bpMode==='guided'?'GUIDED':`${bpScore} CORRECT`;
 $('bpMarkFamily').textContent=b.family;$('bpMarkName').textContent=b.name;
 $('bpPrompt').textContent=bpMode==='guided'?`${b.meaning} ${t.flash} What is the correct passage decision?`:'What is the correct passage decision for this mark?';
 $('bpChoices').innerHTML=bpExpectedChoices(t).map(c=>`<button onclick="bpAnswer('${c[0]}')">${c[1]}</button>`).join('');
 $('bpFeedback').textContent='';$('bpFeedback').className='bpFeedback';
 if($('bpSkipBtn'))$('bpSkipBtn').disabled=false;
 $('bpConsoleMark').textContent=b.name;$('bpConsoleLight').textContent=bpMode==='guided'?t.flash:'HIDDEN UNTIL ANSWER';$('bpConsolePass').textContent=bpMode==='guided'?t.pass:'MAKE YOUR DECISION';
 bpAnswered=false;
 positionBuoyBoat(bpI,'center');
 if(bpMode==='guided')setTimeout(()=>speakMarine(`${b.name}. ${b.meaning}. ${t.flash}`,'instruction'),180);
}
function positionBuoyBoat(i,decision){
 let col=i%4,row=Math.floor(i/4),mx=16+col*22.5,my=30+row*22;
 let x=mx,y=Math.min(88,my+13);
 if(decision==='port')x=mx+7;       // mark left/port of vessel
 if(decision==='starboard')x=mx-7;  // mark right/starboard of vessel
 if(decision==='north')y=my-10;
 if(decision==='south')y=my+10;
 if(decision==='east')x=mx+9;
 if(decision==='west')x=mx-9;
 if(decision==='either'||decision==='chart')x=mx+8;
 $('bpBoat').style.left=x+'%';$('bpBoat').style.top=y+'%';
}

function speakMarineAndWait(text,kind){
 return new Promise(resolve=>{
   if(!('speechSynthesis' in window)){resolve();return}
   try{
     window.speechSynthesis.cancel();
     const u=new SpeechSynthesisUtterance(text);
     const pref=localStorage.getItem('pwVoiceName')||'';
     const voices=window.speechSynthesis.getVoices();
     const chosen=voices.find(v=>v.name===pref) ||
       voices.find(v=>/Daniel|Arthur|Oliver|Ryan|Sonia|Serena/i.test(v.name) && /^en[-_]?GB/i.test(v.lang||'')) ||
       voices.find(v=>/^en[-_]?GB/i.test(v.lang||'')) ||
       voices.find(v=>/^en/i.test(v.lang||''));
     if(chosen)u.voice=chosen;
     u.rate=.93; u.pitch=1; u.volume=1;
     let done=false;
     const finish=()=>{if(done)return;done=true;resolve()};
     u.onend=finish;u.onerror=finish;
     window.speechSynthesis.speak(u);
     setTimeout(finish,Math.max(5000,text.length*115));
   }catch(e){resolve()}
 });
}

function bpSkipMark(){
  if(!$('buoyPassagePage') || !$('buoyPassagePage').classList.contains('active')) return;

  try{ if('speechSynthesis' in window) window.speechSynthesis.cancel(); }catch(e){}

  bpAnswered = true;

  const currentId = BUOY_ORDER[bpI];
  const currentMark = currentId ? $('bpMark_'+currentId) : null;
  if(currentMark) currentMark.classList.add('passed');

  if(bpI < BUOY_ORDER.length - 1){
    bpI++;
    bpAnswered = false;
    renderBuoyPassageStep();
  }else{
    bpFinish();
  }
}

async function bpAnswer(choice){
 if(bpAnswered)return;bpAnswered=true;
 let id=BUOY_ORDER[bpI],b=BUOY_DATA.find(x=>x.id===id),t=BUOY_TRAINING[id],ok=choice===t.choice;
 if(ok)bpScore++;
 $('bpFeedback').textContent=(ok?'✓ Correct. ':'✗ Not quite. ')+t.pass+'. '+t.explain;
 $('bpFeedback').className='bpFeedback '+(ok?'ok':'warn');
 $('bpConsoleLight').textContent=t.flash;$('bpConsolePass').textContent=t.pass;$('bpScoreText').textContent=bpMode==='guided'?'GUIDED':`${bpScore} CORRECT`;

 positionBuoyBoat(bpI,ok?choice:t.choice);
 document.querySelectorAll('#bpChoices button').forEach(btn=>btn.disabled=true);
 if($('bpSkipBtn'))$('bpSkipBtn').disabled=false;
 const speech=(ok?'Correct. ':'Not quite. ')+t.pass+'. '+t.explain;
 const answeredIndex=bpI;
 await speakMarineAndWait(speech,'confirmation');

 if(bpI!==answeredIndex)return;

 if(bpI<BUOY_ORDER.length-1){bpI++;renderBuoyPassageStep()}
 else bpFinish();
}
function bpHear(){let id=BUOY_ORDER[bpI],b=BUOY_DATA.find(x=>x.id===id),t=BUOY_TRAINING[id];speakMarine(`${b.name}. ${b.meaning}. ${t.flash}. ${t.pass}. ${t.explain}`,'instruction')}
function bpFinish(){
 $('bpMarkFamily').textContent='PASSAGE COMPLETE';$('bpMarkName').textContent=bpMode==='guided'?'All 12 marks completed':`${bpScore} / ${BUOY_ORDER.length}`;
 $('bpPrompt').textContent=bpMode==='guided'?'You have completed the complete guided buoy lane. Run the Challenge next without pre-answer coaching.':`Final score: ${bpScore} out of ${BUOY_ORDER.length}. Review individual marks in the tutorial, then run the challenge again.`;
 $('bpChoices').innerHTML=`<button onclick="showBuoyPassage('${bpMode}')">RUN AGAIN</button><button onclick="showModule('buoyage')">RETURN TO BUOYAGE</button>`;
 $('bpFeedback').textContent='';$('bpProgress').textContent='COMPLETE';
}

const BUOY_DATA=window.PW_ORIGINAL_LIBRARIES.BUOY_DATA;

function buoySVG(item){
 const bodyY=64, bodyH=78, x=43, w=44;
 let body='';
 const rect=(y,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${c}"/>`;
 if(item.body==='red') body=rect(bodyY,bodyH,'#e33232');
 else if(item.body==='green') body=rect(bodyY,bodyH,'#16a34a');
 else if(item.body==='yellow') body=rect(bodyY,bodyH,'#f4cf27');
 else if(item.body==='redGreenRed') body=rect(bodyY,26,'#e33232')+rect(bodyY+26,26,'#16a34a')+rect(bodyY+52,26,'#e33232');
 else if(item.body==='greenRedGreen') body=rect(bodyY,26,'#16a34a')+rect(bodyY+26,26,'#e33232')+rect(bodyY+52,26,'#16a34a');
 else if(item.body==='blackYellow') body=rect(bodyY,39,'#111')+rect(bodyY+39,39,'#f4cf27');
 else if(item.body==='blackYellowBlack') body=rect(bodyY,26,'#111')+rect(bodyY+26,26,'#f4cf27')+rect(bodyY+52,26,'#111');
 else if(item.body==='yellowBlack') body=rect(bodyY,39,'#f4cf27')+rect(bodyY+39,39,'#111');
 else if(item.body==='yellowBlackYellow') body=rect(bodyY,26,'#f4cf27')+rect(bodyY+26,26,'#111')+rect(bodyY+52,26,'#f4cf27');
 else if(item.body==='blackRedBlack') body=rect(bodyY,26,'#111')+rect(bodyY+26,26,'#d52b2b')+rect(bodyY+52,26,'#111');
 else if(item.body==='redWhiteVertical') body=`<clipPath id="clip_${item.id}"><rect x="${x}" y="${bodyY}" width="${w}" height="${bodyH}" rx="7"/></clipPath><g clip-path="url(#clip_${item.id})"><rect x="${x}" y="${bodyY}" width="11" height="${bodyH}" fill="#d52b2b"/><rect x="${x+11}" y="${bodyY}" width="11" height="${bodyH}" fill="#fff"/><rect x="${x+22}" y="${bodyY}" width="11" height="${bodyH}" fill="#d52b2b"/><rect x="${x+33}" y="${bodyY}" width="11" height="${bodyH}" fill="#fff"/></g>`;
 else if(item.body==='blueYellowVertical') body=`<clipPath id="clip_${item.id}"><rect x="${x}" y="${bodyY}" width="${w}" height="${bodyH}" rx="7"/></clipPath><g clip-path="url(#clip_${item.id})"><rect x="${x}" y="${bodyY}" width="11" height="${bodyH}" fill="#2563eb"/><rect x="${x+11}" y="${bodyY}" width="11" height="${bodyH}" fill="#f4cf27"/><rect x="${x+22}" y="${bodyY}" width="11" height="${bodyH}" fill="#2563eb"/><rect x="${x+33}" y="${bodyY}" width="11" height="${bodyH}" fill="#f4cf27"/></g>`;

 let top='';
 const coneUp=(cy,c='#111')=>`<polygon points="65,${cy-13} 53,${cy+8} 77,${cy+8}" fill="${c}"/>`;
 const coneDown=(cy,c='#111')=>`<polygon points="53,${cy-8} 77,${cy-8} 65,${cy+13}" fill="${c}"/>`;
 if(item.top==='can') top=`<rect x="55" y="34" width="20" height="15" fill="#e33232"/>`;
 if(item.top==='canRed') top=`<rect x="55" y="34" width="20" height="15" fill="#e33232"/>`;
 if(item.top==='coneUp') top=coneUp(42,'#16a34a');
 if(item.top==='coneGreen') top=coneUp(42,'#16a34a');
 if(item.top==='conesUp') top=coneUp(24)+coneUp(47);
 if(item.top==='conesDown') top=coneDown(24)+coneDown(47);
 if(item.top==='conesBase') top=coneDown(24)+coneUp(47);
 if(item.top==='conesPoint') top=coneUp(24)+coneDown(47);
 if(item.top==='twoBalls') top=`<circle cx="65" cy="25" r="9" fill="#111"/><circle cx="65" cy="48" r="9" fill="#111"/>`;
 if(item.top==='redBall') top=`<circle cx="65" cy="39" r="10" fill="#d52b2b"/>`;
 if(item.top==='xYellow') top=`<g stroke="#f4cf27" stroke-width="7"><line x1="55" y1="29" x2="75" y2="49"/><line x1="75" y1="29" x2="55" y2="49"/></g>`;
 if(item.top==='crossYellow') top=`<g stroke="#f4cf27" stroke-width="6"><line x1="65" y1="26" x2="65" y2="52"/><line x1="52" y1="39" x2="78" y2="39"/></g>`;

 return `<svg class="buoySvg" viewBox="0 0 130 170" aria-label="${item.name}">
   <line x1="65" y1="51" x2="65" y2="64" stroke="#222" stroke-width="3"/>
   <g class="dayTop">${top}</g><g class="dayBody">${body}</g>
   <ellipse class="waterShadow" cx="65" cy="145" rx="31" ry="7" fill="#072b3d" opacity=".55"/><circle class="buoyLamp" data-lamp="${item.lamp}" cx="65" cy="57" r="6" fill="#fff"/>
  </svg>`;
}

let buoyMode='day',buoyAnimHandle=null,buoyAnimStart=0;
function setBuoyMode(mode){
 buoyMode=mode;
 $('buoyDayBtn').classList.toggle('active',mode==='day');
 $('buoyNightBtn').classList.toggle('active',mode==='night');
 renderBuoys();
 if(buoyIndex<0) buoyIndex=0;
 $('buoyQ').textContent=mode==='night'?'Identify this mark from its night light':'Identify this mark';
 renderBuoyChallenge();
 if(mode==='night')startBuoyAnimation(); else stopBuoyAnimation();
}
function stopBuoyAnimation(){if(buoyAnimHandle){cancelAnimationFrame(buoyAnimHandle);buoyAnimHandle=null}}
function isLampOn(item,t){
 let phase=t%item.period;
 for(let seg of item.pattern){
  if(phase>=seg[0]&&phase<seg[1]) return seg[2]||item.lamp;
 }
 return null;
}
function animateBuoys(ts){
 if(buoyMode!=='night'){stopBuoyAnimation();return}
 if(!buoyAnimStart)buoyAnimStart=ts;
 let t=(ts-buoyAnimStart)/1000;
 document.querySelectorAll('.buoyLamp').forEach(el=>{
  let card=el.closest('[data-buoy-id]');
  let id=card?card.dataset.buoyId:null;
  let item=BUOY_DATA.find(x=>x.id===id);
  if(!item)return;
  let on=isLampOn(item,t);
  if(!on){el.style.opacity='0';return}
  el.style.opacity='1';
  let c=on==='red'?'#ff3434':on==='green'?'#23e36e':on==='yellow'?'#ffd231':on==='blue'?'#2f74ff':'#ffffff';
  el.setAttribute('fill',c);el.style.color=c;
 });
 buoyAnimHandle=requestAnimationFrame(animateBuoys);
}
function startBuoyAnimation(){stopBuoyAnimation();buoyAnimStart=0;buoyAnimHandle=requestAnimationFrame(animateBuoys)}
let challengeAnimHandle=null;
function stopChallengeAnimation(){
 if(challengeAnimHandle){cancelAnimationFrame(challengeAnimHandle);challengeAnimHandle=null}
}
function renderBuoyChallenge(){
 const b=BUOY_DATA[buoyIndex];
 const el=$('buoyChallengeVisual');
 if(!b||!el)return;

 stopChallengeAnimation();
 el.className='buoyVisual'+(buoyMode==='night'?' night':'');
 el.dataset.buoyId=b.id;
 el.innerHTML=buoySVG(b);

 if(buoyMode==='day'){
   el.querySelectorAll('.dayBody,.dayTop').forEach(n=>n.style.opacity='1');
   let lamp=el.querySelector('.buoyLamp'); if(lamp)lamp.style.opacity='0';
 } else {
   let started=null;
   const lamp=el.querySelector('.buoyLamp');
   function frame(ts){
     if(!started)started=ts;
     if(buoyMode!=='night'||!lamp){stopChallengeAnimation();return}
     let on=isLampOn(b,(ts-started)/1000);
     if(!on){lamp.style.opacity='0'}
     else{
       lamp.style.opacity='1';
       let c=on==='red'?'#ff3434':on==='green'?'#23e36e':on==='yellow'?'#ffd231':on==='blue'?'#2f74ff':'#ffffff';
       lamp.setAttribute('fill',c);lamp.style.color=c;
     }
     challengeAnimHandle=requestAnimationFrame(frame);
   }
   challengeAnimHandle=requestAnimationFrame(frame);
 }
}

function renderBuoys(){
 $('buoyVisualGrid').innerHTML=BUOY_DATA.map(b=>`<button class="buoyBtn" data-buoy-id="${b.id}" onclick="openBuoy('${b.id}')"><div class="buoyVisual ${buoyMode==='night'?'night':''}">${buoySVG(b)}</div><div class="buoyInfo"><b>${b.name}</b><small>${b.family}</small><div class="buoyPills"><span class="buoyPill">${buoyMode==='night'?b.patternLabel:b.light}</span></div></div></button>`).join('');
 if(buoyMode==='night')startBuoyAnimation();
}
function openBuoy(id){
 let b=BUOY_DATA.find(x=>x.id===id);if(!b)return;
 $('detailTitle').textContent=b.name;
 $('detailSummary').textContent=b.meaning;
 $('detailTraining').textContent='Topmark and body colours are shown in the vector diagram. Light: '+b.light+'. Night animation: '+b.patternLabel+'.';
 $('detailProject').textContent='Project Watch will next use this exact mark data inside the live navigation/buoy-field trainer.';
 $('detailSource').textContent=b.source;
 $('detailSheet').classList.add('open');
}

let buoyIndex=-1;
function buildBuoyChoices(correct){
 let candidates=BUOY_DATA.filter(x=>x.id!==correct.id);
 let offset=(buoyIndex*3)%candidates.length;
 let wrong=[];
 for(let i=0; wrong.length<3 && i<candidates.length; i++){
   let x=candidates[(offset+i)%candidates.length];
   if(!wrong.some(w=>w.id===x.id))wrong.push(x);
 }
 return [correct,...wrong].sort((a,b)=>a.name.localeCompare(b.name));
}
function nextBuoyQuestion(){
 buoyIndex=(buoyIndex+1)%BUOY_DATA.length;
 const b=BUOY_DATA[buoyIndex];
 $('buoyQ').textContent=buoyMode==='night'?'Identify this mark from its night light':'Identify this mark';
 renderBuoyChallenge();
 const opts=buildBuoyChoices(b);
 $('buoyOpts').innerHTML=opts.map(o=>`<button type="button" onclick="answerBuoy('${o.id}')">${o.name}</button>`).join('');
 $('buoyResult').textContent='';
 $('buoyResult').className='quizResult';
}
function answerBuoy(id){
 const b=BUOY_DATA[buoyIndex];
 if(!b)return;
 const ok=id===b.id;
 $('buoyResult').textContent=(ok?'✓ Correct — ':'✗ Not quite — ')+b.meaning+' Light: '+b.light;
 $('buoyResult').className='quizResult '+(ok?'ok':'warn');
}

const LIGHTS_EXAM_BANK=window.PW_ORIGINAL_LIBRARIES.LIGHTS_EXAM_BANK;

let lightsExamSet=[],lightsExamAnswers=[],lightsExamIndex=0,lightsExamSubmitted=false;

function showLightsExam(){
  document.querySelectorAll('.appPage.active,.screen.active').forEach(p=>p.classList.remove('active'));
  updateHeaderNav('lights');updateModuleContext('lights');
  $('lightsExamPage').classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}
function lxShuffle(a){let x=[...a];for(let i=x.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
function startLightsFullExam(){
  lightsExamSet=lxShuffle(LIGHTS_EXAM_BANK);
  lightsExamAnswers=new Array(lightsExamSet.length).fill(null);
  lightsExamIndex=0;lightsExamSubmitted=false;renderLightsExamQuestion();
}
function lxGraphic(v){
  if(!v)return '';
  const oldI=bvI,oldLight=bvLight,oldAspect=bvAspect;
  const idx=BV.findIndex(x=>x.id===v.id);
  if(idx<0)return '';
  bvI=idx;bvLight=v.light||'night';bvAspect=v.aspect||'ahead';
  const g=bvGraphic();
  bvI=oldI;bvLight=oldLight;bvAspect=oldAspect;
  return g;
}
function lxVisualHTML(q,review=false){
  if(!q.visual)return `<div class="lxKnowledgeOnly"><div><b>KNOWLEDGE QUESTION</b><span>No picture is required for this item. Apply the COLREG rule and the vessel-display knowledge taught in the module.</span></div></div>`;
  const aspect=(q.visual.light==='day')?'DAYLIGHT':(BV_ASPECTS.find(a=>a[0]===q.visual.aspect)?.[1]||'AHEAD')+' VIEW';
  const aspectLabel=(q.cat==='Aspect')?'VIEWING ASPECT':aspect;
  return `<div class="${review?'lxReviewVisual':'lxVisual'} ${q.visual.light==='day'?'day':''}">${lxGraphic(q.visual)}</div>${review?'':`<div class="lxVisualHead"><span>${q.visual.light==='day'?'DAY SHAPE':'NAVIGATION LIGHTS'}</span><span>${aspectLabel}</span></div>`}`;
}
function renderLightsExamQuestion(){
  if(!lightsExamSet.length)return;
  const q=lightsExamSet[lightsExamIndex],ans=lightsExamAnswers[lightsExamIndex];
  $('lxProgress').textContent=`Question ${lightsExamIndex+1} of ${lightsExamSet.length} • ${lightsExamAnswers.filter(x=>x!==null).length} answered`;
  $('lxQuestionArea').innerHTML=`<div class="lxLayout">
    <div class="lxVisualCard">${lxVisualHTML(q)}</div>
    <div class="lxQuestionCard">
      <div class="examQTop"><span class="tag">${q.cat} • ${q.rule}</span>${q.critical?'<span class="tag critical">SAFETY-CRITICAL</span>':''}</div>
      <div class="examQuestion">${q.q}</div>
      <div class="examChoices">${q.a.map((a,i)=>`<button class="${ans===i?'selected':''}" onclick="answerLightsExam(${i})"><b>${String.fromCharCode(65+i)}.</b> ${a}</button>`).join('')}</div>
      <div class="examNav" style="margin-top:auto"><button onclick="lightsExamPrev()">← PREVIOUS</button><button onclick="lightsExamNext()">NEXT →</button><button class="submit" onclick="submitLightsFullExam()">SUBMIT EXAM</button></div>
    </div></div>`;
}
function answerLightsExam(i){if(lightsExamSubmitted)return;lightsExamAnswers[lightsExamIndex]=i;renderLightsExamQuestion()}
function lightsExamPrev(){if(lightsExamIndex>0){lightsExamIndex--;renderLightsExamQuestion()}}
function lightsExamNext(){
  if(!lightsExamSet.length||lightsExamSubmitted)return;
  if(lightsExamAnswers[lightsExamIndex]===null){alert('Please answer this question before continuing.');return;}
  if(lightsExamIndex<lightsExamSet.length-1){lightsExamIndex++;renderLightsExamQuestion();return;}
  submitLightsFullExam();
}
function submitLightsFullExam(){
  if(!lightsExamSet.length||lightsExamSubmitted)return;
  const unanswered=lightsExamAnswers.filter(x=>x===null).length;
  if(unanswered){
    const firstMissing=lightsExamAnswers.findIndex(x=>x===null);
    lightsExamIndex=firstMissing;renderLightsExamQuestion();
    alert(`${unanswered} question(s) are unanswered. Project Watch has taken you to the first unanswered question.`);
    return;
  }
  lightsExamSubmitted=true;
  const correct=lightsExamSet.filter((q,i)=>lightsExamAnswers[i]===q.correct).length;
  const pct=Math.round(correct/lightsExamSet.length*100);
  const criticalWrong=lightsExamSet.filter((q,i)=>q.critical&&lightsExamAnswers[i]!==q.correct);
  const pass=pct>=90&&criticalWrong.length===0;
  $('lxProgress').textContent=`Complete • ${correct}/${lightsExamSet.length} • ${pct}%`;
  $('lxQuestionArea').innerHTML=`<div class="lxResultsSummary ${pass?'pass':'fail'}">
      <div><div class="ver">PROJECT WATCH LIGHTS & SHAPES MOCK</div><h2>${pass?'PASS':'NOT YET PASSED'}</h2>
      <p class="note">${pass?'Full mock standard achieved with no safety-critical error.':'Review every incorrect display below, retrain weak areas, then run the exam again.'}</p></div>
      <div class="lxScore">${pct}%</div></div>
    <div class="examStandardNote"><b>Project Watch standard:</b> 90% overall plus no designated safety-critical recognition error. This is an independent training benchmark, not an MCA or RYA certificate.</div>
    ${criticalWrong.length?`<div class="examStandardNote"><b>Safety-critical recognition errors:</b> ${criticalWrong.length}. One or more designated vessel/status displays were answered incorrectly or left unanswered.</div>`:''}
    <div class="examResultGrid">${lightsExamSet.map((q,i)=>lxReviewHTML(q,lightsExamAnswers[i],i)).join('')}</div>
    <div class="examNav"><button onclick="startLightsFullExam()">NEW FULL MOCK</button><button onclick="showModule('lights')">RETURN TO LIGHTS & SHAPES</button><button onclick="showLightsTutorial()">REVIEW BEGINNER COURSE</button></div>`;
}
function lxReviewHTML(q,user,i){
  const ok=user===q.correct,userText=user===null?'No answer':q.a[user];
  return `<div class="examReview ${ok?'ok':'bad'}"><b>${i+1}. ${q.cat} • ${q.rule} ${q.critical?'• SAFETY-CRITICAL':''}</b>${q.visual?lxVisualHTML(q,true):''}<p>${q.q}</p><p>Your answer: <span class="answerKey">${userText}</span></p><p>Correct answer: <span class="answerKey">${q.a[q.correct]}</span></p><p class="why">${q.why}</p></div>`;
}

const LS_LESSONS=window.PW_ORIGINAL_LIBRARIES.LS_LESSONS;
const LS_FINAL_QUIZ=window.PW_ORIGINAL_LIBRARIES.LS_FINAL_QUIZ;

function lsLamp(col,x,y,r=8){const c={r:'#ff4545',g:'#35e58a',w:'#ffffff',y:'#ffd54a'}[col];return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" style="filter:drop-shadow(0 0 8px ${c})"/>`}
function lsShipBase(){return `<path d="M55 205 L445 205 L408 258 L102 258 Z" fill="#284452" stroke="#527383" stroke-width="2"/><rect x="165" y="154" width="145" height="51" rx="5" fill="#365665"/><line x1="235" y1="154" x2="235" y2="72" stroke="#607d8b" stroke-width="6"/><line x1="348" y1="205" x2="348" y2="120" stroke="#607d8b" stroke-width="4"/>`}
function lsShipSVG(lights,label){
 return `<div class="lsTeachCard"><svg viewBox="0 0 500 285" role="img" aria-label="${label}"><line x1="20" y1="238" x2="480" y2="238" stroke="#4d7080" opacity=".45"/>${lsShipBase()}${lights}</svg><b>${label}</b></div>`;
}
function lsShapeSVG(shape,label){
 let s='';
 if(shape==='ball')s='<circle cx="80" cy="78" r="31" fill="#05090b"/>';
 if(shape==='twoBalls')s='<circle cx="80" cy="51" r="22" fill="#05090b"/><circle cx="80" cy="108" r="22" fill="#05090b"/>';
 if(shape==='threeBalls')s='<circle cx="80" cy="30" r="18" fill="#05090b"/><circle cx="80" cy="78" r="18" fill="#05090b"/><circle cx="80" cy="126" r="18" fill="#05090b"/>';
 if(shape==='coneDown')s='<polygon points="45,50 115,50 80,120" fill="#05090b"/>';
 if(shape==='diamond')s='<polygon points="80,35 120,80 80,125 40,80" fill="#05090b"/>';
 if(shape==='cylinder')s='<rect x="48" y="35" width="64" height="90" fill="#05090b"/>';
 if(shape==='ballDiamondBall')s='<circle cx="80" cy="25" r="16" fill="#05090b"/><polygon points="80,52 105,78 80,104 55,78" fill="#05090b"/><circle cx="80" cy="132" r="16" fill="#05090b"/>';
 return `<div class="lsShapeCard"><svg viewBox="0 0 160 155" role="img" aria-label="${label}"><rect x="3" y="3" width="154" height="149" rx="12" fill="#d8d1b7"/>${s}</svg><b>${label}</b></div>`;
}

let lsIndex=0,lsLessonsFinished=0,lsFinalIndex=0,lsFinalScore=0,lsFinalAnswered=false;

const PW_MASTER_LESSON_URLS=window.PW_ORIGINAL_LIBRARIES.PW_MASTER_LESSON_URLS;
const PW_MASTER_QUIZ_URLS=window.PW_ORIGINAL_LIBRARIES.PW_MASTER_QUIZ_URLS;
function pwMasterFrame(url,label){return `<iframe class="pwMasterLessonFrame" title="${label}" src="${url}" loading="eager"></iframe>`;}
function lsVisual(kind){return pwMasterFrame(PW_MASTER_LESSON_URLS[kind]||PW_MASTER_LESSON_URLS.intro,'Approved Project Watch Master Library 03 lesson visual');}
function lsQuizVisual(kind){return pwMasterFrame(PW_MASTER_QUIZ_URLS[kind]||PW_MASTER_LESSON_URLS.intro,'Approved Project Watch Master Library 03 recognition visual');}
function showLightsMasterLibrary(){
 stopCourseSpeech();document.querySelectorAll('.appPage.active,.screen.active').forEach(p=>p.classList.remove('active'));
 updateHeaderNav('lights');updateModuleContext('lights');const p=$('lightsMasterLibraryPage');if(p)p.classList.add('active');
 window.scrollTo({top:0,behavior:'smooth'});
}

function lsLessonsComplete(){return lsLessonsFinished>=6}
function showLightsTutorial(){document.querySelectorAll('.appPage.active,.screen.active').forEach(p=>p.classList.remove('active'));updateHeaderNav('lights');updateModuleContext('lights');$('lightsTutorialPage').classList.add('active');renderLightsTutorial();window.scrollTo({top:0,behavior:'smooth'})}
function renderLightsTutorial(){
 const l=LS_LESSONS[lsIndex],list=$('lsLessonList');if(!l||!list)return;
 const nextAvailable=Math.min(5,lsLessonsFinished);
 list.innerHTML=LS_LESSONS.map((x,i)=>{const done=i<lsLessonsFinished,locked=i>nextAvailable;return `<button class="lsLessonBtn ${i===lsIndex?'active':''} ${done?'done':''} ${locked?'lessonLocked':''}" ${locked?'disabled':''} onclick="lsSelect(${i})"><span class="n">${String(i+1).padStart(2,'0')}</span><span><b>${x.title}</b><small>${x.sub}</small></span><span class="tick">${done?'✓':locked?'🔒':''}</span></button>`}).join('');
 $('lsLessonNo').textContent='STAGE 3 • LESSON '+String(lsIndex+1).padStart(2,'0')+' / 06';
 $('lsLessonTitle').textContent=l.title;$('lsLessonIntro').textContent=l.intro;
 $('lsLessonFacts').innerHTML=l.facts.map(f=>`<div class="lsFact"><b>${f[0]}</b><span>${f[1]}</span></div>`).join('');
 try{$('lsLessonVisual').innerHTML=lsVisual(l.visual)}
 catch(e){console.error('Stage 3 visual fallback',e);$('lsLessonVisual').innerHTML=`<div class="lsPatternBoard"><div class="lsPattern"><b>${l.title}</b><span>${l.sub}</span></div></div>`}
 $('lsProgressText').textContent=`${lsLessonsFinished} / 6 LESSONS`;$('lsProgressFill').style.width=(lsLessonsFinished/6*100)+'%';
 const foot=$('lsForwardBtn');if(foot)foot.textContent=lsIndex===5?'COMPLETE LESSON 6 → FINAL CHECK':'NEXT LESSON →';renderLsFinalQuiz();
}
function lsSelect(i){stopCourseSpeech();lsIndex=Math.max(0,Math.min(Math.min(5,lsLessonsFinished),i));renderLightsTutorial()}
function lsPrev(){lsSelect(lsIndex-1)} function lsNext(){lsSelect(Math.min(lsLessonsFinished,lsIndex+1))}
function lsComplete(){stopCourseSpeech();if(lsIndex<5){lsLessonsFinished=Math.max(lsLessonsFinished,lsIndex+1);lsIndex++;renderLightsTutorial();return}lsLessonsFinished=6;renderLightsTutorial();const k=$('lsKnowledge');if(k){k.classList.remove('locked');renderLsFinalQuiz();requestAnimationFrame(()=>k.scrollIntoView({behavior:'smooth',block:'start'}))}}
function lsHear(){
 const btn=$('lsSpeakBtn');
 if(window.speechSynthesis && window.speechSynthesis.speaking){window.speechSynthesis.cancel();if(btn)btn.textContent='🔊 HEAR LESSON';return}
 let l=LS_LESSONS[lsIndex],speech=l.title+'. '+l.intro+' '+l.facts.map(f=>f[0]+'. '+f[1]).join(' ');
 speakMarine(speech,'instruction');if(btn)btn.textContent='■ STOP LESSON';
 setTimeout(()=>{if(btn && !(window.speechSynthesis&&window.speechSynthesis.speaking))btn.textContent='🔊 HEAR LESSON'},500);
}
function lsFinalVisual(kind){return lsQuizVisual(kind)}
function lsFinalHTML(){
 if(lsFinalIndex>=LS_FINAL_QUIZ.length){const pass=lsFinalScore>=8;return `<div class="crQuizScore"><strong>${lsFinalScore} / ${LS_FINAL_QUIZ.length}</strong><b>${pass?'STAGE 3 KNOWLEDGE ACHIEVED':'REVIEW AND TRY AGAIN'}</b><span>${pass?'You have demonstrated the core Lights & Shapes recognition taught in Stage 3. The 45-question full mock remains available as advanced assessment practice.':'Review the six lessons above. You need 8/10 to complete Stage 3.'}</span>${pass?'<button type="button" style="margin-top:12px" onclick="completeStage3()">COMPLETE STAGE 3 →</button>':'<button type="button" style="margin-top:12px" onclick="lsRestartFinal()">TRY AGAIN</button>'} <button type="button" style="margin-top:12px" onclick="showLightsExam()">OPEN 45-QUESTION FULL MOCK →</button></div>`}
 const q=LS_FINAL_QUIZ[lsFinalIndex];let visual='';try{visual=lsFinalVisual(q[4])}catch(e){console.error('Stage 3 check visual fallback',e);visual='<div class="lsPatternBoard"><div class="lsPattern"><b>RECOGNITION CHECK</b></div></div>'}return `<div class="crQuiz"><div class="ver">STAGE 3 FINAL CHECK • QUESTION ${lsFinalIndex+1} / ${LS_FINAL_QUIZ.length}</div><div class="lsLessonVisual" style="margin:10px 0">${visual}</div><div class="crQuizQ">${q[0]}</div><div class="crQuizOpts">${q[1].map((o,i)=>`<button type="button" onclick="lsFinalAnswer(${i});return false;">${o}</button>`).join('')}</div><div class="quizHelpRow"><span class="blindCheckNote">Choose your answer first. The relevant Rule reference is revealed with the feedback.</span></div><div id="lsFinalResult" class="crQuizResult"></div></div>`
}
function renderLsFinalQuiz(){const area=$('lsFinalQuizArea'),box=$('lsKnowledge');if(!area)return;const unlocked=lsLessonsComplete();if(box)box.classList.toggle('locked',!unlocked);if(!unlocked){area.innerHTML=`<div class="stage2QuizIntro"><b>TEACHING IN PROGRESS</b><br>${lsLessonsFinished} / 6 lessons completed. Complete Lessons 1–6 above to unlock the final check.</div>`;return}area.innerHTML=lsFinalHTML()}
function lsFinalAnswer(i){if(lsFinalAnswered)return;lsFinalAnswered=true;const q=LS_FINAL_QUIZ[lsFinalIndex],ok=i===q[2];if(ok)lsFinalScore++;document.querySelectorAll('#lsFinalQuizArea .crQuizOpts button').forEach((b,idx)=>{b.classList.add('answerLocked');if(idx===q[2])b.classList.add('correctAnswer');else if(idx===i&&!ok)b.classList.add('wrongAnswer')});const r=$('lsFinalResult');if(r)r.innerHTML=`<b>${ok?'CORRECT ✓':'NOT QUITE'}</b><br>${q[3]}<br><button type="button" style="margin-top:7px" onclick="openRulesLibrary('${q[5]}','Review this Rule after committing your Stage 3 answer, then return to the final check.')">📖 ${q[5]}</button> <button type="button" style="margin-top:7px" onclick="lsFinalNext();return false;">${lsFinalIndex===LS_FINAL_QUIZ.length-1?'SEE RESULT':'NEXT QUESTION →'}</button>`}
function lsFinalNext(){if(!lsFinalAnswered)return;lsFinalIndex=Math.min(LS_FINAL_QUIZ.length,lsFinalIndex+1);lsFinalAnswered=false;renderLsFinalQuiz();$('lsKnowledge')?.scrollIntoView({behavior:'smooth',block:'start'})}
function lsRestartFinal(){lsFinalIndex=0;lsFinalScore=0;lsFinalAnswered=false;renderLsFinalQuiz()}
function completeStage3(){if(!lsLessonsComplete()){alert('Complete all six Stage 3 teaching lessons first.');return}if(lsFinalIndex<LS_FINAL_QUIZ.length||lsFinalScore<8){alert('Complete the Stage 3 final check with at least 8/10 first.');return}courseRecordScore('lights',Math.round(lsFinalScore/LS_FINAL_QUIZ.length*100),true);showCoursePage()}

function pwToggleAspectTrainer(){const p=document.getElementById('pwLegacyAspectTrainer'),b=document.getElementById('pwAspectToggle');if(!p)return;const open=p.style.display==='none'||!p.style.display;p.style.display=open?'block':'none';if(b)b.textContent=open?'CLOSE ASPECT TRAINER ↑':'OPEN ASPECT TRAINER ↓';if(open)bvRender();}

const BV_ASPECTS=window.PW_ORIGINAL_LIBRARIES.BV_ASPECTS;
const BV=window.PW_ORIGINAL_LIBRARIES.BV;
let bvI=0,bvMode='learn',bvLight='night',bvAspect='ahead';
const BV_DAY_IDS=new Set(['motor','trawl','fish','nuc','ram','cbd','anchorU50','anchor50','agroundU50','aground50','towLong','gear150','dredge','diving','mine']);
function bvValidIndexes(){return BV.map((x,i)=>({x,i})).filter(o=>bvLight==='night'||BV_DAY_IDS.has(o.x.id)).map(o=>o.i)}
function bvNormaliseIndex(){let v=bvValidIndexes();if(!v.includes(bvI))bvI=v[0]||0}
function bvDisplayPos(){let v=bvValidIndexes();return {n:v.length,p:Math.max(0,v.indexOf(bvI))+1}}

function bvLamp(c,x,y){let z=c==='R'?'#ff3434':c==='G'?'#25e476':c==='Y'?'#ffd32f':'#fff';return `<circle class="bridgeLight" cx="${x}" cy="${y}" r="9" fill="${z}" style="color:${z}"/>`}
function bvHull(kind,aspect,day){
 let fill=day?'#334b57':'#182631',deck=day?'#d5dde0':'#263741',op=day?1:.22;
 if(aspect==='ahead'||aspect==='astern'){
   let wide=kind==='tanker'||kind==='ship'?62:kind==='trawler'||kind==='fisher'?48:36;
   return `<g opacity="${op}"><path d="M${270-wide} 260 L${270+wide} 260 L${270+wide*.55} 330 L${270-wide*.55} 330 Z" fill="${fill}"/><rect x="${270-wide*.55}" y="210" width="${wide*1.1}" height="50" rx="5" fill="${deck}"/><line x1="270" y1="210" x2="270" y2="112" stroke="${deck}" stroke-width="7"/></g>`;
 }
 let bow=aspect==='stbd'?455:85,stern=aspect==='stbd'?80:460;
 let hull=`<path d="M85 270 L455 270 L420 325 L125 325 Z" fill="${fill}"/>`;
 if(kind==='yacht') hull+=`<path d="M245 270 L270 150 L300 270 Z" fill="${deck}"/><line x1="270" y1="270" x2="270" y2="120" stroke="${deck}" stroke-width="5"/>`;
 else if(kind==='trawler'||kind==='fisher') hull+=`<rect x="180" y="205" width="105" height="65" rx="5" fill="${deck}"/><line x1="240" y1="205" x2="240" y2="120" stroke="${deck}" stroke-width="6"/><line x1="330" y1="270" x2="370" y2="175" stroke="${deck}" stroke-width="5"/>`;
 else if(kind==='pilot') hull+=`<path d="M180 270 L205 215 L320 215 L350 270 Z" fill="${deck}"/><line x1="270" y1="215" x2="270" y2="135" stroke="${deck}" stroke-width="5"/>`;
 else if(kind==='work') hull+=`<rect x="170" y="205" width="150" height="65" fill="${deck}"/><line x1="270" y1="205" x2="270" y2="110" stroke="${deck}" stroke-width="7"/><rect x="340" y="235" width="85" height="12" fill="${deck}"/>`;
 else hull+=`<rect x="185" y="200" width="135" height="70" rx="4" fill="${deck}"/><line x1="270" y1="200" x2="270" y2="105" stroke="${deck}" stroke-width="7"/>`;
 return `<g opacity="${op}">${hull}</g>`;
}
function bvSideX(side){
 const a=bvAspect;
 if(a==='ahead') return side==='stbd'?190:350;
 if(a==='astern') return side==='stbd'?350:190;
 if(a==='stbd') return side==='stbd'?350:190;
 return side==='stbd'?190:350; // port view
}
function bvShape(s){
 let ball=(y)=>`<circle class="bridgeShape" cx="270" cy="${y}" r="14"/>`,dia=(y)=>`<polygon class="bridgeShape" points="270,${y-18} 286,${y} 270,${y+18} 254,${y}"/>`;
 if(s==='coneDown')return `<polygon class="bridgeShape" points="250,80 290,80 270,120"/>`;
 if(s==='conesMeet')return `<polygon class="bridgeShape" points="250,72 290,72 270,108"/><polygon class="bridgeShape" points="270,110 250,146 290,146"/>`;
 if(s==='twoBalls')return ball(82)+ball(122);
 if(s==='ballDiamondBall')return ball(62)+dia(104)+ball(148);
 if(s==='cylinder')return `<rect class="bridgeShape" x="254" y="68" width="32" height="68"/>`;
 if(s==='ball')return ball(92);
 if(s==='threeBalls')return ball(58)+ball(100)+ball(142);
 if(s==='diamond')return dia(100);
 if(s==='conesGear'){let gx=bvSideX('stbd');return `<polygon class="bridgeShape" points="250,72 290,72 270,108"/><polygon class="bridgeShape" points="270,110 250,146 290,146"/><polygon class="bridgeShape" points="${gx},115 ${gx-20},151 ${gx+20},151"/>`;}
 if(s==='mineBalls')return ball(62)+`<circle class="bridgeShape" cx="205" cy="118" r="14"/><circle class="bridgeShape" cx="335" cy="118" r="14"/>`;
 if(s==='dredge'){let sx=bvSideX('stbd'),px=bvSideX('port');return ball(50)+dia(92)+ball(134)+`<circle class="bridgeShape" cx="${sx}" cy="82" r="14"/><circle class="bridgeShape" cx="${sx}" cy="124" r="14"/><polygon class="bridgeShape" points="${px},64 ${px+17},82 ${px},100 ${px-17},82"/><polygon class="bridgeShape" points="${px},106 ${px+17},124 ${px},142 ${px-17},124"/>`; }
 if(s==='alpha')return `<g transform="translate(330 72)"><rect x="0" y="0" width="42" height="76" fill="#fff"/><path d="M0 0 L42 38 L0 76 Z" fill="#1d62ad"/></g>`;
 return '';
}
function bvProjectedNavPoint(role){
  const side = bvAspect==='stbd' || bvAspect==='port';
  const reverse = bvAspect==='port';

  const pts={
    mastF:{fore:0.25,z:155},
    mastA:{fore:-0.28,z:128},
    portSide:{fore:0.08,z:236},
    stbdSide:{fore:0.08,z:236},
    stern:{fore:-0.48,z:246}
  };
  const p=pts[role];
  if(!p)return [270,200];

  if(!side){
    return [270,p.z];
  }
  let x=270 + (reverse?-1:1) * p.fore * 250;
  return [x,p.z];
}

function bvNav(c){
  let a=bvAspect,o=[],stern=a==='astern';
  let pf=bvProjectedNavPoint('mastF'), pa=bvProjectedNavPoint('mastA');
  let pp=bvProjectedNavPoint('portSide'), ps=bvProjectedNavPoint('stbdSide');
  let pst=bvProjectedNavPoint('stern');

  const ordinary = c.status.length===0;
  if((c.nav==='pd'||c.nav==='pd2')&&!stern && ordinary){
    o.push(['W',pf[0],pf[1]]);
    if(c.nav==='pd2')o.push(['W',pa[0],pa[1]]);
  }
  if((c.nav==='tow2'||c.nav==='push')&&!stern){o.push(['W',270,128],['W',270,164]);}
  if(c.nav==='tow3'&&!stern){o.push(['W',270,110],['W',270,146],['W',270,182]);}

  if(['pd','pd2','sail','move','tow2','tow3','push'].includes(c.nav)){
    if(a==='ahead')o.push(['G',205,246],['R',335,246]);
    if(a==='stbd')o.push(['G',ps[0],ps[1]]);
    if(a==='port')o.push(['R',pp[0],pp[1]]);
    if(a==='astern')o.push(['W',pst[0],pst[1]]);
  }
  if((c.nav==='tow2'||c.nav==='tow3')&&a==='astern')o.push(['Y',pst[0],pst[1]-36]);
  return o;
}

function bvStatusPoint(role){
  const side=bvAspect==='stbd'||bvAspect==='port';
  const reverse=bvAspect==='port';
  const map={
    statusTop:{fore:0,z:70}, statusMid:{fore:0,z:106}, statusLow:{fore:0,z:142},
    anchorF:{fore:0.34,z:92}, anchorA:{fore:-0.38,z:126}
  };
  let p=map[role]; if(!p)return [270,100];
  if(!side)return [270,p.z];
  return [270+(reverse?-1:1)*p.fore*250,p.z];
}

function bvGraphic(){
 let c=BV[bvI],day=bvLight==='day',body='';
 if(day){
   body+=bvShape(c.shape);
 } else {
   let whiteCount=0;
   c.status.forEach((x,idx)=>{
     let col=x[0], sx=x[1], sy=x[2];
     if(['anchorU50','anchor50','agroundU50','aground50'].includes(c.id) && col==='W'){
       whiteCount++;
       let role=(c.id==='anchor50'||c.id==='aground50') && whiteCount===2 ? 'anchorA':'anchorF';
       let q=bvStatusPoint(role);
       if(c.id==='aground50' && (bvAspect==='ahead'||bvAspect==='astern')) q = whiteCount===1 ? [350,96] : [190,132];
       if(c.id==='agroundU50' && (bvAspect==='ahead'||bvAspect==='astern')) q = [350,104];
       body+=bvLamp(col,q[0],q[1]);
     } else if(c.id==='gear150' && idx===2){
       body+=bvLamp(col,bvSideX('stbd'),sy);
     } else if(c.id==='dredge' && idx>=3){
       let side=(idx===3||idx===4)?'stbd':'port';
       body+=bvLamp(col,bvSideX(side),sy);
     } else body+=bvLamp(col,sx,sy);
   });
   bvNav(c).forEach(x=>body+=bvLamp(...x));
 }
 let label=day?'DAY SHAPE':(BV_ASPECTS.find(a=>a[0]===bvAspect)?.[1]||'BOW')+' VIEW';
 let labelFill=day?'#555':'#8fd9ee';
 return `<svg viewBox="0 0 540 380" role="img" aria-label="${c.name} — ${label}">${body}<text x="270" y="354" text-anchor="middle" fill="${labelFill}" font-size="12" font-weight="800" letter-spacing="1.2">${label}</text></svg>`;
}
function bvRender(){
 bvNormaliseIndex(); let c=BV[bvI],pos=bvDisplayPos();
 $('bvLearn').classList.toggle('active',bvMode==='learn');$('bvTest').classList.toggle('active',bvMode==='test');$('bvDay').classList.toggle('active',bvLight==='day');$('bvNight').classList.toggle('active',bvLight==='night');
 $('bvAspectWrap').style.display=bvLight==='night'?'block':'none';
 $('bvAspects').innerHTML=BV_ASPECTS.map(a=>`<button class="${a[0]===bvAspect?'active':''}" onclick="bvAspectSet('${a[0]}')">${a[1]}</button>`).join('');
 $('bvScene').className='bridgeScene '+(bvLight==='day'?'day':'');$('bvScene').innerHTML=bvGraphic();
 $('bvProgress').textContent=`${pos.p} / ${pos.n} • ${bvLight==='night'?'NAV LIGHTS':'PRESCRIBED DAY SHAPES'}`;
 if(bvMode==='learn'){
   let aspect=bvLight==='night'?BV_ASPECTS.find(a=>a[0]===bvAspect)[1]+' VIEW':'DAYLIGHT';
   let seen=bvLight==='day'?('Prescribed day display: '+bvDayDescription(c)+'.'):c.memory;
   $('bvIdentity').innerHTML=`<h3>${c.name}</h3><p><b>WHAT YOU SEE:</b> ${seen}</p><p style="margin-top:8px"><b>WHAT IT MEANS:</b> ${c.name}.</p><span class="bridgeBadge">COLREG RULE ${c.rule}</span><span class="bridgeBadge">${aspect}</span>`;
   $('bvQuiz').innerHTML=''
 } else {
   $('bvIdentity').innerHTML=`<h3>${bvLight==='night'?'IDENTIFY THESE LIGHTS':'IDENTIFY THIS SHAPE'}</h3><p>${bvLight==='night'?'Identify the vessel/status from the lights and viewing aspect.':'Identify the vessel/status from the prescribed day shape.'}</p>`;
   bvQuizChoices();
 }
}
function bvDayDescription(c){const m={motor:'black cone, apex downward',trawl:'two black cones with apexes together',fish:'two black cones with apexes together',nuc:'two black balls in a vertical line',ram:'black ball-diamond-ball in a vertical line',cbd:'black cylinder',anchorU50:'one black ball',anchor50:'one black ball',agroundU50:'three black balls in a vertical line',aground50:'three black balls in a vertical line',towLong:'one black diamond (tow exceeds 200 m)',gear150:'two cones apexes together plus an additional cone apex upward toward the outlying gear',dredge:'ball-diamond-ball plus two balls on the obstruction side and two diamonds on the safe-passage side',diving:'rigid International Code flag A',mine:'three black balls in the prescribed mine-clearance arrangement'};return m[c.id]||'prescribed black day shape'}
function bvQuizChoices(){let c=BV[bvI],pool=BV.filter(x=>x.id!==c.id),wrong=[pool[(bvI*2)%pool.length],pool[(bvI*2+3)%pool.length],pool[(bvI*2+6)%pool.length]],opts=[c,...wrong].sort((a,b)=>a.name.localeCompare(b.name));$('bvQuiz').innerHTML=`<div class="quizOpts">${opts.map(x=>`<button onclick="bvAnswer('${x.id}')">${x.name}</button>`).join('')}</div><div id="bvResult" class="quizResult"></div>`}
function bvAnswer(id){let c=BV[bvI],ok=id===c.id;$('bvResult').textContent=(ok?'✓ Correct — ':'✗ Correct answer: '+c.name+' — ')+c.memory;$('bvResult').className='quizResult '+(ok?'ok':'warn')}
function bvModeSet(m){bvMode=m;bvRender()} function bvLightSet(m){bvLight=m;bvNormaliseIndex();bvRender()} function bvAspectSet(a){bvAspect=a;bvRender()}
function bvNext(){let v=bvValidIndexes(),p=v.indexOf(bvI);bvI=v[(p+1+v.length)%v.length];bvRender()} function bvPrev(){let v=bvValidIndexes(),p=v.indexOf(bvI);bvI=v[(p-1+v.length)%v.length];bvRender()}

let signalAudioCtx=null, hornProfile='large', audioBusyUntil=0;

function getSignalAudio(){
  if(!signalAudioCtx){
    const C=window.AudioContext||window.webkitAudioContext;
    signalAudioCtx=new C();
  }
  if(signalAudioCtx.state==='suspended') signalAudioCtx.resume();
  return signalAudioCtx;
}

const HORN_PROFILES=window.PW_ORIGINAL_LIBRARIES.HORN_PROFILES;

function setHornProfile(p){
  hornProfile=p;
  ['large','medium','small'].forEach(x=>$('horn'+x[0].toUpperCase()+x.slice(1)).classList.toggle('active',x===p));
  $('hornProfileText').textContent=HORN_PROFILES[p].label+' • harmonic layers added for a fuller marine-whistle character.';
}

function audioMeterRun(sec){
  const bar=$('audioMeterBar'); if(!bar)return;
  bar.style.transition='none';bar.style.width='0%';
  requestAnimationFrame(()=>{bar.style.transition=`width ${sec}s linear`;bar.style.width='100%'});
  setTimeout(()=>{bar.style.transition='none';bar.style.width='0%'},sec*1000+120);
}

function setAudioStatus(msg){if($('audioStatus'))$('audioStatus').textContent=msg}

function hornBlast(duration,delay=0){
  const ctx=getSignalAudio(), t=ctx.currentTime+delay, base=HORN_PROFILES[hornProfile].f;
  const master=ctx.createGain();
  const comp=ctx.createDynamicsCompressor();
  master.connect(comp);comp.connect(ctx.destination);

  master.gain.setValueAtTime(0.0001,t);
  master.gain.exponentialRampToValueAtTime(0.32,t+0.07);
  master.gain.setValueAtTime(0.32,Math.max(t+0.08,t+duration-0.12));
  master.gain.exponentialRampToValueAtTime(0.0001,t+duration);

  [
    {r:1.00,g:.75,type:'sawtooth'},
    {r:1.50,g:.28,type:'sine'},
    {r:2.00,g:.18,type:'sine'},
    {r:2.52,g:.10,type:'triangle'}
  ].forEach((h,i)=>{
    const o=ctx.createOscillator(), g=ctx.createGain(), lp=ctx.createBiquadFilter();
    o.type=h.type;o.frequency.setValueAtTime(base*h.r,t);
    if(i===0){
      o.detune.setValueAtTime(-8,t);
      o.detune.linearRampToValueAtTime(5,t+Math.min(.8,duration/2));
    }
    g.gain.value=h.g;
    lp.type='lowpass';lp.frequency.value=Math.min(1800,base*6);
    o.connect(g);g.connect(lp);lp.connect(master);
    o.start(t);o.stop(t+duration+.05);
  });

  const frames=Math.max(1,Math.floor(ctx.sampleRate*duration));
  const buf=ctx.createBuffer(1,frames,ctx.sampleRate),data=buf.getChannelData(0);
  for(let i=0;i<frames;i++)data[i]=(Math.random()*2-1)*0.08;
  const noise=ctx.createBufferSource(),ng=ctx.createGain(),bp=ctx.createBiquadFilter();
  noise.buffer=buf;bp.type='bandpass';bp.frequency.value=base*2.2;bp.Q.value=.7;ng.gain.value=.18;
  noise.connect(bp);bp.connect(ng);ng.connect(master);noise.start(t);noise.stop(t+duration);
}

function bellStrike(delay=0,kind='bell'){
  const ctx=getSignalAudio(),t=ctx.currentTime+delay;
  const freqs=kind==='gong'?[180,245,322,428,570]:[620,865,1180,1530,2020];
  const master=ctx.createGain();master.connect(ctx.destination);
  master.gain.setValueAtTime(.0001,t);master.gain.linearRampToValueAtTime(kind==='gong'?.38:.26,t+.008);
  master.gain.exponentialRampToValueAtTime(.0001,t+(kind==='gong'?2.8:1.9));
  freqs.forEach((f,i)=>{
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine';o.frequency.value=f;g.gain.value=1/(1+i*.8);
    o.connect(g);g.connect(master);o.start(t);o.stop(t+(kind==='gong'?3:2.1));
  });
}

function audioShort(btn){
  getSignalAudio();setAudioStatus('Playing one short blast • about 1 second');
  hornBlast(1.0);audioMeterRun(1.0);
}
function audioProlonged(btn){
  getSignalAudio();setAudioStatus('Playing one prolonged blast • 4.5 seconds');
  hornBlast(4.5);audioMeterRun(4.5);
}
function audioSPS(btn){
  getSignalAudio();setAudioStatus('Playing short • prolonged • short');
  hornBlast(1.0,0);hornBlast(4.5,1.7);hornBlast(1.0,6.9);audioMeterRun(7.9);
}
function audioBellStrike(btn){
  getSignalAudio();setAudioStatus('Playing single bell strike');bellStrike(0,'bell');audioMeterRun(1.9);
}
function audioRapidBell(btn){
  getSignalAudio();setAudioStatus('Playing rapid bell for about 5 seconds');
  for(let i=0;i<12;i++)bellStrike(i*.42,'bell');audioMeterRun(5.1);
}
function audioRapidGong(btn){
  getSignalAudio();setAudioStatus('Playing rapid gong for about 5 seconds');
  for(let i=0;i<8;i++)bellStrike(i*.63,'gong');audioMeterRun(5.1);
}

const MAN_SIGNALS=window.PW_ORIGINAL_LIBRARIES.MAN_SIGNALS;

const FOG_SIGNALS=window.PW_ORIGINAL_LIBRARIES.FOG_SIGNALS;

const DISTRESS_SIGNALS=window.PW_ORIGINAL_LIBRARIES.DISTRESS_SIGNALS;

const HARBOUR_SIGNALS=window.PW_ORIGINAL_LIBRARIES.HARBOUR_SIGNALS;

function harbourCardHTML(s){
 return `<div class="harbourCard"><h4>${s.title}</h4><div class="sigPattern">${s.pattern}</div><p>${s.meaning}</p><span class="ruleFlag ${s.flag==='LOCAL'?'local':''}">${s.basis}</span>${s.seq.length?`<button onclick="playHarbourSignal('${s.id}')">🔊 PLAY</button>`:''}</div>`;
}
function renderHarbourSignals(){
 if($('harbourSignalGrid')) $('harbourSignalGrid').innerHTML=HARBOUR_SIGNALS.map(harbourCardHTML).join('');
}
function playHarbourSignal(id){
 let s=HARBOUR_SIGNALS.find(x=>x.id===id);if(!s||!s.seq.length)return;
 setAudioStatus('Playing: '+s.title);playSeq(s.seq);
}
function answerMarinaSignal(id){
 const ok=id==='three';
 if(ok){
   $('marinaResult').textContent='✓ Correct — three short blasts: operating astern propulsion.';
   $('marinaResult').className='quizResult ok';
   playHarbourSignal('harbourAstern');
 }else{
   $('marinaResult').textContent='✗ Not quite — for this exercise the correct COLREG signal is three short blasts for operating astern propulsion.';
   $('marinaResult').className='quizResult warn';
 }
}

let sigQuizPool=[...MAN_SIGNALS,...FOG_SIGNALS].filter(s=>s.seq&&s.seq.length),sigQuizIndex=-1,sigQuizCurrent=null;

function showSignalSection(name){
  const ids={audio:'Audio',man:'Man',fog:'Fog',distress:'Distress',harbour:'Harbour',quiz:'Quiz'};
  Object.keys(ids).forEach(x=>{
    const panel=$('sig'+ids[x]), tab=$('sigTab'+ids[x]);
    if(panel)panel.classList.toggle('active',x===name);
    if(tab)tab.classList.toggle('active',x===name);
  });

  if(name==='man' || name==='fog' || name==='distress') renderSignalCards();
  if(name==='harbour') renderHarbourSignals();
  if(name==='audio') setHornProfile(hornProfile||'large');
  if(name==='quiz'&&sigQuizIndex<0) nextSignalQuiz();
}

function renderSignalCards(){
  if($('manSignalGrid')) $('manSignalGrid').innerHTML=MAN_SIGNALS.map(s=>signalCardHTML(s)).join('');
  if($('fogSignalGrid')) $('fogSignalGrid').innerHTML=FOG_SIGNALS.map(s=>signalCardHTML(s)).join('');
  if($('distressGrid')) $('distressGrid').innerHTML=DISTRESS_SIGNALS.map(d=>`<div class="distressCard" onclick="openDistress('${d.id}')"><div class="distressIcon">${d.icon}</div><b>${d.title}</b><small>${d.short}</small><span class="tapHint">TAP FOR PROCEDURE / DETAIL</span></div>`).join('');
}

function openDistress(id){
  const d=DISTRESS_SIGNALS.find(x=>x.id===id), box=$('distressDetail');
  if(!d||!box)return;
  let extra='';
  if(d.special==='mayday' || d.special==='panpan') extra=maydayProcedureHTML();
  if(d.special==='beacon') extra=beaconHTML('epirb');
  if(d.special==='plb') extra=beaconHTML('plb');
  box.innerHTML=`<div class="ver">${d.basis}</div><h3>${d.icon} ${d.title}</h3><p>${d.detail}</p>${extra}<div class="sourceNote">Project Watch training wording is paraphrased from the current IMO COLREG Annex IV and UK MCA guidance checked for this build.</div>`;
  box.classList.add('active');
  if(d.special==='mayday' || d.special==='panpan') setTimeout(()=>{setRadioExample(d.special==='panpan'?'panpan':'mayday')},0);
  box.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function maydayProcedureHTML(){
 return `<div class="maydayPanel">
   <div class="ver">UK SMALL-VESSEL VHF / DSC DISTRESS PROCEDURE</div>
   <div class="procedureSteps">
    <div class="procedureStep"><b>1 • Grave and imminent danger</b><small>MAYDAY is for grave and imminent danger where assistance is required.</small></div>
    <div class="procedureStep"><b>2 • Send DSC distress alert</b><small>Press and hold the DSC distress control until the alert is sent. If time and equipment permit, select the nature of distress.</small></div>
    <div class="procedureStep"><b>3 • Channel 16 voice call</b><small>On DSC acknowledgement, or after about 15 seconds, transmit the distress call and message on VHF Channel 16.</small></div>
   </div>

   <div class="radioSim">
    <div class="ver">RADIO PROCEDURE TRAINER</div>
    <h3>Hear a complete worked example</h3>
    <p class="note">Training details are fictional. The voice uses your device's British-English speech voice where available.</p>
    <div class="radioSimTabs">
      <button id="radioMaydayTab" class="active" onclick="setRadioExample('mayday')">MAYDAY</button>
      <button id="radioPanTab" onclick="setRadioExample('panpan')">PAN-PAN</button>
    </div>
    <div id="radioExampleText" class="exampleCall"></div>
    <div class="voiceControls">
      <button class="big" onclick="playRadioExample()">🔊 PLAY SPOKEN EXAMPLE</button>
      <button class="big alt" onclick="stopRadioExample()">■ STOP</button>
      <button class="big alt" onclick="newRadioScenario()">↻ NEW FICTIONAL DETAILS</button>
    </div>
    <div id="radioVoiceStatus" class="voiceNote">British English voice requested • device voice availability varies.</div>
   </div>

   <div class="procedureStep" style="margin-top:10px"><b>4 • Listen on Channel 16</b><small>Release transmit and keep listening for acknowledgement and Coastguard instructions.</small></div>
 </div>`;
}

let radioExampleMode='mayday';
let radioScenarioIndex=0;
const RADIO_SCENARIOS=window.PW_ORIGINAL_LIBRARIES.RADIO_SCENARIOS;

function currentRadioScenario(){return RADIO_SCENARIOS[radioScenarioIndex%RADIO_SCENARIOS.length]}

function setRadioExample(mode){
 radioExampleMode=mode;
 const a=$('radioMaydayTab'),b=$('radioPanTab');
 if(a)a.classList.toggle('active',mode==='mayday');
 if(b)b.classList.toggle('active',mode==='panpan');
 renderRadioExample();
}
function newRadioScenario(){
 radioScenarioIndex=(radioScenarioIndex+1)%RADIO_SCENARIOS.length;
 renderRadioExample();
}
function maydayExampleText(s){
 return `<span class="scenarioBadge">FICTIONAL TRAINING EXAMPLE</span><br>
 <b class="urgent">MAYDAY, MAYDAY, MAYDAY</b><br>
 THIS IS <b>${s.name}, ${s.name}, ${s.name}</b><br>
 Call sign <b>${s.call}</b> • MMSI <b>${s.mmsi}</b><br><br>
 <b class="urgent">MAYDAY</b><br>
 THIS IS <b>${s.name}, ${s.call}, MMSI ${s.mmsi}</b><br>
 POSITION <b>${s.posDisplay}</b><br>
 ${s.distress}.<br>
 ${s.assist}.<br>
 Persons on board: <b>${s.pob}</b>.<br>
 ${s.other}<br>
 <b>OVER</b>`;
}
function panExampleText(s){
 return `<span class="scenarioBadge">FICTIONAL URGENCY EXAMPLE</span><br>
 <b>PAN PAN, PAN PAN, PAN PAN</b><br>
 <b>ALL STATIONS, ALL STATIONS, ALL STATIONS</b><br>
 THIS IS <b>${s.name}, ${s.name}, ${s.name}</b><br>
 Call sign <b>${s.call}</b> • MMSI <b>${s.mmsi}</b><br>
 Please go to Channel <b>six seven</b>.<br>
 <b>OUT</b><br><br>
 <span class="scenarioBadge">WORKING CHANNEL 67 — EXAMPLE URGENCY MESSAGE</span><br>
 <b>PAN PAN, PAN PAN, PAN PAN</b><br>
 ALL STATIONS, ALL STATIONS, ALL STATIONS<br>
 THIS IS <b>${s.name}, ${s.call}, MMSI ${s.mmsi}</b><br>
 POSITION <b>${s.posDisplay}</b><br>
 We have lost propulsion and are drifting toward a lee shore. We are not presently in grave and imminent danger.<br>
 Persons on board: <b>${s.pob}</b>.<br>
 Request assistance.<br>
 <b>OVER</b>`;
}
function renderRadioExample(){
 const box=$('radioExampleText'); if(!box)return;
 const s=currentRadioScenario();
 box.innerHTML=radioExampleMode==='mayday'?maydayExampleText(s):panExampleText(s);
}
function radioSpeechText(){
 const s=currentRadioScenario();
 if(radioExampleMode==='mayday')
 return `Mayday, Mayday, Mayday. This is ${s.name}, ${s.name}, ${s.name}. Call sign ${s.call}. M M S I ${s.mmsi}. Mayday. This is ${s.name}, call sign ${s.call}, M M S I ${s.mmsi}. Position ${s.pos}. ${s.distress}. ${s.assist}. Persons on board ${s.pob}. ${s.other}. Over.`;
 return `Pan Pan, Pan Pan, Pan Pan. All stations, all stations, all stations. This is ${s.name}, ${s.name}, ${s.name}. Call sign ${s.call}. M M S I ${s.mmsi}. Please go to channel six seven. Out. Pan Pan, Pan Pan, Pan Pan. All stations, all stations, all stations. This is ${s.name}, call sign ${s.call}, M M S I ${s.mmsi}. Position ${s.pos}. We have lost propulsion and are drifting toward a lee shore. We are not presently in grave and imminent danger. Persons on board ${s.pob}. Request assistance. Over.`;
}
function chooseBritishVoice(){
 const vs=window.speechSynthesis?window.speechSynthesis.getVoices():[];
 return vs.find(v=>/^en-GB$/i.test(v.lang)&&/female|serena|kate|susan|samantha|victoria|moira|fiona/i.test(v.name))
     ||vs.find(v=>/^en-GB$/i.test(v.lang))
     ||vs.find(v=>/^en/i.test(v.lang))||null;
}
function playRadioExample(){
 if(!('speechSynthesis' in window)){if($('radioVoiceStatus'))$('radioVoiceStatus').textContent='Speech playback is not supported by this browser.';return}
 speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(radioSpeechText());
 u.lang='en-GB';u.rate=.88;u.pitch=1;
 const v=chooseBritishVoice(); if(v)u.voice=v;
 u.onstart=()=>{if($('radioVoiceStatus'))$('radioVoiceStatus').textContent='Playing '+(radioExampleMode==='mayday'?'MAYDAY':'PAN-PAN')+' example'+(v?' • '+v.name:' • en-GB device voice')};
 u.onend=()=>{if($('radioVoiceStatus'))$('radioVoiceStatus').textContent='Example complete.'};
 speechSynthesis.speak(u);
}
function stopRadioExample(){if('speechSynthesis' in window)speechSynthesis.cancel();if($('radioVoiceStatus'))$('radioVoiceStatus').textContent='Playback stopped.'}

function beaconHTML(kind){
 const isPLB=kind==='plb';
 return `<div class="beaconCompare">
   <div class="beaconBox"><b>${isPLB?'PLB':'EPIRB'}</b>${isPLB?'Personal beacon intended to identify a person in distress.':'Maritime beacon associated with a vessel and expressly named in COLREG Annex IV.'}</div>
   <div class="beaconBox"><b>406 MHz</b>Satellite distress alerting to search and rescue authorities; registration information helps responders identify the casualty and contacts.</div>
   <div class="beaconBox"><b>UK registration</b>Current UK 2026 rules require relevant UK-coded EPIRBs and PLBs to be registered and the details kept current.</div>
   <div class="beaconBox"><b>Training distinction</b>${isPLB?'PLB belongs in Project Watch emergency equipment training, but we label it MCA/GMDSS equipment rather than pretending Annex IV names PLB separately.':'EPIRB is directly listed by Annex IV as a recognised distress signal.'}</div>
 </div>`;
}

function signalCardHTML(s){
 return `<div class="sigCard"><h4>${s.title}</h4><div class="sigPattern">${s.pattern}</div><p>${s.meaning}</p><span class="bridgeBadge">Rule ${s.rule}</span>${s.seq&&s.seq.length?`<button onclick="playDefinedSignal('${s.id}')">🔊 PLAY</button>`:''}</div>`;
}

function playDefinedSignal(id){
  let s=[...MAN_SIGNALS,...FOG_SIGNALS].find(x=>x.id===id);if(!s)return;
  setAudioStatus('Playing: '+s.title);playSeq(s.seq);
}

function playSeq(seq){
  getSignalAudio();
  let t=0;
  seq.forEach(([kind])=>{
    if(kind==='short'){hornBlast(1.0,t);t+=1.65}
    else if(kind==='long'){hornBlast(4.5,t);t+=5.2}
    else if(kind==='pause2'){t+=1.3}
    else if(kind==='rapid5'){for(let i=0;i<5;i++)hornBlast(.55,t+i*.8);t+=4.2}
    else if(kind==='rapidBell'){for(let i=0;i<12;i++)bellStrike(t+i*.42,'bell');t+=5.2}
    else if(kind==='rapidGong'){for(let i=0;i<8;i++)bellStrike(t+i*.63,'gong');t+=5.2}
    else if(kind==='threeBell'){for(let i=0;i<3;i++)bellStrike(t+i*.75,'bell');t+=2.6}
  });
  audioMeterRun(Math.max(1,t));
}

function nextSignalQuiz(){
  if(sigCourseActive&&sigCourseAnswered>=10){
    const pct=Math.round(sigCourseScore/10*100),pass=sigCourseScore>=8;
    $('sigQuizQ').textContent='Course checkpoint complete';
    $('sigQuizChoices').innerHTML='';
    $('sigQuizResult').innerHTML=`<b>${sigCourseScore} / 10 • ${pct}%</b><br>${pass?'Checkpoint achieved.':'Review the sound-signal sections and try again.'}<br><button style="margin-top:8px" onclick="startSignalCourseCheck()">TRY AGAIN</button>`;
    $('sigQuizResult').className='quizResult '+(pass?'ok':'warn');
    courseRecordScore('signals',pct,pass);sigCourseActive=false;return;
  }
  if(sigCourseActive){
    let available=sigQuizPool.filter(x=>!sigCourseSeen.has(x.id));
    if(!available.length){sigCourseSeen.clear();available=[...sigQuizPool]}
    sigQuizCurrent=available[Math.floor(Math.random()*available.length)];
    sigQuizIndex=sigQuizPool.indexOf(sigQuizCurrent);sigCourseSeen.add(sigQuizCurrent.id);
  }else{
    sigQuizIndex=(sigQuizIndex+1)%sigQuizPool.length;sigQuizCurrent=sigQuizPool[sigQuizIndex];
  }
  $('sigQuizQ').textContent=sigCourseActive?`Course checkpoint • ${sigCourseAnswered+1} / 10 • What signal did you hear?`:'What signal did you hear?';
  let pool=sigQuizPool.filter(x=>x.id!==sigQuizCurrent.id),wrong=[];
  for(let i=0;wrong.length<3;i++){
    let x=pool[(Math.max(sigQuizIndex,0)*3+i)%pool.length];
    if(!wrong.some(w=>w.id===x.id))wrong.push(x);
  }
  let opts=[sigQuizCurrent,...wrong].sort((a,b)=>a.title.localeCompare(b.title));
  $('sigQuizChoices').innerHTML=opts.map(o=>`<button type="button" onclick="answerSignalQuiz('${o.id}')">${o.title}</button>`).join('');
  $('sigQuizResult').textContent='';
}
function playSignalQuiz(){if(sigQuizCurrent)playSeq(sigQuizCurrent.seq)}
function answerSignalQuiz(id){
  let ok=id===sigQuizCurrent.id;
  if(sigCourseActive){
    sigCourseAnswered++;if(ok)sigCourseScore++;
  }
  $('sigQuizResult').textContent=(ok?'✓ Correct — ':'✗ Correct answer: '+sigQuizCurrent.title+' — ')+sigQuizCurrent.meaning+
    (sigCourseActive?` • Score ${sigCourseScore}/${sigCourseAnswered}`:'');
  $('sigQuizResult').className='quizResult '+(ok?'ok':'warn');
}

const TSS_RULES=window.PW_ORIGINAL_LIBRARIES.TSS_RULES;

function tssSVG(mode='base'){
 const correct=mode==='correct', wrong=mode==='wrong', join=mode==='join', busy=mode==='busy';
 let own='';
 if(correct) own=`<path d="M430 430 L430 250" stroke="#fff" stroke-width="8" marker-end="url(#aw)"/><path d="M430 430 C430 350 470 285 510 225" stroke="#6ee0ff" stroke-width="4" stroke-dasharray="10 8"/><text x="445" y="405" fill="#fff" font-size="14">HDG 000°</text><text x="500" y="300" fill="#6ee0ff" font-size="14">COG / tide set</text>`;
 if(wrong) own=`<path d="M330 430 L555 245" stroke="#ff8e8e" stroke-width="8" marker-end="url(#ar)"/><text x="355" y="395" fill="#ff8e8e" font-size="14">DIAGONAL HEADING</text>`;
 if(join) own=`<path d="M120 340 C210 340 245 325 320 290" stroke="#fff" stroke-width="8" marker-end="url(#aw)"/><text x="120" y="320" fill="#fff" font-size="14">JOIN AT SMALL ANGLE</text>`;
 let ships=busy?`<g fill="#fff"><circle cx="210" cy="180" r="7"/><circle cx="380" cy="180" r="7"/><circle cx="610" cy="180" r="7"/><circle cx="270" cy="350" r="7"/><circle cx="500" cy="350" r="7"/><circle cx="700" cy="350" r="7"/></g>`:'';
 return `<svg viewBox="0 0 860 500"><defs><marker id="aw" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#fff"/></marker><marker id="ar" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#ff8e8e"/></marker></defs>
 <rect width="860" height="500" fill="#3d83a5"/><rect y="70" width="860" height="100" fill="#4b91b2"/><rect y="220" width="860" height="70" fill="#2f708e"/><rect y="340" width="860" height="100" fill="#4b91b2"/>
 <text x="20" y="130" fill="#dff7ff" font-size="16">TRAFFIC LANE → → →</text><text x="20" y="262" fill="#dff7ff" font-size="16">SEPARATION ZONE</text><text x="600" y="400" fill="#dff7ff" font-size="16">← ← ← TRAFFIC LANE</text>
 <g stroke="#dff7ff" stroke-width="5" fill="none"><path d="M250 120h160" marker-end="url(#aw)"/><path d="M610 390H450" marker-end="url(#aw)"/></g>${ships}${own}</svg>`;
}

let tssGeometryMode='textbook';

function setTSSGeometry(mode){
 tssGeometryMode=mode;
 const map={textbook:'Textbook',tide:'Tide',wrong:'Wrong',join:'Join',leave:'Leave',badjoin:'Badjoin',termination:'Termination'};
 Object.entries(map).forEach(([k,n])=>{const b=$('geo'+n);if(b)b.classList.toggle('active',k===mode)});
 const meta={
  textbook:{hdg:'345°',cog:'345°',angle:'90°',mode:'TEXTBOOK',v:'✓ CORRECT — right-angle crossing heading',cls:'goodV',note:'Crossing: heading and track coincide at right angles to the general traffic flow.'},
  tide:{hdg:'345°',cog:'005°',angle:'90° HDG',mode:'TIDAL SET',v:'✓ CORRECT — heading is right-angle; COG is set by tide',cls:'goodV',note:'Do not mark the diagonal ground track wrong: Rule 10(c) concerns the crossing heading.'},
  wrong:{hdg:'020°',cog:'020°',angle:'55° ✕',mode:'INCORRECT',v:'✕ INCORRECT — diagonal crossing heading',cls:'badV',note:'The heading is not as nearly as practicable at right angles to the general direction of traffic flow.'},
  join:{hdg:'075°',cog:'075°',angle:'SHALLOW ✓',mode:'JOIN',v:'✓ CORRECT — joining from side at a small angle',cls:'goodV',note:'When joining from the side, use as small an angle to the general direction of traffic flow as practicable.'},
  leave:{hdg:'105°',cog:'105°',angle:'SHALLOW ✓',mode:'LEAVE',v:'✓ CORRECT — leaving to side at a small angle',cls:'goodV',note:'When leaving to the side, peel away at as small an angle to the general traffic flow as practicable.'},
  badjoin:{hdg:'010°',cog:'010°',angle:'STEEP ✕',mode:'INCORRECT',v:'✕ INCORRECT — steep side entry',cls:'badV',note:'This deliberately steep entry is not the small-angle side joining geometry Rule 10 calls for.'},
  termination:{hdg:'JOIN / LEAVE',cog:'TERMINATION',angle:'10(b)(iii)',mode:'RULE 10(f)',v:'★ NORMAL METHOD — join or leave at the lane termination',cls:'infoV',note:'Simplified training view: the traffic lanes visibly start/end at the termination, with open water beyond. Particular caution is required near TSS terminations.'}
 }[mode];
 ['tssBridgeHdg','tssBridgeCog','tssCrossAngle','tssBridgeMode'].forEach((id,i)=>{if($(id))$(id).textContent=[meta.hdg,meta.cog,meta.angle,meta.mode][i]});
 if($('tssGeometryNote'))$('tssGeometryNote').textContent=meta.note;
 if($('tssVerdict')){$('tssVerdict').textContent=meta.v;$('tssVerdict').className='tssVerdict '+meta.cls};
 const hud=$('tssBridgeHdg')?.parentElement?.parentElement;
 if(hud){
   const labels=hud.querySelectorAll('small');
   if(mode==='termination'){
     ['MANOEUVRE','LOCATION','RULE','CAUTION'].forEach((v,i)=>{if(labels[i])labels[i].textContent=v});
   }else{
     ['OWN HDG','OWN COG','GEOMETRY','MODE'].forEach((v,i)=>{if(labels[i])labels[i].textContent=v});
   }
 }
 if($('tssEcdisExample'))$('tssEcdisExample').innerHTML=tssEcdisSVG(false,mode);
}

function tssEcdisSVG(live=false,mode=tssGeometryMode){
 const targets = [
  {x:190,y:105,n:'HERA HIGHWAY',vx:90,vy:-8},
  {x:355,y:145,n:'PROWL WEALTH',vx:88,vy:-15},
  {x:515,y:175,n:'SHENG AN YING',vx:95,vy:-18},
  {x:655,y:205,n:'WATERSK MONTA',vx:92,vy:-10},
  {x:235,y:355,n:'SEA PANTHER',vx:-88,vy:18},
  {x:420,y:390,n:'COSCO MERIT',vx:-92,vy:22},
  {x:600,y:410,n:'TAU D IF',vx:-90,vy:20},
  {x:730,y:335,n:'TARGET 08',vx:-95,vy:12}
 ];
 let tg = targets.map(t=>`
   <g class="ecdisTargets">
    <polygon points="${t.x},${t.y-10} ${t.x+9},${t.y+9} ${t.x-9},${t.y+9}" fill="#77b8a5" stroke="#2e554b" stroke-width="2"/>
    <line x1="${t.x}" y1="${t.y}" x2="${t.x+t.vx}" y2="${t.y+t.vy}" stroke="#9b4f4f" stroke-width="2"/>
    <text x="${t.x+12}" y="${t.y-10}">${t.n}</text>
   </g>`).join('');

 let ownTrack='', ownShip='', angleMark='';
 if(mode==='textbook' || live){
   ownTrack=`<path d="M285 500 L375 255 L455 35" stroke="#2f9c78" stroke-width="4" stroke-dasharray="9 7"/>`;
   ownShip=`<g transform="translate(375 255) rotate(20)"><path d="M0,-25 L13,19 L0,28 L-13,19 Z" fill="#9b2f2f" stroke="#5a1515" stroke-width="2"/><line x1="0" y1="-25" x2="0" y2="-102" stroke="#9b2f2f" stroke-width="3"/></g>`;
   angleMark=`<path d="M355 300 l24 8 l8 -24" fill="none" stroke="#16744e" stroke-width="3"/><text x="330" y="330" fill="#16744e" font-size="14" font-weight="800">✓ 90° HDG</text>`;
 } else if(mode==='tide'){
   ownTrack=`<path d="M285 500 C320 430 345 345 375 255 C405 165 455 90 515 35" stroke="#2f9c78" stroke-width="4" stroke-dasharray="9 7"/>`;
   ownShip=`<g transform="translate(375 255) rotate(20)"><path d="M0,-25 L13,19 L0,28 L-13,19 Z" fill="#9b2f2f" stroke="#5a1515" stroke-width="2"/><line x1="0" y1="-25" x2="0" y2="-102" stroke="#9b2f2f" stroke-width="3"/></g>`;
   angleMark=`<text x="315" y="325" fill="#16744e" font-size="14" font-weight="800">✓ 90° HEADING</text><text x="470" y="92" fill="#2f9c78" font-size="12" font-weight="700">COG SET BY TIDE — NOT AN ERROR</text>`;
 } else if(mode==='wrong'){
   ownTrack=`<path d="M180 500 L445 255 L690 35" stroke="#cf3f45" stroke-width="5" stroke-dasharray="10 7"/>`;
   ownShip=`<g transform="translate(445 255) rotate(48)"><path d="M0,-25 L13,19 L0,28 L-13,19 Z" fill="#9b2f2f" stroke="#5a1515" stroke-width="2"/></g>`;
   angleMark=`<g fill="#c92f38" font-weight="900"><text x="310" y="370" font-size="42">✕</text><text x="500" y="170" font-size="42">✕</text><text x="470" y="295" font-size="15">INCORRECT DIAGONAL — 55° ✕</text></g>`;
 } else if(mode==='join'){
   ownTrack=`<path d="M65 72 C150 90 215 108 300 130 C390 153 475 170 585 187" stroke="#18815b" stroke-width="5" stroke-dasharray="9 7"/>`;
   ownShip=`<g transform="translate(300 130) rotate(98)"><path d="M0,-25 L13,19 L0,28 L-13,19 Z" fill="#9b2f2f" stroke="#5a1515" stroke-width="2"/></g>`;
   angleMark=`<text x="82" y="55" fill="#16744e" font-size="14" font-weight="900">✓ JOIN FROM SIDE — SMALL ANGLE</text>`;
 } else if(mode==='leave'){
   ownTrack=`<path d="M110 112 C250 130 370 150 505 170 C590 182 660 205 745 245" stroke="#18815b" stroke-width="5" stroke-dasharray="9 7"/>`;
   ownShip=`<g transform="translate(505 170) rotate(100)"><path d="M0,-25 L13,19 L0,28 L-13,19 Z" fill="#9b2f2f" stroke="#5a1515" stroke-width="2"/></g>`;
   angleMark=`<text x="550" y="235" fill="#16744e" font-size="14" font-weight="900">✓ LEAVE TO SIDE — SMALL ANGLE</text>`;
 } else if(mode==='badjoin'){
   ownTrack=`<path d="M310 20 L390 120 L470 195" stroke="#cf3f45" stroke-width="5" stroke-dasharray="9 7"/>`;
   ownShip=`<g transform="translate(390 120) rotate(140)"><path d="M0,-25 L13,19 L0,28 L-13,19 Z" fill="#9b2f2f" stroke="#5a1515" stroke-width="2"/></g>`;
   angleMark=`<g fill="#c92f38" font-weight="900"><text x="350" y="105" font-size="42">✕</text><text x="445" y="175" font-size="14">STEEP SIDE ENTRY ✕</text></g>`;
 } else {
   return `<svg viewBox="0 0 900 520" role="img" aria-label="Simple Rule 10 traffic lane termination diagram">
    <rect width="900" height="520" fill="#eee4cc"/>
    <text x="450" y="42" text-anchor="middle" fill="#183d4d" font-size="23" font-weight="900">TRAFFIC LANE TERMINATION</text>
    <text x="450" y="68" text-anchor="middle" fill="#53656b" font-size="13">Simplified Rule 10 training diagram</text>

    <path d="M275 125 L845 125" stroke="#9f5353" stroke-width="4"/>
    <path d="M275 225 L845 225" stroke="#9f5353" stroke-width="4"/>
    <g fill="#9f5353" font-size="25" font-weight="900">
      <text x="420" y="185">→</text><text x="545" y="185">→</text><text x="670" y="185">→</text>
    </g>
    <text x="585" y="112" text-anchor="middle" fill="#7a4a4a" font-size="14" font-weight="800">TRAFFIC LANE</text>

    <path d="M70 85 C145 88 205 100 275 150 C330 165 365 172 405 175" fill="none" stroke="#16815a" stroke-width="6" stroke-dasharray="10 7"/>
    <g transform="translate(175 103) rotate(110)">
      <path d="M0,-25 L13,19 L0,28 L-13,19 Z" fill="#9b2f2f" stroke="#5a1515" stroke-width="2"/>
    </g>
    <text x="75" y="78" fill="#16744e" font-size="17" font-weight="900">✓ JOIN AT TERMINATION</text>

    <path d="M275 260 L845 260" stroke="#bd7373" stroke-width="2.5" stroke-dasharray="10 8"/>
    <path d="M275 310 L845 310" stroke="#bd7373" stroke-width="2.5" stroke-dasharray="10 8"/>
    <text x="585" y="291" text-anchor="middle" fill="#925858" font-size="14" font-weight="800">SEPARATION ZONE</text>

    <path d="M275 345 L845 345" stroke="#9f5353" stroke-width="4"/>
    <path d="M275 445 L845 445" stroke="#9f5353" stroke-width="4"/>
    <g fill="#9f5353" font-size="25" font-weight="900">
      <text x="690" y="405">←</text><text x="565" y="405">←</text><text x="440" y="405">←</text>
    </g>
    <text x="585" y="465" text-anchor="middle" fill="#7a4a4a" font-size="14" font-weight="800">TRAFFIC LANE</text>

    <path d="M440 395 C370 395 320 400 275 420 C215 452 150 465 72 466" fill="none" stroke="#16815a" stroke-width="6" stroke-dasharray="10 7"/>
    <g transform="translate(175 452) rotate(-75)">
      <path d="M0,-25 L13,19 L0,28 L-13,19 Z" fill="#9b2f2f" stroke="#5a1515" stroke-width="2"/>
    </g>
    <text x="70" y="505" fill="#16744e" font-size="17" font-weight="900">✓ LEAVE AT TERMINATION</text>

    <path d="M265 105 L265 465" stroke="#5b7b86" stroke-width="2" stroke-dasharray="5 7"/>
    <text x="255" y="252" text-anchor="end" fill="#245b70" font-size="14" font-weight="900">LANE</text>
    <text x="255" y="270" text-anchor="end" fill="#245b70" font-size="14" font-weight="900">TERMINATION</text>
    <text x="120" y="290" text-anchor="middle" fill="#53656b" font-size="14" font-weight="800">OPEN WATER</text>
   </svg>`;
 }

 return `<svg viewBox="0 0 900 520" aria-label="Project Watch ECDIS-style TSS crossing display">
   <rect width="900" height="520" fill="#eee4cc"/>
   <g stroke="#c8bfa9" stroke-width="1">
    <path d="M0 80 H900 M0 160 H900 M0 240 H900 M0 320 H900 M0 400 H900 M0 480 H900"/>
    <path d="M100 0 V520 M200 0 V520 M300 0 V520 M400 0 V520 M500 0 V520 M600 0 V520 M700 0 V520 M800 0 V520"/>
   </g>
   <g fill="none" stroke="#9f5353" stroke-width="3">
    <path d="M30 95 L870 210"/><path d="M20 180 L860 290"/>
    <path d="M40 325 L880 420"/><path d="M20 405 L850 490"/>
   </g>
   <g fill="none" stroke="#b87878" stroke-width="2" stroke-dasharray="10 8"><path d="M35 255 L870 355"/></g>
   <g class="ecdisLabel">
    <text x="70" y="120">TRAFFIC LANE →</text>
    <text x="620" y="440">← TRAFFIC LANE</text>
    <text x="355" y="292">SEPARATION ZONE</text>
   </g>
   <defs>
    <marker id="ea" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#9f5353"/></marker>
    <marker id="eb" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#9f5353"/></marker>
   </defs>
   <g stroke="#9f5353" stroke-width="2" fill="none">
    <path d="M180 135 h100" marker-end="url(#ea)"/><path d="M500 185 h100" marker-end="url(#ea)"/>
    <path d="M680 395 h-100" marker-end="url(#eb)"/><path d="M365 365 h-100" marker-end="url(#eb)"/>
   </g>
   ${tg}${ownTrack}${ownShip}${angleMark}
   ${live?'<circle cx="375" cy="255" r="62" fill="none" stroke="#5c7f94" stroke-width="2" stroke-dasharray="5 5"/><circle cx="375" cy="255" r="110" fill="none" stroke="#5c7f94" stroke-width="1.5" stroke-dasharray="4 6"/>':''}
 </svg>`;
}

function showTSS(name){
 const ids={learn:'Learn',examples:'Examples',bridge:'Bridge',test:'Test',live:'Live'};
 Object.keys(ids).forEach(x=>{
   const p=$('tss'+ids[x]),b=$('tssTab'+ids[x]);
   if(p)p.classList.toggle('active',x===name);
   if(b)b.classList.toggle('active',x===name);
 });
 if(name==='test'&&!tssCurrent)nextTSSQuestion();
 if(name==='bridge') setTSSGeometry(tssGeometryMode);
 if(name==='live') tssSimReset();
}

const TSS_TUTORIAL=window.PW_ORIGINAL_LIBRARIES.TSS_TUTORIAL;
let ttI=0,ttRAF=null,ttRunToken=0,ttAnswered=false;
let PW_TSS_VISITED=new Set();

function showTSSTutorial(){
 adaptTSSTutorialForProfile();
 document.querySelectorAll('.appPage.active,.screen.active').forEach(p=>p.classList.remove('active'));
 updateHeaderNav('tss');updateModuleContext('tss');$('tssTutorialPage').classList.add('active');
 ttI=0;ttRender();window.scrollTo({top:0,behavior:'smooth'});
}
function ttRender(){
 ttStopDemo();let L=TSS_TUTORIAL[ttI];ttAnswered=false;PW_TSS_VISITED.add(ttI);
 $('ttIndex').textContent=`${ttI+1} / ${TSS_TUTORIAL.length}`;$('ttProgress').style.width=((ttI+1)/TSS_TUTORIAL.length*100)+'%';
 $('ttList').innerHTML=TSS_TUTORIAL.map((x,i)=>`<button class="${i===ttI?'active':''}" onclick="ttSelect(${i})"><span>${String(i+1).padStart(2,'0')}</span><div><b>${x.title}</b><small>${x.rule}</small></div></button>`).join('');
 $('ttRule').textContent=L.rule;$('ttTitle').textContent=L.title;$('ttIntro').textContent=L.intro;$('ttExplain').textContent=L.explain;
 $('ttFacts').innerHTML=L.facts.map(f=>`<div><small>${f[0]}</small><b>${f[1]}</b></div>`).join('');
 $('ttQuestion').innerHTML=`<h4>${L.q}</h4><div class="answers">${L.a.map((a,i)=>`<button onclick="ttAnswer(${i})">${a}</button>`).join('')}</div><div id="ttAnswerResult" class="answerResult"></div>`;
 $('ttMode').textContent='GUIDED DEMO';$('ttStatus').textContent='READY';$('ttDemoBtn').textContent='▶ LIVE DEMO';ttDraw(L.mode,0);
 const nb=$('ttNextBtn');if(nb)nb.textContent=ttI===TSS_TUTORIAL.length-1?'START STAGE 7 FINAL →':'NEXT LESSON →';
}
function ttSelect(i){ttI=Math.max(0,Math.min(TSS_TUTORIAL.length-1,i));ttRender()}
function ttPrev(){ttSelect(ttI-1)}function ttNext(){if(ttI<TSS_TUTORIAL.length-1)ttSelect(ttI+1);else showStage7Final()}
function ttSkip(){try{speechSynthesis.cancel()}catch(e){};ttStopDemo();ttNext()}
function ttHear(){let L=TSS_TUTORIAL[ttI];speakMarine(`${L.title}. ${L.intro}. ${L.explain}. ${L.facts.map(x=>x[0]+'. '+x[1]).join('. ')}`,'instruction')}
function ttAnswer(i){let L=TSS_TUTORIAL[ttI],ok=i===L.correct;ttAnswered=true;$('ttAnswerResult').textContent=ok?'✓ Correct.':'✗ Not quite. '+L.a[L.correct]+'.';$('ttAnswerResult').style.color=ok?'#70e3ad':'#ffb77e';speakMarine(ok?'Correct.':'Not quite. '+L.a[L.correct]+'.','confirmation')}
function ttStopDemo(){ttRunToken++;if(ttRAF){cancelAnimationFrame(ttRAF);ttRAF=null}}
function ttRunDemo(){
 ttStopDemo();let token=ttRunToken,L=TSS_TUTORIAL[ttI];$('ttStatus').textContent='RUNNING';$('ttDemoBtn').textContent='■ REPLAY';
 const duration=L.mode==='final'?9000:6500,start=performance.now();
 speakMarine(L.explain,'instruction');
 function frame(ts){if(token!==ttRunToken)return;let p=Math.min(1,(ts-start)/duration);ttDraw(L.mode,p);if(p<1)ttRAF=requestAnimationFrame(frame);else{$('ttStatus').textContent='COMPLETE';ttRAF=null}}
 ttRAF=requestAnimationFrame(frame);
}
function ttShip(x,y,h,label=vesselNameUpper(),fill='#a12f2f'){
 return `<g transform="translate(${x} ${y}) rotate(${h})">
   <path d="M0,-22 L11,10 L8,18 L0,22 L-8,18 L-11,10 Z" fill="${fill}" stroke="#4b1a1a" stroke-width="2"/>
   <line x1="0" y1="-21" x2="0" y2="-48" stroke="${fill}" stroke-width="2"/>
 </g>
 <text x="${x+13}" y="${y-10}" font-size="8" fill="#183d4b" font-weight="800">${label}</text>`;
}
function ttDraw(mode,p){
  const xL=105,xR=795;
  const topY1=105,topY2=205,sepY1=225,sepY2=275,botY1=295,botY2=395;
  let vessels='',tracks='',notes='',caption='';

  const topTraffic=(x,label='LANE TRAFFIC')=>ttShip(x,155,90,label,'#667b85');
  const botTraffic=(x,label='LANE TRAFFIC')=>ttShip(x,345,270,label,'#667b85');

  const rightAngle=(x,y)=>`
    <path d="M${x+5} ${y-24} v19 h19" fill="none" stroke="#0a6d59" stroke-width="3"/>
    <text x="${x+30}" y="${y-7}" class="ruleLabel">90° HEADING</text>`;

  const crossingGeometry=()=>`

    <rect x="418" y="72" width="64" height="392" rx="18" class="crossCorridor"/>
    <path d="M450 455 V68" class="crossAxis"/>

    <path d="M205 345 H695" stroke="#a64a4a" stroke-width="7" fill="none"/>
    <path d="M675 333 L700 345 L675 357 Z" fill="#a64a4a"/>
    <text x="205" y="328" class="warnLabel">TRAFFIC FLOW → 090°</text>

    <path d="M450 345 H486 V309" fill="none" stroke="#07966d" stroke-width="6"/>
    <rect x="490" y="304" width="142" height="30" rx="8" class="angleBox"/>
    <text x="501" y="324" class="angleText">90° TO TRAFFIC FLOW</text>

    <text x="365" y="84" class="ruleLabel">WATCH ONE HEADING ↑ 000°</text>
    <text x="365" y="103" class="guideLabel">PERPENDICULAR TO LANE FLOW</text>

    <path d="M300 455 L405 300" class="forbiddenPath"/>
    <path d="M600 455 L495 300" class="forbiddenPath"/>
    <g class="forbiddenX" transform="translate(335 405)">
      <path d="M-10 -10 L10 10 M10 -10 L-10 10"/>
    </g>
    <g class="forbiddenX" transform="translate(565 405)">
      <path d="M-10 -10 L10 10 M10 -10 L-10 10"/>
    </g>
    <text x="196" y="432" class="warnLabel">✕ WRONG — SHALLOW ANGLE</text>
    <text x="505" y="432" class="warnLabel">✕ WRONG — SHALLOW ANGLE</text>
  `;

  if(mode==='layout'){
    vessels=topTraffic(355)+botTraffic(585);
    notes=`<text x="125" y="125" class="guideLabel">APPROPRIATE LANE • FOLLOW ITS ARROW</text>
           <text x="125" y="385" class="guideLabel">OPPOSING TRAFFIC IS SEPARATED</text>`;
    caption='READ THE TWO TRAFFIC LANES, THEIR ARROWS, AND THE CENTRAL SEPARATION ZONE';
  }

  if(mode==='follow'){
    const x=150+560*p;
    vessels=ttShip(x,155,90,'WATCH ONE')+botTraffic(690-260*p);
    tracks=`<path d="M130 155 H${x}" class="trackGood"/>`;
    notes=`<text x="145" y="126" class="ruleLabel">WATCH ONE FOLLOWS EASTBOUND FLOW →</text>`;
    caption='USE THE APPROPRIATE LANE • PROCEED IN ITS GENERAL DIRECTION • KEEP CLEAR OF THE SEPARATION ZONE';
  }

  if(mode==='cross'){
    const y=455-390*p,x=450;
    const eastX=110+225*p;
    const westX=790-215*p;
    vessels=ttShip(x,y,0,'WATCH ONE')+topTraffic(eastX)+botTraffic(westX);
    tracks=crossingGeometry()+`<path d="M450 455 L450 ${y}" class="trackGood"/>`;
    notes=`<text x="620" y="112" class="ruleLabel">MEASURE THE 90° FROM THE TRAFFIC FLOW</text>`;
    caption='RULE 10(c): KEEP THE BOW ON THE 90° CROSSING AXIS • RED DIAGONALS ARE WRONG • SAFE GAP SHOWN';
  }

  if(mode==='join'){
    const x=105+500*p,y=155;
    vessels=ttShip(x,y,90,'WATCH ONE')+botTraffic(705-190*p);
    tracks=`<path d="M85 155 H${x}" class="trackGood"/>
            <path d="M245 215 Q350 176 470 155" class="trackInfo"/>`;
    notes=`<line x1="${xL}" y1="${topY1}" x2="${xL}" y2="${topY2}" class="termination"/>
           <text x="118" y="118" class="ruleLabel">LANE TERMINATION • NORMAL ENTRY / EXIT</text>
           <text x="260" y="219" class="guideLabel">SIDE ENTRY / EXIT: SMALL ANGLE TO TRAFFIC FLOW</text>`;
    caption='CROSSING ≈ 90° TO FLOW • JOINING / LEAVING FROM SIDE = SMALL ANGLE TO FLOW';
  }

  if(mode==='zone'){
    vessels=ttShip(455,425,0,'WATCH ONE')+topTraffic(350)+botTraffic(620);
    tracks=`<path d="M455 440 Q418 426 390 410" class="trackGood"/>`;
    notes=`<text x="500" y="418" class="warnLabel">NORMAL TRANSIT REMAINS OUTSIDE THE ZONE</text>
           <path d="M485 408 L455 398" stroke="#9a3030" stroke-width="2"/>`;
    caption='RULE 10(e): THE CENTRAL SEPARATION ZONE IS NOT CONVENIENT SPARE SEA ROOM';
  }

  if(mode==='itz'){
    const x=170+250*p;
    vessels=ttShip(x,455,90,'PERMITTED ITZ USER','#146e78')+topTraffic(455)+botTraffic(660);
    notes=`<rect x="${xL}" y="420" width="${xR-xL}" height="60" fill="#e3c671" opacity=".42"/>
           <text x="125" y="444" class="guideLabel">INSHORE TRAFFIC ZONE</text>
           <text x="125" y="462" class="guideLabel">OUTSIDE THE ADJACENT TRAFFIC LANE • RULE 10(d)</text>`;
    caption='ITZ USE IS SPECIFICALLY CONTROLLED • TRAFFIC INSIDE AN ITZ MAY BE ENCOUNTERED IN ANY DIRECTION';
  }

  if(mode==='impede'){
    const laneX=115+430*p;
    let crossP=Math.max(0,(p-.58)/.42);
    crossP=Math.min(1,crossP);
    const sy=455-390*crossP;
    vessels=topTraffic(laneX,'POWER-DRIVEN LANE SHIP')+
            botTraffic(790-170*p,'POWER-DRIVEN LANE SHIP')+
            ttShip(450,sy,0,'UNDER-20 m CROSSER','#146e78');
    tracks=crossingGeometry()+`<path d="M450 455 L450 ${sy}" class="trackGood"/>`;
    notes=`<text x="620" y="112" class="ruleLabel">WAIT CLEAR • THEN CROSS 90° TO FLOW</text>`;
    caption=crossP===0
      ?'UNDER 20 m: REMAIN OUTSIDE UNTIL A SAFE GAP DEVELOPS'
      :'SAFE GAP ESTABLISHED • CROSS ON THE 90° AXIS • DO NOT IMPEDE LANE TRAFFIC';
  }

  if(mode==='avoid'){
    const y=455-250*p;
    vessels=ttShip(55,y,0,'NOT USING TSS','#146e78')+topTraffic(430)+botTraffic(625);
    tracks=`<path d="M55 470 V${y}" class="trackGood"/>`;
    notes=`<text x="18" y="105" class="ruleLabel">KEEP A WIDE PRACTICABLE MARGIN</text>`;
    caption='RULE 10(h): IF NOT USING THE SCHEME, AVOID IT BY AS WIDE A MARGIN AS PRACTICABLE';
  }

  if(mode==='final'){
    let y=455;
    if(p>=.28 && p<.90){
      const cp=(p-.28)/.62;
      y=455-410*cp;
    }else if(p>=.90){
      y=45-75*((p-.90)/.10);
    }

    const eastX=105+240*p;
    const westX=795-205*p;

    vessels=ttShip(450,y,0,'WATCH ONE')+
            topTraffic(eastX,'EASTBOUND TRAFFIC')+
            botTraffic(westX,'WESTBOUND TRAFFIC');
    tracks=crossingGeometry()+`<path d="M450 455 L450 ${Math.max(y,25)}" class="trackGood"/>`;
    notes=`<text x="620" y="112" class="ruleLabel">HOLD THE PERPENDICULAR HEADING</text>`;
    caption=p<.28
      ?'UNDER 20 m • WAIT CLEAR • DO NOT IMPEDE • DO NOT COMMIT YET'
      :p<.90
        ?'COMMITTED • HOLD THE 90° CROSSING HEADING • CROSS CONTINUOUSLY • KEEP WATCH'
        :'FAR LANE CLEARED • TSS CROSSING COMPLETE';
  }

  $('ttDemo').innerHTML=`<svg viewBox="0 0 900 520">
    <rect width="900" height="520" fill="#eee4cc"/>
    <g stroke="#c8bfa9" opacity=".8">
      <path d="M0 80H900M0 160H900M0 240H900M0 320H900M0 400H900M0 480H900"/>
      <path d="M100 0V520M200 0V520M300 0V520M400 0V520M500 0V520M600 0V520M700 0V520M800 0V520"/>
    </g>

    <rect x="${xL}" y="${topY1}" width="${xR-xL}" height="${topY2-topY1}" fill="#d8c9aa" opacity=".46"/>
    <line x1="${xL}" y1="${topY1}" x2="${xR}" y2="${topY1}" class="laneBoundary"/>
    <line x1="${xL}" y1="${topY2}" x2="${xR}" y2="${topY2}" class="laneBoundary"/>

    <rect x="${xL}" y="${sepY1}" width="${xR-xL}" height="${sepY2-sepY1}" fill="#d99999" opacity=".34"/>
    <line x1="${xL}" y1="${sepY1}" x2="${xR}" y2="${sepY1}" class="sepBoundary"/>
    <line x1="${xL}" y1="${sepY2}" x2="${xR}" y2="${sepY2}" class="sepBoundary"/>

    <rect x="${xL}" y="${botY1}" width="${xR-xL}" height="${botY2-botY1}" fill="#d8c9aa" opacity=".46"/>
    <line x1="${xL}" y1="${botY1}" x2="${xR}" y2="${botY1}" class="laneBoundary"/>
    <line x1="${xL}" y1="${botY2}" x2="${xR}" y2="${botY2}" class="laneBoundary"/>

    <text x="135" y="188" class="laneLabel">EASTBOUND TRAFFIC →</text>
    <text x="610" y="328" class="laneLabel">← WESTBOUND TRAFFIC</text>
    <text x="378" y="255" class="zoneLabel">SEPARATION ZONE</text>

    ${tracks}${notes}${vessels}

    <rect x="18" y="474" width="864" height="30" rx="7" fill="#062431e8"/>
    <text x="450" y="494" text-anchor="middle" font-size="10" fill="#eafaff" font-weight="900">${caption}</text>
  </svg>`;
}

function renderTSS(){
 if($('tssBaseDiagram'))$('tssBaseDiagram').innerHTML=tssSVG('base');
 if($('tssCorrectDiagram'))$('tssCorrectDiagram').innerHTML=tssSVG('correct');
 if($('tssWrongDiagram'))$('tssWrongDiagram').innerHTML=tssSVG('wrong');
 if($('tssJoinDiagram'))$('tssJoinDiagram').innerHTML=tssSVG('join');
 if($('tssSimDisplay') && !tssSimOwn)tssSimReset();
 if($('tssEcdisExample')) setTSSGeometry('textbook');
 if($('tssRuleGrid'))$('tssRuleGrid').innerHTML=TSS_RULES.map(r=>`<div class="tssCard"><h4>${r[0]}</h4><p>${r[1]}</p><span class="ruleFlag">Rule ${r[2]}</span></div>`).join('');
}
const TSS_EXAM_BANK=window.PW_ORIGINAL_LIBRARIES.TSS_EXAM_BANK;

let tssExamSet=[],tssExamAnswers=[],tssExamIndex=0,tssExamSubmitted=false;

function showTSSExam(){
 document.querySelectorAll('.appPage.active,.screen.active').forEach(p=>p.classList.remove('active'));
 updateHeaderNav('tss');updateModuleContext('tss');
 $('tssExamPage').classList.add('active');
 renderTSSPracticalDeck();
 window.scrollTo({top:0,behavior:'smooth'});
}
function txShuffle(a){let x=[...a];for(let i=x.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
function startTSSFullExam(){
 adaptTSSExamForProfile();
 tssExamSet=txShuffle(TSS_EXAM_BANK);
 tssExamAnswers=new Array(tssExamSet.length).fill(null);
 tssExamIndex=0;tssExamSubmitted=false;renderTSSExamQuestion();
}
function txVisualHTML(q,review=false){
 if(!q.visual)return `<div class="txKnowledgeOnly"><div><b>RULE 10 KNOWLEDGE</b><span>Apply the under-20-metre TSS principles taught in Project Watch. No diagram is required for this question.</span></div></div>`;
 return `<div class="${review?'txReviewVisual':'txVisual'}">${tssEcdisSVG(false,q.visual)}</div>${review?'':`<div class="txVisualHead"><span>RULE 10 GEOMETRY</span><span>${q.visual.toUpperCase()}</span></div>`}`;
}
function renderTSSExamQuestion(){
 if(!tssExamSet.length)return;
 const q=tssExamSet[tssExamIndex],ans=tssExamAnswers[tssExamIndex];
 $('txProgress').textContent=`Question ${tssExamIndex+1} of ${tssExamSet.length} • ${tssExamAnswers.filter(x=>x!==null).length} answered`;
 $('txQuestionArea').innerHTML=`<div class="txLayout">
   <div class="txVisualCard">${txVisualHTML(q)}</div>
   <div class="txQuestionCard">
    <div class="examQTop"><span class="tag">${q.cat} • ${q.rule}</span>${q.critical?'<span class="tag critical">SAFETY-CRITICAL</span>':''}</div>
    <div class="txRulePrompt">Training vessel: Watch One • 14.2 m • power-driven. Apply Rule 10 together with the other applicable COLREGs.</div>
    <div class="examQuestion">${q.q}</div>
    <div class="examChoices">${q.a.map((a,i)=>`<button class="${ans===i?'selected':''}" onclick="answerTSSExam(${i})"><b>${String.fromCharCode(65+i)}.</b> ${a}</button>`).join('')}</div>
    <div class="examNav" style="margin-top:auto"><button onclick="tssExamPrev()">← PREVIOUS</button><button onclick="tssExamNext()">NEXT →</button><button class="submit" onclick="submitTSSFullExam()">SUBMIT EXAM</button></div>
   </div></div>`;
}
function answerTSSExam(i){if(tssExamSubmitted)return;tssExamAnswers[tssExamIndex]=i;renderTSSExamQuestion()}
function tssExamPrev(){if(tssExamIndex>0){tssExamIndex--;renderTSSExamQuestion()}}
function tssExamNext(){if(tssExamIndex<tssExamSet.length-1){tssExamIndex++;renderTSSExamQuestion()}}
function submitTSSFullExam(){
 if(!tssExamSet.length||tssExamSubmitted)return;
 const unanswered=tssExamAnswers.filter(x=>x===null).length;
 if(unanswered&&!confirm(`${unanswered} question(s) are unanswered. Submit anyway?`))return;
 tssExamSubmitted=true;
 const correct=tssExamSet.filter((q,i)=>tssExamAnswers[i]===q.correct).length;
 const pct=Math.round(correct/tssExamSet.length*100);
 const criticalWrong=tssExamSet.filter((q,i)=>q.critical&&tssExamAnswers[i]!==q.correct);
 const pass=pct>=90&&criticalWrong.length===0;
 courseRecordScore('tss',pct,pass);
 $('txProgress').textContent=`Complete • ${correct}/${tssExamSet.length} • ${pct}%`;
 $('txQuestionArea').innerHTML=`<div class="txResultsSummary ${pass?'pass':'fail'}">
   <div><div class="ver">PROJECT WATCH TSS MOCK</div><h2>${pass?'PASS':'NOT YET PASSED'}</h2>
   <p class="note">${pass?'Rule 10 mock standard achieved with no safety-critical error.':'Review the debrief below, revisit the relevant lessons, then sit a new mock.'}</p></div>
   <div class="txScore">${pct}%</div></div>
   <div class="examStandardNote"><b>Project Watch standard:</b> 90% overall plus no designated safety-critical Rule 10 error. This is an independent training benchmark, not an MCA/RYA certificate.</div>
   ${criticalWrong.length?`<div class="examStandardNote"><b>Safety-critical errors:</b> ${criticalWrong.length}. One or more important crossing, non-impeding or traffic-management decisions were wrong or unanswered.</div>`:''}
   <div class="examResultGrid">${tssExamSet.map((q,i)=>txReviewHTML(q,tssExamAnswers[i],i)).join('')}</div>
   <div class="examNav"><button onclick="startTSSFullExam()">NEW FULL MOCK</button><button onclick="showTSSTutorial()">REVIEW BEGINNER COURSE</button><button onclick="showModule('tss')">RETURN TO TSS</button></div>`;
}
function txReviewHTML(q,user,i){
 const ok=user===q.correct,userText=user===null?'No answer':q.a[user];
 return `<div class="examReview ${ok?'ok':'bad'}"><b>${i+1}. ${q.cat} • ${q.rule} ${q.critical?'• SAFETY-CRITICAL':''}</b>${q.visual?txVisualHTML(q,true):''}<p>${q.q}</p><p>Your answer: <span class="answerKey">${userText}</span></p><p>Correct answer: <span class="answerKey">${q.a[q.correct]}</span></p><p class="why">${q.why}</p></div>`;
}

const TSS_PRACTICAL_EXAM=window.PW_ORIGINAL_LIBRARIES.TSS_PRACTICAL_EXAM;
function renderTSSPracticalDeck(){
 const d=$('tssPracticalExamDeck');if(!d)return;
 d.innerHTML=TSS_PRACTICAL_EXAM.map(([id,title,desc],i)=>`<div class="tssPracticalCard"><div class="ver">PRACTICAL ${String(i+1).padStart(2,'0')}</div><h4>${title}</h4><p>${desc}</p><button onclick="launchTSSPracticalExam('${id}')">LAUNCH LIVE ASSESSMENT →</button></div>`).join('');
}
function launchTSSPracticalExam(id){
 showModule('tss');
 showTSS('live');
 tssSimSelect(id);
 window.scrollTo({top:$('tssLive')?.offsetTop||0,behavior:'smooth'});
}

const TSS_QUESTIONS=window.PW_ORIGINAL_LIBRARIES.TSS_QUESTIONS;
let tssCurrent=null,tssQi=-1;
function nextTSSQuestion(){tssQi=(tssQi+1)%TSS_QUESTIONS.length;tssCurrent=TSS_QUESTIONS[tssQi];$('tssQ').textContent=tssCurrent.q;$('tssQDiagram').innerHTML=tssSVG(tssCurrent.mode);$('tssAnswers').innerHTML=tssCurrent.a.map((x,i)=>`<button onclick="answerTSS(${i})">${x}</button>`).join('');$('tssResult').textContent='';$('tssResult').className='quizResult'}
function answerTSS(i){const ok=i===tssCurrent.ok;$('tssResult').textContent=ok?'✓ '+tssCurrent.why:'✗ Try again — '+tssCurrent.why;$('tssResult').className='quizResult '+(ok?'ok':'warn')}

const TSS_SIM_SCENARIOS=window.PW_ORIGINAL_LIBRARIES.TSS_SIM_SCENARIOS;
let tssSimScenario='basic', tssSimRunning=false, tssSimLast=0, tssSimRAF=0;
let tssSimOwn=null,tssSimTargets=[],tssSimElapsed=0,tssSimTrack=[],tssSimMinCPA=99,tssSimMinSep=99,tssSimMaxAngleErr=0,tssSimStoppedInLane=false,tssSimFinished=false;

function tssSimSelect(id){
 tssSimScenario=id;
 ['basic','dense','tide','late'].forEach(x=>{const b=$('tssSc'+x[0].toUpperCase()+x.slice(1));if(b)b.classList.toggle('active',x===id)});
 tssSimReset();
}
function tssSimReset(){
 if(tssSimRAF)cancelAnimationFrame(tssSimRAF);
 tssSimRunning=false;tssSimLast=0;tssSimElapsed=0;tssSimMinCPA=99;tssSimMinSep=99;tssSimMaxAngleErr=0;tssSimStoppedInLane=false;tssSimFinished=false;
 const sc=TSS_SIM_SCENARIOS[tssSimScenario];
 tssSimOwn={x:0,y:-2.25,h:0,s:7};
 tssSimTargets=sc.targets.map((a,i)=>({x:a[0],y:a[1],h:a[2],s:a[3],name:a[4],id:i}));
 tssSimTrack=[[tssSimOwn.x,tssSimOwn.y]];
 if($('tssStartBtn'))$('tssStartBtn').textContent='▶ COMMIT / START';
 if($('tssScore')){$('tssScore').classList.remove('show');$('tssScore').innerHTML=''}
 tssSimUpdateUI();tssSimDraw();
 tssSimCoach('Select a safe gap and commit to the crossing. Heading should remain as nearly as practicable at right angles to traffic flow.','');
}
function tssSimToggle(){
 if(tssSimFinished){tssSimReset();return}
 tssSimRunning=!tssSimRunning;
 if($('tssStartBtn'))$('tssStartBtn').textContent=tssSimRunning?'Ⅱ PAUSE':'▶ RESUME';
 if(tssSimRunning){tssSimLast=performance.now();tssSimRAF=requestAnimationFrame(tssSimFrame)}
}
function tssSimAlter(delta){
 if(!tssSimOwn)return;
 tssSimOwn.h=(tssSimOwn.h+delta+360)%360;
 tssSimUpdateUI();tssSimDraw();
}
function tssSimSetHdg(h){if(tssSimOwn){tssSimOwn.h=(h+360)%360;tssSimUpdateUI();tssSimDraw()}}
function tssSimSpeed(d){if(tssSimOwn){tssSimOwn.s=Math.max(0,Math.min(12,tssSimOwn.s+d));tssSimUpdateUI()}}
function tssVec(h,s){let r=h*Math.PI/180;return{x:Math.sin(r)*s,y:Math.cos(r)*s}}
function tssWrapX(x){if(x>3.2)return x-6.4;if(x<-3.2)return x+6.4;return x}
function tssSimFrame(ts){
 if(!tssSimRunning)return;
 let real=(ts-tssSimLast)/1000;tssSimLast=ts;
 let dt=Math.min(real,0.08)*8; // 8x training speed
 tssSimStep(dt);tssSimDraw();tssSimUpdateUI();
 if(tssSimRunning)tssSimRAF=requestAnimationFrame(tssSimFrame);
}
function tssSimStep(dt){
 const sc=TSS_SIM_SCENARIOS[tssSimScenario];
 const vo=tssVec(tssSimOwn.h,tssSimOwn.s);
 tssSimOwn.x+=(vo.x+sc.tideX)*dt/3600;
 tssSimOwn.y+=(vo.y+sc.tideY)*dt/3600;

 let lastTrack=tssSimTrack[tssSimTrack.length-1];
 if(!lastTrack || Math.hypot(tssSimOwn.x-lastTrack[0],tssSimOwn.y-lastTrack[1])>=0.008){
   tssSimTrack.push([tssSimOwn.x,tssSimOwn.y]);
 }
 tssSimTargets.forEach(t=>{let v=tssVec(t.h,t.s);t.x=tssWrapX(t.x+v.x*dt/3600);t.y+=v.y*dt/3600});
 tssSimElapsed+=dt;

 let err=Math.min(Math.abs(((tssSimOwn.h+180)%360)-180),Math.abs((((tssSimOwn.h-180)+180)%360)-180));
 err=Math.min(err,180-err); tssSimMaxAngleErr=Math.max(tssSimMaxAngleErr,err);
 const insideScheme=tssSimOwn.y>-1.35&&tssSimOwn.y<1.35;
 if(insideScheme&&tssSimOwn.s<0.5)tssSimStoppedInLane=true;

 let closest=99;
 tssSimTargets.forEach(t=>{
   let dx=t.x-tssSimOwn.x,dy=t.y-tssSimOwn.y,sep=Math.hypot(dx,dy);closest=Math.min(closest,sep);tssSimMinSep=Math.min(tssSimMinSep,sep);
   let a=tssVec(tssSimOwn.h,tssSimOwn.s),b=tssVec(t.h,t.s),rv={x:b.x-a.x,y:b.y-a.y};
   let vv=rv.x*rv.x+rv.y*rv.y;
   if(vv>0){
     let tcpa=-(dx*rv.x+dy*rv.y)/vv;
     if(tcpa>0){let cx=dx+rv.x*tcpa,cy=dy+rv.y*tcpa;tssSimMinCPA=Math.min(tssSimMinCPA,Math.hypot(cx,cy))}
   }
 });
 if(closest<0.08){tssSimCoach('COLLISION / EXTREMELY CLOSE PASS — crossing terminated.','warn');tssSimEnd(false);return}
 if(closest<0.25)tssSimCoach('WARNING — very close traffic. Apply the steering and sailing rules as well as Rule 10.','warn');
 else if(err>15)tssSimCoach('RULE 10 GEOMETRY — heading has moved well away from the right-angle crossing heading.','warn');
 else if(insideScheme)tssSimCoach('Crossing in progress — maintain a clear Rule 10 heading while monitoring all targets.','ok');
 else tssSimCoach('Approaching the scheme — assess the gap before entering.','');

 if(tssSimOwn.y>1.35){
   tssSimCoach('TSS crossing complete — ending watch and calculating score.','ok');
   tssSimEnd(false);
   return;
 }
}
function tssSimCoach(msg,cls){const e=$('tssCoach');if(!e)return;e.textContent=msg;e.className='tssCoach '+(cls||'')}
function tssSimCog(){
 const sc=TSS_SIM_SCENARIOS[tssSimScenario],v=tssVec(tssSimOwn.h,tssSimOwn.s);
 let x=v.x+sc.tideX,y=v.y+sc.tideY;
 return (Math.atan2(x,y)*180/Math.PI+360)%360;
}
function tssSimCrossAngle(){
 let h=((tssSimOwn.h%180)+180)%180;
 return Math.abs(90-h);
}
function tssSimUpdateUI(){
 if(!tssSimOwn)return;
 let cog=tssSimCog(),angle=tssSimCrossAngle();
 if($('tssSimHdg'))$('tssSimHdg').textContent=String(Math.round(tssSimOwn.h)).padStart(3,'0')+'°';
 if($('tssSimCog'))$('tssSimCog').textContent=String(Math.round(cog)).padStart(3,'0')+'°';
 if($('tssSimSpd'))$('tssSimSpd').textContent=tssSimOwn.s.toFixed(1)+' kn';
 if($('tssSimAngle'))$('tssSimAngle').textContent=Math.round(angle)+'°';
 if($('tssSimCPA'))$('tssSimCPA').textContent=tssSimMinCPA<90?tssSimMinCPA.toFixed(2)+' NM':'--';
 if($('tssSimStatus'))$('tssSimStatus').textContent=tssSimFinished?'COMPLETE':tssSimRunning?'RUNNING':'READY';
}
function tssMapPt(x,y){
 let sx=450+x*120, sy=260-y*105;
 let a=-8*Math.PI/180,cx=450,cy=260;
 let dx=sx-cx,dy=sy-cy;
 return [cx+dx*Math.cos(a)-dy*Math.sin(a),cy+dx*Math.sin(a)+dy*Math.cos(a)];
}
function tssSimDraw(){
 const box=$('tssSimDisplay');if(!box||!tssSimOwn)return;
 const lane=(y1,y2)=>{let a=tssMapPt(-3,y1),b=tssMapPt(3,y1),c=tssMapPt(-3,y2),d=tssMapPt(3,y2);return `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]} M${c[0]} ${c[1]} L${d[0]} ${d[1]}" stroke="#9f5353" stroke-width="3"/>`};
 let track=tssSimTrack.map((p,i)=>{let q=tssMapPt(p[0],p[1]);return (i?'L':'M')+q[0]+' '+q[1]}).join(' ');

 let targetSvg=tssSimTargets.map(t=>{let p=tssMapPt(t.x,t.y),v=tssVec(t.h,.65),q=tssMapPt(t.x+v.x,t.y+v.y);return `<g><polygon points="${p[0]},${p[1]-9} ${p[0]+8},${p[1]+8} ${p[0]-8},${p[1]+8}" fill="#77b8a5" stroke="#2e554b" stroke-width="2"/><line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="#9b4f4f" stroke-width="2"/><text x="${p[0]+10}" y="${p[1]-10}" font-size="9" fill="#25414f" font-weight="700">${t.name}</text></g>`}).join('');
 let o=tssMapPt(tssSimOwn.x,tssSimOwn.y);
 box.innerHTML=`<svg viewBox="0 0 900 520"><rect width="900" height="520" fill="#eee4cc"/>
 <g stroke="#c8bfa9" stroke-width="1"><path d="M0 80H900 M0 160H900 M0 240H900 M0 320H900 M0 400H900 M0 480H900"/><path d="M100 0V520 M200 0V520 M300 0V520 M400 0V520 M500 0V520 M600 0V520 M700 0V520 M800 0V520"/></g>
 ${lane(.45,1.25)}${lane(-1.25,-.45)}
 <g stroke="#bd7373" stroke-width="2" stroke-dasharray="10 8">${(()=>{let a=tssMapPt(-3,-.25),b=tssMapPt(3,-.25),c=tssMapPt(-3,.25),d=tssMapPt(3,.25);return `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]} M${c[0]} ${c[1]}L${d[0]} ${d[1]}"/>`})()}</g>
 <text x="130" y="150" fill="#8d5151" font-size="13" font-weight="800">TRAFFIC FLOW →</text><text x="620" y="390" fill="#8d5151" font-size="13" font-weight="800">← TRAFFIC FLOW</text>
 <path d="${track}" fill="none" stroke="#0b8f62" stroke-width="6" stroke-dasharray="12 8" stroke-linecap="round" stroke-linejoin="round"/>
 ${targetSvg}
 <g transform="translate(${o[0]} ${o[1]}) rotate(${tssSimOwn.h+8})"><path d="M0,-25 L13,19 L0,28 L-13,19 Z" fill="#9b2f2f" stroke="#5a1515" stroke-width="2"/><line x1="0" y1="-25" x2="0" y2="-78" stroke="#9b2f2f" stroke-width="3"/></g>
 </svg>`;
}
function tssSimEnd(manual=false){
 if(tssSimFinished)return;
 tssSimRunning=false;tssSimFinished=true;if(tssSimRAF)cancelAnimationFrame(tssSimRAF);
 if(tssSimOwn){
   let lp=tssSimTrack[tssSimTrack.length-1];
   if(!lp || Math.hypot(tssSimOwn.x-lp[0],tssSimOwn.y-lp[1])>0.001) tssSimTrack.push([tssSimOwn.x,tssSimOwn.y]);
 }
 tssSimDraw();
 let completed=tssSimOwn&&tssSimOwn.y>=1.35;
 let score=5,reasons=[];
 if(!completed){score-=1;reasons.push('crossing not completed')}
 if(tssSimMaxAngleErr>10){score-=1;reasons.push('heading deviated from right-angle geometry')}
 if(tssSimMaxAngleErr>25){score-=1;reasons.push('large crossing-angle error')}
 if(tssSimStoppedInLane){score-=1;reasons.push('stopped within the traffic lane')}
 if(tssSimMinSep<.25){score-=1;reasons.push('very close passing distance')}
 if(tssSimMinSep<.08)score=1;
 score=Math.max(1,Math.min(5,score));
 let box=$('tssScore');if(box){box.classList.add('show');box.innerHTML=`<div class="ver">TSS WATCH DEBRIEF</div><strong>${score} / 5</strong><p>${score===5?'Excellent Rule 10 crossing with safe traffic management.':reasons.length?reasons.join(' • '):'Crossing completed.'}</p><p class="note">Minimum separation: ${tssSimMinSep<90?tssSimMinSep.toFixed(2)+' NM':'--'} • Maximum heading error: ${Math.round(tssSimMaxAngleErr)}°</p><p class="note">Your complete crossing trail remains plotted above for debrief.</p>`}
 if($('tssStartBtn'))$('tssStartBtn').textContent='↻ START AGAIN';
 tssSimUpdateUI();
}

const RULE_DATA=window.PW_ORIGINAL_LIBRARIES.RULE_DATA;

const COLREG_IMAGE_LIBRARY=window.PW_ORIGINAL_LIBRARIES.COLREG_IMAGE_LIBRARY;
const COLREG_RULE_PHOTOS=window.PW_ORIGINAL_LIBRARIES.COLREG_RULE_PHOTOS;
const COLREG_IMAGE_CACHE_VERSION='pw-colreg-img-v1';

function commonsThumb(file,width=640){
 return 'https://commons.wikimedia.org/wiki/Special:Redirect/file/'+encodeURIComponent(file)+'?width='+width;
}
function licensedImageSrc(key){
 const a=COLREG_IMAGE_LIBRARY[key]; if(!a)return '';
 try{
   const hit=localStorage.getItem(COLREG_IMAGE_CACHE_VERSION+':'+key);
   if(hit)return hit;
 }catch(e){}
 return commonsThumb(a.file,640);
}
function cacheLicensedImage(key){
 const a=COLREG_IMAGE_LIBRARY[key]; if(!a)return Promise.resolve(false);
 try{if(localStorage.getItem(COLREG_IMAGE_CACHE_VERSION+':'+key))return Promise.resolve(true)}catch(e){}
 return fetch(commonsThumb(a.file,640),{mode:'cors',cache:'force-cache'})
  .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.blob()})
  .then(blob=>new Promise((resolve,reject)=>{
    const fr=new FileReader();
    fr.onload=()=>{try{localStorage.setItem(COLREG_IMAGE_CACHE_VERSION+':'+key,fr.result);resolve(true)}catch(e){resolve(false)}};
    fr.onerror=reject;fr.readAsDataURL(blob);
  })).catch(()=>false);
}
function cacheColregLibrary(){
 const keys=[...new Set(Object.values(COLREG_RULE_PHOTOS).map(x=>x[0]))];
 let i=0;
 const next=()=>{if(i>=keys.length)return;cacheLicensedImage(keys[i++]).finally(()=>setTimeout(next,120));};
 setTimeout(next,800);
}
function rulePhotoFallback(img,key,label){
 img.style.display='none';
 const v=img.parentElement;
 if(!v)return;
 let f=v.querySelector('.rulePhotoFallback');
 if(!f){
   f=document.createElement('div');f.className='rulePhotoFallback';
   f.innerHTML='<span>LICENSED IMAGE</span><b>'+label+'</b>';
   v.insertBefore(f,v.firstChild);
 }
}
const PW_COLREG_RULE_ART=window.PW_ORIGINAL_LIBRARIES.PW_COLREG_RULE_ART;
function enhanceColregRuleVisuals(){
 document.querySelectorAll('#ruleList .ruleRow').forEach(row=>{
   if(row.dataset.visualised==='1')return;
   const n=Number(row.dataset.rule), b=row.querySelector('b'), s=row.querySelector('small');
   if(!b||!s)return;
   const spec=COLREG_RULE_PHOTOS[n]||['cargo','COLREG'];
   const key=spec[0]; const part=row.dataset.part||''; const fallbackArt=part==='Part A'?getComputedStyle(document.documentElement).getPropertyValue('--cr-a').trim().slice(5,-2):part==='Part B'?getComputedStyle(document.documentElement).getPropertyValue('--cr-b').trim().slice(5,-2):part==='Part C'?getComputedStyle(document.documentElement).getPropertyValue('--cr-c').trim().slice(5,-2):part==='Part D'?getComputedStyle(document.documentElement).getPropertyValue('--cr-d').trim().slice(5,-2):getComputedStyle(document.documentElement).getPropertyValue('--cr-ef').trim().slice(5,-2); const src=PW_COLREG_RULE_ART[String(n)]||fallbackArt;

   const textWrap=document.createElement('div');
   textWrap.className='ruleText';textWrap.appendChild(b);textWrap.appendChild(s);

   const visual=document.createElement('div');
   visual.className='ruleVisual';visual.setAttribute('aria-hidden','true');
   const img=document.createElement('img');img.className='rulePhoto';img.alt='';img.loading='lazy';img.src=src;
   img.onerror=()=>rulePhotoFallback(img,key,spec[1]);
   visual.appendChild(img);
   const sh=document.createElement('span');sh.className='rulePhotoShade';visual.appendChild(sh);
   const rn=document.createElement('span');rn.className='rvNum';rn.textContent='R'+n;visual.appendChild(rn);
   const rt=document.createElement('span');rt.className='rvTag';rt.textContent=spec[1];visual.appendChild(rt);

   const arrow=document.createElement('div');arrow.className='ruleArrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='›';
   row.appendChild(visual);row.appendChild(textWrap);row.appendChild(arrow);row.dataset.visualised='1';
 });

}
function openImageCredits(){
 const sheet=$('imageCreditSheet'), body=$('imageCreditBody');if(!sheet||!body)return;
 const rows=Object.entries(COLREG_IMAGE_LIBRARY).map(([k,a])=>`<div class="creditRow"><div><b>${a.title}</b><small>${a.use}</small></div><div><span>${a.creator}</span><span>${a.license}</span><a href="${a.source}" target="_blank" rel="noopener">SOURCE</a></div></div>`).join('');
 body.innerHTML=rows;
 sheet.classList.add('open');
}
function closeImageCredits(){const s=$('imageCreditSheet');if(s)s.classList.remove('open')}

const ANNEX_DATA=window.PW_ORIGINAL_LIBRARIES.ANNEX_DATA;

function openAnnex(n){
 const a=ANNEX_DATA[n];if(!a)return;
 $('detailTitle').textContent=a.title;
 $('detailSummary').textContent=a.summary;
 $('detailTraining').textContent=a.training;
 $('detailProject').textContent=a.project;
 $('detailSource').textContent=a.source;
 const acts=$('detailActions');
 if(acts){
   acts.style.display='flex';
   acts.innerHTML=a.actions.map(x=>`<button onclick="annexGo('${x[1]}')">${x[0]} →</button>`).join('');
 }
 $('detailSheet').classList.add('open');
}
function annexGo(target){
 closeDetail();
 if(target==='distress'){
   showModule('signals');
   setTimeout(()=>showSignalSection('distress'),0);
 }else{
   showModule(target);
 }
}

function openRule(n){
 const r=RULE_DATA[String(n)];if(!r)return;
 if($('detailActions')){$('detailActions').style.display='none';$('detailActions').innerHTML='';}
 $('detailTitle').textContent='Rule '+n+' • '+r.title;
 $('detailSummary').textContent=r.summary;
 $('detailTraining').textContent=r.training;
 $('detailProject').textContent=r.project;
 $('detailSource').textContent='Source map: COLREGS Rule '+n+' • MCA / IMO structure';
 $('detailSheet').classList.add('open');
}
function closeDetail(){$('detailSheet').classList.remove('open')}
function openModule(title,summary,training){
 if($('detailActions')){$('detailActions').style.display='none';$('detailActions').innerHTML='';}
 $('detailTitle').textContent=title;
 $('detailSummary').textContent=summary;
 $('detailTraining').textContent=training;
 $('detailProject').textContent='This module is part of the Project Watch training architecture and will be connected to scenario-based assessment.';
 $('detailSource').textContent='Project Watch module';
 $('detailSheet').classList.add('open');
}

const COLLISION_TUTORIAL_LESSONS=window.PW_ORIGINAL_LIBRARIES.COLLISION_TUTORIAL_LESSONS;
let tutorialLessonIndex=0,tutorialActive=false,tutorialStepIndex=0,tutorialCompleted=new Set();

function tutorialVisualHTML(lesson){
 return `<div class="tutorialMiniRadar"><div class="tutorialMiniOwn"></div><div class="tutorialMiniTarget"></div><span class="tutorialMiniLabel own">OWN VESSEL</span><span class="tutorialMiniLabel target">TARGET</span><div class="tutorialVisualCopy"><b>${lesson.title}</b><br>${lesson.summary}</div></div>`;
}
function renderCollisionTutorial(){
 const lesson=COLLISION_TUTORIAL_LESSONS[tutorialLessonIndex];
 $('tutorialLessonList').innerHTML=COLLISION_TUTORIAL_LESSONS.map((l,i)=>`<button class="tutorialLessonBtn ${i===tutorialLessonIndex?'active':''} ${tutorialCompleted.has(l.id)?'done':''}" onclick="selectTutorialLesson(${i})"><span class="tutorialLessonNum">${String(i+1).padStart(2,'0')}</span><span><b>${l.title}</b><small>${l.sub}</small></span><span class="tutorialLessonCheck">${tutorialCompleted.has(l.id)?'✓':''}</span></button>`).join('');
 $('tutorialLessonNo').textContent='LESSON '+String(tutorialLessonIndex+1).padStart(2,'0');
 $('tutorialLessonTitle').textContent=lesson.title;
 $('tutorialLessonSummary').textContent=lesson.summary;
 $('tutorialLessonVisual').innerHTML=tutorialVisualHTML(lesson);
 $('tutorialLessonPoints').innerHTML=lesson.points.map(p=>`<div class="tutorialPoint"><b>${p[0]}</b><span>${p[1]}</span></div>`).join('');
 $('tutorialLaunchBtn').textContent=lesson.id==='firstwatch'?'START COACHED WATCH →':'START THIS LESSON →';
 const done=tutorialCompleted.size,total=COLLISION_TUTORIAL_LESSONS.length;
 $('tutorialProgressText').textContent=`${done} / ${total} COMPLETE`;
 $('tutorialProgressFill').style.width=(done/total*100)+'%';
}
function showCollisionTutorial(){
 document.querySelectorAll('.appPage.active,.screen.active').forEach(p=>p.classList.remove('active'));
 updateHeaderNav('scenarios');updateModuleContext('scenarios');
 $('collisionTutorialPage').classList.add('active');
 renderCollisionTutorial();window.scrollTo({top:0,behavior:'smooth'});
}
function selectTutorialLesson(i){tutorialLessonIndex=Math.max(0,Math.min(COLLISION_TUTORIAL_LESSONS.length-1,i));renderCollisionTutorial()}
function tutorialPrevLesson(){selectTutorialLesson(tutorialLessonIndex-1)}
function tutorialNextLesson(){selectTutorialLesson(tutorialLessonIndex+1)}

function launchTutorialLesson(){
 const lesson=COLLISION_TUTORIAL_LESSONS[tutorialLessonIndex];
 tutorialActive=true;tutorialStepIndex=0;
 setTrainingMode('guided');
 setOwnVesselMode(lesson.mode||'power');
 scenarioId=lesson.scenario;
 renderScenarioList();
 initScenario();
 go('watch');
 running=false;
 if($('play'))$('play').textContent='▶ PLAY';
 draw();update();
 setTimeout(()=>showTutorialStep(0,true),180);
}
function clearTutorialFocus(){
 document.querySelectorAll('.tutorialFocus').forEach(e=>e.classList.remove('tutorialFocus'));
 document.body.classList.remove('tutorialDimmed');
}
function showTutorialStep(i,speak=true){
 if(!tutorialActive)return;
 const lesson=COLLISION_TUTORIAL_LESSONS[tutorialLessonIndex],steps=lesson.steps;
 tutorialStepIndex=Math.max(0,Math.min(steps.length-1,i));
 clearTutorialFocus();
 const step=steps[tutorialStepIndex],target=$(step[0]);
 if(target){
   target.classList.add('tutorialFocus');
   try{target.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'})}catch(e){}
 }
 $('tutorialCoachLesson').textContent='LESSON '+String(tutorialLessonIndex+1).padStart(2,'0')+' • STEP '+(tutorialStepIndex+1)+' / '+steps.length;
 $('tutorialCoachTitle').textContent=lesson.title;
 $('tutorialCoachText').textContent=step[1];
 $('tutorialCoachProgressFill').style.width=((tutorialStepIndex+1)/steps.length*100)+'%';
 $('tutorialStepNext').textContent=tutorialStepIndex===steps.length-1?'FINISH LESSON ✓':'NEXT →';
 $('tutorialCoach').classList.add('show');
 if(speak)setTimeout(()=>speakMarine(step[1],'instruction'),120);
}
function tutorialStepNext(){
 const lesson=COLLISION_TUTORIAL_LESSONS[tutorialLessonIndex];
 if(tutorialStepIndex<lesson.steps.length-1){showTutorialStep(tutorialStepIndex+1,true);return}
 tutorialCompleted.add(lesson.id);
 clearTutorialFocus();
 $('tutorialCoach').classList.remove('show');
 tutorialActive=false;
 if(lesson.id==='firstwatch'){
   running=true;lastTs=0;requestAnimationFrame(tick);
   speakMarine('Coached watch started. Maintain a proper lookout and assess the developing situation.','confirmation');
 }else{
   running=false;
   showCollisionTutorial();
 }
}
function tutorialStepBack(){if(tutorialStepIndex>0)showTutorialStep(tutorialStepIndex-1,false)}
function tutorialSpeakCurrent(){
 const lesson=COLLISION_TUTORIAL_LESSONS[tutorialLessonIndex];
 if(lesson&&lesson.steps[tutorialStepIndex])speakMarine(lesson.steps[tutorialStepIndex][1],'instruction');
}
function exitTutorialWatch(){
 tutorialActive=false;running=false;clearTutorialFocus();
 if($('tutorialCoach'))$('tutorialCoach').classList.remove('show');
 showCollisionTutorial();
}

const COLREGS_BEGINNER=window.PW_ORIGINAL_LIBRARIES.COLREGS_BEGINNER;
const CR_QUIZ=window.PW_ORIGINAL_LIBRARIES.CR_QUIZ;
const CR_QUIZ_RULE_REFS=window.PW_ORIGINAL_LIBRARIES.CR_QUIZ_RULE_REFS;

let crLesson=0,crLessonsFinished=0,crQuizIndex=0,crQuizScore=0,crQuizAnswered=false;
function showColregsTutorial(){
 document.querySelectorAll('.appPage.active,.screen.active').forEach(p=>p.classList.remove('active'));
 updateHeaderNav('course');$('colregsTutorialPage').classList.add('active');
 const lessonNav=$('crLessonList');
 const lessonCard=document.querySelector('#colregsTutorialPage .stage2LessonCard');
 if(lessonNav)lessonNav.style.display='';
 if(lessonCard)lessonCard.style.display='';
 crLesson=Math.max(0,Math.min(5,crLesson||0));
 crLessonsFinished=Math.max(0,Math.min(6,crLessonsFinished||0));
 renderCrLesson();window.scrollTo({top:0,behavior:'smooth'});
}
function crVisual(l){
 if(!l)return '';
 if(l.visual==='intro')return `<div class="crFlow"><div class="node"><b>COLREGs</b><small>Prevent collisions at sea</small></div><span class="arrow">→</span><div class="node"><b>LOOK • ASSESS</b><small>Understand the situation</small></div><span class="arrow">→</span><div class="node"><b>ACT • CHECK</b><small>Safe seamanship</small></div></div>`;
 if(l.visual==='parts')return `<div class="crPartsVisual"><div class="crPartBlock"><strong>A</strong><b>RULES 1–3</b><span>General</span></div><div class="crPartBlock"><strong>B</strong><b>RULES 4–19</b><span>Steering & Sailing</span></div><div class="crPartBlock"><strong>C</strong><b>RULES 20–31</b><span>Lights & Shapes</span></div><div class="crPartBlock"><strong>D</strong><b>RULES 32–37</b><span>Sound & Light Signals</span></div><div class="crPartBlock"><strong>E</strong><b>RULE 38</b><span>Exemptions</span></div><div class="crPartBlock"><strong>F</strong><b>RULES 39–41</b><span>Convention compliance</span></div></div>`;
 if(l.visual==='core')return `<div class="crCore"><div><strong>5</strong><b>LOOK-OUT</b></div><div><strong>6</strong><b>SAFE SPEED</b></div><div><strong>7</strong><b>RISK</b></div><div><strong>8</strong><b>ACTION</b></div></div>`;
 if(l.visual==='flow')return `<div class="crFlow"><div class="node"><b>1 • VISIBILITY?</b><small>What conditions apply?</small></div><span class="arrow">→</span><div class="node"><b>2 • SITUATION?</b><small>Overtaking, head-on, crossing?</small></div><span class="arrow">→</span><div class="node"><b>3 • RULES?</b><small>Identify obligations</small></div><span class="arrow">→</span><div class="node"><b>4 • ACTION</b><small>Early, substantial, monitored</small></div></div>`;
 if(l.visual==='roles')return `<div class="crRoles"><div><strong>GIVE-WAY</strong><span>Take early and substantial action to keep well clear.</span></div><div><strong>STAND-ON</strong><span>Initially keep course and speed, but keep monitoring and be ready to act as Rule 17 requires.</span></div></div>`;
 if(l.visual==='special')return `<div class="crFlow"><div class="node"><b>RULE 9</b><small>Narrow channels</small></div><div class="node"><b>RULE 10</b><small>Traffic separation</small></div><div class="node"><b>RULE 19</b><small>Restricted visibility</small></div></div>`;
 return `<div class="crFlow"><div class="node"><b>${l.title}</b><small>${l.intro}</small></div></div>`;
}

function crLessonsComplete(){return crLessonsFinished>=6}
function renderCrLesson(){
 const l=COLREGS_BEGINNER[crLesson],list=$('crLessonList');if(!l||!list)return;
 const nextAvailable=Math.min(5,crLessonsFinished);
 list.innerHTML=COLREGS_BEGINNER.map((x,i)=>{
  const done=i<crLessonsFinished,locked=i>nextAvailable;
  return `<button class="${i===crLesson?'active':''} ${done?'done':''} ${locked?'lessonLocked':''}" ${locked?'disabled':''} onclick="crSelect(${i})"><small>LESSON ${i+1}</small><b>${x.title}<span class="tick">${done?' ✓':locked?' 🔒':''}</span></b></button>`;
 }).join('');
 $('crLessonNo').textContent='STAGE 2 • LESSON '+String(crLesson+1).padStart(2,'0')+' / 06';
 $('crLessonTitle').textContent=l.title;$('crLessonIntro').textContent=l.intro;
 $('crLessonBody').innerHTML=l.facts.map(x=>`<div class="crFact"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
 try{$('crLessonVisual').innerHTML=crVisual(l)}catch(e){console.warn('Stage 2 visual fallback',e);$('crLessonVisual').innerHTML=`<div class="crFlow"><div class="node"><b>${l.title}</b><small>${l.intro}</small></div></div>`}
 $('crProgressText').textContent=`${crLessonsFinished} / 6 LESSONS`;
 $('crProgressFill').style.width=(crLessonsFinished/6*100)+'%';
 const nb=$('crNextBtn');
 if(nb)nb.textContent=crLesson===5?'COMPLETE LESSON 6 & START FINAL CHECK →':'COMPLETE LESSON & CONTINUE →';
 renderCrQuiz();
}
function crSelect(i){
 stopCourseSpeech();
 const maxAllowed=Math.min(5,crLessonsFinished);
 crLesson=Math.max(0,Math.min(maxAllowed,i));
 renderCrLesson();
}
function crPrev(){crSelect(crLesson-1)}
function crNext(){
 stopCourseSpeech();
 if(crLesson<5){
  crLessonsFinished=Math.max(crLessonsFinished,crLesson+1);
  crLesson++;
  renderCrLesson();
  return;
 }
 finishStage2Teaching();
}
function finishStage2Teaching(){
 crLessonsFinished=6;
 const progressText=$('crProgressText'),progressFill=$('crProgressFill');
 if(progressText)progressText.textContent='6 / 6 LESSONS';
 if(progressFill)progressFill.style.width='100%';

 document.querySelectorAll('#crLessonList button').forEach((b,i)=>{
  b.classList.remove('lessonLocked');
  b.classList.add('done');
  b.disabled=false;
  const tick=b.querySelector('.tick');
  if(tick)tick.textContent=' ✓';
 });

 const k=$('crKnowledge'),area=$('crQuizArea');
 if(k)k.classList.remove('locked');
 if(area)area.innerHTML=crQuizHTML();
 // QA 1.46.23: once the final check starts, remove the teaching answer cues
 // (especially the Rule 9 / 10 / 19 summary) from the assessment view.
 const lessonNav=$('crLessonList');
 const lessonCard=document.querySelector('#colregsTutorialPage .stage2LessonCard');
 if(lessonNav)lessonNav.style.display='none';
 if(lessonCard)lessonCard.style.display='none';

 const nb=$('crNextBtn');
 if(nb){nb.textContent='FINAL CHECK UNLOCKED ✓';nb.disabled=true}

 requestAnimationFrame(()=>{
  if(k)k.scrollIntoView({behavior:'smooth',block:'start'});
 });
}
function crComplete(){crNext()}
function crSpeak(){if('speechSynthesis' in window&&speechSynthesis.speaking){stopCourseSpeech();return}const l=COLREGS_BEGINNER[crLesson],speech=l.title+'. '+l.intro+'. '+l.facts.map(x=>x[0]+'. '+x[1]).join(' ');const u=speakMarine(speech,'instruction'),b=$('crSpeakBtn');if(b)b.textContent='■ STOP LESSON';if(u)u.onend=()=>{const x=$('crSpeakBtn');if(x)x.textContent='🔊 HEAR LESSON'}}
function renderCrQuiz(){
 const area=$('crQuizArea'),box=$('crKnowledge');if(!area)return;
 if(typeof CR_QUIZ==='undefined'||!Array.isArray(CR_QUIZ)||CR_QUIZ.length!==10){
  if(box)box.classList.remove('locked');
  area.innerHTML='<div class="stage2QuizIntro"><b>FINAL CHECK ERROR</b><br>The Stage 2 question bank did not load. Please reload Project Watch.</div>';
  return;
 }
 const unlocked=crLessonsFinished>=6;
 if(box)box.classList.toggle('locked',!unlocked);
 if(unlocked){area.innerHTML=crQuizHTML();return}
 area.innerHTML=`<div class="stage2QuizIntro"><b>TEACHING IN PROGRESS</b><br>${crLessonsFinished} / 6 lessons completed. Work through Lessons 1–6 above. The final check unlocks automatically after Lesson 6.</div>`;
}
function crQuizHTML(){
 if(crQuizIndex>=CR_QUIZ.length){const pass=crQuizScore>=8;return `<div class="crQuizScore"><strong>${crQuizScore} / ${CR_QUIZ.length}</strong><b>${pass?'STAGE 2 KNOWLEDGE ACHIEVED':'REVIEW AND TRY AGAIN'}</b><span>${pass?'You have demonstrated the COLREG foundations taught in Stage 2.':'Review the six teaching lessons above. You need 8/10 to complete Stage 2.'}</span>${pass?'<button type="button" style="margin-top:12px" onclick="completeStage2()">COMPLETE STAGE 2 →</button>':'<button type="button" style="margin-top:12px" onclick="crRestartQuiz()">TRY AGAIN</button>'} <button type="button" style="margin-top:12px" onclick="openRulesLibrary()">📖 RULES LIBRARY</button></div>`}
 const q=CR_QUIZ[crQuizIndex];return `<div class="crQuiz"><div class="ver">STAGE 2 FINAL CHECK • QUESTION ${crQuizIndex+1} / ${CR_QUIZ.length}</div><div class="crQuizQ">${q[0]}</div><div class="crQuizOpts">${q[1].map((o,i)=>`<button type="button" onclick="crAnswer(${i});return false;">${o}</button>`).join('')}</div><div class="quizHelpRow"><span class="blindCheckNote">Choose your answer first. The relevant Rule reference is revealed with the feedback.</span></div><div id="crQuizResult" class="crQuizResult"></div></div>`;
}
function crAnswer(i){if(crQuizAnswered)return;crQuizAnswered=true;const q=CR_QUIZ[crQuizIndex],ok=i===q[2],ref=CR_QUIZ_RULE_REFS[crQuizIndex];if(ok)crQuizScore++;document.querySelectorAll('#crQuizArea .crQuizOpts button').forEach((b,idx)=>{b.classList.add('answerLocked');if(idx===q[2])b.classList.add('correctAnswer');else if(idx===i&&!ok)b.classList.add('wrongAnswer')});const result=$('crQuizResult');if(result)result.innerHTML=`<b>${ok?'CORRECT ✓':'NOT QUITE'}</b><br>${q[3]}<br>${ref?`<button type="button" style="margin-top:7px" onclick="openRulesLibrary('${ref.rule}','Review the exact rule connected with this answer, then return to the Stage 2 check.')">📖 ${ref.label}</button> `:''}<button type="button" style="margin-top:7px" onclick="crQuizNext();return false;">${crQuizIndex===CR_QUIZ.length-1?'SEE RESULT':'NEXT QUESTION →'}</button>`}
function crQuizNext(){if(!crQuizAnswered)return;crQuizIndex=Math.min(CR_QUIZ.length,crQuizIndex+1);crQuizAnswered=false;renderCrQuiz();$('crKnowledge')?.scrollIntoView({behavior:'smooth',block:'start'})}
function crRestartQuiz(){crQuizIndex=0;crQuizScore=0;crQuizAnswered=false;renderCrQuiz()}
function completeStage2(){if(!crLessonsComplete()){alert('Complete all six Stage 2 teaching lessons first.');return}if(crQuizIndex<CR_QUIZ.length||crQuizScore<8){alert('Complete the Stage 2 final check with at least 8/10 first.');return}courseRecordScore('foundations',Math.round(crQuizScore/CR_QUIZ.length*100),true);showCoursePage()}

function homeCourseCurrentIndex(){
 const idx=PW_COURSE_STAGES.findIndex(s=>!courseCompleted(s.id));
 return idx<0?PW_COURSE_STAGES.length:idx;
}
function continueCourseFromHome(){
 const idx=homeCourseCurrentIndex();
 if(idx>=PW_COURSE_STAGES.length){showCoursePage();return}
 courseLaunch(PW_COURSE_STAGES[idx].id);
}
function renderHomeCourseDashboard(){
 if(typeof PW_COURSE_STAGES==='undefined')return;
 const count=courseCount(),pct=coursePct(),idx=homeCourseCurrentIndex();
 const pctEl=$('homeCoursePercentBig'),stageText=$('homeCourseStageText'),bar=$('homeCourseProgressBar');
 if(pctEl)pctEl.textContent=pct+'%';
 if(stageText)stageText.textContent=`${count} / ${PW_COURSE_STAGES.length} STAGES`;
 if(bar)bar.style.width=pct+'%';
 if($('homeVesselCourseName'))$('homeVesselCourseName').textContent=vesselNameUpper();

 const btn=$('homeContinueCourseBtn');
 if(idx>=PW_COURSE_STAGES.length){
   if($('homeNextStageNo'))$('homeNextStageNo').textContent='✓';
   if($('homeNextStageType'))$('homeNextStageType').textContent='CORE PATHWAY';
   if($('homeNextStageTitle'))$('homeNextStageTitle').textContent='Core course complete';
   if($('homeNextStageDesc'))$('homeNextStageDesc').textContent='Review any stage from the Course Map or continue practising through the Training Library.';
   if(btn)btn.textContent='VIEW COURSE MAP →';
 }else{
   const s=PW_COURSE_STAGES[idx];
   if($('homeNextStageNo'))$('homeNextStageNo').textContent=s.no;
   if($('homeNextStageType'))$('homeNextStageType').textContent=s.type;
   if($('homeNextStageTitle'))$('homeNextStageTitle').textContent=s.title;
   if($('homeNextStageDesc'))$('homeNextStageDesc').textContent=s.desc;
   if(btn)btn.textContent=(count===0?'START COURSE':'CONTINUE COURSE')+' →';
 }

 const rail=$('homeCourseStageRail');
 if(rail){
   rail.innerHTML=PW_COURSE_STAGES.map((s,i)=>{
     const done=courseCompleted(s.id),current=i===idx,locked=!done&&!current&&!coursePrereqComplete(i);
     return `<div class="homeRailStage ${done?'done':''} ${current?'current':''} ${locked?'locked':''}">
       <span>${done?'COMPLETE':current?'NEXT':'STAGE '+s.no}</span>
       <b>${s.title}</b>
       <small>${done?'✓ Completed':current?'Ready to continue':locked?'Course Mode locked':'Available'}</small>
     </div>`;
   }).join('');
 }
}

const PW_LIBRARY_ART=window.PW_ORIGINAL_LIBRARIES.PW_LIBRARY_ART;
function pwApplyLibraryArt(){document.querySelectorAll('#libraryPage .lib20Card[data-lib-art]').forEach(card=>{const img=card.querySelector('.lib20CardVisual img'),src=PW_LIBRARY_ART[card.dataset.libArt];if(img&&src){img.src=src;img.style.display='block';}})}
let pwLibraryMode='all';
document.addEventListener('DOMContentLoaded',pwApplyLibraryArt);
function pwLibrarySetFilter(mode,btn){pwLibraryMode=mode;document.querySelectorAll('#lib20Filter button').forEach(b=>b.classList.toggle('active',b===btn));pwLibraryFilter()}
function pwLibraryNormalise(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim()}
const PW_LIBRARY_SEARCH_ALIASES=window.PW_ORIGINAL_LIBRARIES.PW_LIBRARY_SEARCH_ALIASES;
function pwLibraryFilter(){
 const raw=document.getElementById('lib20Search')?.value||'';
 let q=pwLibraryNormalise(raw);
 Object.keys(PW_LIBRARY_SEARCH_ALIASES).forEach(a=>{if(q.includes(a))q+=' '+PW_LIBRARY_SEARCH_ALIASES[a]});
 const terms=q.split(/\s+/).filter(Boolean);
 let shown=0;
 document.querySelectorAll('#libraryPage .lib20Card').forEach(card=>{
  const text=pwLibraryNormalise((card.dataset.tags||'')+' '+card.textContent);
  const modes=(card.dataset.modes||'').split(' ');
  const searchOK=!terms.length||terms.every(t=>text.includes(t));
  const ok=searchOK&&(pwLibraryMode==='all'||modes.includes(pwLibraryMode));
  card.classList.toggle('hidden',!ok);if(ok)shown++
 });
 document.querySelectorAll('#libraryPage .lib20Section').forEach(sec=>sec.classList.toggle('hidden',!sec.querySelector('.lib20Card:not(.hidden)')));
 document.getElementById('lib20Empty')?.classList.toggle('show',shown===0)
}

let pwLibraryContext=false;
function openLibraryModule(name,btn){
 pwLibraryContext=true;
 showModule(name,btn);
}
function returnToLibrary(){
 showTrainingLibrary();
}

function showTrainingLibrary(){
 document.querySelectorAll('.appPage.active,.screen.active').forEach(p=>p.classList.remove('active'));
 updateHeaderNav('library');
 $('libraryPage').classList.add('active');
 window.scrollTo({top:0,behavior:'smooth'});
}

const ORIENTATION_LESSONS=window.PW_ORIGINAL_LIBRARIES.ORIENTATION_LESSONS;
const ORIENTATION_QUIZ=window.PW_ORIGINAL_LIBRARIES.ORIENTATION_QUIZ;
let orientationLesson=0,orientationSeen=new Set(),orientationQuizIndex=0,orientationQuizScore=0,orientationQuizAnswered=false;

function renderOrientation(){
 const nav=$('orientationLessonNav'),card=$('orientationLessonCard');if(!nav||!card)return;
 nav.innerHTML=ORIENTATION_LESSONS.map((l,i)=>`<button class="${i===orientationLesson?'active':''} ${orientationSeen.has(i)?'done':''}" onclick="orientationSelect(${i})"><small>LESSON ${i+1}</small><b>${l.title}</b></button>`).join('');
 const l=ORIENTATION_LESSONS[orientationLesson];
 card.innerHTML=`<div class="ver">ORIENTATION LESSON ${orientationLesson+1} / ${ORIENTATION_LESSONS.length}</div><h3>${l.title}</h3><p>${l.intro}</p>
 <div class="orientationTeachGrid">${l.facts.map(f=>`<div><b>${f[0]}</b><span>${f[1]}</span></div>`).join('')}</div>
 <div class="orientationLessonActions"><button onclick="orientationPrev()">← PREVIOUS</button><button onclick="orientationHear()" id="orientationHearBtn">🔊 HEAR LESSON</button><button onclick="orientationNext()">${orientationLesson===ORIENTATION_LESSONS.length-1?'GO TO KNOWLEDGE CHECK →':'NEXT LESSON →'}</button></div>`;
 renderOrientationQuiz();
}
function orientationSelect(i){
 stopCourseSpeech();
 orientationLesson=Math.max(0,Math.min(ORIENTATION_LESSONS.length-1,i));renderOrientation();
}
function orientationPrev(){orientationSelect(orientationLesson-1)}
function orientationNext(){
 orientationSeen.add(orientationLesson);
 if(orientationLesson<ORIENTATION_LESSONS.length-1){orientationLesson++;renderOrientation();return}
 renderOrientation();
 const k=$('orientationKnowledge');
 if(k){k.classList.remove('locked');k.scrollIntoView({behavior:'smooth',block:'start'})}
 renderOrientationQuiz();
}
function orientationHear(){
 if('speechSynthesis' in window&&speechSynthesis.speaking){stopCourseSpeech();return}
 const l=ORIENTATION_LESSONS[orientationLesson];
 const u=speakMarine(l.title+'. '+l.intro+'. '+l.facts.map(f=>f[0]+'. '+f[1]).join(' '),'instruction');
 const b=$('orientationHearBtn');if(b)b.textContent='■ STOP LESSON';
 if(u)u.onend=()=>{const x=$('orientationHearBtn');if(x)x.textContent='🔊 HEAR LESSON'};
}
function orientationLessonsComplete(){return ORIENTATION_LESSONS.every((_,i)=>orientationSeen.has(i))}
function renderOrientationQuiz(){
 const area=$('orientationQuizArea'),box=$('orientationKnowledge');if(!area)return;
 const unlocked=orientationLessonsComplete();
 if(box)box.classList.toggle('locked',!unlocked);
 if(!unlocked){
   area.innerHTML=`<div class="orientationQ"><div class="ver">TEACHING IN PROGRESS</div><h4>Complete Bridge Language lessons 1–6 first.</h4><div class="orientationQResult">${orientationSeen.size} / 6 lessons completed. Use the lesson cards above and press NEXT LESSON after each one.</div></div>`;
   return;
 }
 if(orientationQuizIndex>=ORIENTATION_QUIZ.length){
   const pass=orientationQuizScore>=4;
   area.innerHTML=`<div class="crQuizScore"><strong>${orientationQuizScore} / 5</strong><b>${pass?'STAGE 1 KNOWLEDGE ACHIEVED':'REVIEW AND TRY AGAIN'}</b><span>${pass?'You have demonstrated the Stage 1 fundamentals. Tick the safety acknowledgement below, then complete the stage.':'Review the six teaching cards above. You need 4/5.'}</span>${pass?'<button style="margin-top:10px" onclick="completeOrientation()">COMPLETE STAGE 1 →</button>':'<button style="margin-top:10px" onclick="restartOrientationQuiz()">TRY AGAIN</button>'}</div>`;
   return;
 }
 const q=ORIENTATION_QUIZ[orientationQuizIndex];
 area.innerHTML=`<div class="orientationQ"><div class="ver">STAGE 1 FINAL CHECK • QUESTION ${orientationQuizIndex+1} / 5</div><h4>${q[0]}</h4><div class="orientationQOpts">${q[1].map((a,i)=>`<button id="orientationAnswer${i}" type="button" onclick="answerOrientation(${i});return false;">${a}</button>`).join('')}</div><div id="orientationQResult" class="orientationQResult"></div></div>`;
}
function answerOrientation(i){
 if(orientationQuizAnswered)return;
 orientationQuizAnswered=true;
 const q=ORIENTATION_QUIZ[orientationQuizIndex],ok=i===q[2];
 if(ok)orientationQuizScore++;
 document.querySelectorAll('.orientationQOpts button').forEach((b,idx)=>{
   b.classList.add('answerLocked');
   if(idx===q[2])b.classList.add('correctAnswer');
   else if(idx===i&&!ok)b.classList.add('wrongAnswer');
 });
 const result=$('orientationQResult');
 if(result)result.innerHTML=`<b>${ok?'CORRECT ✓':'NOT QUITE'}</b><br>${q[3]}<br><button type="button" class="nextQBtn" onclick="nextOrientationQuestion();return false;">${orientationQuizIndex===ORIENTATION_QUIZ.length-1?'SEE RESULT':'NEXT QUESTION →'}</button>`;
}
function nextOrientationQuestion(){
 if(!orientationQuizAnswered)return;
 orientationQuizIndex=Math.min(ORIENTATION_QUIZ.length,orientationQuizIndex+1);
 orientationQuizAnswered=false;
 renderOrientationQuiz();
 $('orientationKnowledge')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function restartOrientationQuiz(){orientationQuizIndex=0;orientationQuizScore=0;orientationQuizAnswered=false;renderOrientationQuiz()}
function stopCourseSpeech(){
 try{if('speechSynthesis' in window)speechSynthesis.cancel()}catch(e){}
 const a=$('crSpeakBtn');if(a)a.textContent='🔊 HEAR LESSON';
 const b=$('orientationHearBtn');if(b)b.textContent='🔊 HEAR LESSON';
}
let PW_CONTEXT_RULE=null;
function openRulesLibrary(ruleNo,why){
 stopCourseSpeech();
 if(ruleNo){
  const r=RULE_DATA[String(ruleNo)];
  if(r){
   PW_CONTEXT_RULE=String(ruleNo);
   $('contextRuleTitle').textContent='Rule '+ruleNo+' • '+r.title;
   $('contextRuleWhy').textContent=why||'This is the exact reference for the lesson or question you are working on. Review it, then return to where you were.';
   $('contextRuleSummary').textContent=r.summary;
   $('contextRuleTraining').textContent=r.training;
   $('contextRuleProject').textContent=r.project;
   $('contextRuleSheet').classList.add('open');return;
  }
 }
 showModule('colregs');
 setTimeout(()=>$('ruleList')?.scrollIntoView({behavior:'smooth',block:'start'}),100);
}
function closeContextRule(){$('contextRuleSheet')?.classList.remove('open')}
function contextRuleOpenFull(){
 const rn=PW_CONTEXT_RULE;closeContextRule();showModule('colregs');
 if(rn)setTimeout(()=>{const row=document.querySelector(`#ruleList .ruleRow[data-rule="${rn}"]`);if(row){row.scrollIntoView({behavior:'smooth',block:'center'});row.classList.add('activeRuleFocus');setTimeout(()=>row.classList.remove('activeRuleFocus'),1800)}},120);
}

function resetProjectWatchForTesting(){
 stopCourseSpeech();
 const ok=confirm(
  'START PROJECT WATCH AGAIN FROM THE BEGINNING?\n\n'+
  'This testing reset clears saved Project Watch learner progress and vessel setup on this device, then returns Course Mode to Stage 1 at 0%.\n\n'+
  'The application itself is not changed.'
 );
 if(!ok)return;

 try{
  const remove=[];
  for(let i=0;i<localStorage.length;i++){
   const k=localStorage.key(i)||'';
   if(/^projectwatch/i.test(k)||/^projectWatch/i.test(k)||/^pw_/i.test(k))remove.push(k);
  }
  remove.forEach(k=>localStorage.removeItem(k));

  const sremove=[];
  for(let i=0;i<sessionStorage.length;i++){
   const k=sessionStorage.key(i)||'';
   if(/^projectwatch/i.test(k)||/^projectWatch/i.test(k)||/^pw_/i.test(k))sremove.push(k);
  }
  sremove.forEach(k=>sessionStorage.removeItem(k));
 }catch(e){console.warn('Project Watch QA reset',e)}

 try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
 location.reload();
}

const PW_COURSE_STORAGE='projectWatchCourseProgressV1';
const PW_AIS_TASKS_STORAGE='projectWatchAisTasksV1';

const PW_COURSE_STAGES=window.PW_ORIGINAL_LIBRARIES.PW_COURSE_STAGES;

function courseLoad(){
 try{
   const raw=localStorage.getItem(PW_COURSE_STORAGE);
   return raw?JSON.parse(raw):{completed:{},best:{},started:{}};
 }catch(e){return {completed:{},best:{},started:{}}}
}
function courseSave(c){try{localStorage.setItem(PW_COURSE_STORAGE,JSON.stringify(c))}catch(e){}}
function courseState(){return courseLoad()}
function courseCompleted(id){return !!courseState().completed?.[id]}
function courseBest(id){return courseState().best?.[id]??null}
function courseRecordStart(id){
 const c=courseState();c.started=c.started||{};c.started[id]=Date.now();courseSave(c);updateHomeCourseProgress();
}
function courseRecordComplete(id,score=null){
 const c=courseState();c.completed=c.completed||{};c.best=c.best||{};
 c.completed[id]=Date.now();
 if(score!==null)c.best[id]=Math.max(Number(c.best[id]||0),Number(score));
 courseSave(c);renderCoursePage();updateHomeCourseProgress();
}
function courseRecordScore(id,score,pass){
 const c=courseState();c.best=c.best||{};c.started=c.started||{};
 c.started[id]=c.started[id]||Date.now();c.best[id]=Math.max(Number(c.best[id]||0),Number(score||0));
 if(pass){c.completed=c.completed||{};c.completed[id]=Date.now()}
 courseSave(c);updateHomeCourseProgress();
}
function courseCount(){
 const c=courseState();return PW_COURSE_STAGES.filter(s=>c.completed?.[s.id]).length;
}
function coursePct(){return Math.round(courseCount()/PW_COURSE_STAGES.length*100)}
function updateHomeCourseProgress(){
 const el=$('homeCourseProgress');if(el)el.textContent=`Structured progression • ${coursePct()}% complete`;
 renderHomeCourseDashboard();
}
function coursePrereqComplete(index){
 if(index<=0)return true;
 return courseCompleted(PW_COURSE_STAGES[index-1].id);
}
function showCoursePage(){
 document.querySelectorAll('.appPage.active,.screen.active').forEach(p=>p.classList.remove('active'));
 updateHeaderNav('course');
 const page=$('coursePage');
 if(!page)return;
 page.classList.add('active');
 renderCoursePage();
 if(location.hash==='#course-orientation'){
   const orientation=$('courseOrientation');
   if(orientation){
     orientation.classList.add('show');
     renderOrientation();
     requestAnimationFrame(()=>orientation.scrollIntoView({behavior:'smooth',block:'start'}));
     return;
   }
 }
 window.scrollTo({top:0,behavior:'smooth'});
}
function renderCoursePage(){
 const list=$('courseStageList');if(!list)return;
 const count=courseCount(),pct=coursePct();
 $('coursePercent').textContent=pct+'%';$('courseStageCount').textContent=`${count} / ${PW_COURSE_STAGES.length} STAGES COMPLETE`;
 $('courseProgressFill').style.width=pct+'%';

 let current=PW_COURSE_STAGES.findIndex(s=>!courseCompleted(s.id));
 if(current<0)current=PW_COURSE_STAGES.length;

 list.innerHTML=PW_COURSE_STAGES.map((s,i)=>{
   const done=courseCompleted(s.id),locked=!done&&!coursePrereqComplete(i),active=!done&&i===current;
   const best=courseBest(s.id);
   const status=done?`COMPLETE${best!==null?' • BEST '+best+'%':''}`:locked?'COURSE MODE LOCKED':active?'NEXT STAGE':'AVAILABLE';
   const label=s.id==='orientation'?'OPEN ORIENTATION':
     s.id==='signals'?'OPEN COURSE CHECKPOINT':
     s.id==='ais'?'OPEN AIS COURSE':
     'OPEN MODULE';
   return `<div class="courseStage ${done?'completed':''} ${locked?'locked':''} ${active?'current':''}">
     <div class="courseStageNo"><span>STAGE</span><b>${s.no}</b></div>
     <div class="courseStageMain"><div class="ver">${s.type}</div><h3>${s.title}</h3><p>${s.desc}</p>
       <div class="courseObjectives">${s.objectives.map(o=>`<span>${o}</span>`).join('')}</div>
     </div>
     <div class="courseStageAction"><div class="courseStatus">${status}</div>
       <button ${locked?'disabled':''} onclick="courseLaunch('${s.id}')">${done?'REVIEW STAGE':label} →</button>
       <div class="courseRequirement">${s.requirement}</div>
     </div>
   </div>`;
 }).join('');

 const o=$('courseOrientation');if(o)o.classList.toggle('show',location.hash==='#course-orientation');
 if(o&&o.classList.contains('show'))renderOrientation();
}
function courseLaunch(id){
 const idx=PW_COURSE_STAGES.findIndex(s=>s.id===id);
 if(idx>0&&!coursePrereqComplete(idx)&&!courseCompleted(id))return;
 courseRecordStart(id);
 if(id==='orientation'){
   location.hash='course-orientation';
   showCoursePage();
   const orientation=$('courseOrientation');
   if(orientation){
     orientation.classList.add('show');
     requestAnimationFrame(()=>orientation.scrollIntoView({behavior:'smooth',block:'start'}));
   }
   return;
 }
 if(id==='foundations'){showColregsTutorial();return}
 if(id==='lights'){showLightsTutorial();return}
 if(id==='signals'){
   showModule('signals');showSignalSection('quiz');startSignalCourseCheck();return;
 }
 if(id==='collision'){showStage5Course();return}
 if(id==='buoyage'){showBuoyTutorial();return}
 if(id==='tss'){showTSSTutorial();return}
 if(id==='ais'){showModule('ais');aisSetLesson(1);return}
}
function completeOrientation(){
 const chk=$('orientationAgree');
 if(!orientationLessonsComplete()){
   alert('Complete all six Bridge Language teaching lessons first.');return;
 }
 if(orientationQuizIndex<ORIENTATION_QUIZ.length||orientationQuizScore<4){
   alert('Complete the five-question Stage 1 knowledge check first. You need at least 4/5.');
   $('orientationKnowledge')?.scrollIntoView({behavior:'smooth',block:'start'});return;
 }
 if(!chk?.checked){
   alert('Please read and tick the safety acknowledgement. It does not affect your score.');
   chk?.scrollIntoView({behavior:'smooth',block:'center'});return;
 }
 const pct=Math.round(orientationQuizScore/ORIENTATION_QUIZ.length*100);
 courseRecordComplete('orientation',pct);location.hash='';renderCoursePage();showCoursePage();
}

function courseResetProgress(){
 if(!confirm('Reset structured-course progress? Your vessel profile and training modules will not be changed.'))return;
 try{localStorage.removeItem(PW_COURSE_STORAGE);localStorage.removeItem(PW_AIS_TASKS_STORAGE)}catch(e){}
 renderCoursePage();updateHomeCourseProgress();
}

let sigCourseActive=false,sigCourseAnswered=0,sigCourseScore=0,sigCourseSeen=new Set();
function startSignalCourseCheck(){
 sigCourseActive=true;sigCourseAnswered=0;sigCourseScore=0;sigCourseSeen=new Set();sigQuizIndex=-1;sigQuizCurrent=null;
 nextSignalQuiz();
 const q=$('sigQuizQ');if(q)q.textContent='Course checkpoint • 1 / 10 • What signal did you hear?';
}

function loadAisCourseTasks(){
 try{return new Set(JSON.parse(localStorage.getItem(PW_AIS_TASKS_STORAGE)||'[]'))}catch(e){return new Set()}
}
function saveAisCourseTasks(set){
 try{localStorage.setItem(PW_AIS_TASKS_STORAGE,JSON.stringify([...set]))}catch(e){}
}
function markAisTask(n){
 const s=loadAisCourseTasks();s.add(n);saveAisCourseTasks(s);
 const b=$('aisLesson'+n);if(b)b.classList.add('courseDone');
 if(s.size>=5)courseRecordComplete('ais',100);
}
function refreshAisCourseTasks(){
 const s=loadAisCourseTasks();for(let n=1;n<=5;n++)$('aisLesson'+n)?.classList.toggle('courseDone',s.has(n));
}

const PW_VESSEL_STORAGE='projectWatchVesselProfileV2';
const PW_VESSEL_SEEN='projectWatchVesselSetupSeenV2';
const TRAINING_VESSEL_PROFILES=window.PW_ORIGINAL_LIBRARIES.TRAINING_VESSEL_PROFILES;
const DEFAULT_VESSEL_PROFILE=TRAINING_VESSEL_PROFILES.watch1;
let PW_VESSEL_PROFILE=null,PW_PENDING_PHOTO='';

function pwStoreGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function pwStoreSet(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}
function pwStoreRemove(k){try{localStorage.removeItem(k)}catch(e){}}
function loadVesselProfile(){
  try{
    const raw=pwStoreGet(PW_VESSEL_STORAGE);
    if(!raw)return {...DEFAULT_VESSEL_PROFILE};
    const p=JSON.parse(raw);
    if(p?.id&&TRAINING_VESSEL_PROFILES[p.id])return {...TRAINING_VESSEL_PROFILES[p.id]};
    return {...DEFAULT_VESSEL_PROFILE,...p,isDefault:false,id:'custom'};
  }catch(e){return {...DEFAULT_VESSEL_PROFILE}}
}
function vesselProfile(){if(!PW_VESSEL_PROFILE)PW_VESSEL_PROFILE=loadVesselProfile();return PW_VESSEL_PROFILE}
function vesselName(){return vesselProfile().name||'Watch One'}
function vesselNameUpper(){return vesselName().toUpperCase()}
function vesselLength(){let n=parseFloat(vesselProfile().length);return Number.isFinite(n)?n:14.2}
function vesselPropulsion(){return vesselProfile().propulsion==='sail'?'sail':'power'}
function vesselTypeText(){return vesselPropulsion()==='sail'?'sailing vessel':'power-driven vessel'}
function vesselCruiseSpeed(){let n=parseFloat(vesselProfile().cruise);return Number.isFinite(n)?n:7}
function vesselModelText(){const p=vesselProfile(),m=[p.make,p.model].filter(Boolean).join(' ').trim();return m||vesselTypeText()}
function vesselRule10JApplies(){return vesselLength()<20 || vesselPropulsion()==='sail'}
function vesselRule10Context(){
 const nm=vesselName(),len=vesselLength().toFixed(1);
 if(vesselPropulsion()==='sail')return `${nm} is configured as a sailing vessel (${len} m). Rule 10(j)'s non-impeding duty applies to sailing vessels as well as vessels under 20 m.`;
 if(vesselLength()<20)return `${nm} is ${len} m and therefore under 20 m. Rule 10(j)'s additional non-impeding duty applies in the TSS training.`;
 return `${nm} is ${len} m and power-driven. Rule 10(j) does not apply solely by vessel length. The general Rule 10 training still applies; under-20 m questions are presented as general knowledge rather than as a statement about your vessel.`;
}
function vesselDisplayLength(){return `${vesselLength().toFixed(1)} m`}
function personalisedString(value){
 let x=String(value??''),nm=vesselName(),upper=vesselNameUpper();
 x=x.replace(/\bWATCH ONE\b/g,upper).replace(/\bWatch One\b/g,nm);
 return x;
}

function resizeVesselImage(file){
 return new Promise((resolve,reject)=>{
   const r=new FileReader();
   r.onload=()=>{
     const im=new Image();
     im.onload=()=>{
       const maxW=1100,maxH=750,ratio=Math.min(1,maxW/im.width,maxH/im.height);
       const c=document.createElement('canvas');c.width=Math.round(im.width*ratio);c.height=Math.round(im.height*ratio);
       c.getContext('2d').drawImage(im,0,0,c.width,c.height);
       resolve(c.toDataURL('image/jpeg',.78));
     };
     im.onerror=reject;im.src=r.result;
   };
   r.onerror=reject;r.readAsDataURL(file);
 });
}
async function handleVesselPhoto(ev){
 const f=ev.target.files?.[0];if(!f)return;
 try{PW_PENDING_PHOTO=await resizeVesselImage(f);renderVesselPhotoPreview(PW_PENDING_PHOTO)}
 catch(e){alert('Project Watch could not read that image. Please try another photo.')}
}
function renderVesselPhotoPreview(src){
 const box=$('vpPhotoPreview');if(!box)return;
 box.innerHTML=src?`<img src="${src}" alt="Vessel photo preview">`:'<span>NO PHOTO SELECTED</span>';
}
function removeVesselPhoto(){PW_PENDING_PHOTO='';renderVesselPhotoPreview('');if($('vpPhoto'))$('vpPhoto').value=''}

function openVesselSetup(firstRun=false){
 const modal=$('vesselSetupModal');if(!modal)return;
 modal.classList.add('show');modal.setAttribute('aria-hidden','false');
 const existing=vesselProfile(),isFirst=firstRun&&!pwStoreGet(PW_VESSEL_SEEN);
 $('vesselSetupHeading').textContent=isFirst?'Welcome aboard Project Watch':'My training vessel';
 $('vesselSetupIntro').textContent=isFirst?'Choose Watch One, Watch Two, or set up your own vessel.':'Update the vessel Project Watch uses throughout the training platform.';
 $('vesselSetupClose').style.display=isFirst?'none':'block';
 $('vpCancelBtn').style.display=isFirst?'none':'inline-block';
 $('vesselFirstChoice').style.display=isFirst?'grid':'none';
 $('vesselProfileForm').classList.toggle('show',!isFirst);
 if(!isFirst)populateVesselForm(existing);
}
function closeVesselSetup(){
 $('vesselSetupModal')?.classList.remove('show');
 $('vesselSetupModal')?.setAttribute('aria-hidden','true');
}
function showOwnVesselForm(){
 $('vesselFirstChoice').style.display='none';
 $('vesselProfileForm').classList.add('show');
 populateVesselForm(vesselProfile().isDefault?{...vesselProfile(),name:'',make:'',model:'',photo:''}:vesselProfile());
}
function populateVesselForm(p){
 $('vpName').value=p.name||'';$('vpPropulsion').value=p.propulsion||'power';
 $('vpMake').value=p.make||'';$('vpModel').value=p.model||'';
 $('vpLength').value=p.length||'';$('vpBeam').value=p.beam||'';$('vpDraft').value=p.draft||'';
 $('vpCruise').value=p.cruise||'';$('vpMax').value=p.maxSpeed||'';
 $('vpAisClass').value=p.aisClass||'B';$('vpHomePort').value=p.homePort||'';$('vpCallsign').value=p.callsign||'';
 PW_PENDING_PHOTO=p.photo||'';renderVesselPhotoPreview(PW_PENDING_PHOTO);updateProfileRulePreview();
 ['vpPropulsion','vpLength'].forEach(id=>{$(id).oninput=updateProfileRulePreview});
}
function updateProfileRulePreview(){
 const nm=$('vpName')?.value.trim()||'Your vessel',len=parseFloat($('vpLength')?.value),prop=$('vpPropulsion')?.value;
 let msg='Project Watch will use this vessel name, photograph and profile throughout the training platform.';
 if(Number.isFinite(len)){
   if(prop==='sail')msg+=` Rule 10(j) applies because this is a sailing vessel.`;
   else if(len<20)msg+=` At ${len.toFixed(1)} m, Rule 10(j)'s under-20 m non-impeding duty applies.`;
   else msg+=` At ${len.toFixed(1)} m and power-driven, Rule 10(j) does not apply solely by length.`;
 }
 if($('vesselRuleContext'))$('vesselRuleContext').textContent=msg;
}
function saveVesselProfile(ev){
 ev?.preventDefault();
 const p={
   name:$('vpName').value.trim()||'My Vessel',
   propulsion:$('vpPropulsion').value,
   make:$('vpMake').value.trim(),model:$('vpModel').value.trim(),
   length:parseFloat($('vpLength').value)||14.2,
   beam:parseFloat($('vpBeam').value)||null,draft:parseFloat($('vpDraft').value)||null,
   cruise:parseFloat($('vpCruise').value)||7,maxSpeed:parseFloat($('vpMax').value)||null,
   aisClass:$('vpAisClass').value,homePort:$('vpHomePort').value.trim(),
   callsign:$('vpCallsign').value.trim(),photo:PW_PENDING_PHOTO||'',isDefault:false,id:'custom'
 };
 if(!pwStoreSet(PW_VESSEL_STORAGE,JSON.stringify(p))){
   alert('The vessel profile could not be stored in this browser. Try using a smaller photograph.');
   return;
 }
 pwStoreSet(PW_VESSEL_SEEN,'1');
 location.reload();
}
function useTrainingVessel(id){
 const p=TRAINING_VESSEL_PROFILES[id]||TRAINING_VESSEL_PROFILES.watch1;
 pwStoreSet(PW_VESSEL_STORAGE,JSON.stringify({id:p.id}));pwStoreSet(PW_VESSEL_SEEN,'1');
 PW_VESSEL_PROFILE={...p};location.reload();
}
function useDefaultVessel(){useTrainingVessel('watch1')}
function showTrainingVesselChoices(){
 $('vesselFirstChoice').style.display='grid';$('vesselProfileForm').classList.remove('show');
 $('vesselSetupIntro').textContent='Choose Watch One, Watch Two, or set up your own vessel.';
}

function applyVesselPhoto(){
 const p=vesselProfile();if(!p.photo)return;
 const hero=$('homeVesselHeroImg');if(hero)hero.src=p.photo;
 const ownBtn=vesselPropulsion()==='sail'?$('sailModeBtn'):$('powerModeBtn');
 const img=ownBtn?.querySelector('.userVesselPhoto img');
 if(img){img.src=p.photo;img.alt=`${vesselName()}, ${vesselTypeText()}`}
}
function applyVesselBindings(){
 const p=vesselProfile();
 if($('homeVesselName'))$('homeVesselName').textContent=vesselNameUpper();
 if($('homeVesselModel'))$('homeVesselModel').textContent=vesselModelText();
 if($('homeVesselCourseName'))$('homeVesselCourseName').textContent=vesselNameUpper();
 if($('hdrMode')&&!$('hdrMode').classList.contains('backBtn'))$('hdrMode').textContent=vesselNameUpper();
 if($('homeTrainingVesselSummary'))$('homeTrainingVesselSummary').textContent=`${vesselNameUpper()} • ${vesselTypeText().toUpperCase()}`;
 if($('aisOwnName'))$('aisOwnName').textContent=vesselNameUpper();
 applyVesselPhoto();
 document.querySelectorAll('[data-vessel-name]').forEach(n=>n.textContent=vesselName());
 document.querySelectorAll('[data-vessel-length]').forEach(n=>n.textContent=vesselDisplayLength());
 refreshTSSVesselContext();
}
function personaliseTextNode(node){
 if(!node||node.nodeType!==3)return;
 if(node.parentElement?.closest?.('#vesselSetupModal,[data-no-personalise]'))return;
 const old=node.nodeValue,nu=personalisedString(old);
 if(old!==nu)node.nodeValue=nu;
}
function personaliseTree(root=document.body){
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let n;while(n=w.nextNode())personaliseTextNode(n);
}
let pwPersonaliseObserver=null;
function startPersonaliseObserver(){
 if(pwPersonaliseObserver)return;
 pwPersonaliseObserver=new MutationObserver(muts=>{
   muts.forEach(m=>m.addedNodes.forEach(n=>{
     if(n.nodeType===3)personaliseTextNode(n);
     else if(n.nodeType===1&&!n.closest?.('#vesselSetupModal'))personaliseTree(n);
   }));
 });
 pwPersonaliseObserver.observe(document.body,{childList:true,subtree:true});
}
function refreshTSSVesselContext(){
 const page=$('tssPage');if(!page)return;
 const h=page.querySelector('h2');
 if(h)h.textContent=`TSS Training • ${vesselName()}`;
 const note=page.querySelector('.panel > .note');
 if(note)note.innerHTML=`<b>Training vessel: ${vesselName()} • ${vesselDisplayLength()} • ${vesselTypeText()}.</b> ${vesselRule10Context()} Learn the geometry first, then apply it under traffic pressure.`;
 const exam=$('tssExamPage');
 if(exam){
   const hero=exam.querySelector('.tssExamHero p');
   if(hero)hero.textContent=`You are assessed as skipper of ${vesselName()}, a ${vesselDisplayLength()} ${vesselTypeText()}. The exam tests Rule 10, crossing geometry, heading versus COG, joining/leaving, separation zones, lane use and collision-rule interaction. ${vesselRule10JApplies()?'Rule 10(j) applies to your configured vessel.':'Under-20 m Rule 10(j) items remain general-knowledge questions rather than statements about your vessel.'}`;
   const b=exam.querySelector('.tssExamBasis div:first-child b');
   if(b)b.textContent=`${vesselName()} • ${vesselDisplayLength()} • ${vesselTypeText()}`;
 }
 const tut=$('tssTutorialPage');
 if(tut){
   const hp=tut.querySelector('.tutTssHero p');
   if(hp)hp.textContent=`You are in command of ${vesselName()}, a ${vesselDisplayLength()} ${vesselTypeText()}. Project Watch adapts the vessel-status parts of Rule 10 to this profile while keeping the verified crossing geometry unchanged.`;
 }
 const live=$('tssLive');
 if(live){
   const lp=live.querySelector('.tssLesson > .note');
   if(lp)lp.textContent=`Training vessel: ${vesselName()}, ${vesselDisplayLength()}, ${vesselTypeText()}. Assess the traffic first. When a safe crossing develops, cross the complete scheme on the Rule 10(c) heading while continuing to apply the other COLREGs.${vesselRule10JApplies()?' Rule 10(j) also applies to this configured vessel.':''}`;
 }
}
function adaptTSSExamForProfile(){
 if(typeof TSS_EXAM_BANK==='undefined')return;
 const applies=vesselRule10JApplies(),nm=vesselName();
 const first=TSS_EXAM_BANK.find(q=>q.cat==='Under-20 m');
 if(first){
   if(applies){
     first.q=`Does Rule 10(j)'s additional non-impeding duty apply to ${nm} in this configured profile?`;
     first.a=['Yes','No','Only at night','Only in an ITZ'];first.correct=0;
     first.why=vesselPropulsion()==='sail'
       ?`Yes. ${nm} is configured as a sailing vessel, so Rule 10(j) applies even if length is 20 m or more.`
       :`Yes. ${nm} is under 20 m, so Rule 10(j) applies.`;
   }else{
     first.q=`Does Rule 10(j)'s additional non-impeding duty apply to ${nm} solely because of this vessel's configured length/type?`;
     first.a=['Yes','No','Only at night','Only in an ITZ'];first.correct=1;
     first.why=`No. ${nm} is configured as a power-driven vessel of ${vesselDisplayLength()}, so Rule 10(j) does not apply solely by length.`;
   }
 }
}

function adaptTSSTutorialForProfile(){
 if(typeof TSS_TUTORIAL==='undefined'||!TSS_TUTORIAL.length)return;
 const nm=vesselName(),len=vesselDisplayLength(),type=vesselTypeText();
 const applies=vesselRule10JApplies();
 const itzAllowed=vesselLength()<20 || vesselPropulsion()==='sail';

 const L0=TSS_TUTORIAL[0];
 L0.rule=applies?'YOUR VESSEL • RULE 10(j)':'YOUR VESSEL • RULE 10';
 L0.title='Start here: know your vessel status';
 L0.intro=`Project Watch is configured for ${nm}, a ${len} ${type}.`;
 L0.facts=[
   ['TRAINING VESSEL',`${nm} • ${len} • ${type}`],
   ['RULE 10(j)',applies
     ?(vesselPropulsion()==='sail'
       ?'Applies because your configured vessel is a sailing vessel.'
       :'Applies because your configured vessel is under 20 metres.')
     :'Does not apply solely by length because your configured vessel is power-driven and 20 m or more.'],
   ['OTHER COLREGS','Rule 10 does not remove your responsibilities under the other COLREGs.'],
   ['LOCAL INFORMATION','Check the chart and Sailing Directions because individual schemes can contain special provisions.']
 ];
 L0.explain=applies
   ?`Before learning the manoeuvres, fix your vessel status in your mind. You are operating ${nm}, a ${len} ${type}. Rule 10(j) applies to this configured vessel, so you must not impede the safe passage of a power-driven vessel following a traffic lane, while continuing to comply with the other COLREGs.`
   :`Before learning the manoeuvres, fix your vessel status in your mind. You are operating ${nm}, a ${len} ${type}. Rule 10(j) does not apply solely by length to this configured vessel, but the rest of Rule 10 and the other COLREGs still apply.`;
 L0.q=applies
   ?`Does Rule 10(j)'s additional non-impeding duty apply to ${nm}?`
   :`Does Rule 10(j)'s additional non-impeding duty apply to ${nm} solely because of this vessel's configured length/type?`;
 L0.a=['YES','NO','ONLY IN DAYLIGHT'];L0.correct=applies?0:1;

 const L1=TSS_TUTORIAL[1];
 L1.rule=applies?'RULE 10(a) & (j)':'RULE 10(a)';
 L1.explain=`Do not begin by steering toward the first gap you see. Read the complete scheme. Identify both traffic directions, the separation feature, any inshore traffic zone, your intended route and the traffic that could be affected by you. Lane traffic does not gain automatic priority simply because it is in a TSS.${applies?' Your Rule 10(j) non-impeding duty also applies to this configured vessel.':''}`;
 L1.q='Does being in or near a TSS remove your normal COLREG responsibilities?';
 L1.a=['YES','NO','ONLY INSIDE AN ITZ'];L1.correct=1;

 const L2=TSS_TUTORIAL[2];
 L2.title='The Inshore Traffic Zone';
 L2.intro=itzAllowed
   ?`${nm} falls within a vessel category expressly permitted to use an Inshore Traffic Zone under Rule 10(d).`
   :'Rule 10(d) restricts general use of an Inshore Traffic Zone; learn which vessel categories are expressly permitted.';
 L2.facts=[
   ['YOUR PROFILE',itzAllowed
     ?`${nm} may use an ITZ under the vessel-category permission in Rule 10(d).`
     :`${nm} is not given the small-vessel/sailing-vessel ITZ permission by this profile alone.`],
   ['PERMITTED CATEGORIES','Vessels under 20 m, sailing vessels and vessels engaged in fishing are expressly permitted categories.'],
   ['NOT A ONE-WAY LANE','Within an ITZ you may encounter vessels heading in any direction.'],
   ['CHECK THE SCHEME','Use the chart and Sailing Directions for the particular TSS and local provisions.']
 ];
 L2.explain=itzAllowed
   ?`Rule 10(d) permits ${nm} to use an inshore traffic zone under the configured vessel category. But do not treat the ITZ as an empty or easier one-way traffic lane. Maintain a proper lookout and check the particular scheme.`
   :`Rule 10(d) contains specific permissions for use of an inshore traffic zone. Your configured vessel does not receive the under-20-metre or sailing-vessel permission, so study the actual scheme and any other applicable reason before using the ITZ.`;
 L2.q=itzAllowed?`May ${nm} use an Inshore Traffic Zone under the configured vessel category?`:'Which category is expressly permitted to use an Inshore Traffic Zone under Rule 10(d)?';
 L2.a=itzAllowed?['YES','NO','ONLY WITH A COMMERCIAL LICENCE']:['A vessel under 20 m','Every power-driven vessel over 20 m','Only a pilot vessel'];
 L2.correct=0;

 const L3=TSS_TUTORIAL[3];
 L3.rule=applies?'RULE 10(c) & (j)':'RULE 10(c) + COLLISION ASSESSMENT';
 L3.facts=[
   ['FIRST QUESTION','Can the crossing be avoided so far as practicable?'],
   ['TRAFFIC ASSESSMENT','Do not force an unsafe close-quarters situation with lane traffic.'],
   ['WAIT OUTSIDE','If the developing picture is unsuitable, remain clear rather than forcing the crossing.'],
   ['PLAN A GAP','Commit only when the traffic picture supports a safe, continuous crossing.']
 ];
 L3.explain=applies
   ?`Rule 10 says to avoid crossing traffic lanes so far as practicable. If you are obliged to cross, your Rule 10(j) duty means you must plan early so that a power-driven vessel following the lane is not forced to alter course or speed because of ${nm}. In this demonstration ${nm} waits outside until a safe gap develops.`
   :`Rule 10 says to avoid crossing traffic lanes so far as practicable. If you are obliged to cross, assess the traffic early and do not force an unsafe close-quarters situation. In this demonstration ${nm} waits outside until a safe gap develops.`;
 L3.q='If the developing traffic picture makes the crossing unsafe, what should you do?';
 L3.a=['Cross anyway because the heading will be 90 degrees','Wait and reassess rather than force the crossing','Enter the separation zone and stop'];L3.correct=1;

 const L6=TSS_TUTORIAL[6];
 L6.intro=`${nm} is not automatically prohibited from using a traffic lane by this training profile.`;
 L6.facts=[
   ['LEGAL PRINCIPLE','Rule 10 does not create a blanket ban on recreational vessels using a traffic lane.'],
   ['CORRECT FLOW','If using a lane, proceed in the appropriate lane in its general direction of traffic flow.'],
   ['KEEP CLEAR','So far as practicable keep clear of the separation line or zone.'],
   ['PROFILE DUTY',applies?'Rule 10(j) non-impeding duty applies to your configured vessel.':'Rule 10(j) does not apply solely by length/type to your configured vessel.']
 ];
 L6.explain=`If ${nm}'s passage uses a traffic lane, use the appropriate lane in the general direction of traffic flow and comply with Rule 10.${applies?' Your Rule 10(j) non-impeding duty also remains in force.':''} This beginner course does not present the shipping lane as a default route, and the chart and local scheme provisions must always be checked.`;
 L6.q=`If ${nm} is using a traffic lane, may the vessel steam against the arrows?`;
 L6.a=['YES','NO — use the appropriate lane in the general direction of traffic flow','ONLY IN DAYLIGHT'];L6.correct=1;

 const LF=TSS_TUTORIAL[TSS_TUTORIAL.length-1];
 LF.rule=applies?'YOUR VESSEL WATCH • FULL RULE 10':'YOUR VESSEL WATCH • FULL RULE 10';
 LF.title=`Take the watch: ${nm}`;
 LF.intro=`Put the Rule 10 lessons together using ${nm}.`;
 LF.explain=`This final demonstration uses ${nm}, your configured ${len} ${type}. The vessel remains outside while the traffic picture is unsuitable. When a safe gap develops, the vessel commits, holds the right-angle heading, continues the planned crossing, crossing each traffic lane without stopping except in an emergency, clears the far lane and continues the watch.${applies?' The Rule 10(j) non-impeding duty also applies to this configured vessel.':''}`;
 LF.q='What is the correct beginner sequence for a TSS crossing?';
 LF.a=['Enter first, then look for a gap','Plan early, assess traffic, cross on the Rule 10(c) heading, and keep applying the COLREGs','Stop in the separation zone between lanes'];LF.correct=1;
}

function initVesselProfile(){
 PW_VESSEL_PROFILE=loadVesselProfile();
 applyVesselBindings();
 personaliseTree(document.body);
 startPersonaliseObserver();
 adaptTSSExamForProfile();
 const seen=pwStoreGet(PW_VESSEL_SEEN);
 if(!seen)setTimeout(()=>openVesselSetup(true),250);
}

const AIS_TRAINING_TARGETS=window.PW_ORIGINAL_LIBRARIES.AIS_TRAINING_TARGETS;
let aisTargets=[],aisOwn={x:0,y:0,cog:12,hdg:12,sog:vesselCruiseSpeed()},aisSelected=null,aisRunning=true,aisLast=0,aisRAF=0,aisRange=6,aisNames=true,aisVectors=true,aisLesson=1,aisStartEpoch=Date.now();

function aisInit(){
 aisBindChartEvents();refreshAisCourseTasks();
 if(!aisTargets.length)aisReset();else{aisDraw();aisUpdatePanel()}
 if(!aisRAF){aisLast=performance.now();aisRAF=requestAnimationFrame(aisFrame)}
}
function aisReset(){
 aisTargets=AIS_TRAINING_TARGETS.map(t=>({...t}));
 aisSelected=null;aisOwn={x:0,y:0,cog:12,hdg:12,sog:vesselCruiseSpeed()};aisRunning=true;aisLast=performance.now();aisStartEpoch=Date.now();
 if($('aisPlayBtn'))$('aisPlayBtn').textContent='Ⅱ PAUSE';
 aisDraw();aisUpdatePanel();aisSetLesson(1);
 if(!aisRAF)aisRAF=requestAnimationFrame(aisFrame);
}
function aisTogglePlay(){aisRunning=!aisRunning;if($('aisPlayBtn'))$('aisPlayBtn').textContent=aisRunning?'Ⅱ PAUSE':'▶ PLAY'}
function aisCycleRange(){const r=[3,6,12];aisRange=r[(r.indexOf(aisRange)+1)%r.length];if($('aisRangeLabel'))$('aisRangeLabel').textContent=aisRange+' NM';aisDraw()}
function aisToggleNames(){aisNames=!aisNames;$('aisNamesBtn')?.classList.toggle('active',aisNames);$('aisNamesBtn').textContent=aisNames?'NAMES ON':'NAMES OFF';aisDraw()}
function aisToggleVectors(){aisVectors=!aisVectors;$('aisVectorsBtn')?.classList.toggle('active',aisVectors);$('aisVectorsBtn').textContent=aisVectors?'VECTORS ON':'VECTORS OFF';aisDraw()}
function aisSetLesson(n){
 aisLesson=n;document.querySelectorAll('.aisLessonStrip button').forEach((b,i)=>b.classList.toggle('active',i===n-1));
 const data={
  1:['Read a target','Tap any AIS target. Start with identity and type, then read range, bearing, COG, SOG and heading.','TASK • Select any moving vessel.'],
  2:['COG versus heading','Compare COG with heading. COG describes movement across the earth; heading is where the bow points. Tide/current/leeway can separate them.','TASK • Find a target where COG and heading differ by more than 5°.'],
  3:['CPA and TCPA','Select targets and compare CPA and TCPA. A small predicted CPA with a positive TCPA deserves attention, but the figures are predictions based on present motion.','TASK • Find the target with the dangerous CPA warning.'],
  4:['Class A and Class B','Class B commonly provides a reduced set of information and typically updates less often than Class A. Missing destination, ETA or draught on a Class B target can be normal.','TASK • Select a CLASS B target and inspect the missing voyage fields.'],
  5:['Stale and lost data','A lost target is not a vanished vessel. If reports stop, the last position becomes old. Continue proper lookout and use other sensors/means.','TASK • Select the grey LOST target and read its age.']
 }[n];
 $('aisLessonTitle').textContent=data[0];$('aisLessonText').textContent=data[1];$('aisLessonTask').textContent=data[2];
 refreshAisCourseTasks();
}
function aisFrame(ts){
 let dt=Math.min((ts-aisLast)/1000,.12);aisLast=ts;
 if(aisRunning){
   const scale=4; // calmer 4x training clock for easier target selection
   const ov=aisVel(aisOwn.cog,aisOwn.sog);
   aisOwn.x+=ov.x*dt*scale/3600;aisOwn.y+=ov.y*dt*scale/3600;
   aisTargets.forEach(t=>{
     if(t.lost){t.age+=dt*scale;return}
     const v=aisVel(t.cog,t.sog);t.x+=v.x*dt*scale/3600;t.y+=v.y*dt*scale/3600;t.age=Math.max(0.5,(t.age+dt*scale)%28);
   });
   aisPreventTargetCollisions();
   aisDraw();aisUpdatePanel();
 }
 aisRAF=requestAnimationFrame(aisFrame);
}
function aisVel(cog,sog){let r=cog*Math.PI/180;return{x:Math.sin(r)*sog,y:Math.cos(r)*sog}}

function aisPreventTargetCollisions(){
  const minTargetSep=.16; // NM
  const minOwnSep=.20;    // NM

  for(let i=0;i<aisTargets.length;i++){
    const a=aisTargets[i]; if(a.lost)continue;
    for(let j=i+1;j<aisTargets.length;j++){
      const b=aisTargets[j]; if(b.lost)continue;
      let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
      if(d>0 && d<minTargetSep){
        const push=(minTargetSep-d)/2;
        const ux=dx/d,uy=dy/d;
        a.x-=ux*push; a.y-=uy*push;
        b.x+=ux*push; b.y+=uy*push;
        a.sog=Math.max(2,a.sog*.985);
        b.sog=Math.max(2,b.sog*.985);
      }
    }
  }

  aisTargets.forEach(t=>{
    if(t.lost)return;
    let dx=t.x-aisOwn.x,dy=t.y-aisOwn.y,d=Math.hypot(dx,dy);
    if(d>0 && d<minOwnSep){
      const push=minOwnSep-d,ux=dx/d,uy=dy/d;
      t.x+=ux*push;t.y+=uy*push;
      t.sog=Math.max(2,t.sog*.98);
    }
  });
}

function aisVesselProfileSVG(t){
  const type=(t.type||'Cargo').toLowerCase();
  let body='#4b5960',superstructure='#ece9dd',accent='#263940';
  let shape='',extras='';

  if(type.includes('tanker')){
    body='#7d3e3e';
    shape='<path d="M70 96 L280 96 L305 118 L292 128 L58 128 L45 116 Z" fill="'+body+'"/>';
    extras='<rect x="92" y="78" width="130" height="11" rx="4" fill="#d7d4c9"/><rect x="230" y="60" width="35" height="36" fill="'+superstructure+'"/><rect x="239" y="48" width="10" height="12" fill="'+accent+'"/>';
  }else if(type.includes('passenger')){
    body='#315d7b';
    shape='<path d="M58 93 L285 93 L309 113 L300 128 L47 128 L38 115 Z" fill="'+body+'"/>';
    extras='<rect x="95" y="60" width="145" height="34" rx="6" fill="'+superstructure+'"/><rect x="112" y="47" width="108" height="15" rx="4" fill="#eef6f4"/><g fill="#24445b"><rect x="110" y="69" width="18" height="7"/><rect x="138" y="69" width="18" height="7"/><rect x="166" y="69" width="18" height="7"/><rect x="194" y="69" width="18" height="7"/></g>';
  }else if(type.includes('fishing')){
    body='#b06035';
    shape='<path d="M75 100 L255 100 L284 117 L271 129 L58 129 L45 118 Z" fill="'+body+'"/>';
    extras='<rect x="180" y="64" width="48" height="37" fill="'+superstructure+'"/><path d="M160 98 L160 45 M160 50 L130 74 M160 50 L195 72" stroke="'+accent+'" stroke-width="4"/><path d="M125 77 L102 103 M197 74 L225 101" stroke="'+accent+'" stroke-width="3"/>';
  }else if(type.includes('tug')){
    body='#5a4d40';
    shape='<path d="M88 99 L245 99 L269 116 L257 129 L72 129 L58 118 Z" fill="'+body+'"/>';
    extras='<rect x="145" y="61" width="58" height="39" rx="4" fill="'+superstructure+'"/><rect x="157" y="48" width="34" height="14" fill="#d9e6e3"/><rect x="168" y="31" width="8" height="18" fill="'+accent+'"/>';
  }else if(type.includes('pleasure')){
    body='#704f73';
    shape='<path d="M72 103 L248 103 L278 115 L260 126 L55 126 Z" fill="'+body+'"/>';
    extras='<path d="M130 102 L158 63 L208 63 L226 102 Z" fill="'+superstructure+'"/><rect x="166" y="44" width="6" height="59" fill="'+accent+'"/>';
  }else{
    shape='<path d="M52 92 L275 92 L310 112 L295 128 L40 128 L30 113 Z" fill="'+body+'"/>';
    extras='<g fill="#7a8b90"><rect x="76" y="66" width="34" height="26"/><rect x="115" y="66" width="34" height="26"/><rect x="154" y="66" width="34" height="26"/></g><rect x="224" y="57" width="42" height="36" fill="'+superstructure+'"/><rect x="238" y="40" width="11" height="18" fill="'+accent+'"/>';
  }

  return `<svg viewBox="0 0 340 160" aria-label="${t.type} vessel illustration">
    <rect width="340" height="160" fill="#9dcbd6"/>
    <path d="M0 119 C60 112 110 122 170 116 S280 120 340 112 V160 H0 Z" fill="#477f95"/>
    <path d="M0 127 C55 121 110 132 170 125 S280 130 340 121" fill="none" stroke="#d8eff3" stroke-width="2" opacity=".8"/>
    <circle cx="286" cy="35" r="18" fill="#f0df9f" opacity=".7"/>
    ${shape}${extras}
    <path d="M45 130 C120 137 215 137 300 130" stroke="#eef7f8" stroke-width="3" fill="none" opacity=".85"/>
  </svg>`;
}

function aisRel(t){
 const dx=t.x-aisOwn.x,dy=t.y-aisOwn.y,range=Math.hypot(dx,dy),bearing=(Math.atan2(dx,dy)*180/Math.PI+360)%360;
 const vo=aisVel(aisOwn.cog,aisOwn.sog),vt=aisVel(t.cog,t.sog),rv={x:vt.x-vo.x,y:vt.y-vo.y},vv=rv.x*rv.x+rv.y*rv.y;
 let tcpa=vv?-(dx*rv.x+dy*rv.y)/vv*60:0,cpa=range;
 if(vv){let h=Math.max(0,tcpa/60),cx=dx+rv.x*h,cy=dy+rv.y*h;cpa=Math.hypot(cx,cy)}
 return{range,bearing,cpa,tcpa};
}
function aisDanger(t){
 const r=aisRel(t);return !t.lost&&r.tcpa>0&&r.tcpa<30&&r.cpa<.5;
}
function aisTypeLabel(t){return t.type==='Tug'?'Tug / special craft':t.type}
function aisMapXY(x,y){
 const cx=470,cy=295,scale=270/aisRange;
 return [cx+(x-aisOwn.x)*scale,cy-(y-aisOwn.y)*scale];
}
function aisDraw(){
 const box=$('aisChart');if(!box)return;
 const own=aisMapXY(aisOwn.x,aisOwn.y);
 let rings=[.25,.5,.75,1].map(f=>`<circle cx="470" cy="295" r="${270*f}" class="aisRangeRing"/><text x="${470+6}" y="${295-270*f+13}" font-size="8" fill="#486b6e">${(aisRange*f).toFixed(f===1?0:1)} NM</text>`).join('');
 let grid='';for(let x=65;x<940;x+=90)grid+=`<line x1="${x}" y1="0" x2="${x}" y2="590" class="aisGrid"/>`;for(let y=25;y<590;y+=70)grid+=`<line x1="0" y1="${y}" x2="940" y2="${y}" class="aisGrid"/>`;
 let land=`<path d="M0 0 H150 C185 50 135 100 178 148 C205 180 145 230 180 270 C212 308 150 354 180 400 C207 438 165 485 195 530 L170 590 H0 Z" class="aisMapLand"/>
           <path d="M940 0 H850 C823 55 865 105 828 160 C798 205 850 248 820 305 C790 355 840 404 810 460 C790 500 818 550 790 590 H940 Z" class="aisMapLand"/>
           <path d="M0 102 C190 130 335 105 470 125 S750 145 940 110" class="aisDepth"/>
           <path d="M0 190 C200 225 360 200 525 215 S790 225 940 190" class="aisDepth"/>
           <path d="M0 480 C250 455 390 485 545 470 S760 450 940 480" class="aisDepth"/>`;
 let targetSvg=aisTargets.map(t=>{
   const [x,y]=aisMapXY(t.x,t.y);if(x<-40||x>980||y<-40||y>630)return '';
   const danger=aisDanger(t),sel=aisSelected===t.id;
   const vecLen=Math.min(90,18+t.sog*3.2),rad=t.cog*Math.PI/180,vx=Math.sin(rad)*vecLen,vy=-Math.cos(rad)*vecLen;
   const rot=t.cog;
   return `<g class="aisTarget ${danger?'danger':''} ${t.lost?'lost':''} ${sel?'selected':''}" data-ais-id="${t.id}" role="button" tabindex="0">
     <circle cx="${x}" cy="${y}" r="22" class="aisTargetHit" data-ais-id="${t.id}"/>
     ${aisVectors&&!t.lost?`<line x1="${x}" y1="${y}" x2="${x+vx}" y2="${y+vy}" class="aisVector" stroke="${danger?'#d92727':t.colour}"/>`:''}
     <g transform="translate(${x} ${y}) rotate(${rot})"><polygon points="0,-10 7,9 0,5 -7,9" fill="${danger?'#ff352f':t.colour}"/></g>
     ${t.lost?`<path d="M${x-8} ${y-8} L${x+8} ${y+8} M${x+8} ${y-8} L${x-8} ${y+8}" stroke="#68777b" stroke-width="3"/>`:''}
     ${aisNames?`<text x="${x+10}" y="${y-8}" class="aisTargetLabel">${t.name}</text><text x="${x+10}" y="${y+4}" class="aisTargetSub">${t.sog.toFixed(1)} kn • ${String(Math.round(t.cog)).padStart(3,'0')}°</text>`:''}
   </g>`;
 }).join('');
 let dangerTarget=aisTargets.find(aisDanger),cpa='';
 if(dangerTarget){
   const r=aisRel(dangerTarget),[tx,ty]=aisMapXY(dangerTarget.x,dangerTarget.y);
   cpa=`<line x1="${own[0]}" y1="${own[1]}" x2="${tx}" y2="${ty}" class="aisCpaLine" opacity=".28"/>`;
 }
 box.innerHTML=`<svg viewBox="0 0 940 590">
   <rect width="940" height="590" class="aisMapWater"/>
   ${grid}${land}
   <path d="M205 295 H735" class="aisNavLine"/><text x="220" y="286" font-size="8" fill="#526f72">TRAINING FAIRWAY</text>
   ${rings}${cpa}${targetSvg}
   <g transform="translate(${own[0]} ${own[1]}) rotate(${aisOwn.hdg})"><path d="M0,-16 L9,12 L0,8 L-9,12 Z" class="aisOwn"/></g>
   <line x1="${own[0]}" y1="${own[1]}" x2="${own[0]+Math.sin(aisOwn.cog*Math.PI/180)*72}" y2="${own[1]-Math.cos(aisOwn.cog*Math.PI/180)*72}" class="aisOwnVector"/>
   <text x="${own[0]+12}" y="${own[1]+22}" font-size="10" fill="#7a1c1c" font-weight="900">${vesselNameUpper()}</text>
   <text x="15" y="22" font-size="9" fill="#34555b">SIMULATED TRAINING CHART • NOT FOR NAVIGATION</text>
  </svg>`;
 let dangerCount=aisTargets.filter(aisDanger).length;
 $('aisTargetCount').textContent=aisTargets.length;
 $('aisAlarmState').textContent=dangerCount?`${dangerCount} DANGER`:'CLEAR';
 $('aisAlarmState').className=dangerCount?'warn':'';
 $('aisOwnCog').textContent=String(Math.round(aisOwn.cog)).padStart(3,'0')+'°';
 $('aisOwnSog').textContent=aisOwn.sog.toFixed(1)+' kn';
 let d=new Date(aisStartEpoch+(performance.now()-aisLast)*10); // display-only clock
 $('aisClock').textContent=new Date().toISOString().slice(11,19)+' UTC';
}
function aisSelect(id){
 aisSelected=id;
 const t=aisTargets.find(x=>x.id===id);
 if(t){
   const r=aisRel(t),diff=Math.abs((((t.cog-t.hdg)+540)%360)-180);
   if(!t.lost)markAisTask(1);
   if(diff>5)markAisTask(2);
   if(aisDanger(t))markAisTask(3);
   if(t.cls==='B')markAisTask(4);
   if(t.lost)markAisTask(5);
 }
 aisUpdatePanel();refreshAisCourseTasks();aisDraw();
}
function aisBindChartEvents(){
 const chart=$('aisChart');if(!chart||chart.dataset.aisBound==='1')return;
 chart.dataset.aisBound='1';

 const pick=(ev)=>{
   const el=ev.target?.closest?.('[data-ais-id]');
   if(!el)return;
   ev.preventDefault();
   ev.stopPropagation();
   aisSelect(el.getAttribute('data-ais-id'));
 };

 chart.addEventListener('click',pick);
 chart.addEventListener('pointerup',pick,{passive:false});
 chart.addEventListener('touchend',pick,{passive:false});

 chart.addEventListener('keydown',ev=>{
   if(ev.key!=='Enter'&&ev.key!==' ')return;
   const el=ev.target?.closest?.('[data-ais-id]');
   if(!el)return;
   ev.preventDefault();
   aisSelect(el.getAttribute('data-ais-id'));
 });
}
function aisUpdatePanel(){
 const panel=$('aisTargetPanel');if(!panel)return;
 const t=aisTargets.find(x=>x.id===aisSelected);
 if(!t){panel.innerHTML=`<div class="aisTargetEmpty"><b>NO TARGET SELECTED</b><span>Tap a vessel triangle on the chart.</span></div>`;return}
 const r=aisRel(t),danger=aisDanger(t);
 const diff=Math.abs((((t.cog-t.hdg)+540)%360)-180);
 panel.innerHTML=`<div class="aisTargetHead"><div><div class="ver">${aisTypeLabel(t).toUpperCase()} • AIS CLASS ${t.cls}</div><h3>${t.name}</h3></div><span class="aisTargetClass">CLASS ${t.cls}</span></div>
  <div class="aisVesselPhoto">${aisVesselProfileSVG(t)}</div>
  <div class="aisVesselCaption"><b>PROJECT WATCH VESSEL PROFILE</b><span>Original training illustration • fictional vessel</span></div>
  <div class="aisTargetGrid">
   <div><small>MMSI</small><b>${t.mmsi}</b></div><div><small>CALL SIGN</small><b>${t.call||'—'}</b></div>
   <div><small>RANGE</small><b>${r.range.toFixed(2)} NM</b></div><div><small>BEARING</small><b>${String(Math.round(r.bearing)).padStart(3,'0')}°T</b></div>
   <div><small>COG</small><b>${String(Math.round(t.cog)).padStart(3,'0')}°</b></div><div><small>HEADING</small><b>${String(Math.round(t.hdg)).padStart(3,'0')}°</b></div>
   <div><small>SOG</small><b>${t.sog.toFixed(1)} kn</b></div><div><small>COG/HDG DIFF</small><b>${Math.round(diff)}°</b></div>
   <div><small>CPA</small><b>${r.cpa.toFixed(2)} NM</b></div><div><small>TCPA</small><b>${r.tcpa>0?r.tcpa.toFixed(1)+' min':'PAST'}</b></div>
   <div><small>NAV STATUS</small><b>${t.status||'Not transmitted / not in Class B set'}</b></div><div><small>REPORT AGE</small><b>${Math.round(t.age)} s${t.lost?' • LOST':''}</b></div>
   <div><small>DESTINATION</small><b>${t.dest||'—'}</b></div><div><small>ETA</small><b>${t.eta||'—'}</b></div>
   <div><small>DRAUGHT</small><b>${t.draught||'—'}</b></div><div><small>SIZE</small><b>${t.len} × ${t.beam}</b></div>
  </div>
  <div class="${danger?'aisTargetDanger':'aisTargetGood'}">${t.lost?'LOST / STALE AIS TARGET':danger?'DANGEROUS PREDICTED APPROACH':'NO TRAINING DANGER FLAG'}</div>
  <div class="aisTargetNote">${t.cls==='B'?'Class B example: some Class A voyage/status fields are deliberately absent. ':''}${t.lost?'This is the last received position. The vessel may still be present and moving. ':''}CPA/TCPA are predictions from present motion and must be checked against the full traffic picture.</div>
  <div class="aisTrafficNote">Training traffic is intentionally slowed. Targets may enter close-quarters situations for learning, but the simulation now prevents fictional vessels from physically colliding with each other or the training vessel.</div>`;
}

const MODULE_META=window.PW_ORIGINAL_LIBRARIES.MODULE_META;
function updateModuleContext(name){
 const box=$('moduleContext'),m=MODULE_META[name]||MODULE_META.home;
 if(!box)return;
 if(name==='home'){
   box.classList.remove('show');
   return;
 }
 $('moduleContextNo').textContent=m.no;
 $('moduleContextKicker').textContent='PROJECT WATCH • TRAINING MODULE';
 $('moduleContextTitle').textContent=m.title;
 $('moduleContextDesc').textContent=m.desc;
 $('moduleContextState').textContent=m.state;
 box.classList.add('show');
}

function updateHeaderNav(name){
 const h=$('hdrMode'); if(!h)return;
 if(name==='home'){
   pwLibraryContext=false;
   h.textContent=vesselNameUpper();
   h.classList.remove('backBtn');
   h.onclick=null;
   h.removeAttribute('role');
   h.removeAttribute('tabindex');
   h.onkeydown=null;
 }else{
   const backToLibrary = pwLibraryContext && name!=='library';
   h.textContent=backToLibrary?'← BACK':'← HOME';
   h.classList.add('backBtn');
   h.setAttribute('role','button');
   h.setAttribute('tabindex','0');
   h.onclick=backToLibrary?returnToLibrary:()=>showModule('home');
   h.onkeydown=(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();h.click();}};
 }
}

function enhanceHomeHub(){
 document.querySelectorAll('.homeHubBtn[data-home-img]').forEach(btn=>{
   const key=btn.dataset.homeImg,img=btn.querySelector('.homeHubVisual img');
   if(!img||img.dataset.ready==='1')return;
   img.dataset.ready='1';img.src=licensedImageSrc(key);
   img.onerror=()=>{img.style.display='none'};
   cacheLicensedImage(key);
 });
 document.querySelectorAll('.vesselModeThumb[data-mode-img]').forEach(box=>{
   const key=box.dataset.modeImg,img=box.querySelector('img');
   if(!img||img.dataset.ready==='1')return;
   img.dataset.ready='1';img.src=licensedImageSrc(key);
   img.onerror=()=>{img.style.display='none'};
   cacheLicensedImage(key);
 });
}

function showModule(name,btn){
 stopCourseSpeech();
 tutorialActive=false;clearTutorialFocus();if($('tutorialCoach'))$('tutorialCoach').classList.remove('show');
 updateHeaderNav(name);
 updateModuleContext(name);

 if(name==='home')setTimeout(enhanceHomeHub,0);
 if(name==='lights')setTimeout(bvRender,0);
 if(name==='buoyage')setTimeout(()=>{renderBuoys();if(buoyIndex<0)nextBuoyQuestion();else renderBuoyChallenge();},0);
 if(name==='ais')setTimeout(()=>{aisInit();},0);

 document.querySelectorAll('.appPage.active,.screen.active').forEach(p=>p.classList.remove('active'));

 let id=name==='home'?'homePage':(name==='scenarios'?'handover':name+'Page');
 let page=document.getElementById(id);
 if(page)page.classList.add('active');
 if(name==='scenarios')updateScenarioStage('brief');

 document.querySelectorAll('#homePage .homeHubBtn').forEach(b=>b.classList.remove('active'));
 if(btn&&name!=='home')btn.classList.add('active');
 window.scrollTo({top:0,behavior:'smooth'});
}
function filterRules(part){
 document.querySelectorAll('#ruleList .ruleRow').forEach(r=>{
  let t=r.querySelector('small').textContent;
  r.style.display=(part==='all'||t.startsWith(part)||(part==='Part E'&&(t.startsWith('Part E')||t.startsWith('Part F'))))?'block':'none';
 });
}

function enc(){
  let p={x:tgt.x-own.x,y:tgt.y-own.y},a=vel(own),b=vel(tgt),rv={x:b.x-a.x,y:b.y-a.y};
  let vv=rv.x*rv.x+rv.y*rv.y,H=vv?-(p.x*rv.x+p.y*rv.y)/vv:0,q=Math.max(H,0);
  let fx=p.x+rv.x*q,fy=p.y+rv.y*q,B=norm(Math.atan2(p.x,p.y)*180/Math.PI);
  return{r:Math.hypot(p.x,p.y),b:B,rel:norm(B-own.h),H,cpa:Math.hypot(fx,fy)}
}

function cross2(a,b){return a.x*b.y-a.y*b.x}
function projectedLineIntersection(){
  let vo=vel(own), vt=vel(tgt), r={x:tgt.x-own.x,y:tgt.y-own.y};
  let den=cross2(vo,vt);
  if(Math.abs(den)<1e-8)return null;
  let tOwn=cross2(r,vt)/den;
  let tTgt=cross2(r,vo)/den;
  return {tOwn,tTgt,deltaMin:(tTgt-tOwn)*60};
}
function manoeuvreQuality(d){
  const s=SCENARIOS[scenarioId];
  if(s.kind!=='cross_giveway') return {code:'',title:'',detail:'',unsafe:false};
  let ix=projectedLineIntersection();
  let result={code:'',title:'',detail:'',unsafe:false};
  if(!ix || ix.tOwn<=0 || ix.tTgt<=0)return result;

  let crossesAhead = ix.tOwn < ix.tTgt;
  let gap = Math.abs(ix.deltaMin);

  if(crossesAhead && d.H>0 && d.cpa<0.25 && gap<3.0){
    result={
      code:'close_cross_ahead',
      title:'UNSAFE ACTION — CLOSE CROSSING AHEAD',
      detail:`Present projection takes Watch One ahead of the stand-on vessel with CPA ${d.cpa.toFixed(2)} NM. Reassess course and/or speed.`,
      unsafe:true
    };
  } else if(crossesAhead && d.H>0 && d.cpa<0.5 && gap<5.0){
    result={
      code:'cross_ahead',
      title:'CAUTION — CROSSING AHEAD',
      detail:`Watch One is projected to cross ahead. Rule 15 says the give-way vessel should, if circumstances admit, avoid crossing ahead.`,
      unsafe:true
    };
  }
  return result;
}
function handleQuality(d){
  let box=$('qualityAlert');
  if(d.r>0.50){
    box.style.display='none';
    lastQuality='';
    return;
  }
  let q=manoeuvreQuality(d);
  if(!q.unsafe){
    box.style.display='none';
    lastQuality='';
    return;
  }
  if(q.code!==lastQuality){
    qualityEvents.push({t:elapsed,code:q.code,title:q.title,detail:q.detail,cpa:d.cpa});
    addEvent('quality',q.title);
    lastQuality=q.code;
  }
  if(trainingMode==='guided'){
    box.style.display='block';
    box.innerHTML=q.title+`<div class="qualityDetail">${q.detail}</div>`;
    if(q.code==='close_cross_ahead'){
      speakWarningOnce('quality_close_cross_ahead','Unsafe action. Close crossing ahead of the stand-on vessel.');
    }else if(q.code==='cross_ahead'){
      speakWarningOnce('quality_cross_ahead','Caution. You are projected to cross ahead of the stand-on vessel.');
    }
  } else {
    box.style.display='none';
  }
}

function sector(r){
  let a=((r+180)%360)-180;
  if(Math.abs(a)<=10)return'AHEAD';
  if(a>10&&a<=80)return'STARBOARD BOW';
  if(a>80&&a<100)return'STARBOARD BEAM';
  if(a>=100&&a<170)return'STARBOARD QUARTER';
  if(Math.abs(a)>=170)return'ASTERN';
  if(a<-10&&a>=-80)return'PORT BOW';
  if(a<-80&&a>-100)return'PORT BEAM';
  return'PORT QUARTER';
}
function fmt(x){let m=Math.floor(x/60),s=Math.floor(x%60);return m+':'+String(s).padStart(2,'0')}
function addEvent(type,text){events.push({t:elapsed,type,text});$('log').innerHTML='T+'+fmt(elapsed)+' — '+text+'<br>'+$('log').innerHTML}

let audioCtx=null;
function armAudio(){
  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    if(AC && !audioCtx) audioCtx=new AC();
    if(audioCtx && audioCtx.state==='suspended') audioCtx.resume();
    beep(660,.08,.05);
    speakMarine('Audio alerts armed');
  }catch(e){}
}
function beep(freq=880,duration=.18,delay=0){
  if(!audioCtx)return;
  let o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type='sine';o.frequency.value=freq;g.gain.value=.0001;
  o.connect(g);g.connect(audioCtx.destination);
  let st=audioCtx.currentTime+delay;
  g.gain.exponentialRampToValueAtTime(.22,st+.01);
  g.gain.exponentialRampToValueAtTime(.0001,st+duration);
  o.start(st);o.stop(st+duration+.02);
}
function spokenSector(s){
  return s.toLowerCase().replace('bow','bough');
}
let marineVoices=[],marineVoice=null,marineVoiceReady=false;

function scoreMarineVoice(v){
  const name=(v.name||'').toLowerCase(),lang=(v.lang||'').toLowerCase();
  let s=0;
  if(lang==='en-gb')s+=120;
  else if(lang.startsWith('en-gb'))s+=115;
  else if(lang.startsWith('en-'))s+=55;
  else if(lang.startsWith('en'))s+=35;
  const preferred=[
    ['serena',60],['daniel',58],['malcolm',56],['stephanie',54],
    ['oliver',52],['arthur',50],['martha',48],['kate',46],
    ['siri',44],['premium',42],['enhanced',40],['natural',38],
    ['neural',36],['google uk english',34],['microsoft',22]
  ];
  preferred.forEach(([n,w])=>{if(name.includes(n))s+=w});
  ['whisper','bells','bad news','good news','boing','bubbles','cellos',
   'deranged','hysterical','organ','trinoids','zarvox','wobble'].forEach(n=>{
    if(name.includes(n))s-=150;
  });
  if(v.default)s+=4;
  if(v.localService)s+=3;
  return s;
}
function loadMarineVoices(){
  if(!('speechSynthesis' in window))return;
  marineVoices=window.speechSynthesis.getVoices()||[];
  if(!marineVoices.length)return;
  marineVoice=[...marineVoices].sort((a,b)=>scoreMarineVoice(b)-scoreMarineVoice(a))[0]||null;
  marineVoiceReady=!!marineVoice;
}
if('speechSynthesis' in window){
  loadMarineVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged',loadMarineVoices);
  if(window.speechSynthesis.onvoiceschanged===null)window.speechSynthesis.onvoiceschanged=loadMarineVoices;
}
function prepareMarineSpeech(text){
  return personalisedString(String(text||''))
    .replace(/\bCPA\b/g,'C P A')
    .replace(/\bTCPA\b/g,'T C P A')
    .replace(/\bCOLREGS?\b/gi,'collision regulations')
    .replace(/\bNM\b/g,'nautical miles')
    .replace(/\bRule\s+(\d+)\b/gi,'Rule $1')
    .replace(/\s*•\s*/g,'. ')
    .replace(/\s+/g,' ')
    .trim();
}
function speakMarine(text,kind='instruction'){
  if(!('speechSynthesis' in window)||!text)return;
  loadMarineVoices();
  const synth=window.speechSynthesis;
  synth.cancel();
  const u=new SpeechSynthesisUtterance(prepareMarineSpeech(text));
  if(marineVoice)u.voice=marineVoice;
  u.lang=(marineVoice&&marineVoice.lang)||'en-GB';
  u.volume=1;
  if(kind==='warning'){u.rate=0.96;u.pitch=0.98}
  else if(kind==='confirmation'){u.rate=0.91;u.pitch=1.0}
  else{u.rate=0.88;u.pitch=1.0}
  synth.speak(u);
  return u;
}
function collisionSound(){
  beep(880,.16,0);beep(880,.16,.25);beep(660,.28,.5);
}
function speakWarningOnce(key,text,withAlarm=true){
  if(spokenWarnings.has(key)) return;
  spokenWarnings.add(key);
  if(withAlarm) collisionSound();
  speakMarine(text);
}

function setTrainingMode(m){
  trainingMode=m;
  ['guided','watch','exam'].forEach(x=>{
    let el=$(x+'Mode');
    if(el) el.className=(x===m?'active':'');
  });
  updateScenarioBrief();
}

function startWatch(){
  try{
    armAudio();
    initScenario();
    go('watch');
    draw();
    update();
    addEvent('handover','Watch accepted — '+(ownVesselMode==='sail'?'sailing vessel, machinery off':'power-driven vessel'));
    if(trainingMode==='guided'){
      setTimeout(()=>speakMarine('Guided watch active. Voice collision warnings armed.','confirmation'),180);
    }
    requestAnimationFrame(()=>{draw(); if(!running) toggle();});
  }catch(err){
    console.error('Project Watch start error',err);
    alert('Project Watch could not start this scenario: '+err.message);
  }
}

function toggle(){if(crashed)return;running=!running;$('play').textContent=running?'❚❚ PAUSE':'▶ PLAY';lastTs=0;if(running)requestAnimationFrame(tick)}
function setRudder(v){
 v=Math.max(-35,Math.min(35,Math.round(v)));rudder=v;
 let label=v===0?'MIDSHIPS':(v<0?'PORT ':'STARBOARD ')+Math.abs(v)+'°';
 if($('rudderText'))$('rudderText').textContent=label;
 updateHelmControl(v);
 if(firstAction===null&&v!==0)firstAction=elapsed;
 addEvent('helm','Rudder '+label)
}
function nudgeRudder(d){setRudder(rudder+d)}
function updateHelmControl(v=rudder){
 let t=$('helmTrack'),th=$('helmThumb'),f=$('helmFill');if(!t||!th||!f)return;
 let pct=(v+35)/70*100;th.style.left=pct+'%';
 if(v<0){f.style.left=pct+'%';f.style.width=(50-pct)+'%'}else{f.style.left='50%';f.style.width=(pct-50)+'%'}
 t.setAttribute('aria-valuenow',v)
}
function initHelmControl(){
 let t=$('helmTrack');if(!t||t.dataset.ready)return;t.dataset.ready='1';let drag=false;
 function val(e){let r=t.getBoundingClientRect(),x=Math.max(0,Math.min(r.width,e.clientX-r.left));return -35+x/r.width*70}
 t.addEventListener('pointerdown',e=>{drag=true;t.setPointerCapture(e.pointerId);setRudder(val(e))});
 t.addEventListener('pointermove',e=>{if(drag)setRudder(val(e))});
 t.addEventListener('pointerup',()=>drag=false);t.addEventListener('pointercancel',()=>drag=false);
 t.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();setRudder(rudder-1)}else if(e.key==='ArrowRight'){e.preventDefault();setRudder(rudder+1)}else if(e.key==='Home'||e.key==='0'){e.preventDefault();setRudder(0)}});
 updateHelmControl()
}
function setThrottle(v){
  if(ownVesselMode==='sail'){
    addEvent('control','Engine command ignored — sailing mode has machinery OFF');
    return;
  }
  if(firstAction===null)firstAction=elapsed;
  cmdSpeed=v;$('cmdSpeedText').textContent=v.toFixed(1)+' kn';addEvent('engine','Engine '+v.toFixed(1)+' kn')
}
function updateTargetBehaviour(ds){
  const s=SCENARIOS[scenarioId];
  let d=enc();

  if(s.kind==='overtaken'){
    if(!targetAvoiding && d.H>0 && d.r<=1.20){
      targetAvoiding=true;
      targetRudder=20;
      addEvent('target','Overtaking vessel takes avoiding action');
    }
  }

  if(s.kind==='cross_standon'){
    if(!targetAvoiding && d.H>0 && d.r<=1.20){
      targetAvoiding=true;
      targetRudder=22;
      addEvent('target','Give-way vessel takes early avoiding action');
    }
  }

  if(s.kind==='head_on'){
    if(!targetAvoiding && d.H>0 && d.r<=1.40){
      targetAvoiding=true;
      targetRudder=20;
      addEvent('target','Other vessel alters to starboard');
    }
  }

  if(s.kind==='sail_standon'){
    if(!targetAvoiding && d.H>0 && d.r<=1.20){
      targetAvoiding=true;
      targetRudder=22;
      addEvent('target','Give-way vessel takes avoiding action for sailing vessel');
    }
  }

  if(!targetAvoiding)return;

  let targetTargetROT=(targetRudder/20)*24*(tgt.s/10);
  targetROT += (targetTargetROT-targetROT)*Math.min(1,ds/10);
  tgt.h=norm(tgt.h+targetROT*(ds/60));

  let nd=enc();
  if(nd.cpa>=0.35 && d.r<1.10){
    targetRudder=0;
    targetROT*=Math.pow(.975,ds);
  }
}

function tick(ts){
  if(!running)return;
  if(!lastTs)lastTs=ts;
  let ds=(ts-lastTs)/1000*8;lastTs=ts;elapsed+=ds;
  let rudderRate=3.5; // deg/sec of simulated time; provisional prototype tune
  let rd=rudder-actualRudder;
  actualRudder += Math.sign(rd)*Math.min(Math.abs(rd),rudderRate*ds);

  let accel=.018*ds;
  if(own.s<cmdSpeed)own.s=Math.min(cmdSpeed,own.s+accel); else own.s=Math.max(cmdSpeed,own.s-accel);

  let speedFactor=Math.max(0,own.s/7);
  let targetROT=(actualRudder/30)*30*speedFactor; // deg/min at 30° rudder and 7 kn; provisional training tune
  let tau=12; // sec time constant; quicker displacement-vessel yaw response for prototype testing
  rotRate += (targetROT-rotRate)*Math.min(1,ds/tau);

  if(Math.abs(actualRudder)<1) rotRate *= Math.pow(.988,ds);

  own.s=Math.max(0,own.s*(1-Math.min(.004*Math.abs(actualRudder)/30*ds,.06)));

  own.h=norm(own.h + rotRate*(ds/60));

  updateTargetBehaviour(ds);
  let a=vel(own),b=vel(tgt),hr=ds/3600;
  own.x+=a.x*hr;own.y+=a.y*hr;tgt.x+=b.x*hr;tgt.y+=b.y*hr;
  ownHist.push([own.x,own.y]);tgtHist.push([tgt.x,tgt.y]);
  update();
  if(running)requestAnimationFrame(tick)
}
function alarms(d){
  let box=$('alert');
  if(d.r>0.50){
    box.style.display='none';
    lastAlarm='';
    return;
  }
  let level='';
  if(d.r<=.02) level='COLLISION';
  else if(d.H>0&&d.cpa<.05&&d.H*60<2.5) level='COLLISION ALERT';
  else if(d.H>0&&d.cpa<.15&&d.H*60<5) level='WARNING';
  else if(d.H>0&&d.cpa<.4&&d.H*60<10) level='CAUTION';
  if(level){
    box.style.display='block';
    box.textContent=level+' — '+sector(d.rel);
    if(level!==lastAlarm){
      addEvent('alert',level+' — '+sector(d.rel));
      if(trainingMode==='guided'){
        const sec=spokenSector(sector(d.rel));
        const voiceText =
          level==='CAUTION' ? 'Caution. Close approach developing. '+sec :
          level==='WARNING' ? 'Warning. Risk of collision. '+sec :
          level==='COLLISION ALERT' ? 'Collision alert. '+sec :
          'Collision. '+sec;
        speakWarningOnce('alarm_'+level+'_'+sector(d.rel),voiceText,true);
      }else if(level==='COLLISION ALERT'||level==='COLLISION'){
        if(!spokenWarnings.has('tone_'+level)){
          spokenWarnings.add('tone_'+level);
          collisionSound();
        }
      }
      lastAlarm=level;
    }
  } else {
    box.style.display='none';
    lastAlarm='';
  }
  if(level==='COLLISION'&&!crashed){
    crashed=true;
    running=false;
    $('play').textContent='▶ PLAY';
    addEvent('outcome','Collision');
    setTimeout(()=>endWatch('collision'),350);
  }
}
function rot(x,y,a){let r=rad(a),c=Math.cos(r),s=Math.sin(r);return[x*c-y*s,x*s+y*c]}
function draw(){
  let A=orientation==='north'?0:(orientation==='course'?0:-own.h),center=orientation!=='north',sc=.75;
  function P(p){let x=p[0]-(center?own.x:0),y=-(p[1]-(center?own.y:0)),q=rot(x,y,A);return[q[0]*sc,q[1]*sc]}
  let o=P([own.x,own.y]),g=P([tgt.x,tgt.y]);
  $('og').setAttribute('transform',`translate(${o[0]} ${o[1]}) rotate(${own.h+A})`);
  $('tg').setAttribute('transform',`translate(${g[0]} ${g[1]}) rotate(${tgt.h+A})`);
  $('ot').setAttribute('points',ownHist.map(P).map(p=>p.join(',')).join(' '));
  $('tt').setAttribute('points',tgtHist.map(P).map(p=>p.join(',')).join(' '));
  $('northMark').setAttribute('transform',`rotate(${-A} 0 -3.6)`);
}
function update(){
  let d=enc();

  if(d.r < minSep){
    minSep=d.r;
    minSepTime=elapsed;
  }
  const clearOfMinimum = d.r > minSep + 0.0005;
  if(!crashed && !autoEnding && clearOfMinimum && elapsed-minSepTime>=10){
    autoEnding=true;
    running=false;
    $('play').textContent='▶ PLAY';
    addEvent('cpa','Actual closest point of approach passed');
    addEvent('outcome','Scenario ended automatically 10 seconds after CPA');
    setTimeout(()=>endWatch('postCPA'),250);
    return;
  }
  $('hdg').textContent=own.h.toFixed(0)+'°';$('spd').textContent=own.s.toFixed(1)+' kn';$('rng').textContent=d.r.toFixed(2)+' NM';
  $('sector').textContent=sector(d.rel);$('cpa').textContent=d.cpa.toFixed(2)+' NM';$('tcpa').textContent=d.H>0?(d.H*60).toFixed(1)+' min':'past';
  let rTxt=Math.abs(actualRudder)<.5?'0°':(actualRudder<0?'P ':'S ')+Math.abs(actualRudder).toFixed(0)+'°';
  $('rudderRead').textContent=rTxt;
  $('rudderPointer').style.transform=`rotate(${actualRudder*1.8}deg)`;
  let rotTxt=Math.abs(rotRate)<.05?'0.0°/min':(rotRate<0?'P ':'S ')+Math.abs(rotRate).toFixed(1)+'°/min';
  $('rotRead').textContent=rotTxt;
  $('rotPointer').style.transform=`rotate(${Math.max(-50,Math.min(50,rotRate*3.2))}deg)`;

  if(d.r>0.50){
    $('state').textContent='Maintain the watch';
    $('state').className='status ok';
    $('stateNote').textContent='No simulator warning zone has been entered. Continue systematic observation.';
  } else if(d.H>0&&d.cpa<.5){
    $('state').textContent='Close approach developing';
    $('state').className='status warn';
    $('stateNote').textContent=(trainingMode==='guided'?'Guided coaching is active.':'No manoeuvre coaching is being shown during this watch.');
  } else {
    $('state').textContent='Monitor the situation';
    $('state').className='status ok';
    $('stateNote').textContent='Maintain a proper lookout and continue assessment.';
  }
  handleQuality(d);alarms(d);draw()
}
function endWatch(reason='manual'){
  running=false;$('play').textContent='▶ PLAY';
  let d=enc();
  if(!crashed && reason==='manual')addEvent('outcome','Watch ended by user');
  buildDebrief(d);go('debrief')
}

function calculateTrainingScore(){
  const kind=SCENARIOS[scenarioId].kind;

  if(crashed || minSep<=0.02) return {score:1,label:'Collision / unacceptable outcome'};

  let closeAhead = qualityEvents.some(q=>q.code==='close_cross_ahead');
  let crossedAhead = qualityEvents.some(q=>q.code==='cross_ahead');
  let actionRatio = firstAction===null || initialTCPA<=0 ? 0 : Math.max(0,1-(firstAction/60)/(initialTCPA*60));

  if(kind==='power_give_sail' || kind==='sail_giveway'){
    if(minSep<0.08) return {score:2,label:'Give-way action produced an unsafe / very close outcome'};
    if(firstAction===null) return {score:3,label:'Give-way responsibility was not demonstrated'};
    if(minSep>=0.30 && actionRatio>=0.40) return {score:5,label:'Early, clear give-way action'};
    return {score:4,label:'Give-way encounter resolved safely'};
  }

  if(kind==='sail_standon'){
    if(minSep<0.20) return {score:3,label:'Stand-on passage completed, but passing distance was close'};
    if(firstAction===null && minSep>=0.30) return {score:5,label:'Correct stand-on behaviour; give-way vessel kept clear'};
    return {score:4,label:'Safe stand-on outcome'};
  }

  if(kind==='overtaken'){
    if(minSep<0.20) return {score:3,label:'Stand-on passage completed, but passing distance was close'};
    if(firstAction===null && minSep>=0.30) return {score:5,label:'Correct stand-on behaviour; overtaking vessel kept clear'};
    return {score:4,label:'Safe stand-on outcome'};
  }

  if(kind==='cross_standon'){
    if(minSep<0.20) return {score:3,label:'Stand-on passage completed, but passing distance was close'};
    if(firstAction===null && minSep>=0.30) return {score:5,label:'Strong stand-on outcome; give-way vessel kept clear'};
    return {score:4,label:'Safe stand-on outcome'};
  }
  if(kind==='cross_standon_fail'){
    if(minSep<0.08) return {score:2,label:'Rule 17 escalation was too late / passing distance unsafe'};
    if(firstAction===null) return {score:2,label:'Give-way vessel failed to act and stand-on vessel took no avoiding action'};
    if(minSep>=0.30 && actionRatio>=0.20) return {score:5,label:'Good Rule 17 escalation — monitored, then acted to avoid collision'};
    return {score:4,label:'Rule 17 avoiding action achieved a safe outcome'};
  }

  if(kind==='head_on'){
    if(minSep<0.15) return {score:2,label:'Head-on encounter resolved too closely'};
    if(firstAction===null) return {score:3,label:'Other vessel avoided, but Watch One did not make the expected reciprocal starboard action'};
    if(minSep>=0.30 && actionRatio>=0.40) return {score:5,label:'Early, clear head-on avoiding action'};
    return {score:4,label:'Head-on encounter resolved safely'};
  }

  if(kind==='overtaking'){
    if(minSep<0.12) return {score:2,label:'Overtaking pass was too close'};
    if(firstAction===null) return {score:3,label:'Overtaking responsibility not demonstrated'};
    if(minSep>=0.30 && actionRatio>=0.40) return {score:5,label:'Clear and early overtaking manoeuvre'};
    return {score:4,label:'Overtaking completed safely'};
  }

  if(closeAhead || minSep<0.08) return {score:2,label:'Unsafe / very close manoeuvre'};
  if(crossedAhead || minSep<0.20 || firstAction===null) return {score:3,label:'Collision avoided, but improvement needed'};
  if(minSep>=0.20 && actionRatio>=0.45) return {score:5,label:'Strong early avoiding action'};
  return {score:4,label:'Good outcome'};
}

function scenarioRuleSummary(){
 const s=SCENARIOS[scenarioId],k=s.kind;
 if(k==='power_give_sail') return 'Rule 18 family — own vessel is power-driven and the other vessel is sailing. Subject to Rules 9, 10 and 13 and other applicable circumstances, the power-driven vessel keeps out of the way of the sailing vessel.';
 if(k==='sail_standon' && s.tgtType==='power') return 'Rule 18 family — own vessel is sailing with machinery not being used; the target is power-driven. Subject to Rules 9, 10 and 13, the power-driven vessel keeps out of the way.';
 if(k==='sail_giveway' && s.ownTack==='port' && s.tgtTack==='starboard') return 'Rule 12 — sailing vessels with wind on different sides: the vessel with wind on the port side keeps out of the way.';
 if(k==='sail_standon' && s.ownTack==='starboard' && s.tgtTack==='port') return 'Rule 12 — target has wind on her port side and must keep out of the way of the vessel with wind on the starboard side.';
 if(k==='sail_giveway' && s.ownWindward===true) return 'Rule 12 — sailing vessels with wind on the same side: the windward vessel keeps out of the way of the leeward vessel.';
 if(k==='sail_standon' && s.ownWindward===false) return 'Rule 12 — same tack: own vessel is leeward and is the stand-on vessel in this constructed encounter.';
 if(k==='head_on') return 'Head-on power-driven encounter — Rule 14 family. Each vessel should alter course to starboard so each passes on the port side of the other.';
 if(k==='overtaking') return 'Overtaking encounter — Rule 13 applies regardless of vessel type. The overtaking vessel must keep out of the way until finally past and clear.';
 if(k==='overtaken') return 'Being overtaken — Rule 13 family. The overtaking vessel remains responsible for keeping out of the way until finally past and clear.';
 if(k==='cross_standon') return 'Crossing encounter — Rules 15 and 17 family. The other power-driven vessel is on own vessel’s port side; own vessel is stand-on.';
 if(k==='cross_standon_fail') return 'Rule 17 escalation exercise — own vessel begins as stand-on, but the give-way vessel deliberately fails to act. The learner must monitor the developing risk and take action when required to avoid collision.';
 return 'Crossing encounter — Rules 15 and 16 family. The other power-driven vessel is on own vessel’s starboard side; own vessel is give-way.';
}
function buildDebrief(d){
  let sc=calculateTrainingScore();
  $('mathSummary').dataset.scenario=SCENARIOS[scenarioId].name;
  $('scoreValue').textContent=sc.score+' / 5';
  $('scoreLabel').textContent=sc.label+' — based on collision outcome, closest approach, manoeuvre-quality flags and action timing.';
  $('dInitCPA').textContent=initialCPA.toFixed(2)+' NM';
  $('dInitTCPA').textContent=(initialTCPA*60).toFixed(1)+' min';
  $('dMinSep').textContent=minSep.toFixed(2)+' NM';
  $('dFirstAction').textContent=firstAction===null?'No manoeuvre':fmt(firstAction);
  let collided=crashed||minSep<=.02;
  $('outcome').textContent=collided?'Collision occurred':(minSep<.1?'Very close passing distance':'Collision avoided in the simulation');
  $('outcome').className='status '+(collided?'bad':minSep<.1?'warn':'ok');
  $('mathSummary').textContent=`At handover, the unaltered constant-course/constant-speed vectors produced a predicted CPA of ${initialCPA.toFixed(2)} NM in ${(initialTCPA*60).toFixed(1)} minutes. The closest centre-to-centre separation actually reached during your watch was ${minSep.toFixed(2)} NM.`;
  $('decisionSummary').innerHTML=firstAction===null?'<p>No helm or engine manoeuvre was recorded.</p>':`<p>Your first recorded manoeuvre was at <b>T+${fmt(firstAction)}</b>.</p>`;
  $('decisionSummary').innerHTML='<p><b>Scenario:</b> '+SCENARIOS[scenarioId].name+'</p><p>'+scenarioRuleSummary()+'</p>'+$('decisionSummary').innerHTML;
  if(qualityEvents.length){
    $('decisionSummary').innerHTML += `<p><b>Manoeuvre-quality flags:</b> ${qualityEvents.length}</p>` +
      qualityEvents.map(q=>`<p><b>T+${fmt(q.t)}</b> — ${q.title}<br><span style="color:#566">${q.detail}</span></p>`).join('');
  } else {
    $('decisionSummary').innerHTML += '<p>No close-crossing-ahead quality flag was triggered.</p>';
  }

  $('timeline').innerHTML=events.map(e=>`<div class="event"><b>T+${fmt(e.t)}</b><br><span>${e.text}</span></div>`).join('');
}
function restart(){showModule('scenarios')}
renderScenarioList();setOwnVesselMode(vesselPropulsion()==='sail'?'sail':'power');initScenario();renderBuoys();nextBuoyQuestion();bvRender();setHornProfile('large');renderSignalCards();renderHarbourSignals();showSignalSection('audio');renderTSS();tssSimReset();

try{enhanceColregRuleVisuals();}catch(e){}

try{enhanceHomeHub();updateHeaderNav('home');updateModuleContext('home');}catch(e){}
try{initVesselProfile();updateHeaderNav('home');}catch(e){console.warn('Vessel profile init failed',e)}
try{updateHomeCourseProgress();renderHomeCourseDashboard();}catch(e){}
