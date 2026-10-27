# Antigravity Build Tasks — Ordered for speed
Use checkbox status and commit at each milestone. Stop adding features when release criteria pass.

## Phase 0 — Baseline and safety
- [ ] Create new GitHub repo and import **unchanged** V4 as `baseline/v4.html`.
- [ ] Inspect V4 source, all event handlers, inline artwork, translations, citations, and current console behavior.
- [ ] Inspect actual Blazon / Two Sisters Tinctures setup *only if accessible*; record reusable workflows, not assumptions.
- [ ] Check repo for credentials before commit; add `.gitignore`; choose license.
- [ ] Capture baseline desktop/mobile screenshots for visual comparison.

## Phase 1 — First live preview (highest priority)
- [ ] Choose static V4 deploy **or** minimal Vite; do not start with framework rewrite.
- [ ] Add `package.json` scripts (`dev`, `build`, `test`) if using Vite.
- [ ] Run local preview and resolve any runtime/build errors.
- [ ] Connect GitHub repo to Vercel and deploy preview.
- [ ] Verify preview URL loads and scene artwork appears.
- [ ] Commit milestone: `chore: deploy baseline altar`.

## Phase 2 — Function and accessibility
- [ ] Verify seven hotspots and non-spatial offering selection.
- [ ] Verify three explanation tabs for each offering.
- [ ] Verify EN/ES toggle across all text, source cards, ARIA names, placeholders, errors.
- [ ] Verify reset behavior and deterministic Q&A fallback.
- [ ] Add keyboard focus, touch target, semantic regions, announcement support.
- [ ] Verify 320/390/768/1440 widths and reduced-motion.
- [ ] Fix bugs only; no typography redesign.

## Phase 3 — Source and cultural editorial pass
- [ ] Manually open all institutional source URLs.
- [ ] Map every substantive offering claim to a source or qualify it.
- [ ] Review regional specificity, avoid claiming one fixed Oaxaca tradition.
- [ ] Review Spanish phrasing with a fluent human reviewer if possible.
- [ ] Retain AI concept-art disclosure and deterministic-not-AI disclosure.

## Phase 4 — Automated regression
- [ ] Add Playwright smoke tests: default language, each offering, tabs, toggle, source links, question, reset.
- [ ] Run desktop and mobile Chromium checks; record commands and results.
- [ ] Check no JS errors or horizontal overflow.
- [ ] Run keyboard-only manual flow and accessibility audit; log unresolved issues.
- [ ] Verify production build and deploy preview.

## Phase 5 — Ship
- [ ] Add README: concept, setup, usage, sources, AI disclosure, limitations, screenshots.
- [ ] Confirm metadata, social preview, favicon, HTTPS.
- [ ] Merge to main; verify Vercel production URL.
- [ ] Add production URL and submission instructions to README.
- [ ] Freeze MVP and tag release `v1.0.0`.

## Phase 6 — Stretch only if time remains
- [ ] Decide if Gemma materially improves the experience.
- [ ] If yes, implement server-side source-constrained endpoint with fallback, limits, tests.
- [ ] Never block shipping on AI availability.

## Definition of done
A visitor can use all seven offerings in English or Spanish on a public URL, with source links, keyboard access, responsive presentation, no critical errors, and a truthful QA record.
