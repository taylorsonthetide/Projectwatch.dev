# UK and Ireland mark reconciliation — 8 October 2026

Candidate radius: **50 metres**. Online layer B has display priority over CM93 2011 layer A where a mark identity is established. Source data is preserved; this is a depiction correction, not a claim that a buoy has physically been removed.

| Result | Records |
|---|---:|
| Historical marks inspected | 43,700 |
| Online buoy/beacon records retained | 6,443 |
| Cross-layer candidate pairs within 50 m | 4,659 |
| Old buoy/beacon records suppressed | 1,476 |
| Associated old light records suppressed | 240 |
| Historical marks retained | 41,984 |
| Distinct online replacement IDs | 864 |
| Unresolved candidate pairs retained | 3,185 |
| Online records removed | 0 |
| Historical hazard layers changed | 0 |

Counts include separate chart-scale records; they are not counts of distinct physical buoys. The combined cleaned marks file contains 48,427 features.

## Matching rules

Every old/new buoy or beacon pair separated by less than 50 metres is flagged. Automatic suppression requires one online match with the same normalized nonempty name, compatible buoy/beacon type and no known lateral-hand, cardinal-direction or interpretable colour conflict. Multiple same-scale historical matches to one online object remain for review. Unnamed and conflicting proximity pairs remain visible.

Light components are associated only at an identical old buoy coordinate, with one physical mark there and matching white colour and period. All online features are retained, including special-purpose and wind-farm perimeter marks. Wrecks, obstructions, soundings and contours are outside this operation and unchanged. Original wind-farm point and polygon extracts are included unchanged in the download package.

The previously reviewed Gut correction is carried forward across all three source scales, including four additional records outside the automatic result. Its replacement position agrees with [Trinity House notice 2/2023](https://www.trinityhouse.co.uk/notice-to-mariners/2/2023-gut-lighted-buoy). It is recorded separately from automatic radius matches.

## Coverage and freshness

The online source is the saved Geofabrik/OpenStreetMap extract retrieved **7 October 2026 at 22:28 UTC**, restricted to [-12,49,3,61]. Individual object edit dates are retained. This is a reproducible snapshot, not a real-time feed, and offshore completeness depends on the extract. Name/type matching establishes an identity candidate, not an independent hydrographic verification. The 3,185 uncertain pairs have not been deleted.

## Files and display

- `cleaned-marks.geojson`: retained historical marks plus all online buoy/beacon records.
- `retained-2011-marks.geojson` and `online-marks.geojson`: separate styleable layers.
- `duplicate-candidates.json`: all close pairs and decisions.
- `suppression-register.json`: exact source IDs, online replacement IDs, associated lights and source checksum.
- `scan-summary.json`: counts and coverage.
- `windfarms.geojson`, `windfarmspoly.geojson`: unchanged online source extracts.
- `deduplicate_marks.py`: reproducible scan script.

The chart reads the suppression register and hides listed old marks only while online sea marks are enabled. Switching that layer off restores the original historical view. The review tool can still inspect the original records. Future source refreshes should rerun reconciliation and publish a new register; never interpret absence in a partial extract as a physical removal.
