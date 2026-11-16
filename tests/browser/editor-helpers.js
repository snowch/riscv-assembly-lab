// Copyright © 2026 Christopher Snow
import { expect } from "@playwright/test";

// Edit the visible CodeMirror surface. The original textarea is only a
// progressive-enhancement fallback and a reflection of the actual document.
export async function fillSource(page, value) {
  await page.locator(".source-code-editor .cm-content").fill(value);
  await expect(page.locator("#source")).toHaveValue(value);
}

export async function selectedSource(page) {
  return page.evaluate(() => window.getSelection()?.toString() ?? "");
}

export async function loadExercise(page) {
  const exercise = page.locator("#challenge");
  if (!(await exercise.evaluate((el) => el.open))) {
    await exercise.locator(":scope > summary").click();
  }
  await page.locator("#start-challenge").click();
  await expect(page.locator("#editor-context")).toHaveText("Exercise");
}

export async function returnToExample(page) {
  await page.locator("#return-example").click();
  await expect(page.locator("#editor-context")).toHaveText("Example");
}
