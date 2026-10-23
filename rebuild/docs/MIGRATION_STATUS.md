# Rebuild milestone 0.1

## Implemented foundation
- Isolated helmlore-rebuild-v2 branch; only rebuild/ changes.
- Controlling brief and release gates, including no publication until Cliff approves complete replacement.
- Five-area navigation, responsive design tokens and common components.
- Nine pathway catalogue; 104 source-backed lesson records across eight pathways.
- Lesson reader with source-provided scenes/diagrams, source text, previous context and next actions.
- 118 approved questions normalized without changing question/option/explanation strings or answer indexes.
- Source lock: 63 active content-library/reference files hashed and protected against drift.
- Text/stimulus-available practice, feedback, focused weak-topic review and separate local study record.
- LocalStorage failure handling; no tracking, service worker, authentication or production database connection.
- Standalone local HTML preview packaging script with embedded assets.
- Eight automated content/state tests passing.

## Not complete / not release-ready
CEVNI modules 1–9 and mock exam require their own engine adapter and visual/audio stimulus parity. Bridge source text is imported, but the full eight-stage engine, bank coverage, unlocking and assessments are not yet migrated. Other subject readers do not yet replace their specialist interactive workshops or art renderers. A question whose required diagram/audio is not attached is kept in data but excluded from generic practice. Entire question bank coverage must be reconciled before release; 118 is a first tranche, not the full platform bank.

All courses need visual QA against their source diagrams; replace decorative/weak visuals with checked original assets. Light/aspect and sound engines must be carried across without changing their geometry/timing. Need a complete source-to-output visual register, provenance and signoff per lesson. Browser testing across iPad, phone and desktop is pending; current environment has no supported local-browser forwarding, and the user explicitly requested no hosted deployment. Automated tests do not establish visual quality.

Account sync and migration are deliberately not connected. Existing accounts/progress remain untouched. No percentage should be described as mastery or formal course completion based only on read marks or generic practice.

Next milestone: full Bridge/CEVNI source reconciliation, consistent course/lesson schema, and complete visual lesson templates for buoyage and lights before broad artwork replacement.
