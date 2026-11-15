// Test-only adapter for the unchanged Emscripten CommonJS/AMD wrappers.
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export async function tool(name) {
  const context = { require, module: { exports: {} }, exports: {}, process: { ...process, exitCode: 0 }, console, __dirname: '/tmp' };
  vm.runInNewContext(await readFile(new URL(`../site/vendor/binutils/riscv64-linux-gnu-${name}.js`, import.meta.url), 'utf8'), context);
  return context.module.exports;
}
export async function assets() {
  const base = new URL('../site/', import.meta.url);
  return {
    as: await readFile(new URL('vendor/binutils/as-new.wasm', base)),
    ld: await readFile(new URL('vendor/binutils/ld-new.wasm', base)),
    script: await readFile(new URL('user.ld', base), 'utf8'),
  };
}
