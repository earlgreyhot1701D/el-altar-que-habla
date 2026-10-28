import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { content, labels } from "../src/content.js";
import { sources, itemSourceMap } from "../src/sources.js";
import { illustrations } from "../src/illustrations.js";

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

test("Each offering has an SVG illustration with aria-hidden and viewBox", () => {
  const expectedOfferings = ["flowers", "photo", "candles", "bread", "paper", "copal", "water"];
  expectedOfferings.forEach((offeringId) => {
    const svg = illustrations[offeringId];
    assert.ok(svg, `Missing illustration for ${offeringId}`);
    assert.match(svg, /<svg class="offering-art"/);
    assert.match(svg, /viewBox="0 0 320 300"/);
    assert.match(svg, /aria-hidden="true"/);
  });
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

test("Built dist/ directory contains valid HTML, CSS, JS and altar scene image", () => {
  const distDir = path.join(rootDir, "dist");
  assert.ok(fs.existsSync(distDir), "dist/ directory must exist");
  assert.ok(fs.existsSync(path.join(distDir, "index.html")), "dist/index.html must exist");
  assert.ok(fs.existsSync(path.join(distDir, "altar-scene.jpg")), "dist/altar-scene.jpg must exist");

  const indexContent = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");
  assert.match(indexContent, /<html lang="en">/);
  assert.match(indexContent, /data-id="flowers"/);
  assert.match(indexContent, /data-id="water"/);
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
  });
});

