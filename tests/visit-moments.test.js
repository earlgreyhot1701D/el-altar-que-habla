import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createVisitState, lightVisitCandle, advanceMonarch, monarchCorridor, MONARCH_TIMING } from "../src/visit-moments.js";
import { labels } from "../src/content.js";
import { sources } from "../src/sources.js";

test("Visit candle lights once and a fresh visit starts unlit", () => {
  const state = createVisitState();
  assert.equal(state.lit, false);
  assert.equal(lightVisitCandle(state), true);
  assert.equal(lightVisitCandle(state), false);
  assert.equal(state.lit, true);
  assert.equal(createVisitState().lit, false);
});

test("Monarch waits for eligible viewing time, rests within its 11-second appearance, and observes cooldown", () => {
  const state = createVisitState();
  advanceMonarch(state, 29000, true);
  advanceMonarch(state, 100000, false);
  assert.equal(state.waiting, 29000);
  advanceMonarch(state, 1000, true);
  assert.equal(state.flying, true);
  assert.equal(state.appearances, 1);
  advanceMonarch(state, MONARCH_TIMING.duration, true);
  assert.equal(state.flying, false);
  advanceMonarch(state, 89000, true);
  assert.equal(state.flying, false);
  advanceMonarch(state, 1000, true);
  assert.equal(state.appearances, 2);
});

test("Interrupted appearances count toward a strict three-appearance cap", () => {
  const state = createVisitState();
  for (let i = 0; i < 3; i++) {
    advanceMonarch(state, i === 0 ? 30000 : 90000, true);
    assert.equal(state.flying, true);
    advanceMonarch(state, 0, false);
    assert.equal(state.flying, false);
    assert.equal(state.waiting, 0);
  }
  advanceMonarch(state, 1000000, true);
  assert.equal(state.appearances, 3);
  assert.equal(state.flying, false);
});

test("Monarch swept corridor rejects intermediate collisions and requires eight-pixel clearance", () => {
  const frame = { left: 0, top: 0, width: 320, height: 382, bottom: 382 };
  assert.ok(monarchCorridor(frame, []));
  assert.equal(monarchCorridor(frame, [{left:20,right:30,top:130,bottom:140}]), null);
  assert.equal(monarchCorridor(frame, [{left:47,right:70,top:130,bottom:140}]), null);
  assert.ok(monarchCorridor(frame, [{left:48,right:70,top:130,bottom:140}]));
  assert.equal(monarchCorridor({...frame,width:40}, []), null);
});

test("Visit feature copy is bilingual and cites the approved institutions", () => {
  assert.deepEqual(Object.keys(labels.en.visit).sort(), Object.keys(labels.es.visit).sort());
  for (const lang of ["en","es"]) for (const value of Object.values(labels[lang].visit)) assert.ok(value.length);
  assert.match(labels.en.visit.skullInpi, /^INPI describes/);
  assert.match(labels.es.visit.skullInpi, /^El INPI describe/);
  assert.match(labels.en.visit.monarchText, /Purépecha/);
  assert.equal(sources.alas.url, "https://alasyraices.gob.mx/ofrenda-interactiva/");
  assert.equal(sources.monarch.url, "https://www.unesco.org/mab/50anniversary/es/mariposa-monarca");
});

test("Visit interactions contain no persistence, network, URL mutation or HTML injection", () => {
  const module = fs.readFileSync(new URL("../src/visit-moments.js", import.meta.url), "utf8");
  assert.doesNotMatch(module, /localStorage|sessionStorage|document\.cookie|indexedDB|fetch\s*\(|XMLHttpRequest|sendBeacon|innerHTML|history\.|location\./);
});
