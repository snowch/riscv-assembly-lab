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
  const row = document.getElementById("course-row-progress");
  if (row) {
    const known = [...document.querySelectorAll("[data-completion]")];
    row.textContent =
      known.filter((n) => ids.has(n.dataset.completion)).length +
      " / " +
      known.length +
      " complete";
  }
  const progress = document.getElementById("course-progress");
  if (progress)
    progress.textContent = `${document.querySelectorAll("[data-completion]").length} lessons · ${ids.size} marked complete in this browser.`;
}
if (
  !document.getElementById("lesson-data") &&
  !document.getElementById("playground-data")
) {
  setupTheme();
  renderCompletion();
  const art = document.querySelector(".home-hero-art"),
    choices = document.getElementById("course-contents"),
    hero = document.querySelector(".home-hero");
  if (art && choices && hero) {
    const query = matchMedia("(max-width:1000px)"),
      arrange = () => {
        if (query.matches) {
          choices.after(art);
          art.classList.add("after-choices");
        } else {
          hero.append(art);
          art.classList.remove("after-choices");
        }
      };
    arrange();
    query.addEventListener("change", arrange);
  }

  const revealModule = () => {
    const target = document.getElementById(location.hash.slice(1));
    if (!target?.matches(".course-module")) return;
    document.getElementById("course-contents").open = true;
    target.open = true;
    target.scrollIntoView({ block: "start" });
  };
  revealModule();
  window.addEventListener("hashchange", revealModule);
}
