import { test, expect } from "@playwright/test";

// Object bounds independently annotated against the reviewed clean master image.
// These regions describe the offerings, not the button styles under test.
const subjects = {
  flowers: [.19, .03, .74, .21],
  photo: [.38, .17, .57, .36],
  candles: [.52, .43, .70, .57],
  bread: [.22, .45, .45, .565],
  paper: [.70, .56, .91, .66],
  copal: [.345, .54, .585, .80],
  water: [.642, .68, .697, .77]
};
const categories = {
  en: ["MARIGOLDS", "PORTRAIT", "CANDLES", "BREAD OF THE DEAD", "CUT PAPER", "COPAL", "WATER"],
  es: ["CEMPASÚCHIL", "RETRATO", "VELADORAS", "PAN DE MUERTO", "PAPEL PICADO", "COPAL", "AGUA"]
};
const sizes = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1400, height: 900 }
];

async function openAltar(page) {
  await page.goto("/");
  await page.locator("#introBeginBtn").click();
  await expect(page.locator(".hotspot.selected")).toBeFocused();
  await page.locator(".scene").evaluate(img => img.decode());
}

for (const size of sizes) {
  test.describe(size.name, () => {
    test.use({ viewport: { width: size.width, height: size.height }, hasTouch: size.name !== "desktop" });

    test("real targets align, activate bilingual panels, and fit images", async ({ page }) => {
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
      page.on("response", response => {
        if (response.url().startsWith("http://127.0.0.1") && response.status() >= 400) errors.push(response.url());
      });
      // External fonts are not needed to validate the application, and can vary offline.
      await page.route("https://fonts.googleapis.com/**", route => route.fulfill({ contentType: "text/css", body: "" }));
      await openAltar(page);
      await expect(page.locator(".hotspot")).toHaveCount(7);
      const positions = await page.locator(".hotspot").evaluateAll(buttons => {
        const image = document.querySelector(".scene").getBoundingClientRect();
        return buttons.map(button => {
          const r = button.getBoundingClientRect();
          return { id: button.dataset.id, x: (r.x + r.width / 2 - image.x) / image.width,
            y: (r.y + r.height / 2 - image.y) / image.height, width: r.width, height: r.height,
            left: r.left, right: r.right, top: r.top, bottom: r.bottom };
        });
      });
      for (const position of positions) {
        const [left, top, right, bottom] = subjects[position.id];
        expect(position.x).toBeGreaterThan(left);
        expect(position.x).toBeLessThan(right);
        expect(position.y).toBeGreaterThan(top);
        expect(position.y).toBeLessThan(bottom);
        expect(position.width).toBeGreaterThanOrEqual(44);
        expect(position.height).toBeGreaterThanOrEqual(44);
        for (const other of positions.filter(p => p.id !== position.id)) {
          expect(position.right <= other.left || other.right <= position.left ||
            position.bottom <= other.top || other.bottom <= position.top).toBeTruthy();
        }
      }
      for (const language of ["en", "es"]) {
        await page.locator(`#${language}`).click();
        for (const [index, id] of Object.keys(subjects).entries()) {
          const hotspot = page.locator(`.hotspot[data-id="${id}"]`);
          if (size.name === "desktop") await hotspot.click();
          else await hotspot.tap();
          await expect(page.locator("#category")).toHaveText(categories[language][index]);
          await expect(hotspot).toHaveAttribute("aria-pressed", "true");
          await expect(page.locator(".offering-select-btn.active")).toHaveAttribute("data-id", id);
          if (size.width <= 850) await expect(page.locator("#title")).toBeFocused();
          const image = page.locator(".offering-art");
          await expect(image).toHaveAttribute("src", `/crop-${id}.webp`);
          await image.evaluate(img => img.decode());
          const fit = await image.evaluate(img => {
            const hero = document.querySelector(".detail-hero").getBoundingClientRect();
            const r = img.getBoundingClientRect();
            return { loaded: img.naturalWidth > 0, fit: getComputedStyle(img).objectFit,
              contained: r.top >= hero.top && r.bottom <= hero.bottom && r.left >= hero.left && r.right <= hero.right };
          });
          expect(fit).toEqual({ loaded: true, fit: "contain", contained: true });
        }
      }
      await expect(page.locator("#facts, #note, #itemSources")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      expect(errors).toEqual([]);
    });

    test("section navigation transfers keyboard focus and active state", async ({ page }) => {
      await openAltar(page);
      await page.locator('.hotspot[data-id="bread"]').press("Enter");
      await page.locator("#navSources").press("Enter");
      await expect(page.locator("#sourcesHeading")).toBeFocused();
      await expect(page.locator("#navSources")).toHaveClass("active");
      await page.locator("#navExplore").press("Enter");
      await expect(page.locator('.hotspot[data-id="bread"]')).toBeFocused();
      await page.locator("#navOfferings").press("Enter");
      await expect(page.locator('.offering-select-btn[data-id="bread"]')).toBeFocused();
      await page.locator('.offering-select-btn[data-id="water"]').press("Enter");
      await expect(page.locator("#navExplore")).toHaveClass("active");
      await page.locator("#question").focus();
      await expect(page.locator(".ask-row")).toHaveCSS("outline-style", "solid");
    });

    test("reviewed artwork contains no baked-in controls", async ({ page }) => {
      await openAltar(page);
      await expect(page.locator(".scene")).toHaveAttribute("src", "/altar-clean.webp");
      // Pixel comparison against the manually inspected clean image. A DOM count alone
      // cannot detect controls painted into a bitmap. Review baseline changes by eye.
      await expect(page.locator(".scene")).toHaveScreenshot(`clean-art-${size.name}.png`, {
        style: ".hotspot, .stage-heading { visibility: hidden !important; }"
      });
    });
  });
}

test("introduction traps focus, inerts the background, and restores useful focus", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#introBeginBtn")).toBeFocused();
  await expect(page.locator(".app")).toHaveJSProperty("inert", true);
  await page.locator("#introSkipBtn").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator("#introDismissX")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator("#introSkipBtn")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".hotspot.selected")).toBeFocused();
  await expect(page.locator(".app")).toHaveJSProperty("inert", false);
});

