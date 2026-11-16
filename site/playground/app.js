// Copyright © 2026 Christopher Snow
import { createWorkbench } from "../course/workbench-controller.js";
import { setupTheme } from "../course/home.js";
import {
  ProjectStore,
  newProject,
  normaliseProject,
  projectContext,
  importProject,
  serialiseProject,
  readTransfer,
  parseSetupRegisters,
  parseSetupData,
  MAX_PROJECT_BYTES,
} from "./projects.js";
const $ = (id) => document.getElementById(id);
const config = JSON.parse($("playground-data").textContent),
  copy = config.copy;
setupTheme();
let storage = null;
try {
  storage = localStorage;
} catch {}
const store = new ProjectStore(storage);
let initialMessage = store.loadError,
  initialError = Boolean(initialMessage),
  pendingImport = null,
  pendingJson = false;
try {
  const transferred = readTransfer(location.hash);
  if (transferred) {
    store.add(transferred);
    initialMessage = copy.messages.transferOpened;
    history.replaceState(null, "", location.pathname + location.search);
  }
} catch (error) {
  initialMessage = copy.messages.transferFailed + " " + error.message;
  initialError = true;
}
if (!store.current)
  store.add(normaliseProject(config.defaultProject, { freshId: true }));
const typeFor = (project) =>
  copy.projectTypes.find((type) => type.id === project.kind);
function message(text, error = false) {
  $("project-message").textContent = text;
  $("project-message").classList.toggle("project-error", error);
}
function showSaveState() {
  $("save-state").textContent = store.saved
    ? copy.messages.saved
    : copy.messages.tabOnly;
}
function projectList() {
  $("project-picker").replaceChildren(
    ...store.projects.map((project) => {
      const option = document.createElement("option");
      option.value = project.id;
      option.textContent = project.name;
      return option;
    }),
  );
  $("project-picker").value = store.active;
}
document
  .querySelector(".build-toolbar")
  .append(document.querySelector(".workspace-tools"));
