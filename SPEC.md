# Technical Specification — Antigravity → GitHub → Vercel
**Baseline input:** `el_altar_que_habla_v4.html` (uploaded, ~469 KB standalone HTML)

## First principle
Inspect existing V4 before writing code. It is a working prototype, not a blank canvas. Preserve scene and SVG artwork. Reuse patterns from Two Sisters Tinctures / Blazon only after inspecting their actual package manifests and deployment configs; do not copy unrelated dependencies or secrets.

## Recommended implementation
**Fastest MVP:** Vite + vanilla JavaScript + CSS, static Vercel deployment. Avoid React/Next.js unless existing code or a verified shared template justifies migration. A simple site does not need a framework migration to be deployable.

Suggested structure:
```
/
  index.html
  package.json
  vite.config.js            # only if needed
  public/
    altar-scene.jpg         # extract existing embedded image without altering appearance
  src/
    main.js                 # events and state
    styles.css
    content.js              # EN/ES curated content
    sources.js              # links and offering-source mappings
    illustrations.js        # existing seven SVGs
  tests/
    smoke.spec.js           # Playwright
  README.md
  LICENSE
  .gitignore
```
For a faster first preview, deploying the standalone V4 HTML directly is acceptable. Refactor only after confirming baseline renders.

## State contract
`{ language: 'en'|'es', selected: OfferingId, tab: 'context'|'history'|'variations' }`.
OfferingId = `flowers|photo|candles|bread|paper|copal|water`.
One render function or equivalent must update selected content, active classes, `aria-pressed`, document `lang`, and source links consistently. No duplicated source-of-truth state.

## Functional behavior
- Start with English, flowers selected, Context tab.
- Hotspot selection updates title, subtitle, description, facts, note, illustration, tab text, source links; resets tab to Context.
- Tabs update only tab copy and selected state.
- Language toggle translates **every** visible label and ARIA string, retaining selection and tab.
- Reset restores selected offering and tab, with documented language behavior (recommended: preserve language).
- Question form must be explicit that its answer is deterministic; never pretend it uses Gemma.
- Sources open safely with `target=_blank rel=noopener noreferrer`; audit destination URLs.

## Accessibility
- Semantic landmarks (`nav`, `main`, `aside` where appropriate).
- Each hotspot is a native button with unique localized name, 44×44px preferred target, focus-visible, `aria-pressed`.
- Add a non-spatial list of all seven offerings for keyboard and screen-reader discovery.
- Tabs: either implement WAI-ARIA tab pattern fully (tablist/tab/tabpanel + arrows) **or** keep ordinary buttons with `aria-pressed` and clear group label; do not half-implement.
- Announce selection and deterministic answer via appropriate live region without noisy repeated announcements.
- Honor `prefers-reduced-motion`.
- Test 320, 390, 768, 1440 widths, 200% zoom, keyboard-only.

## Content and security
- Store all cultural copy as explicit EN/ES curated data, never AI-generated on demand.
- Prefer `textContent` for prose. SVG insertion via `innerHTML` is permitted only for **hardcoded, trusted static illustrations**; never feed user or model output into it.
- Avoid external runtime dependencies except Google Fonts (with fallbacks).
- No keys in client code, `.env` committed files, or logs. Do not send memorial or personal data to third parties.
- Verify institution URLs and exact claims manually; automated access restrictions are not proof of validity.

## Optional Gemma extension (post-MVP)
- Only if a compatible API/hosting route is verified. Static Vite site cannot securely call a keyed provider directly.
- Add a Vercel Function (`api/explain.js`) with server-side secret, input validation, content whitelist, strict timeouts, abuse controls, and graceful fallback.
- Prompt grounded in selected curated object data; return plain text + cited source IDs; reject unsupported assertions. No open-ended factual generation.
- Provide loading/error states in both languages and tests for network failure.

## Deployment
1. `npm ci`, `npm run build`, `npm run test` (define scripts).
2. Vercel framework preset **Vite** if Vite used; build command `npm run build`; output `dist`. For raw HTML static deployment, use an appropriate static configuration.
3. Preview deployment on PR; production from `main`.
4. No env vars for deterministic MVP.
5. Check HTTPS, canonical URL, metadata, favicon, 404 behavior, responsive screenshots, console errors, and accessible interaction.
6. Publish source and deployment URL in README; document AI-generated scene and cultural sources.

## Required QA evidence
Record actual command, date, pass/fail, screenshots, and known gaps. Never claim screen-reader testing without a screen reader, or browser coverage without running those browsers.
