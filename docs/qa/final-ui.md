# Final UI QA

Base: `676b15cb7974fc902aec1f329ebde7a25971cb16` (merged PR #2).

The supplied full screenshot exposed a real layout defect: the height-constrained story card used a flex column whose children could shrink. At the reference 1428×725 CSS viewport with 2× pixel density, the Context box shrank to 13.1px while its text needed 42px, bleeding into the question label. The story card now uses natural block flow and its existing outer scroll container. The same text measures 42px with an 18px gap before Ask.

The left navigation now has consistent offering tile dimensions and wrapping, aligned icons, a compact progress control, and a language switch near the top. The rendered offering heading says “Choose an offering” / “Elige una ofrenda.” The centered gold altar title occupies its own caption above the image, preserving the image coordinate system for hotspots.

AI and curated answers have separate labels and readable answer cards. Forced HTTP 503 responses exercise the curated path in both languages; long mocked AI answers exercise wrapping and reachable references. The provider, cultural explanations, and fallback selection logic are unchanged. The explanatory footer is shorter; individual AI answers retain the background-reading notice.

## Validation

- 33 unit/integration tests; production build.
- 30 Playwright tests, including 16 new layout regressions plus the existing 14 interaction, keyboard, request-race and screenshot checks.
- Eight viewport profiles: 1428×725 at 2× density, 1400×900, 1280×720, 1024×768, 768×1024, 390×844, 320×640, and 700×450 at 2× density.
- Every offering in EN/ES, all three tabs, forced fallback answers, expanded references, title centering, equal offering tiles, and no horizontal text overflow.
- The 700×450 profile approximates 200% desktop zoom reflow; it is not a physical browser zoom test. Mobile/tablet are Chromium emulation. Live provider availability and production deployment are outside this local UI verification.

## Visual evidence

The gold outline visible around the story title is its keyboard focus indicator.

[Before](final-ui/before.webp) · [After at reference viewport](final-ui/reference-after.webp) · [Mobile curated fallback](final-ui/mobile-fallback.webp) · [Spanish desktop curated fallback](final-ui/desktop-fallback.webp)

[Mobile navigation](final-ui/mobile-landing.webp) · [Tablet navigation](final-ui/tablet-landing.webp)
