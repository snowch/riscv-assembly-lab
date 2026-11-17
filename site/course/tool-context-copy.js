// Copyright © 2026 Christopher Snow
// Generated from content/guides/tool-context.json.
export default {
  "identity": {
    "lessonKind": "Lesson workspace",
    "projectKind": "Playground project",
    "lessonPurpose": "Work through this lesson’s example or exercise with its guidance.",
    "projectPurpose": "Work independently with this project’s own code and starting setup.",
    "originNewTab": "Back to source lesson: {title} (new tab)"
  },
  "execution": {
    "label": "Where your code runs",
    "structureNote": "Program structure, not an execution trace. Select a stage to inspect its source.",
    "fragmentContract": "The lab prepares the inputs, runs your fragment, captures registers and memory, then reports and exits through xv6.",
    "cContract": "The supplied caller prepares the arguments, calls lesson, captures the returned state, then reports and exits through xv6.",
    "programContract": "xv6 starts your program at _start. Your source supplies its data, initialisation and exit.",
    "fragmentInterval": "Stepping starts at your fragment. At its end, the lab captures state and runs the reporter automatically.",
    "cInterval": "Stepping starts at lesson. Calls can enter other functions. At the supplied checkpoint, the lab captures state and runs the reporter automatically.",
    "programInterval": "Stepping starts at _start. Your program ends when its exit call completes.",
    "dataNote": "Program source also shows the data used by your code.",
    "stages": {
      "entry": "xv6 starts _start",
      "setup": "Supplied setup",
      "fragment": "Your fragment",
      "function": "Your C function",
      "capture": "Capture state",
      "report": "Report and exit",
      "program": "Your program",
      "exit": "Your exit call"
    },
    "sourceLabels": {
      "project": "Project source line {line}",
      "supplied": "Supplied source line {line}",
      "compiledC": "Compiled C function",
      "unknown": "No source-line association"
    },
    "compactStages": {
      "setup": "Entry + setup",
      "fragment": "Your code",
      "function": "Your C function",
      "capture": "Capture",
      "report": "Report + exit",
      "programEntry": "Entry",
      "programSource": "Your source",
      "programExit": "Own exit"
    },
    "programRouteNote": "Your source controls entry and termination. Inspect it to see whether and how the program exits.",
    "fragmentSummary": "Supplied setup prepares inputs. Step covers your code; capture, reporting and exit run automatically afterwards.",
    "cSummary": "The supplied caller prepares arguments. Step starts at lesson and can enter helpers; capture, reporting and exit follow.",
    "programSummary": "Step starts at _start. Your source supplies inputs and data and controls how execution ends."
  },
  "observation": {
    "label": "Observed execution",
    "notObserved": "Run or start stepping to observe register values.",
    "registers": "Pinned registers",
    "noPins": "Pin registers in Inspect to keep their values here.",
    "nextAtPause": "Next at the last pause: {instruction}",
    "pcAtPause": "Last paused PC: {pc}",
    "captured": "Captured after your code, before supplied reporting.",
    "lastPause": "Last paused observation. These are not exit register values.",
    "stale": "Source changed. These observations belong to the earlier build.",
    "duringRun": "Last observation shown. The program is running.",
    "reading": "{reading} reading",
    "showInspect": "Inspect registers",
    "previewLabel": "Pinned observations",
    "morePins": "+{count} more",
    "beforeObservation": "No observation yet",
    "unobservedValue": "—",
    "nextCompact": "Next: {instruction}",
    "noPausedObservation": "Start stepping or Start debugging to observe this program’s registers."
  },
  "scope": {
    "outsideNamed": "The last paused PC is in {symbol}, outside this scope.",
    "outsideAddress": "The last paused PC, {pc}, is outside this scope.",
    "showCurrent": "Show current instruction in All",
    "allMeaning": "All changes the listing scope. It does not change where stepping starts or where the supplied capture occurs.",
    "noInstruction": "No instruction in this listing matches the last paused PC."
  },
  "calculator": {
    "intro": "Scratch work with numbers and bits. It does not run instructions or change the program in the editor.",
    "width": "Scratch width",
    "reading": "Decimal reading",
    "width32": "Keeps 32 bits. Widening adds upper zeros; narrowing discards upper bits.",
    "width64": "Keeps 64 bits. Selecting 32 bits discards valid values’ upper bits.",
    "widthIndependence": "Calculator width does not change the RV64 processor or the instructions in your program.",
    "wBridge": "RV64 W instructions keep a 32-bit result, then copy bit 31 through the upper 32 positions of a 64-bit register.",
    "wResult": "Calculated RV64 W register pattern",
    "wReading": "Signed reading after W sign extension",
    "sameBits": "Signed and unsigned read the same retained bits.",
    "readingChanged": "Decimal reading changed. The retained bits are unchanged; the mathematical reading is updated.",
    "inputReadingChanged": "Decimal reading changed. The input bits are unchanged.",
    "retained": "Retained result",
    "full": "Full mathematical result",
    "fullNote": "The full mathematical result uses the selected reading of both inputs.",
    "shiftNote": "The full shift result uses A’s unsigned bit pattern. B is a shift amount.",
    "signed": "Signed",
    "unsigned": "Unsigned",
    "hex": "Hex",
    "calculate": "Calculate",
    "carryNote": "Carries and signed overflow describe the addition. RISC-V does not store arithmetic condition flags.",
    "bits": {
      "summary": "Compare the bits",
      "help": "Choose a bit in A to switch it. Scroll the aligned rows together to compare columns.",
      "high": "High bits",
      "low": "Low bits",
      "region": "Aligned bits, highest on the left",
      "showCarries": "Show carries",
      "calculateForCarries": "Calculate to show carries.",
      "carryIn": "Carry in",
      "carryOut": "Out",
      "carryOutLabel": "Carry out beyond bit {top}. This extra upper position is not part of the retained result.",
      "carryOutValue": "Carry out: {value}. This extra upper position beyond bit {top} is not part of the retained result.",
      "carrySummary": "Carry into bit {top}: {intoSign}. Carry out: {out}. Signed overflow: {overflow}.",
      "carryMechanism": "Each column adds A, B and the carry from its right. A total of two or three sends a carry to the next column on the left. Out shows the carry beyond the top bit; the result keeps only the selected width.",
      "overflowMechanism": "Signed overflow occurs when the carry into the top bit differs from the carry out. RISC-V does not record arithmetic condition flags."
    },
    "wPatternNote": "This pattern shows W result formation, calculated from the retained low 32 bits. No CPU instruction was executed.",
    "entryHelp": "Decimal by default. Use 0x for hexadecimal or 0b for binary. Spaces, commas and underscores may separate digits.",
    "help": {
      "summary": "Entry, reading and width",
      "paragraphs": [
        "Unsigned reads the bits as zero or a positive number. Signed gives the top bit negative weight.",
        "Hexadecimal and binary entries describe bit patterns. Shorter patterns get upper zeros, even with Signed selected.",
        "Values must fit the selected width. Leading zeros are allowed. A pattern with nonzero bits above that width is rejected; entering a value never changes the selected width or discards bits.",
        "For Shift left, B is the number of positions to shift: zero to one less than the selected width. The full shift result uses A’s unsigned bit pattern."
      ]
    }
  },
  "bridge": {
    "id": "complete-program-guide",
    "title": "From a fragment to a complete program",
    "entryLabel": "Complete-program guide",
    "intro": "A fragment uses supplied setup and exit code. A complete program makes those choices in its own source.",
    "preparationLabel": "Preparation",
    "preparationIntro": "This example combines memory loads, a helper call and an xv6 exit. Use these lessons if those operations are new.",
    "preparation": [
      {
        "label": "Array addresses and memory loads",
        "href": "../lessons/array-addresses/"
      },
      {
        "label": "Calls and returns",
        "href": "../lessons/calls-and-returns/"
      },
      {
        "label": "xv6 system calls",
        "href": "../lessons/system-calls/"
      },
      {
        "label": "Executable entry",
        "href": "../lessons/elf-entry/"
      }
    ],
    "workedTitle": "Own the inputs and exit",
    "workedProject": "Complete program: combine two counts",
    "workedIntro": "The worked program stores two counts in its data section. _start loads them into a0 and a1, then calls combine.",
    "workedDetails": [
      "The label _start names the program’s entry. The .data section defines its count values; no Starting setup values are added.",
      "combine puts its result in a0. ret returns to the instruction after the call. The caller copies that value into s0 before using a0 for exit.",
      "The exit request puts zero in a0 and the xv6 exit number in a7. Its ecall enters xv6 to finish the process. This program has no supplied reporter."
    ],
    "workedAction": "Open worked program",
    "workedSteps": [
      "Open the worked program as a new project. Your existing project is kept.",
      "Select the line number beside the exit ecall to set a breakpoint. Choose Start debugging.",
      "At that pause, inspect s0 and the data bytes. Explain how each loaded count reached the helper and how the result reached s0.",
      "Choose Continue to let the exit call complete. The retained observations describe the last pause, not the exit state."
    ],
    "freshTitle": "Apply it to a different calculation",
    "freshProject": "Complete program: compare two counts",
    "freshTask": "The fresh project stores 31 and 17. Change combine to return the first count minus the second. Keep the result in s0 before exit.",
    "freshPrediction": "Predict s0 before running. Set a breakpoint at the exit ecall and inspect the actual observation.",
    "freshQuestions": [
      "Which source defines the starting counts, and which instructions load them?",
      "Where does call transfer control, and where does ret return?",
      "Why is the returned result copied before a0 is prepared for exit?",
      "Which pause supports your claimed result, and what does that observation leave unknown about exit?"
    ],
    "freshAction": "Open fresh application",
    "success": "Check your explanation against the source and paused machine. A matching number alone does not explain the input, call and exit boundaries."
  },
  "lessonFeedback": {
    "noPrediction": "No prediction was entered. This run produced {register} = {value} ({reading}). Enter a prediction before your next run to check it.",
    "predictionMismatch": "This run completed with {register} = {value} ({reading}). Your prediction differs from this result; compare it with the code you ran.",
    "finishedLesson": "Run finished. Inspect Registers, then try the task under Change it and run again.",
    "finishedProject": "Run finished. Inspect Registers, then change your code or Starting setup and run again.",
    "predictionUnavailable": "Prediction not checked: this run produced no completed register result.",
    "errorStatus": "Inspect Diagnostics for the error.",
    "diagnosticsTitle": "Build and execution messages",
    "finishedExercise": "Run finished for the selected exercise case. Inspect Registers, then use Check all cases to test every supplied input."
  }
};
