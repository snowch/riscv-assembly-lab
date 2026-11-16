// Copyright © 2026 Christopher Snow
// A fresh worker owns the compiler and one real xv6 machine. Stop retires it.
importScripts("../vendor/binutils/riscv64-linux-gnu-as.js");
const createAssembler = Module;
importScripts("../vendor/binutils/riscv64-linux-gnu-ld.js");
const createLinker = Module;
importScripts("../vendor/binutils/riscv64-linux-gnu-objdump.js");
const createObjdump = Module;
const send = (type, data = {}) => postMessage({ type, ...data });
let vm,
  built,
  lesson,
  mode = "idle",
  stage = "boot",
  pending = "",
  token = "",
  outputBytes = 0,
  activeStarted = 0,
  stopped = false,
  stepCount = 0,
  initialSp = null,
  inspection,
  breakpointSelection = {},
  selectedBreakpoints = [],
  watches = [],
  pendingStep = null,
  startAtBreakpoint = false;
const decoder = new TextDecoder();
const text = (value) =>
  "0x" + BigInt.asUintN(64, BigInt(value)).toString(16).padStart(16, "0");
async function asset(path, plain = false) {
  const r = await fetch(path);
  if (!r.ok)
    throw new Error(
      `Could not load ${path} (HTTP ${r.status}). Retry Build & Run.`,
    );
  return plain ? r.text() : new Uint8Array(await r.arrayBuffer());
}
function drain() {
  const bytes = [];
  let c;
  while ((c = vm.get_output()) !== 0) bytes.push(c);
  return decoder.decode(new Uint8Array(bytes), { stream: true });
}
function finish(error) {
  if (stopped) return;
  stopped = true;
  mode = "finished";
  if (error) send("error", { message: error.message || String(error) });
  else {
    vm.free();
    send("done");
  }
}
function consume() {
  const chunk = drain();
  if (!chunk) return;
  outputBytes += chunk.length;
  if (outputBytes > 65536)
    throw new Error("Stopped at the 64 KiB console output limit.");
  send("serial", { text: chunk });
  pending += chunk.replaceAll("\r", "");
  if (stage === "boot" && pending.endsWith("$ ")) {
    pending = "";
    stage = "echo";
    mode = lesson.debug ? "seek" : "fast";
    for (const byte of new TextEncoder().encode(`workbench; echo ${token}\n`))
      vm.put_input(byte);
  }
  if (stage === "echo") {
    const end = pending.indexOf("\n");
    if (end >= 0) {
      pending = pending.slice(end + 1);
      stage = "program";
    }
  }
  if (stage !== "program") return;
  const end = pending.indexOf(token);
  if (end >= 0) {
    send("output", { text: pending.slice(0, end) });
    finish();
    return;
  }
  let keep = 0;
  for (let n = 1; n < token.length && n <= pending.length; n++)
    if (pending.endsWith(token.slice(0, n))) keep = n;
  const safe = pending.length - keep;
  if (safe) {
    send("output", { text: pending.slice(0, safe) });
    pending = pending.slice(safe);
  }
}
function snapshot(when, trace = null) {
  const registers = Object.fromEntries(
    lesson.registerNames.map((name, i) => [name, text(vm.read_register(i))]),
  );
  if (initialSp === null) initialSp = registers.sp;
  const detail = inspection.inspectionState(vm, built, watches);
  const address =
    lesson.memory === "stack" ? vm.read_register(2) : BigInt(built.data);
  const bytes =
    lesson.memory === "stack"
      ? detail.stack.bytes
      : inspection.observedBytes(vm, address);
  const complete =
    lesson.kind !== "program" && vm.read_pc() === BigInt(built.end);
  let nextInstruction = null;
  if (!complete) {
    vm.disassemble_next_instruction();
    nextInstruction = drain().trim();
  }
  send("snapshot", {
    state: {
      registers,
      memory: { address: text(address), bytes },
      initial: { sp: initialSp },
      ...detail,
    },
    pc: text(vm.read_pc()),
    when,
    trace,
    nextInstruction,
    complete,
  });
}
function paused(when, trace = null) {
  mode = "paused";
  snapshot(when, trace);
  send("phase", { phase: "paused", message: when });
}
function insideText(pc) {
  return built.text.some((s) => pc >= BigInt(s.start) && pc < BigInt(s.end));
}
function step() {
  if (mode !== "paused" || stopped) return;
  try {
    if (++stepCount > 10000)
      throw new Error("Step limit reached. Stop and start a fresh run.");
    const before = vm.read_pc();
    vm.disassemble_next_instruction();
    const instruction = drain().trim();
    vm.run_cycles(1);
    // A user ecall enters xv6. Returning to user text or completing exit can
    // take several chunks; neither is an execution fault or a new user step.
    if (!insideText(vm.read_pc()) && /\becall\b/i.test(instruction)) {
      pendingStep = { before, instruction };
      mode = "step-system-call";
      activeStarted = performance.now();
      send("phase", { phase: "running", message: "Executing system call…" });
      schedule();
      return;
    }
    if (!insideText(vm.read_pc()))
      vm.run_until_breakpoints(new BigUint64Array(built.breakpoints), 1000000);
    consume();
    if (stopped) return;
    observeStep(before, instruction);
  } catch (error) {
    finish(error);
  }
}
function observeStep(before, instruction) {
  const after = vm.read_pc();
  if (!insideText(after))
    throw new Error(
      "Execution left the user program before reaching another instruction. Inspect the serial log.",
    );
  const trace = { from: text(before), to: text(after), instruction };
  if (lesson.kind !== "program" && after === BigInt(built.end)) {
    snapshot("After the last lesson instruction", trace);
    mode = "fast";
    activeStarted = performance.now();
    schedule();
  } else paused("After one machine instruction", trace);
}
let scheduled = false;
function schedule() {
  if (scheduled || stopped) return;
  scheduled = true;
  setTimeout(() => {
    scheduled = false;
    tick();
  }, 0);
}
function tick() {
  if (stopped || mode === "paused") return;
  try {
    if (performance.now() - activeStarted > 30000)
      throw new Error(
        "Stopped after 30 seconds of active execution. Check the loop or use Stop.",
      );
    if (mode === "step-system-call") {
      const found = vm.run_until_breakpoints(
        new BigUint64Array(built.breakpoints),
        100000,
      );
      consume();
      if (stopped) return;
      if (found) {
        const { before, instruction } = pendingStep;
        pendingStep = null;
        observeStep(before, instruction);
        if (mode === "paused") return;
      }
    } else if (mode === "seek") {
      const found = vm.run_until_breakpoints(
        new BigUint64Array([BigInt(built.entry)]),
        100000,
      );
      consume();
      if (stopped) return;
      if (found) {
        if (lesson.kind !== "program" && built.entry === built.end) {
          snapshot("No lesson instructions; at the reporting checkpoint");
          mode = "fast";
        } else {
          initialSp = text(vm.read_register(2));
          if (
            startAtBreakpoint &&
            selectedBreakpoints.length &&
            !selectedBreakpoints.includes(vm.read_pc())
          ) {
            mode = "continue";
          } else {
            paused(
              startAtBreakpoint && selectedBreakpoints.includes(vm.read_pc())
                ? "Breakpoint reached, before this instruction"
                : lesson.kind === "program"
                  ? "Before the program entry instruction"
                  : "Before the first lesson instruction",
            );
            return;
          }
        }
      }
    } else if (mode === "continue") {
      const found = vm.run_until_breakpoints(
        new BigUint64Array(
          lesson.kind === "program"
            ? selectedBreakpoints
            : [...selectedBreakpoints, BigInt(built.end)],
        ),
        100000,
      );
      consume();
      if (stopped) return;
      if (found) {
        if (lesson.kind !== "program" && vm.read_pc() === BigInt(built.end)) {
          snapshot("After the last lesson instruction");
          mode = "fast";
        } else {
          paused("Breakpoint reached, before this instruction");
          return;
        }
      }
    } else {
      vm.run_cycles(100000);
      consume();
    }
    schedule();
  } catch (error) {
    finish(new Error("CPU stopped. " + (error.message || String(error))));
  }
}
onmessage = async ({ data }) => {
  if (data.action === "breakpoints") {
    breakpointSelection = data.selection ?? {};
    if (built && inspection)
      selectedBreakpoints = inspection.resolveBreakpoints(
        built,
        breakpointSelection,
      );
    return;
  }
  if (data.action === "watches") {
    watches = Array.isArray(data.watches) ? data.watches.slice(0, 8) : [];
    return;
  }
  if (data.action === "inspect") {
    if (mode === "paused" && !stopped) {
      try {
        snapshot("Observed at the current pause");
      } catch (error) {
        finish(error);
      }
    }
    return;
  }
  if (data.action === "step") {
    step();
    return;
  }
  if (data.action === "continue") {
    if (mode === "paused") {
      mode = "continue";
      activeStarted = performance.now();
      send("phase", {
        phase: "running",
        message: "Running to the end of your code…",
      });
      schedule();
    }
    return;
  }
  try {
    lesson = { ...data.lesson, debug: !!data.debug };
    breakpointSelection = data.breakpoints ?? {};
    watches = Array.isArray(data.watches) ? data.watches.slice(0, 8) : [];
    startAtBreakpoint = !!data.startAtBreakpoint;
    send("phase", { phase: "loading", message: "Loading tools and xv6…" });
    const [
      as,
      ld,
      objdump,
      compiler,
      script,
      kernel,
      disk,
      runtime,
      builder,
      filesystem,
      model,
      debugging,
    ] = await Promise.all([
      asset("../vendor/binutils/as-new.wasm"),
      asset("../vendor/binutils/ld-new.wasm"),
      asset("../vendor/binutils/objdump.wasm"),
      lesson.language === "c"
        ? asset("../vendor/compiler/tcc.wasm")
        : Promise.resolve(null),
      asset("./user.ld", true),
      asset("../images/kernel"),
      asset("../images/fs.img"),
      import("../vendor/runtime/riscv_emu_rust_wasm.js"),
      import("./builder.js"),
      import("../filesystem.js"),
      import("./model.js"),
      import("./debugging.js"),
    ]);
    lesson.registerNames = model.REGISTERS;
    inspection = debugging;
    send("phase", {
      phase: "building",
      message:
        lesson.language === "c"
          ? "Compiling C, assembling and linking…"
          : "Assembling and linking…",
    });
    built = await builder.buildLesson(
      data.source,
      lesson,
      data.fixture ?? {},
      { as, ld, objdump, compiler, script },
      { as: createAssembler, ld: createLinker, objdump: createObjdump },
    );
    built.breakpoints = built.allInstructions.map((i) => BigInt(i.address));
    selectedBreakpoints = inspection.resolveBreakpoints(
      built,
      breakpointSelection,
    );
    send("built", {
      bytes: built.elf.length,
      diagnostics: built.diagnostics,
      program: built.program,
      disassembly: built.disassembly,
      segments: built.segments,
      entry: built.entry,
      lineOffset: built.lineOffset,
      allInstructions: built.allInstructions,
      symbols: built.symbols,
      end: built.end,
      data: built.data,
      hasDataSymbol: built.hasDataSymbol,
    });
    await runtime.default({
      module_or_path: "../vendor/runtime/riscv_emu_rust_wasm_bg.wasm",
    });
    vm = runtime.WasmRiscv.new();
    vm.setup_program(kernel);
    vm.setup_filesystem(
      filesystem.replaceGuestFile(disk, "workbench", built.elf),
    );
    token = "__COURSE_" + crypto.randomUUID().replaceAll("-", "") + "__";
    activeStarted = performance.now();
    mode = "boot";
    send("phase", { phase: "running", message: "Starting xv6…" });
    schedule();
  } catch (error) {
    finish(error);
  }
};
