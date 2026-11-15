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
  const text = elf.sections
    .filter((s) => s.flags & 4)
    .map((s) => ({ start: s.address, end: s.address + s.size }));
  return {
    ...built,
    diagnostics: [...compilerDiagnostics, built.diagnostics]
      .filter(Boolean)
      .join("\n"),
    program: program.source,
    lineOffset: program.lineOffset,
    entry:
      lesson.language === "c" ? symbol("lesson") : symbol("_lab_lesson_begin"),
    end: symbol("_lab_lesson_end"),
    data: symbol("lesson_data"),
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
  const start = elf.symbols.get(
    lesson.language === "c" ? "lesson" : "_lab_lesson_begin",
  );
  const end =
    lesson.language === "c"
      ? start.value + start.size
      : elf.symbols.get("_lab_lesson_end").value;
  let sourceLine = null;
  const result = [],
    allInstructions = [];
  for (const line of output.split("\n")) {
    const location = line.match(/(?:program\.s|lesson\.c):(\d+)/);
    if (location) sourceLine = Number(location[1]);
    const instruction = line.match(/^\s*([0-9a-f]+):\s+(.+)$/);
    if (!instruction) continue;
    const address = parseInt(instruction[1], 16);
    allInstructions.push({ address, text: instruction[2] });
    if (address >= start.value && address < end)
      result.push({
        address,
        text: instruction[2],
        sourceLine: lesson.language === "c" ? null : sourceLine,
      });
  }
  return { disassembly: result, allInstructions };
}
