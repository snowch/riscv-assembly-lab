// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import { fillSource, openTools } from "./editor-helpers.js";

const miniature = page => page.locator("#counter-wrap");
const bits = page => miniature(page).locator("[data-counter-retained]");
const advance = page => miniature(page).getByRole("button", {name: "Advance one tick"});
const saved = page => page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([key]) => !key.startsWith("riscv-counter-wrap-v1:"))));

for (const id of ["addition-wraps"]) {
  test(`${id}: four-bit model is bounded, accessible and independent of native state and drafts`, async ({page}, info) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`/lessons/${id}/`);
    await expect(page.locator("#run")).toBeEnabled();
    const source = await page.locator("#source").inputValue();
    await fillSource(page, source + "\n# saved counter experiment");
    await page.locator("#prediction").fill("123");
    const before = await saved(page);
    await expect(miniature(page).locator("[data-counter-initial]")).toContainText("Starting reading: 14.");
    await expect(miniature(page)).toContainText("4-bit teaching model");
    await expect(miniature(page)).toContainText("64-bit registers");
    await expect(miniature(page).locator(".counter-bits, .counter-readings")).toHaveCount(0);
    await expect(miniature(page)).not.toContainText("Last tick");
    await expect(miniature(page)).toContainText("RISC-V has no carry or signed-overflow flag");
    await expect(miniature(page).locator(".counter-addition")).toBeHidden();
    await expect(miniature(page).locator(".counter-elapsed")).toHaveCount(0);
    await advance(page).focus();
    await page.keyboard.press("Enter");
    await expect(bits(page)).toHaveText("1111");
    await expect(miniature(page).locator("[data-counter-addition]")).toHaveText("14 + 1 = 15");
    await expect(miniature(page).locator("[data-counter-operands]")).toHaveText("1110 + 0001 =");
    await expect(miniature(page).locator("[data-counter-carry]")).toHaveText("0");
    await page.keyboard.press("Space");
    await expect(bits(page)).toHaveText("0000");
    await expect(miniature(page).locator("[data-counter-addition]")).toHaveText("15 + 1 = 16");
    await expect(miniature(page).locator("[data-counter-carry]")).toHaveText("1");
    await expect(miniature(page).locator("[data-counter-wrap-explanation]")).toContainText("unsigned wrap");
    await expect(page.locator("#t2-decimal")).toHaveText("—");
    for (const theme of ["light", "dark"]) {
      await page.locator("#theme").selectOption(theme);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await miniature(page).screenshot({path: `.artifacts/counter-${id}-${info.project.name}-${theme}.png`});
    }
    await advance(page).focus();
    await page.keyboard.press("Enter");
    await expect(bits(page)).toHaveText("0001");
    await expect(miniature(page).locator("[data-counter-trace]")).toHaveCount(0);
    await expect(advance(page)).toBeDisabled();
    await expect(miniature(page).locator("[data-counter-limit]")).toContainText("Choose Reset");
    await expect(miniature(page).getByRole("button", {name: "Reset", exact: true})).toBeFocused();
    await expect(miniature(page).locator("[data-counter-addition]")).toHaveText("0 + 1 = 1");
    await expect(miniature(page).locator(".counter-elapsed")).toHaveCount(0);
    await expect(page.locator("#source")).toHaveValue(source + "\n# saved counter experiment");
    // Theme is intentionally changed; no model action writes any learner state.
    const after = await saved(page);
    delete before["riscv-assembly-lab:theme"]; delete after["riscv-assembly-lab:theme"];
    expect(after).toEqual(before);
    await expect(page.locator("#prediction")).toHaveValue("123");
    await page.reload();
    await expect(bits(page)).toHaveText("0001");
    await expect(page.locator("#source")).toHaveValue(source + "\n# saved counter experiment");
    await miniature(page).getByRole("button", {name: "Reset", exact: true}).click();
    await expect(miniature(page).locator("[data-counter-initial]")).toContainText("Starting reading: 14.");
    await expect(miniature(page).locator(".counter-addition")).toBeHidden();
    await expect(miniature(page).locator(".counter-elapsed")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("native execution and project copies keep their own context while miniature state survives", async ({page}) => {
  test.setTimeout(120000);
  await page.goto("/lessons/addition-wraps/");
  await expect(page.locator("#run")).toBeEnabled();
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {timeout: 45000});
  await expect(page.locator("#t2-decimal")).toHaveText("3");
  await advance(page).click();
  await expect(page.locator("#t2-decimal")).toHaveText("3");
  await fillSource(page, "li t0, 40\nli t1, 53\nadd t2, t0, t1");
  await page.locator("#run").click();
  await expect(page.locator("#t2-decimal")).toHaveText("93", {timeout: 45000});
  await expect(bits(page)).toHaveText("1111");
  await openTools(page, "projects");
  await page.locator(".project-actions > summary").click();
  await page.locator("#copy-project").click();
  await expect(miniature(page)).toBeHidden();
  await page.locator("#return-lesson").click();
  await expect(miniature(page)).toBeVisible();
  await expect(bits(page)).toHaveText("1111");
  await expect(page.locator("#source")).toHaveValue("li t0, 40\nli t1, 53\nadd t2, t0, t1");
});

test("corrupt model storage and blocked storage remain usable at 320px", async ({page}) => {
  await page.addInitScript(() => localStorage.setItem("riscv-counter-wrap-v1:addition-wraps", "99"));
  await page.goto("/lessons/addition-wraps/");
  await expect(miniature(page).locator("[data-counter-initial]")).toContainText("Starting reading: 14.");
  await page.setViewportSize({width: 320, height: 800});
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error("blocked"); }; });
  await advance(page).click();
  await expect(bits(page)).toHaveText("1111");
  await advance(page).click();
  await expect(bits(page)).toHaveText("0000");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const box of await miniature(page).getByRole("button").evaluateAll(nodes => nodes.map(el => ({width: el.offsetWidth, height:el.offsetHeight})))) expect(box.height).toBeGreaterThanOrEqual(44);
});
