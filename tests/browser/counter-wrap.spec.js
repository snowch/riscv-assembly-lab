import { setTheme } from "./theme-control.js";
// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import { fillSource, openTools } from "./editor-helpers.js";

const miniature = (page) =>
  page.locator('#counter-wrap > [data-counter-pane="forward"]');
const bits = (page) => miniature(page).locator("[data-counter-retained]");
const decimal = (page) => miniature(page).locator("[data-counter-decimal]");
const marker = (page) => miniature(page).locator("[data-counter-carry]");
const advance = (page) =>
  miniature(page).getByRole("button", { name: "+1, add one", exact: true });
const reset = (page) =>
  miniature(page).getByRole("button", { name: "Reset", exact: true });
const saved = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      Object.entries(localStorage).filter(
        ([key]) =>
          !key.startsWith("riscv-counter-wrap-v") &&
          !key.startsWith("riscv-counter-borrow-v"),
      ),
    ),
  );
const markerLabel = (page) =>
  miniature(page).locator("[data-counter-marker-label]");

for (const theme of ["light", "dark"]) {
  test(`forward wrap and optional subtraction have independent state in ${theme}`, async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/lessons/addition-wraps/");
    await expect(page.locator("#run")).toBeEnabled();
    await setTheme(page, theme);
    const actual = await page
      .locator("#counter-wrap")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(actual).toBe(
      theme === "light" ? "rgb(255, 255, 255)" : "rgb(22, 47, 41)",
    );
    const source = await page.locator("#source").inputValue();
    await fillSource(page, source + "\n# saved counter experiment");
    await page.locator("#prediction").fill("123");
    const before = await saved(page);
    const details = page.locator("#counter-wrap > details");
    const borrow = page.locator('[data-counter-pane="borrow"]');
    await expect(details).not.toHaveAttribute("open");
    await expect(borrow).not.toBeVisible();
    await expect(bits(page)).toHaveText("0000");
    await expect(decimal(page)).toHaveText("0");
    await expect(marker(page)).toHaveText("—");
    await expect(miniature(page)).not.toContainText("borrow");
    await expect(miniature(page).getByRole("button")).toHaveCount(2);
    await advance(page).focus();
    const control = await advance(page).boundingBox();
    for (let step = 1; step <= 16; step++) {
      await page.keyboard.press(step % 2 ? "Enter" : "Space");
      await expect(decimal(page)).toHaveText(String(step % 16));
      await expect(marker(page)).toHaveText(step === 16 ? "1" : "0");
      await expect(advance(page)).toBeFocused();
      expect(
        Math.abs((await advance(page).boundingBox()).y - control.y),
      ).toBeLessThan(1);
    }
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
    await details.locator("summary").click();
    const minus = borrow.getByRole("button", {
      name: "−1, subtract one",
      exact: true,
    });
    const borrowBits = borrow.locator("[data-counter-retained]");
    const borrowMarker = borrow.locator("[data-counter-carry]");
    await minus.focus();
    const lower = await minus.boundingBox();
    await page.keyboard.press("Space");
    await expect(borrowBits).toHaveText("1111");
    await expect(borrowMarker).toHaveText("1");
    await expect(borrow.locator("[data-counter-feedback]")).toContainText("16");
    for (let step = 0; step < 16; step++) {
      await minus.click();
      expect(Math.abs((await minus.boundingBox()).y - lower.y)).toBeLessThan(1);
    }
    await expect(borrowBits).toHaveText("1111");
    await expect(decimal(page)).toHaveText("0");
    await expect(marker(page)).toHaveText("1");
    await expect(page.locator("#source")).toHaveValue(
      source + "\n# saved counter experiment",
    );
    await expect(page.locator("#prediction")).toHaveValue("123");
    expect(await saved(page)).toEqual(before);
    await page.reload();
    await expect(details).not.toHaveAttribute("open");
    await expect(decimal(page)).toHaveText("0");
    await expect(marker(page)).toHaveText("1");
    await reset(page).click();
    await expect(marker(page)).toHaveText("—");
    await details.locator("summary").click();
    await expect(borrowBits).toHaveText("1111");
    await page.locator("#prediction").fill("321");
    await borrow.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(borrowBits).toHaveText("0000");
    await expect(borrowMarker).toHaveText("—");
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
  await expect(bits(page)).toHaveText("0001");
  await openTools(page, "projects");
  await page.locator(".project-actions > summary").click();
  await page.locator("#copy-project").click();
  await expect(miniature(page)).toBeHidden();
  await page.locator("#return-lesson").click();
  await expect(miniature(page)).toBeVisible();
  await expect(bits(page)).toHaveText("0001");
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
  await advance(page).click();
  await expect(decimal(page)).toHaveText("1");
  await expect(markerLabel(page)).toHaveText("Carry out");
  await page.reload();
  await expect(decimal(page)).toHaveText("1");
  await expect(marker(page)).toHaveText("0");
  expect(
    await page.evaluate(() =>
      localStorage.getItem("riscv-counter-wrap-v1:addition-wraps"),
    ),
  ).toBe("2");
});

for (const theme of ["light", "dark"])
  test(`both experiments work at 320px without storage in ${theme}`, async ({
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
    await setTheme(page, theme);
    await expect(decimal(page)).toHaveText("0");
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {
        throw new Error("blocked");
      };
    });
    for (const direction of ["forward", "borrow"]) {
      if (direction === "borrow")
        await page.locator("#counter-wrap > details > summary").click();
      const pane = page.locator(`[data-counter-pane="${direction}"]`);
      const control = pane.getByRole("button").first();
      await control.focus();
      const baseline = await control.boundingBox();
      for (let step = 0; step < 20; step++) {
        await control.click();
        expect(
          Math.abs((await control.boundingBox()).y - baseline.y),
        ).toBeLessThan(1);
        const result = await pane
          .locator("[data-counter-display]")
          .boundingBox();
        expect(result.y + result.height).toBeLessThan(baseline.y);
      }
      for (const box of await pane.getByRole("button").evaluateAll((nodes) =>
        nodes.map((el) => ({
          width: el.offsetWidth,
          height: el.offsetHeight,
        })),
      )) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
