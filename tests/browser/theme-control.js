// Copyright © 2026 Christopher Snow
import { expect } from "@playwright/test";
/** Exercise the actual settings UI; preserve System as well as explicit themes. */
export async function setTheme(page, theme) {
  // Native execution fixtures use the source site; the built-site suite below
  // exercises the versioned header controls and complete offline course.
  if (!(await page.locator('meta[name="gpu-release"]').count())) {
    await page.locator("#theme").selectOption(theme);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    return;
  }
  if (theme !== "system") {
    const action = page.locator("#header-theme-toggle");
    await expect(action).toBeEnabled();
    if (
      (await action.getAttribute("aria-label")) !== `Switch to ${theme} theme`
    ) {
      await action.click();
      await expect(action).toHaveAttribute(
        "aria-label",
        `Switch to ${theme} theme`,
      );
    }
    await action.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.locator("#theme")).toHaveValue(theme);
    return;
  }
  await page.locator("#app-status-open").click();
  const details = page.locator(".header-theme-disclosure");
  if (!(await details.evaluate((node) => node.open)))
    await details.locator(":scope > summary").click();
  await page.locator("#theme").selectOption(theme);
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  await page.keyboard.press("Escape");
  await expect(page.locator("#app-status-dialog")).toBeHidden();
}
