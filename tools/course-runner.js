// Copyright © 2026 Christopher Snow
import { readFile } from "node:fs/promises";
import { tool } from "./node-toolchain.js";
import { buildLesson } from "../site/course/builder.js";
import { replaceGuestFile } from "../site/filesystem.js";
import init, { WasmRiscv } from "../site/vendor/runtime/riscv_emu_rust_wasm.js";
const base = new URL("../site/", import.meta.url);
export const load = async (path) =>
  new Uint8Array(await readFile(new URL(path, base)));
export const assets = {
  as: await load("vendor/binutils/as-new.wasm"),
  ld: await load("vendor/binutils/ld-new.wasm"),
  objdump: await load("vendor/binutils/objdump.wasm"),
  compiler: await load("vendor/compiler/tcc.wasm"),
  script: await readFile(new URL("course/user.ld", base), "utf8"),
};
export const factories = {
  as: await tool("as"),
  ld: await tool("ld"),
  objdump: await tool("objdump"),
};
await init({
  module_or_path: await load("vendor/runtime/riscv_emu_rust_wasm_bg.wasm"),
});
const kernel = await load("images/kernel"),
  disk = await load("images/fs.img");
const bareMetalLinker = await readFile(new URL("course/bare-metal.ld", base), "utf8");
export const build = (source, lesson, fixture = {}, platform = "xv6") =>
  buildLesson(
    source,
    lesson,
    fixture,
    lesson.target === "bare-metal" ? { ...assets, script: bareMetalLinker } : assets,
    factories,
    platform,
  );
export function bootBareMetal(built) {
  const vm = WasmRiscv.new();
  try {
    vm.setup_program(built.elf);
    if (!vm.run_until_breakpoints(new BigUint64Array([BigInt(built.park)]), 100000))
      throw new Error("The bare-metal program did not reach park.");
    const bytes = [];
    for (let byte; (byte = vm.get_output()) !== 0;) bytes.push(byte);
    return new TextDecoder().decode(Uint8Array.from(bytes)).replaceAll("\r", "");
  } finally {
    vm.free();
  }
}
export function machine(elf) {
  const vm = WasmRiscv.new();
  vm.setup_program(kernel);
  vm.setup_filesystem(replaceGuestFile(disk, "workbench", elf));
  return vm;
}
export function execute(elf, { maxChunks = 1200, debugEntry = null } = {}) {
  const vm = machine(elf);
  let output = "",
    sent = false;
  try {
    for (let i = 0; i < maxChunks; i++) {
      if (sent && debugEntry !== null) {
        const found = vm.run_until_breakpoints(
          new BigUint64Array([BigInt(debugEntry)]),
          100000,
        );
        if (found) return { vm, output, paused: true };
      } else vm.run_cycles(100000);
      let c;
      while ((c = vm.get_output()) !== 0) output += String.fromCharCode(c);
      if (!sent && output.endsWith("$ ")) {
        for (const byte of new TextEncoder().encode(
          "workbench; echo __COURSE_DONE__\n",
        ))
          vm.put_input(byte);
        sent = true;
      }
      if (output.includes("\n__COURSE_DONE__")) {
        vm.free();
        return { output, paused: false };
      }
    }
    throw new Error("Execution budget exceeded. " + output.slice(-500));
  } catch (error) {
    try {
      vm.free();
    } catch {}
    throw error;
  }
}
