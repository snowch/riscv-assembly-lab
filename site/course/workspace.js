// Copyright © 2026 Christopher Snow

export function setupWorkbench() {
  const root = document.getElementById("workbench");
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  function inspect(name, focus = false) {
    const next = tabs.find((tab) => tab.id === `tab-${name}`);
    if (!next) return;
    for (const tab of tabs) {
      const selected = tab === next;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute("aria-controls")).hidden =
        !selected;
    }
    if (name === "output")
      document.getElementById("program-output").open = true;
    if (name === "diagnostics")
      document.getElementById("diagnostics").open = true;
    if (name === "debugger")
      document.getElementById("debugger-panel").open = true;
    if (focus) next.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => inspect(tab.id.slice(4)));
    tab.addEventListener("keydown", (event) => {
      const offset = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? tabs.length - 1
            : offset
              ? (index + offset + tabs.length) % tabs.length
              : null;
      if (next === null) return;
      event.preventDefault();
      inspect(tabs[next].id.slice(4), true);
    });
  });

  const toggle = document.getElementById("fullscreen-workspace");
  const dialog = document.createElement("dialog");
  dialog.className = "workbench-dialog";
  dialog.setAttribute("aria-label", "Code workbench");
  document.body.append(dialog);
  const nativeFullscreen = Boolean(
    document.fullscreenEnabled && root.requestFullscreen,
  );
  toggle.textContent = nativeFullscreen ? "Full screen" : "Expand workspace";
  let placeholder,
    previousScroll = 0,
    closing = false;

  async function close() {
    if (!dialog.open || closing) return;
    closing = true;
    if (
      document.fullscreenElement &&
      dialog.contains(document.fullscreenElement)
    ) {
      await document.exitFullscreen();
    }
    placeholder.replaceWith(root);
    dialog.close();
    root.classList.remove("workbench-fullscreen");
    toggle.textContent = nativeFullscreen ? "Full screen" : "Expand workspace";
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    window.scrollTo({ top: previousScroll, behavior: "instant" });
    toggle.focus({ preventScroll: true });
    window.dispatchEvent(new Event("resize"));
    closing = false;
  }
  toggle.addEventListener("click", async () => {
    if (dialog.open) {
      await close();
      return;
    }
    previousScroll = window.scrollY;
    placeholder = document.createComment("Workbench position");
    root.before(placeholder);
    dialog.append(root);
    dialog.showModal();
    root.classList.add("workbench-fullscreen");
    toggle.setAttribute("aria-expanded", "true");
    toggle.textContent = nativeFullscreen
      ? "Exit full screen"
      : "Return to lesson";
    document.body.style.overflow = "hidden";
    if (nativeFullscreen) {
      try {
        await root.requestFullscreen();
      } catch {
        /* The modal still provides a full-window workspace. */
        toggle.textContent = "Return to lesson";
      }
    }
    toggle.focus({ preventScroll: true });
    window.dispatchEvent(new Event("resize"));
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && dialog.open && !closing) close();
  });
  return { inspect, close };
}
