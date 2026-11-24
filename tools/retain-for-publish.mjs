import { retainLegacyAssets } from "./retain-legacy-assets.mjs";
import { readFile, writeFile } from "node:fs/promises";
import { retainPublishedReleases } from "./retain-releases.mjs";
const directory = ".build/site",
  release = JSON.parse(await readFile(directory + "/release.json", "utf8"));
release.legacyAssets = await retainLegacyAssets(
  directory,
  process.env.PUBLISHED_COURSE_URL,
  release,
);
release.retainedReleases = await retainPublishedReleases(
  directory,
  process.env.PUBLISHED_COURSE_URL,
  { currentId: release.id },
);
for (const path of ["release.json", "releases/" + release.id + "/release.json"])
  await writeFile(directory + "/" + path, JSON.stringify(release));
