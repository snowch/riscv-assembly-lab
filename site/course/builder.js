// Copyright © 2026 Christopher Snow
import { buildProgram } from "../build.js";
import { compileObject } from "./compiler.js";
import { makeProgram } from "./model.js";
import { readElf } from "./elf.js";
export async function buildLesson(
  fragment,
  lesson,
  fixture,
  assets,
  factories,
  platform = "xv6",
) {
  if (!fragment.trim())
    throw new Error(
      `${lesson.language === "c" ? "lesson.c" : "lesson.s"}:1: Error: Enter some code first.`,
    );
  const program = makeProgram(fragment, lesson, fixture, platform);
  const objects = {};
  let compilerDiagnostics = [];
  if (lesson.language === "c") {
    const compiled = await compileObject(assets.compiler, fragment);
    objects["lesson.o"] = compiled.bytes;
    compilerDiagnostics = compiled.diagnostics;
  }
  const built = await buildProgram(
    program.source,
    { ...assets, objects, debug: true },
    factories,
    "program.s",
  );
  const elf = readElf(built.elf);
  const symbol = (name) => elf.symbols.get(name)?.value;
  const park = lesson.target === "bare-metal" ? symbol("park") : undefined;
  const text = elf.sections
    .filter((s) => s.flags & 4)
    .map((s) => ({ start: s.address, end: s.address + s.size }));
  if (
    lesson.target === "bare-metal" &&
    (park === symbol("_start") ||
      !text.some(({ start, end }) => park >= start && park < end))
  )
    throw new Error("Define park on an instruction after startup, where the hart can wait.");
  return {
    park,
    ...built,
    diagnostics: [...compilerDiagnostics, built.diagnostics]
      .filter(Boolean)
      .join("\n"),
    program: program.source,
    lineOffset: program.lineOffset,
    entry:
      lesson.kind === "program"
        ? symbol("_start")
        : lesson.language === "c"
          ? symbol("lesson")
          : symbol("_lab_lesson_begin"),
    // Complete programs have no supplied register-reporting checkpoint.
    end: lesson.kind === "program" ? 0 : symbol("_lab_lesson_end"),
    data:
      symbol("lesson_data") ??
      readSegments(built.elf).find((s) => s.flags & 2)?.address ??
      text[0]?.start ??
      0,
    hasDataSymbol: symbol("lesson_data") !== undefined,
    symbols: [...elf.symbols.values()]
      .filter(
        (s) =>
          s.name &&
          !s.name.startsWith("_lab_") &&
          text.some((t) => s.value >= t.start && s.value < t.end),
      )
      .map((s) => ({ name: s.name, address: s.value, size: s.size })),
    text,
    segments: readSegments(built.elf),
    ...(await disassemble(
      built.elf,
      program.source,
      fragment,
      factories.objdump,
      assets.objdump,
      lesson,
      elf,
    )),
  };
}
function readSegments(bytes) {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
    result = [];
  const start = Number(v.getBigUint64(32, true)),
    size = v.getUint16(54, true),
    count = v.getUint16(56, true);
  for (let i = 0; i < count; i++) {
    const o = start + i * size;
    if (v.getUint32(o, true) !== 1) continue;
    result.push({
      address: Number(v.getBigUint64(o + 16, true)),
      fileSize: Number(v.getBigUint64(o + 32, true)),
      memorySize: Number(v.getBigUint64(o + 40, true)),
      flags: v.getUint32(o + 4, true),
    });
  }
  return result;
}
async function disassemble(
  bytes,
  source,
  fragment,
  factory,
  binary,
  lesson,
  elf,
) {
  if (!factory || !binary) return { disassembly: [], allInstructions: [] };
  let output = "";
  const m = await factory({
    noInitialRun: true,
    wasmBinary: binary,
    print: (s) => {
      output += s + "\n";
    },
    printErr: (s) => {
      output += s + "\n";
    },
  });
  m.FS.writeFile("program.elf", bytes);
  m.FS.writeFile("program.s", source);
  m.FS.writeFile("lesson.c", fragment);
  const status = m.callMain([
    "-d",
    "--no-show-raw-insn",
    "--line-numbers",
    "program.elf",
  ]);
  if (status)
    throw new Error(
      "Could not disassemble the executable. " + output.slice(-1000),
    );
  const full = lesson.kind === "program";
  const start = elf.symbols.get(
    full ? "_start" : lesson.language === "c" ? "lesson" : "_lab_lesson_begin",
  );
  const end = full
    ? Math.max(
        ...elf.sections
          .filter((s) => s.flags & 4)
          .map((s) => s.address + s.size),
      )
    : lesson.language === "c"
      ? start.value + start.size
      : elf.symbols.get("_lab_lesson_end").value;
  let sourceLine = null,
    sourceFile = null;
  const result = [],
    allInstructions = [];
  for (const line of output.split("\n")) {
    if (/^[0-9a-f]+\s+<[^>]+>:/i.test(line.trim())) {
      sourceLine = null;
      sourceFile = null;
    }
    const location = line.match(/^(.+\.(?:s|S|c)):(\d+)(?:\s.*)?$/);
    if (location) {
      sourceFile = location[1];
      sourceLine = Number(location[2]);
    }
    const instruction = line.match(/^\s*([0-9a-f]+):\s+(.+)$/);
    if (!instruction) continue;
    const address = parseInt(instruction[1], 16);
    const record = { address, text: instruction[2], sourceLine, sourceFile };
    allInstructions.push(record);
    if (
      full
        ? elf.sections.some(
            (s) =>
              s.flags & 4 &&
              address >= s.address &&
              address < s.address + s.size,
          )
        : address >= start.value && address < end
    )
      result.push({
        ...record,
        sourceLine: lesson.language === "c" ? null : sourceLine,
      });
  }
  return { disassembly: result, allInstructions };
}
