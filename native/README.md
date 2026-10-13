# Helmlore Boating Weather 2.1

The separate `/native/` page now focuses on boat comfort limits and a 72-hour weather comparison. It loads no historical/navigation chart archive, depths, marks, own-vessel instruments, routes, passage planning or marina navigation libraries. The previous navigation page remains a separate build.

## Flow

Zoom/pan to the desired visible map area, save boat name, maximum significant wave height, minimum mean wave period and maximum Beaufort wind force, then download the UK forecast. The immediate result compares every available hourly sample across the downloaded sea-area samples for the next 72 hours. It considers gusts as well as mean wind, uses the established appreciable-wave period rule, and lists within/near/above/missing windows. It never declares a trip safe.

- C++ WebAssembly: comfort classification, including combined wave-height and short-period warnings.
- Rust WebAssembly: wind and circular wave interpolation for overlays and point sampling.
- JavaScript/Leaflet: user interface, online orientation map and existing AIS relay.
- 837 regularly spaced locations covering UK and surrounding seas; the visible sea area determines the comfort comparison. Provider responses request 78 hours to cover the next 72 hours from the current time, including hourly boundaries and a small cache margin.
- Forecast packages are validated before replacement and saved atomically in IndexedDB. Settings persist separately. A failed refresh retains the previous forecast. Missing, stale or shortened coverage cannot produce an overall green result.
- Playback, colour-coded hourly area comfort, Beaufort/wind/gusts, wave height, mean period and direction share one bottom forecast console. Tapping the map changes the inspected sample, never the download size.
- A compressed Natural Earth public-domain land mask excludes land samples from the area comfort judgement. Missing marine samples remain unknown.
- Basemap tiles and AIS are online only. No OSM tile prefetching or chart download remains. Activation removes retired native chart/viewer caches, preserving older navigation builds and their stored data.

## Data and licensing notes, checked 13 October 2026

- OpenStreetMap orientation map: attribution displayed; comply with https://operations.osmfoundation.org/policies/tiles/. No offline map downloads or bulk fetching.
- Open-Meteo and ECMWF weather: CC BY 4.0 data attribution displayed. Free hosted Open-Meteo API is for non-commercial use only: https://open-meteo.com/en/terms. This unlinked development weather page has no advertising or paid features. A commercial/promotional launch needs an appropriate API plan or permitted self-hosted source; free data licensing does not remove hosted API restrictions.
- AIS uses the existing AISStream relay, with its attribution, source timing and stale-position rules retained. The public AISStream page does not establish a general commercial redistribution licence; confirm account/provider permission before commercial redistribution. No new subscription or commercial rights were purchased or claimed.
- Provider coordinates are sent only when downloading the chosen forecast area or enabling AIS for the visible bounds. No GPS tracking exists in this version.

## Build and verification

Install clang/lld, Rust and the `wasm32-unknown-unknown` target; run `bash native/build.sh`, then `node --test native/tests/weather.test.mjs`. Compiled modules are committed for static hosting. CI rebuilds both from source and tests the actual exports. iPad visual and interaction testing remains the final device check; no render-speed claim is made before comparison.

## Play warnings (2.2)

Pressing Play shows the restored comfort overview when the 72-hour comparison is above/near limits or incomplete. It includes forecast extremes, settings, hourly warning windows and affected sample coordinates. Close pauses; Play forecast continues from the shown hour. During playback, entry into each unacknowledged above-limit period pauses at that forecast step and opens a smaller alert. Continuing acknowledges that window; the same sustained breach is not repeated every hour. A later separate above-limit window raises a new alert. Restarting or changing forecast/limits resets the acknowledgement state.

Reasons and locations remain in the integrated forecast bar and outlook after dialogs close. Red circles show currently above-limit sea samples; Show warning hour & point previews a future breach. Warning times are hourly forecast boundaries, not claims of the exact real-world minute conditions will change.

## 2.3 UK weather coverage
Downloads now cover 49–62°N, 12°W–3°E (UK and surrounding seas) with an 837-node, 0.5° display grid. Requests are batched in 40-location groups; marine requests prefer sea model cells. Land is excluded from the overlay and assessment. Provider missing values remain unavailable. This is a display sampling grid, not extra model resolution. Red boat symbols mark above-limit samples at the selected hour and thin out on zoomed-out maps; tapping one opens its readout. Show affected boats closes warnings and hides the bottom console; Show controls restores it. Older saved forecasts retain their original coverage until a fresh UK download completes.

