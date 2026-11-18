// Copyright © 2026 Christopher Snow
import { escape } from "./html.js";
import { counterWrapState, restoreCounterTicks } from "./counter-wrap-model.js";

export function counterWrapText(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, name) => {
    if (!(name in values)) throw new Error("Missing counter value: " + name);
    return String(values[name]);
  });
}

// Generated HTML and runtime updates share the same canonical prose and model.
export function counterWrapMarkup(copy) {
  const state = counterWrapState(0);
  return `<section id="counter-wrap" class="counter-wrap" aria-labelledby="counter-wrap-heading">
    <h3 id="counter-wrap-heading">${escape(copy.title)}</h3>
    <p class="counter-model-note">${escape(counterWrapText(copy.modelNote, state))}</p>
    <p>${escape(copy.instruction)}</p>
    <div class="counter-addition" hidden>
      <p class="counter-equation" data-counter-addition></p>
      <div class="counter-binary">
        <code class="counter-operands" data-counter-operands></code>
        <div class="counter-sum-parts">
          <div><span>${escape(copy.carryLabel)}</span><code class="counter-carry" data-counter-carry></code></div>
          <div><span>${escape(copy.retainedLabel)}</span><code class="counter-kept" data-counter-retained></code></div>
        </div>
      </div>
      <p data-counter-carry-help>${escape(counterWrapText(copy.carryExplanation, state))}</p>
      <p data-counter-wrap-explanation hidden></p>
    </div>
    <p data-counter-initial>${escape(counterWrapText(copy.initialNote, state))}</p>

    <div class="counter-actions"><button type="button" class="primary" data-counter-advance disabled>${escape(copy.advance)}</button><button type="button" data-counter-reset disabled>${escape(copy.reset)}</button></div>
    <p class="counter-model-note" data-counter-limit hidden></p>
    <p class="counter-model-note counter-architecture">${escape(copy.architectureNote)}</p>
    <p class="counter-sr-only" role="status" aria-live="polite" aria-atomic="true" data-counter-status></p>
    <script type="application/json" id="counter-wrap-data">${JSON.stringify({copy}).replaceAll("<", "\\u003c")}</script>
  </section>`;
}

export function mountCounterWrap(root, lessonId) {
  if (!root) return;
  const {copy} = JSON.parse(root.querySelector("#counter-wrap-data").textContent);
  const key = "riscv-counter-wrap-v1:" + lessonId;
  let ticks = 0;
  try { ticks = restoreCounterTicks(localStorage.getItem(key)); } catch { /* Storage is optional. */ }
  const find = selector => root.querySelector(selector);
  const show = (selector, visible) => { find(selector).hidden = !visible; };
  const advance = find("[data-counter-advance]");
  const reset = find("[data-counter-reset]");
  function render(announce = false) {
    const state = counterWrapState(ticks);
    show("[data-counter-initial]", !ticks);
    show(".counter-addition", Boolean(ticks));
    const addition = state.addition;
    if (addition) {
      find("[data-counter-addition]").textContent = `${addition.before} + 1 = ${addition.fullSum}`;
      find("[data-counter-operands]").textContent = `${addition.before.toString(2).padStart(state.width, "0")} + ${(1n).toString(2).padStart(state.width, "0")} =`;
      find("[data-counter-carry]").textContent = String(addition.carryOut);
      find("[data-counter-retained]").textContent = addition.pattern;
      find("[data-counter-wrap-explanation]").textContent = counterWrapText(copy.wrapExplanation, addition);
    }
    show("[data-counter-wrap-explanation]", addition?.carryOut === 1n);
    const finished = ticks === state.maximumTicks;
    advance.disabled = finished;
    reset.disabled = false;
    show("[data-counter-limit]", finished);
    find("[data-counter-limit]").textContent = counterWrapText(copy.limitNote, state);
    if (announce) find("[data-counter-status]").textContent = counterWrapText(ticks ? copy.stepStatus : copy.initialStatus, {...state, ...addition});
  }
  function update(next) {
    const advanceFocused = document.activeElement === advance;
    ticks = next;
    try { localStorage.setItem(key, JSON.stringify(ticks)); } catch { /* The model still works without storage. */ }
    render(true);
    // Keep keyboard focus useful when the bounded example disables Advance.
    if (advance.disabled && advanceFocused) reset.focus({preventScroll:true});
  }
  advance.addEventListener("click", () => { if (!advance.disabled) update(ticks + 1); });
  reset.addEventListener("click", () => update(0));
  render();
}
