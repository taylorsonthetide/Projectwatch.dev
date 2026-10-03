# UK marina location library

This separate, downloadable database contains 1,005 marina locations derived from all 1,007 OpenStreetMap `leisure=marina` records inside the United Kingdom administrative area (including Northern Ireland) in the 2026-10-03 snapshot. Two records with identical names within 30 metres were consolidated, retaining every source ID. There are 784 named locations and 221 unnamed locations. Coastal and inland records are included.

This is a broad community-mapped directory, **not a verified complete register of every UK marina**. Missing names, duplicates, access restrictions, closed/outdated sites and unmapped marinas require review. Isle of Man and Channel Islands are outside the UK query.

Coordinates are original OSM nodes or bounding-box centres of mapped ways/relations. `entranceVerified` is false for every record. A centre can lie on land or inside a basin. These are destination reference points, not safe approach waypoints. Distance, bearing and travel time are direct calculations; routes are not checked for navigable water, locks, depth or hazards.

Each record includes its OSM link, retained source IDs, coordinate basis, name and available aliases, address, operator, website and access tags. Whitehaven Harbour has the additional search alias Whitehaven Marina, confirmed by the operator's website: https://whitehavenmarina.co.uk/ . No coordinates were invented or moved.

## Licence and attribution

Database: © OpenStreetMap contributors, licensed under Open Data Commons Open Database Licence 1.0: https://opendatacommons.org/licenses/odbl/1-0/ . Attribution: https://www.openstreetmap.org/copyright . The public JSON download provides the derivative database under the same licence. This licence applies to the marina data, independently of application code.

## Updating

Download a UK Overpass snapshot once using the query recorded in the JSON and an identifying User-Agent. Respect the endpoint's usage policy and keep the existing file if the response reports an error. The website searches the committed snapshot locally; it makes no per-user Overpass requests and sends no GPS position to a marina lookup service.

Run `python3 tools/build-marina-library.py SNAPSHOT.json data/marinas/uk-marinas.json`, then `node --test tests/marinas.cjs`. Review the coverage counts and notable sites before publishing. Keep source links and coordinate-verification status when curating new records. Verified entrance coordinates require separate source-backed review.

## Reviewed additions

The library now totals 1,006 locations (785 named), including Fleetwood Beacon Marina, added in `supplement.json` so rebuilds retain it. Fleetwood Marina and Fleetwood Haven Marina are search aliases. The reference coordinates come from the TransEurope Marinas listing’s embedded map and directions; its identity is corroborated by ABP. This is a published marina location, not a verified entrance. The supplementary record preserves source links and review date.
