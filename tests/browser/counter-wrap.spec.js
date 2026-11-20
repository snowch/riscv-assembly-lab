// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import { fillSource, openTools } from "./editor-helpers.js";

const miniature = (page) => page.locator("#counter-wrap");
const bits = (page) => miniature(page).locator("[data-counter-retained]");
const decimal = (page) => miniature(page).locator("[data-counter-decimal]");
const marker = (page) => miniature(page).locator("[data-counter-carry]");
const advance = (page) =>
  miniature(page).getByRole("button", { name: "+1, add one", exact: true });
const previous = (page) =>
  miniature(page).getByRole("button", {
    name: "−1, subtract one",
    exact: true,
  });
const reset = (page) =>
  miniature(page).getByRole("button", { name: "Reset", exact: true });
const saved = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      Object.entries(localStorage).filter(
        ([key]) => !key.startsWith("riscv-counter-wrap-v"),
      ),
    ),
  );
const markerLabel = (page) =>
  miniature(page).locator("[data-counter-marker-label]");

for (const theme of ["light", "dark"]) {
  test(`bidirectional counter crosses both boundaries with stable controls in ${theme}`, async ({
    page,
  }, info) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/lessons/addition-wraps/");
    await expect(page.locator("#run")).toBeEnabled();
    await page.locator("#theme").selectOption(theme);
    expect(
      await miniature(page).evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      ),
    ).toBe(theme === "light" ? "rgb(255, 255, 255)" : "rgb(23, 41, 37)");
    const source = await page.locator("#source").inputValue();
    await fillSource(page, source + "\n# saved counter experiment");
    await page.locator("#prediction").fill("123");
    const before = await saved(page);
    await expect(bits(page)).toHaveText("1101");
    await expect(decimal(page)).toHaveText("13");
    await expect(marker(page)).toHaveText("—");
    await expect(miniature(page)).toContainText("4 bits");
    await expect(miniature(page)).toContainText("64-bit registers");
    await expect(miniature(page)).toContainText(
      "RISC-V has no carry or signed-overflow flag",
    );
    await expect(
      miniature(page).locator(
        "[data-counter-addition], [data-counter-operands], .counter-equation, .counter-elapsed",
      ),
    ).toHaveCount(0);
    await expect(advance(page)).toBeEnabled();
    await expect(previous(page)).toBeEnabled();
    await advance(page).scrollIntoViewIfNeeded();
    await advance(page).focus();
    await expect(bits(page)).toBeInViewport({ ratio: 1 });
    await expect(decimal(page)).toBeInViewport({ ratio: 1 });
    await expect(marker(page)).toBeInViewport({ ratio: 1 });
    const control = await advance(page).boundingBox();
    const display = await miniature(page)
      .locator("[data-counter-display]")
      .boundingBox();
    const numeric = await decimal(page).boundingBox();
    const pattern = await bits(page).boundingBox();
    expect(display.y + display.height).toBeLessThan(control.y);
    expect(numeric.y).toBeGreaterThan(pattern.y + pattern.height);
    expect(
      Math.abs(numeric.x + numeric.width / 2 - pattern.x - pattern.width / 2),
    ).toBeLessThan(1);
    const position = await page.evaluate(() => scrollY);
    for (const [key, value, pattern] of [
      ["Enter", "14", "1110"],
      ["Space", "15", "1111"],
      ["Enter", "0", "0000"],
    ]) {
      await page.keyboard.press(key);
      await expect(decimal(page)).toHaveText(value);
      await expect(bits(page)).toHaveText(pattern);
      await expect(advance(page)).toBeFocused();
      expect(
        Math.abs((await advance(page).boundingBox()).y - control.y),
      ).toBeLessThan(1);
      expect(await page.evaluate(() => scrollY)).toBe(position);
    }
    await expect(markerLabel(page)).toHaveText("Carry out");
    await expect(marker(page)).toHaveText("1");
    await expect(
      miniature(page).locator("[data-counter-feedback]"),
    ).toContainText("carry");
    await previous(page).focus();
    await page.keyboard.press("Space");
    await expect(decimal(page)).toHaveText("15");
    await expect(bits(page)).toHaveText("1111");
    await expect(markerLabel(page)).toHaveText("Borrow needed");
    await expect(marker(page)).toHaveText("1");
    await expect(
      miniature(page).locator("[data-counter-feedback]"),
    ).toContainText("16");
    await expect(
      miniature(page).locator("[data-counter-feedback]"),
    ).toContainText("15");
    await expect(previous(page)).toBeFocused();
    expect(
      Math.abs((await advance(page).boundingBox()).y - control.y),
    ).toBeLessThan(1);
    await miniature(page).screenshot({
      path: `.artifacts/bidirectional-counter-${info.project.name}-${theme}.png`,
    });
    await page.keyboard.press("Enter");
    await expect(decimal(page)).toHaveText("14");
    await expect(marker(page)).toHaveText("0");
    for (let count = 0; count < 32; count++) await advance(page).click();
    await expect(decimal(page)).toHaveText("14");
    for (let count = 0; count < 32; count++) await previous(page).click();
    await expect(decimal(page)).toHaveText("14");
    await expect(
      miniature(page).locator("[data-counter-trace] code"),
    ).toHaveCount(5);
    await expect(page.locator("#t2-decimal")).toHaveText("—");
    await expect(page.locator("#source")).toHaveValue(
      source + "\n# saved counter experiment",
    );
    await expect(page.locator("#prediction")).toHaveValue("123");
    expect(await saved(page)).toEqual(before);
    await page.reload();
    await expect(decimal(page)).toHaveText("14");
    await expect(markerLabel(page)).toHaveText("Borrow needed");
    await expect(marker(page)).toHaveText("0");
    // Prediction is a per-visit input; reload intentionally starts it empty.
    // Resetting this miniature must preserve the current prediction instead.
    await page.locator("#prediction").fill("321");
    await reset(page).click();
    await expect(decimal(page)).toHaveText("13");
    await expect(bits(page)).toHaveText("1101");
    await expect(marker(page)).toHaveText("—");
    await expect(
      miniature(page).locator("[data-counter-trace] code"),
    ).toHaveCount(1);
    await expect(previous(page)).toBeEnabled();
    await expect(page.locator("#prediction")).toHaveValue("321");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("native execution and project copies keep their own context while miniature state survives", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/lessons/addition-wraps/");
  await expect(page.locator("#run")).toBeEnabled();
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#t2-decimal")).toHaveText("3");
  await advance(page).click();
  await expect(page.locator("#t2-decimal")).toHaveText("3");
  await fillSource(page, "li t0, 40\nli t1, 53\nadd t2, t0, t1");
  await page.locator("#run").click();
  await expect(page.locator("#t2-decimal")).toHaveText("93", {
    timeout: 45000,
  });
  await expect(bits(page)).toHaveText("1110");
  await openTools(page, "projects");
  await page.locator(".project-actions > summary").click();
  await page.locator("#copy-project").click();
  await expect(miniature(page)).toBeHidden();
  await page.locator("#return-lesson").click();
  await expect(miniature(page)).toBeVisible();
  await expect(bits(page)).toHaveText("1110");
  await expect(page.locator("#source")).toHaveValue(
    "li t0, 40\nli t1, 53\nadd t2, t0, t1",
  );
});

