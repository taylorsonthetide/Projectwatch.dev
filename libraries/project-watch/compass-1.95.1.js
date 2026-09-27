/* Original recreational compass learning content; diagrams and sources separate from HTML. */
window.PW_COMPASS = Object.freeze({
  "version": "1.95.1",
  "beginner": [
    {"title":"Point the bow","subtitle":"One number to begin","art":"scenes/beginner-helm","lead":"Look at the fixed line at the top of the compass. The number beside it tells you where the bow is pointing.","plain":"Here it reads 075° C: almost east, a little towards north. C simply means it is a compass reading.","remember":"The compass tells the direction the bow points."},
    {"title":"Watch where you go","subtitle":"A different number on the GPS","art":"scenes/beginner-track","lead":"The boat can point one way and move across the ground in another direction, especially when wind or tide pushes it.","plain":"The compass reading is heading. A GPS number marked COG describes your track over the ground while moving. Check both, but do not swap them.","remember":"Bow direction and ground track are different."},
    {"title":"Compare with a chart","subtitle":"Two small adjustments","art":"scenes/beginner-chart","lead":"A chart uses true north. A boat's compass can differ because of the boat itself and Earth's magnetic field.","plain":"In this made-up example, 082° on the compass becomes 084° magnetic after the boat correction, then 080° true after the chart correction. The advanced lessons show how to calculate each step.","remember":"Label each number C, M or T before comparing it with a chart."}
  ],
  "lessons": [
    {
      "title": "Read the compass",
      "subtitle": "Card, lubber line and heading",
      "art": "card",
      "lead": "The compass heading is the direction the bow points, read where the fixed lubber line meets the rotating card. It is a compass direction, not automatically a chart direction.",
      "points": [
        [
          "Degrees around the horizon",
          "North is 000° or 360°, east 090°, south 180° and west 270°. A full turn has 360 degrees."
        ],
        [
          "The lubber line",
          "Read the number opposite the fixed fore-and-aft index. Allow the card to settle; a rolling boat can make a single glance unreliable."
        ],
        [
          "Keep your bearings",
          "An object bearing points from you toward the object. It can differ from your heading because the object may lie off the bow."
        ]
      ],
      "scenario": "The bow is pointing 075° by compass and a lighthouse lies to starboard. Its bearing is not automatically 075°.",
      "takeaway": "Read the number at the lubber line for heading."
    },
    {
      "title": "Which north?",
      "subtitle": "True and magnetic",
      "art": "north",
      "lead": "Charts use true north. A magnetic compass aligns with the local magnetic field but the boat can disturb it. Convert between reference systems before comparing numbers.",
      "points": [
        [
          "True north",
          "Direction toward the geographic North Pole; chart directions are referenced to this."
        ],
        [
          "Magnetic north",
          "A compass is influenced by Earth’s magnetic field. The angular difference between true and magnetic directions at a place is variation, also called declination."
        ],
        [
          "Local and changing",
          "Read variation and its annual change from a suitable current chart or authoritative source for the place and date. The fictional values here describe no real location."
        ]
      ],
      "scenario": "Your chart course is 080° true. You cannot simply steer 080° compass unless the applicable corrections total zero.",
      "takeaway": "Always name the reference: T, M or C."
    },
    {
      "title": "Variation",
      "subtitle": "Earth’s field and the chart",
      "art": "variation",
      "lead": "Variation converts magnetic to true, or true to magnetic. Use east as positive and west as negative in the signed convention taught here.",
      "points": [
        [
          "East variation",
          "Magnetic to true: add an easterly variation. For example 084° M + 3° E = 087° T."
        ],
        [
          "West variation",
          "Magnetic to true: subtract a westerly variation. For example 084° M + 4° W = 080° T."
        ],
        [
          "Reverse direction",
          "True to magnetic uses the reverse operation. Write the reference after every answer and wrap the result to 000–359°."
        ]
      ],
      "scenario": "A fictional chart gives variation 4° W. A bearing of 084° M is 080° T.",
      "takeaway": "Variation comes from the location and date, never from a generic UK number."
    },
    {
      "title": "Deviation",
      "subtitle": "The boat’s own magnetic error",
      "art": "deviation",
      "lead": "Deviation is caused by magnetic or electrical influences aboard. It can differ with the heading and after equipment or structural changes.",
      "points": [
        [
          "Use a deviation card",
          "For a particular heading use the boat’s current deviation information, if available, and understand whether its columns refer to compass or magnetic heading."
        ],
        [
          "East and west",
          "Compass to magnetic: add easterly deviation or subtract westerly deviation in this signed convention."
        ],
        [
          "Check and adjust",
          "Keep portable magnets and electronics away from the compass. A doubtful compass needs competent checking and, where appropriate, adjustment."
        ]
      ],
      "scenario": "An untested speaker is moved beside the steering compass. Do not assume yesterday’s deviation still applies.",
      "takeaway": "Deviation belongs to the boat; variation belongs to the place."
    },
    {
      "title": "Convert a course",
      "subtitle": "Compass, magnetic, true",
      "art": "conversion",
      "lead": "Work one step at a time, keeping the reference letter beside each number. The numbers below are fictional teaching values.",
      "points": [
        [
          "C to M",
          "Start 082° C. With deviation 2° E: 082 + 2 = 084° M."
        ],
        [
          "M to T",
          "With variation 4° W: 084 − 4 = 080° T. Thus 082° C corresponds to 080° T for this example."
        ],
        [
          "T to C",
          "Reverse it: 080° T to 084° M by undoing 4° W, then to 082° C by undoing 2° E. Recheck which deviation applies to the intended heading."
        ]
      ],
      "scenario": "A compass reading of 082°, deviation 2° E, variation 4° W gives 080° true, not 088°.",
      "takeaway": "T = C + signed deviation + signed variation, modulo 360."
    },
    {
      "title": "Heading is not track",
      "subtitle": "Wind, tide and COG",
      "art": "track",
      "lead": "Heading describes the bow. Course over ground, or COG, describes the direction of movement across the ground, usually measured by GNSS while moving.",
      "points": [
        [
          "Different directions",
          "Current, leeway and steering can make the track differ from the heading. A 090° heading need not produce a 090° COG."
        ],
        [
          "COG limits",
          "At very low speed, COG can be erratic. A display labelled COG is not a magnetic compass heading unless suitable heading input is explicitly present."
        ],
        [
          "Cross-check",
          "Use a charted plan, visual marks and position fixes as appropriate. A single heading/COG comparison cannot by itself tell you the tidal stream."
        ]
      ],
      "scenario": "Your compass heading stays near 090° but a steady GNSS COG is 105°. Investigate the track and conditions; do not treat the displays as interchangeable.",
      "takeaway": "Ask: bow direction, intended course, or actual track?"
    },
    {
      "title": "Take a bearing",
      "subtitle": "Objects, transits and plotting",
      "art": "bearing",
      "lead": "A compass bearing is the direction to an object. It helps identify landmarks and check progress when combined with a chart and other evidence.",
      "points": [
        [
          "Identify the object",
          "Confirm that the lighthouse, buoy or headland is the charted feature you think it is."
        ],
        [
          "Convert before plotting",
          "A chart line is referenced to true north. Convert a compass bearing through applicable deviation and variation before plotting on a true chart."
        ],
        [
          "Transits",
          "Two charted objects lining up form a transit. This can provide a useful line of position without reading a bearing, but identification and chart currency still matter."
        ]
      ],
      "scenario": "You read 120° C to a headland. Label it C and apply the corrections before drawing a 120° line on a true chart.",
      "takeaway": "A bearing is evidence, not a position fix by itself."
    },
    {
      "title": "Steer and verify",
      "subtitle": "Practical compass routine",
      "art": "steer",
      "lead": "Choose an appropriate course, convert it for the boat and conditions, then steer consistently while checking the result against the passage plan.",
      "points": [
        [
          "Before departure",
          "Check the compass is readable, free of obvious interference and agrees reasonably with known references; know its limitations and deviation information."
        ],
        [
          "At the helm",
          "Steer with the lubber line, make measured corrections and avoid chasing each swing. Use a landmark ahead where suitable."
        ],
        [
          "If instruments disagree",
          "Check labels, reference settings and position; reduce uncertainty and seek a safe place or help if navigation is compromised. Use independent means when available."
        ]
      ],
      "scenario": "An autopilot course display and the steering compass disagree. Check whether each reads true or magnetic, then verify position and track.",
      "takeaway": "Plan, steer, observe and correct—do not follow one number blindly."
    }
  ],
  "quiz": [
    [
      "What does the number at the lubber line usually show?",
      [
        "Compass heading",
        "Course over ground",
        "Tide direction"
      ],
      0,
      "It is the boat’s compass heading."
    ],
    [
      "What is 270° on a compass rose?",
      [
        "East",
        "West",
        "South"
      ],
      1,
      "West is 270°."
    ],
    [
      "Which north is normally used to measure directions on a nautical chart?",
      [
        "True north",
        "The boat’s compass north",
        "The current direction"
      ],
      0,
      "Chart directions use true north."
    ],
    [
      "What is variation?",
      [
        "Boat-specific magnetic influence",
        "The difference between true and magnetic directions at a place",
        "The difference between heading and COG"
      ],
      1,
      "Variation is associated with Earth’s field and location."
    ],
    [
      "What is deviation?",
      [
        "The boat’s magnetic compass error",
        "The annual change in tide",
        "GNSS position error"
      ],
      0,
      "Deviation can be affected by the boat and its heading."
    ],
    [
      "084° M with 4° W variation gives which true bearing?",
      [
        "088° T",
        "080° T",
        "084° C"
      ],
      1,
      "West is negative: 084 − 4 = 080° T."
    ],
    [
      "082° C with 2° E deviation gives which magnetic heading?",
      [
        "080° M",
        "084° M",
        "082° T"
      ],
      1,
      "East is positive: 082 + 2 = 084° M."
    ],
    [
      "With that 084° M and 4° W variation, what is true?",
      [
        "080° T",
        "088° T",
        "086° T"
      ],
      0,
      "084 − 4 = 080° T."
    ],
    [
      "Which statement about deviation is sound?",
      [
        "It is identical on every boat",
        "It can change with heading and onboard equipment",
        "It equals the local tide rate"
      ],
      1,
      "Magnetic influences aboard can affect it."
    ],
    [
      "What does GNSS COG describe?",
      [
        "Bow direction at all speeds",
        "Direction of motion over ground while moving",
        "True north"
      ],
      1,
      "COG is the track direction over ground."
    ],
    [
      "You have a compass bearing and want to plot it on a true chart. What comes first?",
      [
        "Convert using applicable corrections",
        "Assume it is true",
        "Subtract the COG"
      ],
      0,
      "Keep references distinct and convert C to T."
    ],
    [
      "A nearby speaker is moved next to the compass. What should you do?",
      [
        "Ignore it",
        "Check for interference and the compass accuracy",
        "Use the tide table as deviation"
      ],
      1,
      "Magnetic objects can disturb the compass."
    ]
  ],
  "sources": [
    [
      "MCA Yacht Navigation and Radar examination syllabus",
      "https://www.gov.uk/government/publications/officer-of-the-watch-yacht-written-examination-syllabuses/navigation-and-radar-examination-syllabus"
    ],
    [
      "UKHO Admiralty magnetic variation charts",
      "https://www.admiralty.co.uk/charts/reference-and-plotting"
    ],
    [
      "NOAA magnetic declination explanation",
      "https://www.ncei.noaa.gov/products/geomagnetic-data"
    ],
    [
      "NOAA magnetic bearing calculator help",
      "https://www.ngdc.noaa.gov/geomag/calculators/help/bearingHelp.html"
    ],
    [
      "RYA: Understanding GPS and COG",
      "https://www.rya.org.uk/network/running-racing/guidance-and-good-practice/racing-responsibilities/gps-evidence-in-hearings/"
    ]
  ]
});
