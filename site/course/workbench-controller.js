// Copyright © 2026 Christopher Snow
import { Session } from "./session.js";
import { DebuggerPanel } from "./debugger.js";
import {
  REGISTERS,
  registerIndex,
  reading,
  hex,
  makeProgram,
  readState,
  learnerOutput,
  checkState,
  diagnosticLocation,
} from "./model.js";
import { sourceZip } from "./zip.js";
import { createSourceEditor } from "./editor.js";
import { setupWorkbench } from "./workspace.js";
import { debuggerMarkup } from "./debugger.js";
import { completion, setComplete, renderCompletion } from "./home.js";
export function createWorkbench(
  initialContext,
  {
    curriculum = true,
    onDraft = () => {},
    onSnapshot = null,
    onView = () => {},
    onPinsChange = () => {},
    messages = {},
  } = {},
) {
  const $ = (id) => document.getElementById(id);
  let lesson = initialContext;
  let activity = "explore",
    caseIndex = 0,
    state = null,
    builtSource = null,
    builtFingerprint = null,
    output = "",
    serial = "",
    paused = false,
    busy = false,
    batch = false,
    stopped = false,
    initialFixture = {},
    builtInfo = null,
    trace = [],
    activeLine = null,
    hintIndex = 0,
    undoSource = null,
    memoryMoment = "before",
    predictionAtRun = "",
    debugFinalState = null,
    currentPc = null,
    observationWhen = "";
  let session = null;
  const tabDrafts = new Map();
  const caseRecords = new Map();
  const workbench = setupWorkbench();
  $("source").disabled = false;
  const mountEditor = () =>
    createSourceEditor($("source"), {
      language: lesson.language,
      onChange: onSourceChange,
      onToggleBreakpoint(line) {
        if (busy || batch) return;
        debuggerPanel.toggleLine(line);
        workbench.inspect("debugger");
      },
    });
  const mountDebugger = () =>
    new DebuggerPanel($("debugger-panel"), {
      stackRoot: $("inspect-stack"),
      lesson,
      onBreakpoints(selection) {
        session?.setBreakpoints(selection);
        lineNumbers();
      },
      onWatches(watches) {
        session?.setWatches(watches);
      },
      onInspect() {
        if (paused) session?.inspect();
      },
      onPins() {
        renderRegisters();
        publishView();
        onPinsChange([...debuggerPanel.pins]);
      },
    });
  let source = mountEditor();
  let debuggerPanel = mountDebugger();
  const key = () => `riscv-assembly-lab:${lesson.id}:${activity}:v2`;
  const fixture = () =>
    activity === "challenge" ? lesson.challenge.cases[caseIndex] : {};
  const fingerprint = () => JSON.stringify([source.value, activity, caseIndex]);
  function status(message, badge = "Ready", error = false) {
    $("run-status").textContent = message;
    $("state-badge").textContent = badge;
    $("run-status").classList.toggle("error", error);
  }
  function saveDraft() {
    if (!curriculum) {
      onDraft(source.value, lesson);
      return;
    }
    tabDrafts.set(key(), source.value);
    try {
      localStorage.setItem(key(), source.value);
      $("save-state").textContent = "Draft saved in this browser";
    } catch {
      $("save-state").textContent = "Draft is tab-only · download to keep it";
    }
  }
  function restoreDraft(fallback) {
    if (!curriculum) return fallback;
    if (tabDrafts.has(key())) return tabDrafts.get(key());
    try {
      return (
        localStorage.getItem(key()) ??
        (lesson.id === "addition" && activity === "explore"
          ? localStorage.getItem("riscv-assembly-lab:addition-source:v1")
          : null) ??
        fallback
      );
    } catch {
      $("save-state").textContent = "Draft is tab-only · download to keep it";
      return fallback;
    }
  }
  function lineNumbers() {
    source.renderState({
      activeLine,
      breakpoints: debuggerPanel.getBreakpoints().lines,
      disabled: busy || batch,
    });
  }
  function sizeEditor() {
    const style = getComputedStyle(source.contentDOM);
    const height =
      source.value.split("\n").length * parseFloat(style.lineHeight) +
      parseFloat(style.paddingTop) +
      parseFloat(style.paddingBottom) +
      2;
    $("source-editor").style.setProperty(
      "--editor-content-height",
      `${Math.ceil(height)}px`,
    );
  }
  function stale() {
    $("snapshot-note").hidden =
      builtFingerprint === null || fingerprint() === builtFingerprint;
  }
  function publishView(program = makeProgram(source.value, lesson, fixture())) {
    onView({
      program,
      source: source.value,
      context: lesson,
      build: builtInfo,
      buildSource: builtSource,
      pc: currentPc,
      stale: builtFingerprint !== null && fingerprint() !== builtFingerprint,
      pins: [...debuggerPanel.pins],
      state,
      observationWhen,
      paused,
      busy,
      badge: $("state-badge").textContent,
      readingMode: $("reading").value,
    });
  }
  function completeSource() {
    const program = makeProgram(source.value, lesson, fixture());
    $("complete-source").textContent = program.source;
    if ($("complete-c-source"))
      $("complete-c-source").textContent = source.value;
    if ($("c-intent-assembly"))
      $("c-intent-assembly").textContent = source.value;
    sizeEditor();
    lineNumbers();
    stale();
    publishView(program);
    onSnapshot?.({
      source: source.value,
      lesson,
      fixture: fixture(),
      activity: activity === "challenge" ? "exercise" : "example",
    });
  }
  function controls() {
    $("run").disabled = busy || batch;
    $("debug").disabled = busy || batch;
    debuggerPanel.setBusy({ busy, paused, batch });
    lineNumbers();
    $("step").disabled = (busy && !paused) || batch;
    $("step").textContent = paused ? "Step instruction" : "Start stepping";
    $("continue").hidden = curriculum && !paused;
    $("continue").disabled = !paused || batch;
    $("stop").disabled = !busy && !paused && !batch;
    source.readOnly = batch;
    if ($("prediction")) $("prediction").readOnly = busy || paused || batch;
    document
      .querySelectorAll("#case-picker button, #case-results button")
      .forEach((button) => {
        button.disabled = busy || paused || batch;
      });
    for (const id of [
      "return-example",
      "restore",
      "start-challenge",
      "check-cases",
      "use-reference",
    ])
      if ($(id)) $(id).disabled = batch;
  }
  function clearState(
    note = "Run your code to capture the actual register values.",
  ) {
    state = null;
    observationWhen = "";
    if ($("observation-note")) $("observation-note").hidden = true;
    debuggerPanel.clear();
    currentPc = null;
    comparisonState = null;
    activeLine = null;
    $("register-note").textContent = note;
    renderRegisters();
    renderMemory();
    renderBits();
    lineNumbers();
    publishView();
  }
  function observed() {
    return [
      ...new Set([
        ...lesson.observe,
        ...(activity === "challenge"
          ? Object.keys(fixture().expect ?? {})
          : []),
      ]),
    ];
  }
  let comparisonState = null;
  function renderRegisters(previous = undefined) {
    if (previous !== undefined) comparisonState = previous;
    previous = comparisonState;
    const mode = $("reading").value;
    $("registers").replaceChildren(
      ...observed().map((name) => {
        const canonical = REGISTERS[registerIndex(name)],
          value = state?.registers[canonical],
          card = document.createElement("div");
        card.className =
          "register" + (name === lesson.result ? " destination" : "");
        card.dataset.register = canonical;
        if (!curriculum && debuggerPanel.pins.has(canonical))
          card.classList.add("pinned");
        if (
          value &&
          previous?.registers[canonical] &&
          value !== previous.registers[canonical]
        )
          card.classList.add("changed");
        const title = document.createElement("h3");
        title.textContent = name;
        if (!curriculum) {
          const physical = document.createElement("span");
          physical.textContent = `x${registerIndex(name)}`;
          title.append(physical);
        }
        if (name === lesson.result) {
          const label = document.createElement("span");
          label.textContent = "Result";
          title.append(label);
        }
        const decimal = document.createElement("p");
        decimal.className = "register-value";
        decimal.id = name + "-decimal";
        decimal.textContent = value ? reading(value, mode) : "—";
        const bitPattern = document.createElement("p");
        bitPattern.className = "register-hex";
        bitPattern.id = name + "-hex";
        bitPattern.textContent = value ? hex(value) : "Not run yet";
        bitPattern.hidden = !lesson.ui?.hex;
        card.append(title, decimal, bitPattern);
        return card;
      }),
    );
  }
  function showState(next, when) {
    const previous = state;
    state = next;
    observationWhen = when;
    debuggerPanel.update(next, { pc: currentPc, when });
    renderRegisters(previous);
    memoryMoment = "after";
    renderMemory();
    renderBits();
    if ($("observation-note")) {
      $("observation-note").textContent = when;
      $("observation-note").hidden = false;
    }
    $("register-note").textContent =
      when.replace(/\.$/, "") +
      ". Decimal readings interpret the same 64 bits.";
    publishView();
  }
  function renderMemory() {
    if (!lesson.memory) return;
    const after =
      lesson.kind === "program" ||
      lesson.memory === "stack" ||
      memoryMoment === "after";
    const raw = fixture().data ?? lesson.data ?? [];
    const bytes = after
      ? state?.memory.bytes
      : [...raw, ...Array(64 - raw.length).fill(0)];
    if ($("memory-before")) {
      $("memory-before").parentElement.hidden =
        lesson.kind === "program" || lesson.memory === "stack";
      $("memory-before").setAttribute("aria-pressed", String(!after));
      $("memory-after").setAttribute("aria-pressed", String(after));
    }
    $("memory-grid").replaceChildren();
    $("byte-inspection").textContent = "Choose a byte to inspect this view.";
    if (!bytes) {
      $("memory-note").textContent = "Run or step to observe these bytes.";
      return;
    }
    $("memory-note").textContent = after
      ? `${lesson.memory === "stack" ? "Stack" : "Data"} bytes observed at ${state.memory.address}. Cells show hexadecimal bytes; row offsets are decimal byte counts.`
      : "Supplied bytes before execution. Cells are hexadecimal; offsets are decimal byte counts from lesson_data.";
    for (let offset = 0; offset < 64; offset += 8) {
      for (const label of lesson.memoryLabels ?? [])
        if (label.offset >= offset && label.offset < offset + 8) {
          const note = document.createElement("div");
          note.className = "memory-label";
          note.textContent = `+${label.offset}: ${label.label}`;
          $("memory-grid").append(note);
        }
      const row = document.createElement("div");
      row.className = "memory-row";
      const address = document.createElement("span");
      address.className = "memory-offset";
      address.textContent = "+" + offset;
      row.append(address);
      for (let i = 0; i < 8; i++) {
        const position = offset + i,
          value = bytes[position],
          cell = document.createElement("button");
        cell.className = "memory-byte";
        cell.textContent =
          value === null ? "??" : value.toString(16).padStart(2, "0");
        cell.setAttribute(
          "aria-label",
          `Byte offset ${position}, ${value === null ? "unmapped" : value}`,
        );
        if (after && lesson.memory === "data" && value !== (raw[position] ?? 0))
          cell.classList.add("changed");
        cell.addEventListener("click", () => {
          $("memory-grid")
            .querySelectorAll("[aria-pressed]")
            .forEach((el) => el.removeAttribute("aria-pressed"));
          cell.setAttribute("aria-pressed", "true");
          const address = after
            ? hex(BigInt(state.memory.address) + BigInt(position))
            : `lesson_data + ${position}`;
          $("byte-inspection").textContent =
            value === null
              ? `${address}: not readable.`
              : `${address}: decimal ${value}, hex 0x${value.toString(16).padStart(2, "0")}, bits ${value.toString(2).padStart(8, "0")}${value >= 32 && value <= 126 ? `, ASCII “${String.fromCharCode(value)}”` : ""}.`;
        });
        row.append(cell);
      }
      $("memory-grid").append(row);
    }
  }
  function renderBits() {
    const name = $("bit-register").value,
      value = state?.registers[REGISTERS[registerIndex(name)]];
    $("bits").replaceChildren();
    if ($("floating-reading"))
      $("floating-reading").textContent = "Run or step to observe a pattern.";
    if (!value) {
      $("bit-reading").textContent =
        "Run or step before inspecting a register pattern.";
      return;
    }
    $("bit-reading").textContent =
      `${name}: signed ${reading(value)} · unsigned ${reading(value, "unsigned")} · ${hex(value)}`;
    const bits = BigInt(value).toString(2).padStart(64, "0");
    for (let start = 0; start < 64; start += 4) {
      const group = document.createElement("div");
      group.className = "bit-group";
      for (let i = 0; i < 4; i++) {
        const n = start + i,
          cell = document.createElement("span");
        cell.className = "bit" + (bits[n] === "1" ? " one" : "");
        const label = document.createElement("small");
        label.textContent = 63 - n;
        cell.append(label, document.createTextNode(bits[n]));
        group.append(cell);
      }
      $("bits").append(group);
    }
    if ($("floating-reading")) {
      const observed = state.registers.t1,
        buffer = new ArrayBuffer(4),
        view = new DataView(buffer);
      view.setUint32(0, Number(BigInt(observed) & 0xffffffffn), true);
      const number = view.getFloat32(0, true);
      $("floating-reading").textContent =
        `Observed t1 low 32 bits interpreted as binary32: ${Object.is(number, -0) ? "-0" : String(number)}.`;
    }
  }
  function startingState() {
    if (!$("starting-state")) return;
    $("case-picker")
      ?.querySelectorAll("button")
      .forEach((button, index) =>
        button.setAttribute("aria-pressed", String(index === caseIndex)),
      );
    $("starting-state").replaceChildren();
    const title = document.createElement("p");
    title.textContent =
      activity === "challenge"
        ? `Starting inputs · ${fixture().name}`
        : "Starting inputs";
    $("starting-state").append(title);
    if (lesson.kind === "program") {
      const note = document.createElement("p");
      note.textContent =
        "A complete assembly program supplies its own initialisation and data. Set those values in the source.";
      $("starting-state").append(note);
      return;
    }
    const values = { ...(lesson.inputs ?? {}), ...(fixture().inputs ?? {}) };
    if (!Object.keys(values).length) {
      const note = document.createElement("p");
      note.textContent =
        "Fresh machine each run. Working registers start at zero.";
      $("starting-state").append(note);
    }
    for (const [name, value] of Object.entries(values)) {
      const code = document.createElement("code");
      code.textContent = `${name} = ${value}`;
      $("starting-state").append(code);
    }
    if (Object.keys(values).length) {
      const note = document.createElement("p");
      note.textContent =
        "Fresh machine each run. Other working registers start at zero.";
      $("starting-state").append(note);
    }
    if (lesson.memory === "stack") {
      const note = document.createElement("p");
      note.textContent =
        "The lab supplies a 16-byte-aligned stack pointer with 64 mapped inspection bytes.";
      $("starting-state").append(note);
    }
  }
  function diagnostics(message, error = false) {
    $("diagnostic-lines").replaceChildren();
    for (const line of (
      message || "Assembly and linking completed without warnings."
    ).split("\n")) {
      const location = diagnosticLocation(
          line,
          builtSource ?? source.value,
          lesson,
          initialFixture,
        ),
        el = document.createElement(location ? "button" : "p");
      el.textContent = location?.label ?? line;
      if (location) {
        el.className = "diagnostic-link";
        el.addEventListener("click", () => {
          if (source.value !== builtSource) {
            status(
              "This message belongs to an earlier source snapshot. Build again to check your edits.",
              "Source changed",
            );
            return;
          }
          const lines = source.value.split("\n"),
            number = Math.max(1, Math.min(lines.length, location.line));
          const start = lines
            .slice(0, number - 1)
            .reduce((n, line) => n + line.length + 1, 0);
          source.focus();
          source.setSelectionRange(start, start + lines[number - 1].length);
          source.scrollToLine(number);
          lineNumbers();
        });
      }
      $("diagnostic-lines").append(el);
    }
    $("diagnostics").open = error || !!message;
    if (error || message) workbench.inspect("diagnostics");
    $("diagnostics-summary").textContent = error
      ? "Check messages"
      : message
        ? "Messages available"
        : "Built";
  }
  function updateLayout(segments) {
    $("elf-layout").replaceChildren(
      ...segments.map((segment) => {
        const el = document.createElement("div");
        el.className = "segment";
        const title = document.createElement("strong");
        title.textContent = `${segment.flags & 4 ? "R" : ""}${segment.flags & 2 ? "W" : ""}${segment.flags & 1 ? "X" : ""}`;
        el.append(
          title,
          document.createElement("br"),
          document.createTextNode(hex(segment.address)),
          document.createElement("br"),
          document.createTextNode(
            `${segment.fileSize} file bytes · ${segment.memorySize} memory bytes`,
          ),
        );
        return el;
      }),
    );
  }
  function checkPrediction() {
    if (!curriculum) return;
    if (activity !== "explore" || !state) return;
    const raw = predictionAtRun.trim();
    if (!raw) {
      $("prediction-feedback").textContent =
        "Compare the observed register value with the result you expected.";
      return;
    }
    try {
      const clean = raw.replaceAll("−", "-").replace(/[\s,_]/g, ""),
        negative = clean.startsWith("-"),
        text = negative ? clean.slice(1) : clean;
      let guessed = (negative ? -1n : 1n) * BigInt(text);
      const mode = lesson.prediction.reading ?? "signed";
      if (/^0[xb]/i.test(text))
        guessed = BigInt(reading(guessed, mode === "hex" ? "unsigned" : mode));
      const value =
        state.registers[REGISTERS[registerIndex(lesson.prediction.register)]];
      const actual =
        mode === "hex" ? BigInt(value) : BigInt(reading(value, mode));
      $("prediction-feedback").textContent =
        guessed === actual
          ? "Your prediction matches the executed result."
          : `The CPU reported ${lesson.prediction.register} = ${reading(value, mode)}. Revisit the operand order and reading, then try a fresh input.`;
    } catch {
      $("prediction-feedback").textContent =
        "Use a whole decimal number, 0x hexadecimal or 0b binary for the prediction.";
    }
  }
  session = new Session((event) => {
    if (event.type === "phase") {
      paused = event.phase === "paused";
      busy = !paused;
      controls();
      status(
        event.message,
        {
          loading: "Loading",
          building: "Building",
          running: "Running",
          paused: "Paused",
        }[event.phase],
      );
      publishView();
    } else if (event.type === "built") {
      builtInfo = event;
      debuggerPanel.setBuild(event, builtSource);
      lineNumbers();
      diagnostics(event.diagnostics);
      $("diagnostics-summary").textContent = event.diagnostics
        ? "Messages available"
        : `Built · ${event.bytes.toLocaleString()} bytes`;
      updateLayout(event.segments);
      if (lesson.language === "c") {
        $("compiled-source").textContent = builtSource;
        $("compiled-assembly").textContent = event.disassembly
          .map((i) => `${i.address.toString(16)}: ${i.text}`)
          .join("\n");
      }
      publishView();
    } else if (event.type === "serial") {
      serial += event.text;
      $("serial").textContent = serial;
    } else if (event.type === "output") {
      output += event.text;
      $("console").textContent =
        lesson.kind === "program" ? output : learnerOutput(output, true);
    } else if (event.type === "snapshot") {
      currentPc = event.pc;
      if (event.complete) debugFinalState = event.state;
      showState(event.state, event.when);
      $("step-observations").hidden = false;
      if (event.trace) {
        trace.push(event.trace);
        if (trace.length > 80) trace.shift();
      }
      $("current-instruction").textContent = event.complete
        ? "Your code has reached the reporting checkpoint."
        : (event.nextInstruction ?? `Next instruction address: ${event.pc}`);
      const instruction = builtInfo?.disassembly.find(
        (i) => BigInt(i.address) === BigInt(event.pc),
      );
      activeLine =
        lesson.language === "c"
          ? null
          : instruction?.sourceLine
            ? instruction.sourceLine - builtInfo.lineOffset
            : null;
      const sourceOperation =
        activeLine > 0 ? builtSource.split("\n")[activeLine - 1] : null;
      $("sticky-operation").textContent = event.complete
        ? "Lesson code finished; the supplied reporter runs next."
        : sourceOperation
          ? `Next machine step for source line ${activeLine}: ${sourceOperation.trim()}`
          : `Next machine instruction: ${instruction?.text ?? event.nextInstruction ?? event.pc}`;
      $("sticky-operation").hidden = false;
      $("step-location").textContent = event.complete
        ? `Lesson code ended at PC ${event.pc}. The supplied reporting code runs next.`
        : `PC ${event.pc}${activeLine && activeLine > 0 ? ` · ${curriculum ? "lesson" : "project"} source line ${activeLine}` : ""}. One source line may expand into several machine instructions.`;
      if (!curriculum)
        $("run-status").textContent = event.complete
          ? "Your code finished. The supplied reporter runs next."
          : `Paused · PC ${event.pc} · ${instruction?.text ?? event.nextInstruction ?? ""}`;
      lineNumbers();
      if (activeLine > 0)
        source.scrollToLine(activeLine, { contained: !curriculum });
      $("trace-list").replaceChildren(
        ...trace.map((item) => {
          const li = document.createElement("li");
          li.textContent = `${item.from} → ${item.to} · ${item.instruction}`;
          return li;
        }),
      );
      stale();
      publishView();
    } else if (event.type === "done") {
      busy = false;
      paused = false;
      $("sticky-operation").hidden = true;
      controls();
      const result = lesson.kind === "program" ? null : readState(output);
      if (result) {
        const complete =
          debugFinalState &&
          REGISTERS.every(
            (name) =>
              debugFinalState.registers[name] === result.registers[name],
          );
        if (complete) {
          result.stack = debugFinalState.stack;
          result.watches = debugFinalState.watches;
        }
        showState(result, "Captured after your code completed");
        checkPrediction();
        status(
          "Run finished. Inspect the result, then change an input.",
          "Finished",
        );
      } else if (lesson.kind === "program") {
        if (state)
          showState(
            state,
            messages.lastPausedObservation ??
              messages.lastPause ??
              "Last observed at a pause before the program finished. These are not exit register values",
          );
        else
          clearState(
            messages.noPausedObservation ??
              messages.notObserved ??
              "Start stepping or Start debugging to observe this program’s registers.",
          );
        status(
          messages.programFinished ??
            "Program finished. Inspect Output, or start stepping to capture register observations.",
          "Finished",
        );
      } else {
        clearState(
          "No register snapshot was produced. Your code may have exited or faulted before reporting. Inspect the program output and serial log.",
        );
        status(
          "The process ended before producing a state report.",
          "No snapshot",
          true,
        );
      }
      renderOutput();
      stale();
      publishView();
    } else if (event.type === "error") {
      busy = false;
      paused = false;
      $("sticky-operation").hidden = true;
      controls();
      clearState("No completed register snapshot. Check the diagnostics.");
      diagnostics(event.message, true);
      status("Could not finish. Check the diagnostics below.", "Error", true);
    } else if (event.type === "stopped") {
      busy = false;
      paused = false;
      $("sticky-operation").hidden = true;
      controls();
      status(
        "Stopped. Build or start stepping for a fresh machine.",
        "Stopped",
      );
      publishView();
    }
  });
  async function runOnce({
    debug = false,
    startAtBreakpoint = false,
    code = source.value,
    test = fixture(),
  } = {}) {
    builtSource = code;
    builtFingerprint = fingerprint();
    initialFixture = test;
    output = "";
    serial = "";
    builtInfo = null;
    debugFinalState = null;
    trace = [];
    activeLine = null;
    paused = false;
    busy = true;
    predictionAtRun = $("prediction")?.value ?? "";
    $("console").textContent = "";
    $("serial").textContent = "";
    $("sticky-operation").hidden = true;
    $("diagnostic-lines").replaceChildren();
    $("diagnostics-summary").textContent = "Building…";
    $("elf-layout").replaceChildren();
    if ($("compiled-source"))
      $("compiled-source").textContent = "Not compiled yet.";
    if ($("compiled-assembly"))
      $("compiled-assembly").textContent = "Not compiled yet.";
    $("diagnostics").open = false;
    $("step-observations").hidden = true;
    if ($("prediction-feedback"))
      $("prediction-feedback").textContent =
        "Checking against actual execution…";
    clearState("Building and running your code…");
    controls();
    stale();
    await session.start({
      source: code,
      lesson,
      fixture: test,
      debug,
      startAtBreakpoint,
      breakpoints: debuggerPanel.getBreakpoints(),
      watches: debuggerPanel.getWatches(),
    });
    return captureRecord();
  }
  function renderOutput() {
    $("console").textContent =
      (lesson.kind === "program" ? output : learnerOutput(output)) ||
      (lesson.kind === "program"
        ? "No console text from this program."
        : "No console text from your code. The state report is in the serial log.");
  }
  function captureRecord(error = null) {
    return { state: readState(output), output, serial, builtInfo, error };
  }
  function cancelExecution() {
    if (busy || paused) session.stop();
    activeLine = null;
    $("sticky-operation").hidden = true;
    $("step-observations").hidden = true;
    lineNumbers();
  }
  function inspectRecord(index, submitted) {
    if (busy || paused || batch) return;
    const record = caseRecords.get(index);
    caseIndex = index;
    initialFixture = fixture();
    builtSource = submitted;
    builtFingerprint = JSON.stringify([submitted, activity, index]);
    output = record.output;
    serial = record.serial;
    builtInfo = record.builtInfo;
    cancelExecution();
    if (builtInfo) debuggerPanel.setBuild(builtInfo, submitted);
    startingState();
    completeSource();
    clearState("This recorded case did not produce a complete state report.");
    if (record.state)
      showState(record.state, "Observed during the last challenge check");
    renderOutput();
    $("serial").textContent = serial;
    updateLayout(builtInfo?.segments ?? []);
    diagnostics(record.error ?? builtInfo?.diagnostics, !!record.error);
    if (lesson.language === "c") {
      $("compiled-source").textContent = builtInfo
        ? submitted
        : "Not compiled yet.";
      $("compiled-assembly").textContent = builtInfo
        ? builtInfo.disassembly
            .map((i) => `${i.address.toString(16)}: ${i.text}`)
            .join("\n")
        : "Not compiled yet.";
    }
    status(
      `Recorded case: ${fixture().name}. Run again for a fresh machine.`,
      "Recorded case",
    );
    stale();
  }
  function startRun(debug = false, startAtBreakpoint = false) {
    if (batch) return;
    if (busy && !paused) return;
    cancelExecution();
    runOnce({ debug, startAtBreakpoint }).catch(() => {});
  }
  $("run").addEventListener("click", () => startRun());
  $("debug").addEventListener("click", () => {
    workbench.inspect("debugger");
    startRun(true, true);
  });
  $("step").addEventListener("click", () => {
    if (paused) {
      busy = true;
      paused = false;
      controls();
      status("Executing one machine instruction…", "Running");
      session.step();
    } else startRun(true);
  });
  $("continue").addEventListener("click", () => {
    if (paused) {
      paused = false;
      busy = true;
      $("sticky-operation").hidden = true;
      controls();
      session.continue();
    }
  });
  $("stop").addEventListener("click", () => {
    stopped = true;
    batch = false;
    session.stop();
    controls();
  });
  function onSourceChange() {
    if (busy || paused) {
      session.stop();
      activeLine = null;
    }
    debuggerPanel.sourceChanged();
    undoSource = null;
    $("restore").textContent = curriculum
      ? "Restore starter"
      : "Restore loaded source";
    saveDraft();
    completeSource();
    if ($("prediction-feedback"))
      $("prediction-feedback").textContent =
        "Run the edited code to check a fresh prediction.";
  }
  $("expand-editor").addEventListener("click", () => {
    const expanded = $("source-editor").classList.toggle("expanded");
    $("expand-editor").setAttribute("aria-expanded", String(expanded));
    $("expand-editor").textContent = expanded
      ? "Collapse editor"
      : "Expand editor";
  });
  document
    .querySelector('.lab-help a[href="#complete-program"]')
    .addEventListener("click", async (event) => {
      event.preventDefault();
      await workbench.close();
      const program = $("complete-program");
      program.open = true;
      location.hash = "complete-program";
      program.querySelector("summary").focus({ preventScroll: true });
      program.scrollIntoView({ block: "start" });
    });
  window.addEventListener("resize", sizeEditor);
  document.fonts.ready.then(sizeEditor);
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      $("run").click();
    }
  });
  if (curriculum) {
    function switchActivity(next) {
      if (batch) return;
      if (activity === next) return;
      const editor = $("source-editor");
      if (
        !workbench.expanded &&
        !editor.style.getPropertyValue("--editor-fixed-height")
      ) {
        editor.style.setProperty(
          "--editor-fixed-height",
          `${editor.getBoundingClientRect().height}px`,
        );
      }
      workbench.preservePosition(() => {
        if (busy || paused) session.stop();
        saveDraft();
        activity = next;
        caseIndex = 0;
        undoSource = null;
        debuggerPanel.sourceChanged();
        source.value = restoreDraft(
          activity === "challenge" ? lesson.challenge.starter : lesson.starter,
        );
        $("editor-context").textContent =
          activity === "challenge" ? "Exercise" : "Example";
        $("return-example").hidden = activity !== "challenge";
        $("challenge-controls").hidden = activity !== "challenge";
        $("prediction-block").hidden = activity !== "explore";
        clearState();
        startingState();
        completeSource();
        status(
          activity === "challenge"
            ? "Write the requested code, then check all cases."
            : "Example draft restored. Build and run for a fresh machine.",
        );
        controls();
      });
    }
    $("return-example").addEventListener("click", () => {
      switchActivity("explore");
      $("editor-context").focus({ preventScroll: true });
    });
    $("start-challenge").addEventListener("click", (event) => {
      switchActivity("challenge");
      $("workbench").scrollIntoView({ block: "start", behavior: "instant" });
      if (event.detail === 0) source.focus({ preventScroll: true });
      else $("editor-context").focus({ preventScroll: true });
    });
    $("case-picker").replaceChildren(
      ...lesson.challenge.cases.map((test, index) => {
        const button = document.createElement("button");
        button.textContent = test.name;
        button.setAttribute("aria-pressed", String(index === caseIndex));
        button.addEventListener("click", () => {
          if (busy || paused || batch) return;
          cancelExecution();
          debuggerPanel.sourceChanged();
          caseIndex = index;
          $("case-picker")
            .querySelectorAll("button")
            .forEach((b, i) =>
              b.setAttribute("aria-pressed", String(i === index)),
            );
          clearState();
          startingState();
          completeSource();
        });
        return button;
      }),
    );
    $("check-cases").addEventListener("click", async () => {
      if (batch) return;
      if (busy || paused) session.stop();
      batch = true;
      stopped = false;
      controls();
      const submitted = source.value;
      debuggerPanel.sourceChanged();
      caseRecords.clear();
      $("case-results").replaceChildren();
      let passed = 0;
      for (let index = 0; index < lesson.challenge.cases.length; index++) {
        if (stopped) break;
        caseIndex = index;
        startingState();
        completeSource();
        const test = fixture(),
          item = document.createElement("li");
        item.textContent = `${test.name}: running…`;
        $("case-results").append(item);
        $("challenge-status").textContent =
          `Checking case ${index + 1} of ${lesson.challenge.cases.length}. Stop to edit the code.`;
        let verdict, result;
        try {
          result = await runOnce({ code: submitted, test });
          verdict = checkState(result.state, test);
        } catch (error) {
          result = captureRecord(error.message);
          verdict = { pass: false, messages: [error.message] };
        }
        if (stopped) {
          item.textContent = `${test.name}: stopped before checking finished.`;
          break;
        }
        if (verdict.pass) passed++;
        item.className = verdict.pass ? "passed" : "failed";
        item.textContent = `${test.name}: ${verdict.pass ? "passed" : verdict.messages.join(" ")}`;
        caseRecords.set(index, result);
        const inspect = document.createElement("button");
        inspect.className = "text-button";
        inspect.textContent = "Inspect this case";
        inspect.disabled = true;
        inspect.addEventListener("click", () =>
          inspectRecord(index, submitted),
        );
        item.append(inspect);
      }
      batch = false;
      controls();
      $("challenge-status").textContent = stopped
        ? "Checking stopped. Your source is unchanged."
        : `${passed} of ${lesson.challenge.cases.length} cases passed.`;
      status(
        stopped
          ? "Stopped."
          : passed === lesson.challenge.cases.length
            ? "Every case passed. You can mark the lesson complete."
            : "Some cases failed. Inspect their observations and revise the code.",
        stopped
          ? "Stopped"
          : passed === lesson.challenge.cases.length
            ? "Passed"
            : "Try again",
        !stopped && passed !== lesson.challenge.cases.length,
      );
    });
  }
  $("restore").addEventListener("click", () => {
    cancelExecution();
    debuggerPanel.sourceChanged();
    const fallback =
      activity === "challenge" ? lesson.challenge.starter : lesson.starter;
    if (undoSource !== null) {
      source.value = undoSource;
      undoSource = null;
      $("restore").textContent = curriculum
        ? "Restore starter"
        : "Restore loaded source";
    } else {
      undoSource = source.value;
      source.value = fallback;
      $("restore").textContent = "Undo restore";
    }
    saveDraft();
    completeSource();
  });
  if (curriculum) {
    $("next-hint").addEventListener("click", () => {
      if (hintIndex >= lesson.challenge.hints.length) return;
      const li = document.createElement("li");
      li.textContent = lesson.challenge.hints[hintIndex++];
      $("challenge-hints").append(li);
      $("next-hint").disabled = hintIndex >= lesson.challenge.hints.length;
    });
    $("use-reference").addEventListener("click", () => {
      cancelExecution();
      debuggerPanel.sourceChanged();
      source.value = lesson.challenge.reference;
      saveDraft();
      completeSource();
      source.focus();
    });
    $("prediction-hint-button").addEventListener("click", () => {
      $("prediction-hint").hidden = !$("prediction-hint").hidden;
    });
  }
  $("reading").value =
    lesson.prediction?.reading === "unsigned" ? "unsigned" : "signed";
  $("reading").addEventListener("change", () => {
    renderRegisters();
    publishView();
  });
  $("bit-register").replaceChildren(
    ...lesson.observe.map((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      return option;
    }),
  );
  $("bit-register").value = lesson.result;
  $("bit-register").addEventListener("change", renderBits);
  $("bits-high").addEventListener("click", () => {
    $("bits-scroller").scrollLeft = 0;
  });
  $("bits-low").addEventListener("click", () => {
    $("bits-scroller").scrollLeft = $("bits-scroller").scrollWidth;
  });
  $("memory-before")?.addEventListener("click", () => {
    memoryMoment = "before";
    renderMemory();
  });
  $("memory-after")?.addEventListener("click", () => {
    memoryMoment = "after";
    renderMemory();
  });
  function download(blob, name) {
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  $("download").addEventListener("click", () =>
    download(
      new Blob([source.value], { type: "text/plain" }),
      lesson.sourceName ?? (lesson.language === "c" ? "lesson.c" : "lesson.s"),
    ),
  );
  $("download-complete").addEventListener("click", async () => {
    const snapshot = source.value;
    const program = makeProgram(snapshot, lesson, fixture()).source;
    if (lesson.language !== "c") {
      download(
        new Blob([program], { type: "text/plain" }),
        lesson.id + "-complete.s",
      );
      return;
    }
    try {
      const response = await fetch(new URL("./user.ld", import.meta.url));
      if (!response.ok) {
        status(
          "Could not download the linker script. Try again.",
          "Error",
          true,
        );
        return;
      }
      download(
        sourceZip({
          "lesson.c": snapshot,
          "support.s": program,
          "user.ld": await response.text(),
          "README.txt":
            "This is an xv6 RISC-V user program, not a Linux executable.\nCompile lesson.c as a freestanding RV64GC/LP64D object, assemble support.s with GNU as, then link both with user.ld.\nFor example: riscv64-linux-gnu-gcc -march=rv64gc -mabi=lp64d -ffreestanding -fno-common -fno-stack-protector -c lesson.c -o lesson.o\nriscv64-linux-gnu-as -march=rv64gc -mabi=lp64d -mno-relax support.s -o support.o\nriscv64-linux-gnu-ld --no-relax -T user.ld support.o lesson.o -o lesson.elf\nInstall the ELF as a user program in xv6. The page itself uses the pinned TinyCC compiler; another C compiler may generate different instructions.\n",
        }),
        lesson.id + "-complete.zip",
      );
    } catch {
      status(
        "Could not download the complete program. Check your connection and try again.",
        "Error",
        true,
      );
    }
  });
  if (curriculum) {
    $("lesson-complete").checked = completion().includes(lesson.id);
    $("lesson-complete").addEventListener("change", () => {
      const saved = setComplete(lesson.id, $("lesson-complete").checked);
      renderCompletion();
      if (!saved)
        $("lesson-complete").closest("div").querySelector("p").textContent =
          "This mark is tab-only because browser storage is unavailable.";
    });
  }
  source.value = restoreDraft(lesson.starter);
  if (lesson.id === "system-calls" || lesson.kind === "program")
    workbench.inspect("output");
  startingState();
  completeSource();
  clearState();
  controls();
  status(
    "Ready. Build and run locally, or start stepping through real machine instructions.",
  );

  return {
    closeWorkspace() {
      return workbench.close();
    },
    togglePin(name) {
      if (debuggerPanel.pins.has(name)) debuggerPanel.pins.delete(name);
      else debuggerPanel.pins.add(name);
      debuggerPanel.renderRegisters();
      renderRegisters();
      publishView();
      onPinsChange([...debuggerPanel.pins]);
    },
    snapshot() {
      return {
        source: source.value,
        pins: [...debuggerPanel.pins],
        lesson,
        fixture: fixture(),
        activity: activity === "challenge" ? "exercise" : "example",
      };
    },
    loadProject(next) {
      if (curriculum)
        throw new Error("Project switching is available in the playground.");
      cancelExecution();
      source.destroy();
      lesson = next;
      activity = "explore";
      caseIndex = 0;
      undoSource = null;
      builtSource = null;
      builtFingerprint = null;
      builtInfo = null;
      currentPc = null;
      memoryMoment = "before";
      $("source").value = next.starter;
      $("source").setAttribute(
        "aria-label",
        next.language === "c" ? "C source" : "Project assembly source",
      );
      $("source-heading").textContent = next.sourceName;
      $("source-editor").classList.toggle(
        "breakpoint-editor",
        next.language !== "c",
      );
      $("source-editor").classList.remove("expanded");
      $("expand-editor").textContent = "Expand editor";
      $("expand-editor").setAttribute("aria-expanded", "false");
      $("restore").textContent = "Restore loaded source";
      $("debugger-panel").outerHTML = debuggerMarkup(next, {
        separateStack: true,
      });
      source = mountEditor();
      debuggerPanel = mountDebugger();
      $("compiled-listing").hidden = next.language !== "c";
      if ($("complete-c-block"))
        $("complete-c-block").hidden = next.language !== "c";
      $("bit-register").value = next.result;
      $("memory-heading").textContent =
        next.memory === "stack" ? "Stack bytes" : "Memory bytes";
      $("console").textContent = "Not run yet.";
      $("serial").textContent = "Not started yet.";
      $("diagnostic-lines").replaceChildren();
      $("diagnostics-summary").textContent = "Not built yet";
      $("elf-layout").textContent =
        "Build once to inspect its actual load segments.";
      $("step-location").textContent = "";
      startingState();
      completeSource();
      clearState();
      controls();
      workbench.inspect(next.kind === "program" ? "output" : "registers");
      status(
        messages.projectOpened ??
          "Project opened. Build or start stepping for a fresh machine.",
      );
    },
    stop() {
      session.stop();
    },
  };
}
