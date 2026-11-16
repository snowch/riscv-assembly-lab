// Copyright © 2026 Christopher Snow
export const REGISTERS = [
  "zero",
  "ra",
  "sp",
  "gp",
  "tp",
  "t0",
  "t1",
  "t2",
  "s0",
  "s1",
  "a0",
  "a1",
  "a2",
  "a3",
  "a4",
  "a5",
  "a6",
  "a7",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
  "s7",
  "s8",
  "s9",
  "s10",
  "s11",
  "t3",
  "t4",
  "t5",
  "t6",
];
export const registerIndex = (name) =>
  name === "fp"
    ? 8
    : /^x(?:[0-9]|[12][0-9]|3[01])$/.test(name)
      ? Number(name.slice(1))
      : REGISTERS.indexOf(name);
export const hex = (value) =>
  "0x" + BigInt.asUintN(64, BigInt(value)).toString(16).padStart(16, "0");
export function reading(value, mode = "signed") {
  const bits = BigInt(value);
  return mode === "hex"
    ? hex(bits)
    : (mode === "unsigned"
        ? BigInt.asUintN(64, bits)
        : BigInt.asIntN(64, bits)
      ).toString();
}
export function makeProgram(
  fragment,
  lesson = {},
  fixture = {},
  platform = "xv6",
) {
  if (lesson.kind === "program")
    return { source: fragment, lineOffset: 0, inputs: {} };
  const inputs = { ...(lesson.inputs ?? {}), ...(fixture.inputs ?? {}) };
  const data = fixture.data ?? lesson.data ?? [];
  if (
    data.length > 64 ||
    data.some((v) => !Number.isInteger(v) || v < 0 || v > 255)
  )
    throw new Error("Lesson data must contain at most 64 bytes.");
  const initialise = REGISTERS.map((name, index) =>
    index >= 5 || index === 1 ? `    li ${name}, 0` : "",
  ).filter(Boolean);
  for (const [name, value] of Object.entries(inputs)) {
    const index = registerIndex(name);
    if (index < 0 || [2, 3, 4].includes(index))
      throw new Error("Unsupported initial register: " + name);
    initialise.push(`    li ${REGISTERS[index]}, ${hex(value)}`);
  }
  const prefix = `# Supplied entry: aligned stack, inspection space and starting registers.
.option norvc
.text
.global _start
_start:
    addi sp, sp, -64
${Array.from({ length: 8 }, (_, i) => `    sd zero, ${i * 8}(sp)`).join("\n")}
    la t6, _lab_initial_sp
    sd sp, 0(t6)
${initialise.join("\n")}
.global _lab_lesson_begin
_lab_lesson_begin:
# Your lesson code begins here.
`;
  const body =
    lesson.language === "c"
      ? "    call lesson\n"
      : fragment + (fragment.endsWith("\n") ? "" : "\n");
  const stores = REGISTERS.map((name, i) =>
    i === 2 ? "" : `    sd ${name}, ${i * 8}(sp)`,
  )
    .filter(Boolean)
    .join("\n");
  const memoryBase =
    lesson.memory === "stack"
      ? "    addi t0, sp, 336"
      : "    la t0, lesson_data";
  const suffix = `# Your lesson code ends here.
.text
.global _lab_lesson_end
_lab_lesson_end:
# Snapshot every integer register before formatting the report.
    addi sp, sp, -336
${stores}
    addi t0, sp, 336
    sd t0, 16(sp)
${memoryBase}
    sd t0, 256(sp)
${Array.from({ length: 8 }, (_, i) => `    ld t1, ${i * 8}(t0)\n    sd t1, ${264 + i * 8}(sp)`).join("\n")}
    la t0, _lab_initial_sp
    ld t0, 0(t0)
    sd t0, 328(sp)
    la a1, _lab_values
    mv a2, sp
    li a3, 42
_lab_register:
    ld a4, 0(a2)
    li a5, 16
_lab_digit:
    srli a6, a4, 60
    la a0, _lab_hex
    add a0, a0, a6
    lbu a0, 0(a0)
    sb a0, 0(a1)
    slli a4, a4, 4
    addi a1, a1, 1
    addi a5, a5, -1
    bnez a5, _lab_digit
    addi a1, a1, 1
    addi a2, a2, 8
    addi a3, a3, -1
    bnez a3, _lab_register
    li a0, 1
    la a1, _lab_report
    la a2, _lab_report_end
    sub a2, a2, a1
    li a7, ${platform === "linux" ? 64 : 16}
    ecall
    li a0, 0
    li a7, ${platform === "linux" ? 93 : 2}
    ecall
.global memset
memset:
    mv t0, a0
    beqz a2, _lab_memset_done
_lab_memset_loop:
    sb a1, 0(t0)
    addi t0, t0, 1
    addi a2, a2, -1
    bnez a2, _lab_memset_loop
_lab_memset_done:
    ret
.global memcpy
memcpy:
    mv t0, a0
    beqz a2, _lab_memcpy_done
_lab_memcpy_loop:
    lbu t1, 0(a1)
    sb t1, 0(t0)
    addi a1, a1, 1
    addi t0, t0, 1
    addi a2, a2, -1
    bnez a2, _lab_memcpy_loop
_lab_memcpy_done:
    ret
.section .rodata
_lab_hex: .ascii "0123456789abcdef"
.section .data
.balign 8
_lab_initial_sp: .quad 0
_lab_report: .ascii "\\nRVLAB_STATE_V2\\n"
_lab_values: .ascii "${"0000000000000000\\n".repeat(42)}"
    .ascii "RVLAB_END\\n"
_lab_report_end:
# This region ends at a page boundary; xv6 places a guard page after it.
.section .lesson_data, "aw"
.global lesson_data
lesson_data: .byte ${[...data, ...Array(64 - data.length).fill(0)].join(",")}
`;
  return {
    source: prefix + body + suffix,
    lineOffset: prefix.split("\n").length - 1,
    inputs,
  };
}
// Hide only the owned instrumentation frame; raw serial remains available.
export function learnerOutput(output, streaming = false) {
  const clean = output.replaceAll("\r", "");
  if (readState(clean))
    return clean.replace(
      /\nRVLAB_STATE_V2\n(?:[0-9a-f]{16}\n){42}RVLAB_END\n/,
      "",
    );
  if (streaming) {
    const marker = clean.indexOf("\nRVLAB_STATE_V2\n");
    if (marker >= 0) return clean.slice(0, marker);
  }
  return clean;
}
export function readState(output) {
  const matches = [
    ...output
      .replaceAll("\r", "")
      .matchAll(/^RVLAB_STATE_V2\n((?:[0-9a-f]{16}\n){42})RVLAB_END\n/gm),
  ];
  if (matches.length !== 1) return null;
  const values = matches[0][1]
    .trim()
    .split("\n")
    .map((value) => "0x" + value);
  const registers = Object.fromEntries(
    REGISTERS.map((name, i) => [name, values[i]]),
  );
  const bytes = values
    .slice(33, 41)
    .flatMap((value) =>
      Array.from({ length: 8 }, (_, i) =>
        Number((BigInt(value) >> BigInt(i * 8)) & 255n),
      ),
    );
  return {
    registers,
    memory: { address: values[32], bytes },
    initial: { sp: values[41] },
  };
}
export function checkState(state, fixture) {
  if (!state)
    return {
      pass: false,
      messages: [
        "The program did not produce a complete state report. Inspect the serial log.",
      ],
    };
  const messages = [];
  for (const [name, expected] of Object.entries(fixture.expect ?? {})) {
    const actual = state.registers[REGISTERS[registerIndex(name)]];
    if (!actual || hex(actual) !== hex(expected))
      messages.push(
        `${name}: expected ${reading(expected)}, observed ${actual ? reading(actual) : "unavailable"}.`,
      );
  }
  for (const [offset, expected] of Object.entries(fixture.memoryExpect ?? {})) {
    const actual = state.memory.bytes[Number(offset)];
    if (actual !== expected)
      messages.push(
        `Byte ${offset}: expected ${expected}, observed ${actual ?? "unavailable"}.`,
      );
  }
  for (const [name, target] of Object.entries(fixture.expectEqual ?? {})) {
    const actual = state.registers[REGISTERS[registerIndex(name)]];
    const expected =
      target === "initial:sp"
        ? state.initial.sp
        : state.registers[REGISTERS[registerIndex(target)]];
    if (!actual || !expected || actual !== expected)
      messages.push(`${name} was not preserved as required.`);
  }
  return { pass: messages.length === 0, messages };
}
export function diagnosticLocation(line, fragment, lesson = {}, fixture = {}) {
  if (lesson.language === "c") {
    const match = line.match(/lesson\.c:(\d+):/);
    return match
      ? {
          line: Number(match[1]),
          label: lesson.sourceName
            ? line.replaceAll("lesson.c", lesson.sourceName)
            : line,
        }
      : null;
  }
  const match = line.match(/program\.s:(\d+)(?::\d+)?:/);
  if (!match) return null;
  const position =
    Number(match[1]) - makeProgram(fragment, lesson, fixture).lineOffset;
  if (position < 1 || position > fragment.replace(/\n$/, "").split("\n").length)
    return null;
  return {
    line: position,
    label: line.replace(
      /program\.s:\d+/,
      `${lesson.sourceName ?? "lesson.s"}:${position}`,
    ),
  };
}
