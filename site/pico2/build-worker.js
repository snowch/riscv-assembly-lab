// Copyright © 2026 Christopher Snow
importScripts("../vendor/binutils/riscv64-linux-gnu-as.js");
const as = Module;
importScripts("../vendor/binutils/riscv64-linux-gnu-ld.js");
const ld = Module;

async function load(path, format) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path} (HTTP ${response.status}).`);
  return response[format]();
}

self.onmessage = async ({ data: source }) => {
  try {
    const [{ buildProgram }, { pico2Uf2 }, assembler, linker, script, runtime] = await Promise.all([
      import("../build.js"), import("./uf2.js"),
      load("../vendor/binutils/as-new.wasm", "arrayBuffer"),
      load("../vendor/binutils/ld-new.wasm", "arrayBuffer"),
      load("./runtime.ld", "text"),
      load("./runtime.o", "arrayBuffer"),
    ]);
    const { elf, diagnostics } = await buildProgram(
      source,
      { as: assembler, ld: linker, script, target: "pico2", objects: { "runtime.o": new Uint8Array(runtime) } },
      { as, ld },
      "trip.s",
    );
    const firmware = pico2Uf2(elf);
    postMessage({ firmware, diagnostics }, [firmware.buffer]);
  } catch (error) {
    postMessage({ error: error.message || String(error) });
  }
};
