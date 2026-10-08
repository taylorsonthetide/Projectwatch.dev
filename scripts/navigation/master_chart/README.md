# Helmlore UK & Ireland master chart

This is a versioned **custom research chart catalogue**, not an official ENC or a verified navigation chart. Helmlore owns its correction workflow and rendering work; conversion does not transfer ownership or remove the licences of source data.

The compact master backup retains all tables, IDs, source observations, source attributes and correction history. Rebuildable secondary and spatial indexes are omitted to reduce its size. Restore it over a repository checkout, then run `python3 scripts/navigation/master_chart/restore_indexes.py --database data/navigation/master-chart/build/helmlore-master.sqlite` before tile rebuilds or regular updates. Read-only inspection works without those indexes. The original historical source/tile files stay in the repository and are not duplicated in the backup.

## What is maintained

SQLite is the master store. `entities` hold permanent Helmlore feature IDs; `observations` retain every source record/version, geometry, attributes, source date and retrieval date. `sources`, `files`, `releases` and `reviews` retain provenance, checksums, release history and correction evidence. The spatial R-tree supports tile rebuild queries.

The current chart selection stays: 2011 land/coast, contours, soundings (display zoom 12+), marks/lights, online sea marks, fibre cables, offshore installations, main ports and ocean energy sites. Other collected layers, wind farms and pilotage candidates are retained for audit, not automatically enabled on the map.

Exact matches can share an entity only when layer, class, geometry and every original attribute are identical. Different source versions of one stable source ID retain the same entity. Nearby positions and matching names create review candidates; they never cause automatic merges, moves or removals. Missing records and inactive source status are not evidence that every physical structure was removed.

The initial canonical export keeps the saved baseline for changed identities. New source observations remain available for comparison. A reviewed change updates the entity's current observation, preserves the old one and queues affected tiles or vector layers.

The explicit correction register is `data/navigation/master-chart/manual-corrections.json`. Apply it with `corrections.py --database DATABASE`; it matches both the source ID and name, records its evidence reference and preserves the retired source observation. The first two corrections retire the removed Kinsale Alpha/Bravo platform depictions; they do not remove pipelines, cables or assert a clear seabed.

## Initial import and audit

From the repository root, install `scripts/navigation/requirements.txt`. SQLite is in Python's standard library; install `osmium` only for PBF extraction.

```sh
python3 scripts/navigation/master_chart/refresh_sources.py
python3 scripts/navigation/master_chart/build.py --revision SOURCE_GIT_SHA
python3 scripts/navigation/master_chart/export.py --database data/navigation/master-chart/build/helmlore-master.sqlite --output data/navigation/master-chart/build/export
```

The historical audit reads each original cell, validates its count and geometry coordinates, then decodes every published XYZ tile, checks its count/layer mask and verifies each fragment's original record reference. Derived tile fragments are never mistaken for separate source features. Every navigation source/supporting file is checksummed in the manifest. This is a structural/source reconciliation audit, not a hydrographic validation of every feature.

## Regular source updates

```sh
python3 scripts/navigation/master_chart/refresh_sources.py
python3 scripts/navigation/master_chart/build.py --incremental --revision SOURCE_GIT_SHA
```

The eight EMODnet WFS extracts use the same WGS84 study bounds (-12,49,3,61). Country-labelled records are filtered to UK/Ireland when imported. Historic saved files may have a different extent or simplified geometry, so absences and geometry-only differences remain review items. Failed/truncated downloads never replace source snapshots.

OpenSeaMap raster tiles cannot be reconciled feature by feature. Import the downloadable OSM data to obtain source IDs and attributes:

```sh
python3 scripts/navigation/master_chart/extract_osm.py --pbf /path/britain-and-ireland.osm.pbf --source-url https://download.geofabrik.de/europe/britain-and-ireland-latest.osm.pbf
python3 scripts/navigation/master_chart/build.py --incremental --revision SOURCE_GIT_SHA
```

Geofabrik coverage is its extract polygon, not proof of complete offshore coverage. Tagged nodes and ways are extracted; seamark relations are retained separately and need geometry assembly. Node/way source timestamps are recorded. The dated source extract/hash is recorded in the extraction report. OSM attribution and ODbL derived database obligations remain applicable.

## Review a correction

The queue contains candidate IDs, left/right source observations and reasons. Query the database for the original properties and geometries; check them against a dated harbour/lighthouse notice or other appropriate source. A chartplotter comparison can flag a discrepancy but does not establish a complete official correction chain.

```sh
python3 scripts/navigation/master_chart/review.py --database data/navigation/master-chart/build/helmlore-master.sqlite --review REVIEW_ID --action accept-change --evidence 'Dated notice URL or verification reference'
```

Other explicit actions are `merge`, `keep-separate` and `retire`. Decisions require an evidence reference and cannot be silently repeated. A stale source-change decision is rejected if the current source observation has changed. Retired/merged entities are omitted from canonical exports, while their source observations stay in the database.

## Rebuild outputs

```sh
python3 scripts/navigation/master_chart/export.py --database data/navigation/master-chart/build/helmlore-master.sqlite --output data/navigation/master-chart/build/export
python3 scripts/navigation/master_chart/tiles.py --database data/navigation/master-chart/build/helmlore-master.sqlite --output /path/to/master-tile-pack
```

For an initial complete master tile build, first copy the existing historical tile pack into a new output folder and use `--queue-all`. Subsequent historical corrections rebuild only queued native-scale tiles. Modern infrastructure/seamark data is exported as per-layer GeoJSON and queued by layer; it does not yet have a dedicated incremental vector tile renderer. Do not point the live map at a new pack until the reviewed export and source coverage have been checked.

Tile writes and the index use temporary-file replacement. Dirty tile entries clear only after successful output completion. Deployment itself remains a versioned release step, so the earlier published chart can be restored.

## Remaining work before a corrected navigation release

Resolve candidate matches and dated removal evidence; reconcile a complete relevant Notices to Mariners series; assemble OSM relation geometries; validate source licences and redistribution; obtain/verify current depth and hazard coverage; replace the live raster seamark overlay with reviewed vector features; validate a full master tile build and publish the chosen correction release. These steps are not claimed complete by the initial structural audit.

Run meaningful workflow tests:

```sh
python3 -m unittest discover -s scripts/navigation/master_chart -p 'test_*.py' -v
```

## Review marks on the map

Open `/chart-mark-review.html`. Choose an area and zoom in, select a historical mark or enable recent local positions, add a reason or chart reference and remove it. Restore retains the original source record. The register is device-local and also filters `/chart-lab.html` on the same origin. It does not publish a shared correction. Save a corrections file for transfer or backup; loading merges identities without replacing existing device decisions. Raster OpenSeaMap marks cannot be individually edited in this release.

To apply a reviewed file to the master database:

```bash
python scripts/navigation/master_chart/import_mark_corrections.py --database path/to/helmlore-master.sqlite --file helmlore-mark-corrections.json
```

The importer checks exact source ID, current position and mark classification before applying any retirements. Unknown, merged or moved records abort the batch. Repeated imports are safe. Original observations remain; affected tiles/layers are queued. Run the existing tile/export release workflow and publish the resulting reviewed assets to make the correction shared.

## Reviewed release v2

See `docs/helmlore-reviewed-chart-20261008.md`. Source-record hiding and retaining are stored in `chart_mark_decisions`; `chart_pair_decisions` preserves final lateral review results. `compile_reviewed_release.py` produces complete filtered native tiles while keeping all original observations. `export.py` and `tiles.py` exclude only IDs with an explicit hide decision.
