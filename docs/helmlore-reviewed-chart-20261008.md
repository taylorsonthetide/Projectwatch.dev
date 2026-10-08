# Helmlore UK & Ireland — reviewed chart release, 8 October 2026

Custom research chart. Historical land/coast, contours, soundings and unhidden marks/lights retain their October 2011 date. Saved OpenSeaMap data was extracted on 7 October 2026; live map seamark tiles may subsequently differ. This compilation is not an official ENC or evidence of current depth/hazard coverage.

## Reviewed mark compilation

2,800 final user hiding decisions plus 1,716 previously reconciled source records give 4,516 hidden old depictions. Twenty mistakenly hidden records were restored and retained. All 289 lateral recheck records have decisions; 269 were confirmed hidden and 20 kept separate. Counts include chart-scale versions.

7,456 native-scale tiles were compiled. 730 contain changed marks. Only layer 4 mark/light records were filtered; every other row is retained unchanged. No online source object was removed. All 1,324,208 master source observations remain intact. Exact IDs, coordinates and class were checked against the database before compilation.

The live release applies small exact-source patches to its existing tile assets. The package contains complete compiled tiles, a saved online node layer, the updated master database, the two input reviews and source/reconciliation history. The master database stores depiction decisions separately from original observations. Export and regular tile rebuild scripts respect the same register.

## Package use

Unzip the package. Run `python3 serve-chart.py` from its folder, then open `http://localhost:8765/chart-offline.html`. The local viewer uses bundled Leaflet, the compiled 2011 chart detail, saved seamark nodes and selected infrastructure. No internet is needed for those layers. Basemap street tiles and live raster sea marks are used by `chart-lab.html` and require internet. Reference links also require internet. A local web server is necessary because browsers restrict direct file fetches.

The existing selection remains: coastline/land, contours, soundings at display zoom 12+, historical marks/lights, sea marks, fibre cables, offshore installations, main ports and ocean energy sites. Additional datasets remain in the archive for audit, not automatically enabled. The saved point overlay does not claim complete offshore coverage or reproduce all light-sector/line/area symbology of the live raster.

## Updates and restoration

Use stable source IDs and dated source snapshots. Keep the original observations and review evidence. Run `compile_reviewed_release.py` for a revised export, then publish the matching manifest and client version together. To restore a hidden depiction, record a retain decision and recompile; do not erase its observation. Checksums and the release source revision identify this exact package. Source licences/attribution remain applicable; compilation does not make this an official navigation chart or grant redistribution rights to proprietary sources.
