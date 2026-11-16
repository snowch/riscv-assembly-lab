// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";

for (const lesson of ["addition", "hello-world"]) {
  test(`calculator shortcuts stay inside the dialog on ${lesson}`, async ({
    page,
  }) => {
    await page.goto(`/lessons/${lesson}/`);
    await expect(page.locator("#run")).toBeEnabled();
    if (lesson === "addition") {
      await page.locator("#step").click();
      await expect(page.locator("#state-badge")).toHaveText("Paused", {
        timeout: 45000,
      });
    }
    const badge = await page.locator("#state-badge").textContent();
    const source = await page.locator("#source").inputValue();
    const pc =
      lesson === "addition"
        ? await page.locator("#step-location").textContent()
        : null;
    await page.locator("#open-calculator").click();
    expect(
      (await page.locator("#calc-a").boundingBox()).height,
    ).toBeGreaterThanOrEqual(44);
    await page.locator("#calc-a").fill("15");
    for (const shortcut of ["Control+Enter", "Meta+Enter"]) {
      await page.locator("#calc-a").focus();
      await page.keyboard.press(shortcut);
      await expect(page.locator("#calc-status")).toHaveText(
        "Calculation complete.",
      );
      await expect(page.locator("#calc-result-readings")).toContainText("16");
      await expect(page.locator("#state-badge")).toHaveText(badge);
      await expect(page.locator("#source")).toHaveValue(source);
      if (pc !== null)
        await expect(page.locator("#step-location")).toHaveText(pc);
    }
    await page.keyboard.press("Escape");
    await expect(page.locator("#calculator-dialog")).not.toBeVisible();
    await expect(page.locator("#open-calculator")).toBeFocused();
    if (lesson === "addition") {
      await page.locator("#continue").click();
      await expect(page.locator("#t2-decimal")).toHaveText("12", {
        timeout: 45000,
      });
    }
  });
}
