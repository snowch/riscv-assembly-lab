// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { fillSource, loadExercise, openTools } from "./editor-helpers.js";
import {
  newProject,
  serialiseProject,
  LIBRARY_KEY,
  PROJECT_KEY_PREFIX,
} from "../../site/playground/projects.js";
const go = async (page) => {
  await page.goto("/playground/");
  await expect(page.locator("#run")).toBeEnabled();
};
const finished = (page) =>
  expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
async function example(page, id) {
  await openTools(page, "projects");
  await page.locator(".project-examples > summary").click();
  await page.locator("#project-example").selectOption("example-" + id);
  await page.locator("#open-example").click();
}
async function actions(page) {
  await openTools(page, "projects");
  const menu = page.locator(".project-actions");
  if (!(await menu.evaluate((el) => el.open)))
    await menu.locator(":scope > summary").click();
}
async function rename(page, name) {
  await actions(page);
  await page.locator("#project-name").fill(name);
  await page.locator("#project-name").press("Enter");
}
async function importFile(page, payload) {
  await actions(page);
  const chooser = page.waitForEvent("filechooser");
  await page.locator("#import-file").click();
  await (await chooser).setFiles(payload);
}

test("standalone workspace runs assembly, C and complete programs with real observations", async ({
  page,
}) => {
  test.setTimeout(120000);
  await go(page);
  await expect(
    page.locator("#prediction,#challenge,#lesson-complete,.lesson-navigation"),
  ).toHaveCount(0);
  await expect(page.locator("#registers .register")).toHaveCount(32);
  await page.locator("#run").click();
  await finished(page);
  await expect(page.locator("#t2-decimal")).toHaveText("12");
  await example(page, "c-return-values");
  await expect(page.locator(".source-code-editor")).toHaveClass(/language-c/);
  await fillSource(
    page,
    "long lesson(long a, long b) {\n return a * 3 + b;\n}\n",
  );
  await openTools(page, "setup");
  await page.locator("#project-inputs").fill("a0 = 7\na1 = 5");
  await page.locator("#setup-form button[type=submit]").click();
  await openTools(page, "setup");
  await page.locator("#run").click();
  await finished(page);
  await expect(page.locator("#a0-decimal")).toHaveText("26");
  await example(page, "hello-world");
  await page.locator("#run").click();
  await finished(page);
  await expect(page.locator("#console")).toContainText("Hello, RISC-V!");
  await expect(page.locator("#t2-decimal")).toHaveText("—");
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  await openTools(page, "registers");
  await openTools(page, "stack");
  await expect(page.locator("#debug-stack tbody tr")).toHaveCount(8);
  await openTools(page, "memory");
  await page.locator("#continue").click();
  await finished(page);
  await expect(page.locator("#observation-note")).toBeVisible();
  await expect(page.locator("#observation-note")).toContainText("not");
  await openTools(page, "registers");
  await page.locator(".lab-help > summary").click();
  await expect(page.locator("#entry-copy")).not.toContainText("supplies entry");
});

test("project drafts, copying, removal and imports preserve source and setup exactly", async ({
  page,
}) => {
  await go(page);
  await rename(page, "Sensor project");
  const source = "add t2, t0, t1\n";
  await fillSource(page, source);
  await openTools(page, "setup");
  await page.locator("#project-inputs").fill("t0 = 0xffffffffffffffff\nt1 = 2");
  await page.locator("#project-bytes").fill("01 FF");
  await page.locator("#setup-form button[type=submit]").click();
  await openTools(page, "setup");
  await actions(page);
  const downloadEvent = page.waitForEvent("download");
  await page.locator("#export-project").click();
  const download = await downloadEvent;
  const exported = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(exported.source).toBe(source);
  expect(exported.inputs.t0).toBe("0xffffffffffffffff");
  expect(exported.data).toEqual([1, 255]);
  await actions(page);
  await page.locator("#copy-project").click();
  await expect(page.locator("#project-picker option")).toHaveCount(2);
  await fillSource(page, "li t2, 42\n");
  await actions(page);
  await page.locator("#delete-project").click();
  await expect(page.locator("#source")).toHaveValue(source);
  await openTools(page, "projects");
  await page.locator("#undo-delete").click();
  await expect(page.locator("#source")).toHaveValue("li t2, 42\n");
  await page.reload();
  await expect(page.locator("#source")).toHaveValue("li t2, 42\n");
  const customC = {
    ...newProject("c", "Imported C"),
    source: "long lesson(long a,long b){return a-b;}\n",
    result: "t0",
  };
  await importFile(page, {
    name: "custom.riscv.json",
    mimeType: "application/json",
    buffer: Buffer.from(serialiseProject(customC)),
  });
  await page.locator("#import-project-form button[type=submit]").click();
  await expect(page.locator("#source")).toHaveValue(customC.source);
  await expect(page.locator("#t0-decimal").locator("..")).toHaveClass(
    /destination/,
  );
  await expect(page.locator("#project-picker option")).toHaveCount(3);
});

