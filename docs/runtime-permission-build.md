# RISC-V page permission correction

Upstream: https://github.com/takahirox/riscv-rust at `8ee69d7a5dc7ef6d8b2bda96bf86d2923f2cf176`, MIT licence. New patch: Copyright © 2026 Christopher Snow, MIT.

## Artifacts

Use `web-final/riscv_emu_rust_wasm.js` **and** `web-final/riscv_emu_rust_wasm_bg.wasm` together. The exported `WasmRiscv` methods retain the upstream public API. This uses wasm-bindgen 0.2.100, so preferred initialization is `await init({ module_or_path: bytesOrUrl })`; the old direct argument still works but logs a deprecation warning.

`web/` is an earlier build before a test-only addition; its WASM hash is identical. `manifest.json` records final artifact hashes, exact versions, upstream revision and test totals. `THIRD_PARTY_NOTICES.txt` preserves runtime dependency and Rust notices alongside the upstream MIT licence.

## Correction

The pinned emulator read the PTE U bit into an unused variable. A user instruction could therefore access a valid supervisor-only leaf, including xv6's stack guard page. The patch:

- Requires U=1 for user-mode instruction fetches, loads and stores.
- Denies supervisor fetches from U=1 pages regardless of SUM.
- Allows supervisor data accesses to U=1 pages only when mstatus.SUM (bit 18) is set.
- Uses mstatus.MXR (bit 19) for reads of execute-only pages, without granting stores.
- Checks those permissions before modifying a leaf's accessed/dirty bits.
- Flushes experimental address caches when MPRV, MPP, SUM or MXR change, as well as on existing privilege/translation updates.
- Corrects MPRV's effective MPP extraction to mstatus bits 12:11 rather than 10:9.
- Implements SFENCE.VMA by flushing all translation-cache entries, which is valid even for a narrower requested fence.

The experimental cache still requires translation fences after page-table updates; it does not inspect every physical page-table store. It stays disabled by default. This is a targeted correction, not a claim of complete privileged-ISA conformance. The existing debugger byte/u64 bounds limitation is unchanged; the lab retains its 16 MiB managed-guest workaround.

## Rebuild

The source directory is `/workspace/riscv-rust-source`. `permissions.patch` applies to the pinned revision. `Cargo.lock` is retained explicitly because upstream ignores it.

An official, non-root Rust installation was made with:

```sh
RUSTUP_HOME=/workspace/riscv-rust-build/rustup \
CARGO_HOME=/workspace/riscv-rust-build/cargo \
sh /workspace/riscv-rust-build/rustup-init.sh -y --no-modify-path \
  --profile minimal --default-toolchain 1.85.1 --target wasm32-unknown-unknown
```

The matching official wasm-bindgen CLI 0.2.100 musl archive was downloaded from the release URL in `manifest.json`. The wasm crate pins `wasm-bindgen = "=0.2.100"`.

With that installation available, run `./rebuild.sh /workspace/riscv-rust-source`. The script uses `cargo +1.85.1 test --locked -p riscv_emu_rust --lib`, then a locked release build for wasm32-unknown-unknown, then `wasm-bindgen --target web --no-typescript`. For a fresh checkout, first apply `permissions.patch` and copy the retained `Cargo.lock` to the source root. The source archive contains all files needed to build the patched library and WebAssembly wrapper, the workspace manifests, lockfile, notices and this rebuild record. It excludes unrelated upstream guest images, old precompiled website/npm artifacts, Git metadata and build outputs.

## Verification

`tests.log`: **29 passed, 0 failed, 11 pre-existing ignored**. Ten new tests cover user guard read/write/execute denial under SV32 and SV39 (cache enabled and disabled), permitted user access, SUM, MXR, privilege transitions, status-driven cache invalidation, current MPP positions under MPRV, unchanged A/D bits on denied access, explicit cache invalidation, and actual execution of an SFENCE.VMA instruction.

`guard-smoke.mjs` is a Node integration smoke test using the new lab's actual GNU build pipeline, matching xv6 kernel/disk and this new CPU. It checks a valid program completes its real register report, a read one byte beyond the 64-byte teaching region traps with scause 13, and a write there traps with scause 15. Neither fault emits a success report. It imports the lab from `/workspace/riscv-assembly-lab` and is intended for this shared verification workspace; the parent performs the full independent course/stepping/browser suite.

The initial ad hoc smoke assertion expected `scause=` while xv6 prints `scause `; it failed on that assertion format even though the CPU correctly produced the expected load-page fault. The saved smoke script uses the actual xv6 output format. That failed ad hoc command is not counted as a passing run.
