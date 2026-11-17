// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import { loadExercise, openTools } from "./editor-helpers.js";

for (const fallback of [false, true]) {
  test(`lesson and project identity survives ${fallback ? "modal" : "native"} fullscreen`, async ({
    page,
  }) => {
    if (fallback)
      await page.addInitScript(() =>
        Object.defineProperty(document, "fullscreenEnabled", {
          configurable: true,
          value: false,
        }),
      );
    await page.goto("/lessons/addition/");
    await expect(page.locator("#run")).toBeEnabled();
    await expect(page.locator("#workspace-kind")).toHaveText(
      "Lesson workspace",
    );
    await expect(page.locator("#workspace-name")).toHaveText(
      "Add two register values",
    );
    await expect(page.locator("#project-origin")).toBeEmpty();
    await loadExercise(page);
    await expect(page.locator("#editor-context")).toHaveText("Exercise");
    await expect(page.locator("#workspace-kind")).toHaveText(
      "Lesson workspace",
    );
    await page.locator(".workspace-identity").scrollIntoViewIfNeeded();
    await page.evaluate(() => scrollBy(0, 100));
    await expect(page.locator("h1")).not.toBeInViewport();
    await expect(page.locator("#workspace-kind")).toBeInViewport();
    await page.locator("#fullscreen-workspace").click();
    await expect(
      page.locator(".workbench-dialog #workspace-kind"),
    ).toBeVisible();
    await expect(page.locator(".workbench-dialog #workspace-name")).toHaveText(
      "Add two register values · exercise",
    );
    await page.locator("#fullscreen-workspace").click();
    await expect(page.locator("#open-playground")).toContainText(
      "Open a copy in Playground",
    );
    await expect(page.locator("#open-playground")).toHaveAttribute(
      "target",
      "_blank",
    );
    await expect(page.locator("#open-playground")).toHaveAccessibleName(
      /copy of current code and starting setup.*new tab/,
    );

    await page.goto("/playground/");
    await expect(page.locator("#run")).toBeEnabled();
    await expect(page.locator("#workspace-kind")).toHaveText(
      "Playground project",
    );
    await expect(page.locator("#workspace-name")).toHaveText(
      "Register addition",
    );
    await expect(page.locator("#project-origin")).toBeHidden();
    await page.locator("#fullscreen-workspace").click();
    await expect(page.locator(".workbench-dialog #workspace-kind")).toHaveText(
      "Playground project",
    );
    await expect(page.locator(".workbench-dialog #workspace-name")).toHaveText(
      "Register addition",
    );
    await page.locator("#fullscreen-workspace").click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test("sticky project identity follows names and origins without changing source", async ({
  page,
}) => {
  await page.goto("/playground/");
  await expect(page.locator("#run")).toBeEnabled();
  await openTools(page, "projects");
  await page.locator(".project-examples > summary").click();
  await page.locator("#project-example").selectOption("example-addition");
  await page.locator("#open-example").click();
  await expect(page.locator("#workspace-name")).toHaveText(
    "Add two register values",
  );
  const original = await page.locator("#project-picker").inputValue();
  const source = await page.locator("#source").inputValue();
  const back = page.locator("#project-origin a");
  await expect(back).toHaveText("Back to source lesson");
  await expect(back).toHaveAttribute("href", "../lessons/addition/");
  await expect(back).toHaveAttribute("target", "_blank");
  await expect(back).toHaveAccessibleName(
    "Back to source lesson: Add two register values (new tab)",
  );
  await openTools(page, "projects");
  await page.locator(".project-actions > summary").click();
  const name = "<img src=x> " + "Independent sensor experiment ".repeat(2);
  await page.locator("#project-name").fill(name);
  await page.locator("#project-name").press("Enter");
  await expect(page.locator("#workspace-name")).toHaveText(name.trim());
  await expect(page.locator("#workspace-name")).toHaveAttribute(
    "title",
    name.trim(),
  );
  await expect(page.locator("#workspace-name img")).toHaveCount(0);
  await expect(page.locator("#source")).toHaveValue(source);
  await openTools(page, "projects");
  await page.locator(".project-actions > summary").click();
  await openTools(page, "projects");
  await page.locator(".project-examples > summary").click();
  await page.locator("#project-example").selectOption("example-hello-world");
  await page.locator("#open-example").click();
  await expect(page.locator("#workspace-name")).toHaveText("Hello World");
  await expect(page.locator("#project-origin")).toBeHidden();
  await openTools(page, "projects");
  await page.locator("#project-picker").selectOption(original);
  await expect(page.locator("#workspace-name")).toHaveText(name.trim());
  await expect(back).toHaveAttribute("href", "../lessons/addition/");
  await expect(page.locator("#source")).toHaveValue(source);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