test("invalid setup and imports leave a paused program unchanged; source import is explicit", async ({
  page,
}) => {
  test.setTimeout(90000);
  await go(page);
  await fillSource(page, "li t0, 9\nli t1, 10\nadd t2,t0,t1\n");
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  const pc = await page.locator("#step-location").textContent();
  await openTools(page, "setup");
  await page.locator("#project-inputs").fill("sp = 1");
  await page.locator("#setup-form button[type=submit]").click();
  await expect(page.locator("#setup-error")).toContainText("unchanged");
  await expect(page.locator("#step-location")).toHaveText(pc);
  await expect(page.locator("#state-badge")).toHaveText("Paused");
  await importFile(page, {
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{broken"),
  });
  await expect(page.locator("#project-message")).toContainText("unchanged");
  await expect(page.locator("#state-badge")).toHaveText("Paused");
  const raw = ".text\n.global _start\n_start:\n li a0,0\n li a7,2\n ecall\n";
  await importFile(page, {
    name: "raw.s",
    mimeType: "text/plain",
    buffer: Buffer.from(raw),
  });
  await expect(page.locator("#import-project-kind")).toHaveValue("program");
  await page.locator("#import-project-dialog [data-close-dialog]").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused");
  await expect(page.locator("#step-location")).toHaveText(pc);
  await page.locator("#continue").click();
  await finished(page);
  await expect(page.locator("#t2-decimal")).toHaveText("19");
});

test("lesson exercise copy uses selected case inputs and restores the lesson draft", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/lessons/addition/");
  await expect(page.locator("#run")).toBeEnabled();
  await loadExercise(page);
  await page.locator("#case-picker button").nth(1).click();
  const selected = await page
    .locator("#case-picker button[aria-pressed=true]")
    .textContent();
  const code = "add t2,t0,t1\n";
  await fillSource(page, code);
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  await expect(page.locator("#open-playground")).toHaveCount(0);
  await openTools(page, "projects");
  await actions(page);
  await page.locator("#copy-project").click();
  await expect(page.locator("#return-lesson")).toBeVisible();
  await expect(page.locator("#source")).toHaveValue(code);
  await expect(page.locator("#state-badge")).toHaveText("Ready");
  await expect(page.locator("#project-origin")).toContainText(selected);
  await openTools(page, "setup");
  const setup = await page.locator("#project-inputs").inputValue();
  expect(setup).toContain("t0 = 0x0000000000000000");
  expect(setup).toContain("t1 = 0x0000000000000009");
  await page.locator("#run").click();
  await finished(page);
  await expect(page.locator("#t2-decimal")).toHaveText("9");
  await fillSource(page, "li t2, 88\n");
  await page.locator("#run").click();
  // Wait for this run's result, not the preceding run's Finished badge.
  await expect(page.locator("#t2-decimal")).toHaveText("88", {
    timeout: 45000,
  });
  await finished(page);
  await page.locator("#return-lesson").click();
  await expect(page.locator("#editor-context")).toHaveText("Exercise");
  await expect(page.locator("#source")).toHaveValue(code);
  await expect(
    page.locator("#case-picker button[aria-pressed=true]"),
  ).toHaveText(selected);
  await expect(page.locator("#state-badge")).toHaveText("Ready");
  await page.locator("#run").click();
  await finished(page);
  await expect(page.locator("#t2-decimal")).toHaveText("9");
});

test("multiple tabs keep newer saved projects when an untouched editor switches projects", async ({
  page,
  context,
}) => {
  await go(page);
  const firstId = await page.locator("#project-picker").inputValue();
  await actions(page);
  await page.locator("#copy-project").click();
  const secondId = await page.locator("#project-picker").inputValue();
  await openTools(page, "projects");
  await page.locator("#project-picker").selectOption(firstId);
  const second = await context.newPage();
  await second.goto("/playground/");
  await expect(second.locator("#run")).toBeEnabled();
  await fillSource(second, "li t2, 99\n");
  await openTools(page, "projects");
  await page.locator("#project-picker").selectOption(secondId);
  const stored = await page.evaluate(
    ({ prefix, id }) => JSON.parse(localStorage.getItem(prefix + id)),
    { prefix: PROJECT_KEY_PREFIX, id: firstId },
  );
  expect(stored.source).toBe("li t2, 99\n");
  await page.reload();
  await openTools(page, "projects");
  await page.locator("#project-picker").selectOption(firstId);
  await expect(page.locator("#source")).toHaveValue("li t2, 99\n");
  await second.close();
});

