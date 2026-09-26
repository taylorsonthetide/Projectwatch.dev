/* Project Watch content library; values preserved from the approved build. */
window.PW_ORIGINAL_LIBRARIES = window.PW_ORIGINAL_LIBRARIES || {};
window.PW_ORIGINAL_LIBRARIES.POWER_SCENARIO_ORDER = ['cross_stbd','cross_port','rule17_fail','head_on','overtake','overtaken','cross_stbd_offset','head_on_offset','overtake_port','power_vs_sail'];
window.PW_ORIGINAL_LIBRARIES.SAIL_SCENARIO_ORDER = ['sail_vs_power','sail_port_tack','sail_starboard_tack','sail_windward','sail_leeward','sail_overtaking'];
window.PW_ORIGINAL_LIBRARIES.SCENARIO_VISUALS = {
 cross_stbd:['CROSSING — TARGET STARBOARD','Rule 15 • Own vessel give-way'],
 cross_port:['CROSSING — TARGET PORT','Rules 15/17 • Own vessel stand-on'],
 rule17_fail:['RULE 17 — GIVE-WAY VESSEL FAILS','Rule 17 • Stand-on escalation'],
 head_on:['HEAD-ON','Rule 14 • Both alter to starboard'],
 overtake:['OVERTAKING','Rule 13 • Own vessel overtaking'],
 overtaken:['BEING OVERTAKEN','Rule 13 • Target vessel overtaking'],
 cross_stbd_offset:['CROSSING — DECEPTIVE CPA','Rules 7/8/15 • Assess developing risk'],
 head_on_offset:['NEAR HEAD-ON','Rule 14 • Nearly reciprocal courses'],
 overtake_port:['OVERTAKE — PORT QUARTER','Rule 13 • Own vessel overtaking'],
 power_vs_sail:['POWER MEETS SAIL','Rule 18 • Power normally keeps clear'],
 sail_vs_power:['SAIL MEETS POWER','Rule 18 • Sailing vessel normally stand-on'],
 sail_port_tack:['SAIL vs SAIL — PORT TACK','Rule 12 • Port tack gives way'],
 sail_starboard_tack:['SAIL vs SAIL — STARBOARD TACK','Rule 12 • Target on port tack gives way'],
 sail_windward:['SAIL vs SAIL — OWN WINDWARD','Rule 12 • Own vessel upwind / gives way'],
 sail_leeward:['SAIL vs SAIL — OWN LEEWARD','Rule 12 • Own vessel downwind / stand-on'],
 sail_overtaking:['SAILING OVERTAKING','Rule 13 • Overtaking vessel gives way']
};
window.PW_ORIGINAL_LIBRARIES.RADIO_SCENARIOS = [
 {name:'Sea Venture',call:'MZSV7',mmsi:'232 987 654',pos:'five four degrees, one two decimal four minutes North, zero zero three degrees, three five decimal eight minutes West',posDisplay:'54° 12.4′ N, 003° 35.8′ W',distress:'We have struck a submerged object and are taking water rapidly',assist:'Require immediate assistance and pumps',pob:'four',other:'We are preparing the liferaft. Vessel is a white motor cruiser, twelve metres long.'},
 {name:'North Star',call:'MNSR4',mmsi:'232 456 781',pos:'five three degrees, five eight decimal two minutes North, zero zero three degrees, one one decimal six minutes West',posDisplay:'53° 58.2′ N, 003° 11.6′ W',distress:'We have an engine room fire which is not under control',assist:'Require immediate assistance',pob:'three',other:'All persons are wearing lifejackets and we are preparing to abandon vessel.'},
 {name:'Silver Dawn',call:'MSDN8',mmsi:'232 741 963',pos:'five four degrees, three six decimal five minutes North, zero zero three degrees, three four decimal one minutes West',posDisplay:'54° 36.5′ N, 003° 34.1′ W',distress:'We have suffered a collision and have serious flooding',assist:'Require immediate assistance',pob:'five',other:'One person is injured. Liferaft is ready for deployment.'}
];
window.PW_ORIGINAL_LIBRARIES.TSS_SIM_SCENARIOS = {
 basic:{name:'Basic gap',tideX:0,tideY:0,targets:[
  [-1.8,0.85,90,11,'NORTH STAR'],[1.4,0.85,90,10,'MERIDIAN'],
  [1.9,-0.85,270,12,'SEA PANTHER'],[-1.2,-0.85,270,10,'COASTAL ONE']
 ]},
 dense:{name:'Dense traffic',tideX:0,tideY:0,targets:[
  [-2.2,0.90,90,12,'HERA HIGHWAY'],[-.7,.82,90,10,'PROWL WEALTH'],[1.0,.88,90,13,'SHENG AN YING'],[2.6,.82,90,11,'WATERSK MONTA'],
  [2.5,-.88,270,12,'SEA PANTHER'],[.8,-.82,270,10,'COSCO MERIT'],[-.8,-.9,270,13,'TAU D IF'],[-2.5,-.82,270,11,'TARGET 08']
 ]},
 tide:{name:'Tidal set',tideX:2.0,tideY:0,targets:[
  [-1.8,.85,90,11,'EASTERN GLORY'],[1.5,.85,90,10,'MERIDIAN'],
  [2.0,-.85,270,12,'WESTERN STAR'],[-1.4,-.85,270,10,'COASTAL ONE']
 ]},
 late:{name:'Late decision',tideX:0,tideY:0,targets:[
  [-.55,.85,90,12,'FAST EAST'],[1.4,.85,90,11,'EASTERN SKY'],
  [.65,-.85,270,13,'FAST WEST'],[-1.6,-.85,270,10,'WESTERN BAY']
 ]}
};
