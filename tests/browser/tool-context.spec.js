// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import { fillSource } from "./editor-helpers.js";
const go = async (page) => {
  await page.goto("/playground/");
  await expect(page.locator("#run")).toBeEnabled();
};
const paused = (page) =>
  expect(page.locator("#state-badge")).toHaveText("Paused", { timeout: 45000 });

test("execution context names the interval and opens real supplied sections", async ({
  page,
}) => {
  await go(page);
  await expect(page.locator("#execution-interval")).toContainText(
    "Supplied setup prepares inputs",
  );
  await expect(page.locator("#open-complete-guide")).toBeVisible();
  const scroll = await page.evaluate(() => scrollY);
  await page.locator("#execution-route button").first().click();
  await expect(page.locator("#workspace-program")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator('[data-section="setup"]')).toHaveJSProperty(
    "open",
    true,
  );
  await expect(page.locator('[data-section="setup"] pre')).toContainText(
    "li t0, 0",
  );
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  await page.locator("#execution-route button").nth(2).click();
  await expect(page.locator('[data-section="report"]')).toHaveJSProperty(
    "open",
    true,
  );
  await expect(page.locator('[data-section="report"] pre')).toContainText(
    "ecall",
  );
  const all = await page
    .locator("#program-sections [data-program-source]")
    .allTextContents();
  expect(all.join("")).toBe(
    await page.locator("#complete-source").textContent(),
  );
});

test("helper execution offers a named PC recovery without changing scope automatically", async ({
  page,
}) => {
  test.setTimeout(120000);
  await go(page);
  await page.locator(".project-examples > summary").click();
  await page
    .locator("#project-example")
    .selectOption("example-c-return-values");
  await page.locator("#open-example").click();
  await fillSource(
    page,
    "long helper(long a){return a+3;}\nlong lesson(long a,long b){return helper(a)+b;}\n",
  );
  await page.locator("#step").click();
  await paused(page);
  await page.locator("#workspace-program").click();
  await page.locator("#program-mode").selectOption("instructions");
  for (
    let i = 0;
    i < 30 && !(await page.locator("#machine-outside").isVisible());
    i++
  ) {
    await page.locator("#step").click();
    await paused(page);
  }
  await expect(page.locator("#machine-outside-note")).toContainText("helper");
  await expect(page.locator("#machine-scope")).toHaveValue("user");
  await expect(page.locator("#machine-jump")).toBeDisabled();
  await page.locator("#machine-show-current").click();
  await expect(page.locator("#machine-scope")).toHaveValue("all");
  await expect(
    page.locator('.machine-instruction[aria-current="step"]'),
  ).toHaveCount(1);
  await expect(page.locator("#machine-jump")).toBeEnabled();
  await expect(page.locator("#machine-outside")).not.toBeVisible();
  await expect(
    page
      .locator(".machine-source-line")
      .filter({ hasText: "Supplied source line" })
      .first(),
  ).toBeVisible();
  await page.locator("#stop").click();
});

test("phone observation values stay with every workspace view and source changes are explicit", async ({
  page,
}, info) => {
  await go(page);
  await expect(page.locator("#registers .register.pinned")).toHaveCount(3);
  if (info.project.name !== "phone") return;
  await expect(page.locator(".phone-observation")).toBeVisible();
  const first = await page.locator(".cm-line").first().boundingBox();
  expect(first.y).toBeLessThan(720);
  await page.locator("#step").click();
  await paused(page);
  await page.locator("#step").click();
  await paused(page);
  await expect(page.locator("#phone-observation-registers")).toContainText(
    "t07",
  );
  await expect(page.locator("#phone-observation-next")).toContainText(
    "Last paused PC",
  );
  const observed = await page
    .locator("#phone-observation-registers")
    .textContent();
  const pc = await page.locator("#phone-observation-next").textContent();
  for (const tab of ["program", "inspect", "code"]) {
    await page.locator("#workspace-" + tab).click();
    await expect(page.locator("#phone-observation-registers")).toHaveText(
      observed,
    );
    await expect(page.locator("#phone-observation-next")).toHaveText(pc);
  }
  await fillSource(page, "li t2,99\n");
  await expect(page.locator("#phone-observation-moment")).toContainText(
    "earlier build",
  );
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#phone-observation-registers")).toContainText(
    "t299",
  );
  await expect(page.locator("#phone-observation-moment")).toContainText(
    "before supplied reporting",
  );
});

