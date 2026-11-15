# RISC-V Assembly Lab

[Open the course](https://snowch.github.io/riscv-assembly-lab/) · [Start with addition](https://snowch.github.io/riscv-assembly-lab/lessons/addition/) · [Hello World](https://snowch.github.io/riscv-assembly-lab/lessons/hello-world/)

A complete core course in reading, writing and running RISC-V assembly, adapted with the author's permission from [Assembly Lab](https://snowch.github.io/assembly-lab/). The 58 short lessons cover first instructions, register readings, range checks, masks, branches, loops, memory, arrays, multiplication, functions, debugging, C and real xv6 programs, followed by three further readings.

The learner edits the relevant code. Supplied entry, capture and exit code stays behind **View complete program**. Predictions are checked against executed results; each programming challenge runs the same submitted code on fresh cases. No source interpreter or scripted result substitutes for machine execution.

## What runs

GNU `as` and `ld`, compiled to WebAssembly, produce real ELF64 executables. The CPU boots a real xv6 kernel and executes each program in a fresh filesystem copy. The target is RV64GC / LP64D. C lessons use the pinned RV64 TinyCC compiler locally, then link and execute its actual object. Compiler output is disassembled by real GNU `objdump`; no invented C source-line mapping is shown.

- A locally bundled CodeMirror editor for assembly and C, with syntax highlighting, indentation, bracket matching, find and undo.
- One execution toolbar, a resizable code area, fullscreen workspace and tabbed register, memory, output, diagnostic and debugger views.
- **Build & Run**, **Start debugging**, **Start stepping**, **Step instruction**, **Continue** and **Stop**.
- Actual relevant register values, signed/unsigned/hex readings, bit views and byte-addressed data or stack views.
- Exact assembly-line and actual instruction-address breakpoints. Continue revisits selected loop breakpoints; C uses real addresses without invented source mappings.
- Pinned register comparisons, memory watches sampled at pauses and 64 observed stack bytes with exact symbol/address matches. Stack rows are not an inferred call stack.
- Four debugging investigations: loop boundaries, load width, return-address preservation and access order. A source line can expand into several instructions.
- Multi-case challenges, specific hints, reference solutions and case inspection.
- Source-line diagnostics, separate exploration/challenge drafts, completion marks and an explicit tab-only fallback when storage is unavailable.
- Phone/desktop layouts, light/dark/system themes, course navigation and source downloads.
- Complete assembly downloads; C functions and their supplied assembly/linker script download together as ZIP.

There is no compiler server, account, CDN dependency, SharedArrayBuffer or special hosting-header requirement. Everything builds and executes in a disposable browser worker. The first arithmetic examples use three focused lines. The same editor supports longer assembly and C programs.

## Course and authoring

`content/*.json` holds the canonical prose, code, predictions, fixtures, hints and exercises. `tools/build-course.js` validates it and generates the static course overview and every lesson page. Module lists, routes and published counts are generated from actual data. The original Hello World remains an optional complete-program example, rather than recurring setup in every lesson.

The optional [Using the workbench](https://snowch.github.io/riscv-assembly-lab/using-the-workbench/) guide is generated from `content/guides/workbench.json` and displays addition's canonical starter. It is linked from the home page, first lesson and editor help, and stays outside lesson progression and completion.

The course reuses Assembly Lab’s predict/run/inspect/change method, short-unit pacing, trip-computer examples and local qualifications. RISC-V has no NZCV flags: carry, overflow checks, comparisons, 32-bit W extension, division edges and the calling convention are adapted to its architecture. The ending follows xv6 system calls, ELF entry, protection and a bounded trip-computer capstone; it does not republish Arm-specific Raspberry Pi procedures as RISC-V instructions.

`docs/course-authoring.md` records the checked-fact contract. Separate drafting and independent technical/learner reviews are recorded under `docs/`. The source course’s content copyright is preserved; it is not silently relicensed as MIT.

## Develop and check

```sh
npm ci
npm run build:editor
npm run build:course
npm run serve
# http://localhost:4220
```

Run the same checks used by CI:

```sh
npm run build:editor
git diff --exit-code -- site/vendor/editor/ asset-manifest.json
npm run check:assets
npm run build:course
git diff --exit-code -- site/index.html site/lessons/ site/using-the-workbench/ site/course/catalog.json
npm test
# Install qemu-user for qemu-riscv64, or set RISCV_QEMU to its path.
npm run test:course
npx playwright install --with-deps chromium
npm run test:browser
```

`npm test` covers actual GNU/TinyCC compilation, byte and register captures, source diagnostics, real stepping, C aggregate initialisation and guard read/write faults. `test:course` runs every worked example in xv6 and checks the portable challenge corpus against independent QEMU user-mode execution. xv6 system-call exercises are checked with their actual xv6 ABI, not passed off as Linux programs. It also verifies incomplete challenge starters fail a case. Browser checks cover the entire catalogue in both themes at phone/desktop widths plus the actual editor, stepping, grading, C compilation, source downloads, persistence and error recovery flows.

## Runtime correction

The inherited CPU ignored the PTE U bit and incorrectly let user programs read supervisor-only guard pages. The distributed CPU is rebuilt with a targeted permission/cache correction. Independent integration checks now observe actual xv6 load/store page faults at the guard boundary while the safe reference succeeds. Locked source and build records are included; a clean rebuild produces the same WASM bytes. The patch does not claim complete privileged-ISA compliance.

## Scope

Programs are xv6 user processes. Its `write = 16` and `exit = 2` are not Linux or RARS syscall numbers. The guest retains the 16 MiB debugger compatibility workaround. Default supplied assembly disables compressed encodings for simpler instruction paths; this choice is visible in full source.

Source is limited to 64 KiB; C prepared source to 7500 bytes and its object to 8192 bytes. Executables are at most 256 KiB, console output 64 KiB, builds 15 seconds and active runs 30 seconds; asset loading has a separate cancellable two-minute limit. Stepping is functional emulation, not hardware timing. A state report or passed finite test set is not a proof for every possible program. Guest filesystem changes are discarded. Console input and physical-board execution are not supplied by this course.

Optional floating-point material interprets binary32 representations with integer instructions and an explicitly labelled numeric bit interpretation. The guest does not provide floating-point process-state management, and the course does not claim it executes floating-point instructions.

## Source and licences

[Distributed provenance and licences](site/NOTICE.md) records exact revisions, complete GNU/TinyCC sources, the patched CPU source, guest sources and all notices. `asset-manifest.json` pins distributed assets with SHA-256 checksums. GNU binutils is GPL-3.0-or-later; TinyCC is LGPL-2.1-or-later; CPU/xv6 and interface integration retain their stated MIT licences. Lesson prose/exercises adapted from Assembly Lab remain © 2026 Christopher Snow, all rights reserved, under [the content licence](content/LICENSE).
