# Helmlore UK & Ireland master chart — first audit

7 October 2026. Source baseline: `c2bbaa3ac77aa5d2640b307ddc6be30051e0f1dd`.

The master catalogue and correction workflow are built. This is a maintained custom research chart, not an official ENC. The live chart now reads its four selected infrastructure layers from a versioned master export. The 2011 historical tile pack and live OpenSeaMap raster remain in use while the candidate matches are reviewed.

## Completed

| Check | Result |
|---|---:|
| Original historical cells decoded and checked | 1,413 |
| XYZ tiles decoded, counted and linked back to original records | 7,456 |
| Source/supporting files inventoried and checksummed | 8,907 |
| Source observations catalogued, including versions | 1,324,208 |
| Permanent catalogue entity IDs | 1,300,384 |
| Exact identical-record groups sharing an ID | 56 |
| Evidence-backed platform retirements | 2 |
| Historical/tile decoding and record-reference errors | 0 |

The catalogue contains retained excluded layers and unverified pilotage candidates as research records. It does not add those layers to the visible chart. Source observations are not a count of separate physical objects: soundings, contours, multi-scale chart representations and repeated source snapshots are included.

Eight current EMODnet WFS extracts were fetched and compared with the saved source files. The current OSM/Geofabrik extract supplied 20,243 tagged nodes, 4,711 tagged ways and 75 seamark relations. All tagged ways have their required positions. 65 relation areas were assembled; 10 remain unresolved because of missing members, nested geometry, unsupported roles or an open boundary. Those unresolved objects are retained in the source package without invented positions.

## Review queue

| Candidate category | Count | Interpretation |
|---|---:|---|
| Nearby records from different sources | 12,926 | Often legitimate coincident mark/light components; not automatic duplicates |
| Same normalized name within 250 m | 4,309 | May be one mark at different scales/epochs, or different nearby objects |
| Geometry detail differences | 1,718 | Pipeline source versus saved simplified display lines; not proof of a moved pipeline |
| Changed source attributes | 1 | Facility OE-UK134 changed from EMEC Wello Oy 2 to EMEC Blue Horizon |
| Absent from newest bounded source extract | 388 | Coverage or catalogue differences possible; not confirmed removals |
| Inactive/cancelled/decommissioned source statuses | 239 | Verify what remains physically present |
| Wind-farm point/boundary associations | 6 | Same site can legitimately have multiple geometries/phases |

No proximity candidate was automatically merged or removed. Exact repeated snapshots do not become additional map symbols. The full machine-readable queue and source observations are in the master backup.

## First supported corrections

Kinsale Head Alpha (EMODnet platform ID IE2) and Kinsale Head Bravo (IE3) are retired from the **master offshore-installation layer**. Today's source still labelled them Operational. Arup's project account confirms the platforms were removed down to seabed level, with the programme completed in September 2022. The old observations and correction evidence remain in the database.

Evidence: [Arup Journal 2/2023](https://www.arup.com/globalassets/downloads/arup-journal/the-arup-journal-2023-issue-2.pdf), printed pages 36–37 (PDF page index 18). Pipelines and cables were left in place; this correction does not remove those records or assert a clear seabed. Other chart/raster depictions still require independent reconciliation.

## Wind-farm audit

The retained UK/Ireland collection has 101 point records and 235 boundary records. The boundary statuses are: 41 Approved, 10 Construction, 10 Dismantled, 96 Planned, 77 Production, 1 Test site. These are geometry records, not necessarily that many distinct farms. Wind farms remain outside your nine-layer chart selection; the data is retained for checking changed offshore infrastructure.

## Updating the chart

1. Refresh source snapshots and compare them with the catalogue.
2. Review added/changed/nearby/absent records against suitable dated evidence.
3. Apply a correction to the permanent entity ID; retain the old observation.
4. Export the chosen current features. Rebuild affected historical tiles and affected modern vector layers.
5. Publish a versioned release and retain its predecessor for rollback.

The database stores source IDs, source dates, retrieval dates, geometries, original attributes, decisions and evidence. An R-tree supports local tile rebuild queries. Seven workflow tests pass, including identity stability, staged moves, evidence requirements, non-merging proximity checks, retirement exports, repeated-import idempotence and rebuilding only a queued tile. The C++-filtered streaming OSM extractor was also checked against a small fixture.

The current public release has 25 fibre-cable records, 379 offshore-installation records, 78 port records and 175 ocean-energy records within the study extent. Each has a permanent Helmlore ID and source reference in its popup. Planned records still follow the existing display filter.

## Limits of this first release

The full Notices to Mariners correction chain is not yet reconciled. Historical depths/hazards have not been validated against current authorised charts. Ten OSM relation geometries remain unresolved, and Geofabrik coverage is its extract boundary rather than a guarantee of complete offshore coverage. The live raster seamark overlay is not yet replaced by reviewed canonical vector marks. Source licences and attribution remain applicable; processing does not turn the historical source into an official chart or transfer source ownership.

The rebuild scripts, source manifest and explicit correction register are stored with the project. The backup contains the SQLite master, full review queue/details, file hashes, source snapshots, scripts and current infrastructure release. Original historical cells and tiles remain in the repository and are referenced by their commit/checksums.
