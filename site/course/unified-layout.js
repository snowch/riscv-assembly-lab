// Copyright © 2026 Christopher Snow
// One editor and a compact observation remain mounted while optional tools change.
export function createUnifiedDock(root, { program, inspector, copy }) {
  const $ = (id) => document.getElementById(id);
  root.classList.add("unified-workbench");
  const tools = document.createElement("button");
  tools.id = "workspace-tools-toggle";
  tools.type = "button";
  tools.textContent = "Tools";
  tools.setAttribute("aria-expanded", "false");
  tools.setAttribute("aria-controls", "workspace-tools-dock");
  root
    .querySelector(".build-toolbar")
    .append(root.querySelector(".workspace-tools"));
  root.querySelector(".workspace-tools").prepend(tools);
  const dock = document.createElement("section");
  dock.id = "workspace-tools-dock";
  dock.setAttribute("aria-label", "Workspace tools");
  dock.hidden = true;
  root.append(dock);
  dock.append(inspector);
  const tablist = inspector.querySelector(".inspection-tabs");
  function addTab(id, title, panel) {
    const tab = document.createElement("button");
    tab.id = "tab-" + id;
    tab.type = "button";
    tab.role = "tab";
    tab.textContent = title;
    tab.setAttribute("aria-controls", panel.id);
    tab.setAttribute("aria-selected", "false");
    tab.tabIndex = -1;
    tablist.append(tab);
    panel.classList.add("inspection-view");
    panel.role = "tabpanel";
    panel.setAttribute("aria-labelledby", tab.id);
    panel.hidden = true;
    inspector.append(panel);
  }
  addTab("program", "Program", program);
  for (const [id, title] of [
    ["setup", "Setup"],
    ["projects", "Projects"],
  ]) {
    const panel = document.createElement("section");
    panel.id = "inspect-" + id;
    addTab(id, title, panel);
  }
  $("inspect-setup").append($("project-setup"));
  $("inspect-projects").append(
    document.querySelector(".project-tools"),
    document.querySelector(".project-origin-row"),
    $("project-message"),
  );
  const bits = $("bit-view");
  if (bits) $("inspect-registers").append(bits);
  const route = root.querySelector(".execution-context");
  if (route) program.prepend(route);
  const observation = root.querySelector(".phone-observation");
  root.querySelector(".workspace").append(observation);
  root.querySelector(".workspace-view-tabs").hidden = true;
  function open(value) {
    dock.hidden = !value;
    tools.setAttribute("aria-expanded", String(value));
    root.dataset.toolsOpen = String(value);
    tools.textContent = value ? "Close tools" : "Tools";
    window.dispatchEvent(new Event("resize"));
  }
  function select(name, focus = false) {
    if (name === "code") return;
    open(true);
    const id = name === "inspect" ? "registers" : name;
    const tab = $("tab-" + id);
    if (tab) {
      tab.click();
      if (focus) tab.focus({ preventScroll: true });
    }
  }
  tools.addEventListener("click", () => open(dock.hidden));
  root.addEventListener("workbench:inspect", () => open(true));
  $("tab-setup").addEventListener("click", () => {
    $("project-setup").open = true;
  });
  $("program-edit").addEventListener("click", () => {
    const editor = root.querySelector(".cm-content") ?? $("source");
    editor.focus({ preventScroll: true });
    editor.scrollIntoView({ block: "nearest" });
  });
  $("open-complete-guide").hidden = !$("complete-program-guide");
  open(false);
  return { select, open };
}
