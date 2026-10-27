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
