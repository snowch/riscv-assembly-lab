// Copyright © 2026 Christopher Snow
import { escape } from "../course/html.js";
import { hex, registerIndex } from "../course/model.js";
import toolCopy from "../course/tool-context-copy.js";
import { createUnifiedDock } from "../course/unified-layout.js";
import { createExecutionContext } from "./context-view.js";

// These views retain the editor and inspector DOM, including their scroll state.
export function createPlaygroundLayout(copy) {
  const $ = (id) => document.getElementById(id);
  const root = $("workbench"),
    workspace = root.querySelector(".workspace"),
    left = root.querySelector(".editor-panel"),
    right = root.querySelector(".run-panel"),
    narrow = matchMedia("(max-width: 950px)");
  document.querySelector(".project-tools").append($("project-setup"));
  right.querySelector(".panel-heading").after($("observation-note"));
  $("project-setup").querySelector("summary").firstChild.textContent =
    copy.setup + " ";
  const code = document.createElement("section");
  code.id = "workspace-code-panel";
  code.className = "workspace-code-panel";
  code.append(...left.childNodes);
  code.querySelector(".panel-heading").after($("snapshot-note"));
  left.append(code);
  const program = document.createElement("section");
  program.id = "workspace-program-panel";
  program.className = "program-view";
  program.hidden = true;
  program.innerHTML = `<div class="program-toolbar"><label>${escape(copy.program)}<select id="program-mode"><option value="source">${escape(copy.source)}</option><option value="instructions">${escape(copy.instructions)}</option></select></label><button type="button" class="text-button" id="program-edit">${escape(copy.editCode)}</button></div><p id="program-view-note" class="program-note"></p><div id="program-source-view" class="program-scroll" tabindex="0" aria-label="${escape(copy.source)}"><p class="program-readonly">${escape(copy.currentSource)}</p><div id="program-sections"></div></div><div id="program-machine-view" class="program-scroll" tabindex="0" aria-label="${escape(copy.instructions)}" hidden><div class="machine-tools"><label>${escape(copy.scope)}<select id="machine-scope"><option value="user">${escape(copy.userInstructions)}</option><option value="all">${escape(copy.allInstructions)}</option></select></label><p id="machine-scope-note">${escape(copy.allScope)}</p></div><p id="machine-note" class="program-note"></p><p id="machine-c-note" class="program-note" hidden>${escape(copy.cMapping)}</p><div id="machine-listing" class="machine-listing"></div></div>`;
  left.append(program);
  $("program-view-note").after($("machine-note"), $("machine-c-note"));
  $("machine-note").hidden = true;
  const outside = document.createElement("div");
  outside.id = "machine-outside";
  outside.className = "machine-outside";
  outside.hidden = true;
  const outsideNote = document.createElement("p"),
    outsideAction = document.createElement("button");
  outsideNote.id = "machine-outside-note";
  outsideAction.id = "machine-show-current";
  outsideAction.type = "button";
  outsideAction.textContent = toolCopy.scope.showCurrent;
  outsideAction.addEventListener("click", () => {
    $("machine-scope").value = "all";
    renderInstructions(true);
    requestAnimationFrame(jumpToPc);
    $("machine-jump").focus({ preventScroll: true });
  });
  outside.append(outsideNote, outsideAction);
  $("machine-c-note").after(outside);
  const tabs = document.createElement("div");
  tabs.className = "workspace-view-tabs";
  tabs.setAttribute("role", "tablist");
  tabs.setAttribute("aria-label", copy.views);
  tabs.innerHTML = ["code", "program", "inspect"]
    .map(
      (name) =>
        `<button type="button" role="tab" id="workspace-${name}" aria-controls="workspace-${name}-panel" aria-selected="${name === "code"}" tabindex="${name === "code" ? "0" : "-1"}">${escape(copy[name])}</button>`,
    )
    .join("");
  workspace.before(tabs);
  right.id = "workspace-inspect-panel";
  let unified = null;
  let selected = "code",
    lastLeft = "code",
    lastContext = null,
    sourceSignature = null,
    lastBuild = null,
    buildSource = null,
    lastView = null,
    togglePin = () => {},
    closeWorkspace = async () => {},
    registerFilter = "all";
  function select(name, focus = false) {
    if (unified) return unified.select(name, focus);
    selected = name;
    if (name !== "inspect") lastLeft = name;
    const active =
      !narrow.matches && selected === "inspect" ? lastLeft : selected;
    root.dataset.workspaceView = active;
    code.hidden =
      active === "program" || (narrow.matches && active === "inspect");
    program.hidden = active !== "program";
    for (const tab of tabs.children) {
      const chosen = tab.id === `workspace-${active}`;
      tab.setAttribute("aria-selected", String(chosen));
      tab.tabIndex = chosen ? 0 : -1;
    }
    for (const [panel, name] of [
      [code, "code"],
      [program, "program"],
    ]) {
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", `workspace-${name}`);
    }
    if (narrow.matches) {
      right.setAttribute("role", "tabpanel");
      right.setAttribute("aria-labelledby", "workspace-inspect");
    } else {
      right.removeAttribute("role");
      right.removeAttribute("aria-labelledby");
    }
    if (focus) $(`workspace-${active}`).focus({ preventScroll: true });
    if (active === "program" && $("program-mode").value === "instructions")
      requestAnimationFrame(jumpToPc);
    window.dispatchEvent(new Event("resize"));
  }
  tabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[role=tab]");
    if (tab) select(tab.id.slice("workspace-".length));
  });
  tabs.addEventListener("keydown", (event) => {
    const available = [...tabs.children].filter(
      (tab) => getComputedStyle(tab).display !== "none",
    );
    const index = available.indexOf(document.activeElement),
      offset = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? available.length - 1
          : offset
            ? (index + offset + available.length) % available.length
            : null;
    if (next === null) return;
    event.preventDefault();
    select(available[next].id.slice("workspace-".length), true);
  });
  narrow.addEventListener("change", () => select(selected));
  $("program-edit").addEventListener("click", () => select("code", true));
  $("program-mode").addEventListener("change", () => {
    const instructions = $("program-mode").value === "instructions";
    $("program-source-view").hidden = instructions;
    $("program-machine-view").hidden = !instructions;
    $("program-view-note").hidden = instructions;
    $("machine-note").hidden = !instructions;
    $("machine-c-note").hidden =
      !instructions || lastView?.context.language !== "c";
    outside.hidden = !instructions || !outside.dataset.available;
    if (instructions) requestAnimationFrame(jumpToPc);
  });
  $("machine-scope").addEventListener("change", () => renderInstructions(true));
  const jump = document.createElement("button");
  jump.id = "machine-jump";
  jump.type = "button";
  jump.textContent = copy.jumpPc;
  jump.disabled = true;
  $("machine-scope-note").before(jump);
  jump.addEventListener("click", jumpToPc);
  function jumpToPc() {
    const row = $("machine-listing").querySelector('[aria-current="step"]');
    if (!row || program.hidden || $("program-machine-view").hidden) return;
    const scroller = $("program-machine-view"),
      bounds = scroller.getBoundingClientRect(),
      item = row.getBoundingClientRect(),
      tools = scroller
        .querySelector(".machine-tools")
        .getBoundingClientRect().height;
    scroller.scrollBy({
      top:
        item.top -
        bounds.top -
        tools -
        (bounds.height - tools - item.height) / 2,
      behavior: "instant",
    });
  }
  const filter = document.createElement("div");
  filter.className = "register-tools";
  filter.innerHTML = `<label>${escape(copy.filter)}<select id="register-filter">${["all", "pinned", "changed"].map((name) => `<option value="${name}">${escape(copy[name])}</option>`).join("")}</select></label><details><summary aria-label="${escape(copy.filterHelp)}">?</summary><p>${escape(copy.filterHelp)}</p></details>`;
  $("registers").before(filter);
  const empty = document.createElement("p");
  empty.id = "register-filter-empty";
  empty.className = "program-note";
  empty.textContent = copy.emptyRegisters;
  empty.hidden = true;
  $("registers").after(empty);
  $("register-filter").addEventListener("change", () => {
    registerFilter = $("register-filter").value;
    filterRegisters();
  });
  $("registers").addEventListener("click", (event) => {
    const button = event.target.closest(".register-pin");
    if (button) {
      const name = button.dataset.register;
      togglePin(name);
      const replacement = $("registers").querySelector(
        `.register-pin[data-register="${name}"]`,
      );
      if (replacement && !replacement.closest(".register").hidden)
        replacement.focus({ preventScroll: true });
      else $("register-filter").focus({ preventScroll: true });
    }
  });
  function filterRegisters() {
    const cards = [...$("registers").children];
    const pins = new Set(lastView?.pins ?? []);
    for (const card of cards) {
      const name = card.dataset.register,
        pinned = pins.has(name);
      card.classList.toggle("pinned", pinned);
      let button = card.querySelector(".register-pin");
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "register-pin";
        button.dataset.register = name;
        card.append(button);
      }
      button.textContent = pinned ? "●" : "○";
      button.setAttribute(
        "aria-label",
        `${pinned ? copy.unpin : copy.pin} ${name}`,
      );
      button.title = button.getAttribute("aria-label");
      button.setAttribute("aria-pressed", String(pinned));
      card.hidden =
        registerFilter === "pinned"
          ? !pinned
          : registerFilter === "changed"
            ? !card.classList.contains("changed")
            : false;
    }
    const rank = (card) =>
      pins.has(card.dataset.register)
        ? 0
        : card.classList.contains("changed")
          ? 1
          : 2;
    const ordered = [...cards].sort(
      (a, b) =>
        rank(a) - rank(b) ||
        registerIndex(a.dataset.register) - registerIndex(b.dataset.register),
    );
    if (ordered.some((card, index) => card !== cards[index]))
      $("registers").append(...ordered);
    empty.hidden = cards.some((card) => !card.hidden);
  }
  new MutationObserver(filterRegisters).observe($("registers"), {
    childList: true,
  });
  function sourceBlock(source, title) {
    const section = document.createElement("section"),
      heading = document.createElement("h3"),
      pre = document.createElement("pre");
    heading.textContent = title;
    pre.textContent = source;
    section.append(heading, pre);
    return section;
  }
  function renderSource(view) {
    const signature = JSON.stringify([
      view.program.source,
      view.source,
      view.context.language,
    ]);
    if (signature === sourceSignature) return;
    sourceSignature = signature;
    const opened = new Set(
      [...$("program-sections").querySelectorAll("details[open]")].map(
        (el) => el.dataset.section,
      ),
    );
    const sections = [];
    if (view.context.language === "c") {
      const cSource = sourceBlock(view.source, copy.cSource);
      cSource.dataset.section = "c";
      sections.push(cSource);
    }
    let line = 1;
    for (const part of view.program.sections) {
      const title = copy.parts[part.id],
        lines =
          part.source.split("\n").length - (part.source.endsWith("\n") ? 1 : 0);
      const section = part.folded
          ? document.createElement("details")
          : document.createElement("section"),
        heading = document.createElement(part.folded ? "summary" : "h3"),
        pre = document.createElement("pre");
      section.className = "program-section";
      section.dataset.section = part.id;
      section.dataset.startLine = String(line);
      heading.textContent = `${title}${part.folded ? ` · ${lines} ${copy.lines}` : ""}`;
      pre.textContent = part.source;
      pre.dataset.programSource = "";
      section.append(heading, pre);
      if (part.folded) section.open = opened.has(part.id);
      sections.push(section);
      line += lines;
    }
    $("program-sections").replaceChildren(...sections);
    $("program-view-note").textContent =
      view.context.kind === "program"
        ? copy.programIntro
        : view.context.language === "c"
          ? copy.cIntro
          : copy.fragmentIntro;
  }
  function renderInstructions(rebuild = false) {
    const full = lastView?.context.kind === "program";
    const c = lastView?.context.language === "c";
    $("machine-scope").querySelector('[value="user"]').textContent = c
      ? copy.cUserInstructions
      : copy.userInstructions;
    $("machine-c-note").textContent =
      $("machine-scope").value === "all" ? copy.cAllMapping : copy.cMapping;
    $("machine-scope").parentElement.hidden = full;
    $("machine-scope-note").textContent =
      $("machine-scope").value === "all"
        ? toolCopy.scope.allMeaning
        : copy.allScope;
    $("machine-scope-note").hidden = full;
    $("machine-c-note").hidden =
      !c || $("program-mode").value !== "instructions";
    $("machine-note").textContent = !lastBuild
      ? copy.noBuild
      : lastView.source !== buildSource
        ? copy.stale
        : copy.buildNote;
    if (rebuild) {
      const rows = [],
        list = !lastBuild
          ? []
          : full
            ? lastBuild.disassembly
            : $("machine-scope").value === "all"
              ? lastBuild.allInstructions
              : lastBuild.disassembly;
      for (const instruction of list ?? []) {
        const row = document.createElement("div");
        row.className = "machine-instruction";
        row.dataset.address = hex(instruction.address);
        const pc = document.createElement("span"),
          address = document.createElement("span"),
          text = document.createElement("code"),
          line = document.createElement("span");
        pc.className = "machine-pc";
        address.className = "machine-address";
        address.textContent = "0x" + instruction.address.toString(16);
        text.textContent = instruction.text;
        const sourceLine = instruction.sourceLine;
        if (sourceLine && instruction.sourceFile?.endsWith("program.s")) {
          const projectLine = sourceLine - lastBuild.lineOffset;
          const project =
            full ||
            (!c &&
              projectLine > 0 &&
              projectLine <=
                buildSource.split("\n").length -
                  (buildSource.endsWith("\n") ? 1 : 0));
          line.textContent = (
            project
              ? toolCopy.execution.sourceLabels.project
              : toolCopy.execution.sourceLabels.supplied
          ).replace("{line}", String(project ? projectLine : sourceLine));
        } else if (sourceLine && instruction.sourceFile) {
          line.textContent = `${instruction.sourceFile}:${sourceLine}`;
        } else line.textContent = "";
        line.className = "machine-source-line";
        row.append(pc, address, text, line);
        rows.push(row);
      }
      $("machine-listing").replaceChildren(...rows);
      if (!rows.length)
        $("machine-listing").textContent = lastBuild
          ? copy.noInstructions
          : copy.noBuild;
    }
    const previousPc = $("machine-listing").querySelector(
      '[aria-current="step"]',
    )?.dataset.address;
    for (const row of $("machine-listing").querySelectorAll(
      ".machine-instruction",
    )) {
      const current =
        lastView.pc && BigInt(lastView.pc) === BigInt(row.dataset.address);
      if (current) row.setAttribute("aria-current", "step");
      else row.removeAttribute("aria-current");
      row.querySelector(".machine-pc").textContent = current ? copy.pc : "";
    }
    const currentPc = $("machine-listing").querySelector(
      '[aria-current="step"]',
    )?.dataset.address;
    jump.disabled = !currentPc;
    const known =
      lastView.pc &&
      lastBuild?.allInstructions.some(
        (row) => BigInt(row.address) === BigInt(lastView.pc),
      );
    const symbol =
      known &&
      lastBuild.symbols?.find(
        (symbol) =>
          symbol.size > 0 &&
          BigInt(lastView.pc) >= BigInt(symbol.address) &&
          BigInt(lastView.pc) < BigInt(symbol.address + symbol.size),
      );
    const missing = known && !currentPc;
    outside.dataset.available = missing ? "true" : "";
    outside.hidden = !missing || $("program-mode").value !== "instructions";
    outsideNote.textContent = symbol
      ? toolCopy.scope.outsideNamed.replace("{symbol}", symbol.name)
      : toolCopy.scope.outsideAddress.replace("{pc}", lastView.pc ?? "");
    if (rebuild || previousPc !== currentPc) requestAnimationFrame(jumpToPc);
  }
  function update(view) {
    const changedContext = lastContext !== view.context;
    if (changedContext) {
      lastBuild = null;
      buildSource = null;
      sourceSignature = null;
      $("program-sections").replaceChildren();
    }
    lastContext = view.context;
    lastView = view;
    const buildChanged = view.build && view.build !== lastBuild;
    if (buildChanged) {
      lastBuild = view.build;
      buildSource = view.buildSource;
    }
    renderSource(view);
    renderInstructions(changedContext || buildChanged);
    filterRegisters();
    execution.update(view);
  }
  const execution = createExecutionContext(root, toolCopy, {
    beforeGuide() {
      return closeWorkspace();
    },
    revealSection(id) {
      $("program-mode").value = "source";
      $("program-mode").dispatchEvent(new Event("change"));
      select("program");
      const section = $("program-sections").querySelector(
        `[data-section="${id}"]`,
      );
      if (section?.tagName === "DETAILS") section.open = true;
      requestAnimationFrame(() => {
        if (!section) return;
        const scroller = $("program-source-view");
        scroller.scrollTop +=
          section.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top;
        scroller.focus({ preventScroll: true });
      });
    },
    inspect() {
      select("inspect", true);
      $("tab-registers").click();
    },
  });
  unified = createUnifiedDock(root, { program, inspector: right, copy });
  select("code");
  return {
    update,
    select,
    setToolsOpen(value) {
      unified.open(value);
    },
    bindPin(handler) {
      togglePin = handler;
    },
    bindWorkspaceClose(handler) {
      closeWorkspace = handler;
    },
  };
}
