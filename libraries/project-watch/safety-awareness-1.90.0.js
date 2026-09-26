/* Original Project Watch lessons. External authority links are references, not reused course material. */
window.PW_SAFETY_AWARENESS = Object.freeze({
  lessons:[
    {id:'prepare',title:'Before leaving the berth',image:'assets/safety/departure.svg',alt:'Five connected pre-departure decisions: conditions, vessel, people, equipment and fallback.',lead:'A safe trip starts with a decision to go, delay, change the plan or stay alongside.',points:[
      ['Conditions and limits','Check the latest forecast, tides, visibility and the crew’s ability. Decide on a clear turn-back point.'],
      ['Vessel and crew','Check fuel, engine, bilges, batteries, navigation and communications. Brief every person on hazards, emergency gear and who can take over.'],
      ['Tell someone','Share destination, route, crew, expected return and what to do if overdue with a reliable shore contact.']
    ],scenario:'The forecast worsens and one crew member has never used the VHF. Pause departure, revise the plan and brief the crew before deciding whether to go.',source:'ryaPassage'},
    {id:'risk',title:'Spot and control risk',image:'assets/safety/risk-cycle.svg',alt:'Risk assessment loop: spot hazard, identify who may be harmed, control it, brief the crew and review.',lead:'Look for what could cause harm, then change the task so the hazard is less likely to hurt anyone.',points:[
      ['Spot the hazard','Examples include a wet deck, loose line, moving winch, hot exhaust or exposed rail. Ask who might be harmed and how.'],
      ['Control the source','Change or stop the task, isolate equipment, establish a safe working area and use suitable protection. A checklist alone does not remove danger.'],
      ['Review as conditions change','A safe deck in harbour can become unsafe in darkness or rough water. Brief the crew and revisit controls after a change or near miss.']
    ],scenario:'A line now runs across the route to the foredeck. Re-route crew and secure the line before the next task.',source:'mcaRisk'},
    {id:'deck',title:'Stay aboard and work safely',image:'assets/safety/deck-zones.svg',alt:'Top-down boat diagram marking rail, working line, moving gear and safe walking zone.',lead:'The best man overboard response is to prevent someone entering the water.',points:[
      ['Control movement','Keep decks clear, move with handholds, use non-slip footwear and avoid working alone on an exposed deck where possible.'],
      ['Keep clear of loads','Do not step into a bight of rope or reach across a moving line, winch or anchor gear. Stop and isolate machinery before clearing a jam.'],
      ['Wear suitable flotation','Fit and check the lifejacket or PFD for the wearer and activity. Fishing-vessel rules have specific open-deck requirements; do not assume one rule covers all pleasure craft.']
    ],scenario:'A crew member approaches a loaded line to untangle it. Stop the operation and remove the load before anyone handles the line.',source:'mcaPfd'},
    {id:'equipment',title:'Know and check the safety kit',image:'assets/safety/kit-check.svg',alt:'Original visual checklist for lifejacket, communication, fire and recovery equipment.',lead:'Equipment helps only if it is accessible, serviceable and the crew know how to use it.',points:[
      ['Personal flotation','Confirm correct fit, fastenings, service status and that each person knows how to put it on. Follow the maker’s instructions for inspection.'],
      ['Alarm and communication','Know the fixed and handheld VHF, position source and emergency contacts. Keep a charged backup and explain how to raise an alarm.'],
      ['Fire, flooding and recovery','Locate extinguishers, pump controls, seacocks, throw line and recovery aid. Check access and assign roles before departure.']
    ],scenario:'The throw line is buried in a locker beneath luggage. Move it to an accessible position and make sure the crew can find it.',source:'ryaSafety'},
    {id:'human',title:'People and changing conditions',image:'assets/safety/decision.svg',alt:'A decision tree for fatigue, weather and an unsafe task: slow down, change plan or stop.',lead:'Fatigue, cold, pressure and distraction can turn a routine operation into a mistake.',points:[
      ['Recognise fatigue','Look for slower reactions, missed checks, poor judgement or a change in mood. Arrange rest and a competent handover.'],
      ['Use a stop point','Anyone should be able to say that an operation is unsafe. Pause, reassess and change the plan without blame.'],
      ['Keep a margin','Reduce workload when visibility or sea state worsens. Turn back or seek shelter before options narrow.']
    ],scenario:'The only watchkeeper is struggling to stay alert. Hand over to a competent rested person or make a safe plan to stop.',source:'mcaHealth'},
    {id:'respond',title:'Act early in an emergency',image:'assets/safety/emergency.svg',alt:'Four response steps: alert crew, protect people, call for help and manage the vessel.',lead:'A simple, rehearsed response is easier to follow under pressure.',points:[
      ['Alert and protect','Raise the alarm, account for everyone and keep rescuers safe. Take immediate action only within your capability.'],
      ['Call for help','Use the appropriate maritime distress or urgency procedure and give identity, position, nature of problem and assistance needed. VHF operation needs separate training.'],
      ['Manage and review','Stabilise the vessel if safe, follow the emergency plan, preserve a lookout and reassess. Practise procedures with the actual crew and equipment.']
    ],scenario:'A crew member falls overboard. Shout, maintain sight, alert the skipper and start the practised recovery plan while summoning help as needed.',source:'ryaSurvival'}
  ],
  questions:[
    {lesson:'prepare',q:'The forecast has worsened beyond your crew’s comfortable limits. What is the safer decision?',choices:['Delay or change the passage and reassess','Depart and decide once offshore','Rely on the plotter to avoid the weather'],correct:0,why:'Departure is a decision point. Change the plan before losing easy options.'},
    {lesson:'prepare',q:'What should a shore contact know before a passage?',choices:['Only the name of the boat','Route, people aboard, expected return and overdue action','The chartplotter brand'],correct:1,why:'A useful passage plan gives a shore contact enough information to raise an appropriate alarm.'},
    {lesson:'risk',q:'A loose line creates a trip hazard on deck. What is the best first control?',choices:['Put up a warning and carry on','Remove or secure the line and keep the route clear','Ask the crew to step over it'],correct:1,why:'Control the hazard at its source rather than relying on people to avoid it.'},
    {lesson:'risk',q:'When should a task risk assessment be revisited?',choices:['Only when the vessel is sold','When conditions, equipment or the operation change','After an accident only'],correct:1,why:'Controls need review whenever the situation changes materially.'},
    {lesson:'deck',q:'A rope is under load near a working winch. Where should crew stand?',choices:['Inside its bight for a clear view','Away from the line of pull and moving gear','Beside the winch drum to react quickly'],correct:1,why:'Loaded lines and moving gear can injure without warning.'},
    {lesson:'deck',q:'A line has jammed in moving machinery. What should happen first?',choices:['Reach in before it gets worse','Stop and isolate the machinery before handling it','Increase speed to clear the jam'],correct:1,why:'Remove the energy source before anyone approaches the jam.'},
    {lesson:'equipment',q:'What makes a lifejacket ready for use?',choices:['It is somewhere aboard','It fits the wearer, is serviceable and is worn correctly','It is the same colour as the boat'],correct:1,why:'Availability alone does not make flotation effective.'},
    {lesson:'equipment',q:'A recovery line is buried beneath equipment. What is the problem?',choices:['No problem if someone knows it is there','It may be inaccessible when seconds matter','It should always be kept below deck'],correct:1,why:'Emergency equipment should be accessible and its location understood.'},
    {lesson:'human',q:'A watchkeeper is making repeated mistakes from fatigue. What is the best response?',choices:['Continue to maintain the schedule','Arrange a competent handover or stop safely','Turn up the radio volume'],correct:1,why:'Fatigue reduces attention and judgement; change the watch arrangement.'},
    {lesson:'human',q:'A crew member says a deck task feels unsafe. What should the skipper do?',choices:['Pause and reassess with the crew','Tell them to finish quickly','Ignore it unless an accident occurs'],correct:0,why:'A stop point lets the crew control a developing risk.'},
    {lesson:'respond',q:'A person falls overboard. What immediate actions fit the plan?',choices:['Keep visual contact, raise the alarm and start recovery','Leave the helm unattended to search lockers','Wait to see if they swim back'],correct:0,why:'An immediate alert and maintained visual contact support recovery.'},
    {lesson:'respond',q:'When calling for help, what information is most useful?',choices:['Boat colour only','Identity, position, problem and assistance needed','The price of the safety equipment'],correct:1,why:'Clear details help responders locate and assist the vessel.'}
  ],
  sources:{
    seafish:{label:'Seafish: commercial fishing training',url:'https://www.seafish.org/safety-and-training/seagoing-training-and-certificates/commercial-fishing-training-courses/'},
    mcaTraining:{label:'MCA: Safety Awareness prerequisites (MIN 722)',url:'https://www.gov.uk/government/publications/min-722-mf-clarification-of-the-basic-health-and-safety-and-safety-awareness-training-requirements-for-fishers/min-722-mf-clarification-of-the-basic-health-and-safety-and-safety-awareness-training-requirements-for-fishers'},
    mcaRisk:{label:'MCA: fishing vessel risk assessments',url:'https://www.gov.uk/guidance/fishing-vessel-risk-assessments-and-safety-management-systems'},
    mcaHealth:{label:'MCA: fishing vessel health and safety',url:'https://www.gov.uk/guidance/fishing-vessel-health-and-safety'},
    mcaPfd:{label:'MCA: fishing vessel PFD guidance',url:'https://www.gov.uk/government/publications/mgn-588-f-amendment-2-compulsory-provision-and-wearing-of-personal-flotation-devices-on-fishing-vessels/mgn-588-f-amendment-2-compulsory-provision-and-wearing-of-personal-flotation-devices-on-fishing-vessels'},
    ryaPassage:{label:'RYA: passage planning and crew briefing',url:'https://www.rya.org.uk/water-safety/passage-planning-and-navigation/passage-planning/'},
    ryaSafety:{label:'RYA: on-water safety advice',url:'https://www.rya.org.uk/water-safety/'},
    ryaSurvival:{label:'RYA: Basic Sea Survival course overview',url:'https://www.rya.org.uk/course-finder/basic-sea-survival-certificate/'}
  }
});
