// A disposable worker owns both the build and a fresh xv6 machine.
importScripts('./vendor/binutils/riscv64-linux-gnu-as.js');
const createAssembler = Module;
importScripts('./vendor/binutils/riscv64-linux-gnu-ld.js');
const createLinker = Module;
const send = (type, data = {}) => postMessage({ type, ...data });
async function asset(path, text = false) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path} (HTTP ${response.status}). Retry Build & Run.`);
  return text ? response.text() : new Uint8Array(await response.arrayBuffer());
}
onmessage = async ({ data }) => {
  try {
    send('phase', { phase: 'loading', message: 'Loading tools and xv6…' });
    const [as, ld, script, kernel, disk, runtime, builder, filesystem] = await Promise.all([
      asset('./vendor/binutils/as-new.wasm'), asset('./vendor/binutils/ld-new.wasm'),
      asset('./user.ld', true), asset('./images/kernel'), asset('./images/fs.img'),
      import('./vendor/runtime/riscv_emu_rust_wasm.js'), import('./build.js'), import('./filesystem.js'),
    ]);
    send('phase', { phase: 'building', message: 'Assembling and linking…' });
    const built = await builder.buildProgram(data.source, { as, ld, script }, { as: createAssembler, ld: createLinker });
    send('built', { diagnostics: built.diagnostics, bytes: built.elf.length });
    await runtime.default('./vendor/runtime/riscv_emu_rust_wasm_bg.wasm');
    const vm = runtime.WasmRiscv.new();
    vm.setup_program(kernel);
    vm.setup_filesystem(filesystem.replaceGuestFile(disk, 'workbench', built.elf));
    const token = '__LAB_DONE_' + crypto.randomUUID().replaceAll('-', '') + '__';
    const command = `workbench; echo ${token}\n`;
    let stage = 'boot', pending = '', outputBytes = 0;
    const decoder = new TextDecoder();
    const started = performance.now();
    send('phase', { phase: 'running', message: 'Starting xv6…' });
    function tick() {
      try {
        if (performance.now() - started > 30000) throw new Error('Stopped after 30 seconds. Check for a loop or a missing exit system call.');
        vm.run_cycles(100000);
        const bytes = []; let byte;
        while ((byte = vm.get_output()) !== 0) bytes.push(byte);
        if (bytes.length) {
          outputBytes += bytes.length;
          if (outputBytes > 65536) throw new Error('Stopped at the 64 KiB console output limit.');
          const chunk = decoder.decode(new Uint8Array(bytes), { stream: true });
          send('serial', { text: chunk });
          pending += chunk.replaceAll('\r', '');
          if (stage === 'boot' && pending.endsWith('$ ')) {
            pending = ''; stage = 'echo';
            for (const byte of new TextEncoder().encode(command)) vm.put_input(byte);
          }
          if (stage === 'echo') {
            const end = pending.indexOf('\n');
            if (end >= 0) { pending = pending.slice(end + 1); stage = 'program'; send('phase', { phase: 'running', message: 'Running your program…' }); }
          }
          if (stage === 'program') {
            const end = pending.indexOf(token);
            if (end >= 0) {
              // echo writes one final newline; the random marker itself is not program output.
              send('output', { text: pending.slice(0, end) });
              vm.free(); send('done'); return;
            }
            // Retain only a possible partial marker between chunks.
            let keep = 0;
            for (let n = 1; n < token.length && n <= pending.length; n++)
              if (pending.endsWith(token.slice(0, n))) keep = n;
            const endSafe = pending.length - keep;
            if (endSafe) { send('output', { text: pending.slice(0, endSafe) }); pending = pending.slice(endSafe); }
          }
        }
        setTimeout(tick, 0);
      } catch (error) {
        // A trapped Rust call may leave the wasm-bindgen borrow guard held.
        // Do not call back into that CPU (including free); the UI retires this worker.
        send('error', { message: 'CPU stopped. Check for a loop, invalid instruction or memory access. ' + (error.message || String(error)) });
      }
    }
    tick();
  } catch (error) { send('error', { message: error.message || String(error) }); }
};