const controller = createWorkbench(projectContext(store.current), {
  curriculum: false,
  messages: copy.messages,
  onDraft(source, context) {
    const project = store.projects.find((project) => project.id === context.id);
    if (!project) return;
    try {
      store.update({ ...project, source });
      projectList();
      showSaveState();
    } catch (error) {
      $("save-state").textContent =
        error.message + " Download source to keep your edit.";
    }
  },
});
function current() {
  return { ...store.current, source: controller.snapshot().source };
}
function metadata() {
  const project = store.current,
    type = typeFor(project);
  projectList();
  showSaveState();
  $("project-name").value = project.name;
  $("project-name").setAttribute("aria-invalid", "false");
  $("project-kind").textContent = type.label;
  const presets = Object.entries(project.inputs),
    summary = copy.setup.summary;
  $("setup-summary").textContent =
    project.kind === "program"
      ? summary.fullProgram
      : presets.length
        ? summary.presets.replace(
            "{values}",
            presets
              .slice(0, 2)
              .map(([name, value]) => `${name}=${BigInt(value)}`)
              .join(", "),
          ) +
          (presets.length > 2
            ? summary.moreRegisters.replace(
                "{count}",
                String(presets.length - 2),
              )
            : "")
        : summary.zeroRegisters;
  if (project.kind !== "program" && project.data.length)
    $("setup-summary").textContent +=
      " · " + summary.dataBytes.replace("{count}", String(project.data.length));
  $("source-help").hidden = true;
  $("entry-copy").textContent =
    type.entryHelp ??
    (project.kind === "program"
      ? "Your complete assembly program defines its entry, initialisation, data and exit."
      : project.kind === "c"
        ? "The supplied caller passes the starting arguments to your function and reports its result."
        : "The lab supplies entry, reporting and exit code.");
  $("complete-description").textContent =
    type.completeSourceDescription ??
    (project.kind === "program"
      ? "Your complete source, unchanged"
      : "Entry, your code, reporting and exit");
  $("setup-memory-help").textContent =
    (project.kind === "program"
      ? (copy.setup.fullProgramMemoryHelp ??
        "Program memory starts at lesson_data when defined, otherwise the first writable load region or code region. Stack starts at the observed stack pointer.")
      : copy.setup.memoryHelp) +
    " " +
    copy.setup.highlightHelp;
  $("source-help").textContent = type.sourceHelp;
  document.querySelector(".editor-panel .tag").textContent =
    project.kind === "c" ? "TinyCC · RV64" : "RV64GC · xv6";
  $("project-inputs").value = Object.entries(project.inputs)
    .map(([name, value]) => `${name} = ${value}`)
    .join("\n");
  $("project-bytes").value = project.data
    .map((n) => n.toString(16).padStart(2, "0").toUpperCase())
    .join(" ");
  $("project-memory").value = project.memory;
  $("project-result").value = project.result;
  $("fragment-setup").disabled = project.kind === "program";
  $("fragment-setup").hidden = project.kind === "program";
  $("full-program-help").hidden = project.kind !== "program";
  $("setup-error").textContent = "";
  $("project-origin").replaceChildren();
  if (project.origin) {
    const link = document.createElement("a");
    link.href = `../lessons/${project.origin.id}/`;
    link.textContent = `${copy.labels.sourceLesson}: ${project.origin.title}`;
    link.target = "_blank";
    link.rel = "noopener";
    link.setAttribute("aria-label", `${link.textContent} (new tab)`);
    $("project-origin").append(link);
    if (project.origin.caseName) {
      const note = document.createElement("span");
      note.textContent = ` · ${project.origin.caseName}`;
      $("project-origin").append(note);
    }
  }
  $("undo-delete").hidden = !store.undo;
}
function open(project, text = copy.messages.projectOpened) {
  controller.loadProject(projectContext(project));
  metadata();
  message(text);
}
function add(project, text) {
  store.update(current());
  const added = store.add(project);
  open(added, text);
  return added;
}
function safely(action) {
  try {
    action();
  } catch (error) {
    message(error.message, true);
  }
}
function download(blob, name) {
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const filename = (project) =>
  project.name
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70) || "project";
$("project-picker").addEventListener("change", () =>
  safely(() => {
    store.update(current());
    open(store.select($("project-picker").value));
  }),
);
$("project-name").addEventListener("change", () => {
  try {
    store.update({ ...current(), name: $("project-name").value });
    metadata();
    message("");
  } catch (error) {
    $("project-name").setAttribute("aria-invalid", "true");
    message(error.message, true);
  }
});
$("open-example").addEventListener("click", () =>
  safely(() => {
    const example = config.examples.find(
      (project) => project.id === $("project-example").value,
    );
    add(
      normaliseProject(example, { freshId: true }),
      copy.messages.exampleOpened,
    );
  }),
);
$("copy-project").addEventListener("click", () =>
  safely(() =>
    add(
      normaliseProject(
        { ...current(), name: store.current.name.slice(0, 70) + " copy" },
        { freshId: true },
      ),
      copy.messages.copyCreated,
    ),
  ),
);
$("export-project").addEventListener("click", () =>
  safely(() => {
    const project = current();
    download(
      new Blob([serialiseProject(project)], { type: "application/json" }),
      filename(project) + ".riscv.json",
    );
  }),
);
$("delete-project").addEventListener("click", () =>
  safely(() => {
    store.update(current());
    store.remove();
    controller.stop();
    if (!store.current) store.add(newProject("asm", "New project"));
    open(store.current, copy.messages.projectDeleted);
  }),
);
$("undo-delete").addEventListener("click", () =>
  safely(() => {
    const restored = store.restoreRemoved();
    if (restored) open(restored, copy.messages.deleteUndone);
  }),
);
$("setup-form").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const project = current(),
      full = project.kind === "program";
    const next = normaliseProject({
      ...project,
      inputs: full ? {} : parseSetupRegisters($("project-inputs").value),
      data: full ? [] : parseSetupData($("project-bytes").value),
      memory: $("project-memory").value,
      result: $("project-result").value,
    });
    store.update(next);
    open(next, copy.messages.setupApplied);
  } catch (error) {
    $("setup-error").textContent =
      copy.messages.setupFailed + " " + error.message;
  }
});
for (const dialog of [$("new-project-dialog"), $("import-project-dialog")]) {
  dialog.addEventListener("keydown", (event) => event.stopPropagation());
  dialog
    .querySelector("[data-close-dialog]")
    .addEventListener("click", () => dialog.close());
}
function newDescription() {
  $("new-project-description").textContent = copy.projectTypes.find(
    (type) => type.id === $("new-project-kind").value,
  ).description;
}
$("new-project").addEventListener("click", () => {
  $("new-project-error").textContent = "";
  newDescription();
  $("new-project-dialog").showModal();
});
$("new-project-kind").addEventListener("change", newDescription);
$("new-project-form").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    add(newProject($("new-project-kind").value, $("new-project-name").value));
    $("new-project-dialog").close();
  } catch (error) {
    $("new-project-error").textContent = error.message;
  }
});
$("import-file").addEventListener("click", () => {
  $("project-file").value = "";
  $("project-file").click();
});
$("project-file").addEventListener("change", async () => {
  const file = $("project-file").files[0];
  if (!file) return;
  try {
    if (file.size > MAX_PROJECT_BYTES)
      throw new Error("The file is too large. Use at most 160,000 bytes.");
    const text = await file.text();
    pendingJson = /\.json$/i.test(file.name);
    if (pendingJson) pendingImport = importProject(text);
    else {
      if (!/\.(?:s|asm|c)$/i.test(file.name))
        throw new Error(
          "Choose project JSON, assembly (.s or .asm), or C (.c) source.",
        );
      const kind = /\.c$/i.test(file.name)
        ? "c"
        : /^\s*_start\s*:/m.test(text)
          ? "program"
          : "asm";
      pendingImport = normaliseProject({
        ...newProject(kind, file.name.slice(0, 80)),
        source: text,
      });
    }
    $("import-project-name").value = pendingImport.name;
    $("import-project-kind").value = pendingImport.kind;
    $("import-project-kind").disabled = pendingJson;
    $("import-preview").textContent = pendingImport.source
      .split("\n")
      .slice(0, 12)
      .join("\n");
    $("import-error").textContent = "";
    $("import-project-dialog").showModal();
  } catch (error) {
    message(copy.messages.importFailed + " " + error.message, true);
    pendingImport = null;
  }
});
$("import-project-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!pendingImport) return;
  try {
    const kind = $("import-project-kind").value;
    const imported = normaliseProject(
      {
        ...pendingImport,
        name: $("import-project-name").value,
        kind,
        ...(kind === "program" ? { inputs: {}, data: [] } : {}),
        result:
          pendingJson || kind === pendingImport.kind
            ? pendingImport.result
            : kind === "c"
              ? "a0"
              : "t2",
      },
      { freshId: true },
    );
    add(imported, copy.messages.imported);
    pendingImport = null;
    $("import-project-dialog").close();
  } catch (error) {
    $("import-error").textContent = error.message;
  }
});
window.addEventListener("hashchange", () => {
  if (!location.hash.startsWith("#project=")) return;
  try {
    const project = readTransfer(location.hash);
    add(project, copy.messages.transferOpened);
    history.replaceState(null, "", location.pathname + location.search);
  } catch (error) {
    message(copy.messages.transferFailed + " " + error.message, true);
  }
});
// The separator adjusts only the desktop columns; it never changes source/state.
const divider = $("workspace-divider"),
  workspace = document.querySelector("#workbench .workspace");
