# Helmlore Navigation Lab 0.1

Entry point: https://helmlore.com/navigation.html

A separate browser prototype. It does not modify the training site or Supabase account system.

## Features

- OpenStreetMap base map and OpenSeaMap sea-mark overlay, initially centred on Whitehaven.
- Explicit GPS permission request; no location requested on page load.
- Demonstration voyage at 7 knots, visibly marked SIMULATED.
- Speed over ground in knots and course over ground in degrees true. Unavailable values remain blank. Position-derived speed is labelled estimated and requires movement greater than the fix accuracy.
- GPS age and accuracy. Values older than 15 seconds are not presented as current, and recording stops on stale or inaccurate fixes.
- Manual waypoints with editable names, draggable map markers, selection of next target, distance, bearing and estimated arrival based on current speed.
- Separate demo and GPS routes and tracks stored only in the current browser.
- Track recording with a 6,000-point limit. Pauses create separate segments on screen and in GPX exports.
- Explicit route and track export, with XML escaping of names.

## Map sources and dependencies

Leaflet 1.9.4 is loaded from unpkg with the published Subresource Integrity hashes. Leaflet's BSD-2-Clause license is available at https://github.com/Leaflet/Leaflet/blob/v1.9.4/LICENSE.

Base tiles: https://tile.openstreetmap.org/{z}/{x}/{y}.png
Sea marks: https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png

Visible OpenStreetMap and OpenSeaMap attribution is included in the map. The browser uses ordinary HTTP caching and sends its normal referrer. There is no bulk tile download or prefetch feature. See https://operations.osmfoundation.org/policies/tiles/.

## Prototype limitations

This is not a complete or official navigation chart. There is no verified depth/hazard coverage, safe-water route checking, tide/weather data, AIS, instrument connection, or autopilot control. The example route is simulated and not approved for navigation.

Maps require an internet connection. There is no offline chart pack or background recording. iPad Safari may suspend the page when the screen is locked or another app is used. Leave the page visible for testing and check the position age.

Wi-Fi-only iPads do not provide built-in GNSS positioning. Browser geolocation can report a coarse position from other sources; location accuracy is shown rather than claiming a satellite fix.

Local storage key: `helmlore-navigation-lab-v1`. Recording never resumes automatically after reload or browser back/forward restoration. GPS coordinates are not uploaded to Helmlore accounts. Map providers receive ordinary viewport tile requests.

## Validation

`node tests/navigation.cjs` covers nautical-mile conversion, true bearings, dateline crossings, coordinate rounding, missing and inaccurate GPS values, motion estimation, escaped GPX names, and preservation of separate recording segments.

## Forecast layers (0.2)
Weather & sea panel explicitly loads a 3×3 sample of the visible map bounds via Open-Meteo, in knots. No GPS callback sends coordinates to the weather service. Wind arrows point downwind (reported FROM +180°); current arrows point TOWARDS the reported bearing. Returned model-cell coordinates locate the samples; no interpolation implies more resolution. Hourly valid times use UTC Unix timestamps and display local timezone. 24-hour forecast slider, wave/gust summary and MSL sea-level curve are available. Marine model is roughly 8 km and unsuitable for coastal navigation; MSL values must not be used as harbour/chart-datum tide heights. Network failures clear values; retrieval older than one hour expires rather than persisting indefinitely. Public free API is for this noncommercial testing phase; review service terms before monetisation. Official harbour tide tables remain pending a suitable licensed provider.

## Chart shell (0.3)
The map occupies the full dynamic viewport. Instruments dock to top/bottom/left/right, with a separate persisted layout preference. Move bar cycles through edges; Controls provides explicit selection. Weather, waypoints, track and controls open one overlay menu at a time, with Close/Escape focus restoration. Menus scroll independently. Chart notices and map attributions remain visible. Full screen uses the browser API when supported, with Home Screen web-app instructions as a fallback; manifest and Apple standalone metadata are provided. No offline service worker or native background GPS was added.

## Vessel data and manual passage planning (0.7)

Open Planning from the chart toolbar. Save a vessel name, draught in metres, cruising speed in knots, optional maximum speed and minimum-water-depth warning threshold. These settings and drafts are device/browser local, not synced through the training account. Depth alerts remain explicitly unavailable until reliable licensed chart depths and compatible tide heights are connected.

Choose the start and destination marina, or pick map points. Copy current position requests one fix only and rejects fixes older than 15 seconds or with accuracy worse than 100 m; no continuous GPS runs on Planning. Tap a route leg to insert a waypoint, drag it and lock it. Leg distance, true bearing and total passage time use the saved cruising speed without tides, weather or stops. Plans are not checked for safe water.

Confirming a plan replaces the GPS route, preserving demo routes and both sets of tracks. Navigation opens with GPS off and the first point after the start selected as the next target. Select Use my GPS when ready; waypoint selection remains manual through Set next. Export GPX remains available. The UK marina library still includes inland locations pending a later sea-access review.

Validation: numerical and validation tests for ETA scaling, dateline distances, locked point movement, waypoint insertion and unchecked confirmation; existing navigation, AIS and marina tests. Browser checks cover vessel saving, marina search, touch insertion, marker dragging, locking and route handoff. Actual iPad GPS hardware and licensed-depth alerting are not validated in this prototype.

## Menu and trip logbook (0.8)

Navigation and Planning now use a top-left Menu dropdown. Navigation menus include the trip logbook alongside existing weather, AIS, marina, vessel, route and control panels. Existing route/track storage remains intact; older tracks are accessible through Legacy tracks.

The new logbook records named GPS or explicitly simulated trips. Choose 5, 15, 30 (default) or 60 minute log intervals aligned to clock boundaries. Entries retain scheduled time separately from actual GPS-fix time and include coordinates, accuracy, SOG, true COG, travelled distance, remaining route distance, next target and ETA at GPS speed. Marina-only targets are explicitly direct distances. Manual entries support notes.

The travelled track is sampled separately. Unavailable, old or inaccurate fixes create gaps; distances do not bridge those gaps and are marked incomplete. Recording ends when the source changes, the page is left or navigation becomes hidden. Interrupted sessions are retained without resuming recording. Trip route/vessel snapshots are kept with the trip. Storage is browser/device-local, maximum 50 trips and 8,000 track positions / 2,000 scheduled entries per trip; limits stop recording without silently deleting earlier trips. Browser storage failure is surfaced. CSV uses UTC timestamps; GPX and complete JSON exports are available.

Tests cover clock alignment, actual fix timestamps, missing-boundary entries, waypoint-based remaining distance, marina direct-distance labelling, GPS gap segmentation, source isolation and CSV escaping. The original navigation, planning, AIS and marina suites also pass. No offline chart pack, weather-download package or anchor watch is introduced by this section.

Travelled-distance recording also filters movement within reported GPS accuracy to reduce stationary position jitter. Reported distances are estimates, with gaps marked incomplete.
