# Helmlore rebuild — controlling brief

Owner: Clifton Taylor. Decision date: 23 October 2026.

## Mandate
Rebuild the whole learning platform from a clean foundation, using the approved west-cardinal visual lesson as the quality benchmark. Work in the background. The existing public site remains unchanged until the rebuild is complete, reviewed and explicitly approved for cutover. No main-branch writes, public previews, domain changes, production auth/database changes or automatic deployment.

This is Helmlore only. Nathan and MoorSignal are unrelated and must receive no updates or material from this project.

## Preserve
Approved questions, answer wording, correct indexes, explanations, existing light geometry and rule meanings. Keep teaching data, assessment data and visual assets separate from interface code. Record source paths and SHA-256 hashes before migration; verify every normalized question against its source. User considers the current Q&A approved: do not rewrite it for style.

## Improve
Simple navigation: Home, Learn, Library, Practice, Progress. Course → lesson → practice → next lesson. Clear sections and obvious back/continue actions. One consistent layout, spacing, typography and interaction system. Original polished sea scenes plus technically exact diagrams; labelled viewing aspects, region/regime and light characteristics. Feedback explains answers and revisits weak topics. Responsive iPad-first layout with useful phone and desktop versions. Keyboard and touch accessibility.

Marina prices are excluded from the rebuild. Do not remove them from the current site. Handbook remains a clearly separate optional resource; weather remains a separate tool, not a chartplotter. No navigation-chart expansion.

## Visual standard
Use the approved west-cardinal lesson as benchmark, not competitor artwork. Realistic images and diagrams must agree. No invented lights, shapes, sectors, buoy bands, signals or navigation details. Exact technical visuals use code/vector assets; generated images are illustrative and individually checked. Where an approved visual is not yet integrated, do not substitute a misleading one. Every migrated technical lesson requires a visual check before release.

## Release gates
1. All nine course pathways accounted for; lesson inventory reconciled.
2. All question/answer/index/explanation parity checks pass.
3. Every simulator, light/sound rhythm, interactive chart exercise and course assessment migrated or explicitly scoped by Cliff.
4. Visual consistency and technical accuracy signed off subject by subject.
5. Account and existing progress migration designed and tested without touching production during development.
6. Phone/iPad/desktop and keyboard checks; reduced-motion handling; loading/errors/offline behaviour tested.
7. No fabricated mastery, progress or certifications; distinguish local practice from formal assessment.
8. SEO/redirect and content-rights checks, backup, rollout and rollback plan.
9. Cliff reviews the complete preview and authorizes deployment. Until then remain unpublished.

## Current milestone
Foundation: isolated branch, source inventory, content adapters, common navigation/components, real source-backed course readers/practice, local progress, quality gates. This scaffold is not the finished replacement. CEVNI engine, specialist simulators, account sync and full visual migration remain future milestones.
