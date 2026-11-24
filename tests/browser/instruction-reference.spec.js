// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { fillSource } from "./editor-helpers.js";
const recordings = JSON.parse(
  await readFile(
    new URL("../../site/course/reference-recordings.json", import.meta.url),
    "utf8",
  ),
);

async function find(page, name) {
  if (await page.locator("#reference-scope").isVisible())
    await page.locator("#reference-scope").selectOption("all");
  await page.locator("#reference-search").fill(name);
  const entry = page.locator(`[data-instruction="${name}"]`);
  await expect(entry).toHaveAttribute("open", "");
  return entry;
}

test("reference explains syntax, actual recordings, memory, pseudo expansion and program headers", async ({
  page,
}) => {
  await page.goto("/lessons/addition/");
  await page.locator("#open-reference").click();
  await expect(page.locator("#reference-search")).toBeFocused();
  await expect(page.locator("#reference-scope")).toHaveValue("lesson");
  const add = await find(page, "add");
  const example = add.locator('[data-example="add-registers"]');
  const before = recordings.examples["add-registers"].before;
  await expect(example.locator("tbody tr")).toHaveCount(before.length);
  await expect(example.locator("tbody tr").first()).toContainText(
    before[0].signed,
  );
  await page.locator("#reference-reading").selectOption("hex");
  await expect(example.locator("tbody tr").first()).toContainText(
    before[0].hex,
  );
  await example.locator(".reference-complete > summary").click();
  const complete = example.locator(".reference-complete");
  await expect(complete).toContainText(".text");
  await expect(complete).toContainText(".global reference_example");
  await expect(complete).toContainText("reference_example:");
  await expect(complete).toContainText(
    "does not choose where execution starts",
  );
  await expect(complete.locator("mark")).toHaveText("add t2, t0, t1");
  const store = await find(page, "sb");
  await expect(
    store.getByRole("heading", { name: "Memory at lesson_data" }),
  ).toBeVisible();
  const byte = recordings.examples["sb-data"].memory.after[0]
    .toString(16)
    .toUpperCase()
    .padStart(2, "0");
  await expect(
    store.locator("table").nth(1).locator("tbody tr").first(),
  ).toContainText(byte);
  const pseudo = await find(page, "li");
  await expect(pseudo).toContainText("Pseudo-instruction");
  const pseudoExample = pseudo.locator(".reference-example").first();
  await pseudoExample
    .getByText("Disassembly for this source line", { exact: true })
    .click();
  await expect(pseudoExample).toContainText(
    "recorded After values follow the complete source line",
  );
  await page.locator("#reference-search").fill(".global");
  await expect(page.locator(".reference-notation")).toHaveAttribute("open", "");
  await expect(page.locator(".reference-notation")).toContainText(".globl");
  await expect(page.locator("#reference-empty")).not.toBeVisible();
  await page.locator("#reference-search").fill("no_such_instruction");
  await expect(page.locator("#reference-empty")).toBeVisible();
});

test("reference preserves paused execution, edited source, prediction, calculator work and page position", async ({
  page,
}) => {
  await page.goto("/lessons/addition/");
  await fillSource(page, "li t0, 19\nli t1, 23\nadd t2, t0, t1");
  await page.locator("#prediction").fill("42");
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  const source = await page.locator("#source").inputValue();
  const pc = await page.locator("#step-location").textContent();
  await page.locator("#open-reference").scrollIntoViewIfNeeded();
  const position = await page.evaluate(() => scrollY);
  await page.locator("#open-reference").click();
  await find(page, "add");
  await page.keyboard.press("Control+Enter");
  await expect(page.locator("#state-badge")).toHaveText("Paused");
  await page.keyboard.press("Escape");
  await expect(page.locator("#instruction-reference")).not.toBeVisible();
  await expect(page.locator("#open-reference")).toBeFocused();
  await expect(page.locator("#source")).toHaveValue(source);
  await expect(page.locator("#prediction")).toHaveValue("42");
  await expect(page.locator("#step-location")).toHaveText(pc);
  expect(await page.evaluate(() => scrollY)).toBe(position);
  await page.locator("#open-calculator").click();
  await page.locator("#calc-a").fill("0xff");
  await page.locator("#close-calculator").click();
  await page.locator("#open-reference").click();
  await page.locator("#reference-close").click();
  await page.locator("#open-calculator").click();
  await expect(page.locator("#calc-a")).toHaveValue("0xff");
  await page.locator("#close-calculator").click();
  await page.locator("#continue").click();
  await expect(page.locator("#t2-decimal")).toHaveText("42", {
    timeout: 45000,
  });
});

test("reference works across routes and actual themes with readable keyboard controls", async ({
  page,
}, info) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of [
    "/",
    "/using-the-workbench/",
    "/playground/",
    "/lessons/hello-world/",
  ]) {
    await page.goto(route);
    for (const theme of ["light", "dark"]) {
      await page.locator("#theme").selectOption(theme);
      await page.locator("#open-reference").click();
      const entry = await find(page, "add");
      await expect(entry.locator(".reference-example").first()).toBeVisible();
      const problems = await page
        .locator("#instruction-reference")
        .evaluate((dialog) => {
          const issues = [];
          const root = document.documentElement;
          if (root.scrollWidth > innerWidth) issues.push("page overflow");
          if (dialog.scrollWidth > dialog.clientWidth + 1)
            issues.push("dialog overflow");
          for (const el of dialog.querySelectorAll(
            "button,input,select,summary",
          )) {
            if (
              el.getClientRects().length &&
              el.getBoundingClientRect().height < 40
            )
              issues.push("small control");
          }
          const walker = document.createTreeWalker(
            dialog,
            NodeFilter.SHOW_TEXT,
          );
          let node;
          while ((node = walker.nextNode()))
            if (
              node.textContent.trim() &&
              node.parentElement.getClientRects().length &&
              parseFloat(getComputedStyle(node.parentElement).fontSize) < 11
            )
              issues.push("small text");
          return { issues, theme: getComputedStyle(dialog).backgroundColor };
        });
      expect(problems.issues).toEqual([]);
      expect(problems.theme).toBe(
        theme === "light" ? "rgb(245, 250, 248)" : "rgb(16, 36, 33)",
      );
      if (route === "/playground/")
        await page.screenshot({
          path: `.artifacts/reference-${info.project.name}-${theme}.png`,
        });
      await page.locator("#reference-search").focus();
      await page.keyboard.press("Shift+Tab");
      await expect(page.locator("#reference-close")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.locator("#open-reference")).toBeFocused();
    }
  }
  expect(errors).toEqual([]);
});

test("failed example download leaves syntax available and can recover", async ({
  page,
}) => {
  let failed = true;
  await page.route("**/reference-recordings.json", (route) =>
    failed
      ? route.fulfill({ status: 503, body: "Unavailable" })
      : route.continue(),
  );
  await page.goto("/lessons/addition/");
  await page.locator("#open-reference").click();
  const entry = await find(page, "addi");
  await expect(entry).toContainText("from -2048 to 2047");
  await expect(entry).toContainText("The example results could not load");
  failed = false;
  await entry.getByRole("button", { name: "Try again" }).click();
  await expect(entry.locator(".reference-example").first()).toBeVisible();
});
