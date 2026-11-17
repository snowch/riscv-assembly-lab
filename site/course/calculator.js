// Copyright © 2026 Christopher Snow
import {
  calculatorParseEntry as parse,
  calculatorEntryFormat as format,
  calculatorReading as read,
  calculatorCompute as compute,
  calculatorAdditionCarries as carries,
} from "./calculator-model.js";
import toolCopy from "./tool-context-copy.js";
const copy = toolCopy.calculator;
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
dialog.innerHTML = `<div class="calculator-heading"><div><h2 id="calculator-heading">Programmer calculator</h2><span id="calc-context" class="calculator-note"></span></div><button type="button" id="close-calculator" autofocus>Close</button></div>
<p class="calculator-note calculator-intro">${copy.intro}</p>
<div class="calculator-settings"><label>${copy.width} <select id="calc-width" aria-describedby="calc-width-note"><option value="64">64 bits</option><option value="32">32 bits</option></select></label><label>${copy.reading} <select id="calc-reading"><option value="unsigned">Unsigned</option><option value="signed">Signed</option></select></label></div>
<p id="calc-width-note" class="calculator-note"></p>
<p id="calc-entry-help">${copy.entryHelp.replace("0x", "<code>0x</code>").replace("0b", "<code>0b</code>")}</p>
<form id="calculator-form" novalidate>
<div class="calculator-operands">
${["a", "b"].map((key) => `<div class="calculator-value"><label for="calc-${key}" id="calc-${key}-label">Value ${key.toUpperCase()}</label><input id="calc-${key}" maxlength="300" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" aria-describedby="calc-entry-help calc-${key}-error"><p id="calc-${key}-error" class="calculator-error" hidden></p><div id="calc-${key}-readings" class="calculator-readings"></div></div>`).join("")}
</div>
<div class="calculator-operation"><label>Operation <select id="calc-operation"><option value="add">Add</option><option value="subtract">Subtract</option><option value="shift-left">Shift left</option></select></label><button class="primary" type="submit">Calculate</button></div>
</form>
<p id="calc-status" role="status"></p>
<section id="calc-result" aria-labelledby="calc-result-heading" hidden><h3 id="calc-result-heading">${copy.retained}</h3><p class="calculator-note">${copy.sameBits}</p><div id="calc-result-readings" class="calculator-readings"></div><p id="calc-full-result"></p><p id="calc-alternate-full-result"></p><p id="calc-retained-note" class="calculator-note"></p><div id="calc-w-bridge" class="calculator-note" hidden><p>${copy.wBridge}</p><p id="calc-w-result"></p></div><button id="calc-use-result" type="button">Use result as A</button></section>
<details id="calc-bits"><summary>${copy.bits.summary}</summary><div class="calculator-bit-tools"><button id="calc-high" type="button">${copy.bits.high}</button><button id="calc-low" type="button">${copy.bits.low}</button><label id="calc-carry-control"><input id="calc-carries" type="checkbox" disabled aria-describedby="calc-carry-pending"> ${copy.bits.showCarries}</label></div><p id="calc-bit-help">${copy.bits.help}</p><p id="calc-carry-pending" class="calculator-note">${copy.bits.calculateForCarries}</p><div id="calc-bit-scroll" tabindex="0" role="region" aria-label="${copy.bits.region}"><div id="calc-bit-rows"></div></div><div id="calc-carry-help" hidden></div></details>
<details class="calculator-help"><summary>${copy.help.summary}</summary>${copy.help.paragraphs.map((text) => `<p>${text}</p>`).join("")}</details>
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
let bitScrollLeft = 0,
  bitGridWidth = null,
  bitAtLow = false,
  bitNeedsLow = true;
function saveBitPosition() {
  const scroller = $("calc-bit-scroll");
  // Hidden disclosures and closed dialogs must not overwrite the last view.
  if (!scroller.clientWidth) return;
  bitScrollLeft = scroller.scrollLeft;
  bitGridWidth = scroller.scrollWidth;
  bitAtLow =
    scroller.scrollWidth > scroller.clientWidth &&
    Math.abs(
      scroller.scrollWidth - scroller.clientWidth - scroller.scrollLeft,
    ) < 2;
}
function restoreBitPosition() {
  const scroller = $("calc-bit-scroll");
  if (!dialog.open || !$("calc-bits").open) return;
  // Out adds a column at the high end; keep the same retained bits in view.
  scroller.scrollLeft =
    bitNeedsLow || bitAtLow
      ? scroller.scrollWidth
      : bitScrollLeft === 0
        ? 0
        : bitScrollLeft +
          (bitGridWidth === null ? 0 : scroller.scrollWidth - bitGridWidth);
  bitNeedsLow = false;
  saveBitPosition();
}
$("calc-bit-scroll").addEventListener("scroll", saveBitPosition);
$("calc-bits").addEventListener("toggle", () => {
  if ($("calc-bits").open) restoreBitPosition();
});
const encoded = (value, width = work.width) =>
  "0x" +
  BigInt(value)
    .toString(16)
    .padStart(width / 4, "0")
    .toUpperCase()
    .replace(/(.{4})(?=.)/g, "$1 ");