let editorWidth = 55;
try {
  const saved = Number(
    localStorage.getItem("riscv-assembly-lab:playground:width"),
  );
  if (saved >= 30 && saved <= 75) editorWidth = saved;
} catch {}
function setWidth(value) {
  editorWidth = Math.max(30, Math.min(75, value));
  workspace.style.setProperty("--editor-share", editorWidth + "%");
  divider.setAttribute("aria-valuenow", String(Math.round(editorWidth)));
  try {
    localStorage.setItem(
      "riscv-assembly-lab:playground:width",
      String(editorWidth),
    );
  } catch {}
}
divider.addEventListener("keydown", (event) => {
  const change = { ArrowLeft: -2, ArrowRight: 2 }[event.key];
  if (change || ["Home", "End"].includes(event.key)) {
    event.preventDefault();
    setWidth(
      event.key === "Home"
        ? 30
        : event.key === "End"
          ? 75
          : editorWidth + change,
    );
  }
});
divider.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  divider.setPointerCapture(event.pointerId);
});
divider.addEventListener("pointermove", (event) => {
  if (!divider.hasPointerCapture(event.pointerId)) return;
  const box = workspace.getBoundingClientRect();
  setWidth(((event.clientX - box.left) / box.width) * 100);
});
divider.addEventListener("pointerup", (event) => {
  if (divider.hasPointerCapture(event.pointerId))
    divider.releasePointerCapture(event.pointerId);
});
setWidth(editorWidth);
for (const element of document.querySelectorAll(
  "#project-picker,#new-project,#open-example",
))
  element.disabled = false;
metadata();
if (initialMessage) message(initialMessage, initialError);

// These are disclosure menus, not concurrent floating panels.
const projectMenus = [...document.querySelectorAll(".project-tools > details")];
document.addEventListener("pointerdown", (event) => {
  for (const menu of projectMenus)
    if (!menu.contains(event.target)) menu.open = false;
});
for (const menu of projectMenus) {
  menu.addEventListener("toggle", () => {
    if (menu.open)
      for (const other of projectMenus) if (other !== menu) other.open = false;
  });
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) {
      event.preventDefault();
      event.stopPropagation();
      menu.open = false;
      menu.querySelector("summary").focus({ preventScroll: true });
    }
  });
  for (const button of menu.querySelectorAll("button"))
    button.addEventListener("click", () => {
      menu.open = false;
    });
}
$("import-project-dialog").addEventListener("close", () =>
  document
    .querySelector(".project-actions > summary")
    .focus({ preventScroll: true }),
);
$("project-name").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    event.target.blur();
    document.querySelector(".project-actions").open = false;
    document
      .querySelector(".project-actions > summary")
      .focus({ preventScroll: true });
  }
});
