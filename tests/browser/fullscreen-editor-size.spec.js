// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";

const height = (editor) =>
  editor.evaluate((el) => el.getBoundingClientRect().height);
for (const fallback of [false, true]) {
  for (const path of ["/lessons/addition/", "/playground/"]) {
    test(`${path} editor collapses inside ${fallback ? "modal" : "native"} fullscreen without changing the paused machine`, async ({
      page,
    }) => {
      test.setTimeout(90000);
      if (fallback)
        await page.addInitScript(() =>
          Object.defineProperty(document, "fullscreenEnabled", {
            configurable: true,
            value: false,
          }),
        );
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(path);
      await expect(page.locator("#run")).toBeEnabled();
      const editor = page.locator("#source-editor");
      const expand = page.locator("#expand-editor");
      const fullscreen = page.locator("#fullscreen-workspace");
      const source = await page.locator("#source").inputValue();
      await page.locator("#step").click();
      await expect(page.locator("#state-badge")).toHaveText("Paused", {
        timeout: 45000,
      });
      await page.locator("#step").click();
      await expect(page.locator("#t0-decimal")).toHaveText("7");
      const pc = await page.locator("#step-location").textContent();
      const compactHeight = await height(editor);

      await fullscreen.click();
      await expect(fullscreen).toHaveAttribute("aria-expanded", "true");
      for (const theme of ["light", "dark"]) {
        await page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme;
        }, theme);
        await expand.click();
        await expect(expand).toHaveText("Collapse editor");
        expect(await height(editor)).toBeGreaterThan(compactHeight);
        await expand.click();
        await expect(expand).toHaveAttribute("aria-expanded", "false");
        await expect(expand).toHaveText("Expand editor");
        await expect.poll(() => height(editor)).toBeCloseTo(compactHeight, 0);
        await expect(fullscreen).toHaveAttribute("aria-expanded", "true");
        await expect(page.locator("#source")).toHaveValue(source);
        await expect(page.locator("#step-location")).toHaveText(pc);
        await expect(page.locator("#state-badge")).toHaveText("Paused");
      }
      await fullscreen.click();
      await expect(fullscreen).toHaveAttribute("aria-expanded", "false");
      await expect.poll(() => height(editor)).toBeCloseTo(compactHeight, 0);

      // Entering/leaving fullscreen also preserves an explicitly expanded editor.
      await expand.click();
      await fullscreen.click();
      await expect(expand).toHaveAttribute("aria-expanded", "true");
      await fullscreen.click();
      await expect(expand).toHaveText("Collapse editor");
      await expand.click();
      await expect.poll(() => height(editor)).toBeCloseTo(compactHeight, 0);
      await page.locator("#continue").click();
      await expect(page.locator("#t2-decimal")).toHaveText("12", {
        timeout: 45000,
      });
      expect(errors).toEqual([]);
    });
  }
}
