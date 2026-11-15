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
export const build = (source, lesson, fixture = {}, platform = "xv6") =>
  buildLesson(source, lesson, fixture, assets, factories, platform);
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
