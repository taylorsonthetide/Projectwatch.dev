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
