// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";

const scrollState = (page) =>
  page.locator("#calc-bit-scroll").evaluate((el) => ({
    left: el.scrollLeft,
    max: el.scrollWidth - el.clientWidth,
  }));
const calculate = (page) =>
  page.locator("#calculator-form button[type=submit]").click();

test("compact bits expose optional carries and retain the viewed columns", async ({
  page,
}) => {
  await page.goto("/playground/");
  await page.locator("#open-calculator").click();
  await page.locator("#calc-bits > summary").click();
  await expect(page.locator("#calc-carries")).toBeVisible();
  await expect(page.locator("#calc-carries")).toBeDisabled();
  await expect(page.locator("#calc-carries")).not.toBeChecked();
  await expect(page.locator("#calc-carry-pending")).toHaveText(
    "Calculate to show carries.",
  );
  await expect
    .poll(async () => {
      const s = await scrollState(page);
      return Math.abs(s.left - s.max);
    })
    .toBeLessThan(2);
  const cell = await page.locator('[data-bit="0"]').boundingBox();
  expect(cell.width).toBe(28);
  expect(cell.height).toBeGreaterThanOrEqual(44);
  await page.locator("#calc-high").click();
  await expect.poll(async () => (await scrollState(page)).left).toBe(0);
  await page.locator("#calc-a").fill("0x7fffffffffffffff");
  await calculate(page);
  await expect(page.locator("#calc-carries")).toBeEnabled();
  await expect(page.locator("#calc-carries")).toHaveAccessibleDescription("");
  await page.locator("#calc-carries").check();
  await expect(page.locator("#calc-carry-help")).toContainText(
    "Carry into bit 63: 1. Carry out: 0. Signed overflow: Yes.",
  );
  await expect.poll(async () => (await scrollState(page)).left).toBe(0);
  await expect(page.locator("#calc-carries")).toBeFocused();
  const rows = await page.locator(".calculator-bit-row").evaluateAll((rows) =>
    rows.map((row) => ({
      count: row.querySelectorAll("[data-position]").length,
      out: row.querySelector("[data-carry-out]").textContent,
      positions: [...row.querySelectorAll("[data-position]")].map(
        (cell) => cell.getBoundingClientRect().x,
      ),
    })),
  );
  expect(rows.map((row) => row.count)).toEqual([64, 64, 64, 64, 64]);
  expect(rows.map((row) => row.out)).toEqual(["Out", "0", "", "", ""]);
  for (const row of rows) expect(row.positions).toEqual(rows[0].positions);
  // Group gaps are shared by every row, with no extra editable result bit.
  expect(rows[0].positions[4] - rows[0].positions[3]).toBe(34);
  expect(rows[0].positions[3] - rows[0].positions[2]).toBe(30);
  await expect(page.locator("[data-bit]")).toHaveCount(64);
  await page.locator("#calc-bit-scroll").evaluate((el) => {
    el.scrollLeft = 450;
  });
  await expect.poll(async () => (await scrollState(page)).left).toBe(450);
  const xBefore = await page
    .locator('[data-bit="48"]')
    .evaluate((el) => el.getBoundingClientRect().x);
  await page.locator("#calc-carries").uncheck();
  expect(
    await page
      .locator('[data-bit="48"]')
      .evaluate((el) => el.getBoundingClientRect().x),
  ).toBe(xBefore);
  await page.locator("#calc-reading").selectOption("signed");
  const saved = await scrollState(page);
  await page.locator("#close-calculator").click();
  await page.locator("#open-calculator").click();
  await expect
    .poll(async () => (await scrollState(page)).left)
    .toBe(saved.left);
  await page.locator("#calc-low").click();
  await page.locator('[data-bit="0"]').click();
  await expect(page.locator('[data-bit="0"]')).toBeFocused();
  await expect(page.locator("#calc-carries")).toBeDisabled();
  await expect(page.locator("#calc-carry-pending")).toBeVisible();
  await expect(page.locator("#calc-result")).toBeHidden();
  await expect
    .poll(async () => {
      const s = await scrollState(page);
      return Math.abs(s.left - s.max);
    })
    .toBeLessThan(2);
  await page.locator("#calc-operation").selectOption("subtract");
  await expect(page.locator("#calc-carry-control")).toBeHidden();
  await expect(page.locator("#calc-carry-pending")).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

for (const width of [32, 64]) {
  test(`carry out is separate from the retained ${width}-bit result in both themes`, async ({
    page,
  }) => {
    await page.goto("/playground/");
    await page.locator("#open-calculator").click();
    await page.locator("#calc-width").selectOption(String(width));
    await page.locator("#calc-a").fill("0x" + "f".repeat(width / 4));
    await calculate(page);
    await page.locator("#calc-bits > summary").click();
    await page.locator("#calc-carries").check();
    await page.locator("#calc-high").click();
    await expect(page.locator("#calc-carry-help")).toContainText(
      `Carry into bit ${width - 1}: 1. Carry out: 1. Signed overflow: No.`,
    );
    const carryRow = page.locator(".calculator-bit-row").nth(1);
    await expect(carryRow.locator("[data-carry-out]")).toHaveText("1");
    await expect(carryRow.locator('[data-position="0"]')).toHaveText("0");
    await expect(
      page.locator(".calculator-bit-row").last().locator("[data-position]"),
    ).toHaveText(Array(width).fill("0"));
    await expect(carryRow.locator("[data-carry-out]")).toHaveAttribute(
      "aria-label",
      new RegExp(`beyond bit ${width - 1}`),
    );
    await page.locator("#close-calculator").click();
    await page.locator("#theme").selectOption("dark");
    await page.locator("#open-calculator").click();
    await expect(page.locator("#calc-carries")).toBeChecked();
    const label = await page
      .locator(".calculator-bit-label")
      .first()
      .boundingBox();
    const out = await carryRow.locator("[data-carry-out]").boundingBox();
    const top = await carryRow
      .locator(`[data-position="${width - 1}"]`)
      .boundingBox();
    expect(out.x).toBeGreaterThanOrEqual(label.x + label.width);
    expect(out.x + out.width).toBeLessThan(top.x);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
