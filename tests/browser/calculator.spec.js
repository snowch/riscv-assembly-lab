// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";

test("calculator handles exact prefixes, width boundaries, aligned carries and recovery", async ({
  page,
}) => {
  await page.goto("/lessons/addition/");
  await page.locator("#open-calculator").click();
  await expect(page.locator("#calculator-dialog")).toBeVisible();
  await expect(page.locator("#calc-width")).toHaveValue("64");
  await page.locator("#calc-reading").selectOption("signed");
  await page.locator("#calc-a").fill("0x7fff_ffff_ffff_ffff");
  await page.locator("#calc-b").fill("1");
  await page.locator("#calculator-form button[type=submit]").click();
  await expect(page.locator("#calc-result-readings")).toContainText(
    "-9,223,372,036,854,775,808",
  );
  await expect(page.locator("#calc-full-result")).toContainText(
    "9,223,372,036,854,775,808",
  );
  await page.locator("#calc-bits > summary").click();
  await page.locator("#calc-carries").check();
  await expect(page.locator("#calc-carry-help")).toContainText(
    "Carry into bit 63: 1. Carry out: 0. Signed overflow: Yes.",
  );
  await page.locator("#calc-low").click();
  expect(
    await page.locator("#calc-bit-scroll").evaluate((el) => el.scrollLeft),
  ).toBeGreaterThan(0);
  await page.locator("#calc-a").fill("0b11111111111111111111111111111111");
  await expect(page.locator("#calc-result")).not.toBeVisible();
  await expect(page.locator("#calc-a-readings")).toContainText("4,294,967,295");
  await page.locator("#calc-width").selectOption("32");
  await expect(page.locator("#calc-a-readings")).toContainText("-1");
  await page.locator("#calc-width").selectOption("64");
  await expect(page.locator("#calc-a-readings")).toContainText("4,294,967,295");
  await page.locator("#calc-width").selectOption("32");
  await page.locator("#calc-a").fill("0x100000000");
  await expect(page.locator("#calc-a-error")).toContainText("Select 64 bits");
  await expect(page.locator("#calc-width")).toHaveValue("32");
  await page.locator("#calc-width").selectOption("64");
  await expect(page.locator("#calc-a-readings")).toContainText("4,294,967,296");
  await page.locator("#calc-b").fill("0b102");
  await page.locator("#calculator-form button[type=submit]").click();
  await expect(page.locator("#calc-b")).toBeFocused();
  await expect(page.locator("#calc-result")).not.toBeVisible();
  await page.locator("#calc-b").fill("1");
  await page.locator("#calculator-form button[type=submit]").click();
  await expect(page.locator("#calc-result-readings")).toContainText(
    "4,294,967,297",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator("#open-calculator")).toBeFocused();
  await page.locator(".brand").click();
  await page.locator("#open-calculator").click();
  await expect(page.locator("#calc-a")).toHaveValue("0x100000000");
  await expect(page.locator("#calc-b")).toHaveValue("1");
  await page.locator("#close-calculator").click();
  await page.locator("#theme").selectOption("dark");
  await page.locator("#open-calculator").click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("opening calculator preserves a paused lesson, draft, prediction and viewport", async ({
  page,
}) => {
  await page.goto("/lessons/addition/");
  await expect(page.locator("#run")).toBeEnabled();
  await page.locator("#prediction").fill("12");
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  const source = await page.locator("#source").inputValue(),
    pc = await page.locator("#step-location").textContent();
  await page.locator("#open-calculator").scrollIntoViewIfNeeded();
  const position = await page.evaluate(() => scrollY);
  const heading = await page.locator("h1").boundingBox();
  await page.locator("#open-calculator").click();
  await expect(page.locator("#close-calculator")).toBeFocused();
  const openedHeading = await page.locator("h1").boundingBox();
  expect(openedHeading).toEqual(heading);
  await page.locator("#calc-a").fill("0x000000000000000000ff");
  await page.locator("#calc-bits > summary").click();
  await page.getByRole("button", { name: "A bit 63: 0", exact: true }).click();
  await expect(page.locator("#calc-a-readings")).toContainText(
    "9,223,372,036,854,776,063",
  );
  await page.locator("#close-calculator").click();
  await expect(page.locator("#source")).toHaveValue(source);
  await expect(page.locator("#step-location")).toHaveText(pc);
  await expect(page.locator("#state-badge")).toHaveText("Paused");
  await expect(page.locator("#prediction")).toHaveValue("12");
  expect(await page.evaluate(() => scrollY)).toBe(position);
  await page.locator("#continue").click();
  await expect(page.locator("#t2-decimal")).toHaveText("12", {
    timeout: 45000,
  });
});

test("calculator is available on Hello World and survives blocked browser storage", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new Error("Storage disabled");
      },
    });
  });
  await page.goto("/lessons/hello-world/");
  await page.locator("#open-calculator").click();
  await page.locator("#calc-a").fill("15");
  await page.locator("#calculator-form button[type=submit]").click();
  await expect(page.locator("#calc-result-readings")).toContainText("16");
  await page.locator("#close-calculator").click();
  await page.locator("#open-calculator").click();
  await expect(page.locator("#calc-a")).toHaveValue("15");
});
