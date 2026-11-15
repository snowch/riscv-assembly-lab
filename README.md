# RISC-V Assembly Lab

[Open the lab](https://snowch.github.io/riscv-assembly-lab/) · [All labs](https://snowch.github.io/labs/)

A first working example: edit **Hello, RISC-V!**, assemble and link it in the browser, and run the actual executable inside a disposable xv6 guest. This is a small prototype, not a complete course or debugger.

- Real WebAssembly GNU `as` and `ld`, accepting standard GNU RISC-V assembly, labels and pseudo-instructions.
- Real ELF64 RISC-V executables running on the same WebAssembly CPU and pinned xv6 images as [xv6 Lab](https://snowch.github.io/xv6-lab/).
- Editable source, source-line diagnostics, Build & Run, Stop, console and full serial log.
- Browser draft storage with a tab-only fallback; source download and undoable starter restore.
- Responsive light/dark/system themes, keyboard shortcut (Ctrl/Cmd + Enter), accessible plain-text editor.
- No backend, account, SharedArrayBuffer or special hosting headers. GitHub Pages serves all assets, including corresponding sources and licences.

The starter targets **RV64GC / LP64D**, defines `_start`, and uses **xv6** system calls: `write = 16`, `exit = 2`. These are not Linux or RARS system call numbers. First-run assets total approximately 8 MB; source archives are downloaded only on request.

## Develop

```sh
npm ci
npm run serve
# http://localhost:4220
```

The static site is `site/`; there is no frontend build step. After edits:

```sh
npm run check:assets
npm test
npx playwright install --with-deps chromium
npm run test:browser
```

Unit integration tests invoke the actual vendored GNU assembler/linker and execute both the starter and edited messages in real xv6 guests. Browser tests exercise the actual worker pipeline, source diagnostics, storage, error recovery, stop/restart, snapshot freshness and phone/desktop themes. The Pages workflow runs these checks before deployment on `main`.

## Scope and limits

One assembly file, no C preprocessor, external libraries, interactive console input or stepping. Source ≤64 KiB, linked executable ≤256 KiB, serial output ≤64 KiB, execution ≤30 seconds. Compilation/linking have a separate 15-second deadline; asset loading can take up to two minutes and is cancellable. Each run starts a new worker and a fresh filesystem copy. Stop terminates the worker even for a guest loop or a busy assembler. Program output is actual UART output; no source substitutions simulate execution.

The shell completion marker reports that execution returned to the shell; it does not grade the program or report its numeric exit status. Guest faults can be inspected in the full serial log. This prototype has no persistent guest filesystem or performance claims.

Next steps can build on this vertical slice: console input, instruction stepping and registers, then a first lesson. The Arm [Assembly Lab](https://snowch.github.io/assembly-lab/) stays a separate project.

## Third-party source and licences

See [the distributed notice](site/NOTICE.md) for exact revisions, licences, build instructions and corresponding source archives. GNU binutils is GPL-3.0-or-later. The CPU, xv6 guest and interface retain their MIT licences. Vendored artifacts remain unchanged; `asset-manifest.json` records their checksums. Source archives are included in the deployed site alongside the tools.
