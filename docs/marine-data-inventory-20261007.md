# Helmlore marine data inventory — 7 October 2026

The first prototype uses the existing Whitehaven basemap: bounds -3.75,54.4,-3.35,54.75. It is a development map, not a complete navigation chart. The installed 21 GB PC chart store is not directly accessible here.

## Verified collection

| Dataset | Format / extent | State | Prototype use / gap |
|---|---|---|---|
| Whitehaven coastline and places | PMTiles vector basemap; -3.75,54.4,-3.35,54.75; source zoom 14 | Ready for development | Prototype base map. No chart depths, hazard coverage or offline seamarks |
| Environment Agency navigation aids | GeoJSON points and lines; UK collection; 0 features in Whitehaven test bounds | Decoded; other areas | Regional asset research. Not a complete coastal buoy inventory |
| UKHO regional wrecks and obstructions | GeoJSON; Firth of Forth; outside Whitehaven | Decoded; other area | Regional hazard-data schema research. Not UK-wide wreck coverage |
| Trinity House, NLB and UKHO notices | HTML/text snapshots and source links; Provider notice pages | Reference snapshots | Private reference and future update-feed research. Do not represent as current notices or complete coordinate list |
| Decoded TIMEZERO world coastline | Experimental GeoJSON + decoder; UK/Ireland intersecting tiles, levels 3–8 | Experimental | Private geometry investigation. Inferred georeferencing; no harbour detail or hydrographic validation |
| TIMEZERO world raster overview | SQLite raster.world from data2.zip; World overview; levels 3–5 | Prior inspection decoded | Private visual comparison. Not detailed Whitehaven charts; alignment and currency unresolved |
| TIMEZERO world vector tiles | SQLite vector.world from data3.zip; World; levels 3–8 | Partly decoded | Private decoder research. No decoded soundings, lights, buoys, rocks or wrecks |
| TIMEZERO world bathymetry | Five-part 7z → SQLite hrbathy.world; World; levels 3–7 | Depth decoding unresolved | Private format investigation. Units, depths and vertical datum unverified; no depth or clearance calculations |
| TIMEZERO detailed vector tile C59 | SQLite L7_R83_C59(1).7; Internal tile label; geographic coverage unverified | Undecoded binary | Private format inventory. Cannot yet supply usable marine features |
| TIMEZERO detailed vector tile C58 | SQLite L7_R83_C58.7; Internal tile label; geographic coverage unverified | Undecoded binary | Private format inventory. Cannot yet supply usable marine features |
| TIMEZERO vector annex notes | SQLite L7_R83_C59.7; Internal tile label | Readable notes | Private metadata investigation. No chart geometry, soundings or complete hazard inventory |
| Legacy MAPMEDIA world databases | Two DBV files (plus duplicate upload); World datasets; precise local coverage not established | Available; proprietary format | Later private inspection. Not ready to import |
| OpenSeaMap overlay | Online raster tiles; Community mapping where tiles have content | Online service only | Optional online prototype overlay. Availability and completeness unverified; not an offline layer |
| EMODnet / INFOMAR / GEBCO | Prospective bathymetry sources; Not yet downloaded into this collection | Planned, not collected | Next bathymetry acquisition. No local grid, datum reconciliation or contours yet |
| OS / Tailte Éireann coastline products | Prospective vector sources; Not yet downloaded into this collection | Planned, not collected | Potential coastline improvements. No imported OS/Tailte layers |

## What this audit checked

Both saved marine collection ZIPs, their READMEs, GeoJSON data and notice provenance were inspected. Collection 02 repeats the original wreck and Environment Agency layers; these are not additional features. There are 988 EA points, 173 EA lines, 237 wreck points and 6 wreck polygons. None intersects our Whitehaven test bounds.

The three detailed .7 SQLite files were opened read-only and their schemas, record counts, level ranges and payload headers were inspected. No encrypted payload was decoded. The earlier TIMEZERO inspection report and decoder outputs were reread; original large archives were not re-decoded. The experimental coastline contains 3,464 paths and 76,128 coordinate pairs.

The live Whitehaven PMTiles pack was downloaded and its SHA-256 matched the repository manifest: 9a48396384e4e21628254e4785814981a7c07116ce392f77e5b25a85ad4a2c1f (3,457,012 bytes). Source build: 2026-10-03, source zoom 14. Higher display zoom enlarges the source data.

Overpass extraction attempts failed with HTTP 406 or timeout. No saved seamark database was produced. The prototype can optionally request the existing OpenSeaMap online overlay; it does not claim offline or complete seamark coverage.

## First prototype

Open [Whitehaven Chart Lab](https://helmlore.com/chart-lab.html). It is not linked from the training homepage. It shows the licensed open basemap and its test boundary, with optional online seamarks. No TimeZero imagery or decoded geometry is published. No depth contours, hazard coverage, routing or vessel-clearance calculations are presented.

## Next data work

1. Obtain a dated, licensed local seamark extract and preserve the original tags.
2. Acquire a suitable local bathymetric grid, record its survey quality, resolution and vertical datum, and keep research seabed layers distinct from navigation depths.
3. Reconcile coverage and datum before generating contours. A smooth contour is not evidence of a surveyed least depth.
4. Verify wreck/rock coverage for the actual test area; the Forth collection cannot fill Whitehaven gaps.
5. Keep a source manifest, retrieval date and hash with each import; validate geographic alignment before expanding.

## Source references

- Basemap: https://docs.protomaps.com/basemaps/downloads
- OSM licence: https://www.openstreetmap.org/copyright
- EA catalogue: https://www.data.gov.uk/dataset/70817bda-9c68-4f27-8d7a-9b8458e30d67/aims-aids-to-navigation
- UKHO catalogue: https://www.admiralty.co.uk/access-data/marine-data
- EMODnet metadata: https://erddap.emodnet.eu/erddap/info/bathymetry_dtm_2024/index.html
- INFOMAR high-resolution products: https://infomar.ie/node/571

Detailed status, provenance and limitations are in marine-data-inventory-20261007.json.
