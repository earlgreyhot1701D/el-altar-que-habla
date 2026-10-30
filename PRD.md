# El Altar que Habla — Product Requirements Document
**Version:** 1.0 | **Target:** October 31, 2026 | **Status:** Build-ready scope, pending QA

## Vision
A visually immersive, respectful, bilingual (English default / Spanish optional) interactive Día de los Muertos ofrenda. Visitors explore objects in a cinematic altar and learn about their meanings through curated, sourced explanations. The design draws inspiration from Oaxaca, without claiming all traditions are universal.

## Audience and value
For curious visitors, students, and families: discover the significance of offerings through a beautiful, accessible, self-guided experience.

## MVP (must ship)
1. Preserve the V4 altar image, layout, seven custom SVG offering illustrations, and existing aesthetic. No redesign.
2. Explore seven offerings: marigolds, candles, water, pan de muerto, papel picado, photographs, and copal.
3. Hotspots and keyboard-accessible alternative controls select an offering; detail panel updates accurately.
4. Three curated explanation tabs: Context, History, Variations.
5. English default, complete Spanish toggle (including labels, alt text, navigation, errors).
6. Curated, deterministic Q&A fallback; **do not label it as AI**.
7. Per-offering supporting links and sources page; disclose AI-generated concept scene; note regional/family variation.
8. Responsive phone/tablet/desktop, visible focus, reduced-motion support, no horizontal overflow.
9. Public Vercel URL, README, license, QA evidence.

## Optional stretch goal: Gemma narration
Only after MVP passes tests. Gemma may paraphrase or conversationally explain *approved, cited content*; never generate new historical/cultural claims. The app must function when the AI service fails. Never expose credentials in client JavaScript. Server-side route only, with rate limiting and bounded responses.

## Explicitly out of scope for deadline
Drag-and-drop altar builder, user accounts, photo uploads, database, payments, social sharing, personalized memorial data, broad agentic workflows, analytics requiring consent.

## STUB — Remember someone
Explore an optional, private remembrance space in a future release.
- EN: “Remember someone”
- ES: “Recuerda a alguien”
- Implementation is deferred. Any future version requires separate design, accessibility, cultural review, testing, and approval. Preserve the altar artwork and hotspot coordinates.
- Privacy starting point: session-only text, no automatic persistence, uploads, public sharing, analytics capture, or transmission to Gemma or another server. Provide a clear erase action. Any future storage or sharing requires an explicit privacy decision and disclosure.

## Approved visit-only moments
- One optional veladora below the altar, lit once, memory-only until reload. No names, persistence, telemetry, API calls, audio, scores or confetti. Three-second gentle lighting effect, then steady; immediate steady light for reduced motion. Exploration reset and language switching preserve the candle.
- Sugar-skull explanation in Sources: attribute size-specific meanings to the existing INPI source, verified in a browser by the user. Cite Alas y Raíces separately for chocolate skulls. No eighth element or Gemma context changes.
- Monarch explanation attributed to UNESCO's Mariposa Monarca resource. Original decorative SVG uses a measured left-edge corridor, pointer-events none, aria-hidden, with eight-pixel clearance from interactive targets. Skip unsafe routes. Reduced motion uses a still butterfly; visible pause/resume control cannot override the system preference.
- Flight is optional: first after 30 eligible seconds, 11-second appearance (4 arrival / 3 rest / 4 departure), 90 eligible seconds between, maximum three starts. Hide/cancel on story/intro/chooser, typing, hidden tab, scrolling, resize or unsafe geometry. No catch-up bursts. Cut flight if safety checks fail; keep the checked still state.

## STUB — Sugar skulls as an eighth element
Future scope only: requires separate approval including API changes. Candidate hotspot at 24%/66% must pass real geometry, hover/focus and tooltip checks at all eight profiles. Preserve all existing coordinates and artwork. Add a source-backed full story only after its historical content is reviewed; never invent history to fill a tab.

Implementation inventory for that future approval:
- `src/content.js`: chooserHelp, offerings, intro.text and progress.complete in both languages; eight/ocho terminology, new bilingual entry.
- `index.html`: description/og:description/twitter:description, default intro and nav, progress denominator, completion, navigation comment and scene alt, eighth button/tile.
- `src/main.js`: total 7 to 8. `src/illustrations.js`: eighth asset mapping and a new crop of the unchanged master.
- `api/_curated_knowledge.js`: separately approved entry in exact UI parity. `src/sources.js`: reviewed source mapping. No changes to these APIs for the current note.
- Tests: smoke IDs/counts/metadata/parity, Gemma approved count, e2e subjects/categories/IDs/counts/progress/completion/chooser/tile reachability across all eight profiles.
- `README.md`: overview, offering table, chooser, 0/7–7/7 progress, coverage and scope limitation. `PRD.md`, `SPEC.md`, `TASKS.md`: current seven-element scope statements.
- Preserve unrelated seven-level cultural references, numbered requirements, archived V4 HTML, past QA results, screenshots and snapshot thresholds. No global replacement of "7".

## Success criteria
- All seven offerings usable on desktop and mobile.
- Language switch does not lose selection or produce mixed-language UI.
- All tabs and links work; no uncaught browser errors.
- Keyboard-only user can explore without relying on hotspot positioning.
- Screen-reader labels and status updates understandable.
- Public Vercel production deployment, no secrets in repo.
- Source claims editorially checked; limitations disclosed.

## Risks and mitigations
- Cultural oversimplification: curated wording, per-offering citations, avoid universal claims, human cultural review.
- AI hallucinations: no AI in core path; source-grounded server-side optional extension.
- Single-file fragility: extract assets/content incrementally, preserve exact baseline behavior.
- Time: freeze typography and layout until functional MVP deployed.
- Remote font availability: system fallbacks; no broken layout without network.

## Decision gate
**Build approved; production release contingent on regression, accessibility, source, and deployment checks.**
