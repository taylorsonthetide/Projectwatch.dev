/* Original recreational diesel teaching and question bank. Reviewed 29 September 2026. */
window.PW_DIESEL={
  "hotspots": [
    {
      "x": 67,
      "y": 60,
      "title": "Oil filler",
      "text": "The blue filler cap is on the rocker cover. Use the specified oil; filling here does not measure the oil level."
    },
    {
      "x": 66.4,
      "y": 51.5,
      "title": "Coolant pressure cap",
      "text": "The pressure cap is on the cooling assembly. Only inspect or open as directed with the engine safely cooled."
    },
    {
      "x": 79,
      "y": 47,
      "title": "Alternator",
      "text": "The alternator is driven by a belt and generates electrical power while running. Inspect its belt only with the engine stopped."
    },
    {
      "x": 70,
      "y": 76,
      "title": "Rigid injection lines",
      "text": "These lines carry high-pressure fuel towards the injectors in the cylinder head. Keep clear of pressure leaks; do not loosen them as a beginner."
    },
    {
      "x": 44,
      "y": 36,
      "title": "Remote fuel filter / separator",
      "text": "This unit is mounted away from the engine. Locate the filters and shutoff valve on your own installation using its documentation."
    }
  ],
  "lessons": [
    {
      "id": "de1",
      "title": "Meet your engine",
      "art": "overview",
      "lead": "A small marine diesel needs clean fuel, air, lubrication, cooling and enough electrical power to start.",
      "points": [
        [
          "Start with its identity",
          "Find the engine model, serial number and gearbox model. Obtain the correct manuals: engines that look similar can have different pumps, filters and service procedures."
        ],
        [
          "Locate the owner’s checks",
          "Use your manual to find the dipstick, oil filler, fuel filters, coolant check point, raw-water strainer and pump, belt, battery isolation and stop control."
        ],
        [
          "Learn the boundaries",
          "The lessons explain a typical four-stroke inboard diesel. Mechanical injection is our fuel-path example; common-rail engines have different controls and high-pressure precautions."
        ]
      ],
      "example": "A four-cylinder Volvo Penta and a four-cylinder Beta share basic principles. Their component locations, fluids and service instructions are not interchangeable.",
      "remember": "Know what each component does before trying to service it."
    },
    {
      "id": "de2",
      "title": "How a four-stroke diesel works",
      "art": "four-stroke",
      "lead": "Air goes in, gets hot under compression, fuel burns, and exhaust goes out. Four piston strokes make one complete cycle.",
      "points": [
        [
          "Intake and compression",
          "The intake valve opens as the piston moves down and draws in air. Both valves then close; the rising piston compresses and heats that air."
        ],
        [
          "Power and exhaust",
          "Fuel is injected near the end of compression and ignites in the hot air. Expanding gas pushes the piston down. The exhaust valve opens for the upward exhaust stroke."
        ],
        [
          "Starting is different from running",
          "The starter turns the engine initially. A diesel uses compression ignition, not a petrol-style spark plug. Glow plugs or other starting aids are model-dependent; follow their instructions."
        ]
      ],
      "example": "The cycle takes two crankshaft revolutions. Four cylinders repeat it at different times to produce more even power.",
      "remember": "Air + compression + correctly delivered fuel = combustion."
    },
    {
      "id": "de3",
      "title": "Before starting: a calm check",
      "art": "checks",
      "lead": "Check with the engine stopped and cool, then keep hands and clothing clear when it runs.",
      "points": [
        [
          "Fluids and supply",
          "Check engine oil, coolant and gearbox oil using the specified methods. Confirm usable fuel, the required fuel valve position, and an open cooling seacock for normal starting afloat."
        ],
        [
          "Look, smell and inspect",
          "Look for fresh fuel, oil or coolant leaks; check the bilge, hoses, clamps and belt condition. Inspect the raw-water strainer safely. Close its seacock before opening where flooding is possible, reseal and reopen before running."
        ],
        [
          "Prepare the boat and crew",
          "Ventilate, secure the boat, confirm neutral, ensure the propeller area is clear and keep people away from rotating parts. Follow the manual’s start procedure. Check cooling discharge and instruments after starting; a dry exhaust or continuing alarm needs prompt action."
        ]
      ],
      "example": "A loose strainer lid can draw air even with the seacock open. After reassembly, check for a good seal, leaks and restored cooling flow.",
      "remember": "Oil, coolant, fuel, seawater supply and a clear engine space."
    },
    {
      "id": "de4",
      "title": "Follow the fuel from tank to cylinder",
      "art": "fuel",
      "lead": "There is a low-pressure supply side and a high-pressure injection side. They do different jobs.",
      "points": [
        [
          "Supply and clean",
          "In our mechanical-injection example, fuel passes from tank and shutoff valve through a primary filter/water separator, lift pump and engine-mounted fine filter."
        ],
        [
          "Meter and inject",
          "The injection pump delivers timed high-pressure fuel through rigid lines to injectors in the cylinder head. Modern common-rail systems use a rail and electronically controlled injectors."
        ],
        [
          "Return and protect",
          "Surplus fuel returns to the tank in this example. Actual routing varies. Never search for a pressure leak with your hand, loosen high-pressure lines to bleed, or dismantle injectors as a beginner. Injection injuries require urgent medical attention."
        ]
      ],
      "example": "If the engine loses power after rough water, disturbed tank contamination may restrict the filters. That is a possibility to investigate, not a diagnosis.",
      "remember": "Clean the fuel before it reaches the expensive injection equipment."
    },
    {
      "id": "de5",
      "title": "Filters, water and air in the fuel",
      "art": "filters",
      "lead": "A separator removes water and particles; a fine filter protects the injection system. Air in the supply can stop the engine.",
      "points": [
        [
          "Inspect the separator",
          "Water collects low in a suitable separator. Follow its maker’s method for inspection and draining into a container with the engine stopped. Some units have a metal bowl or sensor rather than a clear bowl."
        ],
        [
          "Change the right element",
          "Use the specified element and filtration rating. Contain spills, keep connections clean, check old seals have been removed, fit the correct new seals and follow the tightening instructions. Do not pour unfiltered fuel into a clean outlet."
        ],
        [
          "Prime only as instructed",
          "Filter changes or an empty tank may introduce air. Some engines self-prime; others use a hand pump and specified low-pressure bleed points. Follow the exact manual. Recheck for leakage and dependable running before departure."
        ]
      ],
      "example": "An engine starts briefly after a filter change, then stops. First consider incomplete priming or an air leak at the new seal; do not start undoing injector pipes.",
      "remember": "Water and air do not belong in the fuel supply."
    },
    {
      "id": "de6",
      "title": "Diesel bug: recognise and prevent it",
      "art": "diesel-bug",
      "lead": "Microbes can grow where water and diesel meet. Their debris can block filters, but dark sludge alone does not prove diesel bug.",
      "points": [
        [
          "Recognise the clues",
          "Recurring blocked filters, slime and water contamination justify investigation. Dirt, corrosion products, aged fuel and wax can also cause restrictions. A fuel sample or specialist testing helps distinguish the cause."
        ],
        [
          "Remove the conditions",
          "Buy fuel from a reliable source, inspect filler seals and vents, keep water out, check the separator and manage fuel age. Tank inspection and removal of accumulated water may require a competent specialist."
        ],
        [
          "Treat the whole problem",
          "A suitable approved biocide may be part of a confirmed treatment plan, with correct compatibility and dosage. Killing microbes does not remove sludge or dead biomass; tank cleaning, fuel treatment and filter replacement may still be needed."
        ]
      ],
      "example": "A new filter blocks again soon after treatment. Debris may still be reaching it. Repeatedly adding more chemical is not a substitute for investigating and cleaning the contaminated system.",
      "remember": "Prevent water ingress; investigate repeated contamination."
    },
    {
      "id": "de7",
      "title": "Cooling: two separate water circuits",
      "art": "cooling",
      "lead": "On a heat-exchanger-cooled engine, engine coolant and seawater exchange heat while staying separate.",
      "points": [
        [
          "Closed coolant circuit",
          "A circulation pump moves the specified coolant through the engine. A thermostat controls temperature and flow to the heat exchanger; a bypass may circulate coolant during warm-up. Check level only by the manual’s safe cool-engine method."
        ],
        [
          "Open raw-water circuit",
          "Seawater enters through the hull seacock and strainer, passes through the raw-water pump and heat exchanger, then commonly joins the wet exhaust. Gearbox coolers and anti-siphon arrangements may also be fitted; their order is installation-specific."
        ],
        [
          "Watch for lost cooling",
          "A shut seacock, blocked strainer, air leak, damaged impeller or fouled exchanger can reduce cooling. No normal discharge, steam or a rising temperature needs prompt attention. Never remove a hot pressurised coolant cap. Running ashore requires an approved raw-water supply; do not run this cooling system dry."
        ]
      ],
      "example": "The exhaust suddenly sounds hollow and dry. Treat that as a possible raw-water supply failure; do not wait for the temperature alarm before responding.",
      "remember": "Coolant cools the engine; seawater carries the heat away."
    },
    {
      "id": "de8",
      "title": "Raw-water pump and impeller",
      "art": "impeller",
      "lead": "A flexible rubber impeller moves raw water. Its position and drive depend on the engine: belt-driven and gear-driven arrangements both exist.",
      "points": [
        [
          "Understand the part",
          "Flexible vanes change shape in the pump housing to move water. It is not the engine’s coolant circulation pump. A photograph of a belt-driven Yanmar pump is one real example, not the layout of every four-cylinder engine."
        ],
        [
          "Recognise damage",
          "Cracked, set, worn or missing vanes can reduce flow. Dry running can damage an impeller rapidly. A failed shaft seal can leak; pump replacement or seal work may need an engineer."
        ],
        [
          "Check the complete circuit",
          "Stop the engine, prevent accidental starting and close the cooling seacock before opening a pump that could admit water. Use the manual for service. Recover missing vane pieces from downstream components; a new impeller does not clear an obstructed heat exchanger."
        ]
      ],
      "example": "The old impeller has one vane missing. Replacing it is only part of the job: the missing piece may have travelled into a cooler or heat exchanger.",
      "remember": "A missing vane is also a possible blockage downstream."
    },
    {
      "id": "de9",
      "title": "Oil, lubrication and the gearbox",
      "art": "lubrication",
      "lead": "Oil carries load between moving surfaces, reduces wear and helps manage heat. The engine and gearbox have separate requirements.",
      "points": [
        [
          "Read the level correctly",
          "Use the manual’s dipstick procedure, boat attitude and waiting time. Keep within the specified marks; too little and too much oil can both cause problems. Gearbox level methods may differ, including whether its dipstick is screwed in."
        ],
        [
          "Use the correct products",
          "Oil grade, specification, quantity and filter depend on engine and gearbox. A gearbox may require a different fluid entirely. Service at the stated hours or calendar interval, whichever is due first."
        ],
        [
          "Understand an oil-and-filter service",
          "The visual sequence is: identify the correct oil and filter, stop and make safe, contain and remove old oil, replace the filter and seal as specified, refill to the correct level, then perform the manual’s leak/level checks. Warm oil may drain more easily but can burn; never work beside moving machinery."
        ],
        [
          "Recognise warning signs",
          "Unexpectedly rising oil level, milky oil, fuel smell or metal debris requires investigation. A low-oil-pressure warning while running is urgent; adding oil does not automatically cure low pressure. Do not keep running to see if it clears."
        ]
      ],
      "example": "The oil level has risen above maximum without topping up. That may indicate contamination. Stop treating the dipstick as reassurance and have the cause checked.",
      "remember": "Oil level and oil pressure are different things."
    },
    {
      "id": "de10",
      "title": "Starting battery, alternator and belts",
      "art": "electrics",
      "lead": "The battery supplies cranking power. Once running, the alternator normally recharges it through the boat’s charging system.",
      "points": [
        [
          "No crank or slow crank",
          "Check the approved starting sequence, neutral interlock where fitted, correct battery bank and isolator position. A discharged battery, loose or corroded connection, cable fault or starter fault are possible causes. Do not bridge terminals. Observe the manual’s cranking limits and pauses. Repeated cranking of a wet-exhaust engine can accumulate seawater and cause hydraulic lock; use its model-specific procedure, not a universal seacock rule."
        ],
        [
          "Inspect with the engine stopped",
          "Look for cracked, glazed or frayed belts and loose connections. Belt tension and routing are model-specific; keep fingers, clothing and tools away when running. A belt may drive cooling equipment as well as the alternator."
        ],
        [
          "Respond to charging faults",
          "A continuing charge warning may indicate belt, alternator or wiring trouble. A mechanically injected engine may keep running, but an electronic engine can depend on electrical power. Do not disconnect the battery or operate its isolator while the engine runs unless the manufacturer explicitly permits it."
        ]
      ],
      "example": "The charge light stays on and the belt is damaged. Before assuming you can continue on battery power, find out what else that belt drives.",
      "remember": "Cranking, charging and cooling may be connected by one fault."
    },
    {
      "id": "de11",
      "title": "Air, exhaust and interpreting smoke",
      "art": "exhaust",
      "lead": "An engine needs a clear air supply and a sound exhaust system. Colour is a clue, not a reliable diagnosis on its own.",
      "points": [
        [
          "Air and carbon monoxide",
          "Check ventilation and the specified air cleaner with the engine stopped. Exhaust leaks can expose people to carbon monoxide, including from diesels. Maintain alarms and exhaust components; keep outlets clear and do not run in poorly ventilated enclosed spaces."
        ],
        [
          "Read the whole picture",
          "Persistent black smoke can relate to excess load or insufficient air; blue smoke can indicate oil burning; white smoke can be unburned fuel or other faults. Steam may indicate inadequate raw-water cooling. Compare temperature, load, duration and cooling flow."
        ],
        [
          "Know when to stop investigating",
          "A significant exhaust leak, serious overheating, abnormal knocking or fuel leakage needs immediate action to protect people and the boat. Maintain control, stop the engine when safe and appropriate, and seek assistance if needed."
        ]
      ],
      "example": "A white plume with rising temperature and reduced exhaust water is different from brief cold-start smoke. The accompanying observations change the urgency.",
      "remember": "Smoke colour gives a starting point, not a verdict."
    },
    {
      "id": "de12",
      "title": "Service planning, spares and winter care",
      "art": "service",
      "lead": "Use the engine and gearbox manuals to build a service schedule. There is no universal marine-diesel interval.",
      "points": [
        [
          "Plan by hours and time",
          "Record model, serial number, hours, date, parts and work done. Include first-service requirements, oil and filters, fuel filters, belts, impeller, coolant, hoses, heat exchanger and anodes where fitted. Obtain specialist help for adjustments and high-pressure work."
        ],
        [
          "Carry useful, correct spares",
          "Suitable fuel filters, an impeller and its cover seal, approved belts, fluids and the tools you can safely use may be valuable. Knowing the part numbers and having the manuals is as important as the box of spares."
        ],
        [
          "Prepare for storage",
          "Follow the manufacturer’s preservation procedure for expected frost and lay-up duration. Closed-loop antifreeze does not automatically protect the raw-water circuit. Do not dry-run the impeller; manage batteries and fuel, and collect fluids for proper disposal. Recommission before use."
        ]
      ],
      "example": "An engine runs few hours this year. Calendar-based service can still be due. Its raw-water cooling circuit also needs its own winter plan.",
      "remember": "A service record turns “probably done” into something you can check."
    }
  ],
  "quiz": [
    [
      "What causes ignition in a normal diesel cycle?",
      [
        "Heat from compressing air, with fuel injected at the right time",
        "A petrol-style spark plug firing continuously",
        "The alternator directly heating the fuel"
      ],
      0,
      "Diesel combustion uses compression ignition. Starting aids depend on the engine."
    ],
    [
      "How many crankshaft turns make one four-stroke cycle?",
      [
        "One",
        "Two",
        "Four"
      ],
      1,
      "Intake, compression, power and exhaust take two crankshaft revolutions."
    ],
    [
      "What is the best first step in learning the service points?",
      [
        "Use a picture of any green engine",
        "Assume every four-cylinder engine is the same",
        "Find the model and correct operator’s manual"
      ],
      2,
      "Component locations and procedures vary between models."
    ],
    [
      "Where does separated water normally collect in a suitable fuel separator?",
      [
        "At the bottom of its collection space",
        "Inside the alternator",
        "At the top of the air filter"
      ],
      0,
      "Water is denser than diesel. Follow the separator maker’s inspection and draining method."
    ],
    [
      "A filter change introduces air. What should you do?",
      [
        "Loosen injector pipes while cranking",
        "Follow the specified low-pressure priming or self-priming procedure",
        "Keep cranking without limit"
      ],
      1,
      "Do not open high-pressure injection lines as a beginner."
    ],
    [
      "What does dark sludge in a fuel filter prove?",
      [
        "The fuel has no water",
        "That the injectors need tightening",
        "It needs investigation; diesel bug is only one possible cause"
      ],
      2,
      "Dirt, aged fuel, wax and microbial contamination can cause restrictions."
    ],
    [
      "Why can filters block after biocide treatment?",
      [
        "Dead biomass and other debris can remain in the fuel system",
        "Biocide permanently replaces filters",
        "The coolant has become colder"
      ],
      0,
      "Treatment may need cleaning and debris removal as well as compatible approved biocide."
    ],
    [
      "In a normal heat exchanger, what happens to coolant and seawater?",
      [
        "They mix to cool the engine",
        "They exchange heat without normally mixing",
        "They both become lubricating oil"
      ],
      1,
      "The two circuits are normally separate."
    ],
    [
      "The raw-water exhaust discharge disappears. What is the sensible response?",
      [
        "Wait until the oil light appears",
        "Increase rpm to force the blockage through",
        "Maintain boat safety and respond promptly to possible cooling failure"
      ],
      2,
      "Do not wait for overheating to become severe."
    ],
    [
      "When is a pressurised coolant cap safe to open?",
      [
        "Only when cooled and according to the manual",
        "Whenever the engine is overheating",
        "With a cloth while it is still very hot"
      ],
      0,
      "Hot pressurised coolant can cause severe burns."
    ],
    [
      "An impeller has a missing vane. What else needs attention?",
      [
        "Only the battery terminals",
        "Locating the missing piece in downstream cooling components",
        "The compass deviation card"
      ],
      1,
      "Debris can obstruct a cooler or heat exchanger."
    ],
    [
      "Is the raw-water pump always driven by the alternator belt?",
      [
        "Yes, on every diesel",
        "Yes, on every four-cylinder engine",
        "No; pump location and drive vary by engine"
      ],
      2,
      "Belt-driven and gear-driven arrangements exist."
    ],
    [
      "Low oil pressure is indicated while running. What should you do?",
      [
        "Treat it as urgent, maintain safety and stop to investigate",
        "Add extra oil above maximum and carry on",
        "Assume that normal oil level makes it harmless"
      ],
      0,
      "Normal level does not prove adequate pressure."
    ],
    [
      "Can engine oil automatically be used in the gearbox?",
      [
        "Yes, all marine gearboxes use it",
        "No; use the gearbox’s specified fluid and checking method",
        "Only if the engine has four cylinders"
      ],
      1,
      "Some gearboxes need different fluid and procedures."
    ],
    [
      "What is a safe basic check for slow cranking?",
      [
        "Bridge starter terminals with a screwdriver",
        "Disconnect battery cables while cranking",
        "Check approved start settings, battery condition and connections safely"
      ],
      2,
      "A weak battery or poor connection is possible, but not the only cause."
    ],
    [
      "When should belt condition be checked by hand?",
      [
        "With the engine stopped and accidental starting prevented",
        "With the engine idling slowly",
        "While someone operates the starter"
      ],
      0,
      "Rotating belts and pulleys can trap fingers and clothing."
    ],
    [
      "What does white smoke always mean?",
      [
        "A failed head gasket",
        "No single diagnosis; consider start conditions, cooling flow and other signs",
        "A healthy raw-water pump"
      ],
      1,
      "Steam and smoke can have different causes. Use the whole set of observations."
    ],
    [
      "How should service intervals be chosen?",
      [
        "By engine paint colour",
        "By using one interval for every brand",
        "From the correct manual, considering running hours and calendar time"
      ],
      2,
      "First-service requirements and normal intervals also differ."
    ],
    [
      "Does engine coolant antifreeze automatically protect the raw-water side in winter?",
      [
        "No; the raw-water circuit needs the specified separate preservation procedure",
        "Yes, the circuits are always mixed",
        "Only when the alternator belt is new"
      ],
      0,
      "Normal heat-exchanger circuits remain separate."
    ],
    [
      "A high-pressure fuel leak is suspected. What should a beginner do?",
      [
        "Feel for the leak with a finger",
        "Keep clear, make the boat safe, stop as appropriate and get qualified help",
        "Undo the pipe to release pressure while running"
      ],
      1,
      "Pressurised fuel can penetrate skin. Do not open the high-pressure side."
    ]
  ],
  "faults": [
    [
      "The starter clicks and turns very slowly.",
      "electrics",
      [
        "Keep trying repeatedly",
        "Make the boat safe; check start settings and the starting battery/connection condition safely",
        "Loosen an injector pipe"
      ],
      1,
      "Slow cranking points first towards starting power or connections, but a starter or mechanical fault is also possible. Avoid repeated cranking and follow the engine’s limits."
    ],
    [
      "The starter turns normally, but the engine will not fire after a fuel-filter change.",
      "fuel",
      [
        "Check the specified priming procedure and possible air leaks on the low-pressure side",
        "Pour fuel directly into the air intake",
        "Crank continuously until it catches"
      ],
      0,
      "Air after a filter change is plausible. Use only the model’s approved priming method. Repeated cranking on a wet-exhaust engine risks seawater accumulation and hydraulic lock; follow its specific instructions."
    ],
    [
      "Normal exhaust water disappears and the temperature starts to rise.",
      "cooling",
      [
        "Open the hot coolant cap",
        "Increase speed to clear it",
        "Protect boat control, stop when safe and investigate the cooling supply"
      ],
      2,
      "A raw-water problem can damage the engine and exhaust quickly. Cool before inspection; check seacock, strainer, leaks, pump and downstream restrictions using the manual."
    ],
    [
      "Filters repeatedly clog and there is water and dark slime in the separator.",
      "diesel-bug",
      [
        "Investigate contamination, sample the fuel and arrange appropriate cleaning/treatment",
        "Add unlimited biocide and carry on",
        "Remove the filters permanently"
      ],
      0,
      "These clues justify investigation, not certainty. Remove water and debris and use compatible approved treatment only as specified."
    ],
    [
      "The engine is running and the low-oil-pressure warning remains on.",
      "lubrication",
      [
        "Ignore it if the dipstick looked fine",
        "Protect people and boat control; stop and investigate promptly",
        "Fill above maximum to force more pressure"
      ],
      1,
      "Low oil pressure is urgent. Level, pressure and sensor operation are distinct. Do not assume a faulty alarm without verifying the cause."
    ],
    [
      "The old impeller has lost a vane. A new one is fitted.",
      "impeller",
      [
        "The job is definitely finished",
        "The missing vane has dissolved",
        "Find and remove missing debris from the downstream circuit and verify cooling"
      ],
      2,
      "Rubber pieces can lodge in coolers or the heat exchanger. Replacing only the rotor may leave a blockage."
    ],
    [
      "The charge warning stays on and a belt looks damaged.",
      "electrics",
      [
        "Check what the belt drives and assess cooling as well as charging, with the engine safely stopped",
        "Disconnect the battery while running",
        "Touch the belt while idling to check its tension"
      ],
      0,
      "The belt may also drive a coolant pump. Layout is model-specific, and moving belts are dangerous."
    ],
    [
      "You smell diesel and see a fresh fuel leak while underway.",
      "fuel",
      [
        "Keep running to use up the leaking fuel",
        "Make the boat safe, stop as appropriate, avoid ignition sources and seek help",
        "Find a high-pressure leak with your hand"
      ],
      1,
      "Protect people and navigation first. Fuel leakage is a fire hazard; never use hands to check pressure leaks."
    ]
  ],
  "sources": [
    [
      "Beta Marine operator manuals (current engine-specific instructions)",
      "https://betamarine.co.uk/literature-downloads-seagoing/"
    ],
    [
      "Volvo Penta: find the manual for your engine",
      "https://www.volvopenta.com/support/"
    ],
    [
      "Yanmar YM-series example operator manual",
      "https://www.yanmar.com/media/global/com/product/marinepleasure/sailBoatPropulsion/operationmanual/0AYMM-EN0023_English.pdf"
    ],
    [
      "RYA Diesel Engine course syllabus",
      "https://www.rya.org.uk/course-finder/diesel-engine-course/"
    ],
    [
      "Parker Racor: contamination and microbial growth",
      "https://www.racornews.com/single-post/faq-spotlight-dark-wet-stuff-on-your-used-filter"
    ]
  ],
  "photos": [
    {
      "file": "volvo-d2-75.webp",
      "title": "Real four-cylinder Volvo Penta D2-75 during dismantling",
      "credit": "Goelette Cardabela",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Images_Volvo_D2-75-001.jpg",
      "note": "Photograph sheet resized and recompressed; content unchanged. Parts are removed: this is not a ready-to-run installation or a servicing instruction."
    },
    {
      "file": "yanmar-engine.webp",
      "title": "Real Yanmar 2GM20 front view",
      "credit": "PHGCOM",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Yanmar_2GM20.JPG",
      "note": "Photograph resized and recompressed; content unchanged. Yanmar 2GM20 is a two-cylinder reference; its component layout is not a four-cylinder model’s service guide."
    },
    {
      "file": "raw-water-pump.webp",
      "title": "A real belt-driven raw-water pump",
      "credit": "PHGCOM",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Water_Pump.JPG",
      "note": "Photograph resized and recompressed; content unchanged. Yanmar 2GM20 is a two-cylinder reference; its component layout is not a four-cylinder model’s service guide."
    },
    {
      "file": "injectors.webp",
      "title": "Real injectors and rigid fuel lines at the cylinder head",
      "credit": "PHGCOM",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Yanmar_Injectors.JPG",
      "note": "Photograph resized and recompressed; content unchanged. Yanmar 2GM20 is a two-cylinder reference; its component layout is not a four-cylinder model’s service guide."
    },
    {
      "file": "oil-filter.webp",
      "title": "Real engine oil filter and dipstick",
      "credit": "PHGCOM",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Oil_filter.JPG",
      "note": "Photograph resized and recompressed; content unchanged. Yanmar 2GM20 is a two-cylinder reference; its component layout is not a four-cylinder model’s service guide."
    },
    {
      "file": "four-cylinder-real.webp",
      "title": "Real four-cylinder marine diesel installation",
      "credit": "Cjp24",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Marine_diesel_engine_with_hydraulic_machinery.jpg",
      "note": "Resized and recompressed; content unchanged. Rental-boat installation with a hydrostatic transmission; brand and exact model are not confirmed. Numbered teaching overlays are supplied under CC BY-SA 4.0."
    }
  ],
  "checklist": [
    "Correct engine and gearbox manuals available",
    "Engine and gearbox fluid levels checked by their own methods",
    "Coolant checked safely with engine cool",
    "Enough usable fuel and intended fuel supply available",
    "No fresh fuel, oil, coolant or seawater leaks",
    "Cooling seacock and strainer checked for normal operation afloat",
    "Belt and hoses inspected with engine stopped",
    "Battery/start settings checked; boat secure and control in neutral",
    "Crew, clothing and tools clear of moving parts",
    "After starting: normal cooling discharge and instruments checked"
  ]
};
