# Project Watch content structure

The current application is a static website. A standard HTTPS web server can serve
`index.html`, `css/`, `js/`, `libraries/`, and `assets/` together without a build step.
Keep these directories at the same relative paths when moving hosting providers.

## Content boundary

- `index.html`: page structure and existing controls.
- `css/project-watch-core-1.88.0.css` and `js/project-watch-core-1.88.0.js`:
  the original presentation and simulator runtime, loaded in their original order.
- `libraries/project-watch/`: original Project Watch question banks, lessons,
  scenario definitions, rule reference data and visual path maps.
- `assets/project-watch/lights-master/`: standalone approved Lights & Shapes
  reference and recognition visuals formerly carried as base64 HTML in the page.
- `libraries/project-watch/asset-catalog-1.88.0.json`: paths and SHA-256 checksums
  for 54 existing image assets and 17 standalone Lights & Shapes visual pages.
- `libraries/cevni/` and `assets/cevni/`: separate inland course content and visuals.
- `css/` and `js/`: presentation and behaviour. Data files are loaded as classic
  scripts before the existing original Project Watch runtime so its bindings
  and progression rules remain unchanged.

The original course still saves progress and mock state in the learner's browser
storage. Moving the static site to a server does not by itself provide accounts,
cross-device progress, server-side grading or referral attribution. Those need a
separately designed authentication and data service later. The CEVNI progress
and assessment stay independent of the original eight-stage course.

## Migration checkpoint

The content extraction moved 53 literal collections and 17 approved visual
HTML pages without editing their questions, correct-answer indexes or artwork.
Other inline page templates, dynamically generated SVGs and later feature patches
still require staged review before the entire original page is fully separated.
Do not delete an inline source until its external replacement is verified in the
live learner flow. The approved 1.87.1 branch is the rollback reference.

## Publishing check

Serve the directory root over HTTPS and test: original course stages 1–8,
the four original mocks, collision/TSS/buoyage/AIS simulators, Lights & Shapes
visual frames, the separate CEVNI modules and mock, and return navigation.
Verify the browser network panel has no missing library or asset requests.
