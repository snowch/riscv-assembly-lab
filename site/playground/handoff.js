// Copyright © 2026 Christopher Snow
import { transferFragment } from "./projects.js";
// Keep the real href current, so browser-native middle/context-menu navigation
// transfers the same project as a primary click. There is no storage handoff.
export function bindProjectHandoff(link, getProject) {
  if (!link) return () => {};
  const destination = new URL(link.getAttribute("href"), location.href);
  destination.hash = "";
  let error = null;
  const update = () => {
    try {
      link.href = destination.href + transferFragment(getProject());
      link.removeAttribute("aria-disabled");
      error = null;
    } catch (failure) {
      error = failure;
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
    }
  };
  const activate = (event) => {
    update();
    if (error) {
      event.preventDefault();
      const status = document.getElementById("run-status");
      if (status)
        status.textContent = "Could not open in playground. " + error.message;
    }
  };
  for (const event of ["pointerdown", "focus", "contextmenu"])
    link.addEventListener(event, update);
  for (const event of ["click", "auxclick"])
    link.addEventListener(event, activate);
  update();
  return update;
}
