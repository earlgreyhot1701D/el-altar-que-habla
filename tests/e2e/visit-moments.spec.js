import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const profiles = [
  ["reference",1428,725,2], ["desktop",1400,900,1], ["short laptop",1280,720,1],
  ["narrow desktop",1024,768,1], ["tablet",768,1024,1], ["mobile",390,844,1],
  ["small mobile",320,640,1], ["zoom equivalent",700,450,2]
];
const positions = { flowers:[.35,.10], photo:[.47,.28], candles:[.66,.50], bread:[.33,.52], paper:[.80,.61], copal:[.46,.68], water:[.67,.73] };

async function open(page) {
  await page.goto("/");
  if (await page.locator("#introBeginBtn").isVisible()) await page.locator("#introBeginBtn").click();
  await page.evaluate(() => document.fonts.ready);
}

async function viewScene(page) {
  await page.locator(".scene").scrollIntoViewIfNeeded();
  await page.mouse.move(0,0);
}

async function assertClear(page) {
  // No mask or injected styling: inspect the actual visible SVG and its entire route.
  const data = await page.evaluate(() => {
    const frame = document.querySelector(".scene-frame").getBoundingClientRect();
    const shape = document.querySelector(".monarch-shape");
    const style = getComputedStyle(shape);
    const actual = shape.getBoundingClientRect().toJSON();
    const left = frame.left + parseFloat(style.left);
    const top = frame.top + parseFloat(style.top);
    const distance = parseFloat(document.querySelector("#visitMonarch").style.getPropertyValue("--monarch-distance"));
    return { actual, visibility:style.visibility, pointer:getComputedStyle(document.querySelector("#visitMonarch")).pointerEvents,
      route:{left, right:left+32, top, bottom:top+distance+24}, frame:frame.toJSON(),
      obstacles:[...document.querySelectorAll(".hotspot, .panel, #question")].filter(el => el.getClientRects().length).map(el => ({id:el.dataset.id || el.id || "panel",...el.getBoundingClientRect().toJSON()})) };
  });
  expect(data.visibility).toBe("visible");
  expect(data.pointer).toBe("none");
  for (const box of [data.route, data.actual]) {
    expect(box.left).toBeGreaterThanOrEqual(data.frame.left);
    expect(box.right).toBeLessThanOrEqual(data.frame.right);
    expect(box.top).toBeGreaterThanOrEqual(data.frame.top);
    expect(box.bottom).toBeLessThanOrEqual(data.frame.bottom);
    for (const other of data.obstacles) {
      expect(box.right <= other.left-8 || box.left >= other.right+8 || box.bottom <= other.top-8 || box.top >= other.bottom+8, `Butterfly clears ${other.id}`).toBeTruthy();
    }
  }
  for (const [id,[x,y]] of Object.entries(positions)) {
    const box = data.obstacles.find(box => box.id === id);
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(Math.abs((box.left+box.width/2-data.frame.left)/data.frame.width-x)).toBeLessThan(.001);
    expect(Math.abs((box.top+box.height/2-data.frame.top)/data.frame.height-y)).toBeLessThan(.001);
  }
}

for (const [name,width,height,scale] of profiles) {
  test.describe(name, () => {
    test.use({ viewport:{width,height}, deviceScaleFactor:scale, reducedMotion:"reduce" });
    test("unmasked still monarch and full flight corridor clear targets and vanish for stories and typing", async ({ page }) => {
      await page.clock.install();
      await open(page);
      await viewScene(page);
      const monarch = page.locator("#visitMonarch");
      await expect(monarch).toHaveAttribute("data-mode","still");
      await expect(monarch).toHaveAttribute("aria-hidden","true");
      await assertClear(page);
      expect(await page.locator(".monarch-shape").evaluate(el => getComputedStyle(el).animationName)).toBe("none");
      await page.emulateMedia({reducedMotion:"no-preference"});
      await page.clock.runFor(31000);
      await expect(monarch).toHaveAttribute("data-mode","flight");
      for (let i=0; i<8; i++) {
        await assertClear(page);
        await page.clock.runFor(1000);
      }
      await page.clock.runFor(3000);
      await expect(monarch).toBeHidden();
      await page.clock.runFor(91000);
      await expect(monarch).toHaveAttribute("data-mode","flight");
      await page.locator('.hotspot[data-id="water"]').click();
      await expect(monarch).toBeHidden();
      await expect(page.locator(".panel")).toBeVisible();
      await page.locator("#question").fill("A question");
      await page.clock.runFor(95000);
      await expect(monarch).toBeHidden();
      await expect(monarch).toHaveAttribute("data-appearances","2");
    });
  });
}

