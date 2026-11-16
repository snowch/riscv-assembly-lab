// Copyright © 2026 Christopher Snow
import test from "node:test";
import assert from "node:assert/strict";
import {
  ProjectStore,
  newProject,
  normaliseProject,
  fromLesson,
  projectContext,
  serialiseProject,
  importProject,
  transferFragment,
  readTransfer,
  parseSetupRegisters,
  parseSetupData,
  PROJECT_KEY_PREFIX,
  LIBRARY_KEY,
  MAX_PROJECT_BYTES,
} from "../site/playground/projects.js";
class Storage {
  constructor() {
    this.map = new Map();
  }
  get length() {
    return this.map.size;
  }
  key(i) {
    return [...this.map.keys()][i] ?? null;
  }
  getItem(k) {
    return this.map.get(k) ?? null;
  }
  setItem(k, v) {
    this.map.set(k, String(v));
  }
  removeItem(k) {
    this.map.delete(k);
  }
}
test("project roundtrip retains exact source, kind and 64-bit starting setup", () => {
  const project = normaliseProject({
    ...newProject(),
    name: "A project",
    source: "add t2, t0, t1\n",
    inputs: { x5: "0xFFFF_FFFF_FFFF_FFFF", t1: "-9223372036854775808" },
    data: [0, 1, 254, 255],
    memory: "stack",
  });
  const imported = importProject(serialiseProject(project), { freshId: false });
  assert.deepEqual(imported, project);
  assert.equal(imported.inputs.t0, "0xffffffffffffffff");
  assert.equal(imported.inputs.t1, "0x8000000000000000");
  assert.equal(projectContext(imported).observe.length, 32);
  assert.equal(projectContext(imported).language, "asm");
});
test("lesson transfer contains current code and selected fixture inputs/data without answer material", () => {
  const lesson = {
    id: "addition",
    title: "Add registers",
    starter: "initial",
    language: "asm",
    inputs: { t0: "1", t1: "2" },
    data: [1],
    memory: "data",
    result: "t2",
    challenge: { reference: "secret answer" },
    prediction: { answer: 3 },
  };
  const project = fromLesson(
    lesson,
    "sub t2,t0,t1\n",
    { name: "Boundary case", inputs: { t0: "-1" }, data: [255] },
    "exercise",
  );
  assert.equal(project.inputs.t0, "0xffffffffffffffff");
  assert.equal(project.inputs.t1, "0x0000000000000002");
  assert.deepEqual(project.data, [255]);
  assert.equal(project.source, "sub t2,t0,t1\n");
  assert.equal(project.origin.caseName, "Boundary case");
  assert.equal(project.origin.activity, "exercise");
  assert.ok(!serialiseProject(project).includes("secret answer"));
  const received = readTransfer(transferFragment(project));
  assert.notEqual(received.id, project.id);
  assert.equal(received.source, project.source);
  assert.equal(readTransfer("#other"), null);
  assert.throws(() => readTransfer("#project=%GG"), /malformed/);
  assert.throws(
    () => readTransfer("#project=" + encodeURIComponent("{}")),
    /supported/,
  );
});
test("register and byte setup reject ambiguous or reserved inputs and preserve exact patterns", () => {
  assert.deepEqual(parseSetupRegisters("t0 = 0b1111\na0 = -1\n"), {
    t0: "0x000000000000000f",
    a0: "0xffffffffffffffff",
  });
  for (const text of [
    "sp = 1",
    "gp = 1",
    "zero = 1",
    "x0 = 1",
    "tp = 1",
    "t0=1\nx5=2",
    "unknown=1",
    "__proto__=2",
    "t0 = 18446744073709551616",
    "t0 = -9223372036854775809",
    "not an assignment",
  ])
    assert.throws(() => parseSetupRegisters(text), text);
  assert.deepEqual(parseSetupData("07 00 FF,0x10"), [7, 0, 255, 16]);
  assert.deepEqual(parseSetupData(""), []);
  for (const text of ["0", "100", "GG", Array(65).fill("00").join(" ")])
    assert.throws(() => parseSetupData(text), text);
});
test("untrusted project metadata, versions and oversized source are rejected before use", () => {
  const project = newProject();
  for (const bad of [
    { ...project, version: 2 },
    { ...project, format: "other" },
    { ...project, kind: "constructor" },
    { ...project, kind: "__proto__" },
    { ...project, result: "none" },
    { ...project, data: [null] },
    { ...project, data: Array(65).fill(0) },
    { ...project, inputs: { sp: "1" } },
    {
      ...project,
      origin: { id: "../../bad", title: "bad", activity: "example" },
    },
  ])
    assert.throws(() => normaliseProject(bad));
  assert.throws(
    () => normaliseProject({ ...project, source: "🙂".repeat(16385) }),
    /64 KiB/,
  );
  assert.throws(
    () => normaliseProject({ ...newProject("c"), source: " ".repeat(7501) }),
    /7500/,
  );
  assert.throws(
    () => importProject("x".repeat(MAX_PROJECT_BYTES + 1)),
    /large/,
  );
  assert.throws(() => importProject("{bad"), /JSON/);
  assert.throws(
    () => normaliseProject({ ...newProject("program"), data: [1] }),
    /own registers/,
  );
});
test("project storage saves, reloads, removes and restores a named project", () => {
  const storage = new Storage(),
    store = new ProjectStore(storage);
  const first = store.add(newProject("asm", "First"));
  const second = store.add(newProject("c", "Second"));
  store.update({
    ...second,
    source: "long lesson(long a,long b){return a-b;}",
  });
  store.select(first.id);
  const reloaded = new ProjectStore(storage);
  assert.equal(reloaded.current.id, first.id);
  assert.equal(reloaded.projects.length, 2);
  reloaded.select(second.id);
  reloaded.remove();
  assert.equal(new ProjectStore(storage).projects.length, 1);
  reloaded.restoreRemoved();
  assert.equal(new ProjectStore(storage).projects.length, 2);
  assert.match(reloaded.current.source, /a-b/);
});
test("separate workspace tabs cannot drop each other’s new projects", () => {
  const storage = new Storage(),
    a = new ProjectStore(storage);
  const first = a.add(newProject("asm", "First"));
  const b = new ProjectStore(storage),
    second = b.add(newProject("asm", "From a lesson"));
  a.update({ ...first, source: "li t0, 99\n" });
  const loaded = new ProjectStore(storage);
  assert.equal(loaded.projects.length, 2);
  assert.equal(
    loaded.projects.find((p) => p.id === second.id).name,
    "From a lesson",
  );
  assert.equal(
    loaded.projects.find((p) => p.id === first.id).source,
    "li t0, 99\n",
  );
});
test("simultaneous changes to one project keep the other tab’s source as a separate recovery copy", () => {
  const storage = new Storage(),
    a = new ProjectStore(storage);
  a.add(newProject("asm", "Shared"));
  const b = new ProjectStore(storage),
    old = b.current;
  a.update({ ...a.current, source: "li t0, 11\n" });
  b.update({ ...old, source: "li t0, 22\n" });
  const reloaded = new ProjectStore(storage);
  assert.deepEqual(
    new Set(reloaded.projects.map((p) => p.source)),
    new Set(["li t0, 11\n", "li t0, 22\n"]),
  );
  assert.equal(reloaded.projects.length, 2);
});
test("blocked/quota storage retains tab projects and never overwrites unreadable saved data", () => {
  const store = new ProjectStore(null),
    p = store.add(newProject());
  store.update({ ...p, source: "li t0, 9" });
  assert.equal(store.current.source, "li t0, 9");
  assert.equal(store.saved, false);
  const storage = new Storage();
  storage.setItem(LIBRARY_KEY, "broken");
  const corrupt = new ProjectStore(storage);
  corrupt.add(newProject());
  assert.equal(storage.getItem(LIBRARY_KEY), "broken");
  assert.ok(corrupt.loadError);
  const limited = new Storage(),
    persistent = new ProjectStore(limited);
  persistent.add(newProject());
  limited.setItem = () => {
    throw new Error("quota");
  };
  persistent.update({ ...persistent.current, source: "li t0, 10" });
  assert.equal(persistent.current.source, "li t0, 10");
  assert.equal(persistent.saved, false);
  const brokenDoc = new Storage();
  brokenDoc.setItem(PROJECT_KEY_PREFIX + "broken", '{"version":1}');
  const mixed = new ProjectStore(brokenDoc);
  mixed.add(newProject());
  assert.ok(mixed.loadError);
  assert.equal(
    brokenDoc.getItem(PROJECT_KEY_PREFIX + "broken"),
    '{"version":1}',
  );
});

test("deleting a remotely edited project retains the other tab’s newer source", () => {
  const storage = new Storage(),
    a = new ProjectStore(storage);
  a.add(newProject("asm", "Shared"));
  const b = new ProjectStore(storage);
  b.update({ ...b.current, source: "li t2, 99\n" });
  a.remove();
  const recovered = new ProjectStore(storage);
  assert.equal(recovered.projects.length, 1);
  assert.equal(recovered.current.source, "li t2, 99\n");
  a.restoreRemoved();
  assert.equal(new ProjectStore(storage).projects.length, 2);
});
