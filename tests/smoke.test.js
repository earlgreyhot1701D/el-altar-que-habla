import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { content, labels } from "../src/content.js";
import { sources, itemSourceMap } from "../src/sources.js";
import { illustrations } from "../src/illustrations.js";
import "./visit-moments.test.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("Content has all seven required offerings with en and es translations", () => {
  const expectedOfferings = ["flowers", "photo", "candles", "bread", "paper", "copal", "water"];
  assert.equal(Object.keys(content).length, 7);

  expectedOfferings.forEach((offeringId) => {
    assert.ok(content[offeringId], `Missing offering: ${offeringId}`);
    assert.ok(content[offeringId].en, `Missing EN for: ${offeringId}`);
    assert.ok(content[offeringId].es, `Missing ES for: ${offeringId}`);

    ["en", "es"].forEach((lang) => {
      const data = content[offeringId][lang];
      assert.ok(data.category, `${offeringId} [${lang}] missing category`);
      assert.ok(data.title, `${offeringId} [${lang}] missing title`);
      assert.ok(data.subtitle, `${offeringId} [${lang}] missing subtitle`);
      assert.ok(data.description, `${offeringId} [${lang}] missing description`);
      assert.ok(data.context, `${offeringId} [${lang}] missing context`);
      assert.ok(data.history, `${offeringId} [${lang}] missing history`);
      assert.ok(data.variations, `${offeringId} [${lang}] missing variations`);
      assert.ok(Array.isArray(data.facts), `${offeringId} [${lang}] facts should be array`);
      assert.equal(data.facts.length, 3, `${offeringId} [${lang}] facts should have 3 items`);
    });
  });
});

test("Each offering uses a separately cached clean image asset", () => {
  for (const id of Object.keys(content)) {
    assert.match(illustrations[id], /<img class="offering-art"/);
    assert.match(illustrations[id], new RegExp(`/crop-${id}\\.webp`));
    assert.equal(illustrations[id].includes("base64"), false);
    assert.ok(fs.existsSync(path.join(rootDir, "public", `crop-${id}.webp`)));
  }
});

test("All offerings map to valid primary sources", () => {
  const expectedOfferings = ["flowers", "photo", "candles", "bread", "paper", "copal", "water"];
  expectedOfferings.forEach((offeringId) => {
    const sourceIds = itemSourceMap[offeringId];
    assert.ok(Array.isArray(sourceIds) && sourceIds.length > 0, `Missing sources for ${offeringId}`);
    sourceIds.forEach((srcId) => {
      assert.ok(sources[srcId], `Invalid source ID: ${srcId} mapped in ${offeringId}`);
      assert.ok(sources[srcId].url.startsWith("https://"), `Source URL must use HTTPS: ${sources[srcId].url}`);
    });
  });
});

test("Source HTML references the clean scene and excludes obsolete panel content", () => {
  const html = fs.readFileSync(path.join(rootDir, "index.html"), "utf-8");
  assert.match(html, /src="\/altar-clean.webp"/);
  assert.ok(fs.existsSync(path.join(rootDir, "public", "altar-clean.webp")));
  for (const id of ["facts", "note", "itemSources"]) {
    assert.equal(html.includes(`id="${id}"`), false);
  }
});

test("Priority 3: Cultural Trust - detail sources exist and preserve institutional attributions", () => {
  const expectedOfferings = ["flowers", "photo", "candles", "bread", "paper", "copal", "water"];
  expectedOfferings.forEach((offeringId) => {
    const mapped = itemSourceMap[offeringId];
    assert.ok(mapped.length >= 1, `${offeringId} must have at least one institutional citation`);
    
    mapped.forEach((srcKey) => {
      const src = sources[srcKey];
      assert.ok(src.publisher, `Source ${srcKey} has publisher`);
      assert.ok(src.name.en && src.name.es, `Source ${srcKey} has bilingual name`);
      assert.ok(src.description.en && src.description.es, `Source ${srcKey} has bilingual description`);
      assert.ok(src.url.startsWith("https://"), `Source ${srcKey} has valid https URL`);
    });
  });

  // Altar levels archival notice honesty check
  assert.ok(sources.levels.publisher.includes("Archival Notice") || sources.levels.publisher.includes("Government of the State of Mexico"), "Levels source retains honest publisher context");
  assert.equal(sources.levels.url, "https://edomex.gob.mx/dia-de-muertos", "Preserves honest direct Edomex URL without substitution");
});

