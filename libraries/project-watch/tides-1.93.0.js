/* Original Project Watch recreational tides teaching. Diagrams are separate assets. */
window.PW_TIDES_LIBRARY = Object.freeze({
  "version": "1.93.0",
  "lessons": [
    {
      "title": "The tide cycle",
      "subtitle": "Why the water rises and falls",
      "image": "assets/tides/tide-cycle.svg",
      "alt": "The tide cycle teaching diagram",
      "lead": "The Moon is the strongest driver of the tide; the Sun also matters. Local coastlines change the pattern you actually see.",
      "points": [
        {
          "title": "Gravity and location",
          "text": "The Moon and Sun produce tidal forces. The rotation of Earth and the shape of seas and estuaries turn that forcing into local high and low waters. Many UK ports have roughly two highs and two lows a day, but timings and shapes vary."
        },
        {
          "title": "Springs and neaps",
          "text": "Spring tides occur around new and full Moon when solar and lunar effects reinforce; neaps occur around quarter Moon when they partly offset. “Spring” describes the range, not the season."
        },
        {
          "title": "Local patterns",
          "text": "Some ports have a stand, double high water or asymmetric rise and fall. Never assume that every location follows a smooth six-hour rise and six-hour fall."
        }
      ],
      "scenario": "A weekend cruise is at neaps. Does that mean the sea is necessarily calm? No. Tidal range is smaller; wind and sea state still need their own forecast.",
      "takeaway": "Check the local port prediction and the weather separately."
    },
    {
      "title": "Find the prediction",
      "subtitle": "High and low water tables",
      "image": "assets/tides/tide-table.svg",
      "alt": "Find the prediction teaching diagram",
      "lead": "Start with the right place, date, time standard and source before using any number.",
      "points": [
        {
          "title": "Read the entries",
          "text": "A table gives predicted times and heights of high and low water for a named port and date. The height is above the chart datum used by the product, not the water depth at your berth."
        },
        {
          "title": "Check time and locality",
          "text": "Check whether the source displays UTC, local time or BST. A secondary port may require time and height corrections from a standard port; use the official product instructions."
        },
        {
          "title": "Prediction is not observation",
          "text": "Atmospheric pressure, wind and other conditions can push actual water above or below a prediction. Check recent observations and local notices when clearance is tight."
        }
      ],
      "scenario": "A tide table says high water 14:20. Your watch and chartplotter show different zones. Resolve the time standard before planning arrival.",
      "takeaway": "Write the source, date, port and time zone in the passage note."
    },
    {
      "title": "Depth under the boat",
      "subtitle": "Chart datum and clearance",
      "image": "assets/tides/chart-datum.svg",
      "alt": "Depth under the boat teaching diagram",
      "lead": "Combine the charted depth with the predicted height, then allow for the boat and uncertainty.",
      "points": [
        {
          "title": "Soundings and drying heights",
          "text": "A charted sounding is normally depth below chart datum. Approximate depth at a time = charted depth + height of tide. A drying height is above chart datum: approximate depth over it = height of tide − drying height."
        },
        {
          "title": "Under-keel clearance",
          "text": "Approximate clearance = available depth − vessel draught. Keep an additional margin for squat, waves, heel, survey accuracy, silt and uncertainty in actual tide."
        },
        {
          "title": "Know the reference",
          "text": "Do not add a tidal height to a bridge clearance or an arbitrary marina depth. Vertical clearances may use another reference level; read the chart notes and local information."
        }
      ],
      "scenario": "Charted depth 2.0 m, predicted height 1.5 m, draught 1.2 m: estimated still-water clearance is 2.3 m before safety allowance.",
      "takeaway": "Try the depth workshop below using training numbers."
    },
    {
      "title": "Between high and low",
      "subtitle": "Tidal curves and local corrections",
      "image": "assets/tides/tidal-curve.svg",
      "alt": "Between high and low teaching diagram",
      "lead": "A curve shows how quickly the height changes; the middle of the tide may rise or fall fastest.",
      "points": [
        {
          "title": "Use the curve",
          "text": "For an intermediate time, use the official port curve or prediction if available. Plot the correct day’s high and low waters and read the height at the required time."
        },
        {
          "title": "Rule of twelfths",
          "text": "The 1–2–3–3–2–1 sketch divides a six-hour range into approximate hourly changes. It assumes a simple tide and is unreliable at ports with unusual curves, stands or double highs."
        },
        {
          "title": "Clearance decisions",
          "text": "When depth matters, use current official data for the exact area, check uncertainty and leave a margin. The sketch is for understanding the shape, not a substitute for a prediction."
        }
      ],
      "scenario": "A shallow entrance is usable only near high water. Read its local curve and the harbour guidance instead of guessing halfway height.",
      "takeaway": "Treat every drawn curve here as schematic, never a real port prediction."
    },
    {
      "title": "The water moves sideways",
      "subtitle": "Flood, ebb, set and rate",
      "image": "assets/tides/tidal-stream.svg",
      "alt": "The water moves sideways teaching diagram",
      "lead": "Height and stream describe different things. A tide can be high while the stream is still moving.",
      "points": [
        {
          "title": "Language",
          "text": "A flood stream generally accompanies the rising phase; ebb accompanies falling. “Set” is the direction the water flows towards. “Rate” is its speed in knots."
        },
        {
          "title": "Slack water",
          "text": "Slack is a period of weak or changing stream. It need not coincide exactly with high or low water, especially in channels and constricted water."
        },
        {
          "title": "Local effects",
          "text": "Headlands, narrows, shallow banks and estuaries can accelerate or turn the stream. Wind against a strong stream can make steep, uncomfortable or dangerous seas."
        }
      ],
      "scenario": "You plan to round a headland at high water. Can you assume slack? No: consult the local stream prediction or atlas.",
      "takeaway": "Read both the height and the stream for the route."
    },
    {
      "title": "Read stream information",
      "subtitle": "Atlases and tidal diamonds",
      "image": "assets/tides/stream-atlas.svg",
      "alt": "Read stream information teaching diagram",
      "lead": "Match the correct hour to the reference port, then use the arrow and rate for your position.",
      "points": [
        {
          "title": "Atlas hour",
          "text": "An atlas commonly shows hourly stream arrows before and after high water at a named reference port. Check which port, which high water and the publication’s time convention."
        },
        {
          "title": "Spring and neap rates",
          "text": "Tidal diamonds and atlas tables may give mean spring and mean neap rates. The actual rate varies through the cycle and with location and weather."
        },
        {
          "title": "Update the chart",
          "text": "Use a current authorised chart or service, correct edition and local warnings. The diagram here teaches the reading process and contains no real navigation data."
        }
      ],
      "scenario": "Your atlas plate is labelled HW Dover −2. Find the relevant Dover high-water time, then apply that hour to the correct place on your route.",
      "takeaway": "The reference port need not be the nearest harbour."
    },
    {
      "title": "Allow for the stream",
      "subtitle": "Set, drift and course to steer",
      "image": "assets/tides/set-drift.svg",
      "alt": "Allow for the stream teaching diagram",
      "lead": "The boat’s motion through the water and the water’s motion over the ground add as vectors.",
      "points": [
        {
          "title": "Track over ground",
          "text": "A boat travelling north at 4 kn through the water with a 1 kn eastward stream will, in one hour, move about 4 NM north and 1 NM east if its heading stays north."
        },
        {
          "title": "Counter the stream",
          "text": "To hold a north ground track in that simplified steady example, steer about 14° west of north at 4 kn through the water. Northward progress then falls to about 3.9 kn."
        },
        {
          "title": "Recheck underway",
          "text": "Log, compass, GPS track and speed over ground answer different questions. Recheck set and rate as they change; do not treat a calculated course as a guarantee."
        }
      ],
      "scenario": "A GPS track drifts to starboard of the intended line. First identify actual set and rate, then adjust heading and monitor the new track.",
      "takeaway": "Practice the simple drift model below; it is a teaching model."
    },
    {
      "title": "Plan the tidal window",
      "subtitle": "Timing a recreational passage",
      "image": "assets/tides/passage-window.svg",
      "alt": "Plan the tidal window teaching diagram",
      "lead": "Put height, stream and weather on one timeline and build a fallback.",
      "points": [
        {
          "title": "Depth window",
          "text": "Identify the least depth on the route, boat draught and a sensible margin. Work back from the predicted height at the actual transit time, including secondary-port corrections where required."
        },
        {
          "title": "Stream window",
          "text": "Estimate favorable and adverse streams for each leg. A strong adverse stream changes speed over ground and arrival time; near headlands, wind against tide can matter more than an average rate."
        },
        {
          "title": "Decision points",
          "text": "Check weather, daylight, harbour instructions and a safe alternative. Use current official predictions and warnings just before departure, then monitor actual conditions underway."
        }
      ],
      "scenario": "An entrance has enough predicted depth at 16:00 but the last leg faces a strong adverse stream. Recalculate ETA and preserve an alternative port.",
      "takeaway": "A passage plan needs both arrival time and a usable depth window."
    }
  ],
  "quiz": [
    {
      "question": "What does the height in a tide table normally measure?",
      "options": [
        "Height above the product’s chart datum",
        "Depth under every vessel",
        "Height above the marina pontoon"
      ],
      "answer": 0,
      "explanation": "Use the named product datum and local chart."
    },
    {
      "question": "When do spring tides generally occur?",
      "options": [
        "Around new and full Moon",
        "Only during the spring season",
        "Only in a spring gale"
      ],
      "answer": 0,
      "explanation": "The term describes a larger tidal range."
    },
    {
      "question": "A sounding is 2.0 m and the predicted tidal height is 1.5 m. What is approximate still-water depth?",
      "options": [
        "3.5 m",
        "0.5 m",
        "2.0 m"
      ],
      "answer": 0,
      "explanation": "Add sounding and height when the references match."
    },
    {
      "question": "A drying height is 1.0 m and tidal height is 1.6 m. What is the approximate water depth over it?",
      "options": [
        "0.6 m",
        "2.6 m",
        "1.6 m"
      ],
      "answer": 0,
      "explanation": "Subtract drying height from tidal height."
    },
    {
      "question": "Can you assume slack stream exactly at high water?",
      "options": [
        "No; consult local stream information",
        "Yes, at every port",
        "Only on spring tides"
      ],
      "answer": 0,
      "explanation": "Height and stream timing can differ."
    },
    {
      "question": "What does “set” describe?",
      "options": [
        "Direction the stream flows towards",
        "The time of low water",
        "The vessel’s draught"
      ],
      "answer": 0,
      "explanation": "Rate is speed; set is direction."
    },
    {
      "question": "Which high water is relevant to a stream atlas labelled HW at a reference port?",
      "options": [
        "The named reference port’s high water",
        "The nearest marina’s high water",
        "Any high water on the same day"
      ],
      "answer": 0,
      "explanation": "Match the reference port and hour in the publication."
    },
    {
      "question": "A 1 kn eastward stream acts on a northbound boat for one hour. About how far east does water carry it?",
      "options": [
        "1 NM",
        "4 NM",
        "0.1 NM"
      ],
      "answer": 0,
      "explanation": "Distance = speed × time in this simplified constant-stream example."
    },
    {
      "question": "What is the best basis for a constrained shallow-water transit?",
      "options": [
        "Current local prediction, chart, corrections and safety margin",
        "Rule of twelfths alone",
        "A tide height from any nearby port"
      ],
      "answer": 0,
      "explanation": "Allow for local and weather-related uncertainty."
    },
    {
      "question": "Why check wind against tide?",
      "options": [
        "It can produce steep, rough seas",
        "It always raises the predicted high water",
        "It switches off the stream"
      ],
      "answer": 0,
      "explanation": "Waves can steepen against a strong current."
    },
    {
      "question": "What should you check before using a published tidal time?",
      "options": [
        "Place, date and time standard",
        "The vessel’s paint colour",
        "Only the month"
      ],
      "answer": 0,
      "explanation": "UTC/BST and locality errors affect the whole plan."
    },
    {
      "question": "What does a negative result in a depth margin calculation mean?",
      "options": [
        "The chosen allowance is not met in the model",
        "A safe passage is guaranteed",
        "The charted depth becomes negative"
      ],
      "answer": 0,
      "explanation": "Replan with current local data and an adequate margin."
    }
  ],
  "sources": [
    {
      "label": "UKHO EasyTide — tide predictions and FAQ",
      "url": "https://easytide.admiralty.co.uk/"
    },
    {
      "label": "UKHO Admiralty Tide Tables",
      "url": "https://www.admiralty.co.uk/publications/publications-and-reference-guides/admiralty-tide-tables"
    },
    {
      "label": "UKHO Admiralty Tidal Stream Atlases",
      "url": "https://www.admiralty.co.uk/publications/miscellaneous-tidal-publications/admiralty-tidal-stream-atlases"
    },
    {
      "label": "Met Office — what causes tides?",
      "url": "https://weather.metoffice.gov.uk/learn-about/weather/oceans/tides"
    },
    {
      "label": "RNLI — tide and sea conditions",
      "url": "https://rnli.org/magazine/magazine-featured-list/2024/may/seven-things-rnli-crews-can-teach-you-about-weather-and-tides"
    }
  ]
});
