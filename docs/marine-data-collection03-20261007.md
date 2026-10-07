# Helmlore marine data collection 03 — 7 October 2026

Downloaded EMODnet Human Activities WFS GeoJSON and ISO metadata. Original spatial subset bounds: [-20,48,10,63] longitude/latitude; geometries intersect but are not clipped to this rectangle. This covers wider offshore waters and includes neighbours. It is not an exact UK/Irish EEZ boundary or a complete national inventory. Each WFS response count was checked against its matched count; no pagination truncation observed.

The uk-ireland folder supplies country-filtered records (United Kingdom/Ireland/UK/GB/IE). UK fibre cables retained as supplied. Coordinate system EPSG:4326, longitude then latitude.

|Layer|Regional records|UK/Ireland subset records|
|---|---:|---:|
|ukfibrecables|30|30|
|portlocations|238|78|
|pipelines|3411|2876|
|platforms|1247|398|
|oenergy|250|178|
|oenergytests|30|20|

All six metadata documents explicitly state Creative Commons CC-BY 4.0. Attribution: downloaded from the EMODnet Portal. Data originators: Cogea Srl (cables, pipelines, installations); Eurofish International Organisation and Cogea Srl (ports); AZTI (ocean energy). Underlying providers are listed in the accompanying metadata. Country filtering is an additional alteration; geometry and original properties are preserved. Source survey/update dates vary and are not the retrieval date.

Caveats: pipeline records may be separate segments; installation/site records may be decommissioned, planned, historical or test sites. Ports are the source catalogue’s main ports, not all marinas. UK fibre cables are a partial catalogue, not every cable. Ocean energy sites and test areas overlap; counts are not unique installations. Missing records are not evidence of clear water. No datasets added to the live map in this collection batch. Research data; not a certified navigation chart.

UKHO: a public ArcGIS mirror found in search was only Firth of Forth, already collected. Do not count it as national coverage. National UKHO endpoint identified separately; retrieval still in progress.
