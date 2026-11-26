# Runtime and toolchain provenance

The interface and new worker harness are [MIT licensed](LICENSE). Third-party components retain their own licences. All build and execution assets are served from this site; no CDN or compilation service is used. Source archives are optional downloads, not part of starting the lab.

## Source editor

The source editor uses locally bundled [CodeMirror 6](https://codemirror.net/) and its C/C++ language support. The original RISC-V highlighting rules colour assembly notation; they do not validate instructions or replace GNU assembler diagnostics. Exact package versions are pinned in the repository lockfile and recorded in `asset-manifest.json`. The bundle and third-party licences are available at [codemirror.js](vendor/editor/codemirror.js) and [LICENSES.txt](vendor/editor/LICENSES.txt). Rebuild with `npm ci` followed by `npm run build:editor`.

## GNU assembler and linker

The assembler, linker and disassembler JavaScript/WebAssembly files in `vendor/binutils/` are from [Lucas Teske’s riscv-online-asm](https://github.com/racerxdl/riscv-online-asm/tree/0bc309eb8da8c2573e8f122067c52b815f13090c), commit `0bc309eb8da8c2573e8f122067c52b815f13090c`. They report **GNU binutils 2.46.0.20260210**, targeting `riscv64-linux-gnu`. This lab assembles RV64GC / LP64D and links freestanding xv6 user programs, not Linux programs.

GNU binutils is **GPL-3.0-or-later**: [licence](vendor/binutils/COPYING3), [complete corresponding binutils 2.46.0 source archive](sources/binutils-2.46.0.tar.xz), and [upstream build script including Emscripten flags and JavaScript adapter](sources/build-binutils.sh). The archive’s `bfd/version.h` records `BFD_VERSION_DATE 20260210`, matching the distributed tools. Upstream’s site/build script retains its [MIT notice](vendor/binutils/LICENSE-riscv-online-asm); that does not replace the GNU tools’ GPL licence.

The build script uses the Emscripten SDK (or its Docker image) to configure `--host=wasm32 --target=riscv64-linux-gnu` and builds gas and ld. The `assets.js` adapter exposes `FS` and `callMain`; it is included as a here-document in the script. Extract the source archive alongside the script as `binutils-2.46.0/` and run it with an activated Emscripten SDK. Upstream does not pin the SDK version, so this records provenance rather than promising a bit-identical rebuild.

## CPU and xv6 guest

The CPU is rebuilt, with the correction documented below, from [takahirox/riscv-rust](https://github.com/takahirox/riscv-rust/tree/8ee69d7a5dc7ef6d8b2bda96bf86d2923f2cf176), commit `8ee69d7a5dc7ef6d8b2bda96bf86d2923f2cf176`, under its [MIT licence](vendor/runtime/LICENSE-riscv-rust).

`images/kernel` and `images/fs.img` are unchanged from [snowch/xv6-lab](https://github.com/snowch/xv6-lab/tree/021d59ebe9112af3ebd1fd7823c3d70e94b85895), commit `021d59ebe9112af3ebd1fd7823c3d70e94b85895`. That guest is based on [MIT xv6-riscv](https://github.com/mit-pdos/xv6-riscv/tree/d7c0a1b7a703f7366942092f9cf421b6cd111a36), commit `d7c0a1b7a703f7366942092f9cf421b6cd111a36`: [MIT licence](vendor/runtime/LICENSE-xv6). The [matching guest source archive](sources/xv6-lab-guest.tar.gz) includes the added lab/workbench programs and build scripts. Build with a native RISC-V GCC/binutils toolchain: `make -C guest TOOLPREFIX=riscv64-linux-gnu- kernel/kernel fs.img`. The filesystem helper in `filesystem.js` is reused from xv6-lab under its [MIT licence](vendor/LICENSE-xv6-lab).

The guest uses RV64GC / LP64D and 16 MiB of managed RAM, preserving xv6-lab’s workaround for the pinned emulator’s debugger memory bounds limitation. Each run patches a copy of the filesystem’s `workbench` executable and boots a fresh guest. Existing xv6 programs and the kernel remain unchanged. The xv6 shell starts the executable; a random completion marker separates program output from the shell transcript. The full serial log remains available for inspecting boot messages and guest faults. The lesson Program output view removes only the complete owned register-report frame so the learner’s console text remains visible; the raw serial log retains that frame. This is functional emulation, not a hardware performance measurement.

The repository’s `asset-manifest.json` records SHA-256 checksums for every vendored binary, notice and source archive.

## Complete course and content

The lesson sequence, trip-computer situations, exercises and predict/run/inspect/change method are adapted with the author’s explicit permission from [Christopher Snow’s Assembly Lab](https://github.com/snowch/assembly-lab). Its original content is **Copyright © 2026 Christopher Snow, all rights reserved**. That content licence is preserved for the adapted lesson prose and exercises: [content notice](CONTENT-LICENSE). The interface and runtime integration remain separately MIT licensed. Lesson data records the related source lesson slugs and the architecture-specific redesign.

RISC-V instructions are checked against the official ISA manual and calling convention linked from each lesson. RISC-V has no Arm NZCV flags; arithmetic checks and branches are rewritten accordingly. RV64 W arithmetic sign-extends its 32-bit result. The concluding environment is xv6/ELF, not Arm Raspberry Pi startup. Optional floating-point material interprets binary32 bits using integer loads and a labelled numeric interpretation; it does not execute floating-point instructions in the guest.

## Runtime correction and reproducible source

The CPU wrapper and WebAssembly binary are now **rebuilt from the same pinned riscv-rust revision**, with a targeted permission correction. The prior binary ignored PTE U bits, so user loads could incorrectly read xv6’s guard page. The patch enforces User/Supervisor page permissions, SUM/MXR, MPRV’s current MPP positions and translation-cache invalidation, including SFENCE.VMA. It does not claim complete privileged-ISA conformance. The 16 MiB guest/debugger bounds workaround remains.

[Patched source and locked build archive](sources/riscv-rust-permissions-source.tar.gz) · [patch](sources/riscv-rust-permissions.patch) · [dependency notices](vendor/runtime/THIRD_PARTY_NOTICES.txt). The exact build uses Rust **1.85.1**, target `wasm32-unknown-unknown`, and wasm-bindgen **0.2.100**. A clean source extraction and rebuild produces the same WASM SHA-256 recorded in the repository manifest. Native Rust tests pass 29 cases, with 11 pre-existing upstream ignored tests; integration checks verify actual xv6 guard read/write faults and valid execution. Full source/build records and independent technical review are in the repository’s `docs/`.

## Browser C compiler and disassembler

C lessons use the unchanged RV64 TinyCC WebAssembly binary from [lupyuen/tcc-riscv32-wasm](https://github.com/lupyuen/tcc-riscv32-wasm/tree/8cffa69ed303d80206b7cb6e6e3737506243777c), commit `8cffa69ed303d80206b7cb6e6e3737506243777c`. Despite its repository name, it targets 64-bit RISC-V. TinyCC is LGPL-2.1-or-later: [licence](vendor/compiler/COPYING-LGPL-2.1.txt), [complete corresponding source](sources/tcc-source.tar.gz). Its MIT-licensed adapter is reused from xv6-lab.

Compilation uses `-c -nostdinc -fno-common`, with no host headers or libc. The adapter limits prepared C source to 7500 bytes and object output to 8192 bytes. The supplied assembly includes small `memset`/`memcpy` helpers for compiler-generated memory initialisation and copy operations. GNU ld links the real object with the visible caller and reporter. GNU objdump is an additional unchanged binary/wrapper from the same pinned riscv-online-asm binutils build, with the GPL licence and complete source archive already linked above.

The displayed C listing is actual TinyCC output disassembled by GNU objdump, not GCC output. This compiler build does not emit source-line mappings; the page does not invent them. Assembly lessons’ optional C companions are explicitly labelled equivalent intent, not compiler listings. C source and its supplied assembly caller can be downloaded together as a ZIP.

## Instruction observations and exercise checks

Registers and byte memory come from the executed CPU or the program’s captured state report. Instruction stepping uses real CPU breakpoints and instruction disassembly. Assembly-line breakpoints target the first actual instruction emitted for that exact line; blank/comment/label lines do not move silently to another line. C breakpoints use actual disassembled addresses without source-line claims. Continue advances the paused CPU and stops at the next selected breakpoint or the reporting checkpoint. Register and bounded memory watches compare observations at pauses; they do not halt on memory changes. The stack view reads 64 bytes at the current sp and labels only exact observed symbol/instruction matches, without inventing an unwound call stack. A source line can expand into several instructions. The default supplied assembly selects non-compressed instructions for simpler paths; this is visible in the complete source. Traces describe functional instruction state, not hardware timing.

Each challenge runs the submitted code on fresh xv6 guests for its listed cases. It compares observed register patterns and requested byte values, plus explicit stack-preservation checks where required. Passing finite cases is not a proof for every possible program or every access-order property. Guard-boundary cases catch the taught read-before-check error at the protected page, and the explanatory source still shows the order explicitly. System-call exercises use xv6’s ABI and are not presented as Linux programs.

## Front-page illustration

The processor-and-code illustration was generated for this site and exported as a WebP asset of about 80 KiB. It is decorative artwork. Digital Design supplied the visual reference for the hero layout and grouped navigation; the illustration is original to this site.

## Programmer calculator

The exact integer parsing, bit-pattern arithmetic and addition-carries helpers in `course/calculator-model.js` are adapted with the author's permission from [Christopher Snow's Assembly Lab calculator model](https://github.com/snowch/assembly-lab/blob/2988f4d002195734c4eb9c0082b9e88a41cbb037/packages/machine/src/programmer-calculator.ts). This file retains **Copyright © 2026 Christopher Snow, all rights reserved**. The source's mask, clamp, signed reading and compute attribution to [snowch/programmer-calculator at efa1584](https://github.com/snowch/programmer-calculator/tree/efa1584bd6deb69b2e287aae579739c4a73bf052) is preserved in the file. The new dialog and RISC-V-specific integration are part of this site's MIT-licensed interface.

This calculator performs separate mathematical scratch work using exact integers. It does not execute instructions, update guest registers or supply prediction answers. Width changes and input validation are calculator controls. Optional carry and signed-overflow readings describe the addition's bit patterns; they are not processor condition flags.

## Independent playground

The standalone playground and its project manager are original additions using this site's existing editor, GNU/TinyCC tools, RISC-V emulator and xv6 guest under the licences recorded above. No AArch64 Playground source, styles, artwork or teaching examples were imported. Canonical examples come from this course with its existing content attribution. Complete assembly projects define their own entry and exit; their source is not wrapped by the lesson reporter. Debugger observations retain their sampled moment, and a last pause is not represented as an exit state.

## Shared interface assets

IBM Plex Sans and Mono are bundled under the SIL Open Font License; see `fonts/ibmplexsans-OFL.txt` and `fonts/ibmplexmono-OFL.txt`. Material Symbols Rounded are by Google, Apache-2.0; see `fonts/material-symbols-Apache-2.0.txt`. These assets are served by this course and included in the verified offline copy.

## Raspberry Pi Pico 2 firmware

The [trip computer UF2](pico2/trip_computer.uf2) is built from the [Pico 2 assembly source](pico2/trip.S) with Pico SDK 2.3.1, TinyUSB, and the Raspberry Pi GNU RISC-V toolchain. The [board guide](pico2/) provides the build instructions. See the [firmware sources and licences](pico2/THIRD-PARTY-NOTICES.txt) for upstream revisions and notices.

The browser builder links against a [relocatable SDK runtime](pico2/runtime.o) and a [flattened SDK linker script](pico2/runtime.ld) from the same build. To regenerate them, follow the board guide’s SDK build steps with the Unix Makefiles generator, then run `python3 tools/prepare-pico2-runtime.py /path/to/build` and update the two hashes in `asset-manifest.json`. The browser packs the linked ELF using the [UF2 format](https://github.com/microsoft/uf2) and follows [picotool’s RP2350 flash layout](https://github.com/raspberrypi/picotool/tree/2.3.1/elf2uf2).
