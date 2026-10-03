# Diesel Engine Basics — 1.98.0

Recreational visual learning: 12 lessons, 3 beginner steps, 8 interactive fault cases, 20 original knowledge questions and a checking rehearsal. This teaches recognition and principles, not hands-on servicing certification.

## Technical review

Primary review: Beta Marine heat-exchanger engine operator manual, OM-221-20031-HE-REV46-0226, February 2026, obtained from the manufacturer's seagoing literature page. Relevant sections: safety, fuel supply and return, priming, starting and cranking, maintenance, raw-water pump/impeller, heat exchanger, preservation and fault finding. Locations and intervals from that manual are deliberately not generalised to other engines. Volvo Penta support/manual selection, Yanmar operator manual and the RYA Diesel Engine course syllabus supplement scope. Parker Racor's contamination guidance supports the distinction between microbial debris and other filter contaminants, and the need to remove biomass as well as treat confirmed contamination.

- https://betamarine.co.uk/literature-downloads-seagoing/
- https://betamarine.co.uk/resources/Operators_Manuals/10-115T-HE-OM/docs/OM-221-20031-HE-REV46-0226.pdf
- https://www.volvopenta.com/support/
- https://www.yanmar.com/media/global/com/product/marinepleasure/sailBoatPropulsion/operationmanual/0AYMM-EN0023_English.pdf
- https://www.rya.org.uk/course-finder/diesel-engine-course/
- https://www.racornews.com/single-post/faq-spotlight-dark-wet-stuff-on-your-used-filter

## Visual policy and provenance

The generated sea-green engine was rejected by Cliff because its injector and raw-water-pump arrangements were inaccurate. It is not copied, referenced or published in this module. No invented whole-engine image is presented as a service layout.

All 12 SVG teaching plates are original, deterministic, simplified principle diagrams; none are traced or copied from a manufacturer. Component locations, dimensions, vane counts and service instructions are not universal. The four-stroke plate puts the injector in the cylinder head, depicts valve states and piston directions, and states the two-revolution cycle. Fuel supply and high-pressure injection are distinguished; the return avoids the fine filter. Closed coolant and open seawater are separate. Impellers are shown uninstalled, avoiding invented pump housings and rotation claims.

Six real photographs are sourced from Wikimedia Commons. They are resized/recompressed to WebP with no content changes. Each displayed photograph includes author, source, licence link and applicable model caveat. The numbered overlay on the four-cylinder photograph is available under CC BY-SA 4.0; this does not change the licence of unrelated app code.

| Asset | Author | Licence | Source |
|---|---|---|---|
| four-cylinder-real.webp | Cjp24 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Marine_diesel_engine_with_hydraulic_machinery.jpg |
| volvo-d2-75.webp | Goelette Cardabela | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Images_Volvo_D2-75-001.jpg |
| yanmar-engine.webp | PHGCOM | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Yanmar_2GM20.JPG |
| raw-water-pump.webp | PHGCOM | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Water_Pump.JPG |
| injectors.webp | PHGCOM | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Yanmar_Injectors.JPG |
| oil-filter.webp | PHGCOM | CC BY-SA 3.0 | https://commons.wikimedia.org/wiki/File:Oil_filter.JPG |

The four-cylinder photograph is an installed engine with hydrostatic transmission, not a claimed confirmed brand/model. The Volvo sheet includes dismantled machinery, clearly identified. The Yanmar close-ups are two-cylinder component examples, not mislabelled as a four-cylinder engine.

## Storage and isolation

- Teaching, questions, scenarios, image credits and component descriptions: `libraries/project-watch/diesel-1.98.0.js`.
- UI only: `js/diesel-1.98.0.js` and `css/diesel-1.98.0.css`.
- Independent image files: `assets/diesel/`.
- Reproducible original teaching library / vector builder: `tools/build-diesel.py`.
- Separate progress key: `pw-diesel-reviewed-v1`; other course progress is unaffected.
- New ninth training pathway. No changes to approved course files or original Helmlore repository.

## Validation

Node syntax checks; asset/credit integrity; fault wrong-answer retry, correct-answer advancement gate, reviewed persistence and assessment guard/scoring tests. Existing passage and chart-work checks pass. Browser review follows GitHub Pages deployment, covering page navigation, real component markers, diagram enlargement, fault cases and quiz interactions.
