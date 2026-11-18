// Copyright © 2026 Christopher Snow
import { createSourceEditor } from "./course/editor.js";
// Shared editor, draft, build, cancellation and theme controls.
export async function mountWorkbench(options = {}) {
  const $ = (id) => document.getElementById(id);
  const run = $("run"),
    stop = $("stop");
  $("source").disabled = false;
  const source = createSourceEditor($("source"), {
    language: "asm",
    breakpoints: false,
    onChange() {
      edited();
    },
  });
  source.readOnly = true;
  const draftKey = options.draftKey ?? "riscv-assembly-lab:hello-source:v1",
    undoKey = `${draftKey}:undo-restore`,
    themeKey = "riscv-assembly-lab:theme";
  let starter = "",
    worker = null,
    timer = null,
    builtSource = null,
    output = "",
    serial = "",
    undoRestore = null;
  function status(message, state = "Ready", error = false) {
    $("run-status").textContent = message;
    $("state-badge").textContent = state;
    $("run-status").classList.toggle("error", error);
  }
  function terminate() {
    worker?.terminate();
    worker = null;
    clearTimeout(timer);
    run.disabled = false;
    stop.disabled = true;
  }
  function watchdog(ms, message) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      terminate();
      options.onRunError?.(message);
      status(message, "Stopped", true);
    }, ms);
  }

  function edited({ clearUndo = false } = {}) {
    try {
      if (undoRestore !== null) localStorage.setItem(undoKey, undoRestore);
      localStorage.setItem(draftKey, source.value);
      if (clearUndo) localStorage.removeItem(undoKey);
      $("save-state").textContent = undoRestore === null
        ? "Draft saved in this browser"
        : "Draft saved. Undo restore recovers the previous source.";
    } catch {
      $("save-state").textContent = "Draft is tab-only · download to keep it";
    }
    $("snapshot-note").hidden =
      builtSource === null || source.value === builtSource;
    options.onSourceChange?.(source.value);
  }
  function diagnostics(message, error = false) {
    $("diagnostic-lines").replaceChildren();
    for (const line of (
      message || "Assembly and linking completed without warnings."
    ).split("\n")) {
      const match = line.match(/hello\.s:(\d+)(?::\d+)?:/);
      const location = options.diagnosticLocation
        ? options.diagnosticLocation(line, builtSource ?? source.value)
        : match
          ? { line: Number(match[1]), label: line }
          : null;
      const el = document.createElement(location ? "button" : "p");
      el.textContent = location?.label ?? line;
      if (location) {
        el.className = "diagnostic-link";
        el.addEventListener("click", () => {
          if (builtSource !== null && source.value !== builtSource) {
            status(
              "This message refers to an earlier build. Run again to check your edits.",
              "Source changed",
            );
            return;
          }
          const lines = source.value.split("\n");
          const lineNumber = Math.min(
            lines.length,
            Math.max(1, Number(location.line)),
          );
          const start = lines
            .slice(0, lineNumber - 1)
            .reduce((n, s) => n + s.length + 1, 0);
          source.focus();
          source.setSelectionRange(start, start + lines[lineNumber - 1].length);
          source.scrollToLine(lineNumber);
        });
      }
      $("diagnostic-lines").append(el);
    }
    $("diagnostics-summary").textContent = error
      ? "Check messages"
      : message
        ? "Messages available"
        : "Build complete";
    $("diagnostics").open = error || !!message;
  }
  run.addEventListener("click", () => {
    if (run.disabled) return;
    terminate();
    run.disabled = true;
    stop.disabled = false;
    builtSource = source.value;
    output = "";
    serial = "";
    options.onBuildStart?.(builtSource);
    $("snapshot-note").hidden = true;
    $("console").textContent = "";
    $("serial").textContent = "";
    $("diagnostics").open = false;
    $("diagnostics-summary").textContent = "Building…";
    $("diagnostic-lines").replaceChildren();
    status("Loading tools and xv6…", "Loading");
    try {
      worker = new Worker(new URL("./worker.js", import.meta.url));
    } catch (error) {
      terminate();
      options.onRunError?.(error.message);
      status("Could not start a worker: " + error.message, "Error", true);
      return;
    }
    watchdog(
      120000,
      "Loading timed out. Check your connection and try Build & Run again.",
    );
    worker.onmessage = ({ data }) => {
      if (data.type === "phase") {
        status(
          data.message,
          { loading: "Loading", building: "Building", running: "Running" }[
            data.phase
          ],
        );
        if (data.phase === "building")
          watchdog(
            15000,
            "Build timed out. Simplify the source and try again.",
          );
        if (data.phase === "running")
          watchdog(35000, "Run timed out. Check for a loop or a missing exit.");
      } else if (data.type === "built") {
        diagnostics(data.diagnostics);
        $("diagnostics-summary").textContent = data.diagnostics
          ? "Messages available"
          : `Built · ${data.bytes.toLocaleString()} bytes`;
        watchdog(120000, "Loading the CPU timed out. Try Build & Run again.");
      } else if (data.type === "serial") {
        serial += data.text;
        $("serial").textContent = serial;
      } else if (data.type === "output") {
        output += data.text;
        $("console").textContent = output;
        $("console").scrollTop = $("console").scrollHeight;
      } else if (data.type === "done") {
        terminate();
        status(
          options.finishedMessage ??
            "Run finished. Edit the message and build again.",
          "Finished",
        );
        options.onComplete?.(output, builtSource);
        if (!output)
          $("console").textContent =
            "(The program finished without console output.)";
      } else if (data.type === "error") {
        terminate();
        options.onRunError?.(data.message);
        diagnostics(data.message, true);
        status("Could not finish. Check the diagnostics below.", "Error", true);
      }
    };
    worker.onerror = (event) => {
      event.preventDefault();
      terminate();
      options.onRunError?.(event.message);
      diagnostics(event.message, true);
      status(
        "The worker stopped unexpectedly. You can try Build & Run again.",
        "Error",
        true,
      );
    };
    worker.postMessage(
      options.prepareBuild
        ? options.prepareBuild(builtSource)
        : { source: builtSource },
    );
  });
  stop.addEventListener("click", () => {
    terminate();
    options.onRunError?.("Stopped");
    status(
      "Stopped. Edit your source or build again for a fresh machine.",
      "Stopped",
    );
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      run.click();
    }
  });
  $("restore").addEventListener("click", () => {
    const restoringPrevious = undoRestore !== null;
    if (restoringPrevious) {
      source.value = undoRestore;
      undoRestore = null;
      $("restore").textContent = "Restore starter";
    } else if (source.value !== starter) {
      undoRestore = source.value;
      source.value = starter;
      $("restore").textContent = "Undo restore";
    }
    edited({ clearUndo: restoringPrevious });
  });
  $("download").addEventListener("click", () => {
    const url = URL.createObjectURL(
      new Blob([source.value], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = options.downloadName ?? "hello.s";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  function setTheme(value) {
    document.documentElement.dataset.theme = value;
    $("theme").value = value;
  }
  try {
    const value = localStorage.getItem(themeKey);
    if (["light", "dark", "system"].includes(value)) setTheme(value);
  } catch {
    /* System theme is the fallback. */
  }
  $("theme").addEventListener("change", () => {
    setTheme($("theme").value);
    try {
      localStorage.setItem(themeKey, $("theme").value);
    } catch {
      /* Theme still works for this tab. */
    }
  });
  try {
    const response = await fetch(
      options.sourceURL ?? new URL("./hello.s", import.meta.url),
    );
    if (!response.ok)
      throw new Error("Could not load the starter. Reload the page to retry.");
    starter = await response.text();
    let draft = null;
    try {
      draft = localStorage.getItem(draftKey);
      undoRestore = localStorage.getItem(undoKey);
      $("save-state").textContent =
        undoRestore !== null ? "Draft saved. Undo restore recovers the previous source."
          : draft === null ? "Draft saves in this browser" : "Saved draft restored";
    } catch {
      $("save-state").textContent = "Draft is tab-only · download to keep it";
    }
    source.value = draft ?? starter;
    $("restore").textContent = undoRestore === null ? "Restore starter" : "Undo restore";
    options.onSourceChange?.(source.value);
    source.readOnly = false;
    run.disabled = false;
    $("restore").disabled = false;
    $("download").disabled = false;
    status(
      "Ready to build. The first run downloads about 8 MB of tools and guest images.",
    );
  } catch (error) {
    status(error.message, "Error", true);
  }
}
