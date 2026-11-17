// Copyright © 2026 Christopher Snow
import { fillSource, selectedSource, openTools } from "./editor-helpers.js";
import { test, expect } from "@playwright/test";
const go = async (page, id = "addition") => {
  await page.goto("/lessons/" + id + "/");
  await expect(page.locator("#run")).toBeEnabled();
  await openTools(page, "debugger");
};
const pause = (page) =>
  expect(page.locator("#state-badge")).toHaveText("Paused", { timeout: 45000 });
const pin = async (page, name) => {
  await page.locator("#debug-register").selectOption(name);
  await page.locator("#debug-pin-register").click();
};

test("source breakpoints stop before execution and Continue reaches successive loop iterations", async ({
  page,
}) => {
  test.setTimeout(90000);
  await go(page);
  await fillSource(
    page,
    "li t0,0\nli t1,3\nloop:\naddi t0,t0,1\nbltu t0,t1,loop",
  );
  await page
    .getByRole("button", {
      name: "Set breakpoint at source line 4",
      exact: true,
    })
    .click();
  await pin(page, "t0");
  await page.locator("#debug").click();
  await pause(page);
  await expect(page.locator("#t0-decimal")).toHaveText("0");
  await expect(page.locator("#run-status")).toContainText("Breakpoint reached");
  for (const value of ["1", "2"]) {
    await page.locator("#continue").click();
    await expect(page.locator("#t0-decimal")).toHaveText(value);
    await pause(page);
    await expect(page.locator("#debug-register-watches")).toContainText(
      "Changed from",
    );
  }
  await page.locator("#continue").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#t0-decimal")).toHaveText("3");
  await fillSource(page, "li t0,7\nli t1,5\nadd t2,t0,t1");
  for (const line of [1, 2, 3])
    await page
      .getByRole("button", {
        name: `Set breakpoint at source line ${line}`,
        exact: true,
      })
      .click();
  await page.locator("#debug").click();
  await pause(page);
  await page.locator("#continue").click();
  await expect(page.locator("#t0-decimal")).toHaveText("7");
  await pause(page);
  await expect(page.locator("#t1-decimal")).toHaveText("0");
  await page.locator("#continue").click();
  await expect(page.locator("#t1-decimal")).toHaveText("5");
  await pause(page);
  await expect(page.locator("#t2-decimal")).toHaveText("0");
  await page.locator("#continue").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#t2-decimal")).toHaveText("12");
});

test("adding a paused memory watch observes real bytes without advancing and stack return slots match", async ({
  page,
}) => {
  test.setTimeout(90000);
  await go(page, "preserving-return-address");
  await fillSource(
    page,
    "la ra,done\naddi sp,sp,-16\nsd ra,8(sp)\nli t0,42\nsb t0,0(sp)\nld t1,8(sp)\naddi sp,sp,16\ndone:",
  );
  await page
    .getByRole("button", {
      name: "Set breakpoint at source line 6",
      exact: true,
    })
    .click();
  await page.locator("#debug").click();
  await pause(page);
  const pc = await page.locator("#step-location").textContent();
  await page.locator("#debug-memory-base").selectOption("sp");
  await page.locator("#debug-memory-width").selectOption("1");
  await page.locator("#debug-memory-add").click();
  await expect(page.locator("#debug-memory-watches")).toContainText(
    "unsigned 42",
  );
  await expect(page.locator("#step-location")).toHaveText(pc);
  await openTools(page, "stack");
  await expect(page.locator("#debug-stack tbody tr")).toHaveCount(8);
  await expect(page.locator("#debug-stack tbody tr").nth(1)).toContainText(
    "done",
  );
  await openTools(page, "debugger");
  await page.locator("#debug-memory-base").selectOption("zero");
  await page.locator("#debug-memory-offset").fill("-8");
  await page.locator("#debug-memory-add").click();
  await expect(page.locator("#debug-memory-watches")).toContainText(
    "not readable",
  );
  await page.locator("#continue").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#debug-stack tbody tr")).toHaveCount(8);
  await fillSource(page, "wrong_instruction");
  await expect(page.locator("#debug-register-watches")).toContainText(
    "No observation",
  );
  await expect(page.locator("#debug-breakpoints li")).toHaveCount(0);
});

test("C breakpoints use actual instruction addresses and source edits stop a paused machine", async ({
  page,
}) => {
  await go(page, "c-return-values");
  await page.locator("#debug").click();
  await pause(page);
  await expect(page.locator("#debug-breakpoint-help")).toContainText(
    "does not supply C source-line mappings",
  );
  await expect(page.locator("#debug-line")).toHaveCount(0);
  await page.locator("#debug-disassembly > summary").click();
  const instructions = page.locator("#debug-instructions button");
  expect(await instructions.count()).toBeGreaterThan(1);
  const target = await instructions.nth(1).getAttribute("data-address");
  await instructions.nth(1).focus();
  await page.keyboard.press("Enter");
  await expect(instructions.nth(1)).toBeFocused();
  await page.locator("#continue").click();
  await expect(page.locator("#step-location")).toContainText(target);
  await pause(page);
  await fillSource(page, "long lesson(long a,long b){return a-b;}");
  await expect(page.locator("#state-badge")).toHaveText("Stopped");
  await expect(page.locator("#debug-breakpoints li")).toHaveCount(0);
  await expect(page.locator("#debug-instructions")).toContainText(
    "Build or start stepping",
  );
});
