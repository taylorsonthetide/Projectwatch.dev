# UK and Ireland marine data research — 7 October 2026

## Depth portrayal feedback

Current EMODnet multicolour portrayal is a whole-ocean palette. Red/yellow indicate its depth scale, not a vessel-specific danger classification. User requests shallow-water emphasis and quieter deeper water. Proposed custom research bands: drying/above LAT separately, 0–2 m, 2–5 m, 5–10 m, 10–20 m, with depths beyond 20 m unobtrusive. These are display intervals, not safe-depth thresholds. Preserve source datum, resolution and missing-data mask. No palette change implemented in this research batch. Native depth samples must be used; do not infer shallow depths from existing rendered colours. EMODnet supplied contours start at 50 m; shallower contours require a separate derived dataset.

## Newly archived wind farm data

Provider: EMODnet Human Activities / CETMAR. Metadata revision 10 July 2026, retrieved 7 October 2026. Licence: CC BY 4.0. Metadata: https://emodnet.ec.europa.eu/geonetwork/srv/api/records/8201070b-4b0b-4d54-8910-abcea5dce57f

Files:
- ../data/navigation/emodnet-uk-ireland-windfarms-points-20261007.geojson — 101 point records.
- ../data/navigation/emodnet-uk-ireland-windfarms-areas-20261007.geojson — 235 polygon/multipolygon records.

Query bounds [-12,49,3,61], WFS CRS84 bbox; returned GeoJSON coordinates EPSG:4326 longitude/latitude. Filtered country to United Kingdom and Ireland; geometry unchanged. This study box does not cover every offshore part of UK and Irish jurisdiction. No claim of complete national inventory. Points and areas can describe the same site; counts are not unique farms or turbines.

Area status counts: Production 77; Construction 10; Approved 41; Planned 96; Dismantled 10; Test site 1. Points: Production 2; Approved 3; Planned 95; Dismantled 1. Do not display proposed polygons as operating farms. Fields include name, status, country, number of turbines, power, update year and notes where supplied. Saved for integration; not yet added to map UI.

Attribution: This data was downloaded from the EMODnet Portal; the data originator is CETMAR. Licensed under CC BY 4.0. Changes: geographical/country subset only.

## Next sources, not yet downloaded

UKHO wrecks and obstructions: official page describes over 94,000 global charted/uncharted live/dead wreck and obstruction records, quarterly updates, free under Open Government Licence. This is the worldwide catalogue size, not a UK count. Actual regional download and fields still need checking. https://www.admiralty.co.uk/access-data/marine-data

INFOMAR: free Irish seabed data CC BY 4.0, some finer merged/survey surfaces. Selected grid datum/resolution/extent still need verification. Portal says not all surveys are downloadable and data are unsuitable for navigation. https://www.infomar.ie/data ; https://www.infomar.ie/node/571

EMODnet Human Activities WFS capabilities also expose pipelines and several cable layers, including UK fibre cables. Discovered only: no download/licence/provenance validation for those layers yet. These are not evidence of complete cable coverage. https://ows.emodnet-humanactivities.eu/wfs?service=WFS&version=2.0.0&request=GetCapabilities

UKHO offshore infrastructure is offered for preview/purchase/download; do not assume all portal datasets are free. Source-by-source access and licence checks remain necessary.
