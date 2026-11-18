// Copyright © 2026 Christopher Snow
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { loadLessons, MODULES, REFERENCES } from "./course-data.js";
import {
  workbenchMarkup,
  programResourcesMarkup,
} from "../site/course/workbench-markup.js";
import { REGISTERS, registerIndex } from "../site/course/model.js";
import { counterWrapMarkup } from "../site/course/counter-wrap.js";
const root = new URL("../site/", import.meta.url),
  lessons = await loadLessons();
import { escape, icon, resourceSummary } from "../site/course/html.js";
export { escape };
const inline = (value) =>
  escape(value).replace(/`([^`]+)`/g, "<code>$1</code>");
const paragraphs = (values) =>
  (values ?? []).map((value) => `<p>${inline(value)}</p>`).join("\n");
const playgroundCopy = JSON.parse(
  await readFile(
    new URL("../content/guides/playground.json", import.meta.url),
    "utf8",
  ),
);
const toolCopy = JSON.parse(
  await readFile(
    new URL("../content/guides/tool-context.json", import.meta.url),
    "utf8",
  ),
);
const counterWrapCopy = JSON.parse(await readFile(new URL("../content/guides/counter-wrap.json", import.meta.url), "utf8"));
await writeFile(
  new URL("course/tool-context-copy.js", root),
  "// Copyright © 2026 Christopher Snow\n// Generated from content/guides/tool-context.json.\nexport default " +
    JSON.stringify(toolCopy, null, 2) +
    ";\n",
);
const theme =
  '<label class="theme-label">Theme <select id="theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>';
function header(prefix) {
  return `<a class="skip" href="#main">Skip to content</a><header><a class="brand" href="${prefix}"><span class="logo" aria-hidden="true">≋</span> RISC-V Assembly Lab</a><nav aria-label="Site"><button id="open-calculator" type="button" aria-haspopup="dialog" aria-controls="calculator-dialog" aria-expanded="false" disabled>${icon("calculator")}Calculator</button><a href="https://github.com/snowch/riscv-assembly-lab" aria-label="Star on GitHub">☆ <span>Star<span class="github-long"> on GitHub</span></span></a>${theme}</nav></header>`;
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
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#087e72"><meta name="description" content="Learn RISC-V by writing and running real assembly and C in your browser."><title>${escape(title)} · RISC-V Assembly Lab</title><link rel="icon" href="${prefix}icon.svg" type="image/svg+xml"><link rel="stylesheet" href="${prefix}style.css"><link rel="stylesheet" href="${prefix}course/course.css"><link rel="stylesheet" href="${prefix}course/debugger.css"><link rel="stylesheet" href="${prefix}course/workbench.css">${styles.map((path) => `<link rel="stylesheet" href="${escape(path)}">`).join("")}<link rel="stylesheet" href="${prefix}playground/playground.css"><link rel="stylesheet" href="${prefix}course/unified-workspace.css"><link rel="stylesheet" href="${prefix}course/calculator.css"><script type="module" src="${prefix}course/calculator.js"></script><script type="module" src="${script}"></script></head><body class="course-page">${header(prefix)}${body}${footer(prefix)}${data}</body></html>\n`
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
  const body = `<div class="course-layout"><main id="main">${navigation(lesson)}<div class="intro"><h1>${escape(lesson.title)}</h1><p>${inline(lesson.summary)}</p>${lesson.id === "addition" ? '<p class="optional-guide">Optional guide: <a href="../../using-the-workbench/">Using the workbench</a></p>' : ""}</div>
 <section class="lesson-guide" aria-label="Before you run">${paragraphs(lesson.before.slice(0, 2))}${operandDiagram(lesson)}${paragraphs(lesson.before.slice(2))}</section>
 <section id="prediction-block" class="prediction-block" aria-labelledby="prediction-heading"><h2 id="prediction-heading">Predict, then check</h2><p>${inline(lesson.prediction.prompt)}</p><div class="prediction-entry"><label for="prediction">Your prediction <span>(${escape(lesson.ui.signed || lesson.prediction.reading === "hex" ? (lesson.prediction.reading ?? "signed") : "decimal")} reading)</span></label><input id="prediction" inputmode="text" autocomplete="off" placeholder="Optional: predict before running"><button id="prediction-hint-button" type="button">Hint</button></div><p id="prediction-hint" hidden>${inline(lesson.prediction.hint)}</p><p id="prediction-feedback" role="status">Run the code to check against the CPU’s result.</p></section>
 <noscript><p>Building and stepping require JavaScript and WebAssembly. <a href="./${lesson.language === "c" ? "lesson.c" : "lesson.s"}">Read the starting code</a>.</p></noscript>
 ${workbenchMarkup(lesson, { identity: toolCopy.identity, feedback: toolCopy.lessonFeedback })}
 <section class="lesson-explanation" aria-labelledby="explanation-heading"><h2 id="explanation-heading">What the instructions do</h2>${paragraphs(lesson.explanation)}${["addition-wraps", "elapsed-time"].includes(lesson.id) ? counterWrapMarkup(counterWrapCopy, lesson.id === "elapsed-time") : ""}</section>
 <section id="experiment" class="next-step"><div><h2>Change it and run again</h2><p>${inline(lesson.experiment.task)}</p><details><summary>A hint</summary><p>${inline(lesson.experiment.hint)}</p></details></div></section>
 <details id="challenge" class="challenge-section"><summary>Optional exercise <span>Check your code on fresh inputs</span></summary><div class="exercise-body"><p>${inline(lesson.challenge.task)}</p><p>Load your saved exercise draft, or its starter code. Your example draft stays available through Return to example.</p><button id="start-challenge">Load exercise</button><div id="challenge-controls" hidden><p>Build &amp; Run uses the selected case. Check all cases runs your code against every case, each on a fresh machine.</p><div id="case-picker"></div><button id="check-cases" class="primary">Check all cases</button><p id="challenge-status" role="status">No cases checked yet.</p><ol id="case-results"></ol><div class="hint-controls"><button id="next-hint">Show a hint</button><ol id="challenge-hints"></ol></div><details id="reference-solution"><summary>Reference solution</summary><p>Compare the mechanism after you have tried the challenge. Your code can differ and still pass.</p><pre tabindex="0">${escape(lesson.challenge.reference)}</pre><button id="use-reference">Load reference into editor</button></details></div></div></details>
 ${lesson.c ? `<details id="lesson-c-intent" class="explanation"><summary>Compare the C intent</summary><p>Equivalent intent for this target. This assembly was written for teaching; it is not presented as compiler output.</p><div class="paired-listing"><div><h3>C intent</h3><pre>${escape(lesson.c)}</pre></div><div><h3>Current assembly fragment</h3><pre id="c-intent-assembly">${escape(lesson.starter)}</pre></div></div></details>` : ""}
 ${programResourcesMarkup(lesson)}
 <details class="explanation resource-row">${resourceSummary("References", "book")}<ul>${[...new Set([...lesson.references, "assembler"])].map((key) => `<li><a href="${REFERENCES[key][1]}">${escape(REFERENCES[key][0])}</a></li>`).join("")}<li><a href="../../NOTICE.md">Runtime, source and licensing record</a></li></ul></details><a class="resource-link" href="../../using-the-workbench/">${icon("guide")}<span class="resource-label">Using the workbench</span><span class="resource-chevron" aria-hidden="true"></span></a></section>
 <div class="lesson-completion"><label><input type="checkbox" id="lesson-complete"> Mark lesson complete</label><p>Saved in this browser when storage is available.</p></div><nav class="lesson-navigation" aria-label="Lesson navigation">${previous ? `<a href="../${previous.id}/"><span>← Previous lesson</span>${escape(previous.title)}</a>` : '<a href="../../"><span>Course overview</span>Choose a lesson</a>'}${next ? `<a href="../${next.id}/"><span>Next lesson →</span>${escape(next.title)}</a>` : '<a href="../../"><span>Course overview</span>Choose another topic</a>'}</nav>
 </main></div>`;
  const dir = new URL(`lessons/${lesson.id}/`, root);
  await mkdir(dir, { recursive: true });
  const payload = JSON.stringify(lesson).replaceAll("<", "\\u003c");
  await writeFile(
    new URL("index.html", dir),
    document(lesson.title, body, {
      styles: ["addition-wraps", "elapsed-time"].includes(lesson.id) ? ["../../course/counter-wrap.css"] : [],
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
const home = `<main id="main" class="course-home"><section class="intro home-hero"><div class="home-hero-copy"><p class="eyebrow">Write it. Run it. Inspect the bits.</p><h1>Learn <span class="architecture-name">RISC-V</span> assembly by running it.</h1><p>Start with three instructions. Build towards functions, C and a working trip calculation in xv6.</p><p class="subtle">${lessons.length} focused lessons · real GNU tools · execution in your browser</p><a class="primary home-start" href="./lessons/${lessons[0].id}/">Start the course →</a> <a class="secondary-link" href="./lessons/hello-world/">Try Hello World</a></div><div class="home-hero-art"><img src="./assets/riscv-hero.webp" alt="" width="1536" height="1024" fetchpriority="high" decoding="async"></div></section>${courseContents}<section class="course-introduction"><p><a href="./playground/">${escape(playgroundCopy.links.homeLabel)}</a> · ${escape(playgroundCopy.links.homeDescription)}</p><p>Optional guide: <a href="./using-the-workbench/">Using the workbench</a>.</p><h2>Registers hold bits. Instructions decide what they mean.</h2><p>Predict a result, run or step the code, inspect registers and bytes, then change the example. Each challenge checks your code on fresh inputs. Supplied entry and reporting code stays available behind “View complete program”.</p><h2>Before you start</h2><p>You can read simple C: variables, if statements, loops, functions and arrays. You can read small binary numbers using place values. No assembly, hexadecimal, two’s complement or pointers are assumed. <a href="https://snowch.github.io/bit-lab/">Bit Lab</a> offers an optional binary refresher.</p><p>The target is 64-bit RISC-V with the RV64GC instruction set and the standard integer calling convention. Programs run as real xv6 user processes. RISC-V has no Arm condition flags; the arithmetic and branch lessons teach its own mechanisms.</p><p>An assembler turns assembly text into machine-code bytes. A linker joins those pieces and resolves their addresses to make an executable file. The GNU assembler and linker do that locally here. The C lessons add the pinned TinyCC compiler. Source drafts and completion marks stay in this browser; guest files are disposable. <a href="./NOTICE.md">Sources and runtime details</a>.</p></section></main>`;
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

// The independent app is generated from the same workbench markup as lessons.
const { fromLesson, newProject, projectContext } =
  await import("../site/playground/projects.js");
const defaultProject = newProject("asm", "Register addition");
defaultProject.id = "default-project";
const examples = [
  "addition",
  "sum-array",
  "stack-frames",
  "c-return-values",
  "system-calls",
].map((id) => {
  const lesson = lessons.find((l) => l.id === id);
  const project = fromLesson(lesson, lesson.starter);
  project.id = "example-" + id;
  return project;
});
const completeExample = newProject("program", "Hello World");
completeExample.id = "example-hello-world";
completeExample.source = await readFile(new URL("hello.s", root), "utf8");
examples.push(completeExample);
const countsSource = await readFile(
  new URL("playground/complete-counts.s", root),
  "utf8",
);
const worked = {
  ...newProject("program", toolCopy.bridge.workedProject),
  id: "example-complete-counts",
  source: countsSource,
  result: "s0",
  pins: ["a0", "a1", "s0"],
};
const fresh = {
  ...worked,
  id: "example-fresh-counts",
  name: toolCopy.bridge.freshProject,
  source: countsSource.replace(".quad 19, 23", ".quad 31, 17"),
};
examples.push(worked, fresh);
const project = projectContext(defaultProject),
  copy = playgroundCopy,
  labels = copy.labels;
const typeOptions = copy.projectTypes
  .map((type) => `<option value="${type.id}">${escape(type.label)}</option>`)
  .join("");
const registerOptions = REGISTERS.map(
  (name) => `<option value="${name}">${name}</option>`,
).join("");
const playgroundBody = `<main id="main" class="playground-shell"><div class="playground-intro"><div><h1>${escape(copy.title)}</h1><span id="project-kind" class="tag">Assembly fragment</span><p>${escape(copy.intro)}</p></div><a href="#playground-help">${escape(labels.help)}</a></div>
<section class="project-tools" aria-label="Project tools"><label>${escape(labels.projects)}<select id="project-picker" disabled></select></label><button id="new-project" disabled>${escape(labels.newProject)}</button><details class="project-examples"><summary>${escape(labels.examples)}</summary><div><label class="project-example-label">${escape(labels.example)}<select id="project-example">${examples.map((project) => `<option value="${project.id}">${escape(project.name)}</option>`).join("")}</select></label><button id="open-example" disabled>${escape(labels.openExample)}</button></div></details><details class="project-actions"><summary>${escape(labels.projectActions)}</summary><div><label>${escape(labels.projectName)}<input id="project-name" maxlength="80" value="${escape(defaultProject.name)}" autocomplete="off"></label><button id="copy-project">${escape(labels.saveCopy)}</button><button id="import-file">${escape(labels.import)}</button><button id="export-project">${escape(labels.export)}</button><button id="delete-project">${escape(labels.delete)}</button></div></details><input type="file" id="project-file" accept=".json,.s,.asm,.c" hidden></section>
<div class="project-origin-row"><button id="undo-delete" class="text-button" hidden>${escape(labels.undoDelete)}</button></div><p id="project-message" role="status"></p>
<details class="project-setup" id="project-setup"><summary>${escape(labels.setup)} <span id="setup-summary"></span></summary><div><p>${escape(copy.setup.intro)}</p><p id="lesson-setup-note" hidden>${escape(copy.setup.lessonHelp)}</p><form id="setup-form"><fieldset id="fragment-setup"><div class="setup-fields"><label>${escape(labels.registers)}<textarea id="project-inputs" rows="3" aria-describedby="project-input-help" placeholder="${escape(copy.setup.registerPlaceholder)}" spellcheck="false"></textarea></label><label>${escape(labels.data)}<textarea id="project-bytes" rows="3" aria-describedby="project-data-help" placeholder="${escape(copy.setup.dataPlaceholder)}" spellcheck="false"></textarea></label></div><p id="project-input-help">${escape(copy.setup.registerHelp)} ${escape(copy.setup.reservedHelp)}</p><p id="project-data-help">${escape(copy.setup.dataHelp)}</p></fieldset><p id="full-program-help" hidden>${escape(copy.setup.fullProgramHelp)}</p><div class="setup-choices"><label>${escape(labels.memoryView)}<select id="project-memory"><option value="data">${escape(labels.dataView)}</option><option value="stack">${escape(labels.stackView)}</option></select></label><label>${escape(labels.highlight)}<select id="project-result">${registerOptions}</select></label><button type="submit">${escape(labels.applySetup)}</button></div><p id="setup-memory-help">${escape(copy.setup.memoryHelp)} ${escape(copy.setup.highlightHelp)}</p><p id="setup-error" class="project-error" role="status"></p></form></div></details>
<noscript><p>JavaScript and WebAssembly are required to build and run code. <a href="../lessons/addition/lesson.s">Read the addition source</a>.</p></noscript>
${workbenchMarkup(project, { prefix: "../", standalone: true, identity: toolCopy.identity, feedback: toolCopy.lessonFeedback })}
<div id="project-resources">${programResourcesMarkup(project, { standalone: true })}</section></div>
<details id="complete-program-guide" class="playground-help complete-program-guide"><summary>${escape(toolCopy.bridge.title)}</summary><div><p>${inline(toolCopy.bridge.intro)}</p><p><strong>${escape(toolCopy.bridge.preparationLabel)}.</strong> ${inline(toolCopy.bridge.preparationIntro)}</p><ul>${toolCopy.bridge.preparation.map((link) => `<li><a href="${escape(link.href)}">${escape(link.label)}</a></li>`).join("")}</ul><h2>${escape(toolCopy.bridge.workedTitle)}</h2><p>${inline(toolCopy.bridge.workedIntro)}</p>${paragraphs(toolCopy.bridge.workedDetails)}<button id="open-worked-counts">${escape(toolCopy.bridge.workedAction)}</button><ol>${toolCopy.bridge.workedSteps.map((step) => `<li>${inline(step)}</li>`).join("")}</ol><h2>${escape(toolCopy.bridge.freshTitle)}</h2><p>${inline(toolCopy.bridge.freshTask)}</p><p>${inline(toolCopy.bridge.freshPrediction)}</p><button id="open-fresh-counts">${escape(toolCopy.bridge.freshAction)}</button><ul>${toolCopy.bridge.freshQuestions.map((question) => `<li>${inline(question)}</li>`).join("")}</ul><p>${inline(toolCopy.bridge.success)}</p></div></details>
<details id="playground-help" class="playground-help"><summary>${escape(labels.help)}</summary><div>${copy.help.map((section) => `<section><h2>${escape(section.title)}</h2>${paragraphs(section.paragraphs)}</section>`).join("")}<p><a href="../NOTICE.md">Sources and licences</a> · <a href="../using-the-workbench/">Using the workbench</a></p></div></details>
<dialog id="new-project-dialog" aria-labelledby="new-project-heading"><form id="new-project-form"><h2 id="new-project-heading">${escape(labels.newProject)}</h2><label>${escape(labels.projectName)}<input id="new-project-name" value="Untitled project" maxlength="80" required></label><label>${escape(labels.projectType)}<select id="new-project-kind">${typeOptions}</select></label><p id="new-project-description"></p><p id="new-project-error" class="project-error" role="status"></p><div class="dialog-actions"><button type="button" data-close-dialog>${escape(labels.cancel)}</button><button type="submit" class="primary">${escape(labels.createProject)}</button></div></form></dialog>
<dialog id="import-project-dialog" aria-labelledby="import-heading"><form id="import-project-form"><h2 id="import-heading">${escape(labels.import)}</h2><label>${escape(labels.projectName)}<input id="import-project-name" maxlength="80" required></label><label>${escape(labels.importAs)}<select id="import-project-kind">${typeOptions}</select></label><pre id="import-preview" tabindex="0" aria-label="Source preview"></pre><p id="import-error" class="project-error" role="status"></p><div class="dialog-actions"><button type="button" data-close-dialog>${escape(labels.cancel)}</button><button type="submit" class="primary">${escape(labels.openImportedProject)}</button></div></form></dialog>
</main>`;
const sharedToolsMarkup =
  playgroundBody.slice(
    playgroundBody.indexOf('<section class="project-tools"'),
    playgroundBody.indexOf("<noscript>"),
  ) +
  playgroundBody.slice(
    playgroundBody.indexOf('<details id="complete-program-guide"'),
    playgroundBody.lastIndexOf("</main>"),
  );
await writeFile(
  new URL("course/project-tools-config.js", root),
  "// Copyright © 2026 Christopher Snow\n// Generated by tools/build-course.js\nexport default " +
    JSON.stringify({
      defaultProject,
      examples,
      copy,
      markup: sharedToolsMarkup,
    }).replaceAll("<", "\\u003c") +
    ";\n",
);
await mkdir(new URL("playground/", root), { recursive: true });
await writeFile(
  new URL("playground/index.html", root),
  document(copy.title, playgroundBody, {
    prefix: "../",
    script: "../playground/app.js",
    styles: ["../playground/playground.css"],
    data: `<script type="application/json" id="playground-data">${JSON.stringify({ defaultProject, examples, copy }).replaceAll("<", "\\u003c")}</script>`,
  }),
);
