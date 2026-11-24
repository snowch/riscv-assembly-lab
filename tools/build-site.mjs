import { cp, mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { buildOffline } from "./offline.mjs";
await rm(".build/site", { recursive: true, force: true });
await mkdir(".build/site", { recursive: true });
await cp("site", ".build/site", { recursive: true });
const commit =
  process.env.COURSE_COMMIT ||
  execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const release = await buildOffline(".build/site", {
  commit,
  date: new Date().toISOString().slice(0, 10),
});
console.log(
  `Built ${release.files.length} verified files, ${(release.bytes / 1e6).toFixed(1)} MB.`,
);
