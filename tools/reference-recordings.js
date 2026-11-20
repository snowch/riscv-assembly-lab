// Copyright © 2026 Christopher Snow
// Regenerate independent worked examples from real GNU/xv6 execution, then
// compare their source-line effects against an independent QEMU Linux process.
import {
  readFile,
  writeFile,
  mkdtemp,
  rm,
  chmod,
  mkdir,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { build, execute, assets, factories } from "./course-runner.js";
import {
  registerIndex,
  readState,
  hex,
  learnerOutput,
} from "../site/course/model.js";
import {
  referenceFragment,
  referenceRegister,
  validateReferenceEntries,
} from "../site/course/reference-model.js";

const sourcePaths = ["arithmetic", "control"].map(
  (name) => new URL("../content/reference/" + name + ".json", import.meta.url),
);
const raw = await Promise.all(
  sourcePaths.map((path) => readFile(path, "utf8")),
);
const entries = raw.flatMap((text) => JSON.parse(text));
const totals = validateReferenceEntries(entries);
const directory = await mkdtemp(join(tmpdir(), "riscv-reference-"));
const qemu =
  process.env.RISCV_QEMU ??
  (existsSync("/workspace/native-tools/usr/bin/qemu-riscv64")
    ? "/workspace/native-tools/usr/bin/qemu-riscv64"
    : "qemu-riscv64");
const help = spawnSync(qemu, ["-help"], { encoding: "utf8" });
if (help.error || help.status)
  throw new Error("Install qemu-user or set RISCV_QEMU.");
const single = help.stdout.includes("-one-insn-per-tb")
  ? "-one-insn-per-tb"
  : "-singlestep";
const snapshot = (vm, names) =>
  names.map((name) =>
    referenceRegister(name, vm.read_register(registerIndex(name))),
  );
function output(vm) {
  let result = "",
    byte;
  while ((byte = vm.get_output()) !== 0) result += String.fromCharCode(byte);
  return result.replaceAll("\r", "");
}
function memory(vm, address) {
  const result = [];
  for (let i = 0; i < 64; i += 8) {
    const error = new Uint8Array(1),
      word = vm.load_doubleword(BigInt(address + i), error);
    if (error[0]) throw new Error("Could not inspect example memory.");
    for (let n = 0; n < 8; n++)
      result.push(Number((word >> BigInt(8 * n)) & 255n));
  }
  return result;
}
function traceStates(text) {
  return text
    .split(/(?=^ pc\s+[0-9a-f]+)/m)
    .filter((block) => /^ pc\s+[0-9a-f]+/m.test(block))
    .map((block) => {
      const pc = BigInt("0x" + block.match(/^ pc\s+([0-9a-f]+)/m)[1]);
      const regs = new Map(
        [...block.matchAll(/x(\d+)\/\S+\s+([0-9a-f]{16})/g)].map((match) => [
          Number(match[1]),
          BigInt("0x" + match[2]),
        ]),
      );
      if (regs.size !== 32)
        throw new Error("Incomplete QEMU CPU trace at " + hex(pc));
      return { pc, regs };
    });
}
function symbol(built, name) {
  const value = built.symbols.find((symbol) => symbol.name === name)?.address;
  if (value === undefined) throw new Error("Reference marker missing: " + name);
  return value;
}
function equalRegisters(observed, trace, example, syscall = false) {
  for (const row of observed) {
    // The guest environments use different write syscall numbers. All other
    // watched values, including the write return value, must agree exactly.
    if (syscall && row.register === "a7") {
      assert.equal(trace.regs.get(17), 64n);
      assert.equal(row.unsigned, "16");
    } else
      assert.equal(
        hex(trace.regs.get(registerIndex(row.register))),
        row.hex,
        example.id + ": QEMU differs for " + row.register,
      );
  }
}
const recordings = {
  version: 1,
  provenance: {
    sourceDigest: createHash("sha256").update(raw.join("\n")).digest("hex"),
    assembler: "Bundled GNU assembler and linker, RV64GC, LP64D, no relaxation",
    execution:
      "Captured on the bundled RISC-V CPU running xv6; before and after the complete source line",
    independentCheck:
      "Compared with QEMU RISC-V user-mode instruction traces and memory reports; write uses xv6 syscall 16 and Linux syscall 64",
  },
  examples: {},
};
let nativeChecked = 0,
  invalidChecked = 0;
try {
  for (const entry of entries) {
    for (const example of entry.examples) {
      const fragment = referenceFragment(example),
        lesson = { data: example.data ?? [] };
      const built = await build(fragment, lesson);
      const begin = symbol(built, "reference_focus"),
        end = symbol(built, "reference_focus_end");
      const { vm } = execute(built.elf, { debugEntry: begin });
      let record;
      try {
        output(vm);
        const before = snapshot(vm, example.watch),
          beforeMemory = example.data ? memory(vm, built.data) : null;
        let steps = 0;
        do {
          vm.run_cycles(1);
          if (++steps > 100000)
            throw new Error(example.id + ": focus did not finish");
          const pc = Number(vm.read_pc());
          if (entry.id === "ecall") {
            if (pc === end) break;
          } else if (pc < begin || pc >= end) break;
        } while (true);
        const after = snapshot(vm, example.watch),
          afterPC = vm.read_pc();
        record = {
          source: built.program,
          instruction: example.instruction,
          output: output(vm),
          before,
          after,
          beforePC: hex(begin),
          afterPC: hex(afterPC),
          nextSupplied: Number(afterPC) === built.end,
          nextInstruction:
            built.allInstructions.find(
              (line) => line.address === Number(afterPC),
            )?.text ?? "",
          nextLabel:
            built.symbols.find(
              (symbol) =>
                symbol.address === Number(afterPC) &&
                !symbol.name.startsWith("reference_") &&
                !symbol.name.startsWith("_lab_"),
            )?.name ?? null,
          machineInstructions: built.disassembly
            .filter((line) => line.address >= begin && line.address < end)
            .map((line) => ({ address: hex(line.address), text: line.text })),
          ...(example.data
            ? {
                memory: {
                  address: hex(built.data),
                  before: beforeMemory,
                  after: memory(vm, built.data),
                },
              }
            : {}),
        };
        // Reach the ordinary report without modifying watched state so that the
        // independently run process can verify final memory too.
        if (Number(vm.read_pc()) !== built.end) {
          let found = false;
          for (let n = 0; n < 100 && !found; n++)
            found = vm.run_until_breakpoints(
              new BigUint64Array([BigInt(built.end)]),
              10000,
            );
          if (!found)
            throw new Error(
              example.id + ": continuation did not reach the report",
            );
        }
        if (example.data) {
          record.finalMemory = memory(vm, built.data);
          assert.deepEqual(
            record.finalMemory,
            record.memory.after,
            example.id +
              ": continuation changes memory; add an independent immediate-memory checker before using this example",
          );
        }
      } finally {
        vm.free();
      }
      const nativeFragment =
        entry.id === "ecall"
          ? fragment.replace(/li\s+a7,\s*16\b/g, "li a7, 64")
          : fragment;
      const native = await build(nativeFragment, lesson, {}, "linux");
      assert.equal(
        symbol(native, "reference_focus"),
        begin,
        example.id + ": native focus placement differs",
      );
      const path = join(directory, "example.elf"),
        tracePath = join(directory, "trace.log");
      await writeFile(path, native.elf);
      await chmod(path, 0o755);
      const filter =
        "0x" + native.entry.toString(16) + "..0x" + native.end.toString(16);
      const run = spawnSync(
        qemu,
        [single, "-d", "cpu", "-dfilter", filter, "-D", tracePath, path],
        { encoding: "utf8", timeout: 5000, maxBuffer: 200000 },
      );
      if (run.error || run.status)
        throw new Error(
          example.id + ": QEMU failed: " + (run.error?.message ?? run.stderr),
        );
      const states = traceStates(await readFile(tracePath, "utf8"));
      const beforeIndex = states.findIndex(
        (state) => state.pc === BigInt(begin),
      );
      assert.ok(beforeIndex >= 0, example.id + ": no QEMU focus snapshot");
      let afterIndex = beforeIndex + 1;
      while (
        afterIndex < states.length &&
        states[afterIndex].pc >= BigInt(begin) &&
        states[afterIndex].pc < BigInt(end)
      )
        afterIndex++;
      assert.ok(states[afterIndex], example.id + ": no QEMU after snapshot");
      assert.equal(
        hex(states[afterIndex].pc),
        record.afterPC,
        example.id + ": next PC differs",
      );
      equalRegisters(
        record.before,
        states[beforeIndex],
        example,
        entry.id === "ecall",
      );
      equalRegisters(
        record.after,
        states[afterIndex],
        example,
        entry.id === "ecall",
      );
      if (entry.id === "ecall")
        assert.equal(
          learnerOutput(run.stdout).replaceAll("\r", ""),
          record.output,
          example.id + ": console output differs",
        );
      const final = readState(run.stdout);
      assert.ok(final, example.id + ": no QEMU final report");
      if (record.finalMemory) {
        assert.deepEqual(
          final.memory.bytes,
          record.finalMemory,
          example.id + ": final memory differs",
        );
        delete record.finalMemory;
      }
      recordings.examples[example.id] = record;
      nativeChecked++;
      console.log("Checked", entry.id, example.id);
    }
    for (const mistake of entry.mistakes ?? []) {
      // An undefined label is a linker failure, not proof of invalid operands.
      // Only an actual assembler error establishes this reference claim.
      let diagnostics = "";
      const assembler = await factories.as({
        noInitialRun: true,
        wasmBinary: assets.as,
        print: (text) => (diagnostics += text + "\n"),
        printErr: (text) => (diagnostics += text + "\n"),
      });
      assembler.FS.writeFile(
        "mistake.s",
        ".text\n.option norvc\n" + mistake.source + "\n",
      );
      const status = assembler.callMain([
        "-march=rv64gc",
        "-mabi=lp64d",
        "mistake.s",
        "-o",
        "mistake.o",
      ]);
      assert.notEqual(
        status,
        0,
        entry.id + ": claimed rejected operands assemble: " + mistake.source,
      );
      assert.match(
        diagnostics,
        /Error:/,
        entry.id + ": missing assembler diagnostic",
      );
      invalidChecked++;
    }
  }
  const path = new URL(
    "../site/course/reference-recordings.json",
    import.meta.url,
  );
  const rendered = JSON.stringify(recordings, null, 2) + "\n";
  if (process.argv.includes("--check"))
    assert.equal(
      await readFile(path, "utf8"),
      rendered,
      "Reference recordings are stale. Run node tools/reference-recordings.js.",
    );
  else await writeFile(path, rendered);
  const report = { ...totals, nativeChecked, invalidChecked, failures: [] };
  await mkdir(new URL("../.artifacts/", import.meta.url), { recursive: true });
  await writeFile(
    new URL("../.artifacts/reference-execution.json", import.meta.url),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report));
} finally {
  await rm(directory, { recursive: true, force: true });
}
