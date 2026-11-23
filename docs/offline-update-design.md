# RISC-V offline and update adapter

Use the [shared offline/update design](https://github.com/snowch/cuda-cpp-lab/blob/main/docs/offline-update-design.md). The app has its own `riscv-assembly-lab:` cache prefix and never removes another lab's caches or learner work.

App status checks small release metadata at startup, on return online/visible and periodically. It does not automatically download the complete course or compiler. Save offline copy downloads and verifies every lesson, Calculator, built-in Reference, fonts, sources, diagrams, assembler, C compiler, kernel and emulator. Only a complete byte-verified release says Downloaded and ready to use offline. External websites still require a connection.

Online document navigation loads the published page. An already open document keeps a coherent immutable graph until reload. If a newer course exists, Reload latest course saves that window's work before reopening online; it does not consent to a full offline download. Update offline copy changes the saved copy explicitly. Restart to update promotes a verified pending release only after every controlled window acknowledges successful saving. Busy/paused runs, composition, failed storage or failed snapshot verification block restart and leave the working version intact.

`npm run build` generates authored HTML and stages `.build/site`, then creates SHA-256 metadata and immutable `releases/<id>/` files. Every nested HTML asset is resolved relative to its actual document path before pinning. Lesson navigation URLs stay logical. This avoids the easy-to-miss `releases/<id>/../../...` error in multi-page courses.

Publication retains the previous immutable releases with exact original bytes. First adoption also captures the earlier site's lazy asset URLs, including unchanged dependencies that a later update might replace. Subsequent publication verifies and preserves those compatibility aliases. A failed verification blocks publication. Fresh HTML uses immutable URLs; compatibility aliases are outside the new offline manifest.

Partial/interrupted downloads keep verified progress and the earlier complete copy. A repair rechecks files rather than trusting a remembered percentage. A fresh offline window must navigate to an unvisited lesson and execute actual code before readiness is accepted. Removing the offline copy preserves drafts, projects, completion, preferences and runtime-derived caches. Browsers can evict storage; request persistence when available without promising immunity.

Missing/corrupt runtime files are infrastructure failures. Keep the earlier genuine result, show a dimmed modal with Reload lesson and Stay on lesson, preserve work before reload, and name the action to retry. Escape stays on the lesson. An edited program with a different result is not a failed original-example check. A syntax or execution error does not require this download-recovery modal.

Required journeys include fresh online reading without WASM downloads; first save; navigation and fresh-tab execution offline; assembly/C/debugging; interruption/resume; corruption/repair; return online; online reload without a full save; A→B download/restart with two tabs and save/busy vetoes; removal preserving work; and an older unsaved tab's first Run after deployment. Run functional checks separately from claims about learning effectiveness.

Native Background Fetch is optional. If a visible online page sees no byte progress for 45 seconds, it hands the same consented job to foreground fetch. The worker imports only verified completed native responses, bounds unresolved records, and retries the remainder. Explicit Cancel revokes consent; this transport handoff does not. An earlier complete release stays usable throughout. A download percentage alone never establishes offline readiness.

The standalone Hello World page uses the same header, tool host, safe snapshot adapter and offline manifest as the generated lessons. Its original draft keys and complete-program linker script are retained. Its result is restored as an earlier observation, without execution.
