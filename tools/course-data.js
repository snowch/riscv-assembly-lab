// Copyright © 2026 Christopher Snow
import { readFile } from "node:fs/promises";
export const MODULES = [
  [
    "fundamentals",
    "0",
    "First instructions",
    "Read operands, load starting values and follow instructions in order.",
  ],
  [
    "bits",
    "1",
    "Registers and readings",
    "Read the same register bits in several ways and work at 32 or 64 bits.",
  ],
  [
    "arithmetic",
    "2",
    "Arithmetic and range",
    "Check wrapping, carry and signed overflow without condition flags.",
  ],
  [
    "logic",
    "3",
    "Bits, shifts and masks",
    "Select fields and move bits while keeping their meaning clear.",
  ],
  [
    "branches",
    "4",
    "Comparisons and branches",
    "Compare registers directly and choose which instructions run.",
  ],
  [
    "loops",
    "5",
    "Loops",
    "Repeat useful work, test boundaries and make progress towards an end.",
  ],
  [
    "memory",
    "6",
    "Memory and transfer widths",
    "Follow byte addresses, load readings and stores of different widths.",
  ],
  [
    "arrays",
    "7",
    "Arrays, strings and pointers",
    "Scale an index, traverse a record and bound a byte scan.",
  ],
  [
    "multiply",
    "8",
    "Products and division",
    "Inspect both product halves, quotients, remainders and safe scaling.",
  ],
  [
    "functions",
    "9",
    "Functions and the stack",
    "Pass arguments, preserve values and keep nested returns working.",
  ],
  [
    "debugging",
    "10",
    "Debugging working code",
    "Set breakpoints, watch actual state and repair boundary, width and return mistakes.",
  ],
  [
    "c",
    "11",
    "C and real instructions",
    "Compile small C functions locally and inspect their real machine instructions.",
  ],
  [
    "c-edges",
    "12",
    "C at the boundaries",
    "Separate language guarantees, target widths and explicit overflow checks.",
  ],
  [
    "xv6",
    "13",
    "Working programs in xv6",
    "Use ELF entry and system calls to write a complete program, then integrate earlier skills in a trip calculation.",
  ],
  [
    "bare-metal",
    "14",
    "Bare-metal boot",
    "Boot the trip computer in WebAssembly and QEMU, then build the Raspberry Pi Pico 2 port.",
  ],
  [
    "appendices",
    "A",
    "Further readings",
    "Revisit two’s complement, compare Arm and RISC-V, and interpret floating-point bits.",
  ],
].map(([id, label, title, summary]) => ({ id, label, title, summary }));
const files = [
  "state-arithmetic",
  "control-memory",
  "products-functions",
  "debugging",
  "c-xv6-appendices",
];
export async function loadLessons() {
  const groups = await Promise.all(
    files.map((name) =>
      readFile(
        new URL(`../content/${name}.json`, import.meta.url),
        "utf8",
      ).then(JSON.parse),
    ),
  );
  return MODULES.flatMap((module) =>
    groups.flat().filter((lesson) => lesson.module === module.id),
  );
}
export const REFERENCES = {
  integer: [
    "Base integer instructions",
    "https://docs.riscv.org/reference/isa/unpriv/rv32.html",
  ],
  rv64: [
    "RV64 integer instructions",
    "https://docs.riscv.org/reference/isa/unpriv/rv64.html",
  ],
  multiply: [
    "Multiplication and division extension",
    "https://docs.riscv.org/reference/isa/unpriv/m-st-ext.html",
  ],
  abi: [
    "RISC-V calling convention",
    "https://riscv-non-isa.github.io/riscv-elf-psabi-doc/",
  ],
  assembler: [
    "GNU assembler: RISC-V syntax",
    "https://sourceware.org/binutils/docs/as/RISC_002dV_002dDependent.html",
  ],
  xv6: [
    "The xv6 source used by this lab",
    "https://github.com/mit-pdos/xv6-riscv/tree/d7c0a1b7a703f7366942092f9cf421b6cd111a36",
  ],
  c: [
    "C language reference: public C23 draft",
    "https://www.open-std.org/jtc1/sc22/wg14/www/docs/n3096.pdf",
  ],
  floating: [
    "IEEE floating-point representations",
    "https://docs.oracle.com/cd/E19059-01/stud.10/819-0499/ncg_math.html",
  ],
  "qemu-virt": [
    "QEMU’s RISC-V virt machine",
    "https://www.qemu.org/docs/master/system/riscv/virt.html",
  ],
  arm: ["Arm Assembly Lab", "https://snowch.github.io/assembly-lab/"],
};
