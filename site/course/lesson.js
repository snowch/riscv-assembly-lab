// Copyright © 2026 Christopher Snow
import { createWorkbench } from "./workbench-controller.js";
import { setupTheme, renderCompletion } from "./home.js";
import { setupCourseNavigation } from "./navigation.js";
import { createPlaygroundLayout } from "../playground/layout.js";
import { mountProjects } from "../playground/app.js";
import projectConfig from "./project-tools-config.js";
setupTheme();
renderCompletion();
setupCourseNavigation();
const lesson = JSON.parse(document.getElementById("lesson-data").textContent);
lesson.kind ??= lesson.language === "c" ? "c" : "asm";
const requiredMemory = lesson.memory;
lesson.memory ??= "data";
const host = document.createElement("div");
host.className = "shared-project-tools";
host.innerHTML = projectConfig.markup;
for (const link of host.querySelectorAll('a[href^="../"]'))
  link.setAttribute("href", "../" + link.getAttribute("href"));
document.getElementById("workbench").closest("main").append(host);
const layout = createPlaygroundLayout(projectConfig.copy.workspace);
let manager;
const controller = createWorkbench(lesson, {
  onView: layout.update,
  onDraft: (...args) => manager?.onDraft(...args),
  onPinsChange: (pins) => manager?.onPins(pins),
  onSnapshot(snapshot) {
    if (snapshot.lesson.module === "playground") return;
    manager?.refresh();
  },
});

layout.bindPin(controller.togglePin);
layout.bindWorkspaceClose(controller.closeWorkspace);
manager = mountProjects(projectConfig, { layout, controller, lesson });

if (lesson.module === "debugging") layout.select("debugger");
else if (requiredMemory) layout.select("memory");
