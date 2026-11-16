# Playground layout copy draft

Copyright © 2026 Christopher Snow.

This is a separate drafting pass for the playground layout revision. It proposes interface copy; it does not record a completed learner or technical review. The draft follows `docs/course-authoring.md` and Assembly Lab's `docs/style.md`. The reader can read small C programs and binary numbers, but may be new to assembly, hexadecimal and debugging.

## Checked facts

- `makeProgram` returns complete-program source unchanged. For fragments, it joins supplied entry and initialisation, the user's whole fragment, and supplied state capture, reporting, exit, helper functions and data. The fragment can contain its own labels, functions and data directives.
- For C, the generated assembly calls `lesson`. TinyCC compiles the C as a separate object. Showing that caller is not showing the compiler's assembly output.
- `buildLesson` returns the exact generated assembly source and actual GNU objdump instructions from the executable. Its filtered `disassembly` contains the fragment's instruction range, the compiled `lesson` function, or all executable sections of a complete program. `allInstructions` also contains supplied executable code.
- Assembly source-line mappings come from the assembled debug information. TinyCC supplies no checked C source-line mapping. An assembly source line can emit several machine instructions, including through a pseudo-instruction such as `li`.
- Stepping observations describe an actual paused machine. The PC gives the address of the next instruction. A retained pause after a complete program exits is not an exit-state observation.
- The existing debugger compares values with the preceding pause or captured result. Pinning a register makes it easy to find; a pin does not change execution or create a breakpoint.

## Workspace labels

| Use                                        | Text                                                          |
| ------------------------------------------ | ------------------------------------------------------------- |
| Narrow workspace tabs                      | `Code`, `Program`, `Inspect`                                  |
| Desktop left-pane switch                   | `Code`, `Program`                                             |
| Code heading                               | The existing source filename, such as `main.s` or `main.c`    |
| Program source heading                     | `Program source`                                              |
| Source view label                          | `Current source · read-only`                                  |
| Instruction view label                     | `Machine instructions`                                        |
| Build version label                        | `Last successful build`                                       |
| Return from generated source to editor     | `Edit code`                                                   |
| Register filter label                      | `Show registers`                                              |
| Register filters                           | `Pinned`, `Changed`, `All`                                    |
| Empty pinned filter                        | `No registers pinned. Pin a register to keep it here.`        |
| Empty changed filter before an observation | `Run or pause the program to compare register values.`        |
| Empty changed filter after a comparison    | `No register values changed since the preceding observation.` |
| Pin button accessible name                 | `Pin {register}`                                              |
| Unpin button accessible name               | `Unpin {register}`                                            |

These labels work at either screen width. Opening a view does not run code. Keep the execution controls in the same place and preserve each view's scroll position.

## Program source

Fragment introduction:

> Your code sits inside the supplied program. Expand the folded sections to inspect its setup and reporting code.

Complete-program introduction:

> This is your complete source. The build uses it unchanged.

C introduction:

> Your C function and its supplied assembly caller are separate source files. Build the program to inspect the compiled instructions.

C source headings:

- `Your C function`
- `Supplied assembly caller`

Suggested assembly section labels, only where their exact source spans exist:

- `Entry`
- `Supplied initialisation · {count} lines`
- `Your code`
- `Supplied capture, reporting and exit · {count} lines`
- `Supplied helper functions · {count} lines`
- `Supplied report storage · {count} lines`
- `Starting data · lesson_data`

Optional local descriptions:

> Initialisation prepares the stack and starting registers before your code runs.

> The supplied code captures registers and memory, prints the report and exits through xv6.

> Starting setup supplies these bytes at lesson_data. Unspecified bytes start at zero.

Use the shortest set of section labels that follows the actual generator. The display must retain every source byte and its order. Folded sections are still part of the source; do not replace them with invented assembly or move the user's functions or data elsewhere. A full program has no supplied folds.

## Machine instructions

Before the first build:

> Build or start stepping to see the instructions in the executable.

Beside the listing:

> These instructions come from the last successful build. One assembly source line can produce several instructions.

PC key:

> PC marks the next instruction at the current pause.

If a source association is displayed, label it `Source line {line}`. If the user can toggle a breakpoint by selecting the instruction, say:

> Select an instruction address to toggle a breakpoint. The program pauses before that instruction executes.

C qualification beside the listing:

> TinyCC does not provide C source-line mappings. The listing shows its compiled instructions without assigning them to C lines.

Scope labels, if the implementation offers both scopes:

- Fragment or C: `Your instructions`, `All instructions`
- Complete program: `All instructions`

Scope description:

> All instructions includes the supplied setup, helper functions and reporting code.

Use that sentence only for fragment and C projects. The listing is executable instructions, so source labels, comments and data directives belong in Program source.

## Source, build and observations

The source view follows current editor content and committed setup. The machine listing follows an actual successful build. State these moments independently.

After source changes while a previous build exists:

> Source changed. Instructions and observations still belong to the previous build. Build again to use your edits.

After a build fails while a previous successful listing remains available:

> Build failed. The instruction listing still shows the previous successful build. See Diagnostics for the error.

Before any successful build:

> No successful build yet.

For live registers or memory, retain the existing named observation and complete-program qualifications. Do not replace them with a generic `Current state` or infer a final state after a raw program exits.

Register-filter help:

> Pinned keeps chosen registers together. Changed compares values with the preceding observation. All shows every integer register.

If the first observation has no comparison baseline, say:

> This is the first observation. No earlier values are available for comparison.

Use the baseline that the implementation actually retains. Do not say that a value changed from a previous run when its comparison is a pause in the current run.

## Optional help

> Code is your editable source. Program shows that source in its supplied program, with setup and reporting sections folded away. Expand a section to inspect the full source.

> Machine instructions shows the executable from your last successful build. Build again after editing the source. During stepping, PC marks the next instruction to execute.

> Inspect shows observations from execution. Pin useful registers, compare changed values, or choose All to see every integer register.

## Integration cautions

- Avoid describing the Program view as "the complete program minus boilerplate". Folded source remains present and expandable. `Supplied code` identifies its owner and purpose more clearly than `boilerplate`.
- Keep the complete-program download available. For C it must continue to package both source files; the generated assembly caller alone is not a standalone equivalent of the C function.
- Compute fold boundaries and line counts in the generator, not by matching user-entered label text. A comment or label in a fragment must not cause source to disappear.
- State whether the machine view contains the fragment's instructions or every executable section. The existing filtered `disassembly` is not the full executable for fragments or C.
- The browser disassembler may print aliases for real encodings. Avoid claiming its mnemonic spelling is a unique representation or that every row is four bytes long.
- A register can be written without changing its value. The filter name `Changed` must refer to different observed values, not writes.
