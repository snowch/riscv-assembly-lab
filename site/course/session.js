// Copyright © 2026 Christopher Snow
export class Session {
  constructor(onEvent) {
    this.onEvent = onEvent;
    this.worker = null;
    this.timer = null;
    this.cancelled = false;
  }
  start(payload) {
    this.stop(false);
    this.cancelled = false;
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      const fail = (message) => {
        this.onEvent({ type: "error", message });
        this.stop(false);
        reject(new Error(message));
      };
      this.deadline = (ms, message) => {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => fail(message), ms);
      };
      try {
        this.worker = new Worker(new URL("./worker.js", import.meta.url));
      } catch (error) {
        fail(error.message);
        return;
      }
      this.deadline(
        120000,
        "Loading timed out. Try again when your connection is available.",
      );
      this.worker.onmessage = ({ data }) => {
        if (data.type === "phase") {
          if (data.phase === "building")
            this.deadline(
              15000,
              "Compilation and linking timed out. Simplify the edit and try again.",
            );
          if (data.phase === "running")
            this.deadline(
              35000,
              "Execution timed out. Check the loop or use Stop.",
            );
          if (data.phase === "paused") clearTimeout(this.timer);
        }
        if (data.type === "built")
          this.deadline(120000, "Loading the CPU timed out. Try again.");
        this.onEvent(data);
        if (data.type === "done") {
          this.stop(false);
          resolve();
        } else if (data.type === "error") {
          this.stop(false);
          reject(new Error(data.message));
        }
      };
      this.worker.onerror = (event) => {
        event.preventDefault();
        fail(event.message || "The execution worker stopped unexpectedly.");
      };
      this.worker.postMessage(payload);
    });
  }
  step() {
    this.worker?.postMessage({ action: "step" });
  }
  continue() {
    this.worker?.postMessage({ action: "continue" });
    this.deadline?.(35000, "Execution timed out.");
  }
  stop(notify = true) {
    clearTimeout(this.timer);
    this.worker?.terminate();
    this.worker = null;
    if (notify) {
      this.cancelled = true;
      this.reject?.(new Error("Stopped"));
      this.onEvent({ type: "stopped" });
    }
  }
}
