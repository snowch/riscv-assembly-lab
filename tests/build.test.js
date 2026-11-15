import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildProgram } from '../site/build.js';
import { replaceGuestFile } from '../site/filesystem.js';
import init, { WasmRiscv } from '../site/vendor/runtime/riscv_emu_rust_wasm.js';
import { tool, assets } from '../tools/node-toolchain.js';
const factories = { as: await tool('as'), ld: await tool('ld') };
const inputs = await assets();
const source = await readFile(new URL('../site/hello.s', import.meta.url), 'utf8');
await init(await readFile(new URL('../site/vendor/runtime/riscv_emu_rust_wasm_bg.wasm', import.meta.url)));
function execute(elf) {
  const machine = WasmRiscv.new();
  machine.setup_program(new Uint8Array(kernel));
  const disposable = replaceGuestFile(disk, 'workbench', elf);
  machine.setup_filesystem(disposable);
  let output = '', sent = false;
  try {
    for (let i = 0; i < 3000; i++) {
      machine.run_cycles(100000); let c;
      while ((c = machine.get_output()) !== 0) output += String.fromCharCode(c);
      if (!sent && output.endsWith('$ ')) {
        for (const byte of new TextEncoder().encode('workbench; echo __DONE__\n')) machine.put_input(byte);
        sent = true;
      }
      if (output.includes('\n__DONE__')) return output;
    }
    throw new Error('Guest did not finish: ' + output);
  } finally { machine.free(); }
}
const kernel = await readFile(new URL('../site/images/kernel', import.meta.url));
const disk = await readFile(new URL('../site/images/fs.img', import.meta.url));
test('GNU as + ld produce real RISC-V ELF; fresh xv6 guests execute edited text', async () => {
  for (const message of ['Hello, RISC-V!', 'A different message!']) {
    const built = await buildProgram(source.replace('Hello, RISC-V!', message), inputs, factories);
    assert.equal(built.elf[0], 127);
    assert.equal(new DataView(built.elf.buffer).getUint16(18, true), 243);
    assert.ok(execute(built.elf).includes('\n' + message + '\n__DONE__'));
  }
  assert.deepEqual(disk, await readFile(new URL('../site/images/fs.img', import.meta.url)), 'base disk must remain unchanged');
});
test('assembler errors preserve actual source lines', async () => {
  await assert.rejects(buildProgram('.text\n.global _start\n_start:\n  not_an_instruction a0,1', inputs, factories), /hello\.s:4: Error/);
});
test('missing entry and undefined symbols fail linking', async () => {
  await assert.rejects(buildProgram('.text\naddi a0,a0,1', inputs, factories), /_start/);
  await assert.rejects(buildProgram('.text\n.global _start\n_start: call missing', inputs, factories), /undefined reference/);
});
test('empty and excessive source fail before the assembler', async () => {
  await assert.rejects(buildProgram('', inputs, factories), /Enter an assembly/);
  await assert.rejects(buildProgram('#'.repeat(65537), inputs, factories), /64 KiB/);
});
