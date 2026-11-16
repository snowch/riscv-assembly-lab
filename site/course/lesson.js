// Copyright © 2026 Christopher Snow
import { createWorkbench } from "./workbench-controller.js";
import { setupTheme, renderCompletion } from "./home.js";
import { setupCourseNavigation } from "./navigation.js";
import { fromLesson } from "../playground/projects.js";
import { bindProjectHandoff } from "../playground/handoff.js";
setupTheme();
renderCompletion();
setupCourseNavigation();
const lesson = JSON.parse(document.getElementById("lesson-data").textContent);
let latest = {
  source: lesson.starter,
  lesson,
  fixture: {},
  activity: "example",
};
const update = bindProjectHandoff(
  document.getElementById("open-playground"),
  () =>
    fromLesson(latest.lesson, latest.source, latest.fixture, latest.activity),
);
createWorkbench(lesson, {
  onSnapshot(snapshot) {
    latest = snapshot;
    update();
  },
});
