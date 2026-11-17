// Copyright © 2026 Christopher Snow
import { escape } from "../course/html.js";
import { reading, hex } from "../course/model.js";

export function createExecutionContext(
  root,
  copy,
  { revealSection, inspect, beforeGuide },
) {
  const route = document.createElement("section");
  route.className = "execution-context";
  route.setAttribute("aria-label", copy.execution.label);
  route.innerHTML = `<div id="execution-route" class="execution-route"></div><p id="execution-interval"></p><button id="open-complete-guide" class="text-button" type="button">${escape(copy.bridge.entryLabel)}</button>`;
  root.querySelector(".workspace-view-tabs").before(route);
  const observation = document.createElement("section");
  observation.className = "phone-observation";
  observation.setAttribute("aria-label", copy.observation.label);
  observation.innerHTML = `<div class="observation-heading"><p id="phone-observation-moment"></p><button type="button" class="text-button" id="phone-show-registers">${escape(copy.observation.showInspect)}</button></div><p id="phone-observation-next"></p><div class="phone-observation-values"><span id="phone-observation-reading"></span><div id="phone-observation-registers"></div></div>`;
  route.after(observation);
  document
    .getElementById("phone-show-registers")
    .addEventListener("click", inspect);
  route
    .querySelector("#open-complete-guide")
    .addEventListener("click", async () => {
      await beforeGuide();
      const guide = document.getElementById("complete-program-guide");
      guide.open = true;
      guide.scrollIntoView({ block: "start", behavior: "instant" });
      guide.querySelector("summary").focus({ preventScroll: true });
    });
  let kind = null;
  function update(view) {
    const e = copy.execution,
      o = copy.observation;
    if (kind !== view.context.kind) {
      kind = view.context.kind;
      const full = kind === "program",
        c = kind === "c";
      const s = e.compactStages;
      const stages = full
        ? [
            [s.programEntry, "user"],
            [s.programSource, "user"],
            [s.programExit, "user"],
          ]
        : [
            [s.setup, "setup"],
            [c ? s.function : s.fragment, c ? "c" : "user"],
            [s.capture, "report"],
            [s.report, "report"],
          ];
      route.querySelector("#execution-route").replaceChildren(
        ...stages.map(([label, section]) => {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = label;
          button.addEventListener("click", () => revealSection(section));
          return button;
        }),
      );
      const contract = full
        ? e.programContract
        : c
          ? e.cContract
          : e.fragmentContract;
      route
        .querySelector("#execution-route")
        .setAttribute("aria-label", contract);
      route.querySelector("#execution-route").title = contract;
      route.querySelector("#execution-interval").textContent = full
        ? e.programSummary
        : c
          ? e.cSummary
          : e.fragmentSummary;
      route.querySelector("#execution-interval").title = e.structureNote;
    }
    const moment = document.getElementById("phone-observation-moment"),
      next = document.getElementById("phone-observation-next");
    moment.textContent = !view.state
      ? view.context.kind === "program"
        ? o.noPausedObservation
        : o.notObserved
      : view.stale
        ? o.stale
        : view.context.kind === "program" && view.badge === "Finished"
          ? o.lastPause
          : view.badge === "Finished"
            ? o.captured
            : view.busy
              ? o.duringRun
              : view.observationWhen;
    const instruction =
      view.pc &&
      view.build?.allInstructions.find(
        (row) => BigInt(row.address) === BigInt(view.pc),
      );
    const pc = view.pc && "0x" + BigInt(view.pc).toString(16);
    next.textContent =
      view.pc && view.state
        ? `${instruction && view.badge !== "Finished" ? o.nextCompact.replace("{instruction}", instruction.text) + " · " : ""}${o.pcAtPause.replace("{pc}", pc)}`
        : "";
    next.title =
      view.pc && view.state
        ? `${o.pcAtPause.replace("{pc}", pc)}${instruction ? " · " + o.nextAtPause.replace("{instruction}", instruction.text) : ""}`
        : "";
    document.getElementById("phone-observation-reading").textContent =
      view.context.ui?.signed === false
        ? "Decimal reading"
        : o.reading.replace("{reading}", copy.calculator[view.readingMode]);
    const relevant =
      view.context.module === "playground"
        ? [...new Set([view.context.result, ...view.pins])]
        : view.context.observe;
    const pins = relevant.slice(0, 5),
      registers = document.getElementById("phone-observation-registers");
    registers.setAttribute(
      "aria-label",
      `${o.previewLabel} (${pins.length}/${relevant.length})`,
    );
    registers.replaceChildren(
      ...pins.map((name) => {
        const chip = document.createElement("span"),
          label = document.createElement("strong"),
          value = document.createElement("span");
        label.textContent = name;
        const pattern = view.state?.registers[name];
        value.textContent =
          pattern === undefined ? "—" : reading(pattern, view.readingMode);
        value.title =
          pattern === undefined
            ? view.context.kind === "program"
              ? o.noPausedObservation
              : o.notObserved
            : hex(pattern);
        chip.className =
          name === view.context.result ? "observation-result" : "";
        chip.append(label, value);
        return chip;
      }),
    );
    if (!pins.length) registers.textContent = o.noPins;
    if (relevant.length > 5) {
      const more = document.createElement("span");
      more.textContent = o.morePins.replace(
        "{count}",
        String(relevant.length - 5),
      );
      registers.append(more);
    }
  }
  return { update };
}
