// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";

test("the modal workspace fallback returns to the lesson and complete program", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, "fullscreenEnabled", { get: () => false });
  });
  await page.goto("/lessons/addition/");
  await expect(page.locator("#run")).toBeEnabled();
  const source = await page.locator("#source").inputValue();
  const toggle = page.getByRole("button", {
    name: "Expand workspace",
    exact: true,
  });
  await toggle.click();
  await expect(page.locator(".workbench-dialog")).toHaveJSProperty(
    "open",
    true,
  );
  expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
  await expect(page.locator("#fullscreen-workspace")).toHaveText(
    "Return to lesson",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(".workbench-dialog")).toHaveJSProperty(
    "open",
    false,
  );
  await expect(toggle).toBeFocused();
  await expect(page.locator("#source")).toHaveValue(source);
  await toggle.click();
  await page.locator(".lab-help > summary").click();
  await page.locator(".lab-help a").click();
  await expect(page.locator(".workbench-dialog")).toHaveJSProperty(
    "open",
    false,
  );
  await expect(page.locator("#complete-program > summary")).toBeFocused();
  await expect(page.locator("#complete-source")).toBeInViewport();
  await expect(page.locator("#source")).toHaveValue(source);
});
