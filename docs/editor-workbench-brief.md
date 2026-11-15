# Editor-centred workbench

Copyright © 2026 Christopher Snow.

## Audience and outcome

The course assumes readers can program in C but are learning assembly. Give them familiar editing and inspection tools while retaining short examples, explicit starting inputs, predictions and fresh-input challenges. The observable learning action remains tracing which operands an instruction reads and which destination it writes, then applying the mechanism to new inputs.

Applied the source course's learning-design workflow to attention, state and access. Inspected C++ Foundry's live first lesson at phone/desktop widths and its editor implementation. Its connected source/run/output framing informed this workbench; no course prose or implementation was copied. That site's editor is a textarea. This implementation uses locally bundled CodeMirror 6 with an original adapter and assembly highlighting rules.

## Implementation decisions

- One execution toolbar belongs to the workbench, after the lesson explanation and prediction. Keep Build & Run, debugging, stepping, Continue and Stop together.
- CodeMirror supplies assembly/C highlighting, indentation, bracket matching, search and undo. Syntax colours do not validate instruction semantics: the actual GNU tools still diagnose source.
- Code stays adjacent to the inspector on desktop. Registers, Memory (when applicable), Output, Diagnostics and Debugger are discoverable tabs below the code on narrow screens, with the same tabs alongside it on desktop.
- Keep working-register inputs, fresh-machine state and stack qualifications visible outside tabs and optional help. Observations remain labelled by their capture moment.
- Fit short source initially. Permit manual vertical resizing, editor expansion and a modal/fullscreen workspace. These controls must not change source, selected breakpoints or paused CPU state.
- Keep complete supplied source available. Programmatic replacements start a new editor undo history so undo cannot leak a reference or a draft between activities.
- Keep ordinary C line numbering distinct from assembly breakpoint controls. Use real mapped instruction addresses for C debugging.
- Preserve draft keys, fixtures, prediction grading, native compilation and actual xv6 execution. Upgrade the standalone Hello World editor without adding unsupported debugging there.

## Evidence required

Check actual editing, multiline paste, undo, search, indentation, focus escape, row/breakpoint alignment, diagnostics selection, restore/undo restore, reference loading, tab keyboard operation, resizing, and fullscreen return. Exercise actual paused sessions and fresh challenge cases. Check short/long assembly, C, stack, system-call output and Hello World at phone/tablet/desktop widths in both themes.

Independent learner and technical reviewers must inspect the actual built experience before reading this brief. A review is not a novice study or evidence of improved learning. Keep initial failed checks distinct from final reruns and retain meaningful assertions when adapting textarea-based tests to the visible editor.
