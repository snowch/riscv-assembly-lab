// Copyright © 2026 Christopher Snow

export function setupWorkbench() {
  const root = document.getElementById("workbench");
  const tabs = [...root.querySelectorAll('.inspection-tabs [role="tab"]')];
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
    if (name === "stack")
      document.getElementById("debug-stack-section").open = true;
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
    previousTop = 0,
    closing = false;
  function rememberPaneScroll() {
    return [
      ...root.querySelectorAll(
        ".cm-scroller,.program-scroll,.inspection-view,.workspace",
      ),
    ].map((node) => ({ node, top: node.scrollTop, left: node.scrollLeft }));
  }
  function restorePaneScroll(positions) {
    const restore = () => {
      for (const { node, top, left } of positions) {
        node.scrollTop = top;
        node.scrollLeft = left;
      }
    };
    restore();
    requestAnimationFrame(() => requestAnimationFrame(restore));
  }

  async function close() {
    if (!dialog.open || closing) return;
    closing = true;
    const paneScroll = rememberPaneScroll();
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
    window.scrollBy({
      top: root.getBoundingClientRect().top - previousTop,
      behavior: "instant",
    });
    toggle.focus({ preventScroll: true });
    window.dispatchEvent(new Event("resize"));
    restorePaneScroll(paneScroll);
    closing = false;
  }
  toggle.addEventListener("click", async () => {
    if (dialog.open) {
      await close();
      return;
    }
    previousTop = root.getBoundingClientRect().top;
    const paneScroll = rememberPaneScroll();
    placeholder = document.createComment("Workbench position");
    root.before(placeholder);
    dialog.append(root);
    dialog.showModal();
    root.classList.add("workbench-fullscreen");
    toggle.setAttribute("aria-expanded", "true");
    toggle.textContent = nativeFullscreen
      ? "Exit full screen"
      : document.getElementById("playground-data")
        ? "Return to playground"
        : "Return to lesson";
    document.body.style.overflow = "hidden";
    if (nativeFullscreen) {
      try {
        await root.requestFullscreen();
      } catch {
        /* The modal still provides a full-window workspace. */
        toggle.textContent = document.getElementById("playground-data")
          ? "Return to playground"
          : "Return to lesson";
      }
    }
    toggle.focus({ preventScroll: true });
    window.dispatchEvent(new Event("resize"));
    restorePaneScroll(paneScroll);
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && dialog.open && !closing) close();
  });
  const anchorRestorations = new WeakMap();
  function preservePosition(change) {
    const scroller =
      document.fullscreenElement === root
        ? root
        : dialog.open
          ? dialog
          : document.scrollingElement;
    const bar = root.querySelector(".workbench-bar");
    const top = bar.getBoundingClientRect().top;
    const previousAnchor =
      anchorRestorations.get(scroller)?.previous ??
      scroller.style.overflowAnchor;
    const restoration = { previous: previousAnchor };
    anchorRestorations.set(scroller, restoration);
    scroller.style.overflowAnchor = "none";
    try {
      change();
      scroller.scrollBy({
        top: bar.getBoundingClientRect().top - top,
        behavior: "instant",
      });
    } finally {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (anchorRestorations.get(scroller) === restoration) {
            scroller.style.overflowAnchor = previousAnchor;
            anchorRestorations.delete(scroller);
          }
        }),
      );
    }
  }
  return {
    inspect,
    close,
    preservePosition,
    get expanded() {
      return dialog.open;
    },
  };
}
