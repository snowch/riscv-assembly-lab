// GNU as and ld run unchanged inside WebAssembly. Each build gets fresh instances.
export const MAX_SOURCE_BYTES = 65536;
export async function buildProgram(
  source,
  assets,
  factories,
  filename = "hello.s",
) {
  if (!/^[a-zA-Z0-9_-]+\.s$/.test(filename))
    throw new Error("Invalid assembly filename.");
  if (!source.trim())
    throw new Error(`${filename}:1: Error: Enter an assembly program first.`);
  if (new TextEncoder().encode(source).length > MAX_SOURCE_BYTES)
    throw new Error("This prototype accepts at most 64 KiB of source.");
  const pico2 = assets.target === "pico2";
  let diagnostics = "";
  const report = (line) => {
    if (diagnostics.length < 32000) diagnostics += line + "\n";
  };
  const options = { noInitialRun: true, print: report, printErr: report };
  const assembler = await factories.as({ ...options, wasmBinary: assets.as });
  assembler.FS.writeFile(filename, source);
  let status;
  try {
    status = assembler.callMain([
      pico2 ? "-march=rv32imac" : "-march=rv64gc",
      pico2 ? "-mabi=ilp32" : "-mabi=lp64d",
      "-mno-relax",
      ...(assets.debug ? ["-g"] : []),
      filename,
      "-o",
      "hello.o",
    ]);
  } catch (error) {
    throw new Error(diagnostics.trim() || String(error));
  }
  if (status) throw new Error(diagnostics.trim() || "Assembly failed.");
  const linker = await factories.ld({ ...options, wasmBinary: assets.ld });
  linker.FS.writeFile("hello.o", assembler.FS.readFile("hello.o"));
  linker.FS.writeFile("user.ld", assets.script);
  const objects = Object.entries(assets.objects ?? {});
  for (const [name, bytes] of objects) linker.FS.writeFile(name, bytes);
  try {
    status = linker.callMain([
      ...(pico2
        ? ["-melf32lriscv", "--gc-sections", "-z", "max-page-size=4096", "--no-warn-rwx-segments", "--require-defined=main"]
        : ["--no-relax", "--require-defined=_start"]),
      "-T",
      "user.ld",
      "hello.o",
      ...objects.map(([name]) => name),
      "-o",
      "hello.elf",
    ]);
  } catch (error) {
    throw new Error(diagnostics.trim() || String(error));
  }
  if (status) throw new Error(diagnostics.trim() || "Linking failed.");
  const elf = linker.FS.readFile("hello.elf").slice();
  if (elf.length > 256 * 1024)
    throw new Error("The executable exceeds this prototype’s 256 KiB limit.");
  return { elf, diagnostics: diagnostics.trim() };
}
