// Copyright © 2026 Christopher Snow
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { buildOffline } from "../tools/offline.mjs";
import { retainLegacyAssets } from "../tools/retain-legacy-assets.mjs";
const hash = (body) => createHash("sha256").update(body).digest("hex");
test("nested lesson assets pin to one release and every recorded byte hash matches", async () => {
  const root = await mkdtemp(join(tmpdir(), "riscv-release-"));
  try {
    await mkdir(root + "/lessons/addition", { recursive: true });
    await mkdir(root + "/course");
    await writeFile(
      root + "/index.html",
      "<html><head></head><body><!-- app-status-control --></body></html>",
    );
    await writeFile(root + "/course/client.js", "export const value=42;");
    await writeFile(root + "/style.css", "body{color:green}");
    await writeFile(
      root + "/lessons/addition/index.html",
      '<html><head><script type="module" src="../../course/client.js"></script><link rel="stylesheet" href="../../style.css"></head><body><!-- app-status-control --><a href="../next/">Next lesson</a></body></html>',
    );
    const release = await buildOffline(root, { commit: null, date: null });
    const html = await readFile(root + "/lessons/addition/index.html", "utf8");
    assert(html.includes("../../releases/" + release.id + "/course/client.js"));
    assert(html.includes("../../releases/" + release.id + "/style.css"));
    assert(html.includes('href="../next/"'));
    assert(!html.includes("releases/" + release.id + "/../../"));
    assert.equal((html.match(/id="app-status-dialog"/g) || []).length, 1);
    for (const file of release.files) {
      const body = await readFile(
        root + "/releases/" + release.id + "/" + file.path,
      );
      assert.equal(body.length, file.bytes, file.path);
      assert.equal(hash(body), file.sha256, file.path);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("initial publication keeps even unchanged older lazy assets; later publication verifies their exact bytes", async () => {
  const root = await mkdtemp(join(tmpdir(), "riscv-legacy-"));
  try {
    const old = new Map([
      ["index.html", "old page"],
      ["course/worker.js", "old worker"],
      ["images/kernel", "kernel bytes"],
    ]);
    const fetcher = async (url) => {
      const body = old.get(new URL(url).pathname.slice(1));
      return new Response(body, { status: body === undefined ? 404 : 200 });
    };
    const release = {
      files: [
        { path: "index.html" },
        { path: "course/worker.js" },
        { path: "images/kernel", sha256: hash("kernel bytes") },
        { path: "new.js" },
      ],
    };
    const assets = await retainLegacyAssets(
      root,
      "https://example.test/",
      release,
      fetcher,
    );
    assert.equal(assets.length, 2);
    assert.equal(
      await readFile(root + "/images/kernel", "utf8"),
      "kernel bytes",
    );
    old.set("release.json", JSON.stringify({ legacyAssets: assets }));
    old.set("course/worker.js", "changed worker");
    await assert.rejects(
      () => retainLegacyAssets(root, "https://example.test/", release, fetcher),
      /failed verification/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
