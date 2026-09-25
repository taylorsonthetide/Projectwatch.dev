# CEVNI Annex 7 sign register review

Source: *CEVNI, European Code for Inland Waterways*, sixth revised edition, ECE/TRANS/SC.3/115/Rev.6, Annex 7, printed pp. 124–150. Cross-check against the [UNECE publication](https://unece.org/transport/documents/2022/02/standards/ecetranssc3115rev6), Corrigenda 1 and 2, and Amendments 1 and 2 before publishing revised visual assets. The page-level [register](annex7-rev6-register.csv) captures the original 99-card audit; the added variant records live in the versioned catalogue scripts.

## Build 1.83.0 progress

The learner register now has 132 cards. One hundred twenty-three cards link to individual PNG crops from the Rev.6 Annex 7 source (30 family A, 17 family B, nine family C, ten family D and 57 family E). A.1 and E.1 retain source-aligned Project Watch teaching boards, making 125 displayed images. The remaining seven cards are code-only and labelled as unverified artwork. The source images are separate files in `assets/cevni/annex7/rev6/`, referenced by paths from the catalogue.

The E family gained 56 more plates and 13 previously omitted visual variants. The C family gained its eight visual variants plus C.4; D.2a–b and D.3a–b gained exact source figures. The B family gained all 17 distinct plates on printed pp. 130–134, including the missing B.12 onshore-power obligation. B.7 now uses the source plate instead of the old teaching disc. The A family gained 29 new plates after the initial A.2, plus 11 distinct A.1/A.9/A.11 variant records. A.10 remains pending the Corrigendum 2 replacement figure. Generic A.9 and A.11 remain text-only headings. See the asset [provenance note](../../assets/cevni/annex7/rev6/README.md).

## Decisions for the learner library

- The 99 current codes occur in Rev.6 Annex 7. Their card titles are generally shortened teaching summaries; this is **code presence**, not a certification of exact text or image.
- Keep the sign name/meaning cards as text while reviewing the plates. A code-only rectangle is a placeholder, not a sign recognition image. Exclude it from any image recognition assessment.
- Do not badge any of the eight present SVG files as *exact official art*. They are Project Watch schematic drawings. The A.1 and E.1 boards are close teaching representations of particular variants; the older B.7 disc was replaced in build 1.81.0; the official family also includes other forms.
- The earlier A.2, D.1 and E.2 drawings were withheld in build 1.79.0 and A.2, six D.1 variants and E.2 gained source-plate replacements. B.1 and B.7 gained source-plate replacements in build 1.81.0. A.2 depicts two same-sized arrows rather than the Annex 7 pair; D.1 is a yellow band and white stripe, whereas its actual variants are yellow diamonds/circles; E.2 uses a different lightning shape. B.1 shows an upward rather than the source's right-pointing example arrow (the sign itself is direction-dependent). The old C.1 schematic said 1.65 while the source example says 2.20; C.1 is now code-only and the two actual C.1 forms have separate plate files.
- A.10's official figure was replaced by Corrigendum 2 (November 2024); use the corrected figure for any new asset.

## Missing register entries

The original 99-card register was **not a complete plate index**. Annex 7 has 33 further distinct variant or sign codes. All 33 are now added (11 in A, B.12, eight in C and 13 in E):


Some are alternate presentations of an umbrella meaning already listed (for example A.1 and C.1); they need distinct image records if users are expected to recognise each plate. The E.5 classes now have their own image records. The umbrella headings B.2, B.3, B.4, B.9, D.1, D.2, D.3, E.4, E.9–E.12 are not additional pictograms by themselves.

## Original separate files

`assets/cevni/module03/` contains eight Annex 7 SVGs and ten Annex 8 SVGs. The present Annex 7 catalogue matches seven exact card codes; the eighth file is generic `D.1` while the register has `D.1a–f`. At the time of the original audit, 92 current cards had no exact matching separate artwork. Builds 1.79–1.83 supply 123 source-plate files; further work remains. This audit does not approve unreviewed drawings for examination use.
