# Lesson navigation and first-addition copy

Separate drafting pass, 2026-11-16. Apply the imported `docs/style.md`; the managing session still checks and edits this proposal.

## First lesson: before you run

A register is a small store inside the processor. RISC-V integer registers hold 64 bits each. The names `t0`, `t1` and `t2` select three of these registers. They are temporary registers, used for working values.

An instruction tells the processor to perform an operation. The parts after its name are its operands. In `add t2, t0, t1`, the last two operands name the input registers. The first names the destination, the register that receives the sum. Reading an input does not replace its value.

`li` (load immediate) puts a number into a register. An immediate is a number written directly in the instruction. In `li t0, 7`, that number is `7`. The assembler translates assembly text into machine instructions. `li` is shorthand that it may expand into more than one machine instruction.

Read the three lines from top to bottom. Build & Run assembles and executes them. The result cards show the registers after all three lines.

## Operand schematic

Use the actual starter's `add` source line to identify the register names. Show roles, not a claimed execution snapshot:

- Heading/caption: `add t2, t0, t1`
- First source: `t0`, `Input`
- Second source: `t1`, `Input`
- Destination: `t2`, `Destination`
- Caption: “The last two operands are read. The first operand is written.”

The visual may connect the two source boxes to the destination with addition and arrow marks. It must not show a numeric destination or imply a real processor's physical layout. A screen-reader description can be “add reads t0 and t1, then writes their sum to t2.” The structure clarifies operand order before the prediction. Any later live values must come from the actual execution, not from typed answers.

## Navigation and resources

- Breadcrumb accessible name: `Breadcrumb`
- Breadcrumb levels: `Course` / module title / current lesson title. Use `aria-current="page"` on the last level.
- Course-list disclosure: `Course lessons` (inside the compact navigation, without another full-width strip).
- Existing resource row labels: `View complete program`, `Executable layout`, `References`.
- Optional workbench guide link: `Using the workbench`.

Keep native disclosure semantics for resources that expand in place. A chevron communicates expansion; its direction changes when open. Real navigation remains an anchor. Inline prose links stay underlined. Do not add recap, local-run or documentation-question rows without actual corresponding resources.

## Facts checked for the draft

- Starter source and prediction: `content/state-arithmetic.json`, first lesson. The starter loads t0 and t1 before adding into t2; no program or fixture changes are proposed.
- Temporary register names and 64-bit register width: existing course brief; official RISC-V psABI integer register convention and RV64 integer specification already cited by the course.
- `li rd, immediate` is labelled “Load immediate” and expands to “Myriad sequences” in the RISC-V Assembly Programmer's Manual: <https://github.com/riscv-non-isa/riscv-asm-manual/blob/main/src/asm-manual.adoc>. Fetched and checked on 2026-11-16. A pseudo-instruction is assembly shorthand, so the prose does not imply every `li` is one machine instruction.
- Operand roles follow the base integer `ADD rd, rs1, rs2` definition in the course's checked ISA source. The source schematic shows operand routing only; it does not calculate a result or give away the prediction.

Sentence pass: short units, immediate definitions, no new unexplained labels beyond existing course terms. Explanation pass: register storage, input/destination roles, direct numeric input and assembler expansion appear before the first prediction. The visual reduces the need to remember assembly operand order while reading the paragraph.

## Header calculator: proposed copy

The author has requested a header calculator as part of this change. This section drafts its copy; the implementation and independent review still need to establish the behaviour. Use the actual selected width and computed values wherever braces appear below. Do not print braces or substitute hard-coded answers.

### Main controls

- Header button: `Calculator`
- Dialog title: `Programmer calculator`
- Intro: “Explore numbers and bits. This calculator is separate from your code and does not run instructions.”
- Dismiss button: `Close`
- Width group: `Width`; choices `64 bits` (default), `32 bits`
- Reading group: `Decimal reading`; choices `Signed`, `Unsigned`
- Reading help: “Signed reads the top bit as negative weight. Unsigned reads every bit as positive weight. The bits stay the same.”
- Input labels: `Value A`, `Value B`
- Shared entry help, visible before either field is used: “Decimal by default. Use 0x for hexadecimal or 0b for binary. Spaces, commas and underscores may separate digits.”
- Optional shorter label where the space is constrained: “Decimal by default. Use 0x for hex or 0b for binary.”
- Representation labels beneath each input: `Decimal (signed)` or `Decimal (unsigned)`, then `Hexadecimal`
- Operation selector: `Operation`
- Submission button: `Calculate`
- Clear/reset button: `Reset calculator`

