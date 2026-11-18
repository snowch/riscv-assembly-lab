// Copyright © 2026 Christopher Snow
import { REGISTERS, registerIndex, reading, hex } from "./model.js";

const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const option = (value, label = value) =>
  `<option value="${escape(value)}">${escape(label)}</option>`;
export function debuggerMarkup(lesson, { separateStack = false } = {}) {
  const c = lesson.language === "c";
  return `<details id="debugger-panel" class="debugger" ${lesson.module === "debugging" ? "open" : ""}>
  <summary>Debugger <span>Breakpoints and watches</span></summary>
  <div class="debugger-body">
    <p>A breakpoint pauses before its machine instruction executes. Choose a breakpoint, then use <strong>Start debugging</strong>. <strong>Continue</strong> runs to the next selected breakpoint or the end of your code. <strong>Step instruction</strong> executes one machine instruction.</p>
    <section aria-labelledby="debug-breakpoint-heading"><h3 id="debug-breakpoint-heading">Breakpoints</h3>
    <p id="debug-breakpoint-help">${c ? "This compiler does not supply C source-line mappings. Build or start stepping, then select a real instruction address below." : "Click a numbered assembly line beside the editor, or enter its number here. A line breakpoint uses the first machine instruction emitted for that exact line. Editing the source clears breakpoints."}</p>
    ${c ? "" : '<form id="debug-line-form" class="debug-form"><label>Assembly line<input id="debug-line" type="number" min="1" step="1" inputmode="numeric" value="1" required></label><button id="debug-add-line" type="submit">Toggle breakpoint</button></form>'}
    <p id="debug-breakpoint-status" class="debug-note" role="status">No breakpoints selected.</p>
    <ul id="debug-breakpoints" class="debug-chip-list"></ul>
    <details id="debug-disassembly"><summary>Choose an instruction address</summary><p class="debug-note">These are instructions in the current build. Selecting an address toggles a breakpoint. A source line can produce several instructions.</p><div id="debug-instructions" class="debug-instructions">Build or start stepping to inspect the actual instructions.</div></details>
    </section>
    <section aria-labelledby="debug-watch-heading"><h3 id="debug-watch-heading">Pinned registers</h3><p>Pin a register to keep its readings together. “Changed” compares the current observation with the preceding pause or captured result. Watches do not stop execution.</p>
    <form id="debug-register-form" class="debug-form"><label>Register<select id="debug-register">${REGISTERS.map((name) => option(name)).join("")}</select></label><button id="debug-pin-register" type="submit">Pin register</button></form><div id="debug-register-watches" class="debug-register-watches"></div></section>
    <section aria-labelledby="debug-memory-heading"><h3 id="debug-memory-heading">Memory watches</h3><p>A memory watch reads bytes when the machine pauses. Choose a base address, a signed byte offset and a width. Bytes are read in little-endian order: the first byte holds the lowest eight bits of the value. New watches refresh at the current pause without executing an instruction.</p>
    <form id="debug-memory-form" class="debug-form"><label>Base<select id="debug-memory-base">${option("lesson_data", lesson.kind === "program" ? "Program memory base" : "lesson_data")}${REGISTERS.map(
      (name) => option(name),
    ).join(
      "",
    )}</select></label><label>Byte offset<input id="debug-memory-offset" type="number" min="-4096" max="4096" step="1" value="0" required></label><label>Width<select id="debug-memory-width">${[1, 2, 4, 8].map((width) => option(width, `${width} ${width === 1 ? "byte" : "bytes"}`)).join("")}</select></label><button id="debug-memory-add" type="submit">Add memory watch</button></form>
    <p id="debug-memory-status" class="debug-note" role="status">Up to eight watches. Offsets range from −4096 to +4096 bytes.</p><div id="debug-memory-watches" class="debug-memory-watches"></div></section>
    ${separateStack ? "" : stackMarkup(lesson)}
    <p id="debug-observation" class="debug-note" role="status">No debugger observation yet. Start debugging or start stepping.</p>
  </div></details>`;
}
export function stackMarkup(lesson) {
  return `<details id="debug-stack-section" ${lesson.ui?.stack === false ? "hidden" : ""}><summary>Inspect the stack</summary><p class="debug-note">The stack pointer, sp, addresses the current stack storage. ra holds the current return address. Each row shows eight observed bytes, starting at the stack pointer. Matching an instruction address does not establish a call frame or a saved return address.</p><p id="debug-stack-registers" class="debug-stack-registers">Pause to inspect sp and ra.</p><p id="debug-stack-moment" class="debug-note"></p><div class="debug-table-scroll" tabindex="0" aria-label="Stack values"><table id="debug-stack"><thead><tr><th scope="col">Byte offset</th><th scope="col">Address</th><th scope="col">Observed bits</th><th scope="col">Exact address match</th></tr></thead><tbody></tbody></table></div></details>`;
}
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function valueFromBytes(bytes) {
  if (
    !bytes?.length ||
    bytes.some((value) => !Number.isInteger(value) || value < 0 || value > 255)
  )
    return null;
  return bytes.reduce(
    (value, byte, index) => value | (BigInt(byte) << BigInt(index * 8)),
    0n,
  );
}
function sameBytes(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((value, index) => value === b[index])
  );
}
export class DebuggerPanel {
  constructor(
    rootElement,
    {
      lesson,
      stackRoot = null,
      onBreakpoints = () => {},
      onWatches = () => {},
      onInspect = () => {},
      onPins = () => {},
    },
  ) {
    this.root = rootElement;
    this.lesson = lesson;
    this.onBreakpoints = onBreakpoints;
    this.onWatches = onWatches;
    this.onInspect = onInspect;
    this.onPins = onPins;
    this.lines = new Set();
    this.addresses = new Set();
    this.pins = new Set(lesson.pins ?? [lesson.result]);
    this.watches = [];
    this.nextWatch = 1;
    this.build = null;
    this.source = "";
    this.state = null;
    this.previous = null;
    this.position = {};
    this.busy = false;
    this.paused = false;
    this.batch = false;
    this.$ = (id) =>
      this.root.querySelector("#" + id) ?? stackRoot?.querySelector("#" + id);
    this.$("debug-line-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      this.toggleLine(Number(this.$("debug-line").value));
    });
    this.$("debug-register-form").addEventListener("submit", (event) => {
      event.preventDefault();
      if (this.locked()) return;
      this.pins.add(this.$("debug-register").value);
      this.renderRegisters();
      this.onPins();
    });
    this.$("debug-memory-form").addEventListener("submit", (event) => {
      event.preventDefault();
      this.addWatch();
    });
    this.$("debug-register").value = lesson.result;
    this.render();
  }
  locked() {
    return this.batch || (this.busy && !this.paused);
  }
  getBreakpoints() {
    return {
      lines: [...this.lines].sort((a, b) => a - b),
      addresses: [...this.addresses].sort((a, b) =>
        BigInt(a) < BigInt(b) ? -1 : BigInt(a) > BigInt(b) ? 1 : 0,
      ),
    };
  }
  getWatches() {
    return this.watches.map((watch) => ({ ...watch }));
  }
  setBuild(built, source) {
    this.build = built;
    const option = this.$("debug-memory-base").querySelector(
      '[value="lesson_data"]',
    );
    if (option) option.textContent = this.memoryBaseLabel("lesson_data");
    this.source = source;
    this.renderBreakpoints();
    this.renderInstructions();
    this.renderStack();
    this.applyBusy();
  }
  clear() {
    this.state = null;
    this.previous = null;
    this.position = {};
    this.render();
  }
  sourceChanged() {
    this.build = null;
    this.source = "";
    this.lines.clear();
    this.addresses.clear();
    this.clear();
    this.onBreakpoints(this.getBreakpoints());
    this.$("debug-breakpoint-status").textContent =
      "Source changed. Breakpoints were cleared; choose them for the new source.";
  }
  update(state, position = {}) {
    this.previous = this.state;
    this.state = state;
    this.position = position;
    this.renderRegisters();
    this.renderMemory();
    this.renderStack();
    this.renderInstructions();
    this.$("debug-observation").textContent = state
      ? `${position.when ?? "Captured observation"}${position.pc ? ` · PC ${hex(position.pc)}` : ""}. Watches show this observation.`
      : "No debugger observation yet. Start debugging or start stepping.";
    this.applyBusy();
  }
  setBusy({ busy = false, paused = false, batch = false }) {
    this.busy = busy;
    this.paused = paused;
    this.batch = batch;
    this.applyBusy();
  }
  applyBusy() {
    for (const input of this.root.querySelectorAll("input,select,button"))
      input.disabled = this.locked();
  }
  resolveLine(line) {
    return this.build?.disassembly.find(
      (instruction) => instruction.sourceLine - this.build.lineOffset === line,
    );
  }
  toggleLine(line) {
    if (this.locked() || this.lesson.language === "c") return;
    if (!Number.isInteger(line) || line < 1) {
      this.$("debug-breakpoint-status").textContent =
        "Enter a positive whole source-line number.";
      return;
    }
    if (this.source && line > this.source.split("\n").length) {
      this.$("debug-breakpoint-status").textContent =
        "That line is outside the source used in this build.";
      return;
    }
    if (this.lines.has(line)) this.lines.delete(line);
    else this.lines.add(line);
    this.renderBreakpoints();
    this.renderInstructions();
    this.onBreakpoints(this.getBreakpoints());
    this.applyBusy();
  }
  toggleAddress(address) {
    if (this.locked()) return;
    const key = hex(address);
    const matchingLines = [...this.lines].filter((line) => {
      const instruction = this.resolveLine(line);
      return instruction && hex(instruction.address) === key;
    });
    if (this.addresses.has(key) || matchingLines.length) {
      this.addresses.delete(key);
      for (const line of matchingLines) this.lines.delete(line);
    } else this.addresses.add(key);
    this.renderBreakpoints();
    this.renderInstructions();
    this.onBreakpoints(this.getBreakpoints());
    this.applyBusy();
  }

  renderBreakpoints() {
    const list = this.$("debug-breakpoints");
    list.replaceChildren();
    let unresolved = 0;
    for (const line of [...this.lines].sort((a, b) => a - b)) {
      const instruction = this.resolveLine(line),
        item = el("li"),
        remove = el("button", `Remove line ${line}`);
      const text = this.build
        ? instruction
          ? `Line ${line} · ${hex(instruction.address)}`
          : `Line ${line} · no machine instruction for this exact line`
        : `Line ${line} · resolves when built`;
      if (this.build && !instruction) unresolved++;
      item.append(el("span", text));
      remove.type = "button";
      remove.className = "debug-remove";
      remove.addEventListener("click", () => this.toggleLine(line));
      item.append(remove);
      list.append(item);
    }
    for (const address of this.addresses) {
      const item = el("li"),
        remove = el("button", `Remove ${address}`);
      item.append(el("span", `Instruction ${address}`));
      remove.type = "button";
      remove.className = "debug-remove";
      remove.addEventListener("click", () => this.toggleAddress(address));
      item.append(remove);
      list.append(item);
    }
    this.$("debug-breakpoint-status").textContent =
      this.lines.size + this.addresses.size
        ? `${this.lines.size + this.addresses.size} selected breakpoint${this.lines.size + this.addresses.size === 1 ? "" : "s"}.${unresolved ? ` ${unresolved} source line${unresolved === 1 ? " has" : "s have"} no machine instruction and will not pause.` : ""}`
        : `No breakpoints selected. Start debugging pauses at the first ${this.lesson.module === "playground" ? "project" : "lesson"} instruction.`;
  }
  renderInstructions() {
    const list = this.$("debug-instructions");
    const focusedAddress = list.contains(document.activeElement)
      ? document.activeElement.closest("button[data-address]")?.dataset.address
      : null;
    list.replaceChildren();
    if (!this.build) {
      list.textContent =
        "Build or start stepping to inspect the actual instructions.";
      return;
    }
    const addresses = new Set(this.addresses);
    for (const line of this.lines) {
      const instruction = this.resolveLine(line);
      if (instruction) addresses.add(hex(instruction.address));
    }
    for (const instruction of this.build.disassembly ?? []) {
      const address = hex(instruction.address),
        button = el("button");
      button.type = "button";
      button.className = "debug-instruction";
      button.setAttribute("aria-pressed", String(addresses.has(address)));
      button.dataset.address = address;
      if (
        this.position.pc &&
        BigInt(this.position.pc) === BigInt(instruction.address)
      )
        button.setAttribute("aria-current", "step");
      const line =
        this.lesson.language !== "c" && instruction.sourceLine
          ? instruction.sourceLine - this.build.lineOffset
          : null;
      button.append(
        el("span", address, "debug-instruction-address"),
        el("code", instruction.text),
        el("span", line > 0 ? `line ${line}` : "", "debug-instruction-line"),
      );
      button.setAttribute(
        "aria-label",
        `${addresses.has(address) ? "Remove" : "Set"} instruction breakpoint at ${address}: ${instruction.text}${line > 0 ? `, source line ${line}` : ""}`,
      );
      button.addEventListener("click", () => this.toggleAddress(address));
      list.append(button);
    }
    if (!(this.build.disassembly ?? []).length)
      list.textContent =
        "This source emitted no instructions in the inspected range.";
    if (focusedAddress) {
      const replacement = [
        ...list.querySelectorAll("button[data-address]"),
      ].find((button) => button.dataset.address === focusedAddress);
      replacement?.focus({ preventScroll: true });
    }
  }
  renderRegisters() {
    const list = this.$("debug-register-watches");
    list.replaceChildren();
    if (!this.pins.size) {
      list.append(el("p", "No registers pinned.", "debug-note"));
      return;
    }
    for (const name of this.pins) {
      const value = this.state?.registers[REGISTERS[registerIndex(name)]],
        old = this.previous?.registers[REGISTERS[registerIndex(name)]],
        changed =
          value !== undefined &&
          old !== undefined &&
          BigInt(value) !== BigInt(old),
        card = el(
          "article",
          undefined,
          "debug-watch-card" + (changed ? " changed" : ""),
        ),
        heading = el("div", undefined, "debug-watch-heading"),
        remove = el("button", `Unpin ${name}`);
      heading.append(el("h4", name));
      remove.type = "button";
      remove.className = "debug-remove";
      remove.addEventListener("click", () => {
        if (this.locked()) return;
        this.pins.delete(name);
        this.renderRegisters();
        this.onPins();
        this.applyBusy();
      });
      heading.append(remove);
      card.append(heading);
      if (value === undefined)
        card.append(el("p", "No observation yet.", "debug-note"));
      else {
        const decimalReadings =
          this.lesson.ui?.signed === false
            ? `Decimal reading ${reading(value)}`
            : `Signed ${reading(value)} · unsigned ${reading(value, "unsigned")}`;
        if (this.lesson.ui?.hex === false) {
          card.append(el("p", decimalReadings, "debug-value"));
        } else {
          card.append(
            el("p", hex(value), "debug-value"),
            el("p", decimalReadings, "debug-note"),
          );
        }
        if (changed)
          card.append(
            el(
              "p",
              `Changed from ${this.lesson.ui?.hex === false ? reading(old) : hex(old)}`,
              "debug-change",
            ),
          );
      }
      list.append(card);
    }
  }
  addWatch() {
    if (this.locked()) return;
    if (this.watches.length >= 8) {
      this.$("debug-memory-status").textContent =
        "Eight watches are already selected. Remove one before adding another.";
      return;
    }
    const base = this.$("debug-memory-base").value,
      offset = Number(this.$("debug-memory-offset").value),
      width = Number(this.$("debug-memory-width").value);
    if (
      !Number.isInteger(offset) ||
      Math.abs(offset) > 4096 ||
      ![1, 2, 4, 8].includes(width)
    ) {
      this.$("debug-memory-status").textContent =
        "Use a whole byte offset from −4096 to +4096 and a width of 1, 2, 4 or 8 bytes.";
      return;
    }
    if (
      this.watches.some(
        (watch) =>
          watch.base === base &&
          watch.offset === offset &&
          watch.width === width,
      )
    ) {
      this.$("debug-memory-status").textContent =
        "That memory watch is already selected.";
      return;
    }
    this.watches.push({ id: `watch-${this.nextWatch++}`, base, offset, width });
    this.$("debug-memory-status").textContent =
      "Memory watches refresh at pauses. They do not stop execution when memory changes.";
    this.onWatches(this.getWatches());
    this.renderMemory();
    if (this.paused) this.onInspect();
    this.applyBusy();
  }
  memoryBaseLabel(base) {
    return base === "lesson_data" &&
      this.lesson.kind === "program" &&
      !this.build?.hasDataSymbol
      ? "Program memory base"
      : base;
  }
  renderMemory() {
    const list = this.$("debug-memory-watches");
    list.replaceChildren();
    if (!this.watches.length) {
      list.append(el("p", "No memory watches selected.", "debug-note"));
      return;
    }
    for (const watch of this.watches) {
      const sample = this.state?.watches?.find(
          (sample) => sample.id === watch.id,
        ),
        old = this.previous?.watches?.find((sample) => sample.id === watch.id),
        value = valueFromBytes(sample?.bytes),
        changed =
          !!sample &&
          !!old &&
          valueFromBytes(old.bytes) !== null &&
          sample.address === old.address &&
          !sameBytes(sample.bytes, old.bytes) &&
          value !== null,
        card = el(
          "article",
          undefined,
          "debug-watch-card" + (changed ? " changed" : ""),
        ),
        heading = el("div", undefined, "debug-watch-heading"),
        remove = el("button", "Remove watch");
      heading.append(
        el(
          "h4",
          `${this.memoryBaseLabel(watch.base)} ${watch.offset < 0 ? "−" : "+"} ${Math.abs(watch.offset)} · ${watch.width} ${watch.width === 1 ? "byte" : "bytes"}`,
        ),
      );
      remove.type = "button";
      remove.className = "debug-remove";
      remove.setAttribute(
        "aria-label",
        `Remove memory watch ${this.memoryBaseLabel(watch.base)} ${watch.offset}`,
      );
      remove.addEventListener("click", () => {
        if (this.locked()) return;
        this.watches = this.watches.filter((item) => item.id !== watch.id);
        this.onWatches(this.getWatches());
        this.renderMemory();
        if (this.paused) this.onInspect();
        this.applyBusy();
      });
      heading.append(remove);
      card.append(heading);
      if (!sample)
        card.append(
          el(
            "p",
            "No memory sample in this observation. Start debugging or pause again.",
            "debug-note",
          ),
        );
      else if (sample.error || value === null)
        card.append(
          el(
            "p",
            `${sample.address ? `${sample.address}: ` : ""}${sample.error ?? "These bytes were not readable at this pause."}`,
            "debug-note",
          ),
        );
      else {
        card.append(
          el(
            "p",
            `${sample.address} · 0x${value.toString(16).padStart(watch.width * 2, "0")}`,
            "debug-value",
          ),
          el(
            "p",
            `Bytes ${sample.bytes.map((byte) => byte.toString(16).padStart(2, "0")).join(" ")} · unsigned ${value} · signed ${BigInt.asIntN(watch.width * 8, value)}`,
            "debug-note",
          ),
        );
        if (changed)
          card.append(
            el(
              "p",
              "Changed bytes at the same address since the preceding observation.",
              "debug-change",
            ),
          );
        else if (old && old.address !== sample.address)
          card.append(
            el(
              "p",
              `Base moved; previous sample was at ${old.address}.`,
              "debug-note",
            ),
          );
      }
      list.append(card);
    }
  }
  addressMatch(value) {
    if (!this.build) return "—";
    const symbols = (this.build.symbols ?? []).filter(
      (symbol) =>
        BigInt(symbol.address) === value && !symbol.name.startsWith("_lab_"),
    );
    if (symbols.length) return symbols.map((symbol) => symbol.name).join(", ");
    return this.build.allInstructions?.some(
      (instruction) => BigInt(instruction.address) === value,
    )
      ? "Matches an instruction address"
      : "—";
  }
  renderStack() {
    const body = this.$("debug-stack").tBodies[0];
    body.replaceChildren();
    const sp = this.state?.registers.sp,
      ra = this.state?.registers.ra;
    this.$("debug-stack-registers").textContent =
      sp === undefined
        ? "Pause to inspect sp and ra."
        : `sp ${hex(sp)} · ra ${hex(ra)}${this.build ? ` · ra: ${this.addressMatch(BigInt(ra))}` : ""}`;
    const stack = this.state?.stack;
    this.$("debug-stack-moment").textContent = stack
      ? `Observed at ${stack.address}${this.position.when ? ` · ${this.position.when}` : ""}. Each row contains eight bytes.`
      : "No stack-byte sample in this observation. Start debugging or pause again.";
    if (!stack) return;
    for (let offset = 0; offset < 64; offset += 8) {
      const value = valueFromBytes(stack.bytes.slice(offset, offset + 8)),
        row = el("tr");
      row.append(el("th", `+${offset}`));
      row.firstChild.scope = "row";
      row.append(
        el("td", hex(BigInt(stack.address) + BigInt(offset))),
        el("td", value === null ? "Not readable" : hex(value)),
        el("td", value === null ? "—" : this.addressMatch(value)),
      );
      body.append(row);
    }
  }
  render() {
    this.renderBreakpoints();
    this.renderInstructions();
    this.renderRegisters();
    this.renderMemory();
    this.renderStack();
    this.$("debug-observation").textContent =
      "No debugger observation yet. Start debugging or start stepping.";
    this.applyBusy();
  }
}
