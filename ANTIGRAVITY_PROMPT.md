# Paste this into Antigravity

You are the implementation engineer for **El Altar que Habla**, a bilingual interactive Día de los Muertos ofrenda. The attached `el_altar_que_habla_v4.html` is the **source of truth**. Read `PRD.md`, `SPEC.md`, and `TASKS.md` before making changes.

Goal: ship a working, respectful, accessible MVP to Vercel quickly, preserving the V4 cinematic altar, seven custom illustrations, visual layout, English default, Spanish toggle, curated content, and source links.

Rules:
1. First inspect the HTML and report architecture, risks, and a minimal migration plan. Do not redesign or change fonts now.
2. Preserve V4 as an unchanged baseline. Favor Vite + vanilla JS if splitting files is useful; otherwise deploy the standalone HTML first. Do not add React/Next.js without justification.
3. Implement tasks in `TASKS.md` order. Deploy a Vercel preview as early as possible.
4. Keep cultural content deterministic and sourced. Do not invent cultural facts or describe deterministic answers as AI. Gemma is stretch-only after MVP.
5. Never put API keys in frontend code or commit credentials. Ask before any external integration requiring secrets.
6. Add meaningful tests and run them. Report exact commands, results, screenshots, and remaining gaps; do not fabricate QA.
7. Before each major refactor, explain why it is necessary and how existing interactions will be preserved.
8. Reuse verified deployment conventions from my prior repositories if available, but do not assume their package configurations match.
9. Produce a public Vercel production URL, repository README, and release checklist.

Begin with Phase 0 and Phase 1. Show me the initial deployment plan and any blockers before large-scale edits.
