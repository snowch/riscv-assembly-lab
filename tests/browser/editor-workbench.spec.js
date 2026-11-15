// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import { fillSource } from "./editor-helpers.js";

const go = async (page, id = "addition") => {
  await page.goto(`/lessons/${id}/`);
  await expect(page.locator("#run")).toBeEnabled();
};

test("the visible editor supports highlighting, indentation, undo, find and focus escape", async ({
  page,
}) => {
  await go(page);
  const editor = page.locator(".cm-content");
  await fillSource(page, "li t0, 7\nli t1, 5\nadd t2, t0, t1");
  await editor.focus();
  await page.keyboard.press("Control+Home");
  await page.keyboard.press("Tab");
  await expect(page.locator("#source")).toHaveValue(/^    li/);
  await page.keyboard.press("Control+z");
  await expect(page.locator("#source")).toHaveValue(/^li/);
  const colours = await page
    .locator(".cm-line")
    .first()
    .locator("span")
    .evaluateAll((es) => [
      ...new Set(es.map((e) => getComputedStyle(e).color)),
    ]);
  expect(colours.length).toBeGreaterThan(1);
  await page.keyboard.press("Control+f");
  await expect(page.locator('.cm-search input[name="search"]')).toBeFocused();
  await page.locator('.cm-search input[name="search"]').pressSequentially("t0");
  await expect
    .poll(() => page.locator(".cm-scroller").evaluate((el) => el.clientHeight))
    .toBeGreaterThanOrEqual(100);
  await expect(page.locator(".cm-searchMatch").first()).toBeVisible();
  await expect(page.locator(".cm-searchMatch").first()).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(page.locator(".cm-search")).toHaveCount(0);
  await editor.focus();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Tab");
  await expect(editor).not.toBeFocused();
  await page.locator("#challenge-mode").click();
  const challenge = await page.locator("#source").inputValue();
  await page.locator(".cm-content").focus();
  await page.keyboard.press("Control+z");
  await expect(page.locator("#source")).toHaveValue(challenge);
});

test("inspector tabs use keyboard navigation and preserve before/after memory", async ({
  page,
}) => {
  await go(page, "loads-and-stores");
  await page.getByRole("tab", { name: "Registers", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Memory", exact: true }),
  ).toBeFocused();
  await expect(page.locator("#inspect-memory")).toBeVisible();
  await expect(page.locator("#inspect-registers")).not.toBeVisible();
  await expect(page.locator("#memory-note")).toContainText("before execution");
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "Debugger", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Home");
  await expect(
    page.getByRole("tab", { name: "Registers", exact: true }),
  ).toBeFocused();
  await page.getByRole("tab", { name: "Memory", exact: true }).click();
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#inspect-memory")).toBeVisible();
  await expect(page.locator("#memory-note")).toContainText("observed at 0x");
  await page.locator("#memory-before").click();
  await expect(page.locator("#memory-note")).toContainText("before execution");
});

test("resizing and fullscreen preserve a paused machine and return focus", async ({
  page,
}) => {
  await go(page);
  await page.locator("#source-editor").scrollIntoViewIfNeeded();
  const editor = page.locator("#source-editor");
  const initial = await editor.boundingBox();
  await page.mouse.move(
    initial.x + initial.width - 4,
    initial.y + initial.height - 4,
  );
  await page.mouse.down();
  await page.mouse.move(
    initial.x + initial.width - 4,
    initial.y + initial.height + 86,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect
    .poll(() => editor.evaluate((el) => el.getBoundingClientRect().height))
    .toBeGreaterThan(initial.height + 40);
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  const source = await page.locator("#source").inputValue();
  const pc = await page.locator("#step-location").textContent();
  const fullscreen = page.locator("#fullscreen-workspace");
  await fullscreen.click();
  await expect(page.locator(".workbench-dialog")).toHaveJSProperty(
    "open",
    true,
  );
  await expect(fullscreen).toHaveAttribute("aria-expanded", "true");
  if (await page.evaluate(() => document.fullscreenEnabled)) {
    await expect
      .poll(() => page.evaluate(() => document.fullscreenElement?.id))
      .toBe("workbench");
  }
  await expect(page.locator("#source")).toHaveValue(source);
  await expect(page.locator("#step-location")).toHaveText(pc);
  await expect(page.locator("#t0-decimal")).toHaveText("0");
  await page.locator("#step").click();
  await expect(page.locator("#t0-decimal")).toHaveText("7");
  await fullscreen.click();
  await expect(page.locator(".workbench-dialog")).toHaveJSProperty(
    "open",
    false,
  );
  await expect(fullscreen).toBeFocused();
  await expect(page.locator("#workbench")).toBeVisible();
  await page.locator("#continue").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#t2-decimal")).toHaveText("12");
  await fullscreen.click();
  await page.locator(".lab-help > summary").click();
  await page.locator('.lab-help a[href="#complete-program"]').click();
  await expect(page.locator(".workbench-dialog")).toHaveJSProperty(
    "open",
    false,
  );
  await expect(page.locator("#complete-program")).toHaveJSProperty(
    "open",
    true,
  );
  await expect(page.locator("#complete-program > summary")).toBeFocused();
  await expect(page.locator("#complete-source")).toBeInViewport();
});

test("C source gets bracket matching and real diagnostics without source breakpoints", async ({
  page,
}) => {
  await go(page, "c-return-values");
  await fillSource(page, "long lesson(long a, long b) {\n    return a + b;\n}");
  await page.locator(".cm-content").focus();
  await page.keyboard.press("Control+End");
  await expect(page.locator(".cm-matchingBracket")).toHaveCount(2);
  await expect(page.locator(".cm-breakpoint-button")).toHaveCount(0);
  await fillSource(
    page,
    "long lesson(long a,long b) {\n return missing_name;\n}",
  );
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Error", {
    timeout: 45000,
  });
  await expect(
    page.getByRole("tab", { name: "Diagnostics", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.locator(".diagnostic-link").first().click();
  await expect(page.locator(".cm-content")).toBeFocused();
  expect(
    await page.evaluate(() => window.getSelection()?.toString()),
  ).toContain("missing_name");
});

test("challenge checks lock the visible editor and release it afterwards", async ({
  page,
}) => {
  await go(page);
  await page.locator("#challenge-mode").click();
  await fillSource(page, "add t2,t0,t1");
  await page.locator("#check-cases").click();
  await expect(page.locator(".cm-content")).toHaveAttribute(
    "contenteditable",
    "false",
  );
  await page.locator("#fullscreen-workspace").click();
  await expect(page.locator(".cm-content")).toHaveAttribute(
    "contenteditable",
    "false",
  );
  await page.locator("#fullscreen-workspace").click();
  await expect(page.locator("#state-badge")).toHaveText("Passed", {
    timeout: 45000,
  });
  await expect(page.locator(".cm-content")).toHaveAttribute(
    "contenteditable",
    "true",
  );
  await expect(page.locator("#source")).toHaveValue("add t2,t0,t1");
});
