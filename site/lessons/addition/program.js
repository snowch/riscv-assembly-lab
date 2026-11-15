// The editable fragment is assembled verbatim between these two blocks.
const prefix = `# Supplied entry: prepare the three observed registers.
.text
.global _start
_start:
    li t0, 0
    li t1, 0
    li t2, 0

# Your lesson code begins here.
`;
const suffix = `
# Your lesson code ends here.
# Capture the registers before the reporting code changes any of them.
.text
_lab_capture:
    la a0, _lab_registers
    sd t0, 0(a0)
    sd t1, 8(a0)
    sd t2, 16(a0)

# Format each saved 64-bit value as sixteen hexadecimal digits.
    la a1, _lab_values
    la a2, _lab_registers
    li a3, 3
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

# write(1, report, report_length), then exit(0), using xv6 calls.
    li a0, 1
    la a1, _lab_report
    la a2, _lab_report_end
    sub a2, a2, a1
    li a7, 16
    ecall
    li a0, 0
    li a7, 2
    ecall

.section .rodata
_lab_hex:
    .ascii "0123456789abcdef"

.section .data
.balign 8
_lab_registers:
    .zero 24
_lab_report:
    .ascii "RVALAB_REGS_V1\\n"
_lab_values:
    .ascii "0000000000000000\\n0000000000000000\\n0000000000000000\\n"
    .ascii "RVALAB_END\\n"
_lab_report_end:
`;
export const lessonLineOffset = prefix.split('\n').length - 1;
export function completeProgram(fragment) {
  return prefix + fragment + (fragment.endsWith('\n') ? '' : '\n') + suffix;
}
export function lessonDiagnostic(line, fragment) {
  const match = line.match(/program\.s:(\d+)(?::\d+)?:/);
  if (!match) return null;
  const position = Number(match[1]) - lessonLineOffset;
  const count = fragment.replace(/\n$/, '').split('\n').length;
  if (position < 1 || position > count) return null;
  return { line: position, label: line.replace(/program\.s:\d+/, `lesson.s:${position}`) };
}
export function readRegisters(output) {
  // Values come from the guest's register snapshot, never from evaluating source.
  const reports = [...output.replaceAll('\r', '').matchAll(/^RVALAB_REGS_V1\n([0-9a-f]{16})\n([0-9a-f]{16})\n([0-9a-f]{16})\nRVALAB_END\n/gm)];
  if (reports.length !== 1) return null;
  return Object.fromEntries(['t0', 't1', 't2'].map((name, i) => {
    const bits = reports[0][i + 1];
    return [name, { hex: '0x' + bits, decimal: BigInt.asIntN(64, BigInt('0x' + bits)).toString() }];
  }));
}
