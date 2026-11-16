// Copyright © 2026 Christopher Snow
import {
  calculatorParseEntry as parse,
  calculatorEntryFormat as format,
  calculatorReading as read,
  calculatorCompute as compute,
  calculatorAdditionCarries as carries,
} from "./calculator-model.js";
const opener = document.getElementById("open-calculator");
const storageKey = "riscv-assembly-lab:calculator:v1";
const defaults = () => ({
  width: 64,
  reading: "unsigned",
  a: "0",
  b: "1",
  operation: "add",
});
let work = defaults(),
  result = null,
  attempted = false;
try {
  const saved = JSON.parse(sessionStorage.getItem(storageKey));
  if (saved && typeof saved === "object") {
    if ([32, 64].includes(saved.width)) work.width = saved.width;
    if (["signed", "unsigned"].includes(saved.reading))
      work.reading = saved.reading;
    if (["add", "subtract", "shift-left"].includes(saved.operation))
      work.operation = saved.operation;
    for (const key of ["a", "b"])
      if (typeof saved[key] === "string" && saved[key].length <= 300)
        work[key] = saved[key];
  }
} catch {}
const dialog = document.createElement("dialog");
dialog.id = "calculator-dialog";
dialog.setAttribute("aria-labelledby", "calculator-heading");
dialog.innerHTML = `<div class="calculator-heading"><h2 id="calculator-heading">Programmer calculator</h2><button type="button" id="close-calculator" autofocus>Close</button></div>
<p class="calculator-note">Scratch work with numbers and bits. These controls do not run instructions or change your lesson code.</p>
<div class="calculator-settings"><label>Width <select id="calc-width"><option value="64">64 bits</option><option value="32">32 bits</option></select></label><label>Decimal reading <select id="calc-reading"><option value="unsigned">Unsigned</option><option value="signed">Signed</option></select></label></div>
<p id="calc-entry-help">Decimal by default. Use <code>0x</code> for hexadecimal or <code>0b</code> for binary. Spaces, commas and underscores may separate digits.</p>
<form id="calculator-form" novalidate>
${["a", "b"].map((key) => `<div class="calculator-value"><label for="calc-${key}" id="calc-${key}-label">Value ${key.toUpperCase()}</label><input id="calc-${key}" maxlength="300" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" aria-describedby="calc-entry-help calc-${key}-error"><p id="calc-${key}-error" class="calculator-error" hidden></p><div id="calc-${key}-readings" class="calculator-readings"></div></div>`).join("")}
<div class="calculator-operation"><label>Operation <select id="calc-operation"><option value="add">Add</option><option value="subtract">Subtract</option><option value="shift-left">Shift left</option></select></label><button class="primary" type="submit">Calculate</button></div>
</form>
<p id="calc-status" role="status"></p>
<section id="calc-result" aria-labelledby="calc-result-heading" hidden><h3 id="calc-result-heading">Retained result</h3><div id="calc-result-readings" class="calculator-readings"></div><p id="calc-full-result"></p><p id="calc-retained-note" class="calculator-note"></p><button id="calc-use-result" type="button">Use result as A</button></section>
<details id="calc-bits"><summary>Compare the bits</summary><div class="calculator-bit-tools"><p>Scroll the rows together to compare the same bit positions.</p><button id="calc-high" type="button">High bits</button><button id="calc-low" type="button">Low bits</button></div><p id="calc-bit-help">Choose a bit in A to switch it.</p><label id="calc-carry-control" hidden><input id="calc-carries" type="checkbox"> Show addition carries</label><div id="calc-bit-scroll" tabindex="0" role="region" aria-label="Aligned bits, highest on the left"><div id="calc-bit-rows"></div></div><div id="calc-carry-help" hidden></div></details>
<details class="calculator-help"><summary>Numbers and width</summary><p>Unsigned reads the bits as zero or a positive number. Signed uses the top bit to read negative numbers too.</p><p>Hexadecimal and binary entries describe bits. Shorter entries add zeros on the left. Selecting Signed changes how those bits are read; it does not copy their top bit into the added positions.</p><p>Values must fit the selected width. Extra leading zeros are allowed. Other extra upper bits are rejected, so a paste never changes the width or discards part of your value.</p><p>Changing from 64 bits to 32 bits keeps the low 32 bits and discards the upper bits. Changing from 32 bits to 64 bits adds upper zeros, even with Signed selected.</p><p>For Shift left, B is the number of positions to shift: zero to one less than the selected width. The full shift result uses the unsigned A bit pattern.</p></details>
<div class="calculator-footer"><button id="calc-reset" type="button">Reset calculator</button><p>Values stay in this tab when browser storage is available.</p></div>`;
document.body.append(dialog);
// Keep the lesson's document-level shortcuts outside this independent tool.
dialog.addEventListener("keydown", (event) => {
  event.stopPropagation();
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    dialog.querySelector("form").requestSubmit();
  }
});
const $ = (id) => dialog.querySelector("#" + id);
const encoded = (value) =>
  "0x" +
  BigInt(value)
    .toString(16)
    .padStart(work.width / 4, "0")
    .toUpperCase()
    .replace(/(.{4})(?=.)/g, "$1 ");
function readings(target, value) {
  target.replaceChildren();
  for (const [label, text] of [
    [
      `Decimal (${work.reading})`,
      value === null
        ? "—"
        : read(BigInt(value), work.width, work.reading).toLocaleString("en-GB"),
    ],
    ["Hexadecimal", value === null ? "—" : encoded(value)],
  ]) {
    const block = document.createElement("div"),
      title = document.createElement("span"),
      output = document.createElement("output");
    title.textContent = label;
    output.textContent = text;
    block.append(title, output);
    target.append(block);
  }
}
function parsed(key) {
  return parse(
    work[key],
    work.width,
    key === "b" && work.operation === "shift-left" ? "unsigned" : work.reading,
  );
}
function errorText(key, value) {
  const name = key.toUpperCase();
  if (
    value.ok &&
    key === "b" &&
    work.operation === "shift-left" &&
    BigInt(value.pattern) >= BigInt(work.width)
  )
    return `Enter a shift amount from 0 to ${work.width - 1}.`;
  if (value.ok) return "";
  if (value.error === "empty") return `Enter a value for ${name}.`;
  if (value.error === "range") {
    if (format(work[key]) !== "decimal")
      return `This value does not fit ${work.width} bits. ${work.width === 32 ? "Select 64 bits to keep the whole value." : "Enter a smaller value."}`;
    const signed =
        work.reading === "signed" &&
        !(key === "b" && work.operation === "shift-left"),
      limit = 1n << BigInt(work.width - (signed ? 1 : 0));
    return `Enter a decimal value from ${signed ? -limit : 0} to ${limit - 1n} for this width and reading.`;
  }
  return "Enter decimal, 0x followed by hexadecimal digits, or 0b followed by binary digits.";
}
function save() {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(work));
  } catch {}
}
function drawBits() {
  const rows = $("calc-bit-rows");
  rows.replaceChildren();
  const a = parsed("a"),
    b = parsed("b");
  const addCarries =
    result && work.operation === "add" && $("calc-carries").checked
      ? carries(result.a, result.b, work.width)
      : null;
  const row = (label, value, editable = false, indices = false) => {
    const line = document.createElement("div");
    line.className = "calculator-bit-row";
    const heading = document.createElement("span");
    heading.className = "calculator-bit-label";
    heading.textContent = label;
    line.append(heading);
    for (let bit = work.width - 1; bit >= 0; bit--) {
      const digit = indices
        ? String(bit)
        : value === null
          ? "—"
          : String((BigInt(value) >> BigInt(bit)) & 1n);
      const cell = document.createElement(editable ? "button" : "span");
      cell.className =
        "calculator-bit" +
        (digit === "1" && !indices ? " one" : "") +
        (indices ? " bit-index" : "");
      cell.textContent = digit;
      if (editable) {
        cell.type = "button";
        cell.disabled = value === null;
        cell.dataset.bit = String(bit);
        cell.setAttribute("aria-label", `A bit ${bit}: ${digit}`);
        cell.setAttribute("aria-pressed", String(digit === "1"));
        cell.addEventListener("click", () => {
          work.a = "0x" + (BigInt(value) ^ (1n << BigInt(bit))).toString(16);
          $("calc-a").value = work.a;
          invalidate();
          rows
            .querySelector(`[data-bit="${bit}"]`)
            ?.focus({ preventScroll: true });
        });
      }
      line.append(cell);
    }
    rows.append(line);
  };
  row("Bit", null, false, true);
  if (addCarries) row("Carry in", addCarries.carries);
  row("A", a.ok ? a.pattern : null, true);
  if (work.operation !== "shift-left")
    row(work.operation === "add" ? "+ B" : "− B", b.ok ? b.pattern : null);
  if (result) row("Result", result.pattern);
  $("calc-carry-control").hidden = !(result && work.operation === "add");
  $("calc-carry-help").hidden = !addCarries;
  if (addCarries)
    $("calc-carry-help").textContent =
      `Carry into bit ${work.width - 1}: ${addCarries.intoSign}. Carry out: ${addCarries.out}. Signed overflow: ${addCarries.v ? "Yes" : "No"}. Each column adds the two input bits and the carry from its right. A carry passes to the next column on the left. The carry out leaves the top bit, beyond the retained result. For addition, signed overflow occurs when the carry into the top bit differs from the carry out. These are properties of the addition; RISC-V does not record arithmetic condition flags.`;
}
function render() {
  $("calc-width").value = String(work.width);
  $("calc-reading").value = work.reading;
  $("calc-operation").value = work.operation;
  $("calc-b-label").textContent =
    work.operation === "shift-left" ? "Value B (shift amount)" : "Value B";
  for (const key of ["a", "b"]) {
    const value = parsed(key),
      error = errorText(key, value),
      show = Boolean(error && (attempted || work[key].trim()));
    readings($(`calc-${key}-readings`), value.ok ? value.pattern : null);
    $(`calc-${key}-error`).textContent = error;
    $(`calc-${key}-error`).hidden = !show;
    $(`calc-${key}`).setAttribute("aria-invalid", String(show));
  }
  $("calc-result").hidden = !result;
  if (result) {
    readings($("calc-result-readings"), result.pattern);
    $("calc-full-result").textContent =
      `Full mathematical result: ${BigInt(result.full).toLocaleString("en-GB")}`;
    $("calc-retained-note").textContent =
      `The retained result keeps the low ${work.width} bits. ${work.operation === "shift-left" ? "The full shift result uses the unsigned A bit pattern." : "The full mathematical result uses your selected decimal reading."}`;
  }
  drawBits();
  save();
}
function invalidate(
  message = "Inputs changed. Calculate to see a fresh result.",
) {
  result = null;
  attempted = false;
  $("calc-status").textContent = message;
  render();
}
for (const key of ["a", "b"]) {
  $(`calc-${key}`).value = work[key];
  $(`calc-${key}`).addEventListener("input", () => {
    work[key] = $(`calc-${key}`).value;
    invalidate();
  });
}
$("calculator-form").addEventListener("submit", (event) => {
  event.preventDefault();
  attempted = true;
  const a = parsed("a"),
    b = parsed("b");
  for (const [key, value] of [
    ["a", a],
    ["b", b],
  ])
    if (errorText(key, value)) {
      result = null;
      render();
      $(`calc-${key}`).focus();
      $("calc-status").textContent =
        "Correct the highlighted value, then calculate again.";
      return;
    }
  result = {
    ...compute(a.pattern, work.operation, b.pattern, work.width, work.reading),
    a: a.pattern,
    b: b.pattern,
  };
  $("calc-status").textContent = "Calculation complete.";
  render();
});
function settings(width, reading) {
  const oldWidth = work.width;
  for (const key of ["a", "b"]) {
    const value = parsed(key);
    if (!value.ok) continue;
    // Shift counts are quantities, so changing operand interpretation does not resize them.
    if (key === "b" && work.operation === "shift-left") continue;
    const pattern = BigInt.asUintN(width, BigInt(value.pattern));
    work[key] =
      format(work[key]) === "decimal"
        ? read(pattern, width, reading).toString()
        : format(work[key]) === "hex"
          ? "0x" + pattern.toString(16)
          : "0b" + pattern.toString(2);
    $(`calc-${key}`).value = work[key];
  }
  work.width = width;
  work.reading = reading;
  invalidate(
    width === oldWidth
      ? "Decimal reading changed. The bits are unchanged."
      : width === 32
        ? "Now 32 bits. Upper bits were discarded from valid values."
        : "Now 64 bits. Upper zeros were added to valid values.",
  );
}
$("calc-width").addEventListener("change", () =>
  settings(Number($("calc-width").value), work.reading),
);
$("calc-reading").addEventListener("change", () =>
  settings(work.width, $("calc-reading").value),
);
$("calc-operation").addEventListener("change", () => {
  work.operation = $("calc-operation").value;
  invalidate();
});
$("calc-use-result").addEventListener("click", () => {
  work.a = "0x" + BigInt(result.pattern).toString(16);
  $("calc-a").value = work.a;
  invalidate("Result copied to A.");
});
$("calc-carries").addEventListener("change", drawBits);
$("calc-high").addEventListener("click", () => {
  $("calc-bit-scroll").scrollLeft = 0;
});
$("calc-low").addEventListener("click", () => {
  $("calc-bit-scroll").scrollLeft = $("calc-bit-scroll").scrollWidth;
});
$("calc-reset").addEventListener("click", () => {
  work = defaults();
  for (const key of ["a", "b"]) $(`calc-${key}`).value = work[key];
  $("calc-carries").checked = false;
  invalidate("Calculator reset.");
});
let previousOverflow = "",
  previousPadding = "";
opener.disabled = false;
opener.addEventListener("click", () => {
  if (dialog.open) return;
  previousOverflow = document.documentElement.style.overflow;
  previousPadding = document.documentElement.style.paddingRight;
  const scrollbar = innerWidth - document.documentElement.clientWidth;
  if (scrollbar > 0)
    document.documentElement.style.paddingRight = `${parseFloat(getComputedStyle(document.documentElement).paddingRight) + scrollbar}px`;
  document.documentElement.style.overflow = "hidden";
  dialog.showModal();
  opener.setAttribute("aria-expanded", "true");
});
$("close-calculator").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  document.documentElement.style.overflow = previousOverflow;
  document.documentElement.style.paddingRight = previousPadding;
  opener.setAttribute("aria-expanded", "false");
});
render();