test("candle is keyboard operable, visit-only, bilingual and independent of exploration reset", async ({ page }) => {
  await open(page);
  const stored = await page.evaluate(() => ({local:{...localStorage},session:{...sessionStorage},url:location.href,cookie:document.cookie}));
  const requests=[];
  page.on("request", request => requests.push(request.url()));
  const candle=page.locator("#lightCandle");
  await candle.focus();
  await page.keyboard.press("Enter");
  await expect(candle).toBeFocused();
  await expect(candle).toHaveAttribute("aria-disabled","true");
  await expect(page.locator("#candleStatus")).toHaveText("Your candle is lit for this visit.");
  await expect(page.locator("#candleQuiet")).toHaveText("A quiet moment to remember.");
  await page.keyboard.press("Space");
  await expect(page.locator("#candleStatus")).toHaveText("Your candle is lit for this visit.");
  await page.locator("#es").click();
  await expect(candle).toHaveText("Encender una veladora");
  await expect(page.locator("#candleStatus")).toHaveText("Tu veladora está encendida durante esta visita.");
  await expect(page.locator("#candleQuiet")).toHaveText("Un momento de calma para recordar.");
  await page.locator("#resetProgress").click();
  await expect(candle).toHaveAttribute("aria-disabled","true");
  await expect(page.locator("#visitProgressCount")).toHaveText("0 / 7");
  expect(await page.evaluate(() => ({local:{...localStorage},session:{...sessionStorage},url:location.href,cookie:document.cookie}))).toEqual(stored);
  expect(requests).toEqual([]);
  await page.reload();
  await expect(candle).toHaveAttribute("aria-disabled","false");
  await candle.focus();
  await page.keyboard.press("Space");
  await expect(page.locator("#candleStatus")).toHaveText("Your candle is lit for this visit.");
});

test("motion control, live preference changes and maximum appearances do not override reduced motion", async ({ page }) => {
  await page.clock.install();
  await page.emulateMedia({reducedMotion:"no-preference"});
  await open(page);
  const monarch=page.locator("#visitMonarch");
  const control=page.locator("#visitMotion");
  await control.click();
  await viewScene(page);
  await expect(control).toHaveText("Resume motion");
  await expect(monarch).toHaveAttribute("data-mode","still");
  await page.clock.runFor(180000);
  await expect(monarch).toHaveAttribute("data-appearances","0");
  await control.click();
  await viewScene(page);
  await page.clock.runFor(31000);
  await expect(monarch).toHaveAttribute("data-mode","flight");
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(control).toHaveText("Motion is reduced.");
  await expect(monarch).toHaveAttribute("data-mode","still");
  expect(await page.locator(".monarch-shape").evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  await page.locator("#lightCandle").click();
  expect(await page.locator(".visit-flame").evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  await page.emulateMedia({reducedMotion:"no-preference"});
  await viewScene(page);
  for (let i=0;i<2;i++) {
    await page.clock.runFor(91000);
    await expect(monarch).toHaveAttribute("data-mode","flight");
    await page.clock.runFor(12000);
  }
  await page.clock.runFor(180000);
  await expect(monarch).toHaveAttribute("data-appearances","3");
  await expect(monarch).toBeHidden();
});

test("source notes have exact attributed EN/ES copy and visible citations; capture review evidence", async ({ page }) => {
  for (const [name,width,height,lang] of [["desktop-en",1400,900,"en"],["desktop-es",1400,900,"es"],["mobile-es",390,844,"es"],["sidebar-1024-es",1024,768,"es"]]) {
    await page.setViewportSize({width,height});
    await open(page);
    await page.locator(`#${lang}`).click();
    const {labels}=await import("../../src/content.js");
    const l=labels[lang].visit;
    for (const [id,text] of [["skullHeading",l.skullHeading],["skullInpi",l.skullInpi],["skullChocolate",l.skullChocolate],["skullVariation",l.variation],["monarchHeading",l.monarchHeading],["monarchExplanation",l.monarchText]]) await expect(page.locator(`#${id}`)).toHaveText(text);
    for (const [id,text,url] of [["skullInpiLink",l.inpiLink,"https://www.gob.mx/inpi/articulos/conoces-el-significado-de-los-elementos-de-una-ofrenda-de-dia-de-muertos?_amp=true"],["skullChocolateLink",l.chocolateLink,"https://alasyraices.gob.mx/ofrenda-interactiva/"],["monarchSourceLink",l.monarchLink,"https://www.unesco.org/mab/50anniversary/es/mariposa-monarca"]]) {
      await expect(page.locator(`#${id}`)).toHaveText(text);
      await expect(page.locator(`#${id}`)).toHaveAttribute("href",url);
      await page.locator(`#${id}`).focus();
      await expect(page.locator(`#${id}`)).toBeFocused();
    }
    await expect(page.locator(".hotspot")).toHaveCount(7);
    await expect(page.locator(".offering-select-btn")).toHaveCount(7);
    await page.mouse.move(0,0);
    await page.evaluate(() => window.scrollTo(0,0));
    if (process.env.VISIT_EVIDENCE_DIR) {
      fs.mkdirSync(process.env.VISIT_EVIDENCE_DIR,{recursive:true});
      const target=name.startsWith("sidebar")?page.locator(".sidebar"):page;
      await target.screenshot({path:path.join(process.env.VISIT_EVIDENCE_DIR,`after-${name}.png`)});
      if(name==="desktop-es") {
        await page.locator("#lightCandle").click();
        await page.locator("#visitMoment").screenshot({path:path.join(process.env.VISIT_EVIDENCE_DIR,"veladora-lit-es.png")});
        await page.locator('.visit-source-note').first().screenshot({path:path.join(process.env.VISIT_EVIDENCE_DIR,"calaveras-note-es.png")});
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  }
});
