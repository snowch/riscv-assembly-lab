import { setTheme } from "./theme-control.js";
// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import { loadLessons } from "../../tools/course-data.js";

const addition = (await loadLessons()).find(
  (lesson) => lesson.id === "addition",
);

test("the optional guide is readable and uses the actual addition source without changing progress", async ({
  page,
}, info) => {
  const widths = info.project.name === "desktop" ? [1440, 800] : [390];
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("riscv-assembly-lab:complete:v1", '["addition"]'),
  );
  const savedDraft = "li t0, 99\n";
  await page.evaluate(
    (draft) =>
      localStorage.setItem("riscv-assembly-lab:addition:explore:v2", draft),
    savedDraft,
  );
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of widths)
    for (const theme of ["light", "dark"]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/using-the-workbench/");
      await setTheme(page, theme);
      await expect(page.locator("h1")).toHaveText("Using the workbench");
      await expect(
        page.locator('pre[aria-label="Addition example"]'),
      ).toHaveText(addition.starter);
      await expect(page.locator("#lesson-complete")).toHaveCount(0);
      await expect(page.locator(".cm-content")).toHaveCount(0);
      expect(
        await page.evaluate(() =>
          localStorage.getItem("riscv-assembly-lab:complete:v1"),
        ),
      ).toBe('["addition"]');
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(
        page.getByRole("link", {
          name: "Open the addition workbench",
          exact: true,
        }),
      ).toHaveAttribute("href", "../lessons/addition/#workbench");
      await page
        .getByRole("link", {
          name: "Use familiar editing controls",
          exact: true,
        })
        .focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#keyboard-shortcuts")).toBeInViewport();
      const small = await page.evaluate(() => {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
          ),
          issues = [];
        let node;
        while ((node = walker.nextNode()))
          if (
            node.textContent.trim() &&
            node.parentElement.getClientRects().length &&
            parseFloat(getComputedStyle(node.parentElement).fontSize) < 11
          )
            issues.push(node.textContent);
        return issues;
      });
      expect(small).toEqual([]);
    }
  expect(errors).toEqual([]);
  await page
    .getByRole("link", { name: "Open the addition workbench", exact: true })
    .click();
  await expect(page.locator("#run")).toBeEnabled();
  await expect(page.locator("#source")).toHaveValue(savedDraft);
  await page.locator("#restore").click();
  await expect(page.locator("#source")).toHaveValue(addition.starter);
  await page.getByRole("button", { name: "Undo restore", exact: true }).click();
  await expect(page.locator("#source")).toHaveValue(savedDraft);
  await expect(page.locator("#lesson-complete")).toBeChecked();
});

test("guide entry links work and help opens a new tab without disturbing a paused example", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator('.course-introduction a[href="./using-the-workbench/"]')
    .click();
  await expect(page.locator("h1")).toHaveText("Using the workbench");
  await page
    .getByRole("link", { name: "Start with addition", exact: true })
    .click();
  await expect(page.locator("#run")).toBeEnabled();
  await expect(
    page.locator('.optional-guide a[href="../../using-the-workbench/"]'),
  ).toBeVisible();
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  const pc = await page.locator("#step-location").textContent();
  const source = await page.locator("#source").inputValue();
  await page.locator(".lab-help > summary").click();
  const popup = page.waitForEvent("popup");
  await page.locator('.lab-help a[href="../../using-the-workbench/"]').click();
  const guide = await popup;
  await expect(guide.locator("h1")).toHaveText("Using the workbench");
  await expect(page.locator("#state-badge")).toHaveText("Paused");
  await expect(page.locator("#step-location")).toHaveText(pc);
  await expect(page.locator("#source")).toHaveValue(source);
  await expect(page.locator("#complete-program")).toHaveJSProperty(
    "open",
    false,
  );
  await guide.close();
  await page.locator('.lab-help a[href="#complete-program"]').click();
  await expect(page.locator("#complete-program")).toHaveJSProperty(
    "open",
    true,
  );
  await expect(page.locator("#complete-source")).toBeInViewport();
  await page.locator("#continue").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#t2-decimal")).toHaveText("12");
  await page.goto("/lessons/hello-world/");
  await page
    .getByText("How the browser builds and runs it", { exact: true })
    .click();
  await expect(
    page.locator('a[href="../../using-the-workbench/"]'),
  ).toHaveAttribute("target", "_blank");
});
