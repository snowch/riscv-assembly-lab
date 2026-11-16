// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import { fillSource } from "./editor-helpers.js";
const go = async (page) => {
  await page.goto("/playground/");
  await expect(page.locator("#run")).toBeEnabled();
};
const inspect = async (page) => {
  if (await page.locator("#workspace-inspect").isVisible())
    await page.locator("#workspace-inspect").click();
};
const paused = (page) =>
  expect(page.locator("#state-badge")).toHaveText("Paused", { timeout: 45000 });

test("program context is exact, folded and separate from the editable source", async ({
  page,
}) => {
  await go(page);
  const source =
    "li t0,7\nj done\nhelper:\n ret\n.data\nmy_bytes: .byte 7,5\n.text\ndone:\n";
  await fillSource(page, source);
  await page.locator("#workspace-program").click();
  await expect(
    page.locator('#program-sections [data-section="user"] pre'),
  ).toHaveText(source);
  const sections = await page
    .locator("#program-sections [data-program-source]")
    .allTextContents();
  expect(sections.join("")).toBe(
    await page.locator("#complete-source").textContent(),
  );
  await expect(
    page.locator('#program-sections details[data-section="setup"]'),
  ).not.toHaveAttribute("open", "");
  await expect(
    page.locator('#program-sections details[data-section="report"]'),
  ).not.toHaveAttribute("open", "");
  await page
    .locator('#program-sections details[data-section="setup"] > summary')
    .click();
  await expect(
    page.locator('#program-sections details[data-section="setup"] pre'),
  ).toBeVisible();
  await page.locator("#workspace-code").click();
  await expect(page.locator("#source")).toHaveValue(source);
  await page.locator("#workspace-program").click();
  await expect(
    page.locator('#program-sections details[data-section="setup"]'),
  ).toHaveAttribute("open", "");
});

test("workspace switches preserve geometry, independent scroll and the paused CPU", async ({
  page,
}) => {
  await go(page);
  await fillSource(
    page,
    Array.from({ length: 80 }, (_, i) => `addi t0,t0,${i % 10}`).join("\n") +
      "\n",
  );
  await page.locator("#step").click();
  await paused(page);
  const pc = await page.locator("#step-location").textContent();
  const geometry = await page.locator(".workspace").boundingBox();
  const documentTop = await page.evaluate(() => scrollY);
  await page.locator(".cm-scroller").evaluate((el) => {
    el.scrollTop = 220;
  });
  const scroll = await page
    .locator(".cm-scroller")
    .evaluate((el) => el.scrollTop);
  await page.locator("#workspace-program").click();
  await page.locator("#program-source-view").evaluate((el) => {
    el.scrollTop = 120;
  });
  const programTop = await page
    .locator("#program-source-view")
    .evaluate((el) => el.scrollTop);
  await inspect(page);
  await page.locator("#workspace-code").click();
  expect(
    await page.locator(".cm-scroller").evaluate((el) => el.scrollTop),
  ).toBe(scroll);
  const after = await page.locator(".workspace").boundingBox();
  expect(Math.abs(after.y - geometry.y)).toBeLessThan(2);
  expect(Math.abs(after.height - geometry.height)).toBeLessThan(2);
  expect(await page.evaluate(() => scrollY)).toBe(documentTop);
  await expect(page.locator("#step-location")).toHaveText(pc);
  await paused(page);
  await page.locator("#workspace-program").click();
  expect(
    await page.locator("#program-source-view").evaluate((el) => el.scrollTop),
  ).toBe(programTop);
  await page.locator("#stop").click();
});

test("actual machine instructions expose expansion and track the next PC and stale edits", async ({
  page,
}) => {
  test.setTimeout(100000);
  await go(page);
  const source = "li t0,0x1234567890abcdef\nadd t2,t0,zero\n";
  await fillSource(page, source);
  await page.locator("#step").click();
  await paused(page);
  await page.locator("#workspace-program").click();
  await page.locator("#program-mode").selectOption("instructions");
  const firstPc = await page
    .locator(".machine-instruction[aria-current=step]")
    .getAttribute("data-address");
  expect(BigInt(firstPc)).toBeGreaterThan(0n);
  expect(
    await page
      .locator(".machine-source-line")
      .filter({ hasText: "Source line 1" })
      .count(),
  ).toBeGreaterThan(1);
  await page.locator("#step").click();
  await expect
    .poll(() =>
      page
        .locator(".machine-instruction[aria-current=step]")
        .getAttribute("data-address"),
    )
    .not.toBe(firstPc);
  await paused(page);
  const userRows = await page.locator(".machine-instruction").count();
  await page.locator("#machine-scope").selectOption("all");
  expect(await page.locator(".machine-instruction").count()).toBeGreaterThan(
    userRows,
  );
  await page.locator("#machine-jump").click();
  const listingBox = await page.locator("#program-machine-view").boundingBox();
  const pcBox = await page
    .locator('.machine-instruction[aria-current="step"]')
    .boundingBox();
  expect(pcBox.y).toBeGreaterThanOrEqual(listingBox.y);
  expect(pcBox.y + pcBox.height).toBeLessThanOrEqual(
    listingBox.y + listingBox.height,
  );
  await page.locator("#workspace-code").click();
  await fillSource(page, "li t2,42\n");
  await page.locator("#workspace-program").click();
  await expect(page.locator("#machine-note")).toContainText("previous build");
  expect(await page.locator(".machine-instruction").count()).toBeGreaterThan(
    userRows,
  );
  await page.locator("#program-mode").selectOption("source");
  await expect(page.locator('[data-section="user"] pre')).toHaveText(
    "li t2,42\n",
  );
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await page.locator("#program-mode").selectOption("instructions");
  await expect(page.locator("#machine-note")).toContainText(
    "Last successful build",
  );
  await expect(page.locator("#t2-decimal")).toHaveText("42");
});

