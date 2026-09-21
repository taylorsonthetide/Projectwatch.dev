Project Watch 1.60.0 — Controlled Asset Separation

Baseline: 1.59.4 clean audited checkpoint.

What changed:
- Extracted all Base64-embedded image payloads from index.html.
- Replaced each embedded data URI with a relative file reference under assets/embedded/.
- Preserved application/course/progression/Test Mode logic.
- Preserved evidence-library IDs and resolver code.
- No new renderer, progression engine, MutationObserver, or course content added.

Results:
- Embedded image references extracted: 56
- Unique external image files: 54
- Original index.html: 9,838,969 bytes
- New index.html: 5,248,825 bytes
- Reduction: 46.7%

Deployment:
Upload the CONTENTS of this folder to the repository root, preserving:
  index.html
  assets/embedded/<all files>

Do not upload index.html alone: the separated images are now required.
