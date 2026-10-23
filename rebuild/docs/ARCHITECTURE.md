# Platform architecture

Five primary destinations, one shell and design system:
- Home: resume an actual previous lesson; otherwise a clear starting choice.
- Learn: nine source-backed pathways with consistent lesson navigation.
- Library: searchable reference subjects with clear contextual links.
- Practice: choose a subject, reuse its approved bank, then revisit mistakes.
- Progress: actual local study and first-attempt practice results. No fake sample scores.

Pure content compiler reads existing external libraries in an isolated VM, records hashes and emits data; it never modifies those libraries. Stable IDs are derived from source and original index, not display title. Course adapters normalize presentation only. Questions retain original prompt/options/answer/explanation exactly.

UI modules: router, data loading, state storage, components, lesson reader and practice session. Text is rendered through DOM textContent. No inline handlers, no production scripts, tracking, backend or auth writes. New local progress key is helmlore-rebuild-v2; existing platform keys are never read or overwritten.

Learning and technical visuals have separate provenance. Existing sources stay in the repository; a release build will package only an allowlisted dependency graph. The prototype is served from the repository root at /rebuild/ so approved assets can be referenced without duplication. No service worker is registered while the design is in development.

Migration work remaining: CEVNI engine/locks/mock exam; per-subject visual review; lights/aspect geometry and sound engine; collision and buoyage simulations; tide/chartwork interactive exercises; course finals/unlocks; secure account/progress continuity; glossary/search expansion; handbook/resource placement; offline behaviour and migration/rollback.