## 2.4 Weather controls and flow
A separate weather-layer drawer selects wind, waves or ocean currents, opacity, colour shading, moving trails, direction arrows, gust shading, wave height/mean-period colours, trail density, sea-only wind, storm-wave markers, forecast bounds and AIS. One integrated forecast console retains playback, comfort windows and selected-point readings. Storm-wave icons are weather warning samples, not vessels; warnings may be caused by wind/gust as well as waves. Gradient shading uses interpolated forecast values; screen vector fields are precomputed per view/hour to keep animation lightweight. Reduced-motion preferences show arrows instead of animated trails, and background tabs stop animation. Trail movement is illustrative, not a displacement prediction.

Ocean currents are downloaded separately from Open-Meteo Marine Best Match (Météo-France SMOC), with towards directions and explicit provider unit conversion. They attach to the saved UTC hourly timeline; missing hours remain missing. Current download failures preserve wind/wave data. Currents do not change comfort classification or pretend to be harbour tidal streams. Current attribution: Open-Meteo, Météo-France / Copernicus Marine. Refresh the optional current download after refreshing wind/waves.

## 2.5 Retained Helmlore layout and AIS clarity
Matches the earlier dark header, left tile menu and coloured forecast instrument cards: Menu, centred brand, Night mode and Full screen; weather controls are inside the menu. One direction-display selector chooses motion, arrows or colours only. Advanced controls are collapsed. Current flow uses offset arrow positions, skips nearby warning/AIS symbols and retains its blue style.

Weather canvases now live in Leaflet panes at 450/451, beneath marker and popup panes; this prevents weather shading from tinting vessels and detail cards. AIS ships use white-backed vector symbols coloured by broadcast type. An unknown type has a hollow neutral symbol, never guessed from name or transponder class. Only last received type metadata is saved (24h expiry, bounded 1,500-entry cache); old positions are not stored. Vessel cards show name, type, MMSI, transponder class, speed, course, heading, movement from speed, reported status when supplied, position and age. Cards survive subsequent polls. Internet AIS and incomplete upstream type information retain their existing limitations.

## 2.6 UK overview toggle and AIS category symbols
View UK saves the local map centre/zoom and changes to Return to local view; pressing again restores the saved view. Visible-area comfort comparisons and warning samples then return to that local area. AIS symbols use filled category colours with white outlines, matching the category legend. Unknown types remain grey; the AIS menu counts received and pending types, and unknown-type cards explain that static type data has not arrived. Type is never inferred from a name or Class A/B.

## 2.7 Lightweight coastal base and exact sea clipping
The road-tile base is replaced by a cached regional vector map: pale yellow land, blue sea, restrained Natural Earth upland-region shading and plain port text. Port labels are placed fully on land and collision screened; dense labels are omitted on zoom-out. Text is black by day and white in night mode. The map, colour shading, direction arrows and moving trails share one projected sea mask, so model graphics cannot cross its land boundary. The viewer now works with this map offline; AIS still needs a connection. No per-zoom map-tile requests are made.

Coast geometry comes from Natural Earth 1:10m land, clipped to 30°W–20°E / 38–72°N and simplified by 0.0006°, replacing the earlier 1:50m coastline. It is a weather-orientation map, with approximate small harbour detail. Upland shading uses Natural Earth geographic regions plus restrained, illustrative gradients around supplied mountain peak coordinates (including Snaefell). It is not a measured elevation model or contour map. The build script records the source and transformations. Natural Earth is public domain: https://www.naturalearthdata.com/about/terms-of-use/ .

