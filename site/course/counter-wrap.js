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
export function counterWrapMarkup(copy, elapsed) {
  const state = counterWrapState(0);
  return `<section id="counter-wrap" class="counter-wrap" aria-labelledby="counter-wrap-heading">
    <h3 id="counter-wrap-heading">${escape(copy.title)}</h3>
    <p class="counter-model-note">${escape(counterWrapText(copy.modelNote, state))}</p>
    <p>${escape(copy.instruction)}</p>
    <div class="counter-actions"><button type="button" data-counter-advance disabled>${escape(copy.advance)}</button><button type="button" data-counter-reset disabled>${escape(copy.reset)}</button></div>
    <div class="counter-wrap-display">
      <div><span class="counter-label">${escape(copy.counterLabel)}</span><div class="counter-bits" role="img" aria-label="${state.pattern}">${[...state.pattern].map(bit => `<span aria-hidden="true">${bit}</span>`).join("")}</div>
      <dl class="counter-readings"><div><dt>${escape(copy.startingLabel)}</dt><dd>${state.start}</dd></div><div><dt>${escape(copy.ticksLabel)}</dt><dd data-counter-ticks>0</dd></div></dl></div>
      <div class="counter-addition" hidden><h4>${escape(copy.additionLabel)}</h4><div class="counter-equation" data-counter-addition></div><dl class="counter-calculation"><div><dt>${escape(copy.fullSumLabel)}</dt><dd data-counter-sum></dd></div><div class="counter-carry"><dt>${escape(copy.carryLabel)}</dt><dd data-counter-carry></dd></div><div><dt>${escape(copy.retainedLabel)}</dt><dd data-counter-retained></dd></div></dl></div>
    </div>
    <p data-counter-initial>${escape(copy.initialNote)}</p>
    <p class="counter-trace"><span>${escape(copy.traceLabel)}</span>: <output data-counter-trace>${state.start}</output></p>
    <p data-counter-carry-help hidden>${escape(copy.carryExplanation)}</p>
    <p data-counter-wrap-explanation hidden></p>
    <p data-counter-limit hidden></p>
    <div class="counter-elapsed" hidden><h4>${escape(copy.elapsedTitle)}</h4><p class="counter-equation" data-counter-difference></p><p data-counter-elapsed></p><p data-counter-assumption></p><p>${escape(copy.turnLimit)}</p></div>
    <p class="counter-model-note">${escape(copy.architectureNote)}</p>
    <p class="counter-sr-only" role="status" aria-live="polite" aria-atomic="true" data-counter-status></p>
    <script type="application/json" id="counter-wrap-data">${JSON.stringify({copy, elapsed}).replaceAll("<", "\\u003c")}</script>
  </section>`;
}

export function mountCounterWrap(root, lessonId) {
  if (!root) return;
  const {copy, elapsed} = JSON.parse(root.querySelector("#counter-wrap-data").textContent);
  const key = "riscv-counter-wrap-v1:" + lessonId;
  let ticks = 0;
  try { ticks = restoreCounterTicks(localStorage.getItem(key)); } catch { /* Storage is optional. */ }
  const find = selector => root.querySelector(selector);
  const show = (selector, visible) => { find(selector).hidden = !visible; };
  const advance = find("[data-counter-advance]");
  const reset = find("[data-counter-reset]");
  function render(announce = false) {
    const state = counterWrapState(ticks);
    const bits = find(".counter-bits");
    bits.setAttribute("aria-label", state.pattern);
    [...bits.children].forEach((bit, index) => { bit.textContent = state.pattern[index]; });
    find("[data-counter-ticks]").textContent = String(ticks);
    find("[data-counter-trace]").textContent = state.trace.join(" → ");
    show("[data-counter-initial]", !ticks);
    show(".counter-addition", Boolean(ticks));
    show("[data-counter-carry-help]", Boolean(ticks));
    const addition = state.addition;
    if (addition) {
      find("[data-counter-addition]").textContent = `${addition.before} + 1 = ${addition.fullSum}`;
      find("[data-counter-sum]").textContent = counterWrapText(copy.fullSumValue, addition);
      find("[data-counter-carry]").textContent = String(addition.carryOut);
      find("[data-counter-retained]").textContent = counterWrapText(copy.retainedValue, addition);
      find("[data-counter-wrap-explanation]").textContent = counterWrapText(copy.wrapExplanation, addition);
    }
    show("[data-counter-wrap-explanation]", addition?.carryOut === 1n);
    const finished = ticks === state.maximumTicks;
    advance.disabled = finished;
    reset.disabled = false;
    show("[data-counter-limit]", finished);
    find("[data-counter-limit]").textContent = counterWrapText(copy.limitNote, state);
    show(".counter-elapsed", elapsed && finished);
    if (elapsed && finished) {
      find("[data-counter-difference]").textContent = `${state.stored} − ${state.start} → ${state.elapsed}`;
      find("[data-counter-elapsed]").textContent = counterWrapText(copy.elapsedExplanation, state);
      find("[data-counter-assumption]").textContent = counterWrapText(copy.elapsedAssumption, state);
    }
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
