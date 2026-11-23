// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";

test("breadcrumbs provide a compact accessible course menu and reveal the linked module", async ({
  page,
}, info) => {
  for (const width of info.project.name === "desktop" ? [800, 1440] : [390])
    for (const theme of ["light", "dark"]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/lessons/addition/");
      await page.locator("#theme").selectOption(theme);
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
      await expect(resources.locator("summary")).toHaveCount(3);
      await resources.getByText("References", { exact: true }).click();
      await expect(
        resources.getByRole("link", {
          name: "Runtime, source and licensing record",
        }),
      ).toBeVisible();
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