test("calculator keeps the same retained bits across readings and exposes actual width consequences", async ({
  page,
}) => {
  await go(page);
  await page.locator("#open-calculator").click();
  const dialog = await page.locator("#calculator-dialog").boundingBox(),
    action = await page
      .locator("#calculator-form button[type=submit]")
      .boundingBox();
  expect(action.y + action.height).toBeLessThanOrEqual(
    dialog.y + dialog.height,
  );
  await page.locator("#calc-width").selectOption("32");
  await page.locator("#calc-a").fill("0xffffffff");
  await page.locator("#calc-b").fill("1");
  await page.locator("#calculator-form button[type=submit]").click();
  await expect(page.locator("#calc-full-result")).toContainText(
    "4,294,967,296",
  );
  await page.locator("#calc-reading").selectOption("signed");
  await expect(page.locator("#calc-result")).toBeVisible();
  await expect(page.locator("#calc-full-result")).toContainText("(signed): 0");
  await expect(page.locator("#calc-alternate-full-result")).toContainText(
    "4,294,967,296",
  );
  await expect(page.locator("#calc-result-readings")).toContainText(
    "0x0000 0000",
  );
  await expect(page.locator("#calc-status")).toContainText(
    "retained bits are unchanged",
  );
  await page.locator("#calc-a").fill("0x7fffffff");
  await page.locator("#calculator-form button[type=submit]").click();
  await expect(page.locator("#calc-result-readings")).toContainText(
    "-2,147,483,648",
  );
  await expect(page.locator("#calc-result-readings")).toContainText(
    "2,147,483,648",
  );
  await expect(page.locator("#calc-w-result")).toContainText(
    "0xFFFF FFFF 8000 0000",
  );
  await expect(page.locator("#calc-w-result")).toContainText(
    "No CPU instruction was executed",
  );
  await page.locator("#calc-use-result").click();
  await page.locator("#calc-width").selectOption("64");
  await expect(page.locator("#calc-a-readings")).toContainText(
    "0x0000 0000 8000 0000",
  );
  await expect(page.locator("#calc-result")).not.toBeVisible();
  await expect(page.locator("#calc-width-note")).toContainText(
    "does not change the RV64 processor",
  );
});

test("All instructions retain project and supplied source identities", async ({
  page,
}) => {
  await go(page);
  await page.locator("#step").click();
  await paused(page);
  await page.locator("#workspace-program").click();
  await page.locator("#program-mode").selectOption("instructions");
  await expect(
    page
      .locator(".machine-source-line")
      .filter({ hasText: "Project source line 1" }),
  ).toHaveCount(1);
  await page.locator("#machine-scope").selectOption("all");
  await expect(
    page
      .locator(".machine-source-line")
      .filter({ hasText: "Project source line 1" }),
  ).toHaveCount(1);
  expect(
    await page
      .locator(".machine-source-line")
      .filter({ hasText: "Supplied source line" })
      .count(),
  ).toBeGreaterThan(0);
  await page.locator("#stop").click();
});

