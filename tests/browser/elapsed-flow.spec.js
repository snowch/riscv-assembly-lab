// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import { fillSource } from "./editor-helpers.js";

test("elapsed time keeps the native subtraction and its readings together", async ({page}) => {
  test.setTimeout(120000);
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/lessons/elapsed-time/");
  await expect(page.locator("#counter-wrap")).toHaveCount(0);
  await expect(page.locator(".lesson-guide")).toContainText("low 64 bits of now minus then");
  await expect(page.locator(".lesson-guide")).toContainText("fewer than one full 64-bit turn");
  await expect(page.locator(".lesson-explanation")).not.toContainText("4-bit teaching model");
  await expect(page.locator(".lesson-explanation")).toContainText("counter and the subtraction use the same width");
  await page.locator("#run").click();
  await expect(page.locator("#t2-decimal")).toHaveText("16",{timeout:45000});
  await fillSource(page,"li t1, 40\nli t0, 53\nsub t2, t0, t1");
  await page.locator("#run").click();
  await expect(page.locator("#t2-decimal")).toHaveText("13",{timeout:45000});
  await fillSource(page,"li t1, 40\nli t0, 40\nsub t2, t0, t1");
  await page.locator("#run").click();
  await expect(page.locator("#t2-decimal")).toHaveText("0",{timeout:45000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
