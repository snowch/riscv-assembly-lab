// Copyright © 2026 Christopher Snow
import reference from "./reference-data.js";
import { escape } from "./html.js";

const { copy, notation, entries, used } = reference;
const opener = document.getElementById("open-reference");
const inline = (text) => escape(text).replace(/`([^`]+)`/g, "<code>$1</code>");
const paragraphs = (texts) =>
  texts.map((text) => `<p>${inline(text)}</p>`).join("");
const dialog = document.createElement("dialog");
dialog.id = "instruction-reference";
dialog.setAttribute("aria-labelledby", "reference-heading");
dialog.innerHTML = `<div class="reference-toolbar"><div class="reference-heading"><h2 id="reference-heading">${escape(copy.title)}</h2><button type="button" id="reference-close">${escape(copy.close)}</button></div><label class="reference-search">${escape(copy.searchLabel)}<input id="reference-search" type="search" spellcheck="false" autocomplete="off" placeholder="${escape(copy.searchPlaceholder)}"></label><div class="reference-filters"><label id="reference-scope-label">${escape(copy.scopeLabel)} <select id="reference-scope"><option value="all">${escape(copy.allScope)}</option><option value="lesson">${escape(copy.lessonScope)}</option></select></label><label>${escape(copy.readingLabel)} <select id="reference-reading"><option value="signed">${escape(copy.signed)}</option><option value="unsigned">${escape(copy.unsigned)}</option><option value="hex">${escape(copy.hex)}</option></select></label></div></div><p class="reference-note">${inline(copy.intro)}</p><p class="reference-note">${inline(copy.scopeNote)}</p><details class="reference-notation"><summary>${escape(notation.title)}</summary><div>${notationMarkup()}</div></details><p id="reference-count" role="status"></p><div id="reference-entries"></div><p id="reference-empty" hidden>${escape(copy.empty)}</p><details class="reference-official"><summary>${escape(copy.official)}</summary><ul><li><a href="https://docs.riscv.org/reference/isa/unpriv/unpriv-index.html">${escape(copy.integerSource)}</a></li><li><a href="https://riscv-non-isa.github.io/riscv-elf-psabi-doc/">${escape(copy.abiSource)}</a></li><li><a href="https://sourceware.org/binutils/docs/as/RISC_002dV_002dDependent.html">${escape(copy.assemblerSource)}</a></li></ul></details>`;
document.body.append(dialog);
const $ = (id) => dialog.querySelector(`#${id}`);
let recordings;
let loading;
let recordingError = false;
let mode = "signed";

function notationMarkup() {
  return `<p>${inline(notation.intro)}</p><pre><code>${escape(notation.header)}</code></pre><dl class="reference-notation-lines">${notation.lines.map((line) => `<div><dt><code>${escape(line.source)}</code></dt><dd>${inline(line.explanation)}</dd></div>`).join("")}</dl><p>${inline(notation.note)}</p><p>${inline(notation.preparedNote)}</p><p>${inline(notation.pseudoNote)}</p><p>${inline(copy.syntaxNote)}</p><dl class="reference-notation-lines">${notation.placeholders.map((line) => `<div><dt><code>${escape(line.source)}</code></dt><dd>${inline(line.explanation)}</dd></div>`).join("")}</dl>`;
}

function lessonId() {
  const node = document.getElementById("lesson-data");
  if (!node) return null;
  try {
    return JSON.parse(node.textContent).id;
  } catch {
    return null;
  }
}

function programMarkup(record, example) {
  return `<details class="reference-complete"><summary>${escape(copy.completeExample)}</summary><p>${inline(copy.completeExampleNote)}</p><div class="reference-header-help"><h4>${escape(notation.title)}</h4>${notationMarkup()}</div><pre tabindex="0"><code>${record.source
    .split("\n")
    .map((line) =>
      line.trim() === example.instruction.trim()
        ? `<mark>${escape(line)}</mark>`
        : escape(line),
    )
    .join("\n")}</code></pre></details>`;
}

function controlMarkup(record, example) {
  return /^(b\w*|j|call|ret)\b/.test(example.instruction) &&
    record.nextInstruction
    ? `<div class="reference-next">${record.nextSupplied ? `<p>${escape(copy.captureNext)}</p>` : ""}<dl>${!record.nextSupplied ? `<div><dt>${escape(copy.nextInstruction)}</dt><dd><code>${escape(record.nextInstruction)}</code></dd></div>` : ""}${record.nextLabel ? `<div><dt>${escape(copy.nextLabel)}</dt><dd><code>${escape(record.nextLabel)}</code></dd></div>` : ""}</dl></div>`
    : "";
}

