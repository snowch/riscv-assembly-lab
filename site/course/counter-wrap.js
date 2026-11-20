// Copyright © 2026 Christopher Snow
import { escape } from "./html.js";
import {
  counterExplorerState,
  initialCounterExplorer,
  restoreCounterExplorer,
  stepCounterExplorer,
} from "./counter-wrap-model.js";

export function counterWrapText(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, name) => {
    if (!(name in values)) throw new Error("Missing counter value: " + name);
    return String(values[name]);
  });
}

function recentReadings(readings) {
  return readings
    .map(
      (value, index) =>
        `${index ? '<span aria-hidden="true"> → </span>' : ""}<code>${value}</code>`,
    )
    .join("");
}

// Generation and live updates use the same prose, state and arithmetic model.
function experimentMarkup(copy, direction) {
  const state = counterExplorerState(initialCounterExplorer());
  const backward = direction === -1;
  return `<div data-counter-pane="${backward ? "borrow" : "forward"}">
    ${backward ? "" : `<h3 id="counter-wrap-heading">${escape(copy.title)}</h3>`}
    <p class="counter-model-note">${escape(counterWrapText(backward ? copy.borrowIntro : copy.modelNote, state))}</p>
    <p>${escape(backward ? copy.borrowInstruction : copy.instruction)}</p>
    <div class="counter-sum-parts" data-counter-display>
      <div class="counter-marker-group"><span data-counter-marker-label>${escape(backward ? copy.borrowLabel : copy.carryLabel)}</span><code class="counter-carry" data-counter-carry>${escape(copy.pendingCarry)}</code></div>
      <div><span>${escape(copy.retainedLabel)}</span><code class="counter-kept" data-counter-retained>${state.pattern}</code><span class="counter-decimal"><span class="counter-sr-only">${escape(copy.decimalLabel)}: </span><span data-counter-decimal>${state.stored}</span></span></div>
    </div>
    <p class="counter-trace" aria-label="${escape(copy.trailLabel)}" data-counter-trace>${recentReadings(state.trace)}</p>
    <p class="counter-feedback" data-counter-feedback>${escape(counterWrapText(backward ? copy.borrowInitialNote : copy.initialNote, state))}</p>
    <div class="counter-actions"><button type="button" class="primary" data-counter-step aria-label="${escape(backward ? copy.previousLabel : copy.advanceLabel)}" disabled>${escape(backward ? copy.previous : copy.advance)}</button><button type="button" data-counter-reset disabled>${escape(copy.reset)}</button></div>
    <p class="counter-model-note counter-architecture">${escape(backward ? copy.borrowArchitectureNote : copy.architectureNote)}</p>
    <p class="counter-sr-only" role="status" aria-live="polite" aria-atomic="true" data-counter-status></p>
  </div>`;
}

export function counterWrapMarkup(copy) {
  return `<section id="counter-wrap" class="counter-wrap" aria-labelledby="counter-wrap-heading">
    ${experimentMarkup(copy, 1)}
    <details class="counter-borrow"><summary>${escape(copy.borrowTitle)}</summary>${experimentMarkup(copy, -1)}</details>
    <script type="application/json" id="counter-wrap-data">${JSON.stringify({ copy }).replaceAll("<", "\\u003c")}</script>
  </section>`;
}

export function mountCounterWrap(root, lessonId) {
  if (!root) return;
  const { copy } = JSON.parse(
    root.querySelector("#counter-wrap-data").textContent,
  );
  mountExperiment(
    root.querySelector('[data-counter-pane="forward"]'),
    copy,
    lessonId,
    1,
  );
  mountExperiment(
    root.querySelector('[data-counter-pane="borrow"]'),
    copy,
    lessonId,
    -1,
  );
}

function mountExperiment(root, copy, lessonId, direction) {
  const backward = direction === -1;
  const key =
    (backward ? "riscv-counter-borrow-v1:" : "riscv-counter-wrap-v2:") +
    lessonId;
  let saved = initialCounterExplorer();
  try {
    saved = restoreCounterExplorer(
      localStorage.getItem(key),
      backward
        ? null
        : localStorage.getItem("riscv-counter-wrap-v1:" + lessonId),
    );
  } catch {
    /* Storage is optional. */
  }
  const find = (selector) => root.querySelector(selector);
  const step = find("[data-counter-step]");
  const reset = find("[data-counter-reset]");
  function render(announce = false) {
    const state = counterExplorerState(saved);
    // Preserve the value of an old saved subtraction, without labelling its
    // borrow as an addition carry in the forward pane.
    const operation =
      state.operation?.direction === direction ? state.operation : null;
    const values = {
      ...state,
      direction: backward ? "−1" : "+1",
      marker: operation?.marker ?? copy.pendingCarry,
      markerLabel: backward ? copy.borrowLabel : copy.carryLabel,
    };
    find("[data-counter-marker-label]").textContent = values.markerLabel;
    find("[data-counter-carry]").textContent = String(values.marker);
    find("[data-counter-carry]").dataset.counterOperation = operation
      ? backward
        ? "subtract"
        : "add"
      : "none";
    find("[data-counter-retained]").textContent = state.pattern;
    find("[data-counter-decimal]").textContent = String(state.stored);
    find("[data-counter-trace]").innerHTML = recentReadings(state.trace);
    const feedback = !operation
      ? backward
        ? copy.borrowInitialNote
        : copy.initialNote
      : backward
        ? operation.wrapped
          ? copy.backwardWrapped
          : copy.backwardNormal
        : operation.wrapped
          ? copy.forwardWrapped
          : copy.forwardNormal;
    find("[data-counter-feedback]").textContent = counterWrapText(
      feedback,
      values,
    );
    step.disabled = reset.disabled = false;
    if (announce)
      find("[data-counter-status]").textContent = counterWrapText(
        operation ? copy.stepStatus : copy.initialStatus,
        values,
      );
  }
  function update(next) {
    saved = next;
    try {
      localStorage.setItem(key, JSON.stringify(saved));
    } catch {
      /* Works without storage. */
    }
    render(true);
  }
  step.addEventListener("click", () =>
    update(stepCounterExplorer(saved, direction)),
  );
  reset.addEventListener("click", () => update(initialCounterExplorer()));
  render();
}
