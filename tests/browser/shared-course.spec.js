// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
let server, base;
test.beforeAll(async () => {
  const root = path.resolve(".build/site");
  server = http.createServer(async (req, res) => {
    try {
      let name = new URL(req.url, "http://local").pathname;
      if (name.endsWith("/")) name += "index.html";
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
      res.end(await fs.readFile(path.join(root, name)));
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = "http://127.0.0.1:" + server.address().port;
});
test.afterAll(async () => {
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
});
test("header tools, explicit runner preparation, saved work and complete fresh-tab offline execution", async ({
  page,
  context,
}) => {
  test.setTimeout(240000);
  const errors = [],
    wasm = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (r.url().endsWith(".wasm")) wasm.push(r.url());
  });
  await page.goto(base + "/lessons/addition/");
  await expect(page.locator("#run")).toBeEnabled();
  await expect(page.locator("#app-status-open")).toBeVisible();
  await expect(page.locator("#open-calculator")).toBeEnabled();
  await expect(page.locator("#open-reference")).toBeEnabled();
  expect(wasm).toEqual([]);
  await page.locator("#run").click();
  await expect(page.locator("#runner-intro")).toBeVisible();
  expect(
    await page.locator("#runner-intro").evaluate((n) => n.matches(":modal")),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator("#run")).toBeEnabled();
  expect(wasm).toEqual([]);
  await page.locator("#open-calculator").click();
  await expect(page.locator("#calculator-dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator("#open-reference").click();
  await expect(page.locator("#instruction-reference")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator("#code-runner-open").click();
  await page.locator("#code-runner-dialog [data-start]").click();
  await expect(page.locator("#runner-summary")).toHaveText("Ready", {
    timeout: 120000,
  });
  await page.locator("#runner-idle").selectOption("60");
  await page.locator("#code-runner-dialog [data-close]").click();
  await page.locator("#prediction").fill("42");
  await page
    .locator("#source-editor .cm-content")
    .fill("li t0,19\nli t1,23\nadd t2,t0,t1");
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 60000,
  });
  await expect(page.locator("#t2-decimal")).toHaveText("42");
  await expect(page.locator("#runner-intro")).toBeHidden();
  await page.locator("#lesson-complete").check();
  const loaded = wasm.length;
  await page.evaluate(async () => {
    await (
      await import(
        document.querySelector("meta[name=gpu-base]").content +
          "releases/" +
          document.querySelector("meta[name=gpu-release]").content +
          "/experiment-state.mjs"
      )
    ).saveReadingState();
  });
  await page.reload();
  await expect(page.locator("#t2-decimal")).toHaveText("42");
  await expect(page.locator("#prediction")).toHaveValue("42");
  await expect(page.locator("#lesson-complete")).toBeChecked();
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 60000,
  });
  expect(wasm.length).toBe(loaded);
  await page.locator("#code-runner-open").click();
  await page.locator("#code-runner-dialog [data-stop]").click();
  await expect(page.locator("#runner-summary")).toHaveText("Stopped");
  await page.locator("#code-runner-dialog [data-close]").click();
  await expect(page.locator("#t2-decimal")).toHaveText("42");
  await page.locator("#app-status-open").click();
  await expect(page.locator("#download-update")).toHaveText(
    "Save offline copy",
  );
  await page.locator("#download-update").click();
  await expect(page.locator("#version-status")).toContainText(
    "Downloaded and ready",
    { timeout: 120000 },
  );
  await page.locator("#app-status-close").click();
  await context.setOffline(true);
  const plane = await context.newPage();
  await plane.goto(base + "/lessons/constants-and-inputs/");
  await expect(plane.locator("#run")).toBeEnabled();
  await plane.locator("#run").click();
  await expect(plane.locator("#state-badge")).toHaveText("Finished", {
    timeout: 60000,
  });
  await expect(plane.locator("#open-calculator")).toBeEnabled();
  await plane.locator("#open-reference").click();
  await expect(plane.locator("#instruction-reference")).toBeVisible();
  await plane.keyboard.press("Escape");
  await plane.close();
  await context.setOffline(false);
  for (const width of [390, 820, 1440])
    for (const theme of ["light", "dark"]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator("#theme").selectOption(theme);
      if (
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        )
      ) {
        console.log(
          "OVERFLOW",
          width,
          theme,
          await page.evaluate(() =>
            [...document.querySelectorAll("body *")]
              .map((e) => ({
                id: e.id,
                class: String(e.className),
                width: e.getBoundingClientRect().width,
                right: e.getBoundingClientRect().right,
              }))
              .filter((e) => e.width && e.right > innerWidth + 1)
              .slice(0, 12),
          ),
        );
        await page.screenshot({
          path: ".artifacts/shared-overflow-" + width + ".png",
          fullPage: true,
        });
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        `${width} ${theme}`,
      ).toBe(false);
    }
  expect(errors).toEqual([]);
});

test("standalone Hello World reuses prepared tools, runs edited source and restores its observed output", async ({
  page,
  context,
}) => {
  test.setTimeout(120000);
  await context.addInitScript(() =>
    localStorage.setItem("riscv-assembly-lab:runner-intro:1", "1"),
  );
  await page.goto(base + "/lessons/hello-world/");
  await expect(page.locator("#run")).toBeEnabled();
  await expect(page.locator("#app-status-open")).toBeVisible();
  await expect(page.locator("#code-runner-open")).toBeVisible();
  const source = (await page.locator("#source").inputValue()).replace(
    "Hello, RISC-V!",
    "Hello, learner!",
  );
  await page.locator(".hello-editor .cm-content").fill(source);
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 60000,
  });
  await expect(page.locator("#console")).toContainText("Hello, learner!");
  await page.evaluate(async () => {
    const base = new URL(
        document.querySelector("meta[name=gpu-base]").content,
        location.href,
      ),
      release = document.querySelector("meta[name=gpu-release]").content;
    await (
      await import(
        new URL("releases/" + release + "/experiment-state.mjs", base)
      )
    ).saveReadingState();
  });
  await page.reload();
  await expect(page.locator("#source")).toHaveValue(source);
  await expect(page.locator("#console")).toContainText("Hello, learner!");
  await expect(page.locator("#run-status")).toContainText(
    "Earlier result restored",
  );
});
