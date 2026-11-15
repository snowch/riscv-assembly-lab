// Copyright © 2026 Christopher Snow
function preference(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function setupTheme() {
  const select = document.getElementById("theme"),
    saved = preference("riscv-assembly-lab:theme");
  const set = (value) => {
    document.documentElement.dataset.theme = value;
    select.value = value;
  };
  if (["light", "dark", "system"].includes(saved)) set(saved);
  select.addEventListener("change", () => {
    set(select.value);
    try {
      localStorage.setItem("riscv-assembly-lab:theme", select.value);
    } catch {}
  });
}
export function completion() {
  try {
    const value = JSON.parse(
      preference("riscv-assembly-lab:complete:v1") || "[]",
    );
    return Array.isArray(value)
      ? value.filter((id) => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}
export function setComplete(id, done) {
  const ids = new Set(completion());
  done ? ids.add(id) : ids.delete(id);
  try {
    localStorage.setItem(
      "riscv-assembly-lab:complete:v1",
      JSON.stringify([...ids]),
    );
    return true;
  } catch {
    return false;
  }
}
export function renderCompletion() {
  const ids = new Set(completion());
  document.querySelectorAll("[data-completion]").forEach((el) => {
    el.hidden = !ids.has(el.dataset.completion);
  });
  const progress = document.getElementById("course-progress");
  if (progress)
    progress.textContent = `${document.querySelectorAll("[data-completion]").length} lessons · ${ids.size} marked complete in this browser.`;
}
if (!document.getElementById("lesson-data")) {
  setupTheme();
  renderCompletion();
}
