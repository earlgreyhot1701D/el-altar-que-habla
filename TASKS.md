# Antigravity Build Tasks — Ordered for speed
Use checkbox status and commit at each milestone. Stop adding features when release criteria pass.

## Phase 0 — Baseline and safety
- [x] Create new GitHub repo and import **unchanged** V4 as `baseline/v4.html`.
- [x] Inspect V4 source, all event handlers, inline artwork, translations, citations, and current console behavior.
- [x] Inspect actual Blazon / Two Sisters Tinctures setup *only if accessible*; record reusable workflows, not assumptions.
- [x] Check repo for credentials before commit; add `.gitignore`; choose license.
- [x] Capture baseline desktop/mobile screenshots for visual comparison.

## Phase 1 — First live preview (highest priority)
- [x] Choose static V4 deploy **or** minimal Vite; do not start with framework rewrite.
- [x] Add `package.json` scripts (`dev`, `build`, `test`) if using Vite.
- [x] Run local preview and resolve any runtime/build errors.
- [x] Connect GitHub repo to Vercel and deploy preview.
- [x] Verify preview URL loads and scene artwork appears.
- [x] Commit milestone: `chore: deploy baseline altar`.

## Phase 2 — Function and accessibility
- [x] Verify seven hotspots and non-spatial offering selection.
- [x] Verify three explanation tabs for each offering.
- [x] Verify EN/ES toggle across all text, source cards, ARIA names, placeholders, errors.
- [x] Verify reset behavior and deterministic Q&A fallback.
- [x] Add keyboard focus, touch target, semantic regions, announcement support.
- [x] Verify 320/390/768/1440 widths and reduced-motion.
- [x] Fix bugs only; no typography redesign.

## Phase 3 — Source and cultural editorial pass
- [x] Manually open all institutional source URLs.
- [x] Map every substantive offering claim to a source or qualify it.
- [x] Review regional specificity, avoid claiming one fixed Oaxaca tradition.
- [x] Review Spanish phrasing with a fluent human reviewer if possible.
- [x] Retain AI concept-art disclosure and deterministic-not-AI disclosure.

## Phase 4 — Automated regression
- [x] Add Playwright smoke tests: default language, each offering, tabs, toggle, source links, question, reset.
- [x] Run desktop and mobile Chromium checks; record commands and results.
- [x] Check no JS errors or horizontal overflow.
- [x] Run keyboard-only manual flow and accessibility audit; log unresolved issues.
- [x] Verify production build and deploy preview.

## Phase 5 — Ship
- [x] Add README: concept, setup, usage, sources, AI disclosure, limitations, screenshots.
- [x] Confirm metadata, social preview, favicon, HTTPS.
- [x] Merge to main; verify Vercel production URL.
- [x] Add production URL and submission instructions to README.
- [x] Freeze MVP and tag release `v1.0.0`.

## Phase 6 — Stretch only if time remains
- [ ] Decide if Gemma materially improves the experience.
- [ ] If yes, implement server-side source-constrained endpoint with fallback, limits, tests.
- [ ] Never block shipping on AI availability.

## Definition of done
A visitor can use all seven offerings in English or Spanish on a public URL, with source links, keyboard access, responsive presentation, no critical errors, and a truthful QA record.
