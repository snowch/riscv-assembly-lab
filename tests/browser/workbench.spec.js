import { fillSource, selectedSource } from "./editor-helpers.js";
import { test, expect } from "@playwright/test";

test("Hello World can undo restoring the starter after reload", async ({
  page,
}) => {
  await page.goto("/lessons/hello-world/");
  await expect(page.locator("#run")).toBeEnabled();
  const starter = await page.locator("#source").inputValue();
  const edited = starter.replace("Hello, RISC-V!", "Trip ready!");
  await fillSource(page, edited);
  await page.locator("#restore").press("Enter");
  await expect(page.locator("#source")).toHaveValue(starter);
  await page.reload();
  await page
    .getByRole("button", { name: "Undo restore", exact: true })
    .press("Enter");
  await expect(page.locator("#source")).toHaveValue(edited);
  await page.reload();
  await expect(page.locator("#source")).toHaveValue(edited);
});

test("real build, edited output, diagnostics, draft and recovery", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/lessons/hello-world/");
  await expect(page.locator("#run")).toBeEnabled();
  await expect(page.locator("#run")).toBeInViewport();
  const starter = await page.locator("#source").inputValue();
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#console")).toHaveText("Hello, RISC-V!\n");
  const edited = starter.replace("Hello, RISC-V!", "It really runs!");
  await fillSource(page, edited);
  await expect(page.locator("#snapshot-note")).toBeVisible();
  await page.locator("#run").click();
  await expect(page.locator("#console")).toHaveText("It really runs!\n", {
    timeout: 45000,
  });
  await expect(page.locator("#state-badge")).toHaveText("Finished");
  await page.reload();
  await expect(page.locator("#source")).toHaveValue(edited);
  await fillSource(
    page,
    ".text\n.global _start\n_start:\n  invalid_instruction a0, 1",
  );
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Error", {
    timeout: 30000,
  });
  await expect(page.locator("#diagnostic-lines")).toContainText(
    "hello.s:4: Error",
  );
  await page.locator(".diagnostic-link").first().click();
  expect(await selectedSource(page)).toContain("invalid_instruction");
  await page.locator("#restore").click();
  await expect(page.locator("#source")).toHaveValue(starter);
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  expect(errors).toEqual([]);
});
test("loop can be stopped, edits remain tied to their build, and layout fits", async ({
  page,
}, info) => {
  await page.goto("/lessons/hello-world/");
  await expect(page.locator("#run")).toBeEnabled();
  await page.locator("#theme").selectOption("dark");
  await fillSource(page, ".text\n.global _start\n_start: j _start");
  await page.locator("#run").click();
  await expect(page.locator("#run-status")).toHaveText(
    "Running your program…",
    { timeout: 45000 },
  );
  await fillSource(
    page,
    ".text\n.global _start\n_start: li a0,0\nli a7,2\necall",
  );
  await expect(page.locator("#snapshot-note")).toBeVisible();
  await page.locator("#stop").click();
  await expect(page.locator("#state-badge")).toHaveText("Stopped");
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#console")).toContainText(
    "without console output",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `.artifacts/${info.project.name}-dark.png`,
    fullPage: true,
  });
  await page.locator("#theme").selectOption("light");
  await page.screenshot({
    path: `.artifacts/${info.project.name}-light.png`,
    fullPage: true,
  });
});

test("CPU traps are reported and unavailable storage keeps editing usable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage denied", "SecurityError");
      },
    });
  });
  await page.goto("/lessons/hello-world/");
  await expect(page.locator("#run")).toBeEnabled();
  await expect(page.locator("#save-state")).toContainText("tab-only");
  await fillSource(page, ".text\n.global _start\n_start: .word 0\n");
  await page.locator("#run").click();
  await page.locator("#runner-intro [data-continue]").click();
  await expect(page.locator("#state-badge")).toHaveText("Error", {
    timeout: 45000,
  });
  await expect(page.locator("#diagnostic-lines")).toContainText("CPU stopped.");
  await expect(page.locator("#runtime-recovery-dialog")).toBeHidden();
  await page.locator("#restore").click();
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
});

test("asset failure preserves the earlier genuine result and edited source, then retries", async ({
  page,
}) => {
  await page.goto("/lessons/hello-world/");
  await expect(page.locator("#run")).toBeEnabled();
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#console")).toHaveText("Hello, RISC-V!\n");
  const edited =
    (await page.locator("#source").inputValue()).replace(
      "Hello, RISC-V!",
      "Recovered edit!",
    ) + "\n# retain this edited source through loader failure\n";
  await fillSource(page, edited);
  let faulted = false;
  // The complete-program linker script is loaded in the execution worker.
  // SharedWorker tool downloads are tested with a real failing host elsewhere.
  await page.route("**/user.ld", (route) => {
    faulted = true;
    return route.fulfill({ status: 503, body: "Unavailable" });
  });
  await page.locator("#run").click();
  await expect(page.locator("#runtime-recovery-dialog")).toBeVisible({
    timeout: 45000,
  });
  expect(faulted).toBe(true);
  await expect(page.locator("#source")).toHaveValue(edited);
  await expect(page.locator("#console")).toHaveText("Hello, RISC-V!\n");
  await expect(page.locator("#state-badge")).toHaveText("Finished");
  await expect(page.locator("#run-status")).toContainText(
    "Earlier result restored",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator("#runtime-recovery-dialog")).toBeHidden();
  await expect(page.locator("#run")).toBeFocused();
  await page.unroute("**/user.ld");
  await page.locator("#run").click();
  await expect(page.locator("#run")).toBeEnabled({ timeout: 45000 });
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#console")).toHaveText("Recovered edit!\n");
  await expect(page.locator("#source")).toHaveValue(edited);
});