test("Spanish bread request, honest AI attribution, fallback and real stale-response guards", async ({ page }) => {
  await openAltar(page);
  const requests = [];
  await page.route("**/api/explain", route => { requests.push(route); });
  await page.locator('.hotspot[data-id="bread"]').click();
  await page.locator("#es").click();
  await page.locator("#question").fill("¿Cuál es el significado del pan de muerto?");
  await page.locator("#askButton").click();
  await expect.poll(() => requests.length).toBe(1);
  expect(requests[0].request().postDataJSON()).toEqual({ offeringId: "bread", language: "es", question: "¿Cuál es el significado del pan de muerto?" });
  await requests[0].fulfill({ json: { success: true, answer: "El pan de muerto es un alimento compartido.", sourceMention: "Unverified institution" } });
  await expect(page.locator("#answer")).toContainText("El pan de muerto");
  await expect(page.locator("#answer")).toContainText("no verifican");
  await expect(page.locator("#answer")).not.toContainText("Unverified institution");

  await page.locator("#question").fill("Otra pregunta");
  await page.locator("#askButton").click();
  await expect.poll(() => requests.length).toBe(2);
  await page.locator('.hotspot[data-id="water"]').click();
  await requests[1].fulfill({ json: { success: true, answer: "STALE BREAD" } });
  await expect(page.locator("#answer")).toBeEmpty();
  await page.locator("#question").fill("¿Qué significa el agua?");
  await page.locator("#askButton").click();
  await expect.poll(() => requests.length).toBe(3);
  await requests[2].fulfill({ status: 503, json: { fallback: true } });
  await expect(page.locator("#answer")).toContainText("Guía curada (sin IA)");
  await expect(page.locator("#answer")).toContainText("agua");

  // A language change and a newer question each invalidate a real pending fetch.
  await page.locator("#question").fill("Pregunta pendiente");
  await page.locator("#askButton").click();
  await expect.poll(() => requests.length).toBe(4);
  await page.locator("#en").click();
  await requests[3].fulfill({ json: { success: true, answer: "STALE SPANISH" } });
  await expect(page.locator("#answer")).toBeEmpty();
  for (const question of ["First question", "Latest question"]) {
    await page.locator("#question").fill(question);
    await page.locator("#askButton").click();
  }
  await expect.poll(() => requests.length).toBe(6);
  await requests[5].fulfill({ json: { success: true, answer: "LATEST ANSWER" } });
  await expect(page.locator("#answer")).toContainText("LATEST ANSWER");
  await requests[4].fulfill({ json: { success: true, answer: "STALE FIRST" } });
  await expect(page.locator("#answer")).toContainText("LATEST ANSWER");
});
