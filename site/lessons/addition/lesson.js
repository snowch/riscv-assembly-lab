import { mountWorkbench } from '../../workbench.js';
import { completeProgram, lessonDiagnostic, readRegisters } from './program.js';
const $ = id => document.getElementById(id);
function clearResults(message) {
  for (const name of ['t0', 't1', 't2']) {
    $(name + '-decimal').textContent = '—';
    $(name + '-hex').textContent = 'Not run yet';
  }
  $('register-note').textContent = message;
}
await mountWorkbench({
  sourceURL: new URL('./lesson.s', import.meta.url),
  draftKey: 'riscv-assembly-lab:addition-source:v1',
  downloadName: 'lesson.s',
  prepareBuild(fragment) {
    if (!fragment.trim()) return { source: '', filename: 'program.s' };
    return { source: completeProgram(fragment), filename: 'program.s' };
  },
  diagnosticLocation: lessonDiagnostic,
  finishedMessage: 'Run finished. Compare the registers, then try another value.',
  onSourceChange(fragment) { $('complete-source').textContent = completeProgram(fragment); },
  onBuildStart() { clearResults('Building and running your code…'); },
  onRunError() { clearResults('No completed register snapshot. Check the diagnostics below.'); },
  onComplete(output) {
    const registers = readRegisters(output);
    if (!registers) { clearResults('No register snapshot was produced. Your code may have exited before the supplied reporting code ran. Inspect the program output below.'); return; }
    for (const [name, value] of Object.entries(registers)) {
      $(name + '-decimal').textContent = value.decimal;
      $(name + '-hex').textContent = value.hex;
    }
    $('register-note').textContent = 'Captured after your code ran. Decimal values use a signed 64-bit reading.';
  },
});
$('download-complete').disabled = $('source').disabled;
$('download-complete').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([$('complete-source').textContent], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'addition-complete.s';
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
