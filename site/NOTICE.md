# Runtime and toolchain provenance

The interface and new worker harness are [MIT licensed](LICENSE). Third-party components retain their own licences. All build and execution assets are served from this site; no CDN or compilation service is used. Source archives are optional downloads, not part of starting the lab.

## GNU assembler and linker

The four unmodified JavaScript/WebAssembly files in `vendor/binutils/` are from [Lucas Teske’s riscv-online-asm](https://github.com/racerxdl/riscv-online-asm/tree/0bc309eb8da8c2573e8f122067c52b815f13090c), commit `0bc309eb8da8c2573e8f122067c52b815f13090c`. They report **GNU binutils 2.46.0.20260210**, targeting `riscv64-linux-gnu`. This lab assembles RV64GC / LP64D and links freestanding xv6 user programs, not Linux programs.

GNU binutils is **GPL-3.0-or-later**: [licence](vendor/binutils/COPYING3), [complete corresponding binutils 2.46.0 source archive](sources/binutils-2.46.0.tar.xz), and [upstream build script including Emscripten flags and JavaScript adapter](sources/build-binutils.sh). The archive’s `bfd/version.h` records `BFD_VERSION_DATE 20260210`, matching the distributed tools. Upstream’s site/build script retains its [MIT notice](vendor/binutils/LICENSE-riscv-online-asm); that does not replace the GNU tools’ GPL licence.

The build script uses the Emscripten SDK (or its Docker image) to configure `--host=wasm32 --target=riscv64-linux-gnu` and builds gas and ld. The `assets.js` adapter exposes `FS` and `callMain`; it is included as a here-document in the script. Extract the source archive alongside the script as `binutils-2.46.0/` and run it with an activated Emscripten SDK. Upstream does not pin the SDK version, so this records provenance rather than promising a bit-identical rebuild.

## CPU and xv6 guest

The unmodified `vendor/runtime/riscv_emu_rust_wasm.js` and `_bg.wasm` are from [takahirox/riscv-rust](https://github.com/takahirox/riscv-rust/tree/8ee69d7a5dc7ef6d8b2bda96bf86d2923f2cf176), commit `8ee69d7a5dc7ef6d8b2bda96bf86d2923f2cf176`, under its [MIT licence](vendor/runtime/LICENSE-riscv-rust).

`images/kernel` and `images/fs.img` are unchanged from [snowch/xv6-lab](https://github.com/snowch/xv6-lab/tree/021d59ebe9112af3ebd1fd7823c3d70e94b85895), commit `021d59ebe9112af3ebd1fd7823c3d70e94b85895`. That guest is based on [MIT xv6-riscv](https://github.com/mit-pdos/xv6-riscv/tree/d7c0a1b7a703f7366942092f9cf421b6cd111a36), commit `d7c0a1b7a703f7366942092f9cf421b6cd111a36`: [MIT licence](vendor/runtime/LICENSE-xv6). The [matching guest source archive](sources/xv6-lab-guest.tar.gz) includes the added lab/workbench programs and build scripts. Build with a native RISC-V GCC/binutils toolchain: `make -C guest TOOLPREFIX=riscv64-linux-gnu- kernel/kernel fs.img`. The filesystem helper in `filesystem.js` is reused from xv6-lab under its [MIT licence](vendor/LICENSE-xv6-lab).

The guest uses RV64GC / LP64D and 16 MiB of managed RAM, preserving xv6-lab’s workaround for the pinned emulator’s debugger memory bounds limitation. Each run patches a copy of the filesystem’s `workbench` executable and boots a fresh guest. Existing xv6 programs and the kernel remain unchanged. The xv6 shell starts the executable; a random completion marker separates program output from the shell transcript. The full serial log remains available for inspecting boot messages and guest faults. This is functional emulation, not a hardware performance measurement.

The repository’s `asset-manifest.json` records SHA-256 checksums for every vendored binary, notice and source archive.
