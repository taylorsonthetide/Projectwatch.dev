# Personal comfort simulation and weather display
Clifton Taylor, 6 October 2026: navigation testing stays unlinked from the main site. Wind uses labelled arrows and knots; currents use fine animated flow trails inspired by the supplied TZ iBoat recording, with labelled current speeds; waves use miniature animated crests with significant height and mean period; tide state stays separate and legible.

Play compares the remaining download, up to 72 hours from now, against saved vessel preferences. Explain within / near / above limits in a paragraph and show approximate hourly time windows across the sampled sea area. Missing data must not give an all-clear. This is not a route-timed passage forecast.

The user's N43 example of 2 m height and 9 s spacing is an editable simulation starter, not an established rating or researched owner consensus. Preserve existing settings; apply the starter only through its button and Save vessel.

Rules: amber starts at 80% of the height limit; above the limit is red. Short periods count once waves reach half the height limit or 1 m, whichever is lower. Short period alone in appreciable waves is amber; near-limit height plus short period is red. These are transparent comparison heuristics, not validated seakeeping calculations.

Sources checked 6 October 2026:
- Met Office: Hs is the average of the highest third of waves; individual waves can occasionally approach twice Hs. A 2 m forecast can include waves around 4 m, but doubling is not a predicted maximum. https://weather.metoffice.gov.uk/guides/coast-and-sea/beach-and-tide-times
- Kosmos N43 owners, FAQ Q39: stabilisation matters for comfort; no universal height/period limit is supplied. https://kosmos.liveflux.net/blog/faq/
- Nordhavn: active-fin settings affect comfort in different sea conditions. https://nordhavn.com/training-for-long-distance-running-n43-prepares-for-2900-mile-journey/
- Open-Meteo: wave_height is significant combined height, wave_period is mean period (different from swell peak period). Current direction is towards flow; wave direction is from. https://open-meteo.com/en/docs/marine-weather-api

Flow interpolation is illustrative, limited to available samples in the downloaded sea area and masked off land. Animation speed is not a physical travel scale. Ocean-model currents are not a harbour tidal-stream atlas.
