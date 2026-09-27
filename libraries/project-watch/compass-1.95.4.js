/* Original recreational compass teaching content; no video text or frames copied. */
window.PW_COMPASS = Object.freeze({
  "version": "1.95.4",
  "beginner": [
    {
      "title": "Learn the compass circle",
      "subtitle": "North, east, south, west",
      "art": "scenes/accurate-compass-rose",
      "lead": "Imagine a full circle around the boat. Start at north and turn clockwise: east, south, then west.",
      "plain": "North is 000°, east 090°, south 180° and west 270°. Halfway points include northeast 045° and southwest 225°. We write directions with three digits.",
      "remember": "A compass direction is measured clockwise from north."
    },
    {
      "title": "Read the direction of the bow",
      "subtitle": "The steering compass",
      "art": "scenes/beginner-helm",
      "lead": "The fixed mark on the compass housing is the lubber line. Read the card at that line to find where the bow points.",
      "plain": "For example, 075° C means the bow points almost east, a little north of it. C tells us this number came from the boat’s compass; the photo does not show that example reading.",
      "remember": "Heading means bow direction."
    },
    {
      "title": "Look towards a landmark",
      "subtitle": "Heading and bearing",
      "art": "scenes/beginner-bearing",
      "lead": "A bearing points from your boat to an identified object. The object need not be straight ahead.",
      "plain": "In a worked example, the bow points east at 090° C while a lighthouse bears northeast at 045° C. That is its bearing, not the boat’s heading; the photo has no assigned reading.",
      "remember": "Heading points along the bow; bearing points to the object."
    },
    {
      "title": "See where the boat goes",
      "subtitle": "Heading and track",
      "art": "scenes/beginner-track",
      "lead": "A boat can point one way but move across the ground in another direction when wind, current and steering affect the trip.",
      "plain": "In a worked example, the compass heading is 090° and a moving GPS reports 105° COG: course over ground. Neither number alone tells us the exact current; the photo has no assigned track.",
      "remember": "Check your actual track as well as the bow direction."
    }
  ],
  "lessons": [
    {
      "title": "Read the compass circle",
      "subtitle": "Cardinal and halfway points",
      "art": "rose",
      "lead": "Nautical directions are written as three-digit degrees measured clockwise from north. A full turn brings you back to north.",
      "points": [
        [
          "Four main points",
          "North 000° (also 360°), east 090°, south 180°, west 270°."
        ],
        [
          "Halfway points",
          "Northeast 045°, southeast 135°, southwest 225°, northwest 315°. These are convenient anchors, not the only directions."
        ],
        [
          "At the helm",
          "The fixed lubber line is aligned with the bow. Read the card where it meets that line, allowing for boat motion and compass settling."
        ]
      ],
      "scenario": "The card shows 075° C at the lubber line. The bow points between northeast and east; it is not a bearing to an object.",
      "takeaway": "Name a direction in three digits and say which reference it uses."
    },
    {
      "title": "Heading, bearing and planned course",
      "subtitle": "Three different questions",
      "art": "bearing",
      "lead": "First decide what the number describes: bow direction, direction to an object, or the course you intend to make.",
      "points": [
        [
          "Heading",
          "The direction the bow points at that moment. Read it from a suitable heading instrument."
        ],
        [
          "Bearing",
          "The direction from the observer to a charted or identified object. A handheld bearing compass is useful for sighting it."
        ],
        [
          "Planned course",
          "The direction of a planned leg on the chart, with its reference stated. Steering adjustments may be required to achieve the intended track."
        ]
      ],
      "scenario": "A lighthouse bears 045° C while the bow points 090° C. Both can be true: the lighthouse lies to port of the bow.",
      "takeaway": "Ask “direction of what, from where, and relative to which north?”"
    },
    {
      "title": "Heading is not your track",
      "subtitle": "Through water and over ground",
      "art": "track",
      "lead": "A moving boat has several directions. Current and leeway can separate the bow, movement through the water and movement over the ground.",
      "points": [
        [
          "Heading",
          "Where the bow points. It does not by itself tell you where the boat is moving."
        ],
        [
          "Through-water course",
          "The direction of movement relative to the surrounding water, affected by leeway. It is not established by the compass heading alone."
        ],
        [
          "Course over ground",
          "The direction of movement across the Earth while moving, commonly shown as GNSS COG. At very low speed it can be unstable."
        ]
      ],
      "scenario": "A boat points 090° C while COG reads 105°. Check the actual track and position; this difference alone cannot calculate the current.",
      "takeaway": "Use independent position checks to see whether you are following the plan."
    },
    {
      "title": "Two practical compass tools",
      "subtitle": "Steering and hand bearing",
      "art": "types",
      "lead": "The fixed compass helps hold a heading. A handheld bearing compass lets you sight an object. Each reading has a job.",
      "points": [
        [
          "Steering compass",
          "Fixed in the boat, with a lubber line pointing forward. Its reading is the compass heading."
        ],
        [
          "Hand bearing compass",
          "Portable and aimed at a visible object to read its compass bearing. Identify the object before using it for navigation."
        ],
        [
          "Check the surroundings",
          "Nearby metal, magnets and powered equipment can disturb magnetic instruments. Use the actual compass correctly and know its limitations."
        ]
      ],
      "scenario": "You want a lighthouse bearing while steering. Use an appropriate handheld bearing compass, sight the identified lighthouse and record the time and C reference.",
      "takeaway": "A heading instrument and a sighting instrument answer different questions."
    },
    {
      "title": "True and magnetic north",
      "subtitle": "Variation depends on place and time",
      "art": "north",
      "lead": "Charts use true north. Earth’s magnetic field provides magnetic north, and the angular difference is called variation.",
      "points": [
        [
          "True north",
          "The geographic chart reference. Mark a true direction with T."
        ],
        [
          "Magnetic north",
          "The Earth-field reference. Mark a magnetic direction with M; a boat compass may also have its own error."
        ],
        [
          "Find local variation",
          "Use current chart or authoritative variation information for the position and date. No single UK number is valid everywhere or forever."
        ]
      ],
      "scenario": "You plan 080° T on a chart. The same 080 number on a magnetic compass does not automatically make the same direction.",
      "takeaway": "Check the local variation before comparing chart and magnetic directions."
    },
    {
      "title": "Deviation belongs to the boat",
      "subtitle": "Heading-specific compass error",
      "art": "deviation",
      "lead": "Metal and equipment aboard can make the steering compass differ from the local magnetic reference. This is deviation.",
      "points": [
        [
          "Boat influence",
          "Ferrous metal, magnets and electrical equipment near the compass can affect it."
        ],
        [
          "Not one fixed value",
          "Deviation can vary with the vessel’s heading. Use current, applicable boat-specific deviation information."
        ],
        [
          "Check and correct",
          "A suspect compass needs competent assessment. Keep portable magnetic objects away and do not improvise adjusters."
        ]
      ],
      "scenario": "A speaker has been installed beside the compass. Do not assume the old deviation information remains valid.",
      "takeaway": "Variation belongs to the place; deviation belongs to the boat."
    },
    {
      "title": "Convert between compass and chart",
      "subtitle": "C → M → T",
      "art": "conversion",
      "lead": "Do the two corrections separately, writing C, M and T after each result. Sample values here are fictional.",
      "points": [
        [
          "Boat correction",
          "082° C with 2° E deviation gives 084° M: add east, subtract west when moving from C to M."
        ],
        [
          "Place correction",
          "084° M with 4° W variation gives 080° T: add east, subtract west when moving from M to T."
        ],
        [
          "Reverse carefully",
          "To work from T back to C, undo variation then deviation. Check that the deviation applies to the intended heading and wrap around 000–359°."
        ]
      ],
      "scenario": "Do not put 082° C directly on a true chart in this example. Correct it through M to obtain 080° T.",
      "takeaway": "C + signed deviation = M; M + signed variation = T."
    },
    {
      "title": "Plot and verify a bearing",
      "subtitle": "From object to chart line",
      "art": "plot-v2",
      "lead": "A measured compass bearing can provide a line of position after applying the appropriate corrections and confirming the object.",
      "points": [
        [
          "Measure and label",
          "Sight an identified charted object, note time and record the reading as C (or the instrument’s actual reference)."
        ],
        [
          "Convert and plot",
          "Convert to true before plotting on a true chart. The line from the object back toward you uses the reciprocal direction, 180° opposite the bearing to the object."
        ],
        [
          "Do not overclaim",
          "One bearing gives a line of position, not a complete fix. Cross-check with a second bearing, a transit or other independent observation as appropriate."
        ]
      ],
      "scenario": "A lighthouse bears 045° T from the boat. The boat lies somewhere on the reciprocal 225° T line from the lighthouse; one line alone does not fix the boat’s position.",
      "takeaway": "Identify, measure, correct, plot and cross-check."
    }
  ],
  "quiz": [
    [
      "What is the compass direction of east?",
      [
        "090°",
        "180°",
        "270°"
      ],
      0,
      "East is 090° clockwise from north."
    ],
    [
      "What is northeast?",
      [
        "135°",
        "045°",
        "225°"
      ],
      1,
      "Northeast is halfway from north to east."
    ],
    [
      "Where do you read a steering compass heading?",
      [
        "At the fixed lubber line",
        "At the GPS COG field",
        "At the closest lighthouse"
      ],
      0,
      "The lubber line points forward with the boat."
    ],
    [
      "What is the heading?",
      [
        "Direction to a lighthouse",
        "Direction the bow points",
        "Actual ground track"
      ],
      1,
      "Heading describes bow direction."
    ],
    [
      "What is a bearing?",
      [
        "Direction from observer to an object",
        "The depth of water",
        "The vessel’s length"
      ],
      0,
      "A bearing points towards the object from the observer."
    ],
    [
      "A lighthouse bears 045° while the bow heads 090°. What does this mean?",
      [
        "The readings must match",
        "The lighthouse is in a different direction from the bow",
        "The GPS failed"
      ],
      1,
      "The object can lie off the bow."
    ],
    [
      "What is a handheld bearing compass mainly used for?",
      [
        "Sighting the direction to an object",
        "Measuring fuel",
        "Showing exact current"
      ],
      0,
      "It is a sighting instrument."
    ],
    [
      "What does GNSS COG normally show while moving?",
      [
        "The bow heading",
        "Direction of movement over ground",
        "Magnetic deviation"
      ],
      1,
      "COG describes the ground track."
    ],
    [
      "Can heading and COG alone reveal exact current?",
      [
        "Yes",
        "No",
        "Only at night"
      ],
      1,
      "Leeway and other factors also matter."
    ],
    [
      "Which north is a nautical chart direction referenced to?",
      [
        "True north",
        "The vessel’s compass north",
        "The nearest buoy"
      ],
      0,
      "Chart directions use true north."
    ],
    [
      "What is variation?",
      [
        "Boat-specific interference",
        "True-to-magnetic difference at a place",
        "Difference between heading and COG"
      ],
      1,
      "Variation is associated with Earth’s field, place and date."
    ],
    [
      "What is deviation?",
      [
        "Error from magnetic influences aboard",
        "Annual tide change",
        "Chart datum"
      ],
      0,
      "Deviation is the boat compass error relative to magnetic."
    ],
    [
      "082° C plus 2° E deviation gives what?",
      [
        "080° M",
        "084° M",
        "082° T"
      ],
      1,
      "Add east moving C to M."
    ],
    [
      "084° M with 4° W variation gives what true direction?",
      [
        "080° T",
        "088° T",
        "084° C"
      ],
      0,
      "Subtract west moving M to T."
    ],
    [
      "A lighthouse bears 045° T from you. Which line from it can your boat lie on?",
      [
        "045° T",
        "225° T",
        "090° T"
      ],
      1,
      "The reciprocal 225° T line runs back from the object to the observer."
    ],
    [
      "Does one bearing to a charted lighthouse give a complete fix?",
      [
        "Yes, always",
        "No; it gives a line of position",
        "Only if COG matches"
      ],
      1,
      "A second independent line or observation is needed for a fix."
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
  ],
  "beginnerCheck": {
    "question": "The boat heads 090° C, but a lighthouse bears 045° C. What does 045° C tell you?",
    "choices": [
      "The direction from the boat towards the lighthouse",
      "The direction the bow points"
    ],
    "correct": 0,
    "correctText": "Correct. The bearing points towards the lighthouse. The bow still points 090° C.",
    "incorrectText": "Look at the sight line: the boat heads 090° C, while 045° C points from the boat to the lighthouse."
  }
});