Show the chosen operation's ordinary name, such as `Add` or `Subtract`. Do not label these as RISC-V instructions or claim their results update registers.

### Parsing and width help

Keep the entry help short. Put this fuller explanation in a native disclosure called `Numbers and width`:

“Hexadecimal and binary entries describe bits. If they use fewer than {width} bits, the calculator adds zeros on the left. Selecting Signed changes how those bits are read; it does not copy the top bit into the added positions.”

“A value must fit the selected width. Extra leading zeros are allowed. Other extra upper bits are rejected, so a paste never changes the width or discards part of your value.”

“Changing from 64 bits to 32 bits keeps the low 32 bits and discards the upper bits. Changing from 32 bits to 64 bits adds upper zeros, even with Signed selected.”

If the implementation displays a limit for decimal entry, calculate that limit from the selected width and reading. Signed decimal entry accepts the selected signed range; unsigned accepts zero through the selected unsigned maximum. Hexadecimal and binary describe the full bit pattern even when its signed decimal reading is negative.

Suggested messages:

- Empty required value: “Enter a value for {A or B}.”
- Malformed entry: “Enter decimal, 0x followed by hexadecimal digits, or 0b followed by binary digits.”
- Nonzero bits beyond 32: “This value does not fit 32 bits. Select 64 bits to keep the whole value.”
- Nonzero bits beyond 64: “This value does not fit 64 bits. Enter a smaller value.”
- Decimal outside selected range: “Enter a decimal value from {minimum} to {maximum} for this width and reading.”

Show errors beside the relevant field and associate them through `aria-describedby`. An invalid draft must not appear as a successful new representation or calculation. If results remain visible while an operand is edited, mark them “From the last calculation” until Calculate runs again.

### Result and optional bits

- Result heading: `Retained result`
- Full result line: “Full mathematical result: {computed result}”
- Result help: “The retained result keeps the low {width} bits.”
- Full result help: “The full mathematical result uses your selected decimal reading.”
- Optional transfer action, if implemented: `Use result as A`
- Success status: “Calculation complete.”
- Bits disclosure: `Compare the bits`
- Scroll help: “Scroll the rows together to compare the same bit positions.”
- Position row: `Bit positions`
- Operand rows: `A`, `+ B` or `− B` as appropriate
- Result row: `Result`
- Navigation buttons: `High bits`, `Low bits`

Keep the three operand/result rows aligned in one scrolling region. A result row shown beside edited inputs must retain the last-calculation warning, or the rows must all use the captured calculation operands.

### Optional carries for addition

- Disclosure or checkbox label: `Show addition carries`
- Carry row: `Carry in`
- Separate final-column label: `Carry out`
- Explanation: “Each column adds the two input bits and the carry from the column on its right. It writes one result bit and passes a carry to the next column on the left.”
- Final-column explanation: “The carry out leaves bit {width minus one}, beyond the retained result.”
- Signed-rule explanation: “For addition, signed overflow happens when the exact signed sum is outside the signed range. The carry into the top bit then differs from the carry out of it.”
- Computed readings: “Carry into bit {width minus one}: {computed carry}”, “Carry out: {computed carry}”, “Signed overflow: Yes” or “Signed overflow: No”
- Local architecture note: “These are properties of the addition. RISC-V does not record arithmetic condition flags.”

Only offer addition carries while displaying an actual completed addition. Do not relabel subtraction borrows as addition carries. The carry and signed-overflow readings depend on the bit patterns, regardless of the selected decimal reading. Describe signed overflow explicitly as a signed interpretation if Unsigned is selected. Keep these details optional so a learner can use ordinary number conversion before meeting carries.

### Facts and checks for calculator wording

The width and parsing statements above are the requested calculator contract, not claims about RISC-V instructions. In particular, explicit calculator widening is zero extension; it is not the RV64 ABI's treatment of narrow signed or unsigned arguments. RV64 arithmetic keeps the low XLEN bits and has no arithmetic condition flags, per the course's checked RV64/base integer sources. The two carries rule is binary-addition mathematics: for sign-column input bits a and b with incoming carry c, outgoing carry is the majority of a, b, c and the result sign bit is a XOR b XOR c. The outgoing and incoming carries differ exactly when equal-sign operands produce the opposite result sign. Implementation tests should cover all eight sign-column combinations and 32/64-bit boundary sums.

Sentence pass: visible defaults and short action labels, with width details available next to entry rather than filling the main flow. Explanation pass: distinguish number parsing, decimal interpretation, changing width, full arithmetic and retained bits. No calculator result is presented as execution of a lesson instruction.