function readings(target, value, both = false) {
  target.replaceChildren();
  for (const [label, text] of [
    [
      `Decimal (${work.reading})`,
      value === null
        ? "—"
        : read(BigInt(value), work.width, work.reading).toLocaleString("en-GB"),
    ],
    ...(both
      ? [
          [
            `Decimal (${work.reading === "signed" ? "unsigned" : "signed"})`,
            read(
              BigInt(value),
              work.width,
              work.reading === "signed" ? "unsigned" : "signed",
            ).toLocaleString("en-GB"),
          ],
        ]
      : []),
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
  saveBitPosition();
  const rows = $("calc-bit-rows");
  rows.replaceChildren();
  const a = parsed("a"),
    b = parsed("b");
  const addCarries =
    result && work.operation === "add" && $("calc-carries").checked
      ? carries(result.a, result.b, work.width)
      : null;
  const row = (
    label,
    value,
    editable = false,
    indices = false,
    carryRow = false,
  ) => {
    const line = document.createElement("div");
    line.className = "calculator-bit-row";
    const heading = document.createElement("span");
    heading.className = "calculator-bit-label";
    heading.textContent = label;
    line.append(heading);
    if (addCarries) {
      const out = document.createElement("span");
      out.className =
        "calculator-bit calculator-carry-out" +
        (indices ? " bit-index" : "") +
        (!indices && !carryRow ? " carry-out-spacer" : "");
      out.dataset.carryOut = "";
      out.textContent = indices
        ? copy.bits.carryOut
        : carryRow
          ? String(addCarries.out)
          : "";
      if (indices || carryRow) {
        out.setAttribute(
          "aria-label",
          (indices
            ? copy.bits.carryOutLabel
            : copy.bits.carryOutValue.replace("{value}", String(addCarries.out))
          ).replace("{top}", String(work.width - 1)),
        );
        out.title = out.getAttribute("aria-label");
      } else out.setAttribute("aria-hidden", "true");
      line.append(out);
    }
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
      cell.dataset.position = String(bit);
      if (bit !== work.width - 1 && bit % 4 === 3)
        cell.classList.add("nibble-start");
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
  if (addCarries)
    row(copy.bits.carryIn, addCarries.carries, false, false, true);
  row("A", a.ok ? a.pattern : null, true);
  if (work.operation !== "shift-left")
    row(work.operation === "add" ? "+ B" : "− B", b.ok ? b.pattern : null);
  if (result) row("Result", result.pattern);
  $("calc-carry-control").hidden = work.operation !== "add";
  $("calc-carries").disabled = !(result && work.operation === "add");
  $("calc-carry-pending").hidden = Boolean(result) || work.operation !== "add";
  if ($("calc-carry-pending").hidden)
    $("calc-carries").removeAttribute("aria-describedby");
  else $("calc-carries").setAttribute("aria-describedby", "calc-carry-pending");
  $("calc-carry-help").hidden = !addCarries;
  if (addCarries)
    $("calc-carry-help").textContent =
      copy.bits.carrySummary
        .replace("{top}", String(work.width - 1))
        .replace("{intoSign}", String(addCarries.intoSign))
        .replace("{out}", String(addCarries.out))
        .replace("{overflow}", addCarries.v ? "Yes" : "No") +
      " " +
      copy.bits.carryMechanism +
      " " +
      copy.bits.overflowMechanism;
  restoreBitPosition();
}
function render() {
  $("calc-width").value = String(work.width);
  $("calc-reading").value = work.reading;
  $("calc-operation").value = work.operation;
  $("calc-context").textContent = `${work.width} bits · ${work.reading}`;
  $("calc-width-note").textContent =
    `${work.width === 32 ? copy.width32 : copy.width64} ${copy.widthIndependence}`;
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
    readings($("calc-result-readings"), result.pattern, true);
    $("calc-full-result").textContent =
      `${copy.full} (${work.operation === "shift-left" ? "unsigned shift" : work.reading}): ${BigInt(result.full).toLocaleString("en-GB")}`;
    const otherReading = work.reading === "signed" ? "unsigned" : "signed";
    const other = compute(
      result.a,
      work.operation,
      result.b,
      work.width,
      otherReading,
    );
    $("calc-alternate-full-result").hidden = other.full === result.full;
    $("calc-alternate-full-result").textContent =
      `${copy.full} (${otherReading}): ${BigInt(other.full).toLocaleString("en-GB")}`;
    $("calc-retained-note").textContent =
      `The retained result keeps the low ${work.width} bits. ${work.operation === "shift-left" ? "The full shift result uses the unsigned A bit pattern." : "The full mathematical result uses your selected decimal reading."}`;
    $("calc-w-bridge").hidden = work.width !== 32;
    if (work.width === 32) {
      const signed = read(BigInt(result.pattern), 32, "signed"),
        extended = BigInt.asUintN(64, signed);
      $("calc-w-result").textContent =
        `${copy.wResult}: ${encoded(extended, 64)}. ${copy.wReading}: ${signed.toLocaleString("en-GB")}. ${copy.wPatternNote}`;
    }
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
  if (width !== oldWidth) bitNeedsLow = true;
  const previousResult = result;
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
  if (width === oldWidth && previousResult) {
    result = {
      ...compute(
        previousResult.a,
        work.operation,
        previousResult.b,
        width,
        reading,
      ),
      a: previousResult.a,
      b: previousResult.b,
    };
    $("calc-status").textContent = copy.readingChanged;
    render();
    return;
  }
  invalidate(
    width === oldWidth
      ? copy.inputReadingChanged
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
  bitNeedsLow = false;
  saveBitPosition();
});
$("calc-low").addEventListener("click", () => {
  $("calc-bit-scroll").scrollLeft = $("calc-bit-scroll").scrollWidth;
  bitNeedsLow = false;
  saveBitPosition();
});
$("calc-reset").addEventListener("click", () => {
  work = defaults();
  for (const key of ["a", "b"]) $(`calc-${key}`).value = work[key];
  $("calc-carries").checked = false;
  bitNeedsLow = true;
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
  restoreBitPosition();
  opener.setAttribute("aria-expanded", "true");
});
$("close-calculator").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  document.documentElement.style.overflow = previousOverflow;
  document.documentElement.style.paddingRight = previousPadding;
  opener.setAttribute("aria-expanded", "false");
});
render();
