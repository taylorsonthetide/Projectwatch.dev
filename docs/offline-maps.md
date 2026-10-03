# Offline development basemaps

Navigation and Planning use device-local PMTiles archives stored in IndexedDB.
The service worker caches the two viewers, renderer libraries and marina library,
but never prefetches standard OpenStreetMap tiles, OpenSeaMap tiles or account pages.

## Data provenance

Source: https://build.protomaps.com/20261003.pmtiles, Protomaps 4.15.2.
Source metadata: https://build-metadata.protomaps.dev/builds.json.
Download guidance: https://docs.protomaps.com/basemaps/downloads.
Licence: ODbL Produced Work; visible OpenStreetMap / Protomaps attribution is retained.
The renderer and PMTiles library licences are stored beside the vendored scripts.

Extracted with official go-pmtiles 1.31.2:
- Whitehaven and surrounding coast: bounds -3.75,54.4,-3.35,54.75; max zoom 14.

The source is an OSM basemap, not a licensed hydrographic chart. Depths, hazards,
tidal clearance and offline sea marks are unavailable. Increasing display zoom
cannot add details that are absent from the archive.

## Storage and behavior

An explicit download streams the archive from this site's own files. The byte
count and SHA-256 must match the manifest before the complete Blob is committed
to IndexedDB. Cancelled downloads and storage errors leave previous packs intact.
A FileSource reads saved archive slices directly, without online tile requests.
The chosen local map restores after reload and works on both viewer pages.
Connection loss selects the most detailed saved pack covering the map centre.
Coverage warnings identify areas outside the selected pack. Browser storage can
be cleared or evicted; users should check saved status before relying on downloads.

Tests read genuine local vector tiles with network access disabled and verify
every package hash, source zoom and the viewer's cached assets.

Only the 3.3 MiB Whitehaven pack is published for the initial offline test. Larger regional extracts remain outside the repository pending a separate storage solution.
