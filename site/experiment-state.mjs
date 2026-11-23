// Copyright © 2026 Christopher Snow
// A tab snapshot is separate from durable lesson/project storage and runtime state.
const marker = "riscv-assembly-lab:reading-snapshot";
let composing = false,
  saving = false,
  restoring = false,
  lock,
  timer;
const scope = () => [...document.querySelectorAll("body>header,main")];
const result = (req) =>
  new Promise((yes, no) => {
    req.onsuccess = () => yes(req.result);
    req.onerror = () => no(req.error);
  });
async function database() {
  const open = indexedDB.open("riscv-assembly-restart-v1", 1);
  open.onupgradeneeded = () => open.result.createObjectStore("snapshots");
  return result(open);
}
async function discard(token) {
  if (!token) return;
  const db = await database();
  try {
    const tx = db.transaction("snapshots", "readwrite");
    tx.objectStore("snapshots").delete(token);
  } finally {
    db.close();
  }
}
export async function saveReadingState() {
  if (
    saving ||
    restoring ||
    composing ||
    document.readyState !== "complete" ||
    window.riscvWorkbench?.isBusy() ||
    window.riscvRunner?.status().busy ||
    window.riscvRunner?.status().phase === "Starting"
  )
    throw Error(
      "Finish typing and stop or finish the current run before restarting.",
    );
  saving = true;
  const nodes = scope(),
    prior = nodes.map((n) => n.inert);
  nodes.forEach((n) => (n.inert = true));
  let token;
  try {
    token = crypto.randomUUID();
    const record = {
      token,
      url: location.pathname + location.search,
      scroll: [scrollX, scrollY],
      workbench: window.riscvWorkbench?.readingSnapshot(),
      fields: [
        ...document.querySelectorAll(
          "main input[id],main textarea[id],main select[id]",
        ),
      ].map((n) => ({ id: n.id, value: n.value, checked: n.checked })),
      details: [...document.querySelectorAll("main details")].map((n, i) => [
        i,
        n.open,
      ]),
    };
    const db = await database();
    try {
      await new Promise((yes, no) => {
        const tx = db.transaction("snapshots", "readwrite");
        tx.objectStore("snapshots").put(record, token);
        tx.oncomplete = yes;
        tx.onabort = tx.onerror = () =>
          no(tx.error || Error("Could not save this window’s work."));
      });
      const check = await result(
        db.transaction("snapshots").objectStore("snapshots").get(token),
      );
      if (check?.token !== token)
        throw Error("The browser did not retain the saved snapshot.");
    } finally {
      db.close();
    }
    sessionStorage.setItem(marker, token);
    if (sessionStorage.getItem(marker) !== token)
      throw Error(
        "Allow browser storage or export your work before restarting.",
      );
    return token;
  } catch (error) {
    if (token) discard(token).catch(() => {});
    throw error;
  } finally {
    saving = false;
    nodes.forEach((n, i) => (n.inert = prior[i]));
  }
}
export async function restoreReadingState() {
  let token;
  try {
    token = sessionStorage.getItem(marker);
  } catch {
    return;
  }
  if (!token) return;
  restoring = true;
  const nodes = scope();
  nodes.forEach((n) => (n.inert = true));
  try {
    const db = await database();
    let record;
    try {
      record = await result(
        db.transaction("snapshots").objectStore("snapshots").get(token),
      );
    } finally {
      db.close();
    }
    if (record?.url === location.pathname + location.search) {
      window.riscvWorkbench?.restoreReading(record.workbench);
      for (const field of record.fields || []) {
        const node = document.getElementById(field.id);
        if (node) {
          node.value = field.value;
          if ("checked" in node) node.checked = field.checked;
        }
      }
      window.riscvWorkbench?.refreshReading();
      const details = [...document.querySelectorAll("main details")];
      for (const [i, open] of record.details || [])
        if (details[i]) details[i].open = open;
      requestAnimationFrame(() => scrollTo(...record.scroll));
    }
    sessionStorage.removeItem(marker);
    await discard(token);
  } finally {
    restoring = false;
    nodes.forEach((n) => (n.inert = false));
  }
}
function unlock(remove = false) {
  if (remove) {
    let token;
    try {
      token = sessionStorage.getItem(marker);
      sessionStorage.removeItem(marker);
    } catch {}
    discard(token).catch(() => {});
  }
  clearTimeout(timer);
  lock = null;
  scope().forEach((n) => (n.inert = false));
}
document.addEventListener("compositionstart", () => (composing = true));
document.addEventListener("compositionend", () => (composing = false));
navigator.serviceWorker?.addEventListener(
  "message",
  async ({ data, ports }) => {
    if (data?.type === "PREPARE_RESTART")
      try {
        if (lock) throw Error("This window is already restarting.");
        lock = data.token;
        scope().forEach((n) => (n.inert = true));
        const token = await saveReadingState();
        if (lock !== data.token) {
          discard(token).catch(() => {});
          throw Error("The restart request expired. Try again.");
        }
        timer = setTimeout(() => unlock(true), 12000);
        ports[0].postMessage({ ready: true });
      } catch (error) {
        unlock(true);
        ports[0].postMessage({ ready: false, error: error.message });
      }
    if (data?.type === "ABORT_RESTART" && data.token === lock) unlock(true);
    if (data?.type === "COMMIT_RESTART" && data.token === lock)
      location.reload();
  },
);
async function restore() {
  try {
    await restoreReadingState();
  } catch (error) {
    document
      .querySelector("#app-status-error")
      ?.replaceChildren(
        document.createTextNode(
          "Could not restore this window’s work: " + error.message,
        ),
      );
  }
}
if (document.querySelector("#lesson-data,#playground-data,body.hello-page"))
  addEventListener("riscv-workbench-ready", restore, { once: true });
else if (document.readyState === "loading")
  addEventListener("DOMContentLoaded", restore, { once: true });
else restore();
