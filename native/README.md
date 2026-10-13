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
