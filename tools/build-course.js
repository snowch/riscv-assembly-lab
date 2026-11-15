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
  return `<a class="skip" href="#main">Skip to content</a><header><a class="brand" href="${prefix}"><span class="logo" aria-hidden="true">≋</span> RISC-V Assembly Lab</a><nav aria-label="Site"><a href="${prefix}">Course</a><a href="https://github.com/snowch/riscv-assembly-lab">☆ <span>Star on GitHub</span></a>${theme}</nav></header>`;
}
function footer(prefix) {
  return `<footer><p>Copyright © 2026 Christopher Snow</p><div><a href="${prefix}NOTICE.md">Sources and licences</a><a href="https://snowch.github.io/assembly-lab/">Arm Assembly Lab</a><a href="https://github.com/snowch/riscv-assembly-lab/issues">Report a problem</a></div></footer>`;
}
function document(
  title,
  body,
  { prefix = "../../", script = "../../course/lesson.js", data = "" } = {},
) {
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#087e72"><meta name="description" content="Learn RISC-V by writing and running real assembly and C in your browser."><title>${escape(title)} · RISC-V Assembly Lab</title><link rel="icon" href="${prefix}icon.svg" type="image/svg+xml"><link rel="stylesheet" href="${prefix}style.css"><link rel="stylesheet" href="${prefix}course/course.css"><link rel="stylesheet" href="${prefix}course/debugger.css"><script type="module" src="${script}"></script></head><body class="course-page">${header(prefix)}${body}${footer(prefix)}${data}</body></html>\n`
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");
}
function navigation(current) {
  return `<aside class="course-sidebar"><details id="course-navigation"><summary>Course lessons</summary><nav aria-label="Course lessons">${MODULES.map(
    (module) =>
      `<details ${current?.module === module.id ? "open" : ""}><summary>${module.label} · ${escape(module.title)}</summary><ol>${lessons
        .filter((l) => l.module === module.id)
        .map(
          (l) =>
            `<li><a href="../${l.id}/" ${l.id === current?.id ? 'aria-current="page"' : ""}>${escape(l.title)}</a><span data-completion="${l.id}" aria-label="Completed" hidden>✓</span></li>`,
        )
        .join("")}</ol></details>`,
  ).join("")}</nav></details></aside>`;
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
  const module = MODULES.find((m) => m.id === lesson.module),
    previous = lessons[index - 1],
    next = lessons[index + 1];
  const memory = lesson.memory
    ? `<section class="memory-section" aria-labelledby="memory-heading"><div class="section-heading"><h3 id="memory-heading">${lesson.memory === "stack" ? "Stack bytes" : "Memory bytes"}</h3>${lesson.memory === "data" ? '<div role="group" aria-label="Memory moment"><button id="memory-before" aria-pressed="true">Before</button><button id="memory-after" aria-pressed="false">After</button></div>' : ""}</div><p id="memory-note" class="panel-note">${lesson.memory === "stack" ? "Run or step to inspect 64 mapped bytes from the current stack pointer." : "Supplied bytes before your code. The labels give byte offsets from lesson_data."}</p><div id="memory-grid" class="memory-grid"></div><p id="byte-inspection" class="panel-note">Choose a byte to inspect its address and readings.</p></section>`
    : "";
  const body = `<div class="course-layout">${navigation(lesson)}<main id="main"><div class="intro"><p class="eyebrow">${module.label === "A" ? "Further reading" : `Module ${module.label}`} · ${escape(module.title)}</p><h1>${escape(lesson.title)}</h1><p>${inline(lesson.summary)}</p></div>
 <div class="build-toolbar lesson-toolbar"><div class="run-actions"><button id="run" class="primary" disabled>Build & Run</button><button id="debug" disabled>Start debugging</button><button id="step" disabled>Start stepping</button><button id="continue" disabled hidden>Continue</button><button id="stop" disabled>Stop</button></div><p id="run-status" role="status">Loading lesson…</p><p id="sticky-operation" hidden></p></div>
 <p id="snapshot-note" class="notice" hidden>These observations belong to the source captured at the start of this run. Build again to use your edits.</p>
 <section class="lesson-guide" aria-label="Before you run">${paragraphs(lesson.before)}</section>
 <section id="prediction-block" class="prediction-block" aria-labelledby="prediction-heading"><h2 id="prediction-heading">Predict, then check</h2><p>${inline(lesson.prediction.prompt)}</p><div class="prediction-entry"><label for="prediction">Your prediction <span>(${escape(lesson.ui.signed || lesson.prediction.reading === "hex" ? (lesson.prediction.reading ?? "signed") : "decimal")} reading)</span></label><input id="prediction" inputmode="text" autocomplete="off" placeholder="Optional: predict before running"><button id="prediction-hint-button" type="button">Hint</button></div><p id="prediction-hint" hidden>${inline(lesson.prediction.hint)}</p><p id="prediction-feedback" role="status">Run the code to check against the CPU’s result.</p></section>
 <noscript><p>Building and stepping require JavaScript and WebAssembly. <a href="./${lesson.language === "c" ? "lesson.c" : "lesson.s"}">Read the starting code</a>.</p></noscript><div class="workspace"><section class="panel editor-panel" aria-labelledby="source-heading"><div class="panel-heading"><div><span class="eyebrow">01 · Your code</span><h2 id="source-heading">${lesson.language === "c" ? "lesson.c" : "lesson.s"}</h2></div><span class="tag">${lesson.language === "c" ? "TinyCC · RV64" : "RV64GC · xv6"}</span></div>
 <div class="mode-tabs" role="group" aria-label="Activity"><button id="explore-mode" aria-pressed="true">Explore</button><button id="challenge-mode" aria-pressed="false">Challenge</button></div>
 <div id="starting-state" class="starting-state"></div><p id="source-help" class="panel-note">${lesson.language === "c" ? "Edit the function, then compile and run it. The supplied caller passes the starting arguments." : "Edit the focused fragment, then build and run it. Entry, reporting and exit are supplied."}</p>
 <div class="editor ${lesson.language === "c" ? "" : "breakpoint-editor"}"><div id="line-numbers" ${lesson.language === "c" ? 'aria-hidden="true"' : 'role="group" aria-label="Source breakpoints"'}>1</div><textarea id="source" aria-label="${lesson.language === "c" ? "C source" : "Lesson assembly source"}" aria-describedby="source-help save-state" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" disabled>${escape(lesson.starter)}</textarea></div>
 <div class="editor-footer"><span id="save-state">Draft saves in this browser</span><div><button id="restore" class="text-button">Restore starter</button><button id="download" class="text-button">Download code</button></div></div>
 <p class="stepping-help">Start stepping pauses before the first machine instruction. Step instruction executes one machine instruction. Pseudo-instructions can expand into several. Ctrl / ⌘ + Enter builds a fresh run.</p>
 </section>
 <section class="panel run-panel" aria-labelledby="register-heading"><div class="panel-heading"><div><span class="eyebrow">02 · Observe</span><h2 id="register-heading">Registers</h2></div><span id="state-badge" class="tag">Ready</span></div><div class="reading-select" ${lesson.ui.signed ? "" : "hidden"}><label>Decimal reading <select id="reading"><option value="signed">Signed</option><option value="unsigned">Unsigned</option></select></label></div><div id="registers" class="registers"></div><p id="register-note" class="panel-note">Run your code to capture the actual register values.</p>${memory}
 <details id="diagnostics"><summary>Diagnostics <span id="diagnostics-summary">Not built yet</span></summary><div id="diagnostic-lines"></div></details><details id="program-output" ${lesson.id === "system-calls" ? "open" : ""}><summary>Program output <span>Your code’s console text</span></summary><pre id="console" tabindex="0" aria-label="Program output">Not run yet.</pre></details><details><summary>xv6 serial log <span>Boot, program and shell</span></summary><pre id="serial" tabindex="0">Not started yet.</pre></details></section></div>
 ${debuggerMarkup(lesson)}
 <section id="step-observations" class="step-observations" hidden><h2>Instruction path</h2><p>The program counter (PC) holds the address of the next machine instruction. Arrows record addresses observed during execution.</p><p id="current-instruction"></p><p id="step-location" class="subtle"></p><ol id="trace-list"></ol></section>
 <details class="explanation" id="bit-view" ${lesson.ui.signed ? "" : "hidden"}><summary>Inspect the register bits</summary><div class="bit-controls"><label>Register <select id="bit-register"></select></label><button id="bits-high">High bits</button><button id="bits-low">Low bits</button></div><p id="bit-reading"></p><div id="bits-scroller" tabindex="0" aria-label="Register bits, highest on the left"><div id="bits"></div></div>${lesson.id === "floating-point-bits" ? '<p id="floating-reading"></p><p>Binary32 interpretation of the observed low 32 bits, not execution of a floating-point instruction.</p>' : ""}</details>
 <section class="lesson-explanation" aria-labelledby="explanation-heading"><h2 id="explanation-heading">What the instructions do</h2>${paragraphs(lesson.explanation)}</section>
 <section id="experiment" class="next-step"><div><h2>Change it and run again</h2><p>${inline(lesson.experiment.task)}</p><details><summary>A hint</summary><p>${inline(lesson.experiment.hint)}</p></details></div></section>
 <section id="challenge" class="challenge-section"><h2>Use it on fresh inputs</h2><p>${inline(lesson.challenge.task)}</p><button id="start-challenge">Open challenge</button><div id="challenge-controls" hidden><p>Each case starts a fresh xv6 machine. The same submitted code must pass every case.</p><div id="case-picker"></div><button id="check-cases" class="primary">Check all cases</button><p id="challenge-status" role="status">No cases checked yet.</p><ol id="case-results"></ol><div class="hint-controls"><button id="next-hint">Show a hint</button><ol id="challenge-hints"></ol></div><details id="reference-solution"><summary>Reference solution</summary><p>Compare the mechanism after you have tried the challenge. Your code can differ and still pass.</p><pre tabindex="0">${escape(lesson.challenge.reference)}</pre><button id="use-reference">Load reference into editor</button></details></div></section>
 ${lesson.c ? `<details class="explanation"><summary>Compare the C intent</summary><p>Equivalent intent for this target. This assembly was written for teaching; it is not presented as compiler output.</p><div class="paired-listing"><div><h3>C intent</h3><pre>${escape(lesson.c)}</pre></div><div><h3>Current assembly fragment</h3><pre id="c-intent-assembly">${escape(lesson.starter)}</pre></div></div></details>` : ""}
 <details id="compiled-listing" class="explanation" ${lesson.language === "c" ? "" : "hidden"}><summary>Inspect the real compiler output</summary><p>TinyCC builds the C locally. GNU objdump disassembles the resulting executable. This TinyCC build does not emit source-line mappings, so the page does not guess which C line produced each instruction.</p><div class="paired-listing"><div><h3>C used in this build</h3><pre id="compiled-source">Not compiled yet.</pre></div><div><h3>Machine instructions</h3><pre id="compiled-assembly">Not compiled yet.</pre></div></div></details>
 <details id="complete-program" class="explanation complete-program"><summary>View complete program <span>Entry, your code, reporting and exit</span></summary><div class="explanation-body"><p>This is the complete source for the current editor. The supplied code reserves an aligned inspection area, prepares the listed inputs, and captures registers and memory before formatting the report. It then uses xv6 write and exit calls.</p><button id="download-complete">Download complete program</button>${lesson.language === "c" ? '<h3>C function</h3><pre id="complete-c-source"></pre><h3>Supplied assembly caller and reporting code</h3>' : ""}</div><pre id="complete-source" tabindex="0" aria-label="Complete assembly program"></pre></details>
 <details class="explanation"><summary>Executable layout</summary><p>The load regions below come from the ELF built for the last run. xv6 loads these regions and sets the initial stack before entering the program.</p><div id="elf-layout">Build once to inspect its actual load segments.</div></details>
 <details class="explanation"><summary>References</summary><ul>${[...new Set([...lesson.references, "assembler"])].map((key) => `<li><a href="${REFERENCES[key][1]}">${escape(REFERENCES[key][0])}</a></li>`).join("")}<li><a href="../../NOTICE.md">Runtime, source and licensing record</a></li></ul></details>
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
const home = `<main id="main" class="course-home"><section class="intro home-hero"><div class="home-hero-copy"><p class="eyebrow">Write it. Run it. Inspect the bits.</p><h1>Learn <span class="architecture-name">RISC-V</span> assembly by running it.</h1><p>Start with three instructions. Build towards functions, C and a working trip calculation in xv6.</p><p class="subtle">${lessons.length} focused lessons · real GNU tools · execution in your browser</p><a class="primary home-start" href="./lessons/${lessons[0].id}/">Start the course →</a> <a class="secondary-link" href="./lessons/hello-world/">Try Hello World</a></div><div class="home-hero-art"><img src="./assets/riscv-hero.webp" alt="" width="1536" height="1024" fetchpriority="high" decoding="async"></div></section>${courseContents}<section class="course-introduction"><h2>Registers hold bits. Instructions decide what they mean.</h2><p>Predict a result, run or step the code, inspect registers and bytes, then change the example. Each challenge checks your code on fresh inputs. Supplied entry and reporting code stays available behind “View complete program”.</p><h2>Before you start</h2><p>You can read simple C: variables, if statements, loops, functions and arrays. You can read small binary numbers using place values. No assembly, hexadecimal, two’s complement or pointers are assumed. <a href="https://snowch.github.io/bit-lab/">Bit Lab</a> offers an optional binary refresher.</p><p>The target is 64-bit RISC-V with the RV64GC instruction set and the standard integer calling convention. Programs run as real xv6 user processes. RISC-V has no Arm condition flags; the arithmetic and branch lessons teach its own mechanisms.</p><p>An assembler turns assembly text into machine-code bytes. A linker joins those pieces and resolves their addresses to make an executable file. The GNU assembler and linker do that locally here. The C lessons add the pinned TinyCC compiler. Source drafts and completion marks stay in this browser; guest files are disposable. <a href="./NOTICE.md">Sources and runtime details</a>.</p></section></main>`;
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
