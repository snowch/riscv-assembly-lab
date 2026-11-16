// Copyright © 2026 Christopher Snow
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { loadLessons, MODULES, REFERENCES } from "./course-data.js";
import { debuggerMarkup } from "../site/course/debugger.js";
import { REGISTERS, registerIndex } from "../site/course/model.js";
const root = new URL("../site/", import.meta.url),
  lessons = await loadLessons();
export const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
const inline = (value) =>
  escape(value).replace(/`([^`]+)`/g, "<code>$1</code>");
const paragraphs = (values) =>
  (values ?? []).map((value) => `<p>${inline(value)}</p>`).join("\n");
const theme =
  '<label class="theme-label">Theme <select id="theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>';
function header(prefix) {
  return `<a class="skip" href="#main">Skip to content</a><header><a class="brand" href="${prefix}"><span class="logo" aria-hidden="true">≋</span> RISC-V Assembly Lab</a><nav aria-label="Site"><a href="${prefix}">Course</a><button id="open-calculator" type="button" aria-haspopup="dialog" aria-controls="calculator-dialog" aria-expanded="false" disabled>${icon("calculator")}Calculator</button><a href="https://github.com/snowch/riscv-assembly-lab" aria-label="Star on GitHub">☆ <span>Star<span class="github-long"> on GitHub</span></span></a>${theme}</nav></header>`;
}
function footer(prefix) {
  return `<footer><p>Copyright © 2026 Christopher Snow</p><div><a href="${prefix}NOTICE.md">Sources and licences</a><a href="https://snowch.github.io/assembly-lab/">Arm Assembly Lab</a><a href="https://github.com/snowch/riscv-assembly-lab/issues">Report a problem</a></div></footer>`;
}
function document(
  title,
  body,
  {
    prefix = "../../",
    script = "../../course/lesson.js",
    data = "",
    styles = [],
  } = {},
) {
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#087e72"><meta name="description" content="Learn RISC-V by writing and running real assembly and C in your browser."><title>${escape(title)} · RISC-V Assembly Lab</title><link rel="icon" href="${prefix}icon.svg" type="image/svg+xml"><link rel="stylesheet" href="${prefix}style.css"><link rel="stylesheet" href="${prefix}course/course.css"><link rel="stylesheet" href="${prefix}course/debugger.css"><link rel="stylesheet" href="${prefix}course/workbench.css">${styles.map((path) => `<link rel="stylesheet" href="${escape(path)}">`).join("")}<link rel="stylesheet" href="${prefix}course/calculator.css"><script type="module" src="${prefix}course/calculator.js"></script><script type="module" src="${script}"></script></head><body class="course-page">${header(prefix)}${body}${footer(prefix)}${data}</body></html>\n`
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");
}
function navigation(current) {
  const module = MODULES.find((m) => m.id === current.module);
  return `<nav class="lesson-breadcrumbs" aria-label="Breadcrumb"><ol><li><details id="course-navigation"><summary>Course</summary><nav class="course-menu" aria-label="Course lessons"><a class="course-overview" href="../../">Course overview</a>${MODULES.map(
    (module) =>
      `<details ${current.module === module.id ? "open" : ""}><summary>${module.label} · ${escape(module.title)}</summary><ol>${lessons
        .filter((l) => l.module === module.id)
        .map(
          (l) =>
            `<li><a href="../${l.id}/" ${l.id === current.id ? 'aria-current="page"' : ""}>${escape(l.title)}</a><span data-completion="${l.id}" aria-label="Completed" hidden>✓</span></li>`,
        )
        .join("")}</ol></details>`,
  ).join(
    "",
  )}</nav></details></li><li><a href="../../#${module.id}">${escape(module.title)}</a></li><li><span aria-current="page">${escape(current.title)}</span></li></ol></nav>`;
}
const icons = {
  code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-12-2 14"/>',
  book: '<path d="M12 5v15M3 4c4-1 6 0 9 1 3-1 5-2 9-1v15c-4-1-6 0-9 1-3-1-5-2-9-1Z"/>',
  layout:
    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M10 9v12"/>',
  guide: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
  calculator:
    '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 10h1m3 0h1m3 0h1M8 14h1m3 0h1m3 0h1M8 18h1m3 0h1m3 0h1"/>',
};
const icon = (name) =>
  `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const resourceSummary = (label, name, description = "") =>
  `<summary>${icon(name)}<span class="resource-label">${label}${description ? `<span class="resource-description">${description}</span>` : ""}</span><span class="resource-chevron" aria-hidden="true"></span></summary>`;
function operandDiagram(lesson) {
  if (lesson.id !== "addition") return "";
  const instruction = lesson.starter
    .split("\n")
    .find((line) => /^add\s/.test(line));
  const [, destination, left, right] = instruction.match(
    /^add\s+(\w+),\s*(\w+),\s*(\w+)/,
  );
  return `<figure class="operand-diagram"><figcaption>Reading <code>${escape(instruction)}</code></figcaption><div class="operand-flow" role="img" aria-label="add reads ${left} and ${right}, then writes their sum to ${destination}."><div class="operand-box"><code>${left}</code><span>Input</span></div><span class="operand-symbol" aria-hidden="true">+</span><div class="operand-box"><code>${right}</code><span>Input</span></div><span class="operand-symbol" aria-hidden="true">→</span><div class="operand-box operand-destination"><code>${destination}</code><span>Destination</span></div></div><p>The last two operands are read. The first operand is written.</p></figure>`;
}
function validate() {
  const ids = new Set();
  for (const lesson of lessons) {
    if (ids.has(lesson.id) || !/^[a-z][a-z0-9-]+$/.test(lesson.id))
      throw new Error("Duplicate/invalid lesson id " + lesson.id);
    ids.add(lesson.id);
    for (const field of [
      "title",
      "summary",
      "starter",
      "result",
      "originalityNote",
    ])
      if (typeof lesson[field] !== "string" || !lesson[field].trim())
        throw new Error(lesson.id + ": missing " + field);
    for (const field of [
      "objectives",
      "before",
      "explanation",
      "observe",
      "sourceLessons",
      "references",
    ])
      if (!Array.isArray(lesson[field]) || !lesson[field].length)
        throw new Error(lesson.id + ": missing " + field);
    for (const name of [
      ...lesson.observe,
      lesson.result,
      lesson.prediction?.register,
    ])
      if (registerIndex(name) < 0)
        throw new Error(lesson.id + ": unknown register " + name);
    for (const ref of lesson.references)
      if (!REFERENCES[ref])
        throw new Error(lesson.id + ": unknown reference " + ref);
    if (
      !lesson.challenge?.cases?.length ||
      lesson.challenge.cases.length < 3 ||
      !lesson.challenge.reference ||
      !lesson.challenge.starter ||
      lesson.challenge.hints.length < 3
    )
      throw new Error(lesson.id + ": incomplete challenge");
    for (const fixture of lesson.challenge.cases) {
      if (!fixture.name || !Object.keys(fixture.expect ?? {}).length)
        throw new Error(lesson.id + ": incomplete test case");
      for (const [name, value] of Object.entries({
        ...fixture.inputs,
        ...fixture.expect,
      })) {
        if (registerIndex(name) < 0)
          throw new Error("Unknown register " + name);
        BigInt(value);
      }
    }
  }
  for (const module of MODULES)
    if (!lessons.some((l) => l.module === module.id))
      throw new Error("Empty module " + module.id);
}
validate();
for (let index = 0; index < lessons.length; index++) {
  const lesson = lessons[index];
  lesson.ui = {
    stack: index >= lessons.findIndex((l) => l.id === "calls-and-returns"),
    signed: index >= lessons.findIndex((l) => l.id === "signed-readings"),
    hex: index >= lessons.findIndex((l) => l.id === "hexadecimal"),
  };
  const previous = lessons[index - 1],
    next = lessons[index + 1];
  const memory = lesson.memory
    ? `<section class="memory-section" aria-labelledby="memory-heading"><div class="section-heading"><h3 id="memory-heading">${lesson.memory === "stack" ? "Stack bytes" : "Memory bytes"}</h3>${lesson.memory === "data" ? '<div role="group" aria-label="Memory moment"><button id="memory-before" aria-pressed="true">Before</button><button id="memory-after" aria-pressed="false">After</button></div>' : ""}</div><p id="memory-note" class="panel-note">${lesson.memory === "stack" ? "Run or step to inspect 64 mapped bytes from the current stack pointer." : "Supplied bytes before your code. The labels give byte offsets from lesson_data."}</p><div id="memory-grid" class="memory-grid"></div><p id="byte-inspection" class="panel-note">Choose a byte to inspect its address and readings.</p></section>`
    : "";
  const body = `<div class="course-layout"><main id="main">${navigation(lesson)}<div class="intro"><h1>${escape(lesson.title)}</h1><p>${inline(lesson.summary)}</p>${lesson.id === "addition" ? '<p class="optional-guide">Optional guide: <a href="../../using-the-workbench/">Using the workbench</a></p>' : ""}</div>
 <section class="lesson-guide" aria-label="Before you run">${paragraphs(lesson.before.slice(0, 2))}${operandDiagram(lesson)}${paragraphs(lesson.before.slice(2))}</section>
 <section id="prediction-block" class="prediction-block" aria-labelledby="prediction-heading"><h2 id="prediction-heading">Predict, then check</h2><p>${inline(lesson.prediction.prompt)}</p><div class="prediction-entry"><label for="prediction">Your prediction <span>(${escape(lesson.ui.signed || lesson.prediction.reading === "hex" ? (lesson.prediction.reading ?? "signed") : "decimal")} reading)</span></label><input id="prediction" inputmode="text" autocomplete="off" placeholder="Optional: predict before running"><button id="prediction-hint-button" type="button">Hint</button></div><p id="prediction-hint" hidden>${inline(lesson.prediction.hint)}</p><p id="prediction-feedback" role="status">Run the code to check against the CPU’s result.</p></section>
 <noscript><p>Building and stepping require JavaScript and WebAssembly. <a href="./${lesson.language === "c" ? "lesson.c" : "lesson.s"}">Read the starting code</a>.</p></noscript>
 <section id="workbench" class="workbench" aria-label="Code workbench">
 <div class="workbench-bar"><div class="workbench-context"><span id="editor-context" class="tag" tabindex="-1" aria-live="polite">Example</span><button id="return-example" class="text-button" hidden>Return to example</button></div><div class="workspace-tools"><button id="expand-editor" class="text-button" aria-expanded="false" aria-controls="source-editor">Expand editor</button><button id="fullscreen-workspace" class="text-button" aria-expanded="false" aria-controls="workbench">Full screen</button></div></div>
 <div class="build-toolbar lesson-toolbar"><div class="run-actions"><button id="run" class="primary" disabled>Build &amp; Run</button><button id="debug" disabled>Start debugging</button><button id="step" disabled>Start stepping</button><button id="continue" disabled hidden>Continue</button><button id="stop" disabled>Stop</button></div><p id="run-status" role="status">Loading lesson…</p><p id="sticky-operation" hidden></p><p id="step-location"></p></div>
 <p id="snapshot-note" class="notice" hidden>These observations belong to the source captured at the start of this run. Build again to use your edits.</p>
 <div id="starting-state" class="starting-state"></div>
 <div class="workspace"><section class="panel editor-panel" aria-labelledby="source-heading"><div class="panel-heading"><h2 id="source-heading">${lesson.language === "c" ? "lesson.c" : "lesson.s"}</h2><span class="tag">${lesson.language === "c" ? "TinyCC · RV64" : "RV64GC · xv6"}</span></div>
 <p id="source-help" class="panel-note">${lesson.language === "c" ? "Edit the function" : "Edit the code"}, then choose Build &amp; Run.</p>
 <div id="source-editor" class="editor ${lesson.language === "c" ? "" : "breakpoint-editor"}"><textarea id="source" aria-label="${lesson.language === "c" ? "C source" : "Lesson assembly source"}" aria-describedby="source-help save-state" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" disabled>${escape(lesson.starter)}</textarea></div>
 <div class="editor-footer"><span id="save-state">Draft saves in this browser</span><div><button id="restore" class="text-button">Restore starter</button><button id="download" class="text-button">Download code</button></div></div>
 <details class="lab-help"><summary>How this lab works</summary><div>${lesson.language === "c" ? "<p>The supplied caller passes the starting arguments to your function and reports its result." : "<p>The lab supplies entry, reporting and exit code."} Open <a href="#complete-program">View complete program</a> to inspect the full source.</p><p>Start stepping pauses before the first machine instruction. Step instruction executes one machine instruction. A source line can expand into several machine instructions.</p><p>Tab indents. Press Escape, then Tab to leave the editor. Ctrl / ⌘ + F opens Find. Ctrl / ⌘ + Z undoes an edit. Ctrl / ⌘ + Enter builds and runs.</p><p>Resize using the lower-right corner, or choose Expand editor.</p><p><a href="../../using-the-workbench/" target="_blank" rel="noopener" aria-label="Using the workbench (opens in a new tab)">Using the workbench ↗</a> <span class="subtle">(new tab)</span></p></div></details>
 </section>
 <section class="panel run-panel" aria-labelledby="inspection-heading"><div class="panel-heading"><h2 id="inspection-heading">Inspect</h2><span id="state-badge" class="tag">Ready</span></div>
 <div class="inspection-tabs" role="tablist" aria-label="Inspect">${[["registers", "Registers"], ...(lesson.memory ? [["memory", "Memory"]] : []), ["output", "Output"], ["diagnostics", "Diagnostics"], ["debugger", "Debugger"]].map(([id, title]) => `<button id="tab-${id}" role="tab" aria-selected="${id === "registers"}" aria-controls="inspect-${id}" tabindex="${id === "registers" ? "0" : "-1"}">${title}</button>`).join("")}</div>
 <section id="inspect-registers" class="inspection-view" role="tabpanel" aria-labelledby="tab-registers" tabindex="0"><div class="reading-select" ${lesson.ui.signed ? "" : "hidden"}><label>Decimal reading <select id="reading"><option value="signed">Signed</option><option value="unsigned">Unsigned</option></select></label></div><div id="registers" class="registers"></div><p id="register-note" class="panel-note">Run your code to capture the actual register values.</p></section>
 ${lesson.memory ? `<section id="inspect-memory" class="inspection-view" role="tabpanel" aria-labelledby="tab-memory" tabindex="0" hidden>${memory}</section>` : ""}
 <section id="inspect-output" class="inspection-view" role="tabpanel" aria-labelledby="tab-output" tabindex="0" hidden><details id="program-output" open><summary>Program output <span>Your code’s console text</span></summary><pre id="console" tabindex="0" aria-label="Program output">Not run yet.</pre></details><details id="serial-log"><summary>xv6 serial log <span>Boot, program and shell</span></summary><pre id="serial" tabindex="0">Not started yet.</pre></details></section>
 <section id="inspect-diagnostics" class="inspection-view" role="tabpanel" aria-labelledby="tab-diagnostics" tabindex="0" hidden><details id="diagnostics" open><summary>Build messages <span id="diagnostics-summary">Not built yet</span></summary><div id="diagnostic-lines"></div></details></section>
 <section id="inspect-debugger" class="inspection-view" role="tabpanel" aria-labelledby="tab-debugger" tabindex="0" hidden>${debuggerMarkup(lesson)}<section id="step-observations" class="step-observations" hidden><h3>Instruction path</h3><p>The program counter (PC) holds the address of the next machine instruction. Arrows record addresses observed during execution.</p><p id="current-instruction"></p><ol id="trace-list"></ol></section></section>
 </section></div></section>
 <details class="explanation" id="bit-view" ${lesson.ui.signed ? "" : "hidden"}><summary>Inspect the register bits</summary><div class="bit-controls"><label>Register <select id="bit-register"></select></label><button id="bits-high">High bits</button><button id="bits-low">Low bits</button></div><p id="bit-reading"></p><div id="bits-scroller" tabindex="0" aria-label="Register bits, highest on the left"><div id="bits"></div></div>${lesson.id === "floating-point-bits" ? '<p id="floating-reading"></p><p>Binary32 interpretation of the observed low 32 bits, not execution of a floating-point instruction.</p>' : ""}</details>
 <section class="lesson-explanation" aria-labelledby="explanation-heading"><h2 id="explanation-heading">What the instructions do</h2>${paragraphs(lesson.explanation)}</section>
 <section id="experiment" class="next-step"><div><h2>Change it and run again</h2><p>${inline(lesson.experiment.task)}</p><details><summary>A hint</summary><p>${inline(lesson.experiment.hint)}</p></details></div></section>
 <details id="challenge" class="challenge-section"><summary>Optional exercise <span>Check your code on fresh inputs</span></summary><div class="exercise-body"><p>${inline(lesson.challenge.task)}</p><p>Load your saved exercise draft, or its starter code. Your example draft stays available through Return to example.</p><button id="start-challenge">Load exercise</button><div id="challenge-controls" hidden><p>Build &amp; Run uses the selected case. Check all cases runs your code against every case, each on a fresh machine.</p><div id="case-picker"></div><button id="check-cases" class="primary">Check all cases</button><p id="challenge-status" role="status">No cases checked yet.</p><ol id="case-results"></ol><div class="hint-controls"><button id="next-hint">Show a hint</button><ol id="challenge-hints"></ol></div><details id="reference-solution"><summary>Reference solution</summary><p>Compare the mechanism after you have tried the challenge. Your code can differ and still pass.</p><pre tabindex="0">${escape(lesson.challenge.reference)}</pre><button id="use-reference">Load reference into editor</button></details></div></div></details>
 ${lesson.c ? `<details class="explanation"><summary>Compare the C intent</summary><p>Equivalent intent for this target. This assembly was written for teaching; it is not presented as compiler output.</p><div class="paired-listing"><div><h3>C intent</h3><pre>${escape(lesson.c)}</pre></div><div><h3>Current assembly fragment</h3><pre id="c-intent-assembly">${escape(lesson.starter)}</pre></div></div></details>` : ""}
 <details id="compiled-listing" class="explanation" ${lesson.language === "c" ? "" : "hidden"}><summary>Inspect the real compiler output</summary><p>TinyCC builds the C locally. GNU objdump disassembles the resulting executable. This TinyCC build does not emit source-line mappings, so the page does not guess which C line produced each instruction.</p><div class="paired-listing"><div><h3>C used in this build</h3><pre id="compiled-source">Not compiled yet.</pre></div><div><h3>Machine instructions</h3><pre id="compiled-assembly">Not compiled yet.</pre></div></div></details>
 <section class="lesson-resources" aria-label="Lesson resources"><details id="complete-program" class="explanation complete-program resource-row">${resourceSummary("View complete program", "code", "Entry, your code, reporting and exit")}<div class="explanation-body"><p>This is the complete source for the current editor. The supplied code reserves an aligned inspection area, prepares the listed inputs, and captures registers and memory before formatting the report. It then uses xv6 write and exit calls.</p><button id="download-complete">Download complete program</button>${lesson.language === "c" ? '<h3>C function</h3><pre id="complete-c-source"></pre><h3>Supplied assembly caller and reporting code</h3>' : ""}</div><pre id="complete-source" tabindex="0" aria-label="Complete assembly program"></pre></details>
 <details class="explanation resource-row">${resourceSummary("Executable layout", "layout")}<p>The load regions below come from the ELF built for the last run. xv6 loads these regions and sets the initial stack before entering the program.</p><div id="elf-layout">Build once to inspect its actual load segments.</div></details>
 <details class="explanation resource-row">${resourceSummary("References", "book")}<ul>${[...new Set([...lesson.references, "assembler"])].map((key) => `<li><a href="${REFERENCES[key][1]}">${escape(REFERENCES[key][0])}</a></li>`).join("")}<li><a href="../../NOTICE.md">Runtime, source and licensing record</a></li></ul></details><a class="resource-link" href="../../using-the-workbench/">${icon("guide")}<span class="resource-label">Using the workbench</span><span class="resource-chevron" aria-hidden="true"></span></a></section>
 <div class="lesson-completion"><label><input type="checkbox" id="lesson-complete"> Mark lesson complete</label><p>Saved in this browser when storage is available.</p></div><nav class="lesson-navigation" aria-label="Lesson navigation">${previous ? `<a href="../${previous.id}/"><span>← Previous lesson</span>${escape(previous.title)}</a>` : '<a href="../../"><span>Course overview</span>Choose a lesson</a>'}${next ? `<a href="../${next.id}/"><span>Next lesson →</span>${escape(next.title)}</a>` : '<a href="../../"><span>Course overview</span>Choose another topic</a>'}</nav>
 </main></div>`;
  const dir = new URL(`lessons/${lesson.id}/`, root);
  await mkdir(dir, { recursive: true });
  const payload = JSON.stringify(lesson).replaceAll("<", "\\u003c");
  await writeFile(
    new URL("index.html", dir),
    document(lesson.title, body, {
      data: `<script type="application/json" id="lesson-data">${payload}</script>`,
    }),
  );
  await writeFile(
    new URL(lesson.language === "c" ? "lesson.c" : "lesson.s", dir),
    lesson.starter,
  );
}
const courseContents = `<p id="course-progress" role="status"></p><details id="course-contents" class="course-contents"><summary>Course contents <span>${lessons.length} lessons · ${MODULES.length} modules</span></summary><div class="course-contents-body">${MODULES.map(
  (module) =>
    `<details class="course-module" id="${module.id}"><summary class="module-heading"><span class="module-number">${module.label}</span><span><strong>${escape(module.title)}</strong><span class="module-summary">${escape(module.summary)}</span></span></summary><ol>${lessons
      .filter((l) => l.module === module.id)
      .map(
        (l) =>
          `<li><a href="./lessons/${l.id}/"><strong>${escape(l.title)}</strong><span>${escape(l.summary)}</span></a><span class="completion-mark" data-completion="${l.id}" hidden>✓ Complete</span></li>`,
      )
      .join("")}</ol></details>`,
).join("")}</div></details>`;
const home = `<main id="main" class="course-home"><section class="intro home-hero"><div class="home-hero-copy"><p class="eyebrow">Write it. Run it. Inspect the bits.</p><h1>Learn <span class="architecture-name">RISC-V</span> assembly by running it.</h1><p>Start with three instructions. Build towards functions, C and a working trip calculation in xv6.</p><p class="subtle">${lessons.length} focused lessons · real GNU tools · execution in your browser</p><a class="primary home-start" href="./lessons/${lessons[0].id}/">Start the course →</a> <a class="secondary-link" href="./lessons/hello-world/">Try Hello World</a></div><div class="home-hero-art"><img src="./assets/riscv-hero.webp" alt="" width="1536" height="1024" fetchpriority="high" decoding="async"></div></section>${courseContents}<section class="course-introduction"><p>Optional guide: <a href="./using-the-workbench/">Using the workbench</a>.</p><h2>Registers hold bits. Instructions decide what they mean.</h2><p>Predict a result, run or step the code, inspect registers and bytes, then change the example. Each challenge checks your code on fresh inputs. Supplied entry and reporting code stays available behind “View complete program”.</p><h2>Before you start</h2><p>You can read simple C: variables, if statements, loops, functions and arrays. You can read small binary numbers using place values. No assembly, hexadecimal, two’s complement or pointers are assumed. <a href="https://snowch.github.io/bit-lab/">Bit Lab</a> offers an optional binary refresher.</p><p>The target is 64-bit RISC-V with the RV64GC instruction set and the standard integer calling convention. Programs run as real xv6 user processes. RISC-V has no Arm condition flags; the arithmetic and branch lessons teach its own mechanisms.</p><p>An assembler turns assembly text into machine-code bytes. A linker joins those pieces and resolves their addresses to make an executable file. The GNU assembler and linker do that locally here. The C lessons add the pinned TinyCC compiler. Source drafts and completion marks stay in this browser; guest files are disposable. <a href="./NOTICE.md">Sources and runtime details</a>.</p></section></main>`;
await writeFile(
  new URL("index.html", root),
  document("Course", home, { prefix: "./", script: "./course/home.js" }),
);
await writeFile(
  new URL("course/catalog.json", root),
  JSON.stringify(
    lessons.map(({ id, module, title }) => ({ id, module, title })),
    null,
    2,
  ) + "\n",
);
console.log(`Built ${lessons.length} lessons in ${MODULES.length} modules.`);

// Optional reference page: kept outside lesson progression and completion data.
const guide = JSON.parse(
  await readFile(
    new URL("../content/guides/workbench.json", import.meta.url),
    "utf8",
  ),
);
const addition = lessons.find((lesson) => lesson.id === "addition");
const guideBody = `<main id="main" class="workbench-guide"><p><a class="guide-back" href="../">← Course overview</a></p><article><div class="intro"><p class="eyebrow">Optional guide</p><h1>${escape(guide.title)}</h1><p>${inline(guide.intro)}</p></div><nav class="guide-contents" aria-label="On this page">${guide.sections.map((section) => `<a href="#${escape(section.id)}">${escape(section.title)}</a>`).join("")}</nav>${guide.sections.map((section) => `<section id="${escape(section.id)}"><h2>${escape(section.title)}</h2>${paragraphs(section.paragraphs)}${section.example ? `<pre tabindex="0" aria-label="Addition example"><code>${escape(addition.starter)}</code></pre>` : ""}${section.rows ? `<div class="guide-table" tabindex="0" role="region" aria-label="${escape(section.title)}"><table><thead><tr>${section.headers.map((header) => `<th scope="col">${escape(header)}</th>`).join("")}</tr></thead><tbody>${section.rows.map((row) => `<tr>${row.map((cell, index) => (index === 0 ? `<th scope="row">${inline(cell)}</th>` : `<td>${inline(cell)}</td>`)).join("")}</tr>`).join("")}</tbody></table></div>` : ""}${section.link ? `<p><a class="guide-action" href="${escape(section.link.href)}">${escape(section.link.label)}</a></p>` : ""}</section>`).join("")}<p class="guide-end"><a class="guide-action" href="${escape(guide.endLink.href)}">${escape(guide.endLink.label)}</a></p></article></main>`;
await mkdir(new URL("using-the-workbench/", root), { recursive: true });
await writeFile(
  new URL("using-the-workbench/index.html", root),
  document(guide.title, guideBody, {
    prefix: "../",
    script: "../course/home.js",
    styles: ["../course/guide.css"],
  }),
);
