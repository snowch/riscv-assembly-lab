// Copyright © 2026 Christopher Snow
import { registerIndex, hex } from "./model.js";

export function resolveBreakpoints(built, selection = {}) {
  const allowed = new Set(built.disassembly.map((i) => i.address));
  const addresses = new Set();
  for (const line of selection.lines ?? []) {
    const instruction = built.disassembly.find(
      (i) => i.sourceLine !== null && i.sourceLine - built.lineOffset === line,
    );
    if (instruction) addresses.add(instruction.address);
  }
  for (const address of selection.addresses ?? []) {
    try {
      const n = Number(BigInt(address));
      if (Number.isSafeInteger(n) && allowed.has(n)) addresses.add(n);
    } catch {}
  }
  return [...addresses].sort((a, b) => a - b).map(BigInt);
}

export function observedBytes(vm, address, count = 64) {
  const bytes = [];
  const cache = new Map();
  for (let offset = 0; offset < count; offset++) {
    const position = BigInt.asUintN(64, address + BigInt(offset));
    const aligned = position & ~7n;
    if (!cache.has(aligned)) {
      const error = new Uint8Array(1);
      const value = vm.load_doubleword(aligned, error);
      cache.set(aligned, error[0] ? null : value);
    }
    const value = cache.get(aligned);
    bytes.push(
      value === null ? null : Number((value >> ((position & 7n) * 8n)) & 255n),
    );
  }
  return bytes;
}

export function inspectionState(vm, built, watches = []) {
  const sp = vm.read_register(2);
  const stack = { address: hex(sp), bytes: observedBytes(vm, sp) };
  const samples = [];
  for (const watch of watches.slice(0, 8)) {
    if (
      !Number.isInteger(watch.offset) ||
      Math.abs(watch.offset) > 4096 ||
      ![1, 2, 4, 8].includes(watch.width)
    )
      continue;
    const index = registerIndex(watch.base);
    if (watch.base !== "lesson_data" && index < 0) continue;
    const base =
      watch.base === "lesson_data"
        ? BigInt(built.data)
        : vm.read_register(index);
    const address = BigInt.asUintN(64, base + BigInt(watch.offset));
    samples.push({
      id: watch.id,
      address: hex(address),
      bytes: observedBytes(vm, address, watch.width),
    });
  }
  return { stack, watches: samples };
}