test("pinned and changed register filters retain their comparison when readings change", async ({
  page,
}) => {
  await go(page);
  await page.locator("#step").click();
  await paused(page);
  await page.locator("#step").click();
  await paused(page);
  await inspect(page);
  await page.locator("#register-filter").selectOption("changed");
  await expect(
    page.locator('#registers .register[data-register="t0"]'),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pin t0", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Unpin t0", exact: true }),
  ).toBeFocused();
  await page.locator("#reading").selectOption("unsigned");
  await expect(
    page.locator('#registers .register[data-register="t0"]'),
  ).toBeVisible();
  await page.locator("#register-filter").selectOption("pinned");
  await expect(
    page.locator('#registers .register[data-register="t0"]'),
  ).toBeVisible();
  await expect(
    page.locator('#registers .register[data-register="t2"]'),
  ).toBeVisible();
  await page.getByRole("button", { name: "Unpin t0", exact: true }).click();
  await expect(page.locator("#register-filter")).toBeFocused();
  await expect(
    page.locator('#registers .register[data-register="t0"]'),
  ).not.toBeVisible();
  await page.locator("#register-filter").selectOption("all");
  await expect(page.locator("#registers .register:visible")).toHaveCount(32);
  await page.locator("#stop").click();
});

test("stepping to a distant source line scrolls only the editor", async ({
  page,
}) => {
  await go(page);
  await fillSource(
    page,
    "j last\n" + "addi t0,t0,1\n".repeat(70) + "last:\naddi t1,t1,1\n",
  );
  await page.evaluate(() => scrollTo(0, 0));
  const initial = await page.evaluate(() => scrollY);
  await page.locator("#step").click();
  await paused(page);
  expect(await page.evaluate(() => scrollY)).toBe(initial);
  await page.locator("#step").click();
  await paused(page);
  await expect
    .poll(() => page.locator(".cm-scroller").evaluate((el) => el.scrollTop))
    .toBeGreaterThan(100);
  expect(await page.evaluate(() => scrollY)).toBe(initial);
  await expect(page.locator("#step-location")).toContainText("source line 73");
  await page.locator("#stop").click();
});

test("modal fullscreen keeps the program's inner scroll position", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(document, "fullscreenEnabled", {
      configurable: true,
      value: false,
    }),
  );
  await go(page);
  await page.locator("#workspace-program").click();
  await page.locator('[data-section="setup"] > summary').click();
  await page.locator("#program-source-view").evaluate((el) => {
    el.scrollTop = 150;
  });
  expect(
    await page.locator("#program-source-view").evaluate((el) => el.scrollTop),
  ).toBe(150);
  await page.locator("#fullscreen-workspace").click();
  await expect(page.locator(".workbench-dialog")).toBeVisible();
  await expect
    .poll(() =>
      page.locator("#program-source-view").evaluate((el) => el.scrollTop),
    )
    .toBe(150);
  await page.keyboard.press("Escape");
  await expect(page.locator(".workbench-dialog")).not.toBeVisible();
  await expect
    .poll(() =>
      page.locator("#program-source-view").evaluate((el) => el.scrollTop),
    )
    .toBe(150);
});

test("C and complete programs show the correct source without invented mappings", async ({
  page,
}) => {
  await go(page);
  for (const id of ["c-return-values", "hello-world"]) {
    await page.locator(".project-examples > summary").click();
    await page.locator("#project-example").selectOption("example-" + id);
    await page.locator("#open-example").click();
    const source = await page.locator("#source").inputValue();
    await page.locator("#workspace-program").click();
    await page.locator("#program-mode").selectOption("source");
    if (id === "c-return-values") {
      await expect(page.locator("#program-view-note")).toContainText(
        "separate source files",
      );
      await expect(
        page.locator("#program-sections > section").first().locator("pre"),
      ).toHaveText(source);
      await expect(page.locator('[data-section="caller"] pre')).toHaveText(
        "    call lesson\n",
      );
    } else {
      await expect(page.locator("#program-sections details")).toHaveCount(0);
      await expect(page.locator('[data-section="user"] pre')).toHaveText(
        source,
      );
    }
    await page.locator("#run").click();
    await expect(page.locator("#state-badge")).toHaveText("Finished", {
      timeout: 45000,
    });
    await page.locator("#program-mode").selectOption("instructions");
    await expect(page.locator(".machine-instruction").first()).toBeVisible();
    if (id === "c-return-values") {
      await expect(page.locator("#machine-c-note")).toBeVisible();
      await expect(
        page.locator(".machine-source-line").filter({ hasText: /Source line/ }),
      ).toHaveCount(0);
    }
  }
});

test("workspace keyboard tabs and fullscreen retain view state in both themes", async ({
  page,
}) => {
  await go(page);
  for (const theme of ["light", "dark"]) {
    await page.locator("#theme").selectOption(theme);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.locator("#workspace-code").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#workspace-program")).toBeFocused();
    await expect(page.locator("#workspace-program")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.locator("#fullscreen-workspace").click();
    await expect(page.locator("#workspace-program-panel")).toBeVisible();
    await expect(page.locator("#program-sections")).toContainText("_start:");
    await page.locator("#fullscreen-workspace").click();
    await expect(page.locator("#workspace-program")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
