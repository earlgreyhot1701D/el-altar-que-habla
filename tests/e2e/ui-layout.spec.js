import { test, expect } from "@playwright/test";

const ids = ["flowers", "photo", "candles", "bread", "paper", "copal", "water"];
const viewports = [
  { name: "reference screenshot at 2x DPI", width: 1428, height: 725, scale: 2 },
  { name: "desktop", width: 1400, height: 900 },
  { name: "short laptop", width: 1280, height: 720 },
  { name: "narrow desktop", width: 1024, height: 768 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "small mobile", width: 320, height: 640 },
  // Half the CSS viewport at double pixel density exercises the reflow expected
  // at 200% desktop zoom; this is not a physical-browser zoom audit.
  { name: "200 percent zoom equivalent", width: 700, height: 450, scale: 2 }
];

async function assertPanelFlow(page) {
  const measurements = await page.locator(".panel").evaluate(panel => {
    const selectors = [".panel-top", ".detail-hero", "#title", "#subtitle", "#description", ".tabs", "#tabcopy", ".ask", "#offeringDetailSources"];
    const sections = selectors.map(selector => {
      const element = panel.querySelector(selector);
      const r = element.getBoundingClientRect();
      return { selector, top: r.top, bottom: r.bottom, height: r.height,
        contentHeight: element.scrollHeight, clientHeight: element.clientHeight };
    });
    const textBoxes = [...panel.querySelectorAll(".tabs button, #tabcopy, .answer p, .answer-kind, .footnote, summary")]
      .map(element => ({ text: element.textContent.slice(0, 40), width: element.clientWidth, contentWidth: element.scrollWidth }));
    return { sections, textBoxes, panelWidth: panel.clientWidth, panelContentWidth: panel.scrollWidth };
  });
  for (let i = 1; i < measurements.sections.length; i++) {
    const previous = measurements.sections[i - 1];
    const current = measurements.sections[i];
    expect(current.top, `${previous.selector} overlaps ${current.selector}`).toBeGreaterThanOrEqual(previous.bottom - 1);
  }
  const context = measurements.sections.find(section => section.selector === "#tabcopy");
  expect(context.contentHeight, "Tab text must keep its full height instead of bleeding into Ask").toBeLessThanOrEqual(context.clientHeight + 1);
  for (const box of measurements.textBoxes) {
    expect(box.contentWidth, `Text overflows horizontally: ${box.text}`).toBeLessThanOrEqual(box.width + 1);
  }
  expect(measurements.panelContentWidth).toBeLessThanOrEqual(measurements.panelWidth + 1);
}

for (const viewport of viewports) {
  test.describe(viewport.name, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: viewport.scale || 1 });

    test("all bilingual stories, tabs and fallback remain readable without overlap", async ({ page }) => {
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("/");
      await page.locator("#introBeginBtn").click();
      await page.evaluate(() => document.fonts.ready);
      await page.route("**/api/explain", route => route.fulfill({ status: 503, json: { fallback: true } }));

      for (const language of ["en", "es"]) {
        await page.locator(`#${language}`).click();
        await expect(page.locator("#offeringsListTitle")).toHaveText(language === "en" ? "Choose an offering" : "Elige un elemento");
        const flowerLabel = page.locator('.offering-select-btn[data-id="flowers"] .offering-btn-label');
        const flowerSize = await flowerLabel.evaluate(el => ({ height: el.getBoundingClientRect().height, line: parseFloat(getComputedStyle(el).lineHeight), width: el.clientWidth, content: el.scrollWidth }));
        expect(flowerSize.height).toBeLessThanOrEqual(flowerSize.line + 1);
        expect(flowerSize.content).toBeLessThanOrEqual(flowerSize.width + 1);
        const navigation = await page.locator(".offering-select-btn").evaluateAll(buttons => buttons.map(button => ({
          width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height,
          clientWidth: button.clientWidth, scrollWidth: button.scrollWidth
        })));
        expect(Math.max(...navigation.map(r => r.width)) - Math.min(...navigation.map(r => r.width))).toBeLessThan(1);
        expect(Math.max(...navigation.map(r => r.height)) - Math.min(...navigation.map(r => r.height))).toBeLessThan(1);
        for (const box of navigation) expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth + 1);

        const heading = await page.locator("#stageHeading").boundingBox();
        const image = await page.locator(".scene").boundingBox();
        expect(heading.y + heading.height).toBeLessThanOrEqual(image.y);
        expect(Math.abs(heading.x + heading.width / 2 - image.x - image.width / 2)).toBeLessThan(2);

        for (const id of ids) {
          await page.locator(`.hotspot[data-id="${id}"]`).click();
          for (const tab of ["context", "history", "variations"]) {
            await page.locator(`[data-tab="${tab}"]`).click();
            await assertPanelFlow(page);
          }
          await page.locator("#question").fill(language === "en" ? "What does this offering mean?" : "¿Qué significa esta ofrenda?");
          await page.locator("#askButton").click();
          await expect(page.locator("#answer")).toHaveAttribute("data-mode", "curated");
          await expect(page.locator(".answer-kind")).toContainText(language === "en" ? "Curated guide" : "Guía curada");
          await expect(page.locator("#answer p").first()).not.toBeEmpty();
          await page.locator("#offeringSourcesTitle").click();
          await assertPanelFlow(page);
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      expect(errors).toEqual([]);
    });

    test("a long AI answer wraps and leaves references reachable", async ({ page }) => {
      await page.goto("/");
      await page.locator("#introBeginBtn").click();
      // At the server's 500-character output bound, including an unbroken token.
      await page.route("**/api/explain", route => route.fulfill({ json: { success: true, answer: "Water " + "x".repeat(494) } }));
      await page.locator('.hotspot[data-id="water"]').click();
      await page.locator("#question").fill("Explain water");
      await page.locator("#askButton").click();
      await expect(page.locator("#answer")).toHaveAttribute("data-mode", "ai");
      await expect(page.locator(".answer-note")).toContainText("background reading");
      await assertPanelFlow(page);
      await page.locator("#offeringSourcesTitle").click();
      await expect(page.locator("#offeringDetailSources")).toHaveAttribute("open", "");
      await page.locator("#closePanel").click();
      await expect(page.locator(".panel")).toBeHidden();
    });
  });
}
