// Copyright © 2026 Christopher Snow
import "../course/home.js";

const source = document.getElementById("pico-source");
const start = document.getElementById("pico-build");
const restore = document.getElementById("pico-restore");
const download = document.getElementById("pico-download");
const status = document.getElementById("pico-status");
const diagnostics = document.getElementById("pico-diagnostics");
const starter = source.value;
let worker;
let timeout;
let downloadUrl;

function stop() {
  worker?.terminate();
  worker = undefined;
  clearTimeout(timeout);
  start.disabled = false;
}

function clearDownload() {
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = undefined;
  download.removeAttribute("href");
  download.hidden = true;
}

function sourceChanged() {
  stop();
  clearDownload();
  diagnostics.hidden = true;
  status.textContent = "Build the current source to make a UF2.";
}

function failed(message) {
  stop();
  status.textContent = "Build failed. Check the diagnostic and try again.";
  diagnostics.textContent = message;
  diagnostics.hidden = false;
}

start.addEventListener("click", () => {
  clearDownload();
  diagnostics.hidden = true;
  start.disabled = true;
  status.textContent = "Assembling and linking the firmware…";
  try {
    const active = new Worker(new URL("./build-worker.js", import.meta.url));
    worker = active;
    timeout = setTimeout(() => failed("The firmware build timed out."), 30000);
    active.onmessage = ({ data }) => {
      if (worker !== active) return;
      if (data.error) {
        failed(data.error);
        return;
      }
      stop();
      downloadUrl = URL.createObjectURL(
        new Blob([data.firmware], { type: "application/octet-stream" }),
      );
      download.href = downloadUrl;
      download.hidden = false;
      diagnostics.textContent = data.diagnostics;
      diagnostics.hidden = !data.diagnostics;
      status.textContent = "Your Pico 2 firmware is ready to download and flash.";
    };
    active.onerror = (event) => {
      if (worker === active) failed(event.message || "Could not start the firmware builder.");
    };
    active.postMessage(source.value);
  } catch (error) {
    failed(error.message);
  }
});

restore.addEventListener("click", () => {
  source.value = starter;
  sourceChanged();
  source.focus();
});
source.addEventListener("input", sourceChanged);
source.disabled = false;
start.disabled = false;
restore.disabled = false;
