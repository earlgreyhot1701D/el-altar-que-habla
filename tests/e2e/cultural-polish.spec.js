import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

test("bilingual intro cites UNESCO and keeps source links inside its focus trap", async ({ browser }) => {
  for (const viewport of [{ width: 1400, height: 900 }, { width: 320, height: 640 }, { width: 700, height: 450 }]) {
    for (const language of ["en", "es"]) {
      const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
      try {
        await page.goto("/");
        await expect(page.locator("#introModal")).toBeVisible();
        await page.evaluate(async language => {
          const { state, render } = await import("/src/main.js");
          state.language = language;
          render();
        }, language);
        const link = page.locator("#introUnesco");
        await expect(link).toHaveText(language === "en" ? "Background: UNESCO" : "Contexto: UNESCO");
        await expect(link).toHaveAttribute("href", "https://ich.unesco.org/en/RL/dia-de-muertos-the-indigenous-festivity-dedicated-to-the-dead-00054");
        expect(await link.evaluate(el => !document.querySelector("#introText").contains(el))).toBeTruthy();
        const copy = await page.locator("#introText").textContent();
        expect(copy).toContain(language === "en" ? "With Indigenous roots and Catholic influences" : "Con raíces indígenas e influencias católicas");
        expect(copy).not.toMatch(/archiv|sacred|sagrad|documentadas|mexicoamericanas|Mexican American/i);
        if (language === "es") {
          expect(copy).toContain("Bienvenidos");
          expect(copy).toContain("explicaciones curadas");
        }
        await page.locator("#introDismissX").focus();
        await page.keyboard.press("Tab");
        await expect(link).toBeFocused();
        await expect(link).toBeInViewport();
        await page.keyboard.press("Shift+Tab");
        await expect(page.locator("#introDismissX")).toBeFocused();
        await page.keyboard.press("Shift+Tab");
        await expect(page.locator("#introSkipBtn")).toBeFocused();
        await expect(page.locator("#introSkipBtn")).toBeInViewport();
        await page.keyboard.press("Tab");
        await expect(page.locator("#introDismissX")).toBeFocused();
        await expect(page.locator("#introDismissX")).toBeInViewport();
        await page.keyboard.press("Escape");
        await expect(page.locator("#introModal")).toBeHidden();
        await expect(page.locator(".panel")).toBeHidden();
      } finally {
        await page.close();
      }
    }
  }
});

test("public preview and icon assets load; approved labels render in both languages", async ({ page }) => {
  for (const [name, width, height, language] of [
    ["desktop-en", 1400, 900, "en"],
    ["desktop-es", 1400, 900, "es"],
    ["mobile-es", 390, 844, "es"]
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    if (await page.locator("#introBeginBtn").isVisible()) await page.locator("#introBeginBtn").click();
    await page.locator(`#${language}`).click();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".offerings-nav")).toHaveAttribute("aria-label", language === "en" ? "Altar offerings selection" : "Selección de elementos de la ofrenda");
    await expect(page.locator("#visitProgressTitle")).toHaveText(language === "en" ? "Offerings Explored" : "Elementos explorados");
    await expect(page.locator("#offeringsListTitle")).toHaveText(language === "en" ? "Choose an offering" : "Elige un elemento");
    await page.locator("#navOfferings").click();
    await expect(page.locator("#chooserTitle")).toHaveText(language === "en" ? "The seven offerings" : "Los siete elementos");
    await expect(page.locator("#closeChooser")).toHaveAttribute("aria-label", language === "en" ? "Close offering chooser" : "Cerrar selector de elementos");
    await expect(page.locator("#chooserHelp")).toContainText(language === "en" ? "Choose one of the seven offerings." : "Elige uno de los siete elementos.");
    await page.keyboard.press("Escape");
    for (const id of ["paper", "copal"]) {
      const icon = page.locator(`.offering-select-btn[data-id="${id}"] .offering-icon img`);
      await expect(icon).toHaveAttribute("alt", "");
      await expect(icon.locator("..")).toHaveAttribute("aria-hidden", "true");
      expect(await icon.evaluate(im => im.complete && im.naturalWidth > 0)).toBeTruthy();
      expect((await icon.boundingBox()).width).toBe(18);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    if (process.env.POLISH_EVIDENCE_DIR) {
      fs.mkdirSync(process.env.POLISH_EVIDENCE_DIR, { recursive: true });
      await page.screenshot({ path: path.join(process.env.POLISH_EVIDENCE_DIR, `after-${name}.png`) });
    }
  }
  const imageURL = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(imageURL).toBe("https://el-altar-que-habla.vercel.app/cover-1000x420.png");
  const image = await page.request.get("/cover-1000x420.png");
  expect(image.ok()).toBeTruthy();
  expect(image.headers()["content-type"]).toContain("image/png");
});

test("narrow desktop keeps every offering reachable while language and progress remain visible", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/");
  await page.locator("#introBeginBtn").click();
  for (const language of ["en", "es"]) {
    await page.locator(`#${language}`).click();
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 0));
    const scene = await page.locator("#altarStage").boundingBox();
    const sidebar = await page.locator(".sidebar").boundingBox();
    expect(sidebar.x + sidebar.width).toBeLessThanOrEqual(scene.x + 1);
    const labels = await page.locator(".offering-btn-label").evaluateAll(elements => elements.map(el => ({ height: el.getBoundingClientRect().height, line: parseFloat(getComputedStyle(el).lineHeight), width: el.clientWidth, textWidth: el.scrollWidth })));
    for (const label of labels) {
      expect(label.height).toBeLessThanOrEqual(label.line + 1);
      expect(label.textWidth).toBeLessThanOrEqual(label.width + 1);
    }
    for (const id of ["flowers", "photo", "candles", "bread", "paper", "copal", "water"]) {
      const tile = page.locator(`.offering-select-btn[data-id="${id}"]`);
      await tile.scrollIntoViewIfNeeded();
      await tile.focus();
      await expect(tile).toBeInViewport();
      await expect(tile).toBeFocused();
      for (const control of [".lang", ".visit-progress"]) await expect(page.locator(control)).toBeInViewport({ ratio: 1 });
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
    }
    await page.locator(".offerings-list").evaluate(el => { el.scrollTop = 0; });
    if (process.env.POLISH_EVIDENCE_DIR) {
      await page.locator(".sidebar").screenshot({ path: path.join(process.env.POLISH_EVIDENCE_DIR, `after-1024-${language}.png`) });
    }
  }
  for (const [width, columns] of [[850, 4], [851, 1], [1200, 1], [1201, 2]]) {
    await page.setViewportSize({ width, height: 768 });
    const actual = await page.locator(".offerings-list").evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    expect(actual, `Offering columns at ${width}px`).toBe(columns);
  }
});
