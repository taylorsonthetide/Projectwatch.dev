# Chartplotter offline web build

Open navigation.html online, then Menu → Offline charts → Download UK & Ireland.
Keep the page visible until all files have been verified; then reload the saved chart.
The package holds 7,456 existing historical tiles at all supplied scales, the reviewed
suppression/retention register and tile patches, saved OpenSeaMap node positions,
cables, offshore installations, ports, energy sites and marina search data.
The original 2011 coastline/depths keep their source date. Snapshot sea marks retain
7 October 2026 provenance; they are not a live or exhaustive replacement for charts.
External street and raster seamark tiles are never bulk downloaded. The saved
viewer uses historical land/coastline and vector snapshot marks instead.

Downloads are explicit, six requests at a time, with byte and SHA-256 checks for
all files. A failed or cancelled download deletes its staging cache, preserving
the active package. Only complete downloads switch the active package pointer.
Check for updates bypasses the installed chart cache; ordinary chart reads stay
pinned to the saved package, even online. Reload after installation/update before
reviewing chart data. Removing a pack does not remove routes, tracks or trips.

Menu → Waypoints offers up to 50 named routes (100 points each), loading,
JSON backup export and validated backup restore. Existing active routes/tracks
continue auto-saving. GPS never starts because a route was loaded. The library
is device-local and independent of training accounts. Export backups separately.

Browser storage is not guaranteed permanent. Private mode, storage eviction and
clearing website data may remove downloads. Safari and a Home Screen web app can
use separate storage. Install/download within the intended viewer, and verify its
saved status before disconnecting. Browser TCP/UDP gateway input is not available;
the separate native project remains the gateway implementation.

Release publishing: update published-release.json and associated data, then run
`python3 scripts/navigation/build_offline_manifest.py`. The pack ID includes a hash
of every file path, byte count and SHA-256; changed data creates a new download ID.
Run `node --test tests/chart-pack.cjs tests/weather-offline.cjs tests/ipad/nmea.test.cjs`.