test("Priority 4: Visitor Experience - bilingual labels and exploration tracking data structures", () => {
  ["en", "es"].forEach((lang) => {
    const l = labels[lang];
    assert.ok(l.intro, `Missing intro object for ${lang}`);
    assert.ok(l.intro.badge, `Missing intro badge for ${lang}`);
    assert.ok(l.intro.title, `Missing intro title for ${lang}`);
    assert.ok(l.intro.text, `Missing intro text for ${lang}`);
    assert.ok(l.intro.begin, `Missing intro begin button text for ${lang}`);
    assert.ok(l.intro.skip, `Missing intro skip button text for ${lang}`);

    assert.ok(l.progress, `Missing progress object for ${lang}`);
    assert.ok(l.progress.title, `Missing progress title for ${lang}`);
    assert.ok(l.progress.complete, `Missing progress complete message for ${lang}`);

    assert.ok(l.detailSourcesTitle, `Missing detailSourcesTitle for ${lang}`);
    assert.equal(l.detailSourcesTitle.includes("Verified"), false, "Heading must be neutral ('Institutional Sources'), not 'Verified Institutional References'");
  });
});

test("Cultural Accuracy: Bread variations qualify regional and community diversity without unsupported monolithic claims", () => {
  const enVariations = content.bread.en.variations;
  const esVariations = content.bread.es.variations;
  assert.ok(enVariations.includes("Different regions and communities"), "Bread variations acknowledges diverse regional communities");
  assert.ok(esVariations.includes("diversas regiones y comunidades"), "Bread variations in Spanish acknowledges community diversity");
});

test("Left navigation: exactly three functional controls with proper bilingual labels", () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, "index.html"), "utf-8");
  assert.match(indexHtml, /id="navExplore"/, "Must have navExplore");
  assert.match(indexHtml, /id="navOfferings"/, "Must have navOfferings");
  assert.match(indexHtml, /id="navSources"/, "Must have navSources");
  assert.equal(indexHtml.includes('data-nav="layers"'), false, "Must not contain misleading layers nav button");
  assert.equal(indexHtml.includes('data-nav="build"'), false, "Must not contain misleading build nav button");

  ["en", "es"].forEach((lang) => {
    const l = labels[lang];
    assert.ok(l.explore, `Missing explore label for ${lang}`);
    assert.ok(l.offerings, `Missing offerings label for ${lang}`);
    assert.ok(l.sources, `Missing sources label for ${lang}`);
  });
});

test("Hotspots: exactly seven hotspot buttons mapped to the seven sacred offerings", () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, "index.html"), "utf-8");
  const hotspotMatches = [...indexHtml.matchAll(/<button[^>]*class="[^"]*hotspot[^"]*"[^>]*data-id="([^"]+)"/g)];
  assert.equal(hotspotMatches.length, 7, "Must have exactly 7 hotspot buttons");
  const mappedIds = hotspotMatches.map((m) => m[1]);
  const expected = ["flowers", "photo", "candles", "bread", "paper", "copal", "water"];
  assert.deepEqual(mappedIds.sort(), expected.sort(), "Hotspots must map precisely to the 7 offerings");
});



test("All seven offerings match bilingual Gemma knowledge; water retains distinct recap", async () => {
  const { APPROVED_OFFERINGS } = await import("../api/_curated_knowledge.js");
  for (const language of ["en", "es"]) {
    assert.notEqual(content.water[language].description, content.water[language].context);
    for (const id of Object.keys(APPROVED_OFFERINGS)) {
      for (const field of ["category", "title", "context", "history", "variations"]) {
        assert.equal(content[id][language][field], APPROVED_OFFERINGS[id][field][language], `${id}.${language}.${field}`);
      }
    }
    assert.match(content.water[language].history, /INPI/);
  }
});

test("Preview metadata and public assets describe the unchanged approved cover", () => {
  const html = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const description = html.match(/name="description" content="([^"]+)"/)[1];
  const alt = html.match(/property="og:image:alt" content="([^"]+)"/)[1];
  for (const property of ["og:type", "og:site_name", "og:title", "og:url", "og:description", "og:image", "og:image:type", "og:image:width", "og:image:height", "og:image:alt"]) {
    assert.match(html, new RegExp(`property="${property}" content="[^"]+"`));
  }
  for (const name of ["twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"]) {
    assert.match(html, new RegExp(`name="${name}" content="[^"]+"`));
  }
  assert.ok(description.includes("Explore seven Día de Muertos offerings"));
  assert.ok(description.includes("Explora siete elementos"));
  assert.ok(alt.includes("A small offering. Shared with care."));
  assert.ok(alt.includes("Una pequeña ofrenda. Compartida con cariño"));
  assert.match(html, /property="og:image" content="https:\/\/el-altar-que-habla.vercel.app\/cover-1000x420.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  const original = fs.readFileSync(path.join(rootDir, "assets/article/cover-1000x420.png"));
  const published = fs.readFileSync(path.join(rootDir, "public/cover-1000x420.png"));
  assert.deepEqual(published, original);
  assert.equal(published.readUInt32BE(16), 1000);
  assert.equal(published.readUInt32BE(20), 420);
  for (const icon of ["papel-picado", "copal"]) {
    assert.match(html, new RegExp(`src="/icons/${icon}.svg" width="18" height="18" alt=""`));
    assert.ok(fs.readFileSync(path.join(rootDir, `public/icons/${icon}.svg`), "utf8").includes('viewBox="0 0 18 18"'));
  }
});