test("complete-program guide opens independent worked and fresh projects with real breakpoint observations", async ({
  page,
}) => {
  test.setTimeout(120000);
  await go(page);
  await fillSource(page, "li t2,123\n");
  const original = await page.locator("#project-picker").inputValue();
  await page.locator("#open-complete-guide").click();
  await expect(page.locator("#complete-program-guide")).toHaveJSProperty(
    "open",
    true,
  );
  await page.locator("#open-worked-counts").click();
  const source = await page.locator("#source").inputValue();
  const exitLine =
    source.split("\n").findIndex((line) => line.trim() === "ecall") + 1;
  await page
    .getByRole("button", {
      name: `Set breakpoint at source line ${exitLine}`,
      exact: true,
    })
    .click();
  await page.locator("#debug").click();
  await paused(page);
  await expect(page.locator("#s0-decimal")).toHaveText("42");
  await expect(page.locator("#execution-interval")).toContainText(
    "Step starts at _start",
  );
  await page.locator("#continue").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  if (await page.locator("#workspace-inspect").isVisible())
    await page.locator("#workspace-inspect").click();
  await expect(page.locator("#observation-note")).toContainText(
    "not show the exit state",
  );
  await page.locator("#open-complete-guide").click();
  await page.locator("#open-fresh-counts").click();
  await expect(page.locator("#source")).toHaveValue(/\.quad 31, 17/);
  await page.locator("#project-picker").selectOption(original);
  await expect(page.locator("#source")).toHaveValue("li t2,123\n");
});

for (const fallback of [false, true])
  test(`${fallback ? "modal" : "native"} fullscreen opens the guide outside the workspace and preserves the paused machine`, async ({
    page,
  }) => {
    if (fallback)
      await page.addInitScript(() =>
        Object.defineProperty(document, "fullscreenEnabled", {
          configurable: true,
          value: false,
        }),
      );
    await go(page);
    await page.locator("#step").click();
    await paused(page);
    const pc = await page.locator("#step-location").textContent();
    await page.locator("#fullscreen-workspace").click();
    await expect(page.locator(".workbench-dialog")).toBeVisible();
    await page.locator("#open-complete-guide").click();
    await expect(page.locator(".workbench-dialog")).not.toBeVisible();
    expect(await page.evaluate(() => document.fullscreenElement)).toBe(null);
    await expect(page.locator("#complete-program-guide")).toHaveJSProperty(
      "open",
      true,
    );
    await expect(
      page.locator("#complete-program-guide > summary"),
    ).toBeFocused();
    await expect(page.locator("#step-location")).toHaveText(pc);
    await paused(page);
    await page.locator("#stop").click();
  });

test("the observation strip labels high-bit readings without advancing the CPU", async ({
  page,
}) => {
  await go(page);
  await fillSource(page, "li t0,-1\naddi t1,t0,1\n");
  await page.locator("#step").click();
  await paused(page);
  await page.locator("#step").click();
  await paused(page);
  await expect(page.locator("#phone-observation-reading")).toHaveText(
    "Signed reading",
  );
  await expect(page.locator("#phone-observation-registers")).toContainText(
    "-1",
  );
  const pc = await page.locator("#step-location").textContent();
  if (await page.locator("#workspace-inspect").isVisible())
    await page.locator("#workspace-inspect").click();
  await page.locator("#reading").selectOption("unsigned");
  await page.locator("#workspace-code").click();
  await expect(page.locator("#phone-observation-reading")).toHaveText(
    "Unsigned reading",
  );
  await expect(page.locator("#phone-observation-registers")).toContainText(
    "18446744073709551615",
  );
  await expect(page.locator("#step-location")).toHaveText(pc);
  await expect(page.locator("#phone-observation-next")).toContainText(
    "Next: addi",
  );
  await page.locator("#stop").click();
});

test("raw programs without a pause request debugging and never imply exit registers", async ({
  page,
}) => {
  await go(page);
  await page.locator(".project-examples > summary").click();
  await page
    .locator("#project-example")
    .selectOption("example-complete-counts");
  await page.locator("#open-example").click();
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#phone-observation-moment")).toContainText(
    "Start stepping or Start debugging",
  );
  await expect(page.locator("#phone-observation-registers")).toContainText("—");
  await page.locator("#step").click();
  await paused(page);
  await page.locator("#continue").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#phone-observation-moment")).toContainText(
    "not exit register values",
  );
});
