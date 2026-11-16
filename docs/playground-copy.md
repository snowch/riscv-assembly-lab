# Standalone playground: separate copy draft

Copyright © 2026 Christopher Snow.

Drafted on 2026-11-16 from `docs/playground-brief.md`, after reading the imported Assembly Lab style and authoring instructions. This pass wrote no execution, editor, storage or project-control code. It did not use AArch64 Playground text, source or artwork. Proposed strings are in `content/guides/playground.json`; the managing session should select the strings that match the implemented controls and recheck them in the built page.

## Writing choices

The initial title and introduction describe independent code investigation in two sentences. Project types explain the source contract beside the choice. Setup help separates uncommitted form edits from Apply setup, so a reader does not mistake typing a starting value for changing a paused machine. Named projects keep code and setup; the copy does not imply a saved VM.

The lesson resource names the actual transfer and new-tab behaviour. Its longer guide copy distinguishes the current example or selected exercise case from a reference solution. It says changes in the playground do not replace the lesson draft. The resource introduces an optional route without making it a progression step.

A complete assembly program is distinguished from a supplied fragment by its `_start` entry and responsibility for initialisation/data/exit. Its copy never calls the last paused readings the exit register state. C project help names the required `lesson` function and explains the argument/return register relationship. The playground guide supplies these local definitions for a programmer entering directly.

## Accuracy boundaries for implementation and review

- The brief supplies the three project contracts and existing backend limits. The full-program path is new work; its messages must only be used once the actual builder/worker branch supports that contract.
- `programFinished`, `lastPause` and `notObserved` are alternatives for different observation states. Do not show them together as one result claim.
- Source import is proposed to offer an **Import as** choice. If the final implementation omits that choice, change the import paragraph rather than promising an unavailable control. A whole `_start` source file must not silently be imported as a fragment.
- **Restore loaded source** means the source snapshot loaded into this project session. If implementation instead restores a permanently saved project starter, use a label and help that identify that starter.
- The setup does not accept `zero`, `sp`, `gp` or `tp`. This is a product constraint, not a claim that all four registers are immutable in the ISA. The copy separately states the architectural rule that zero always reads zero.
- Starting values accept signed decimal and `0x`/`0b` patterns bounded to 64 bits. A parser should not silently overwrite duplicate assignments that use aliases for the same register; report the duplicate or make replacement explicit.
- Data entry is described as space-separated pairs of hex digits, at most 64 bytes. If the parser accepts additional separators or prefixes, the concise wording can still describe its simplest accepted form. Do not use a numeric decimal-byte parser under this label.
- **Stack** names an actual separate tab in the proposed interface. If it remains only a debugger disclosure, edit that one sentence to use its visible name.
- **Undo delete** promises recovery. Keep the recoverable object until that recovery opportunity expires, and explain any change of behaviour when switching projects.
- A project filename such as `main.c` should match source diagnostics and download names. The UI need not expose internal combined assembly filenames.
- Project saving is conditional on storage. On failure, switch to the tab-only message and leave Export project available. Do not claim successful persistence for a storage exception.
- A lesson transfer carries current source and selected fixture inputs/data. It must not carry reference code unless that code is what the learner actually loaded into the editor.

## Sentence and explanation passes

Sentence pass: short action labels; local definitions of fragment, entry label, breakpoint and hexadecimal data; no marketing, em dashes or implied cycle-accurate execution. The few technical qualifications sit beside the control or state they affect.

Explanation pass: the reader can select a project type, supply its inputs, run or pause actual code, interpret the named observation moment and export a reusable project. Saved source/setup and live execution are distinct. Each fuller help section supports the corresponding task without adding a lesson-completion gate.

This is a drafting record. It is not an independent learner review, a technical review, a browser check or evidence of novice learning. Those checks belong to the managing session and the separate reviewers.
