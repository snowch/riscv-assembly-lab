import { setTheme } from "./theme-control.js";
// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import { openTools } from "./editor-helpers.js";

test("opening the lesson resource guide keeps the paused execution and draft", async ({
  page,
}) => {
  await page.goto("/lessons/addition/");
  await expect(page.locator("#run")).toBeEnabled();
  await page.locator("#prediction").fill("12");
  const source = await page.locator("#source").inputValue();
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  const position = await page.locator("#step-location").textContent();
  await openTools(page, "program");
  await page.locator("#open-complete-guide").click();
  const guide = page.locator(".lesson-resources #complete-program-guide");
  await expect(guide).toHaveJSProperty("open", true);
  await expect(guide.locator("summary")).toBeFocused();
  await expect(page.locator("#state-badge")).toHaveText("Paused");
  await expect(page.locator("#step-location")).toHaveText(position);
  await expect(page.locator("#source")).toHaveValue(source);
  await expect(page.locator("#prediction")).toHaveValue("12");
  await expect(page.locator("#lesson-complete")).not.toBeChecked();
  await page.locator("#stop").click();
});

test("breadcrumbs provide a compact accessible course menu and reveal the linked module", async ({
  page,
}, info) => {
  for (const width of info.project.name === "desktop" ? [800, 1440] : [390])
    for (const theme of ["light", "dark"]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/lessons/addition/");
      await setTheme(page, theme);
      const menu = page.locator("#course-navigation"),
        toggle = page.locator("#course-toggle");
      await expect(page.locator(".lesson-breadcrumbs")).toContainText(
        "First instructions",
      );
      await expect(menu).toBeHidden();
      const heading = await page.locator("h1").boundingBox();
      await toggle.focus();
      await page.keyboard.press("Enter");
      await expect(menu).toBeVisible();
      await expect(menu.locator('a[aria-current="page"]')).toBeVisible();
      const openHeading = await page.locator("h1").boundingBox();
      expect(openHeading.y).toBeGreaterThan(heading.y);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect(toggle).toBeFocused();
      await expect(page.locator(".lesson-guide")).toContainText(
        "li (load immediate)",
      );
      await expect(page.locator(".operand-flow")).toHaveAccessibleName(
        "add reads t0 and t1, then writes their sum to t2.",
      );
      await expect(page.locator(".operand-flow")).not.toContainText("12");
      const resources = page.getByRole("region", { name: "Lesson resources" });
      await expect(resources.locator("summary")).toHaveCount(5);
      const reference = resources.locator("#lesson-references");
      await expect(reference.locator("summary > .ui-icon")).toBeVisible();
      await expect(reference.locator(".resource-description")).toContainText(
        "Base integer instructions",
      );
      for (const summary of await resources.locator("summary").all()) {
        await expect(summary.locator(".resource-chevron svg")).toBeVisible();
        expect(
          await summary
            .locator(".resource-chevron svg")
            .evaluate((node) => node.getBoundingClientRect().width),
        ).toBe(20);
      }
      const completion = await page.locator(".lesson-completion").boundingBox();
      for (const id of ["complete-program-guide", "playground-help"]) {
        const guide = resources.locator("#" + id);
        await guide.locator("summary").focus();
        await page.keyboard.press("Space");
        await expect(guide).toHaveJSProperty("open", true);
        await page.keyboard.press("Space");
        await expect(guide).toHaveJSProperty("open", false);
      }
      expect(
        await resources.evaluate((node) =>
          Boolean(
            node.compareDocumentPosition(
              document.querySelector(".lesson-completion"),
            ) & Node.DOCUMENT_POSITION_FOLLOWING,
          ),
        ),
      ).toBe(true);
      expect(completion.height).toBeGreaterThan(44);
      await resources.getByText("References", { exact: true }).click();
      await expect(
        resources.getByRole("link", {
          name: "Runtime, source and licensing record",
        }),
      ).toBeVisible();
      await page.locator("#lesson-complete").check();
      await toggle.click();
      await expect(menu).toBeVisible();
      const completed = menu.locator('[data-completion="addition"]');
      await expect(completed).toBeVisible();
      await expect(completed).toHaveRole("img");
      await expect(completed).toHaveAccessibleName("Completed");
      await expect(completed.locator("svg")).toHaveAttribute("aria-hidden", "true");
      await page.locator("#lesson-complete").uncheck();
      await expect(completed).toBeHidden();
      await page.locator(".lesson-breadcrumbs > ol > li > a").click();
      await expect(page).toHaveURL(/\/#fundamentals$/);
      await expect(page.locator("#course-contents")).toHaveJSProperty(
        "open",
        true,
      );
      await expect(page.locator("#fundamentals")).toHaveJSProperty(
        "open",
        true,
      );
      await expect(page.locator("#fundamentals > summary")).toBeInViewport();
    }
});
