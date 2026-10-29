# El Altar que Habla · Día de los Muertos Ofrenda

![El Altar que Habla cover: an illustrated ofrenda glowing with candles and marigolds at night, with the words A small offering. Shared with care.](assets/article/cover.webp)

**The altar that speaks.** An interactive, bilingual (English and Spanish) Día de los Muertos ofrenda. Choose one of seven traditional offerings, read what it means, and ask your own question. Answers come from Google's open-weight Gemma 4, grounded on curated content from Mexican cultural institutions and UNESCO. When the AI is unavailable, a labeled curated guide answers instead.

Built for the [DEV Hacktoberfest Open-Source AI Challenge, Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26) (October 2026).

| | |
|---|---|
| **Live app** | [el-altar-que-habla.vercel.app](https://el-altar-que-habla.vercel.app) |
| **Open-source AI** | [Gemma 4](https://ai.google.dev/gemma) (`gemma-4-26b-a4b-it`), served through the Gemini API |
| **Prize category** | Best Use of Gemma |
| **Built by** | [L. Cordero](https://dev.to/earlgreyhot1701d) · [Clew Suite](https://clewlabs.org) |
| **License** | [MIT](LICENSE) |

---

## Why this exists

I have loved Día de los Muertos since 1996, and I wanted to share a small part of what I have learned with the DEV community. This is a beginning, not a complete guide. Traditions vary by region, community, and family, and the app says so.

---

## What it does

![The Spanish version of the app with the Agua story open. A Gemma answer card labeled Guía Gemma 4 (IA) explains that water is a gesture of hospitality for souls after their long journey, and that how it is presented can vary by family and community. A note below says the institutional references are background reading and do not verify the generated answer.](assets/article/spanish-gemma-water.webp)

Seven offerings, each with a story card and three tabs (Context, History, Variations):

| Offering | Spanish |
|---|---|
| Marigolds | Cempasúchil |
| Portraits | Retratos |
| Candles | Veladoras |
| Bread of the dead | Pan de muerto |
| Cut paper | Papel picado |
| Incense | Copal |
| Water | Agua |

- **Two ways in.** Select a + on the altar, or open the list of seven offerings. The list is a native dialog that works with a keyboard and screen reader.
- **Ask a question** about any offering, in English or Spanish.
- **Two labeled voices.** Gemma answers are labeled "Gemma 4 Guide (AI)." Fallback answers are labeled "Curated guide (no AI)." A visitor can tell which one they are reading.
- **Progress.** Visited offerings are tracked from 0/7 to 7/7, with a visible "Start over."
- **Bilingual throughout.** Titles, stories, tabs, labels, and accessibility text switch together, and the open story stays open.

---

## How Gemma is grounded

The project requirement: Gemma may explain approved, cited content, and should not generate new historical or cultural claims. The app has to work when the AI does not.

1. **The server owns the knowledge.** The browser sends only `{ offeringId, language, question }`. The server checks `offeringId` against an approved list and builds the prompt from `api/_curated_knowledge.js`. Visitors cannot send cultural context.
2. **Sources are labeled for what they are.** Institutional links are returned as background reading (`attribution: "background_only"`). They do not verify the specific sentence the model wrote, and the UI says so.
3. **Deterministic fallback.** If Gemma times out (20 second default) or errors, the curated guide answers.
4. **Bounded and rate limited.** Questions are sanitized, answers are capped at 500 characters, and requests are limited to 15 per minute per IP.
5. **No stale answers.** A request ID discards responses that arrive after the visitor has moved to another offering.
6. **Key stays on the server.** `GEMINI_API_KEY` lives only in the serverless function's environment.

---

## Primary sources

The cultural content draws on:

- **INPI** (Instituto Nacional de los Pueblos Indígenas): [Significado de los elementos de una ofrenda](https://www.gob.mx/inpi/articulos/conoces-el-significado-de-los-elementos-de-una-ofrenda-de-dia-de-muertos?_amp=true)
- **INAH** (Instituto Nacional de Antropología e Historia): [Ofrendas para los muertos](https://www.inah.gob.mx/foto-del-dia/ofrendas-para-los-muertos)
- **UNESCO** Intangible Cultural Heritage: [Indigenous festivity dedicated to the dead](https://ich.unesco.org/en/RL/dia-de-muertos-the-indigenous-festivity-dedicated-to-the-dead-00054)
- **Gobierno del Estado de México:** [Día de Muertos: altares y niveles](https://edomex.gob.mx/dia-de-muertos) (this server often times out)

**Disclosure:** the altar scene is AI-generated concept art, not a photograph of a family altar. These sources are a starting point, not a rulebook.

---

## Architecture

```
index.html                 App shell
src/
  main.js                  State, rendering, focus management, language switch
  content.js               Bilingual offering content (Context / History / Variations)
  sources.js               Institutional source links per offering
  illustrations.js         Offering icons
  styles.css               Layout and theme
api/
  explain.js               Serverless endpoint: validation, rate limit, Gemma call, fallback
  _gemma.js                Model config, prompt builder, input sanitizer
  _curated_knowledge.js    Server-owned knowledge base for each offering
public/                    Altar scene and per-offering WebP crops
baseline/v4.html           Original single-file prototype, kept as a visual reference
tests/                     Unit, integration, and Playwright browser tests
docs/qa/                   QA reports and before/after screenshots
```

Stack: [Vite](https://vite.dev/), plain JavaScript, a Vercel serverless function, and [Playwright](https://playwright.dev/) for browser tests. No front-end framework.

---

## Testing

| Suite | Command | Result at release |
|---|---|---|
| Unit and integration | `npm test` | 33 of 33 |
| Production build | `npm run build` | Pass |
| Playwright browser tests | `npm run test:e2e` | 30 of 30 |

The browser tests check things a code-only test can miss:

- Every hotspot's center lands inside its painted object on the altar, on mobile, tablet, and desktop.
- Every hotspot is at least 44 by 44 pixels, and none overlap.
- Story text does not collide with the question area, in both languages, across all seven offerings and all three tabs.
- No horizontal overflow across 8 viewport profiles, from 320 px wide to desktop.
- The curated fallback renders correctly when the model is forced to fail.

CI runs all of the above on every pull request (`.github/workflows/qa.yml`).

---

## Run it locally

Requires Node 22.

```bash
npm install
npm run dev          # http://localhost:5173
npm test
npm run test:e2e     # Playwright starts its own dev server
npm run build
```

To try live Gemma answers, add a Gemini API key to `.env.local` (never commit it):

```
GEMINI_API_KEY=your_key_here
```

Without a key, the app runs on the curated guide.

---

## What it can't do

- The fallback was tested by forcing failures locally, not by breaking production.
- Mobile and tablet checks run in Chromium emulation, not on physical devices.
- The rate limiter is in memory per serverless instance, so it is best effort, not global.
- Seven offerings is a beginning. A family altar holds far more.

---

## How it was built

Built in about two days with several AI tools, directed and reviewed by me:

- **[Google Antigravity](https://antigravity.google/)** split the original prototype into modules and built the first versions.
- **Codex** ran a critical QA audit and turned screenshots into specific defects and handoff prompts.
- **[Kiro](https://kiro.dev/)** reviewed each pull request, merged it, and verified the production deploy against the exact merge commit.

The full story is on DEV: *El Altar que Habla: A Día de los Muertos Ofrenda Built with Gemma 4* (link coming soon).

---

## License

[MIT](LICENSE)

AI Assisted. Human Approved. Powered by NLP.
