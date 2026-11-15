# Debugging lesson authoring record

Copyright © 2026 Christopher Snow. Drafted on 15 November 2026.

This separate drafting pass writes four new lesson objects in `content/debugging.json`. The parent integrates them after the functions module and obtains independent technical and learner review. Assembly Lab's course-authoring and style guidance was read; its repository was not modified.

## Checked brief

The learner has already met byte addressing, signed/unsigned loads, unsigned branches, multiplication, calls, saved `ra` and aligned stack frames. Each debugger action used in the prose is defined before its first required use. Breakpoints pause before a real machine instruction; an exact source line may expand into several instructions. The lesson text does not claim C source mappings or a reconstructed call stack.

- **Loop boundary:** the faulty branch `bltu count,index,done` permits equality, so it reads a following accessible byte. The reference stops with `bgeu index,count,done`. The challenge checks counts zero, one and three, including a different byte after the requested range.
- **Load reading:** `lb` sign-extends bit 7, while `lbu` zero-extends the same stored byte. The reference fixes the producer before its `mul` consumer. Cases distinguish low and high top bits, all byte bits set, and zero scaling.
- **Return address:** the worked starter saves/restores `ra` at offset eight in a sixteen-byte frame. Its faulty challenge removes both operations, causing return to an inner continuation. The reference restores `ra` while the frame is active and releases the frame. Cases compare the result and actual prepared initial `sp`.
- **Memory boundary:** a readable extra byte can violate an operation's logical count without faulting. The challenge's bad code reads before checking. The reference branches before loading, including the explicit data-end guard case. The page explains memory pages and faults locally because the later xv6 module has not yet introduced them.

`makeProgram` and `user.ld` establish the 64-byte data area at a page end; xv6 protects the next page from user access. The real supplied CPU/runtime enforces this permission. `call` and `ret` use the RV64 integer instruction semantics and the course's checked calling convention. The source course's technical review records those checked ISA/ABI sources; the actual execution below independently checks the numbers used here.

## Actual execution

The drafting pass ran `/tmp/check-debugging-content.mjs`, using `tools/course-runner.js`, real GNU assembler/linker/disassembler objects, the vendored CPU and fresh xv6 guests. Evidence is in `.artifacts/debugging-content-execution.json` (a local test artifact, intentionally not a distributed runtime asset).

- Four worked starters completed with valid state reports. Actual result patterns were `0x37` for the faulty sum, `0xffffffffffffff20` for the signed-load multiplication, `0x15` for the working nested return, and `0x63` for the unchecked extra byte.
- All fourteen reference cases passed `checkState` in fresh xv6 guests, including the three explicit stack-preservation checks.
- Each faulty challenge failed a listed case under independent Linux/QEMU execution of the same fragment with the supplied reporting syscall ABI adapted to Linux. The lost-return challenge was rejected by the one-second QEMU timeout, not relabelled a completed numerical observation.
- The read-before-check challenge was separately run at offset/capacity 64 in actual xv6. It produced no state report and logged load page fault `scause=0x0d`, with `stval=0x12000`.
- Zero failures remained. Later edits shortened prose, clarified the local page definition and renamed a logical-boundary case; executable fragments and fixtures stayed unchanged.

The byte and register expectations were checked from executed patterns, not an animation or a source interpreter. Passing these finite cases is not a proof of arbitrary submitted programs. The deliberately looping return challenge is investigated with stepping and Stop before checking a proposed repair.

## Closing passes and scope

The sentence pass removed repeated setup, shortened long sentences, and replaced early unexplained “mapped” terminology with readable-address language. The idea pass checked each investigation's starting inputs, pause moment, next instruction, watched locations, repair mechanism and useful boundary case. The working return example is intentionally separate from its broken challenge so every ordinary worked starter remains runnable.

This is an authoring and execution record, not an independent review verdict. The debugger labels and final rendered layouts require the parent's implementation and fresh independent review before publication.

## Parent clarity follow-up

The parent identified that supplied bytes and fixture inputs are not editable through their displayed cells. The loop experiment now gives two explicit instructions that store a fresh value into the following byte. The same recurring issue in the load-width experiment is corrected with an explicit store of a top-bit-clear byte. The memory-boundary experiment changes `t0` with a source `li` and directs the learner to mark the load again after editing. These are prose directions only; worked starters, challenge fragments and fixtures are unchanged.

The six explicitly modified experiment fragments were separately built with GNU tools and run under Linux/QEMU. The changed extra byte produced `a0=24` in the faulty loop and `a0=15` in the repaired loop. Both load variants produced `a0=14` after the explicit stored byte became 7. The explicit offsets 1 and 3 read `t2=8` and `t2=99` in the unchecked memory starter. Evidence: `.artifacts/debugging-experiment-execution.json`; zero failures. This focused run checks the newly specified experiment instructions and does not rerun the unchanged starter/reference corpus.

The independent learner review identified that the load-width experiment also needs to re-establish its pause after edits. Its directions now say that source edits clear breakpoints and explicitly require marking `mul` again after each edit before Start debugging. No executable fragment or fixture changed.
