// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";

const height = (locator) =>
  locator.evaluate((el) => el.getBoundingClientRect().height);
const ready = async (page, lesson = "addition") => {
  await page.goto(`/lessons/${lesson}/`);
  await expect(page.locator("#source")).toBeEnabled();
};

test("the editor fits drafts, restores and activity changes without losing code", async ({
  page,
}) => {
  await ready(page);
  const source = page.locator("#source"),
    editor = page.locator("#source-editor");
  const starter = await source.inputValue(),
    small = await height(editor);
  expect(small).toBeLessThan(225);
  const long = Array.from({ length: 30 }, (_, i) => `addi t0, t0, ${i}`).join(
    "\n",
  );
  await source.fill(long);
  expect(await height(editor)).toBeGreaterThan(small);
  expect(await height(editor)).toBeLessThanOrEqual(360);
  await page.locator("#restore").click();
  await expect(source).toHaveValue(starter);
  expect(await height(editor)).toBe(small);
  await page.getByRole("button", { name: "Undo restore", exact: true }).click();
  await expect(source).toHaveValue(long);
  await page.locator("#challenge-mode").click();
  expect(await height(editor)).toBeLessThanOrEqual(225);
  await expect(page.locator("#starting-state")).toContainText(
    "Starting inputs · Two positive inputs",
  );
  await expect(page.locator("#starting-state")).toContainText("t0 = 14");
  await expect(page.locator("#starting-state")).toContainText(
    "Fresh machine each run.",
  );
  await page.locator("#explore-mode").click();
  await expect(source).toHaveValue(long);
  await page.reload();
  await expect(source).toHaveValue(long);
  expect(await height(editor)).toBeGreaterThan(small);
  const toggle = page.locator("#expand-editor");
  const compact = await height(editor);
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(toggle).toHaveText("Collapse editor");
  await expect(toggle).toBeFocused();
  expect(await height(editor)).toBeGreaterThan(compact);
  await expect(source).toHaveValue(long);
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toHaveText("Expand editor");
  expect(await height(editor)).toBe(compact);
  await expect(source).toHaveValue(long);
  await source.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
    el.dispatchEvent(new Event("scroll"));
  });
  // Fractional desktop line boxes round the two scroll ranges independently.
  // At 30 lines Chromium measures 452px for the textarea and 451px for the gutter.
  expect(
    Math.abs(
      (await page.locator("#line-numbers").evaluate((el) => el.scrollTop)) -
        (await source.evaluate((el) => el.scrollTop)),
    ),
  ).toBeLessThanOrEqual(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("resizing keeps breakpoint rows aligned and help opens the complete program", async ({
  page,
}) => {
  await ready(page);
  for (const width of [800, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() =>
        page.locator("#source-editor").evaluate((el) => {
          const source = el.querySelector("textarea"),
            style = getComputedStyle(source);
          const content =
            source.value.split("\n").length * parseFloat(style.lineHeight) +
            parseFloat(style.paddingTop) +
            parseFloat(style.paddingBottom) +
            2;
          return (
            Math.abs(
              parseFloat(el.style.getPropertyValue("--editor-content-height")) -
                content,
            ) < 1
          );
        }),
      )
      .toBe(true);
    const row = page.getByRole("button", {
      name: "Set breakpoint at source line 2",
      exact: true,
    });
    const lineHeight = await page
      .locator("#source")
      .evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
    expect(await height(row)).toBeCloseTo(lineHeight, 1);
    if (width === 390) expect(await height(row)).toBeGreaterThanOrEqual(44);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await expect(page.locator(".lab-help")).toHaveJSProperty("open", false);
  await expect(page.locator("#starting-state")).toContainText(
    "Working registers start at zero.",
  );
  await page.getByText("How this lab works", { exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".lab-help")).toHaveJSProperty("open", true);
  await page.locator('.lab-help a[href="#complete-program"]').click();
  await expect(page.locator("#complete-program")).toHaveJSProperty(
    "open",
    true,
  );
  await expect(page.locator("#complete-source")).toBeVisible();
});

test("expanding a paused editor preserves the machine, breakpoint and source", async ({
  page,
}) => {
  await ready(page);
  const source = await page.locator("#source").inputValue();
  await page
    .getByRole("button", {
      name: "Set breakpoint at source line 2",
      exact: true,
    })
    .click();
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  const pc = await page.locator("#step-location").textContent();
  const initialHeight = await height(page.locator("#source-editor"));
  await page.locator("#expand-editor").click();
  await expect(page.locator("#source")).toHaveValue(source);
  await expect(page.locator("#step-location")).toHaveText(pc);
  await expect(page.locator("#t0-decimal")).toHaveText("0");
  await expect(
    page.getByRole("button", {
      name: "Remove breakpoint at source line 2",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator("#expand-editor").click();
  await page.locator("#step").click();
  await expect(page.locator("#t0-decimal")).toHaveText("7");
  expect(await height(page.locator("#source-editor"))).toBe(initialHeight);
  await page.locator("#continue").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#t2-decimal")).toHaveText("12");
});
