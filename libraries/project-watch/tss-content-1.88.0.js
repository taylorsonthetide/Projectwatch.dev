/* Project Watch content library; values preserved from the approved build. */
window.PW_ORIGINAL_LIBRARIES = window.PW_ORIGINAL_LIBRARIES || {};
window.PW_ORIGINAL_LIBRARIES.TSS_RULES = [
 ['Traffic lanes','Proceed in the appropriate lane in the general direction of traffic flow and keep clear of the separation line or zone so far as practicable.','10(b)'],
 ['Crossing','So far as practicable avoid crossing; if obliged, cross on a heading as nearly as practicable at right angles to the general traffic flow.','10(c)'],
 ['Heading ≠ COG','The right-angle test is the vessel’s heading. Tidal stream may produce a different course over ground.','MCA 2.4–2.5'],
 ['Complete the crossing','The MCA interprets crossing as crossing the entire lane without stopping, except in emergency, and exiting in one manoeuvre.','MCA 2.6'],
 ['Joining / leaving','Normally join or leave at the termination of a lane; when joining/leaving from the side, use as small an angle to traffic flow as practicable.','10(b)'],
 ['ITZ','A vessel under 20 m, a sailing vessel, or a vessel engaged in fishing may use the ITZ; other stated Rule 10(d) reasons also apply.','10(d)'],
 ['Separation zone','Do not normally enter a separation zone or cross a separation line except the Rule 10(e) cases, including immediate danger and fishing in the zone.','10(e)'],
 ['No automatic priority','Using a TSS does not relieve any vessel of obligations under other COLREG rules. Lane traffic does not automatically have priority over crossing traffic.','10(a) / MCA 2.2'],
 ['Fishing vessels','A vessel engaged in fishing shall not impede the passage of a vessel following a traffic lane.','10(i)'],
 ['Small / sailing vessels','A vessel under 20 m or a sailing vessel shall not impede the safe passage of a power-driven vessel following a traffic lane.','10(j)']
];
window.PW_ORIGINAL_LIBRARIES.TSS_TUTORIAL = [
 {rule:'YOUR VESSEL • RULE 10(j)',title:'Start here: you are under 20 metres',intro:'The whole course now assumes a small recreational power-driven vessel.',mode:'layout',
 facts:[['TRAINING VESSEL','Watch One is treated here as a 14.2 m power-driven recreational vessel.'],['UNDER 20 m','Rule 10(j) applies: do not impede the safe passage of a power-driven vessel following a traffic lane.'],['NOT EXEMPT','Being small does not exempt you from Rule 10 or the other COLREGs.'],['LOCAL INFORMATION','Check the chart and Sailing Directions because individual schemes can contain special provisions.']],
 explain:'Before learning any manoeuvre, fix your vessel status in your mind. In this course you are operating Watch One, a power-driven recreational vessel under twenty metres. You must comply with Rule 10 and the other COLREGs, and Rule 10(j) gives you an additional duty not to impede the safe passage of a power-driven vessel following a traffic lane.',
 q:'What extra Rule 10 duty applies to Watch One because she is under 20 metres?',a:['She may ignore lane traffic','She shall not impede the safe passage of a power-driven vessel following a traffic lane','She must always use the separation zone'],correct:1},

 {rule:'RULE 10(a) & (j)',title:'Read the scheme before you decide',intro:'Identify the lanes, flow, separation zone and any inshore traffic zone.',mode:'layout',
 facts:[['TRAFFIC LANES','Traffic using a lane proceeds in its general direction of flow.'],['SEPARATION ZONE','The central line or zone separates opposing streams.'],['ITZ','An Inshore Traffic Zone may exist between the traffic lane and the coast.'],['OTHER COLREGS','A TSS does not cancel Rules 5–8 or the other steering and sailing rules.']],
 explain:'Do not begin by steering toward the first gap you see. Read the complete scheme. Identify both traffic directions, the separation feature, any inshore traffic zone, your intended route and the traffic that could be affected by you. Lane traffic does not gain automatic priority simply because it is in a TSS, but your under-twenty-metre non-impeding duty still applies.',
 q:'Does being under 20 metres remove your normal COLREG responsibilities?',a:['YES','NO','ONLY INSIDE AN ITZ'],correct:1},

 {rule:'RULE 10(d)',title:'The Inshore Traffic Zone option',intro:'For an under-20-metre vessel, the ITZ is especially relevant.',mode:'itz',
 facts:[['EXPRESS PERMISSION','Vessels under 20 m may use an Inshore Traffic Zone.'],['NOT A ONE-WAY LANE','Within an ITZ you may encounter vessels heading in any direction.'],['DO NOT ASSUME','An ITZ is not simply an empty or easier traffic lane.'],['CHECK THE SCHEME','Use the chart and Sailing Directions for the particular TSS and local provisions.']],
 explain:'Rule 10(d) expressly allows a vessel under twenty metres to use an inshore traffic zone. That makes the ITZ highly relevant to this course. But do not treat it as a one-way traffic lane or assume it will be empty. Maintain a proper lookout and check the particular scheme.',
 q:'May a vessel under 20 metres use an Inshore Traffic Zone under Rule 10(d)?',a:['YES','NO','ONLY WITH A COMMERCIAL LICENCE'],correct:0},

 {rule:'RULE 10(c) & (j)',title:'Before crossing: do not create the problem',intro:'Avoid crossing traffic lanes so far as practicable; if obliged, plan a safe crossing.',mode:'impede',
 facts:[['FIRST QUESTION','Can the crossing be avoided so far as practicable?'],['DO NOT IMPEDE','Do not make a lane-following power-driven vessel alter course or speed for you.'],['WAIT OUTSIDE','If the developing picture is unsuitable, remain clear rather than forcing the crossing.'],['PLAN A GAP','Commit only when the traffic picture supports a safe, continuous crossing.']],
 explain:'For a small recreational vessel, the important lesson comes before the ninety-degree line is drawn. Rule 10 says to avoid crossing traffic lanes so far as practicable. If you are obliged to cross, Rule 10(j) means you must plan early so that a power-driven vessel following the lane is not forced to alter course or speed because of you. The red cross in the graphic means do not commit to the crossing while the traffic picture is unsuitable; remain clear, reassess and wait for a safe opportunity.',
 q:'If a lane-following ship would have to alter course or speed because of your crossing, what should you do?',a:['Cross anyway because you are at 90 degrees','Wait and reassess rather than impede it','Enter the separation zone and stop'],correct:1},

 {rule:'RULE 10(c)',title:'Crossing: the 90-degree HEADING',intro:'Once a safe crossing is available, make the right-angle geometry visually unmistakable.',mode:'cross',
 facts:[['HEADING','Cross on a heading as nearly as practicable at right angles to traffic flow.'],['NOT COG','The rule specifies heading, not course over ground.'],['ONE MANOEUVRE','Cross the entire traffic lane without stopping except in emergency.'],['TIDE','Tidal set may make the ground track look diagonal while the bow still holds the required heading.']],
 explain:'Now the geometry matters. The graphic shows the vessel heading north-south at a clear ninety degrees to the east-west traffic flow. The right-angle marker reinforces that it is the vessel’s heading that must be as nearly as practicable at right angles — not course over ground. A tidal stream may make the ground track appear diagonal. Once committed, cross the entire traffic lane without stopping except in an emergency.',
 q:'What must be as nearly as practicable at right angles to the traffic flow?',a:['HEADING','COURSE OVER GROUND','THE WAKE'],correct:0},

 {rule:'RULE 10(e)',title:'The separation zone is not waiting space',intro:'Do not solve a poor crossing by stopping in the middle.',mode:'zone',
 facts:[['NORMAL RULE','A vessel other than a crossing vessel or one joining/leaving a lane shall not normally enter the separation zone or cross a separation line.'],['NO MID-SCHEME WAIT','Do not use the separation zone as a convenient place to pause between traffic lanes.'],['EMERGENCY','Immediate danger is one of the stated exceptions.'],['PLAN BEFORE COMMITTING','Choose the safe opportunity before entering the traffic lane.']],
 explain:'The red cross in the separation zone is a reminder not to plan a crossing around stopping or waiting in the middle. Rule 10(e) allows a crossing vessel to pass through the separation feature as part of the crossing; the lesson here is to plan the manoeuvre so the traffic lanes are crossed continuously rather than treating the separation zone as convenient waiting space.',
 q:'Should an under-20-metre recreational vessel normally stop in the separation zone to wait for the second lane?',a:['YES','NO','ONLY IF THE FIRST LANE WAS BUSY'],correct:1},

 {rule:'RULE 10(b) & (j)',title:'If you actually use a traffic lane',intro:'Small recreational vessels are not automatically banned from a lane.',mode:'follow',
 facts:[['LEGAL PRINCIPLE','Rule 10 does not create a blanket ban on an under-20-metre vessel using a traffic lane.'],['CORRECT FLOW','If using a lane, proceed in the appropriate lane in its general direction of traffic flow.'],['KEEP CLEAR','So far as practicable keep clear of the separation line or zone.'],['UNDER 20 m','Your Rule 10(j) duty not to impede a power-driven vessel following the lane still applies.']],
 explain:'This lesson prevents another common misunderstanding. Being under twenty metres does not by itself prohibit Watch One from using a traffic lane. If her passage uses the lane, she must proceed in the appropriate lane in the general direction of traffic flow, keep clear of the separation line or zone so far as practicable, and continue to comply with Rule 10(j). The chart and any local scheme provisions must still be checked.',
 q:'If Watch One is using a traffic lane, may she steam against the arrows because she is under 20 metres?',a:['YES','NO — use the appropriate lane in the general direction of traffic flow','ONLY IN DAYLIGHT'],correct:1},

 {rule:'RULE 10(b)(iii), (f), (g), (h)',title:'Joining, leaving and staying clear',intro:'Contrast the manoeuvres: crossing is near 90° to traffic flow; joining or leaving from the side uses a small angle to traffic flow.',mode:'join',
 facts:[['JOIN / LEAVE','Normally join or leave a traffic lane at its termination.'],['FROM THE SIDE','If joining or leaving from the side, use as small an angle to traffic flow as practicable.'],['NOT USING IT','If not using the TSS, avoid it by as wide a margin as practicable.'],['ANCHORING','So far as practicable avoid anchoring in the TSS or near its terminations.']],
 explain:'The curved green track in the graphic illustrates joining a traffic lane from the side at a small angle to the general direction of traffic flow. That is deliberately different from a Rule 10(c) crossing, which uses a heading as nearly as practicable at right angles. Normally join or leave at a lane termination; if not using the scheme, avoid it by as wide a margin as practicable, and avoid anchoring in or near its terminations so far as practicable.',
 q:'Which manoeuvre uses the near-90-degree heading?',a:['CROSSING A TRAFFIC LANE','JOINING FROM THE SIDE','FOLLOWING THE LANE'],correct:0},

 {rule:'UNDER-20 m WATCH • FULL RULE 10',title:'Take the watch: small-vessel crossing',intro:'Put the under-20-metre lessons together.',mode:'final',
 facts:[['1 • READ','Identify traffic flow, separation zone, ITZ and your intended route.'],['2 • ASSESS','Avoid crossing so far as practicable; if crossing is required, find a gap that will not impede lane traffic.'],['3 • CROSS','Hold the Rule 10(c) heading as nearly as practicable at 90 degrees and cross continuously.'],['4 • KEEP WATCH','Rules 5–8 and the other COLREGs continue throughout the manoeuvre.']],
 explain:'This final graphic brings the sequence together for Watch One. Read the scheme and traffic flow first, avoid crossing so far as practicable, and do not impede a power-driven vessel following a traffic lane. When a safe crossing is available, hold the Rule 10(c) heading as nearly as practicable at right angles to the traffic flow, cross each traffic lane without stopping except in an emergency, and continue applying the other COLREGs throughout.',
 q:'What is the correct beginner sequence for an under-20-metre TSS crossing?',a:['Enter first, then look for a gap','Plan early, do not impede, cross on the Rule 10(c) heading, and keep applying the COLREGs','Stop in the separation zone between lanes'],correct:1}
];
window.PW_ORIGINAL_LIBRARIES.TSS_PRACTICAL_EXAM = [
 ['basic','Basic gap','Assess the lane traffic, wait for a safe gap and complete the crossing without impeding lane-following ships.'],
 ['dense','Dense traffic','Manage a busier developing picture while retaining the correct Rule 10 heading and collision-risk assessment.'],
 ['tide','Tidal set','Keep the correct right-angle HEADING while the tidal set visibly changes course over ground.'],
 ['late','Late decision','Recognise that a poor traffic window requires caution; do not force the crossing simply because the geometry is correct.']
];
