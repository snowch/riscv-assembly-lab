// Copyright © 2026 Christopher Snow
import { mountWorkbench } from "./workbench.js";
import { newProject, normaliseProject } from "./playground/projects.js";
import { bindProjectHandoff } from "./playground/handoff.js";
let currentSource = null;
const update = bindProjectHandoff(
  document.getElementById("open-playground"),
  () => {
    if (currentSource === null) throw new Error("The source is still loading.");
    return normaliseProject({
      ...newProject("program", "Hello World"),
      source: currentSource,
    });
  },
);
await mountWorkbench({
  onSourceChange(source) {
    currentSource = source;
    update();
  },
});
