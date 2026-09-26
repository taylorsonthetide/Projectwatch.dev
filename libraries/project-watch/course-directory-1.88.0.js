/* Original Project Watch reference and training data. */
window.PW_ORIGINAL_LIBRARIES=window.PW_ORIGINAL_LIBRARIES||{};
window.PW_ORIGINAL_LIBRARIES.PW_LIBRARY_SEARCH_ALIASES={
 'may day':'mayday','channel 16':'vhf distress mayday','ch 16':'vhf distress mayday','panpan':'pan pan','pan pan':'panpan','securite':'securite safety','call regs':'colregs','col regs':'colregs','collision regs':'colregs','nav lights':'navigation lights','side lights':'sidelights','stern light':'sternlight','top mark':'topmark','motor sailing':'motorsailing','motor sailer':'motorsailing','right angle':'90 degrees crossing','closest point':'cpa','time to cpa':'tcpa','course over ground':'cog','speed over ground':'sog','call sign':'callsign','man overboard':'mob','not under command':'nuc','restricted ability to manoeuvre':'ram','restricted ability to maneuver':'ram','constrained by draught':'cbd','constrained by draft':'cbd','traffic separation scheme':'tss','inshore traffic zone':'itz'
};
window.PW_ORIGINAL_LIBRARIES.PW_COURSE_STAGES=[
 {id:'orientation',no:'01',title:'Orientation & Watchkeeping Fundamentals',module:'course',type:'FOUNDATION',
  desc:'Establish the language and safety mindset used by every later module.',
  objectives:['Describe heading, COG and SOG','Use port/starboard and relative sectors correctly','Explain why lookout outranks electronic aids','Understand Guided, Watch and Exam modes'],
  requirement:'First complete Bridge Language lessons 1–6. Then unlock the Stage 1 final knowledge check, score at least 4/5, and confirm the safety acknowledgement.'},
 {id:'foundations',no:'02',title:'COLREG Foundations',module:'colregs',type:'RULE FRAMEWORK',
  desc:'Six teaching lessons follow the same proven flow as Stage 1. The 10-question final check unlocks only after Lesson 6.',
  objectives:['Locate the major COLREG Parts','Explain Rules 5–8 principles','Distinguish in-sight and restricted-visibility frameworks','Understand give-way / stand-on escalation'],
  requirement:'Complete all 6 teaching lessons and score at least 8/10 in the foundation knowledge check.'},
 {id:'lights',no:'03',title:'Lights & Shapes Recognition',module:'lights',type:'VESSEL RECOGNITION',
  desc:'Recognise what another vessel is, its aspect and any special status before deciding responsibility.',
  objectives:['Recognise core Rule 20–31 displays','Use viewing aspect correctly','Interpret day shapes','Identify NUC, RAM, fishing, towing, pilot and anchor/aground displays'],
  requirement:'Complete all 6 teaching lessons and score at least 8/10 in the Stage 3 final knowledge check. The 45-question full mock remains available as advanced assessment practice.'},
 {id:'signals',no:'04',title:'Sound, Fog & Distress Signals',module:'signals',type:'COMMUNICATION',
  desc:'Recognise manoeuvring and restricted-visibility signals and understand distress indications.',
  objectives:['Recognise Rule 34 manoeuvring signals','Recognise common Rule 35 fog signals','Distinguish doubt/warning signals','Identify key distress signals and procedures'],
  requirement:'Complete all 6 teaching lessons and score at least 8/10 in the Stage 4 final knowledge check.'},
 {id:'collision',no:'05',title:'Collision Avoidance & Rules of the Road',module:'scenarios',type:'DECISION MAKING',
  desc:'Apply the Rule framework to developing encounters and demonstrate safe avoiding action.',
  objectives:['Recognise overtaking, head-on and crossing','Assess collision risk','Apply Rules 13–18 correctly','Take early, substantial action and monitor the result'],
  requirement:'Pass the Collision Knowledge Mock with no safety-critical error.'},
 {id:'buoyage',no:'06',title:'Buoyage & Marks',module:'buoyage',type:'PILOTAGE FOUNDATION',
  desc:'Learn the complete IALA Region A visual set by day and night, then prove the knowledge in a live buoy-passage assessment.',
  objectives:['Recognise lateral and preferred-channel marks','Use all four cardinal marks','Recognise isolated danger, safe water and special marks','Interpret light characteristics and safe passage'],
  requirement:'Learn all 12 marks by day and night, then pass the Stage 6 buoy-passage assessment with at least 10/12 correct.'},
 {id:'tss',no:'07',title:'Traffic Separation Schemes',module:'tss',type:'TRAFFIC MANAGEMENT',
  desc:'Nine guided Rule 10 lessons build the traffic picture step by step, followed by the Stage 7 final knowledge check.',
  objectives:['Read lanes, separation zones, ITZs and terminations','Cross on the correct heading','Join/leave using the correct geometry','Apply vessel-specific Rule 10 duties without forgetting the other COLREGs'],
  requirement:'Review all 9 guided TSS lessons and score at least 8/10 in the Stage 7 final knowledge check.'},
 {id:'ais',no:'08',title:'AIS & Electronic Situational Awareness',module:'ais',type:'ELECTRONIC AID',
  desc:'Use AIS as supporting information without allowing it to replace lookout or COLREG judgement.',
  objectives:['Understand what AIS is and what it is not','Read identity, COG/SOG, heading and target age','Interpret CPA/TCPA as predictions','Recognise missing, stale, wrong and virtual data','Cross-check AIS with lookout, radar and COLREGs'],
  requirement:'Review all 6 guided AIS lessons and score at least 8/10 in the Stage 8 final knowledge check.'}
];
window.PW_ORIGINAL_LIBRARIES.MODULE_META={
 home:{no:'',title:'',desc:'',state:''},
 course:{no:'COURSE',title:'Structured Training Pathway',desc:'Project Watch core curriculum, prerequisites, learning outcomes and progression.',state:'COURSE MODE'},
 library:{no:'LIBRARY',title:'Training Library',desc:'Direct access to Project Watch learning modules, simulators, references and assessments.',state:'DIRECT ACCESS'},
 scenarios:{no:'01',title:'Collision Scenarios',desc:'Scenario briefing, guided watch, simulator and debrief.',state:'SIMULATOR MODULE'},
 colregs:{no:'02',title:'COLREGS',desc:'Rules 1–41, technical Annexes and licensed reference imagery.',state:'RULES MODULE'},
 lights:{no:'03',title:'Lights & Shapes',desc:'Bridge-view recognition of navigation lights and day shapes.',state:'RECOGNITION MODULE'},
 signals:{no:'04',title:'Signals',desc:'Sound signals, restricted visibility, distress and harbour practice.',state:'SIGNALS MODULE'},
 buoyage:{no:'05',title:'Buoyage',desc:'IALA Region A marks, lights and recognition challenges.',state:'BUOYAGE MODULE'},
 tss:{no:'06',title:'Traffic Separation',desc:'Rule 10 learning, crossing geometry, bridge display and live TSS watch.',state:'TSS MODULE'},
 ais:{no:'07',title:'AIS Target Trainer',desc:'Simulated AIS chart, vessel targets, COG/heading, CPA/TCPA and lost-target awareness.',state:'AIS LEARNING MODULE'}
};
window.PW_ORIGINAL_LIBRARIES.TRAINING_VESSEL_PROFILES={
  watch1:{id:'watch1',name:'Watch One',propulsion:'power',make:'Project Watch',model:'Power Training Vessel',length:14.2,beam:4.5,draft:1.6,cruise:7,maxSpeed:9,aisClass:'B',homePort:'',callsign:'',photo:'',isDefault:true},
  watch2:{id:'watch2',name:'Watch Two',propulsion:'sail',make:'Project Watch',model:'Sailing Training Vessel',length:12.0,beam:3.8,draft:1.8,cruise:6,maxSpeed:8,aisClass:'B',homePort:'',callsign:'',photo:'',isDefault:true}
};