Port reference names/coordinates: the existing EMODnet Human Activities/GISCO subset (CC BY 4.0; https://emodnet.ec.europa.eu/geonetwork/srv/api/records/379d0425-8924-4a41-a088-1a002d2ea748), plus a separately identified Preston reference point from OpenStreetMap (ODbL 1.0). Source and licence metadata remain available in ports.json, including https://www.openstreetmap.org/way/56690568 . These are labels, not verified harbour entrances.

At coastal forecast cells, interpolation skips land corners and renormalises available sea-corner weights. Missing values at sea corners still return unavailable; cells with no usable sea corners stay blank. Coastal interpolated readouts are identified. This improves coastal continuity without adding invented forecast values or claiming harbour-scale model accuracy. Existing saved packages have their sea mask recomputed against the new coastline when loaded.

## 2.8.0 Pan continuity
Coastline and weather canvases stay visible during drag/inertia. The base draws a 384-pixel margin around the viewport; Leaflet moves the retained canvas with the map. Motion pauses while retaining its snapshot. The new view redraws on move end, with a cancellable 120ms delay before the 72-hour comparison. Repeated comparisons reuse results when the package, settings, minute and eligible sea nodes are unchanged. AIS/forecast updates defer canvas redraw during a drag.


## 2.8 Simple weather controls and harbour geography
Large Wind/Waves switches select a single weather colour layer. Currents, AIS and warnings are independent switches. Smooth trails are preset (direction arrows honour reduced-motion preferences). AIS defaults on unless the user previously turned it off. Boat settings contain only the name and comfort limits; no coordinate or region forms are presented. Download uses the visible map clipped to UK/Ireland coverage and then attempts ocean currents; a current failure retains the successful wind/wave package.

A six-step interactive guide highlights the real controls, includes a persistent Don't show again preference, and can be reopened via Menu → How to use this. The guide can be closed at any time and does not block map/button interaction.

Zoomed harbour geography uses OpenStreetMap contributors' OSMCoastline land polygons (2026-10-13), ODbL 1.0, from https://osmdata.openstreetmap.de/data/land-polygons.html. Source: https://osmdata.openstreetmap.de/download/land-polygons-split-4326.zip. The derived local database is provided as harbour-coast.json.gz in the public repository. It contains land/water geography only, simplified by approximately 8 m for display, split into bounded cells. UK/Ireland scope: 12°W–3°E, 49–62°N. Detailed shoreline appears from zoom 10 when the padded view is within the regional coverage. Wider views retain Natural Earth for speed. No roads or inland map detail are restored; coastal land remains plain yellow with port names. OSM is community mapping and is not a complete or verified inventory of harbour basins. The companion harbour-basins.json contains 60 enclosed/salt-water basin polygons from OSM API snapshots around selected ports, including Whitehaven, Fleetwood, Preston, Barrow and several larger ports. These are subtracted from land. Basins absent from both source datasets may still be missing. Port labels include 358 named ports/coastal marina records, with additional marina names limited to close zooms and collision-tested placement. This is not every harbour verified. No AIS coordinates are moved or snapped, and finer geography does not create finer weather forecasts.


## 2.9 Any-vessel ride comparison
Boat setup stores an optional hull category (displacement, semi-displacement, planing, multihull, other), actual waterline length, heading true, speed-through-water range, personally observed comfortable encounter interval and optional measured natural roll period. Existing saved comfort limits migrate with the feature disabled. No hull-specific response coefficients are fabricated; hull category is descriptive context.

At the inspected sea point/hour, `ride.mjs` uses linear deep-water dispersion lambda = g T² / (2 pi), c = g T / (2 pi), and encounter interval lambda / abs(c + V cos(alpha)), where wave direction is FROM, alpha=0 ahead, and knots convert to m/s. This is the more precise underlying equivalent of IMO's rounded 3 T² / (3 T + V cos(alpha)) formula reproduced in the historical MCA MIN357 appendix. It reports geometry Hs/lambda, Hs/L and lambda/L, not predicted acceleration, slamming or motion comfort. Existing forecast samples are combined mean waves; no independent swell spectrum or hull RAO is available.

A rhythm-matching trial speed is the closest 0.5-knot sample to the owner's measured comfortable interval, only within 0.15 seconds, in head/bow seas (<80 degrees off bow), when local wind/gust/waves are fully within personal limits and the download is no older than 12 hours. Beam/following seas, unavailable/expired data, tiny waves and potential measured roll-period conflicts withhold the suggestion. The 15% roll-period proximity flag is a conservative application heuristic, not a validated vessel safety boundary. A comfortable interval is not a measured RAO and is applicable only to comparable sea conditions, loading/stabiliser settings and operating regime; planing transitions cannot be predicted. This feature does not propose a heading or route and does not replace existing area-wide red warnings.

Sources: https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/282404/min357.pdf (historical 2007 IMO circular, not a current regulatory claim); https://www.orcina.com/webhelp/OrcaFlex/Content/html/Vesseltheory,RAOsandphases.htm ; https://open-meteo.com/en/docs/marine-weather-api .
