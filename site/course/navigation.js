// Copyright © 2026 Christopher Snow
export function setupCourseNavigation() {
  const panel = document.getElementById("course-navigation"),
    button = document.getElementById("course-toggle");
  if (!panel || !button) return;
  const close = () => {
    panel.hidden = true;
    button.setAttribute("aria-expanded", "false");
  };
  button.onclick = () => {
    panel.hidden = !panel.hidden;
    button.setAttribute("aria-expanded", String(!panel.hidden));
  };
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      !panel.hidden &&
      !document.querySelector("dialog:modal")
    ) {
      event.preventDefault();
      close();
      button.focus();
    }
  });
}
