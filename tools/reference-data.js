// Copyright © 2026 Christopher Snow
import { readFile, writeFile } from "node:fs/promises";
const read = async (name) =>
  JSON.parse(
    await readFile(
      new URL(`../content/reference/${name}.json`, import.meta.url),
      "utf8",
    ),
  );

export function instructionNames(source) {
  const names = [];
  for (let line of source.split("\n")) {
    line = line
      .replace(/#.*/, "")
      .trim()
      .replace(/^[\w.$]+:\s*/, "");
    const match = line.match(/^([a-z][a-z0-9.]*)\b/);
    if (match) names.push(match[1]);
  }
  return [...new Set(names)];
}

export async function loadReference() {
  const [arithmetic, control, copy, notation] = await Promise.all([
    read("arithmetic"),
    read("control"),
    read("interface"),
    read("notation"),
  ]);
  return {
    copy,
    notation,
    entries: [...arithmetic, ...control].sort((a, b) =>
      a.id.localeCompare(b.id),
    ),
  };
}

export async function writeReference(lessons) {
  const reference = await loadReference();
  const ids = new Set(reference.entries.map((entry) => entry.id));
  const used = Object.fromEntries(
    lessons.map((lesson) => {
      const sources =
        lesson.language === "c"
          ? []
          : [
              lesson.starter,
              lesson.challenge?.starter,
              lesson.challenge?.reference,
            ];
      const prose = [
        ...(lesson.before ?? []),
        ...(lesson.explanation ?? []),
        lesson.experiment?.task ?? "",
        lesson.experiment?.hint ?? "",
      ].join("\n");
      const mentioned = [...prose.matchAll(/`([^`]+)`/g)]
        .flatMap((match) => match[1].match(/[a-z][a-z0-9]*/g) ?? [])
        .filter((name) => ids.has(name));
      const names = [
        ...new Set([
          ...sources.filter(Boolean).flatMap(instructionNames),
          ...mentioned,
        ]),
      ];
      for (const name of names)
        if (!ids.has(name))
          throw new Error(`Reference missing ${name} used by ${lesson.id}`);
      return [lesson.id, names];
    }),
  );
  await writeFile(
    new URL("../site/course/reference-data.js", import.meta.url),
    "// Copyright © 2026 Christopher Snow\n// Generated from content/reference/*.json.\nexport default " +
      JSON.stringify({ ...reference, used }, null, 2) +
      ";\n",
  );
}