test("tab-only projects remain usable when browser storage is blocked", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage disabled");
      },
    }),
  );
  await go(page);
  await expect(page.locator("#save-state")).toContainText("tab-only");
  await fillSource(page, "li t2, 42\n");
  await example(page, "sum-array");
  await openTools(page, "projects");
  await page
    .locator("#project-picker")
    .selectOption({ label: "Register addition" });
  await expect(page.locator("#source")).toHaveValue("li t2, 42\n");
  await actions(page);
  const event = page.waitForEvent("download");
  await page.locator("#export-project").click();
  const download = await event;
  expect(JSON.parse(await readFile(await download.path(), "utf8")).source).toBe(
    "li t2, 42\n",
  );
});

test("project menus are exclusive; editor and compact observations survive fullscreen", async ({
  page,
}, info) => {
  await go(page);
  await openTools(page, "projects");
  const actionsMenu = page.locator(".project-actions"),
    examples = page.locator(".project-examples");
  await actionsMenu.locator(":scope > summary").focus();
  await page.keyboard.press("Enter");
  await expect(actionsMenu).toHaveJSProperty("open", true);
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Enter");
  await expect(examples).toHaveJSProperty("open", true);
  await expect(actionsMenu).toHaveJSProperty("open", false);
  await page.keyboard.press("Escape");
  await expect(examples.locator(":scope > summary")).toBeFocused();
  if (info.project.name === "desktop") {
    const divider = page.locator("#workspace-divider");
    await divider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(divider).toHaveAttribute("aria-valuenow", "57");
  }
  await page.locator("#fullscreen-workspace").click();
  await expect(page.locator(".workbench-dialog")).toBeVisible();
  if (info.project.name === "desktop") {
    const editor = await page.locator(".editor-panel").boundingBox(),
      inspector = await page.locator(".phone-observation").boundingBox();
    expect(inspector.x).toBeGreaterThan(editor.x + editor.width);
    expect(
      await page
        .locator("#registers .register")
        .first()
        .evaluate((el) => getComputedStyle(el).display),
    ).toBe("grid");
  }
  await page.locator("#fullscreen-workspace").click();
  await expect(page.locator(".workbench-dialog")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("stepping a complete program through its exit waits for xv6 completion", async ({
  page,
}) => {
  test.setTimeout(90000);
  await go(page);
  const source = ".text\n.global _start\n_start:\n li a0,0\n li a7,2\n ecall\n";
  const project = { ...newProject("program", "Step through exit"), source };
  await importFile(page, {
    name: "exit.riscv.json",
    mimeType: "application/json",
    buffer: Buffer.from(serialiseProject(project)),
  });
  await page.locator("#import-project-form button[type=submit]").click();
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  for (let i = 0; i < 2; i++) {
    await page.locator("#step").click();
    await expect(page.locator("#state-badge")).toHaveText("Paused");
  }
  await page.locator("#step").click();
  await finished(page);
  await expect(page.locator("#observation-note")).toContainText("not");
  await expect(page.locator("#diagnostic-lines")).not.toContainText(
    "Execution left the user program",
  );
});

test("lesson footers omit the redundant playground link and projects remain accessible", async ({
  page,
}) => {
  test.setTimeout(90000);
  const response = await page.request.get("/course/catalog.json");
  const lessons = await response.json();
  for (const id of new Set([
    ...lessons.map((lesson) => lesson.id),
    "hello-world",
  ])) {
    const lesson = await page.request.get(`/lessons/${id}/`);
    expect(lesson.ok()).toBe(true);
    expect(await lesson.text(), id).not.toContain('id="open-playground"');
  }
  await page.goto("/lessons/addition/");
  await expect(page.locator("#run")).toBeEnabled();
  await openTools(page, "projects");
  await actions(page);
  await expect(page.locator("#copy-project")).toBeVisible();
  await page.goto("/");
  await page
    .getByRole("link", { name: "Open the playground", exact: true })
    .click();
  await expect(page).toHaveURL(/\/playground\/$/);
  await expect(page.locator("#run")).toBeEnabled();
  await expect(page.locator("#workspace-tools-toggle")).toBeEnabled();
  await page.goto("/lessons/hello-world/");
  await expect(page.locator("#run")).toBeEnabled();
  const original = await page.locator("#source").inputValue();
  const edited = original.replace("Hello, RISC-V!", "My own message!");
  await fillSource(page, edited);
  await page.locator("#run").click();
  await expect(page.locator("#console")).toContainText("My own message!", {
    timeout: 45000,
  });
  await page.reload();
  await expect(page.locator("#source")).toHaveValue(edited);
  await expect(page.locator("#open-playground")).toHaveCount(0);
});
