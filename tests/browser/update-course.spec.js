// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { buildOffline } from "../../tools/offline.mjs";
let dir,
  server,
  base,
  current,
  a,
  b,
  unavailable = false;
test.beforeAll(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "riscv-update-"));
  const fixture = async (label) => {
    const root = path.join(dir, label);
    await fs.cp("site", root, { recursive: true });
    const home = path.join(root, "index.html");
    await fs.writeFile(
      home,
      (await fs.readFile(home, "utf8")).replace(
        "</head>",
        `<!-- release ${label} --></head>`,
      ),
    );
    return {
      root,
      release: await buildOffline(root, {
        commit: label.repeat(40),
        date: "2026-11-23",
      }),
    };
  };
  a = await fixture("a");
  b = await fixture("b");
  await fs.cp(
    path.join(a.root, "releases", a.release.id),
    path.join(b.root, "releases", a.release.id),
    { recursive: true },
  );
  current = a.root;
  server = http.createServer(async (req, res) => {
    try {
      let name = new URL(req.url, "http://local").pathname;
      if (name.endsWith("/")) name += "index.html";
      if (unavailable && name.endsWith("/as-new.wasm")) {
        res.writeHead(503);
        res.end("temporarily unavailable");
        return;
      }
      res.setHeader(
        "Content-Type",
        {
          ".html": "text/html",
          ".js": "text/javascript",
          ".mjs": "text/javascript",
          ".json": "application/json",
          ".css": "text/css",
          ".svg": "image/svg+xml",
          ".wasm": "application/wasm",
        }[path.extname(name)] || "application/octet-stream",
      );
      res.end(await fs.readFile(path.join(current, name)));
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = "http://127.0.0.1:" + server.address().port;
});
test.afterAll(async () => {
  server?.closeAllConnections();
  if (server) await new Promise((r) => server.close(r));
  await fs.rm(dir, { recursive: true, force: true });
});
test("two-window update preserves real results and independent drafts, vetoes failed saving, and runs offline after restart", async ({
  page,
  context,
}) => {
  test.setTimeout(240000);
  await context.addInitScript(() =>
    localStorage.setItem("riscv-assembly-lab:runner-intro:1", "1"),
  );
  await page.goto(base + "/lessons/addition/");
  await expect(page.locator("#run")).toBeEnabled();
  await page
    .locator("#source-editor .cm-content")
    .fill("li t0,19\nli t1,23\nadd t2,t0,t1");
  await page.locator("#prediction").fill("42");
  await page.locator("#lesson-complete").check();
  const other = await context.newPage();
  await other.goto(base + "/lessons/constants-and-inputs/");
  await expect(other.locator("#run")).toBeEnabled();
  const otherCode =
    (await other.locator("#source").inputValue()) + "\n# independent draft";
  await other.locator("#source-editor .cm-content").fill(otherCode);
  await other.locator("#prediction").fill("Other prediction");
  await page.locator("#app-status-open").click();
  await page.locator("#download-update").click();
  await expect(page.locator("#version-status")).toContainText(
    "Downloaded and ready",
    { timeout: 120000 },
  );
  await page.locator("#app-status-close").click();
  current = b.root;
  await page.locator("#run").click();
  await expect(page.locator("#t2-decimal")).toHaveText("42", {
    timeout: 60000,
  });
  await page.locator("#app-status-open").click();
  await page.locator("#app-status-details").evaluate((el) => (el.open = true));
  await page.locator("#check-update").click();
  await expect(page.locator("#download-update")).toHaveText(
    "Update offline copy",
  );
  await page.locator("#download-update").click();
  await expect(page.locator("#restart-update")).toBeVisible({
    timeout: 120000,
  });
  await other.evaluate(() => {
    window.storageSet = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw Error("storage blocked");
    };
  });
  await page.locator("#restart-update").click();
  await expect(page.locator("#app-status-error")).not.toBeEmpty({
    timeout: 30000,
  });
  await expect(page.locator('meta[name="gpu-release"]')).toHaveAttribute(
    "content",
    a.release.id,
  );
  await other.evaluate(() => (Storage.prototype.setItem = window.storageSet));
  await page.locator("#restart-update").click();
  for (const tab of [page, other])
    await expect(tab.locator('meta[name="gpu-release"]')).toHaveAttribute(
      "content",
      b.release.id,
      { timeout: 60000 },
    );
  await expect(page.locator("#prediction")).toHaveValue("42");
  await expect(page.locator("#t2-decimal")).toHaveText("42");
  await expect(page.locator("#lesson-complete")).toBeChecked();
  await expect(other.locator("#source")).toHaveValue(otherCode);
  await expect(other.locator("#prediction")).toHaveValue("Other prediction");
  const port = server.address().port;
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  try {
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator("#run")).toBeEnabled();
    await page.locator("#run").click();
    await expect(page.locator("#t2-decimal")).toHaveText("42", {
      timeout: 60000,
    });
    await other.close();
  } finally {
    await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
    await context.setOffline(false);
  }
});
test("missing runtime has persistent recovery, retains source and restores keyboard focus", async ({
  page,
}) => {
  test.setTimeout(90000);
  current = a.root;
  await page.addInitScript(() =>
    localStorage.setItem("riscv-assembly-lab:runner-intro:1", "1"),
  );
  unavailable = true;
  await page.goto(base + "/lessons/addition/");
  await expect(page.locator("#run")).toBeEnabled();
  const source =
    (await page.locator("#source").inputValue()) +
    "\n# retained after failed download";
  await page.locator("#source-editor .cm-content").fill(source);
  await page.locator("#run").click();
  await expect(page.locator("#runtime-recovery-dialog")).toBeVisible({
    timeout: 60000,
  });
  await expect(page.locator("#source")).toHaveValue(source);
  await page.evaluate(() => {
    indexedDB.open = () => {
      throw new DOMException("Storage unavailable", "SecurityError");
    };
  });
  const before = page.url();
  await page.locator("[data-runtime-reload]").click();
  await expect(page.locator("#runtime-recovery-dialog-error")).toBeVisible();
  expect(page.url()).toBe(before);
  await expect(page.locator("#source")).toHaveValue(source);
  await page.keyboard.press("Escape");
  await expect(page.locator("#runtime-recovery-dialog")).toBeHidden();
  await expect(page.locator("#run")).toBeFocused();
});
