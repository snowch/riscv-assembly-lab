// Copyright © 2026 Christopher Snow
import { build } from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const output = new URL("site/vendor/editor/", root);
await mkdir(output, { recursive: true });
const result = await build({
  stdin: {
    contents: `
      export { EditorState, StateEffect, StateField, Compartment, Transaction } from "@codemirror/state";
      export { EditorView, keymap, lineNumbers, gutter, GutterMarker, Decoration, drawSelection, highlightActiveLine, highlightSpecialChars } from "@codemirror/view";
      export { defaultKeymap, history, historyKeymap, indentWithTab, undo, redo } from "@codemirror/commands";
      export { search, searchKeymap, openSearchPanel, highlightSelectionMatches } from "@codemirror/search";
      export { StreamLanguage, bracketMatching, indentOnInput, syntaxHighlighting, HighlightStyle, indentUnit } from "@codemirror/language";
      export { cpp } from "@codemirror/lang-cpp";
      export { tags } from "@lezer/highlight";
    `,
    resolveDir: fileURLToPath(root),
    sourcefile: "codemirror-entry.js",
    loader: "js",
  },
  outfile: fileURLToPath(new URL("codemirror.js", output)),
  bundle: true,
  minify: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  legalComments: "none",
  metafile: true,
  write: true,
});

const packages = [
  ...new Set(
    Object.keys(result.metafile.inputs).flatMap((path) => {
      const match = path.match(/node_modules\/((?:@[^/]+\/)?[^/]+)\//);
      return match ? [match[1]] : [];
    }),
  ),
].sort();
let licences =
  "CodeMirror editor dependencies\n\nThe following packages are bundled in codemirror.js.\n";
const versions = {};
for (const name of packages) {
  const base = new URL(`node_modules/${name}/`, root);
  const info = JSON.parse(
    await readFile(new URL("package.json", base), "utf8"),
  );
  versions[name] = info.version;
  let licence;
  for (const filename of [
    "LICENSE",
    "LICENSE.md",
    "LICENSE.txt",
    "LICENSE-MIT",
    "license",
  ]) {
    try {
      licence = await readFile(new URL(filename, base), "utf8");
      break;
    } catch {}
  }
  if (!licence) throw new Error(`Missing licence for ${name}`);
  licences += `\n\n=== ${name} ${info.version} (${info.license}) ===\n\n${licence.trim()}\n`;
}
await writeFile(new URL("LICENSES.txt", output), licences);
const manifestPath = new URL("asset-manifest.json", root);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
manifest.editor = { packages: versions, build: "npm run build:editor" };
for (const path of [
  "site/vendor/editor/codemirror.js",
  "site/vendor/editor/LICENSES.txt",
]) {
  manifest.sha256[path] = createHash("sha256")
    .update(await readFile(new URL(path, root)))
    .digest("hex");
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `Bundled CodeMirror with ${packages.length} pinned, licensed dependencies.`,
);
