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
export function counterWrapMarkup(copy) {
  const state = counterExplorerState(initialCounterExplorer());
  return `<section id="counter-wrap" class="counter-wrap" aria-labelledby="counter-wrap-heading">
    <h3 id="counter-wrap-heading">${escape(copy.title)}</h3>
    <p class="counter-model-note">${escape(counterWrapText(copy.modelNote, state))}</p>
    <p>${escape(copy.instruction)}</p>
    <div class="counter-sum-parts" data-counter-display>
      <div class="counter-marker-group"><span data-counter-marker-label>${escape(copy.initialMarkerLabel)}</span><code class="counter-carry" data-counter-carry>${escape(copy.pendingCarry)}</code></div>
      <div><span>${escape(copy.retainedLabel)}</span><code class="counter-kept" data-counter-retained>${state.pattern}</code><span class="counter-decimal"><span class="counter-sr-only">${escape(copy.decimalLabel)}: </span><span data-counter-decimal>${state.stored}</span></span></div>
    </div>
    <p class="counter-trace" aria-label="${escape(copy.trailLabel)}" data-counter-trace>${recentReadings(state.trace)}</p>
    <p class="counter-feedback" data-counter-feedback>${escape(counterWrapText(copy.initialNote, state))}</p>
    <div class="counter-actions"><button type="button" data-counter-previous aria-label="${escape(copy.previousLabel)}" disabled>${escape(copy.previous)}</button><button type="button" class="primary" data-counter-advance aria-label="${escape(copy.advanceLabel)}" disabled>${escape(copy.advance)}</button><button type="button" data-counter-reset disabled>${escape(copy.reset)}</button></div>
    <p class="counter-model-note counter-architecture">${escape(copy.architectureNote)}</p>
    <p class="counter-sr-only" role="status" aria-live="polite" aria-atomic="true" data-counter-status></p>
    <script type="application/json" id="counter-wrap-data">${JSON.stringify({ copy }).replaceAll("<", "\\u003c")}</script>
  </section>`;
}

export function mountCounterWrap(root, lessonId) {
  if (!root) return;
  const { copy } = JSON.parse(
    root.querySelector("#counter-wrap-data").textContent,
  );
  const key = "riscv-counter-wrap-v2:" + lessonId;
  const legacyKey = "riscv-counter-wrap-v1:" + lessonId;
  let saved = initialCounterExplorer();
  try {
    saved = restoreCounterExplorer(
      localStorage.getItem(key),
      localStorage.getItem(legacyKey),
    );
  } catch {
    /* Storage is optional. */
  }
  const find = (selector) => root.querySelector(selector);
  const previous = find("[data-counter-previous]");
  const advance = find("[data-counter-advance]");
  const reset = find("[data-counter-reset]");
  function render(announce = false) {
    const state = counterExplorerState(saved);
    const operation = state.operation;
    const values = {
      ...state,
      direction: operation?.direction === 1 ? "+1" : "−1",
      marker: operation?.marker ?? copy.pendingCarry,
      markerLabel:
        operation?.direction === 1 ? copy.carryLabel : copy.borrowLabel,
    };
    find("[data-counter-marker-label]").textContent = !operation
      ? copy.initialMarkerLabel
      : operation.direction === 1
        ? copy.carryLabel
        : copy.borrowLabel;
    find("[data-counter-carry]").textContent = operation
      ? String(operation.marker)
      : copy.pendingCarry;
    find("[data-counter-carry]").dataset.counterOperation =
      operation?.direction === 1
        ? "add"
        : operation?.direction === -1
          ? "subtract"
          : "none";
    find("[data-counter-retained]").textContent = state.pattern;
    find("[data-counter-decimal]").textContent = String(state.stored);
    find("[data-counter-trace]").innerHTML = recentReadings(state.trace);
    const feedback = !operation
      ? copy.initialNote
      : operation.direction === 1
        ? operation.wrapped
          ? copy.forwardWrapped
          : copy.forwardNormal
        : operation.wrapped
          ? copy.backwardWrapped
          : copy.backwardNormal;
    find("[data-counter-feedback]").textContent = counterWrapText(
      feedback,
      values,
    );
    for (const control of [previous, advance, reset]) control.disabled = false;
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
      /* The counter still works without storage. */
    }
    render(true);
  }
  previous.addEventListener("click", () =>
    update(stepCounterExplorer(saved, -1)),
  );
  advance.addEventListener("click", () =>
    update(stepCounterExplorer(saved, 1)),
  );
  reset.addEventListener("click", () => update(initialCounterExplorer()));
  render();
}