test("legacy restoration is read-only and keeps its original displayed reading", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("counter-legacy-seeded")) {
      localStorage.setItem("riscv-counter-wrap-v1:addition-wraps", "2");
      sessionStorage.setItem("counter-legacy-seeded", "yes");
    }
  });
  await page.goto("/lessons/addition-wraps/");
  await expect(decimal(page)).toHaveText("0");
  await expect(marker(page)).toHaveText("1");
  await expect(miniature(page).locator("[data-counter-trace]")).toHaveText(
    "14 → 15 → 0",
  );
  expect(
    await page.evaluate(() =>
      localStorage.getItem("riscv-counter-wrap-v2:addition-wraps"),
    ),
  ).toBeNull();
  await previous(page).click();
  await expect(decimal(page)).toHaveText("15");
  await expect(markerLabel(page)).toHaveText("Borrow needed");
  await page.reload();
  await expect(decimal(page)).toHaveText("15");
  await expect(marker(page)).toHaveText("1");
  expect(
    await page.evaluate(() =>
      localStorage.getItem("riscv-counter-wrap-v1:addition-wraps"),
    ),
  ).toBe("2");
});

test("corrupt model storage and blocked storage remain usable at 320px", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "riscv-counter-wrap-v2:addition-wraps",
      '{"readings":[0,8]}',
    ),
  );
  await page.goto("/lessons/addition-wraps/");
  await page.setViewportSize({ width: 320, height: 900 });
  await expect(decimal(page)).toHaveText("13");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error("blocked");
    };
  });
  await advance(page).scrollIntoViewIfNeeded();
  const initial = await advance(page).boundingBox();
  for (let count = 0; count < 3; count++) await advance(page).click();
  await expect(bits(page)).toHaveText("0000");
  await previous(page).click();
  await expect(bits(page)).toHaveText("1111");
  await expect(markerLabel(page)).toHaveText("Borrow needed");
  expect(
    Math.abs((await advance(page).boundingBox()).y - initial.y),
  ).toBeLessThan(1);
  await expect(bits(page)).toBeInViewport({ ratio: 1 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const box of await miniature(page)
    .getByRole("button")
    .evaluateAll((nodes) =>
      nodes.map((el) => ({ width: el.offsetWidth, height: el.offsetHeight })),
    )) {
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  }
});