function memoryMarkup(record, example) {
  if (!record.memory) return "";
  const length = Math.min(8, Math.max(1, example.data?.length ?? 8));
  const rows = Array.from(
    { length },
    (_, offset) =>
      `<tr><th scope="row">+${offset}</th><td>${record.memory.before[offset].toString(16).padStart(2, "0").toUpperCase()}</td><td>${record.memory.after[offset].toString(16).padStart(2, "0").toUpperCase()}</td></tr>`,
  ).join("");
  return `<h4>${escape(copy.memoryHeading)}</h4><p class="reference-note">${inline(copy.memoryByteNote)}</p><div class="reference-state-scroll" tabindex="0" role="region" aria-label="${escape(copy.memoryHeading)}"><table><thead><tr><th scope="col">${escape(copy.byteOffset)}</th><th scope="col">${escape(copy.before)}</th><th scope="col">${escape(copy.after)}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function exampleMarkup(example) {
  const record = recordings?.examples[example.id];
  if (!record)
    return `<p class="reference-recording-status">${escape(recordings ? copy.unavailable : copy.loading)}</p>`;
  const rows = record.before
    .map((row, index) => {
      const after = record.after[index];
      return `<tr><th scope="row"><code>${escape(row.register)}</code></th><td data-reading-signed="${escape(row.signed)}" data-reading-unsigned="${escape(row.unsigned)}" data-reading-hex="${escape(row.hex)}">${escape(row[mode])}</td><td data-reading-signed="${escape(after.signed)}" data-reading-unsigned="${escape(after.unsigned)}" data-reading-hex="${escape(after.hex)}">${escape(after[mode])}</td></tr>`;
    })
    .join("");
  return `<figure class="reference-example" data-example="${escape(example.id)}"><h4>${escape(copy.examples)}</h4><p class="reference-note">${inline(copy.preparedNote)}</p>${example.setup ? `<pre class="reference-setup"><code>${escape(example.setup)}</code></pre>` : ""}<div class="reference-focus"><span>${escape(copy.instruction)}</span><pre><code>${escape(example.instruction)}</code></pre></div><div class="reference-state-scroll" tabindex="0" role="region" aria-label="${escape(copy.examples)}"><table><thead><tr><th scope="col">${escape(copy.register)}</th><th scope="col">${escape(copy.before)}</th><th scope="col">${escape(copy.after)}</th></tr></thead><tbody>${rows}</tbody></table></div>${controlMarkup(record, example)}${memoryMarkup(record, example)}${record.output ? `<h4>${escape(copy.outputLabel)}</h4><pre class="reference-output"><code>${escape(record.output)}</code></pre>` : ""}<figcaption>${inline(example.explanation)}</figcaption><p class="reference-note">${inline(copy.recordingNote)}</p>${record.machineInstructions?.length ? `<details><summary>${escape(copy.expansion)}</summary><p>${inline(copy.expansionNote)}</p><pre><code>${record.machineInstructions.map((line) => escape(typeof line === "string" ? line : line.text)).join("\n")}</code></pre></details>` : ""}${programMarkup(record, example)}</figure>`;
}

function syntaxKey(entry) {
  const forms = entry.syntax.join(" ");
  const keys = [];
  if (/\b(?:rd|rs|rs1|rs2)\b/.test(forms)) keys.push(copy.registerKey);
  if (/\bimm(?:\d+)?\b/.test(forms)) keys.push(copy.immediateKey);
  if (/\boffset\(base\)/.test(forms)) keys.push(copy.memoryKey);
  if (/\blabel\b/.test(forms)) keys.push(copy.labelKey);
  return paragraphs(keys);
}

function entryMarkup(entry, initiallyOpen) {
  return `<details class="reference-entry" data-instruction="${escape(entry.id)}" ${initiallyOpen ? "open" : ""}><summary><code>${escape(entry.id)}</code><span class="reference-entry-title">${escape(entry.title)}</span><span class="reference-kind">${escape(entry.kind === "pseudo" ? copy.pseudoLabel : copy.instructionLabel)}</span></summary><div class="reference-entry-body"><p>${inline(entry.summary)}</p>${entry.syntax.map((source) => `<pre><code>${escape(source)}</code></pre>`).join("")}<div class="reference-syntax-key">${syntaxKey(entry)}</div><h3>${escape(copy.operandRules)}</h3><ul>${entry.rules.map((rule) => `<li>${inline(rule)}</li>`).join("")}</ul><div class="reference-example-host" data-entry="${escape(entry.id)}"></div>${entry.mistakes?.length ? `<details><summary>${escape(copy.commonMistakes)}</summary>${entry.mistakes.map((mistake) => `<p class="reference-rejected">${escape(copy.rejected)}</p><pre><code>${escape(mistake.source)}</code></pre><p>${inline(mistake.explanation)}</p>`).join("")}</details>` : ""}</div></details>`;
}

function fillExamples(host) {
  if (recordingError) {
    host.innerHTML = `<p role="status">${escape(copy.loadError)}</p><button type="button" class="reference-retry">${escape(copy.retry)}</button>`;
    return;
  }
  const entry = entries.find((item) => item.id === host.dataset.entry);
  const [first, ...more] = entry.examples;
  host.innerHTML =
    (first ? exampleMarkup(first) : "") +
    (more.length
      ? `<details><summary>${escape(copy.moreExamples)}</summary>${more.map(exampleMarkup).join("")}</details>`
      : "");
}

function render() {
  const query = $("reference-search").value.trim().toLowerCase();
  const current = used[lessonId()] ?? [];
  const selected = entries.filter(
    (entry) =>
      ($("reference-scope").value !== "lesson" || current.includes(entry.id)) &&
      (!query ||
        [entry.id, entry.title, entry.summary, ...entry.syntax, ...entry.rules]
          .join(" ")
          .toLowerCase()
          .includes(query)),
  );
  $("reference-count").textContent = copy.count.replace(
    "{count}",
    selected.length,
  );
  const notationMatch =
    /^(?:\.?(?:text|global|globl)(?:\s|$)|reference_example:?$|directives?$|headers?$|labels?$)/.test(
      query,
    );
  dialog.querySelector(".reference-notation").open = notationMatch;
  $("reference-empty").hidden = selected.length > 0 || notationMatch;
  if (notationMatch)
    $("reference-count").textContent = copy.opcodeNotationMatch;
  $("reference-entries").innerHTML = selected
    .map((entry) =>
      entryMarkup(
        entry,
        selected.length === 1 || (query && entry.id === query),
      ),
    )
    .join("");
  for (const host of dialog.querySelectorAll(
    ".reference-entry[open] .reference-example-host",
  ))
    fillExamples(host);
}

async function loadRecordings() {
  if (recordings) return;
  if (!loading)
    loading = fetch(new URL("reference-recordings.json", import.meta.url))
      .then((response) => {
        if (!response.ok) throw new Error("Reference recordings unavailable");
        return response.json();
      })
      .then((data) => {
        recordings = data;
      })
      .catch((error) => {
        loading = null;
        throw error;
      });
  try {
    recordingError = false;
    await loading;
    for (const host of dialog.querySelectorAll(
      ".reference-entry[open] .reference-example-host",
    ))
      fillExamples(host);
  } catch {
    recordingError = true;
    for (const host of dialog.querySelectorAll(
      ".reference-entry[open] .reference-example-host",
    ))
      fillExamples(host);
  }
}

let previousOverflow = "",
  previousPadding = "";
opener.disabled = false;
opener.addEventListener("click", () => {
  if (dialog.open) return;
  const current = lessonId();
  $("reference-scope-label").hidden = !current;
  if (!dialog.dataset.opened && used[current]?.length)
    $("reference-scope").value = "lesson";
  dialog.dataset.opened = "true";
  if (!current) $("reference-scope").value = "all";
  previousOverflow = document.documentElement.style.overflow;
  previousPadding = document.documentElement.style.paddingRight;
  const scrollbar = innerWidth - document.documentElement.clientWidth;
  if (scrollbar > 0)
    document.documentElement.style.paddingRight = `${parseFloat(getComputedStyle(document.documentElement).paddingRight) + scrollbar}px`;
  document.documentElement.style.overflow = "hidden";
  render();
  dialog.showModal();
  opener.setAttribute("aria-expanded", "true");
  $("reference-search").focus({ preventScroll: true });
  void loadRecordings();
});
$("reference-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  document.documentElement.style.overflow = previousOverflow;
  document.documentElement.style.paddingRight = previousPadding;
  opener.setAttribute("aria-expanded", "false");
  opener.focus({ preventScroll: true });
});
dialog.addEventListener("keydown", (event) => {
  event.stopPropagation();
  if (event.key === "Escape") {
    event.preventDefault();
    dialog.close();
  }
});
dialog.addEventListener(
  "toggle",
  (event) => {
    if (event.target.matches(".reference-entry[open]")) {
      const host = event.target.querySelector(".reference-example-host");
      if (
        !host.childElementCount ||
        host.querySelector(".reference-recording-status")
      )
        fillExamples(host);
    }
  },
  true,
);
dialog.addEventListener("click", (event) => {
  if (event.target.closest(".reference-retry")) void loadRecordings();
});
$("reference-search").addEventListener("input", render);
$("reference-scope").addEventListener("change", render);
$("reference-reading").addEventListener("change", () => {
  mode = $("reference-reading").value;
  for (const cell of dialog.querySelectorAll("[data-reading-signed]"))
    cell.textContent = cell.getAttribute(`data-reading-${mode}`);
});
