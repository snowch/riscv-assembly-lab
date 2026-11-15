// Copyright © 2026 Christopher Snow
import { Session } from "./session.js";
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
import {
  setupTheme,
  completion,
  setComplete,
  renderCompletion,
} from "./home.js";
import { sourceZip } from "./zip.js";
const $ = (id) => document.getElementById(id),
  lesson = JSON.parse($("lesson-data").textContent);
setupTheme();
renderCompletion();
const nav = $("course-navigation"),
  wide = matchMedia("(min-width:951px)");
nav.open = wide.matches;
wide.addEventListener("change", (event) => {
  nav.open = event.matches;
});
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
  predictionAtRun = "";
const tabDrafts = new Map();
const caseRecords = new Map(),
  source = $("source");
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
  tabDrafts.set(key(), source.value);
  try {
    localStorage.setItem(key(), source.value);
    $("save-state").textContent = "Draft saved in this browser";
  } catch {
    $("save-state").textContent = "Draft is tab-only · download to keep it";
  }
}
function restoreDraft(fallback) {
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
  const count = source.value.split("\n").length;
  $("line-numbers").replaceChildren(
    ...Array.from({ length: count }, (_, i) => {
      const span = document.createElement("span");
      span.textContent = i + 1;
      if (i + 1 === activeLine) span.className = "active-line";
      return span;
    }),
  );
  $("line-numbers").scrollTop = source.scrollTop;
}
function stale() {
  $("snapshot-note").hidden =
    builtFingerprint === null || fingerprint() === builtFingerprint;
}
function completeSource() {
  const program = makeProgram(source.value, lesson, fixture());
  $("complete-source").textContent = program.source;
  if ($("complete-c-source")) $("complete-c-source").textContent = source.value;
  if ($("c-intent-assembly")) $("c-intent-assembly").textContent = source.value;
  lineNumbers();
  stale();
}
function controls() {
  $("run").disabled = busy || batch;
  $("step").disabled = (busy && !paused) || batch;
  $("step").textContent = paused ? "Step instruction" : "Start stepping";
  $("continue").hidden = !paused;
  $("continue").disabled = !paused || batch;
  $("stop").disabled = !busy && !paused && !batch;
  source.readOnly = batch;
  $("prediction").readOnly = busy || paused || batch;
  document
    .querySelectorAll("#case-picker button, #case-results button")
    .forEach((button) => {
      button.disabled = busy || paused || batch;
    });
  for (const id of [
    "explore-mode",
    "challenge-mode",
    "restore",
    "start-challenge",
    "check-cases",
    "use-reference",
  ])
    $(id).disabled = batch;
}
function clearState(
  note = "Run your code to capture the actual register values.",
) {
  state = null;
  activeLine = null;
  $("register-note").textContent = note;
  renderRegisters();
  renderMemory();
  renderBits();
  lineNumbers();
}
function observed() {
  return [
    ...new Set([
      ...lesson.observe,
      ...(activity === "challenge" ? Object.keys(fixture().expect ?? {}) : []),
    ]),
  ];
}
function renderRegisters(previous = null) {
  const mode = $("reading").value;
  $("registers").replaceChildren(
    ...observed().map((name) => {
      const canonical = REGISTERS[registerIndex(name)],
        value = state?.registers[canonical],
        card = document.createElement("div");
      card.className =
        "register" + (name === lesson.result ? " destination" : "");
      if (
        value &&
        previous?.registers[canonical] &&
        value !== previous.registers[canonical]
      )
        card.classList.add("changed");
      const title = document.createElement("h3");
      title.textContent = name;
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
  renderRegisters(previous);
  memoryMoment = "after";
  renderMemory();
  renderBits();
  $("register-note").textContent =
    when + ". Decimal readings interpret the same 64 bits.";
}
function renderMemory() {
  if (!lesson.memory) return;
  const after = lesson.memory === "stack" || memoryMoment === "after";
  const raw = fixture().data ?? lesson.data ?? [];
  const bytes = after
    ? state?.memory.bytes
    : [...raw, ...Array(64 - raw.length).fill(0)];
  if ($("memory-before")) {
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
  $("case-picker")
    .querySelectorAll("button")
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
  const values = { ...(lesson.inputs ?? {}), ...(fixture().inputs ?? {}) };
  if (!Object.keys(values).length) {
    const note = document.createElement("p");
    note.textContent =
      "Working registers start at zero. Your code loads its starting values.";
    $("starting-state").append(note);
  }
  for (const [name, value] of Object.entries(values)) {
    const code = document.createElement("code");
    code.textContent = `${name} = ${value}`;
    $("starting-state").append(code);
  }
  const note = document.createElement("p");
  note.textContent =
    lesson.memory === "stack"
      ? "The lab supplies a 16-byte-aligned stack pointer with 64 mapped inspection bytes."
      : "Each run starts a fresh machine.";
  $("starting-state").append(note);
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
        source.scrollTop = Math.max(
          0,
          (number - 3) * parseFloat(getComputedStyle(source).lineHeight),
        );
        lineNumbers();
      });
    }
    $("diagnostic-lines").append(el);
  }
  $("diagnostics").open = error || !!message;
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
const session = new Session((event) => {
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
  } else if (event.type === "built") {
    builtInfo = event;
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
  } else if (event.type === "serial") {
    serial += event.text;
    $("serial").textContent = serial;
  } else if (event.type === "output") {
    output += event.text;
    $("console").textContent = learnerOutput(output, true);
  } else if (event.type === "snapshot") {
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
      : `PC ${event.pc}${activeLine && activeLine > 0 ? ` · lesson source line ${activeLine}` : ""}. One source line may expand into several machine instructions.`;
    lineNumbers();
    if (activeLine > 0)
      source.scrollTop = Math.max(
        0,
        (activeLine - 3) * parseFloat(getComputedStyle(source).lineHeight),
      );
    $("trace-list").replaceChildren(
      ...trace.map((item) => {
        const li = document.createElement("li");
        li.textContent = `${item.from} → ${item.to} · ${item.instruction}`;
        return li;
      }),
    );
    stale();
  } else if (event.type === "done") {
    busy = false;
    paused = false;
    $("sticky-operation").hidden = true;
    controls();
    const result = readState(output);
    if (result) {
      showState(result, "Captured after your code completed");
      checkPrediction();
      status(
        "Run finished. Inspect the result, then change an input.",
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
    status("Stopped. Build or start stepping for a fresh machine.", "Stopped");
  }
});
async function runOnce({
  debug = false,
  code = source.value,
  test = fixture(),
} = {}) {
  builtSource = code;
  builtFingerprint = fingerprint();
  initialFixture = test;
  output = "";
  serial = "";
  builtInfo = null;
  trace = [];
  activeLine = null;
  paused = false;
  busy = true;
  predictionAtRun = $("prediction").value;
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
  $("prediction-feedback").textContent = "Checking against actual execution…";
  clearState("Building and running your code…");
  controls();
  stale();
  await session.start({ source: code, lesson, fixture: test, debug });
  return captureRecord();
}
function renderOutput() {
  $("console").textContent =
    learnerOutput(output) ||
    "No console text from your code. The state report is in the serial log.";
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
function startRun(debug = false) {
  if (batch) return;
  if (busy && !paused) return;
  cancelExecution();
  runOnce({ debug }).catch(() => {});
}
$("run").addEventListener("click", () => startRun());
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
source.addEventListener("input", () => {
  if (paused) {
    session.stop();
    activeLine = null;
  }
  undoSource = null;
  $("restore").textContent = "Restore starter";
  saveDraft();
  completeSource();
  $("prediction-feedback").textContent =
    "Run the edited code to check a fresh prediction.";
});
source.addEventListener("scroll", () => {
  $("line-numbers").scrollTop = source.scrollTop;
});
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    $("run").click();
  }
});
function switchActivity(next) {
  if (batch) return;
  if (busy || paused) session.stop();
  saveDraft();
  activity = next;
  caseIndex = 0;
  undoSource = null;
  source.value = restoreDraft(
    activity === "challenge" ? lesson.challenge.starter : lesson.starter,
  );
  $("explore-mode").setAttribute(
    "aria-pressed",
    String(activity === "explore"),
  );
  $("challenge-mode").setAttribute(
    "aria-pressed",
    String(activity === "challenge"),
  );
  $("challenge-controls").hidden = activity !== "challenge";
  $("prediction-block").hidden = activity !== "explore";
  clearState();
  startingState();
  completeSource();
  status(
    activity === "challenge"
      ? "Write the requested code, then check all cases."
      : "Ready for a fresh example.",
  );
  controls();
}
$("explore-mode").addEventListener("click", () => switchActivity("explore"));
$("challenge-mode").addEventListener("click", () =>
  switchActivity("challenge"),
);
$("start-challenge").addEventListener("click", () => {
  switchActivity("challenge");
  $("source-heading").scrollIntoView({ block: "start" });
  source.focus({ preventScroll: true });
});
$("case-picker").replaceChildren(
  ...lesson.challenge.cases.map((test, index) => {
    const button = document.createElement("button");
    button.textContent = test.name;
    button.setAttribute("aria-pressed", String(index === caseIndex));
    button.addEventListener("click", () => {
      if (busy || paused || batch) return;
      cancelExecution();
      caseIndex = index;
      $("case-picker")
        .querySelectorAll("button")
        .forEach((b, i) => b.setAttribute("aria-pressed", String(i === index)));
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
    inspect.addEventListener("click", () => inspectRecord(index, submitted));
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
$("restore").addEventListener("click", () => {
  cancelExecution();
  const fallback =
    activity === "challenge" ? lesson.challenge.starter : lesson.starter;
  if (undoSource !== null) {
    source.value = undoSource;
    undoSource = null;
    $("restore").textContent = "Restore starter";
  } else {
    undoSource = source.value;
    source.value = fallback;
    $("restore").textContent = "Undo restore";
  }
  saveDraft();
  completeSource();
});
$("next-hint").addEventListener("click", () => {
  if (hintIndex >= lesson.challenge.hints.length) return;
  const li = document.createElement("li");
  li.textContent = lesson.challenge.hints[hintIndex++];
  $("challenge-hints").append(li);
  $("next-hint").disabled = hintIndex >= lesson.challenge.hints.length;
});
$("use-reference").addEventListener("click", () => {
  cancelExecution();
  source.value = lesson.challenge.reference;
  saveDraft();
  completeSource();
  source.focus();
});
$("prediction-hint-button").addEventListener("click", () => {
  $("prediction-hint").hidden = !$("prediction-hint").hidden;
});
$("reading").value =
  lesson.prediction.reading === "unsigned" ? "unsigned" : "signed";
$("reading").addEventListener("change", () => renderRegisters());
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
    lesson.language === "c" ? "lesson.c" : "lesson.s",
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
      status("Could not download the linker script. Try again.", "Error", true);
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
$("lesson-complete").checked = completion().includes(lesson.id);
$("lesson-complete").addEventListener("change", () => {
  const saved = setComplete(lesson.id, $("lesson-complete").checked);
  renderCompletion();
  if (!saved)
    $("lesson-complete").closest("div").querySelector("p").textContent =
      "This mark is tab-only because browser storage is unavailable.";
});
source.value = restoreDraft(lesson.starter);
source.disabled = false;
startingState();
completeSource();
clearState();
controls();
status(
  "Ready. Build and run locally, or start stepping through real machine instructions.",
);
