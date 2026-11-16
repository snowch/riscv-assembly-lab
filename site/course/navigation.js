// Copyright © 2026 Christopher Snow
export function setupCourseNavigation() {
  const menu = document.getElementById("course-navigation");
  if (!menu) return;
  const close = () => {
    menu.open = false;
  };
  document.addEventListener("pointerdown", (event) => {
    if (!menu.contains(event.target)) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !menu.open) return;
    event.preventDefault();
    close();
    menu.querySelector("summary").focus({ preventScroll: true });
  });
  menu.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !menu.contains(event.relatedTarget)) close();
  });
}
