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
