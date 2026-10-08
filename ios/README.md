# Helmlore Plotter — offline iPad source project, milestone 1

This is a chartplotter-only SwiftUI/WKWebView app foundation using the existing Helmlore renderer. No training platform, question banks, login or analytics are included. It is a SOURCE PROJECT, not an installable or signed .ipa. Native compilation and device testing have not been performed: the build environment has no Xcode or Apple SDK.

## Install for testing

1. On a Mac with Xcode and the iPadOS SDK, open HelmlorePlotter.xcodeproj.
2. Select HelmlorePlotter, Signing & Capabilities, and your Apple developer team. Change the bundle identifier if needed.
3. Connect an iPad running iPadOS 17 or newer. Select it as the destination and build/run. Follow Apple's device signing and Developer Mode prompts.
4. After installation, open the app in airplane mode. Charts are installed as local app resources; no web server or browser cache is required.

A paid developer account/TestFlight or App Store distribution can be arranged after device testing. Signing credentials are not included. You cannot install this ZIP directly as an iPad app.

## Included

- Navigation screen, local Leaflet, local chart tiles, saved seamark points and selected infrastructure overlays.
- Physically compiled reviewed chart: 7,456 native tiles; 730 changed. Exactly 4,516 old source depictions hidden; 20 restored records retained.
- Native CoreLocation input, explicitly selected, foreground only.
- Receive-only TCP marine Wi-Fi connection, user-configured private IPv4 address/port.
- Strict checksum/framing/coordinate/date validation for RMC GNSS positions. HDT true heading, DPT measured depth and offset, MWV wind instruments. Missing accuracy is shown as unknown, never fabricated. Stale instrument values expire after 15 seconds.
- Gateway-converted NMEA 2000 → NMEA 0183 input uses the same receiver. This is NOT a raw NMEA 2000 PGN decoder or NMEA-certified implementation. Actual compatibility must be checked against the gateway make/model and configured output.
- Local route/track persistence through the existing WebKit store. Export GPX/CSV/JSON to the app's Documents/Exports folder, then share through Connections. Storage and export require device verification.
- HTTP(S) web requests blocked by default. Connections enables existing forecast and internet AIS requests. Local Wi-Fi reception is independent of internet access.

## Not implemented yet

- UDP listener, raw NMEA 2000/vendor formats, automatic reconnect, source-device arbitration and gateway AIS target decoding. AIS sentences are recognised/counted only; internet AIS uses the existing relay when enabled.
- Chart-pack updates/downloads, native chart manager, route import UI and native database-backed route storage.
- Background tracking, anchor alarm, depth-aware routing, clearance calculations and native tide prediction.
- A verified official/current navigation chart. Depths/coast/old marks retain the 2011 date; saved online seamarks are dated 7 October 2026; final review 8 October 2026. Snapshot point symbology does not reproduce all live raster light sectors/areas.

## Required acceptance checks in Xcode/on the iPad

Build for simulator and device. Resolve all native compiler errors before distribution. Cold launch/relaunch with airplane mode; pan UK/Ireland and zoom to 12+; inspect red depths <=3m; test saved seamarks and restored marks. Create and reopen routes/trips, export/share GPX/CSV/JSON, test GPS permission denied and accuracy unavailable. Connect actual gateway TCP 0183 output; compare position/COG/SOG/heading/depth/wind with vessel instruments. Test disconnection, stale RMC, malformed data, source switching and background/resume. Confirm no remote chart tiles are fetched and HTTP(S) requests remain blocked until explicitly enabled. Test forecast storage/IndexedDB under the app's custom scheme. WebKit-origin persistence and all native bridges require device verification.

## Rebuild from the repository

Run `python3 scripts/ipad/build_ipad_project.py --repo /path/to/repository --output /new/output/folder` then open the generated Xcode project. Node tests: `node --test tests/ipad/nmea.test.cjs`. FILE_CHECKSUMS.json records the generated payload. The source master chart database stays in the maintenance system; the app carries the compiled display package.

## Protocol references

Apple custom local web-content loading: https://developer.apple.com/documentation/webkit/wkurlschemehandler
Apple local network privacy: https://developer.apple.com/documentation/technotes/tn3179-understanding-local-network-privacy
RMC field reference (receiver manufacturer): https://receiverhelp.trimble.com/alloy-gnss/en-us/NMEA-0183messages_RMC.html
Example gateway protocol conversion (not a hardware recommendation): https://www.yachtd.com/faq/
