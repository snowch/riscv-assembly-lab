// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { fillSource, openTools } from "./editor-helpers.js";
const guide = JSON.parse(
  await readFile(
    new URL("../../content/guides/moving-to-arm.json", import.meta.url),
    "utf8",
  ),
);
const caller = guide.sections
  .flatMap((section) => section.snippets ?? [])
  .find((snippet) => snippet.source.startsWith("li a0")).source;

for (const theme of ["light", "dark"])
  test(`directional guide keeps lesson work while its real caller runs in a new project in ${theme}`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/lessons/riscv-and-arm/");
    await page.locator("#theme").selectOption(theme);
    await expect(
      page.getByRole("heading", { name: guide.title, exact: true }),
    ).toBeVisible();
    await expect(page.locator(".transfer-guide")).toContainText(
      "low 32 bits of the same 64-bit register",
    );
    await expect(page.locator(".transfer-guide pre").first()).toHaveCSS(
      "font-size",
      "16px",
    );
    const source =
      (await page.locator("#source").inputValue()) + "\n# saved transfer draft";
    await fillSource(page, source);
    await page.locator("#run").click();
    await expect(page.locator("#t3-decimal")).toHaveText("1", {
      timeout: 45000,
    });
    await openTools(page, "projects");
    await page.locator("#new-project").click();
    const dialog = page.locator("#new-project-dialog");
    await dialog.locator("#new-project-name").fill("Transfer verification");
    await dialog.locator("#new-project-kind").selectOption("asm");
    await dialog
      .getByRole("button", { name: "Create project", exact: true })
      .click();
    await expect(page.locator(".transfer-guide")).toBeHidden();
    await fillSource(page, caller);
    await page.locator("#run").click();
    await expect(page.locator("#t2-decimal")).toHaveText("13", {
      timeout: 45000,
    });
    const fresh = caller
      .replace("call difference", "li a2, 3\ncall difference")
      .replace("sub a0, a0, a1", "sub a0, a0, a1\n  add a0, a0, a2");
    await fillSource(page, fresh);
    await page.locator("#run").click();
    await expect(page.locator("#t2-decimal")).toHaveText("16", {
      timeout: 45000,
    });
    await page.locator("#return-lesson").click();
    await expect(page.locator("#source")).toHaveValue(source);
    await expect(page.locator(".transfer-guide")).toBeVisible();
    await page.reload();
    await expect(page.locator("#source")).toHaveValue(source);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
