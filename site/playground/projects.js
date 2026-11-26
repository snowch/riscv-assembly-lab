// Copyright © 2026 Christopher Snow
import { REGISTERS, registerIndex, hex } from "../course/model.js";
import { calculatorParseEntry } from "../course/calculator-model.js";
export const PROJECT_FORMAT = "riscv-assembly-lab-project";
export const LIBRARY_KEY = "riscv-assembly-lab:playground:projects:v1";
export const MAX_PROJECT_BYTES = 160000;
export const MAX_PROJECTS = 24;
export const KIND_LABELS = {
  asm: "Assembly fragment",
  c: "C function",
  program: "Complete assembly program",
};
const bytes = (value) => new TextEncoder().encode(value).length;
const plain = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const id = () => crypto.randomUUID();
export function parseRegisterValue(text) {
  if (typeof text !== "string" || text.length > 100)
    throw new Error(
      "Enter a whole decimal value, 0x hexadecimal or 0b binary that fits 64 bits.",
    );
  const clean = text.replaceAll("−", "-").trim(),
    parsed = calculatorParseEntry(
      clean,
      64,
      clean.startsWith("-") ? "signed" : "unsigned",
    );
  if (!parsed.ok)
    throw new Error(
      "Enter a whole decimal value, 0x hexadecimal or 0b binary that fits 64 bits.",
    );
  return hex(parsed.pattern);
}
export function normaliseProject(value, { freshId = false } = {}) {
  if (!plain(value) || value.format !== PROJECT_FORMAT || value.version !== 1)
    throw new Error(
      "This is not a supported RISC-V Assembly Lab project (version 1).",
    );
  if (!Object.hasOwn(KIND_LABELS, value.kind))
    throw new Error(
      "Choose an assembly fragment, C function or complete assembly program.",
    );
  if (
    typeof value.name !== "string" ||
    !value.name.trim() ||
    value.name.trim().length > 80
  )
    throw new Error("Give the project a name from 1 to 80 characters.");
  if (
    typeof value.source !== "string" ||
    bytes(value.source) > (value.kind === "c" ? 7500 : 65536)
  )
    throw new Error(
      value.kind === "c"
        ? "C source must fit 7500 bytes."
        : "Assembly source must fit 64 KiB.",
    );
  const result =
    REGISTERS[
      registerIndex(value.result ?? (value.kind === "c" ? "a0" : "t2"))
    ];
  if (!result) throw new Error("Choose a valid result register.");
  const inputs = {};
  if (value.inputs !== undefined && !plain(value.inputs))
    throw new Error(
      "Starting registers must be a map of register names to values.",
    );
  for (const [name, text] of Object.entries(value.inputs ?? {})) {
    const number = registerIndex(name),
      canonical = REGISTERS[number];
    if (number < 0 || [0, 2, 3, 4].includes(number))
      throw new Error(
        `Starting register ${name} is unavailable. Use working registers; xv6 supplies sp, gp and tp, and zero is fixed.`,
      );
    if (Object.hasOwn(inputs, canonical))
      throw new Error(`Starting register ${canonical} was specified twice.`);
    inputs[canonical] = parseRegisterValue(text);
  }
  if (
    !Array.isArray(value.data ?? []) ||
    (value.data ?? []).length > 64 ||
    Array.from(value.data ?? []).some(
      (n) => !Number.isInteger(n) || n < 0 || n > 255,
    )
  )
    throw new Error("Use up to 64 data bytes, each from 0 to 255.");
  if (value.memory !== undefined && !["data", "stack"].includes(value.memory))
    throw new Error("Choose data or stack memory.");
  if (
    value.kind === "program" &&
    (Object.keys(inputs).length || value.data?.length)
  )
    throw new Error(
      "Complete programs set their own registers and data in their source.",
    );
  if (
    value.target !== undefined &&
    (value.target !== "bare-metal" || value.kind !== "program")
  )
    throw new Error("The bare-metal target requires a complete assembly program.");
  const project = {
    format: PROJECT_FORMAT,
    version: 1,
    id: freshId
      ? id()
      : typeof value.id === "string" && /^[a-zA-Z0-9-]{1,80}$/.test(value.id)
        ? value.id
        : id(),
    name: value.name.trim(),
    kind: value.kind,
    ...(value.target ? { target: value.target } : {}),
    source: value.source,
    inputs,
    data: [...(value.data ?? [])],
    memory: value.memory ?? "data",
    result,
  };
  if (value.pins !== undefined) {
    if (
      !Array.isArray(value.pins) ||
      value.pins.length > 32 ||
      value.pins.some(
        (name) => typeof name !== "string" || registerIndex(name) < 0,
      )
    )
      throw new Error(
        "Pinned registers must be a list of up to 32 integer register names.",
      );
    project.pins = [
      ...new Set(value.pins.map((name) => REGISTERS[registerIndex(name)])),
    ];
  }
  if (value.origin !== undefined) {
    if (
      !plain(value.origin) ||
      typeof value.origin.id !== "string" ||
      !/^[a-z][a-z0-9-]{0,79}$/.test(value.origin.id) ||
      typeof value.origin.title !== "string" ||
      value.origin.title.length > 120 ||
      !["example", "exercise"].includes(value.origin.activity)
    )
      throw new Error("The source lesson information is invalid.");
    project.origin = {
      id: value.origin.id,
      title: value.origin.title,
      activity: value.origin.activity,
    };
    if (typeof value.origin.caseName === "string")
      project.origin.caseName = value.origin.caseName.slice(0, 120);
  }
  if (value.memoryLabels !== undefined) {
    if (
      !Array.isArray(value.memoryLabels) ||
      value.memoryLabels.length > 64 ||
      value.memoryLabels.some(
        (label) =>
          !plain(label) ||
          !Number.isInteger(label.offset) ||
          label.offset < 0 ||
          label.offset > 63 ||
          typeof label.label !== "string" ||
          label.label.length > 120,
      )
    )
      throw new Error("The data labels are invalid.");
    project.memoryLabels = value.memoryLabels.map(({ offset, label }) => ({
      offset,
      label,
    }));
  }
  return project;
}
export function newProject(kind = "asm", name = "Untitled project") {
  const starters = {
    asm: "li t0, 7\nli t1, 5\nadd t2, t0, t1\n",
    c: "long lesson(long a, long b) {\n    return a + b;\n}\n",
    program:
      ".text\n.global _start\n_start:\n    li t0, 7\n    li t1, 5\n    add t2, t0, t1\n    li a0, 0\n    li a7, 2\n    ecall\n",
  };
  return normaliseProject({
    format: PROJECT_FORMAT,
    version: 1,
    name,
    kind,
    source: starters[kind],
    inputs: kind === "c" ? { a0: "7", a1: "5" } : {},
    data: [],
    memory: "data",
    result: kind === "c" ? "a0" : "t2",
    pins: kind === "c" ? ["a0", "a1"] : ["t0", "t1", "t2"],
  });
}
export function fromLesson(lesson, source, fixture = {}, activity = "example") {
  return normaliseProject({
    format: PROJECT_FORMAT,
    version: 1,
    name: lesson.title + (activity === "exercise" ? " · exercise" : ""),
    kind: lesson.kind ?? (lesson.language === "c" ? "c" : "asm"),
    target: lesson.target,
    source,
    inputs: { ...lesson.inputs, ...fixture.inputs },
    data: fixture.data ?? lesson.data ?? [],
    memory: lesson.memory ?? "data",
    result: lesson.result,
    pins: lesson.observe ?? [lesson.result],
    memoryLabels: lesson.memoryLabels,
    origin: {
      id: lesson.id,
      title: lesson.title,
      activity,
      ...(fixture.name ? { caseName: fixture.name } : {}),
    },
  });
}
export function projectContext(project) {
  return {
    ...project,
    language: project.kind === "c" ? "c" : "asm",
    sourceName: project.kind === "c" ? "main.c" : "main.s",
    module: "playground",
    starter: project.source,
    observe: [...REGISTERS],
    ui: { stack: true, signed: true, hex: true },
  };
}
export function serialiseProject(project) {
  return JSON.stringify(normaliseProject(project), null, 2) + "\n";
}
export function importProject(text, { freshId = true } = {}) {
  if (typeof text !== "string" || bytes(text) > MAX_PROJECT_BYTES)
    throw new Error(
      "The project file is too large. Use at most 160,000 bytes.",
    );
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid project JSON.");
  }
  return normaliseProject(value, { freshId });
}
export function transferFragment(project) {
  return "#project=" + encodeURIComponent(serialiseProject(project));
}
export function readTransfer(fragment) {
  if (!fragment.startsWith("#project=")) return null;
  if (fragment.length > MAX_PROJECT_BYTES * 3 + 20)
    throw new Error(
      "The transferred project is too large. Export and import a project file instead.",
    );
  let text;
  try {
    text = decodeURIComponent(fragment.slice(9));
  } catch {
    throw new Error("The transferred project link is malformed.");
  }
  return importProject(text);
}
export function parseSetupRegisters(text) {
  const inputs = {};
  for (const [i, line] of text.split("\n").entries()) {
    if (!line.trim()) continue;
    const match = line.match(/^\s*(\w+)\s*=\s*(.*?)\s*$/);
    if (!match)
      throw new Error(`Starting register line ${i + 1}: use name = value.`);
    const canonical = REGISTERS[registerIndex(match[1])];
    if (!canonical)
      throw new Error(
        `Starting register line ${i + 1}: ${match[1]} is not an integer register.`,
      );
    if (canonical && Object.hasOwn(inputs, canonical))
      throw new Error(`Starting register ${canonical} was specified twice.`);
    inputs[canonical ?? match[1]] = parseRegisterValue(match[2]);
  }
  return normaliseProject({ ...newProject(), inputs }).inputs;
}
export function parseSetupData(text) {
  const tokens = text.trim() ? text.trim().split(/[\s,_]+/) : [];
  if (
    tokens.length > 64 ||
    tokens.some((token) => !/^(?:0x)?[0-9a-f]{2}$/i.test(token))
  )
    throw new Error("Use up to 64 hexadecimal bytes, such as 07 00 FF.");
  return tokens.map((token) => parseInt(token.replace(/^0x/i, ""), 16));
}
// Each project has its own key, so a lesson opened in another tab cannot
// disappear when the original workspace saves its existing project.
export const PROJECT_KEY_PREFIX = LIBRARY_KEY + ":";
export class ProjectStore {
  constructor(storage) {
    this.storage = storage;
    this.saved = Boolean(storage);
    this.projects = [];
    this.active = null;
    this.undo = null;
    this.loadError = "";
    this.baseline = new Map();
    this.dirty = new Set();
    this.deleted = new Set();
    try {
      const raw = storage?.getItem(LIBRARY_KEY);
      if (raw) {
        if (bytes(raw) > MAX_PROJECT_BYTES * MAX_PROJECTS)
          throw new Error("Saved workspace is too large.");
        const metadata = JSON.parse(raw);
        if (!plain(metadata) || metadata.version !== 1)
          throw new Error("Unsupported saved workspace.");
        this.active =
          typeof metadata.active === "string" ? metadata.active : null;
        // Migrate the initial aggregate development format without discarding it.
        if (Array.isArray(metadata.projects)) {
          if (metadata.projects.length > MAX_PROJECTS)
            throw new Error("Too many saved projects.");
          this.projects = metadata.projects.map((value) =>
            normaliseProject(value),
          );
          for (const project of this.projects) this.dirty.add(project.id);
        }
      }
      this.refresh();
      if (!this.projects.some((project) => project.id === this.active))
        this.active = this.projects[0]?.id ?? null;
    } catch {
      this.loadError =
        "Saved projects could not be read. Import an exported project file to recover them.";
      this.saved = false;
      this.storage = null;
    }
  }
  documents() {
    const result = new Map();
    if (!this.storage) return result;
    const keys = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(PROJECT_KEY_PREFIX)) keys.push(key);
    }
    for (const key of keys) {
      try {
        const raw = this.storage.getItem(key),
          project = importProject(raw, { freshId: false });
        if (key !== PROJECT_KEY_PREFIX + project.id)
          throw new Error("Project key mismatch.");
        result.set(project.id, { project, raw });
      } catch {
        this.loadError =
          "Some saved projects could not be read. Their stored files were kept; import a backup to recover them.";
      }
    }
    return result;
  }
  refresh() {
    const documents = this.documents();
    for (const [projectId, { project, raw }] of documents) {
      if (this.deleted.has(projectId) || this.dirty.has(projectId)) continue;
      const index = this.projects.findIndex((value) => value.id === projectId);
      if (index < 0) {
        this.projects.push(project);
        this.baseline.set(projectId, raw);
      } else if (projectId !== this.active) {
        this.projects[index] = project;
        this.baseline.set(projectId, raw);
      }
    }
    this.projects = this.projects.filter(
      (project) =>
        project.id === this.active ||
        this.dirty.has(project.id) ||
        !this.baseline.has(project.id) ||
        documents.has(project.id),
    );
    return documents;
  }
  persist() {
    if (!this.storage) {
      this.saved = false;
      return false;
    }
    try {
      const documents = this.refresh();
      for (const projectId of this.dirty) {
        const project = this.projects.find((value) => value.id === projectId);
        if (!project) continue;
        const raw = JSON.stringify(project),
          remote = documents.get(projectId);
        if (
          remote &&
          remote.raw !== this.baseline.get(projectId) &&
          JSON.stringify(remote.project) !== raw
        ) {
          if (this.projects.length >= MAX_PROJECTS)
            throw new Error(
              "Export a project before resolving simultaneous edits.",
            );
          const backup = normaliseProject(
            {
              ...remote.project,
              name: remote.project.name.slice(0, 65) + " (other tab)",
            },
            { freshId: true },
          );
          const backupRaw = JSON.stringify(backup);
          this.storage.setItem(PROJECT_KEY_PREFIX + backup.id, backupRaw);
          this.projects.push(backup);
          this.baseline.set(backup.id, backupRaw);
        }
        this.storage.setItem(PROJECT_KEY_PREFIX + projectId, raw);
        this.baseline.set(projectId, raw);
      }
      for (const projectId of this.deleted) {
        this.storage.removeItem(PROJECT_KEY_PREFIX + projectId);
        this.baseline.delete(projectId);
      }
      this.storage.setItem(
        LIBRARY_KEY,
        JSON.stringify({ version: 1, active: this.active }),
      );
      this.dirty.clear();
      this.deleted.clear();
      this.saved = true;
    } catch {
      this.saved = false;
    }
    return this.saved;
  }
  get current() {
    return this.projects.find((project) => project.id === this.active) ?? null;
  }
  add(project) {
    this.refresh();
    if (this.projects.length >= MAX_PROJECTS)
      throw new Error(
        `You have ${MAX_PROJECTS} projects. Export and remove one before adding another.`,
      );
    const next = normaliseProject(project, {
      freshId: this.projects.some((value) => value.id === project.id),
    });
    const base = next.name;
    let number = 2;
    while (this.projects.some((value) => value.name === next.name))
      next.name = `${base.slice(0, 70)} (${number++})`;
    this.projects.push(next);
    this.active = next.id;
    this.dirty.add(next.id);
    this.persist();
    return next;
  }
  update(project) {
    const next = normaliseProject(project),
      index = this.projects.findIndex((value) => value.id === next.id);
    if (index < 0)
      throw new Error("The project is no longer in this workspace.");
    if (JSON.stringify(this.projects[index]) !== JSON.stringify(next))
      this.dirty.add(next.id);
    this.projects[index] = next;
    this.persist();
    return next;
  }
  select(projectId) {
    this.refresh();
    if (!this.projects.some((value) => value.id === projectId))
      throw new Error("Choose an available project.");
    this.active = projectId;
    this.persist();
    return this.current;
  }
  remove() {
    const index = this.projects.findIndex(
      (project) => project.id === this.active,
    );
    if (index < 0) return;
    // An explicit delete must not silently discard a newer edit from another tab.
    const remote = this.documents().get(this.active);
    if (
      remote &&
      remote.raw !== this.baseline.get(this.active) &&
      JSON.stringify(remote.project) !== JSON.stringify(this.current)
    ) {
      if (this.projects.length >= MAX_PROJECTS)
        throw new Error(
          "Export a project before resolving simultaneous edits.",
        );
      const backup = normaliseProject(
        {
          ...remote.project,
          name: remote.project.name.slice(0, 65) + " (other tab)",
        },
        { freshId: true },
      );
      this.projects.push(backup);
      this.dirty.add(backup.id);
    }
    this.undo = { project: this.current, index };
    this.deleted.add(this.active);
    this.dirty.delete(this.active);
    this.projects.splice(index, 1);
    this.active =
      this.projects[Math.min(index, this.projects.length - 1)]?.id ?? null;
    this.persist();
  }
  restoreRemoved() {
    if (!this.undo) return null;
    this.refresh();
    if (this.projects.length >= MAX_PROJECTS)
      throw new Error("Remove a project before restoring this one.");
    const { project, index } = this.undo;
    this.projects.splice(Math.min(index, this.projects.length), 0, project);
    this.active = project.id;
    this.undo = null;
    this.deleted.delete(project.id);
    this.dirty.add(project.id);
    this.persist();
    return project;
  }
}
