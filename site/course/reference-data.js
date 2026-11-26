// Copyright © 2026 Christopher Snow
// Generated from content/reference/*.json.
export default {
  "copy": {
    "copyright": "Copyright © 2026 Christopher Snow",
    "title": "Instruction reference",
    "open": "Reference",
    "close": "Close",
    "searchLabel": "Find an instruction",
    "searchPlaceholder": "Name or purpose, such as add or load",
    "scopeLabel": "Show instructions",
    "allScope": "Course instructions",
    "lessonScope": "Used in this lesson",
    "scopeNote": "The lesson filter helps you find relevant instructions. It does not limit what the assembler accepts.",
    "intro": "Look up the instruction forms taught in this course, their operands and their effects. An operand is an input, destination or other value written after the instruction name.",
    "preparedNote": "Each example has its own prepared inputs. Opening the reference leaves your code and run unchanged.",
    "recordingNote": "These are recorded results from GNU-assembled code running in xv6, checked independently with QEMU. Opening an example does not run your code.",
    "empty": "No matching instruction. Try another name or purpose, or select Course instructions.",
    "operandRules": "Operand rules",
    "examples": "Worked example",
    "moreExamples": "More worked examples",
    "completeExample": "Complete example program",
    "completeExampleNote": "This is the program used to record the example, including the code that prepares its inputs and reports its results. Your editor stays unchanged.",
    "before": "Before this source line",
    "after": "After this source line",
    "instruction": "Source line",
    "readingLabel": "Read values as",
    "signed": "Signed decimal",
    "unsigned": "Unsigned decimal",
    "hex": "Hexadecimal",
    "register": "Register",
    "valueBefore": "Before",
    "valueAfter": "After",
    "expansion": "Disassembly for this source line",
    "expansionNote": "A pseudo-instruction is assembler shorthand that can expand into several machine instructions. Each disassembly line shows one machine instruction. GNU may display it using a shorthand name such as ret. The recorded After values follow the complete source line.",
    "commonMistakes": "Common mistakes",
    "rejected": "Rejected example",
    "official": "Source references",
    "integerSource": "RISC-V integer instruction specifications",
    "abiSource": "RISC-V calling convention",
    "assemblerSource": "GNU assembler documentation",
    "pseudoLabel": "Pseudo-instruction",
    "instructionLabel": "Machine instruction",
    "count": "{count} matching instructions",
    "loadError": "The example results could not load. You can still read the syntax and operand rules. Check your connection and try again.",
    "retry": "Try again",
    "notLoaded": "Loading the checked example…",
    "programHeaderLink": "Reading program headers",
    "loading": "Loading the checked example…",
    "unavailable": "No checked recording is available for this example.",
    "memoryHeading": "Memory at lesson_data",
    "byteOffset": "Byte offset",
    "memoryByteNote": "Each cell shows one byte in hexadecimal, which uses digits 0–9 and A–F. Offsets count bytes from lesson_data. The view shows the beginning of the supplied memory region.",
    "outputLabel": "Recorded program output",
    "captureNext": "Next: supplied result capture",
    "nextInstruction": "Next machine instruction",
    "nextLabel": "Next label",
    "programCounter": "Program counter: address of the next instruction",
    "opcodeNotationMatch": "Matching assembler notation",
    "syntaxNote": "Register names such as t0 are aliases: t0 and x5 name the same register. The zero register, also named x0, always reads as zero; writes to it are discarded.",
    "registerKey": "`rd` stands for the destination register. `rs`, `rs1` and `rs2` stand for input registers; replace them with register names.",
    "immediateKey": "`imm` stands for a constant number written directly in the instruction.",
    "memoryKey": "`offset` is a number of bytes added to the address in the base register.",
    "labelKey": "`label` stands for a named position in the code. Define it by writing the name followed by a colon, such as `target:`."
  },
  "notation": {
    "title": "Reading assembly notation",
    "header": ".text\n.global reference_example\nreference_example:",
    "intro": "The assembler turns assembly text into machine instructions. Directives give the assembler directions; labels name positions in the program. Neither runs as an instruction.",
    "lines": [
      {
        "source": ".text",
        "explanation": "Selects the code section, where the assembler places the instructions that follow."
      },
      {
        "source": ".global reference_example",
        "explanation": "Makes the name reference_example available to other assembled files when the linker joins them. .globl is another spelling of .global."
      },
      {
        "source": "reference_example:",
        "explanation": "Defines a label at this position. Here it names the first instruction's address. reference_example is a name chosen for this example, not a reserved command."
      }
    ],
    "note": ".global alone does not choose where execution starts or call the code. This course's supplied linker script selects _start as the program's entry point, the address where xv6 starts your program.",
    "preparedNote": "In lesson fragments, the lab supplies entry, capture and exit code. Edit the lesson's instructions; you do not need to add this header. Complete-program projects include their own entry code.",
    "pseudoNote": "A pseudo-instruction is assembler shorthand for one or more machine instructions. The recorded examples show before and after the whole source line, including every instruction it expands into.",
    "placeholders": [
      {
        "source": "rd",
        "explanation": "A destination register: the register that receives the result."
      },
      {
        "source": "rs, rs1, rs2",
        "explanation": "Source registers: the registers whose values the instruction reads."
      },
      {
        "source": "imm",
        "explanation": "An immediate: a number written directly in the instruction. Each instruction's rules give the allowed range."
      },
      {
        "source": "offset(base)",
        "explanation": "A memory address formed by adding the written byte offset to the address in the base register."
      },
      {
        "source": "label",
        "explanation": "A name defined with a colon, such as retry:. Use the name without the colon in a branch or jump."
      }
    ]
  },
  "entries": [
    {
      "id": "add",
      "title": "Add two registers",
      "kind": "instruction",
      "summary": "Add the two input registers and write the low 64 bits of the sum.",
      "syntax": [
        "add rd, rs1, rs2"
      ],
      "rules": [
        "rd is the destination; rs1 and rs2 are the input registers. An input register may also be the destination.",
        "This instruction uses all 64 bits. A result outside the 64-bit range wraps; it does not set condition flags."
      ],
      "examples": [
        {
          "id": "add-registers",
          "setup": "li t0, 9\nli t1, 6",
          "instruction": "add t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "Only the destination is written. Both input registers keep their values."
        },
        {
          "id": "add-wrap",
          "setup": "li t0, -1\nli t1, 1",
          "instruction": "add t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "The first input has every bit set. Adding one produces a bit beyond the register width; only the low 64 bits are stored."
        }
      ],
      "mistakes": [
        {
          "source": "add t2, t0",
          "explanation": "Supply two input registers after the destination."
        }
      ]
    },
    {
      "id": "addi",
      "title": "Add a constant",
      "kind": "instruction",
      "summary": "Add a number written in the instruction to an input register.",
      "syntax": [
        "addi rd, rs1, imm"
      ],
      "rules": [
        "imm is an immediate: a number written directly in the instruction. It must be from -2048 to 2047.",
        "The immediate is extended to 64 bits by copying its sign bit. The instruction stores the low 64 bits of the sum."
      ],
      "examples": [
        {
          "id": "addi-negative",
          "setup": "li t0, 18",
          "instruction": "addi t2, t0, -3",
          "watch": [
            "t0",
            "t2"
          ],
          "explanation": "The negative immediate reduces the input value. The input register stays unchanged unless it is also the destination."
        }
      ],
      "mistakes": [
        {
          "source": "addi t2, t0, 2048",
          "explanation": "The signed immediate must be from -2048 to 2047. Load a larger constant with li and use add."
        }
      ]
    },
    {
      "id": "addiw",
      "title": "Add a constant and keep a signed 32-bit result",
      "kind": "instruction",
      "summary": "Add the constant, keep the low 32 result bits, then copy bit 31 into the upper 32 bits.",
      "syntax": [
        "addiw rd, rs1, imm"
      ],
      "rules": [
        "imm is a number written directly in the instruction. It must be from -2048 to 2047.",
        "The W result is sign-extended to the full 64-bit destination. The upper bits therefore become all zeros or all ones.",
        "An immediate of zero sign-extends the low 32 input bits without changing those low bits."
      ],
      "examples": [
        {
          "id": "addiw-boundary",
          "setup": "li t0, 0x7fffffff",
          "instruction": "addiw t2, t0, 1",
          "watch": [
            "t0",
            "t2"
          ],
          "explanation": "The addition sets the retained result’s bit 31. ADDIW copies this bit through the upper 32 destination bits."
        }
      ],
      "mistakes": [
        {
          "source": "addiw t2, t0, 2048",
          "explanation": "The immediate must be from -2048 to 2047. Use a register operation for a larger constant."
        }
      ]
    },
    {
      "id": "addw",
      "title": "Add and keep a signed 32-bit result",
      "kind": "instruction",
      "summary": "Add the inputs, keep the low 32 bits, then copy bit 31 into the upper 32 bits.",
      "syntax": [
        "addw rd, rs1, rs2"
      ],
      "rules": [
        "The W suffix selects a 32-bit result. The input registers are still 64 bits wide.",
        "Copying bit 31 into the upper bits is sign extension. The upper half becomes all ones when bit 31 is one."
      ],
      "examples": [
        {
          "id": "addw-sign-extension",
          "setup": "li t0, 0x7fffffff\nli t1, 1",
          "instruction": "addw t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "The addition sets bit 31 of the retained 32-bit result. ADDW copies that bit into every upper bit of the 64-bit destination."
        }
      ],
      "mistakes": [
        {
          "source": "addw t2, t0",
          "explanation": "Supply both input registers. The W suffix changes the result width, not the number of operands."
        }
      ]
    },
    {
      "id": "and",
      "title": "Keep bits set in both inputs",
      "kind": "instruction",
      "summary": "Write a one at each bit position where both input bits are one.",
      "syntax": [
        "and rd, rs1, rs2"
      ],
      "rules": [
        "The operation compares corresponding bits across all 64 positions.",
        "A mask is a bit pattern used to select positions. A one in the mask allows the corresponding input bit to remain set."
      ],
      "examples": [
        {
          "id": "and-mask",
          "setup": "li t0, 0b1101\nli t1, 0b1010",
          "instruction": "and t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "A bit remains set only where both inputs have a one. This selects the input bits allowed by the mask."
        }
      ],
      "mistakes": [
        {
          "source": "and t2, t0",
          "explanation": "Supply two input registers after the destination."
        }
      ]
    },
    {
      "id": "andi",
      "title": "Keep bits selected by a constant",
      "kind": "instruction",
      "summary": "Keep an input bit only where the corresponding bit in the constant is one.",
      "syntax": [
        "andi rd, rs1, imm"
      ],
      "rules": [
        "imm must be from -2048 to 2047. It is extended to 64 bits by copying its sign bit before the AND.",
        "A negative immediate can therefore have ones in the upper bit positions. Use li and and for a mask this immediate cannot encode."
      ],
      "examples": [
        {
          "id": "andi-low-bits",
          "setup": "li t0, 0x12ab",
          "instruction": "andi t2, t0, 0xff",
          "watch": [
            "t0",
            "t2"
          ],
          "explanation": "The positive immediate has ones in its low eight positions and zeros above them. Only the low eight input bits remain."
        }
      ],
      "mistakes": [
        {
          "source": "andi t2, t0, 0xfff",
          "explanation": "The spelling 0xfff is positive 4095, outside the signed immediate range. Use -1 for an all-ones immediate, or load a wider mask into a register."
        }
      ]
    },
    {
      "id": "beq",
      "title": "Branch if equal",
      "kind": "instruction",
      "summary": "Branches to a label when the two register bit patterns match.",
      "syntax": [
        "beq rs1, rs2, label"
      ],
      "rules": [
        "Write two register names followed by a code label. A label such as matched: names the instruction location that follows it.",
        "The branch changes which instruction runs next. It does not change its input registers or write condition flags.",
        "When the condition is false, execution continues with the instruction immediately after the branch.",
        "A single machine branch reaches even byte offsets from -4096 to 4094, measured from the branch. GNU may expand a branch to a farther label."
      ],
      "examples": [
        {
          "id": "beq-taken",
          "setup": "li t0, 9\nli t1, 9",
          "instruction": "beq t0, t1, matched",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "Both inputs contain the same bits, so the next instruction is at matched.",
          "continuation": "li t2, 0\nj branch_done\nmatched:\nli t2, 1\nbranch_done:"
        },
        {
          "id": "beq-not-taken",
          "setup": "li t0, 9\nli t1, 11",
          "instruction": "beq t0, t1, matched",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "The bit patterns differ. The next instruction is the fall-through line after beq.",
          "continuation": "li t2, 0\nj branch_done\nmatched:\nli t2, 1\nbranch_done:"
        }
      ],
      "mistakes": [
        {
          "source": "beq t0, 7, matched",
          "explanation": "The second input must be a register. Load the constant into a register before comparing it."
        }
      ]
    },
    {
      "id": "beqz",
      "title": "Branch if zero",
      "kind": "pseudo",
      "summary": "Branches to a label when the input register is zero.",
      "syntax": [
        "beqz rs, label"
      ],
      "rules": [
        "This is assembler shorthand for beq rs, zero, label. The zero register always reads zero.",
        "The input register keeps its value. When it is non-zero, execution continues with the next instruction.",
        "A label ends in a colon where it is defined. Omit the colon when naming the branch target."
      ],
      "examples": [
        {
          "id": "beqz-zero",
          "setup": "li t0, 0",
          "instruction": "beqz t0, empty",
          "watch": [
            "t0"
          ],
          "explanation": "The comparison uses the zero register as its second input, so execution selects empty.",
          "continuation": "li t1, 0\nj zero_done\nempty:\nli t1, 1\nzero_done:"
        }
      ],
      "mistakes": [
        {
          "source": "beqz 0, empty",
          "explanation": "Write a register name as the input, not a number."
        }
      ]
    },
    {
      "id": "bge",
      "title": "Branch if signed greater than or equal",
      "kind": "instruction",
      "summary": "Branches when the first signed integer is at least the second.",
      "syntax": [
        "bge rs1, rs2, label"
      ],
      "rules": [
        "Write two register names followed by a code label. A label such as enough: names the instruction location that follows it.",
        "The branch changes which instruction runs next. It does not change its input registers or write condition flags.",
        "When the condition is false, execution continues with the instruction immediately after the branch.",
        "A single machine branch reaches even byte offsets from -4096 to 4094, measured from the branch. GNU may expand a branch to a farther label."
      ],
      "examples": [
        {
          "id": "bge-taken",
          "setup": "li t0, 3\nli t1, -1",
          "instruction": "bge t0, t1, enough",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "The first input is positive and the second is negative. Signed comparison selects enough.",
          "continuation": "li t2, 0\nj branch_done\nenough:\nli t2, 1\nbranch_done:"
        }
      ],
      "mistakes": [
        {
          "source": "bge t0, 7, enough",
          "explanation": "The second input must be a register. Load the constant into a register before comparing it."
        }
      ]
    },
    {
      "id": "bgeu",
      "title": "Branch if unsigned greater than or equal",
      "kind": "instruction",
      "summary": "Branches when the first unsigned register value is at least the second.",
      "syntax": [
        "bgeu rs1, rs2, label"
      ],
      "rules": [
        "Write two register names followed by a code label. A label such as enough: names the instruction location that follows it.",
        "The branch changes which instruction runs next. It does not change its input registers or write condition flags.",
        "When the condition is false, execution continues with the instruction immediately after the branch.",
        "A single machine branch reaches even byte offsets from -4096 to 4094, measured from the branch. GNU may expand a branch to a farther label."
      ],
      "examples": [
        {
          "id": "bgeu-taken",
          "setup": "li t0, -1\nli t1, 3",
          "instruction": "bgeu t0, t1, enough",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "The bits loaded by li -1 have the largest unsigned reading. Unsigned comparison selects enough.",
          "continuation": "li t2, 0\nj branch_done\nenough:\nli t2, 1\nbranch_done:"
        }
      ],
      "mistakes": [
        {
          "source": "bgeu t0, 7, enough",
          "explanation": "The second input must be a register. Load the constant into a register before comparing it."
        }
      ]
    },
    {
      "id": "blt",
      "title": "Branch if signed less than",
      "kind": "instruction",
      "summary": "Branches when the first register holds a smaller signed integer than the second.",
      "syntax": [
        "blt rs1, rs2, label"
      ],
      "rules": [
        "Write two register names followed by a code label. A label such as below: names the instruction location that follows it.",
        "The branch changes which instruction runs next. It does not change its input registers or write condition flags.",
        "When the condition is false, execution continues with the instruction immediately after the branch.",
        "A single machine branch reaches even byte offsets from -4096 to 4094, measured from the branch. GNU may expand a branch to a farther label."
      ],
      "examples": [
        {
          "id": "blt-taken",
          "setup": "li t0, -1\nli t1, 3",
          "instruction": "blt t0, t1, below",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "The first input is negative and the second is positive. Signed comparison selects below.",
          "continuation": "li t2, 0\nj branch_done\nbelow:\nli t2, 1\nbranch_done:"
        }
      ],
      "mistakes": [
        {
          "source": "blt t0, 7, below",
          "explanation": "The second input must be a register. Load the constant into a register before comparing it."
        }
      ]
    },
    {
      "id": "bltu",
      "title": "Branch if unsigned less than",
      "kind": "instruction",
      "summary": "Branches when the first unsigned register value is smaller than the second.",
      "syntax": [
        "bltu rs1, rs2, label"
      ],
      "rules": [
        "Write two register names followed by a code label. A label such as below: names the instruction location that follows it.",
        "The branch changes which instruction runs next. It does not change its input registers or write condition flags.",
        "When the condition is false, execution continues with the instruction immediately after the branch.",
        "A single machine branch reaches even byte offsets from -4096 to 4094, measured from the branch. GNU may expand a branch to a farther label."
      ],
      "examples": [
        {
          "id": "bltu-taken",
          "setup": "li t0, 3\nli t1, -1",
          "instruction": "bltu t0, t1, below",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "The bits loaded by li -1 have the largest unsigned reading. Unsigned comparison selects below.",
          "continuation": "li t2, 0\nj branch_done\nbelow:\nli t2, 1\nbranch_done:"
        }
      ],
      "mistakes": [
        {
          "source": "bltu t0, 7, below",
          "explanation": "The second input must be a register. Load the constant into a register before comparing it."
        }
      ]
    },
    {
      "id": "bne",
      "title": "Branch if not equal",
      "kind": "instruction",
      "summary": "Branches to a label when the two register bit patterns differ.",
      "syntax": [
        "bne rs1, rs2, label"
      ],
      "rules": [
        "Write two register names followed by a code label. A label such as different: names the instruction location that follows it.",
        "The branch changes which instruction runs next. It does not change its input registers or write condition flags.",
        "When the condition is false, execution continues with the instruction immediately after the branch.",
        "A single machine branch reaches even byte offsets from -4096 to 4094, measured from the branch. GNU may expand a branch to a farther label."
      ],
      "examples": [
        {
          "id": "bne-taken",
          "setup": "li t0, 9\nli t1, 11",
          "instruction": "bne t0, t1, different",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "The input bit patterns differ, so the next instruction is at different.",
          "continuation": "li t2, 0\nj branch_done\ndifferent:\nli t2, 1\nbranch_done:"
        }
      ],
      "mistakes": [
        {
          "source": "bne t0, 7, different",
          "explanation": "The second input must be a register. Load the constant into a register before comparing it."
        }
      ]
    },
    {
      "id": "call",
      "title": "Call a function",
      "kind": "pseudo",
      "summary": "Saves a return address in ra and continues at the named function.",
      "syntax": [
        "call label"
      ],
      "rules": [
        "ra holds the address at which execution should resume after the called function returns.",
        "The assembler and linker choose the machine instructions for this pseudo-instruction. A call can occupy more than one machine instruction.",
        "A nested function call overwrites ra. A function that calls another function must preserve its own incoming return address if it needs it later.",
        "By the calling convention, arguments use a0 to a7 and integer results use a0, or a0 and a1 for a two-register result."
      ],
      "examples": [
        {
          "id": "call-return-address",
          "setup": "li a0, 5",
          "instruction": "call double_reading",
          "watch": [
            "a0",
            "ra"
          ],
          "explanation": "The call writes ra and selects double_reading. The function body has not yet run in this after-state.",
          "continuation": "j call_done\ndouble_reading:\nadd a0, a0, a0\nret\ncall_done:"
        }
      ],
      "mistakes": [
        {
          "source": "call 7(t0)",
          "explanation": "This call form expects a function label. It does not use a memory offset and base register."
        }
      ]
    },
    {
      "id": "div",
      "title": "Divide signed integers",
      "kind": "instruction",
      "summary": "Divide the first signed input by the second and write the quotient.",
      "syntax": [
        "div rd, rs1, rs2"
      ],
      "rules": [
        "rs1 is the dividend; rs2 is the divisor. Both use the signed 64-bit reading.",
        "The quotient rounds towards zero. Division by zero writes an all-ones result without trapping.",
        "For the most negative signed input divided by -1, the result is that same most negative value. This special case does not trap."
      ],
      "examples": [
        {
          "id": "div-negative",
          "setup": "li t0, -19\nli t1, 4",
          "instruction": "div t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "The quotient of a negative value is rounded towards zero. This differs from an arithmetic right shift when discarded bits are non-zero."
        },
        {
          "id": "div-zero",
          "setup": "li t0, 19\nli t1, 0",
          "instruction": "div t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "A zero divisor produces an all-ones result. If your program must reject a zero divisor, test it before dividing."
        },
        {
          "id": "div-minimum",
          "setup": "li t0, 0x8000000000000000\nli t1, -1",
          "instruction": "div t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "The mathematical positive quotient does not fit a signed 64-bit result. DIV returns the original minimum signed bit pattern."
        }
      ],
      "mistakes": [
        {
          "source": "div t2, t0",
          "explanation": "Supply the divisor register as the third operand."
        }
      ]
    },
    {
      "id": "divu",
      "title": "Divide unsigned integers",
      "kind": "instruction",
      "summary": "Divide the first unsigned input by the second and write the quotient.",
      "syntax": [
        "divu rd, rs1, rs2"
      ],
      "rules": [
        "Both inputs use their unsigned 64-bit readings. A set top bit does not make an input negative.",
        "The quotient rounds down. A zero divisor writes an all-ones result without trapping."
      ],
      "examples": [
        {
          "id": "divu-high-bit",
          "setup": "li t0, -1\nli t1, 2",
          "instruction": "divu t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "LI prepares an all-ones bit pattern. DIVU reads that pattern as the largest unsigned value before dividing."
        },
        {
          "id": "divu-zero",
          "setup": "li t0, 21\nli t1, 0",
          "instruction": "divu t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "A zero divisor produces the largest unsigned bit pattern. The CPU does not reject the instruction."
        }
      ],
      "mistakes": [
        {
          "source": "divu t2, t0",
          "explanation": "Supply the divisor register as the third operand."
        }
      ]
    },
    {
      "id": "ecall",
      "title": "Ask xv6 for a service",
      "kind": "instruction",
      "summary": "Transfers control to the operating system to request a service.",
      "syntax": [
        "ecall"
      ],
      "rules": [
        "The course runs xv6 user programs. Put the xv6 system-call number in a7 and arguments in a0 to a5 before ecall.",
        "For xv6 write, use a7 = 16, a0 = the file descriptor, a1 = the byte address, and a2 = the byte count. Descriptor 1 is standard output.",
        "After write returns, a0 holds the number of bytes written, or -1 on failure. Other services have their own results. xv6 exit uses a7 = 2 and does not return.",
        "System-call numbers belong to the operating system, not the RISC-V instruction set. Linux uses different numbers. ecall takes no written operands."
      ],
      "examples": [
        {
          "id": "ecall-write",
          "setup": "li a0, 1\nla a1, lesson_data\nli a2, 2\nli a7, 16",
          "instruction": "ecall",
          "watch": [
            "a0",
            "a1",
            "a2",
            "a7"
          ],
          "explanation": "The prepared bytes are written to standard output. The after-state is captured when xv6 returns to the instruction after ecall.",
          "data": [
            65,
            10
          ]
        }
      ],
      "mistakes": [
        {
          "source": "ecall 16",
          "explanation": "Load the system-call number into a7 first. ecall itself has no operand."
        }
      ]
    },
    {
      "id": "j",
      "title": "Jump to a label",
      "kind": "pseudo",
      "summary": "Continues execution at a label without saving a return address.",
      "syntax": [
        "j label"
      ],
      "rules": [
        "This is assembler shorthand for jal zero, label. The unused return address is written to zero and discarded.",
        "A label is a name followed by a colon where it is defined. The jump names that label without the colon.",
        "A single jal reaches even byte offsets from -1048576 to 1048574. Keep the target within that range."
      ],
      "examples": [
        {
          "id": "j-skip",
          "setup": "li t0, 7",
          "instruction": "j keep_reading",
          "watch": [
            "t0",
            "ra"
          ],
          "explanation": "The jump selects keep_reading. It skips the intervening instruction and leaves ra unchanged.",
          "continuation": "li t0, 0\nkeep_reading:"
        }
      ],
      "mistakes": [
        {
          "source": "j t0, done",
          "explanation": "j takes one code label. It does not take an input register before the label."
        }
      ]
    },
    {
      "id": "la",
      "title": "Load an address",
      "kind": "pseudo",
      "summary": "Writes the address of a named code or data location into a register.",
      "syntax": [
        "la rd, symbol"
      ],
      "rules": [
        "An address identifies a location in memory. A symbol is the name the assembler and linker use for such a location.",
        "la loads the location address. It does not load the bytes stored at that location.",
        "This pseudo-instruction may expand into several machine instructions. Its expansion depends on assembler and linker settings."
      ],
      "examples": [
        {
          "id": "la-data",
          "setup": "li t0, 0",
          "instruction": "la t0, lesson_data",
          "watch": [
            "t0"
          ],
          "explanation": "The destination receives the address of the supplied data region. Use a load instruction to read the byte at that address.",
          "data": [
            23
          ]
        }
      ],
      "mistakes": [
        {
          "source": "la t0, 4(t1)",
          "explanation": "la expects a named location. For a register address plus a small byte offset, use addi."
        }
      ]
    },
    {
      "id": "lb",
      "title": "Load one byte with sign extension",
      "kind": "instruction",
      "summary": "Copies one memory byte into a register with sign extension.",
      "syntax": [
        "lb rd, offset(base)"
      ],
      "rules": [
        "Write the destination first, then offset(base). The byte address is the base register value plus the written offset.",
        "The offset is a whole number from -2048 to 2047. The base register keeps its value unless it is also the destination. Writing to zero discards the loaded value.",
        "The loaded value's top bit is copied into the remaining upper register bits. This is sign extension.",
        "In this course, multi-byte values use little-endian order: the byte at the lowest address holds the lowest eight bits."
      ],
      "examples": [
        {
          "id": "lb-data",
          "setup": "la t0, lesson_data\nli t1, 0",
          "instruction": "lb t1, 0(t0)",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "The top loaded bit is one. Inspect the upper register bits to see how the load extends it.",
          "data": [
            255,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        }
      ],
      "mistakes": [
        {
          "source": "lb t1, 2048(t0)",
          "explanation": "The written byte offset is outside -2048 to 2047. Prepare the required address in a register first."
        }
      ]
    },
    {
      "id": "lbu",
      "title": "Load one byte with zero extension",
      "kind": "instruction",
      "summary": "Copies one memory byte into a register with zero extension.",
      "syntax": [
        "lbu rd, offset(base)"
      ],
      "rules": [
        "Write the destination first, then offset(base). The byte address is the base register value plus the written offset.",
        "The offset is a whole number from -2048 to 2047. The base register keeps its value unless it is also the destination. Writing to zero discards the loaded value.",
        "The remaining upper register bits are filled with zero. This is zero extension.",
        "In this course, multi-byte values use little-endian order: the byte at the lowest address holds the lowest eight bits."
      ],
      "examples": [
        {
          "id": "lbu-data",
          "setup": "la t0, lesson_data\nli t1, 0",
          "instruction": "lbu t1, 0(t0)",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "The top loaded bit is one. Inspect the upper register bits to see how the load extends it.",
          "data": [
            255,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        }
      ],
      "mistakes": [
        {
          "source": "lbu t1, 2048(t0)",
          "explanation": "The written byte offset is outside -2048 to 2047. Prepare the required address in a register first."
        }
      ]
    },
    {
      "id": "ld",
      "title": "Load eight bytes",
      "kind": "instruction",
      "summary": "Copies 8 consecutive memory bytes into a register.",
      "syntax": [
        "ld rd, offset(base)"
      ],
      "rules": [
        "Write the destination first, then offset(base). The byte address is the base register value plus the written offset.",
        "The offset is a whole number from -2048 to 2047. The base register keeps its value unless it is also the destination. Writing to zero discards the loaded value.",
        "All 64 register bits come from the eight loaded bytes.",
        "In this course, multi-byte values use little-endian order: the byte at the lowest address holds the lowest eight bits.",
        "Use an address divisible by 8 for this 8-byte access. Misaligned access behaviour depends on the execution environment."
      ],
      "examples": [
        {
          "id": "ld-data",
          "setup": "la t0, lesson_data\nli t1, 0",
          "instruction": "ld t1, 0(t0)",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "The load copies all eight supplied bytes into the destination. The address register keeps its value.",
          "data": [
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255
          ]
        }
      ],
      "mistakes": [
        {
          "source": "ld t1, 2048(t0)",
          "explanation": "The written byte offset is outside -2048 to 2047. Prepare the required address in a register first."
        }
      ]
    },
    {
      "id": "lh",
      "title": "Load two bytes with sign extension",
      "kind": "instruction",
      "summary": "Copies 2 consecutive memory bytes into a register with sign extension.",
      "syntax": [
        "lh rd, offset(base)"
      ],
      "rules": [
        "Write the destination first, then offset(base). The byte address is the base register value plus the written offset.",
        "The offset is a whole number from -2048 to 2047. The base register keeps its value unless it is also the destination. Writing to zero discards the loaded value.",
        "The loaded value's top bit is copied into the remaining upper register bits. This is sign extension.",
        "In this course, multi-byte values use little-endian order: the byte at the lowest address holds the lowest eight bits.",
        "Use an address divisible by 2 for this 2-byte access. Misaligned access behaviour depends on the execution environment."
      ],
      "examples": [
        {
          "id": "lh-data",
          "setup": "la t0, lesson_data\nli t1, 0",
          "instruction": "lh t1, 0(t0)",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "The top loaded bit is one. Inspect the upper register bits to see how the load extends it.",
          "data": [
            255,
            255,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        }
      ],
      "mistakes": [
        {
          "source": "lh t1, 2048(t0)",
          "explanation": "The written byte offset is outside -2048 to 2047. Prepare the required address in a register first."
        }
      ]
    },
    {
      "id": "lhu",
      "title": "Load two bytes with zero extension",
      "kind": "instruction",
      "summary": "Copies 2 consecutive memory bytes into a register with zero extension.",
      "syntax": [
        "lhu rd, offset(base)"
      ],
      "rules": [
        "Write the destination first, then offset(base). The byte address is the base register value plus the written offset.",
        "The offset is a whole number from -2048 to 2047. The base register keeps its value unless it is also the destination. Writing to zero discards the loaded value.",
        "The remaining upper register bits are filled with zero. This is zero extension.",
        "In this course, multi-byte values use little-endian order: the byte at the lowest address holds the lowest eight bits.",
        "Use an address divisible by 2 for this 2-byte access. Misaligned access behaviour depends on the execution environment."
      ],
      "examples": [
        {
          "id": "lhu-data",
          "setup": "la t0, lesson_data\nli t1, 0",
          "instruction": "lhu t1, 0(t0)",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "The top loaded bit is one. Inspect the upper register bits to see how the load extends it.",
          "data": [
            255,
            255,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        }
      ],
      "mistakes": [
        {
          "source": "lhu t1, 2048(t0)",
          "explanation": "The written byte offset is outside -2048 to 2047. Prepare the required address in a register first."
        }
      ]
    },
    {
      "id": "li",
      "title": "Load a constant",
      "kind": "pseudo",
      "summary": "Ask the assembler to place a constant in a register.",
      "syntax": [
        "li rd, constant"
      ],
      "rules": [
        "LI is a pseudo-instruction: assembler shorthand that may expand into several machine instructions.",
        "The constant can be a decimal integer or use 0x for hexadecimal. It is not restricted to the 12-bit immediate range of ADDI.",
        "LI constructs a 64-bit constant. Use a minus sign for a negative decimal value; a 0x value describes the stored bit pattern."
      ],
      "examples": [
        {
          "id": "li-small",
          "setup": "",
          "instruction": "li t0, 37",
          "watch": [
            "t0"
          ],
          "explanation": "The assembler chooses machine instructions that put the requested constant in the destination."
        },
        {
          "id": "li-wide",
          "setup": "",
          "instruction": "li t0, 0x123456789abcdef0",
          "watch": [
            "t0"
          ],
          "explanation": "This constant needs several machine instructions. The after value is captured after the whole LI source line has completed."
        }
      ],
      "mistakes": [
        {
          "source": "li t0, t1",
          "explanation": "The second operand is a constant. Use mv to copy a register."
        }
      ]
    },
    {
      "id": "lui",
      "title": "Load an upper constant",
      "kind": "instruction",
      "summary": "Place a constant in bits 31 to 12, clear bits 11 to 0, then sign-extend to 64 bits.",
      "syntax": [
        "lui rd, imm20"
      ],
      "rules": [
        "Write the 20-bit constant field from 0 to 1048575, or 0x00000 to 0xfffff. LUI shifts this field left by 12 positions.",
        "Bit 31 of the resulting 32-bit value is copied into the upper 32 bits. LUI does not always create a positive 64-bit value."
      ],
      "examples": [
        {
          "id": "lui-positive",
          "setup": "",
          "instruction": "lui t0, 0x12345",
          "watch": [
            "t0"
          ],
          "explanation": "The constant field occupies bits 31 to 12. The low twelve bits are zero."
        },
        {
          "id": "lui-sign-extension",
          "setup": "",
          "instruction": "lui t0, 0x80000",
          "watch": [
            "t0"
          ],
          "explanation": "The constant field sets bit 31. LUI copies that sign bit through the upper half of the destination."
        }
      ],
      "mistakes": [
        {
          "source": "lui t0, 0x100000",
          "explanation": "This field needs more than 20 bits. Use li to ask the assembler to construct a larger constant."
        }
      ]
    },
    {
      "id": "lw",
      "title": "Load four bytes with sign extension",
      "kind": "instruction",
      "summary": "Copies 4 consecutive memory bytes into a register with sign extension.",
      "syntax": [
        "lw rd, offset(base)"
      ],
      "rules": [
        "Write the destination first, then offset(base). The byte address is the base register value plus the written offset.",
        "The offset is a whole number from -2048 to 2047. The base register keeps its value unless it is also the destination. Writing to zero discards the loaded value.",
        "The loaded value's top bit is copied into the remaining upper register bits. This is sign extension.",
        "In this course, multi-byte values use little-endian order: the byte at the lowest address holds the lowest eight bits.",
        "Use an address divisible by 4 for this 4-byte access. Misaligned access behaviour depends on the execution environment."
      ],
      "examples": [
        {
          "id": "lw-data",
          "setup": "la t0, lesson_data\nli t1, 0",
          "instruction": "lw t1, 0(t0)",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "The top loaded bit is one. Inspect the upper register bits to see how the load extends it.",
          "data": [
            255,
            255,
            255,
            255,
            0,
            0,
            0,
            0
          ]
        }
      ],
      "mistakes": [
        {
          "source": "lw t1, 2048(t0)",
          "explanation": "The written byte offset is outside -2048 to 2047. Prepare the required address in a register first."
        }
      ]
    },
    {
      "id": "lwu",
      "title": "Load four bytes with zero extension",
      "kind": "instruction",
      "summary": "Copies 4 consecutive memory bytes into a register with zero extension.",
      "syntax": [
        "lwu rd, offset(base)"
      ],
      "rules": [
        "Write the destination first, then offset(base). The byte address is the base register value plus the written offset.",
        "The offset is a whole number from -2048 to 2047. The base register keeps its value unless it is also the destination. Writing to zero discards the loaded value.",
        "The remaining upper register bits are filled with zero. This is zero extension.",
        "In this course, multi-byte values use little-endian order: the byte at the lowest address holds the lowest eight bits.",
        "Use an address divisible by 4 for this 4-byte access. Misaligned access behaviour depends on the execution environment."
      ],
      "examples": [
        {
          "id": "lwu-data",
          "setup": "la t0, lesson_data\nli t1, 0",
          "instruction": "lwu t1, 0(t0)",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "The top loaded bit is one. Inspect the upper register bits to see how the load extends it.",
          "data": [
            255,
            255,
            255,
            255,
            0,
            0,
            0,
            0
          ]
        }
      ],
      "mistakes": [
        {
          "source": "lwu t1, 2048(t0)",
          "explanation": "The written byte offset is outside -2048 to 2047. Prepare the required address in a register first."
        }
      ]
    },
    {
      "id": "mul",
      "title": "Multiply and keep the low half",
      "kind": "instruction",
      "summary": "Multiply two registers and retain the low 64 bits of the product.",
      "syntax": [
        "mul rd, rs1, rs2"
      ],
      "rules": [
        "The low 64 product bits are the same for signed and unsigned multiplication of the same input bit patterns.",
        "The full product can need 128 bits. MUL discards the upper half; use MULH or MULHU when that half matters."
      ],
      "examples": [
        {
          "id": "mul-registers",
          "setup": "li t0, 13\nli t1, 7",
          "instruction": "mul t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "The destination receives the low half of the product. The input registers keep their values."
        }
      ],
      "mistakes": [
        {
          "source": "mul t2, t0, 7",
          "explanation": "The third operand must be a register. Load the constant with li first."
        }
      ]
    },
    {
      "id": "mulh",
      "title": "Keep the high half of a signed product",
      "kind": "instruction",
      "summary": "Multiply signed 64-bit inputs and write bits 127 to 64 of the 128-bit product.",
      "syntax": [
        "mulh rd, rs1, rs2"
      ],
      "rules": [
        "Both inputs use the signed reading. The H suffix selects the high half of the full product.",
        "Use MUL for the low half. Use MULHU for the high half when both inputs are unsigned."
      ],
      "examples": [
        {
          "id": "mulh-negative",
          "setup": "li t0, -2\nli t1, 3",
          "instruction": "mulh t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "The full signed product is negative. Its high half contains the upper sign bits, rather than the small product magnitude."
        }
      ],
      "mistakes": [
        {
          "source": "mulh t2, t0, 3",
          "explanation": "The third operand is a register, not an immediate constant."
        }
      ]
    },
    {
      "id": "mulhsu",
      "title": "Keep the high half of a mixed signed and unsigned product",
      "kind": "instruction",
      "summary": "Multiply a signed first input by an unsigned second input and write bits 127 to 64 of the full product.",
      "syntax": [
        "mulhsu rd, rs1, rs2"
      ],
      "rules": [
        "The first input uses the signed reading; the second uses the unsigned reading. Swapping their positions can change the result.",
        "Use MUL for the low half. MULH reads both inputs as signed; MULHU reads both as unsigned."
      ],
      "examples": [
        {
          "id": "mulhsu-mixed",
          "setup": "li t0, -2\nli t1, -1",
          "instruction": "mulhsu t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "The first input is negative. The second input’s all-ones pattern is read as the largest unsigned value. The destination holds the high half of that mixed product."
        }
      ],
      "mistakes": [
        {
          "source": "mulhsu t2, t0, 2",
          "explanation": "Both input operands must be registers. Load a constant with li first."
        }
      ]
    },
    {
      "id": "mulhu",
      "title": "Keep the high half of an unsigned product",
      "kind": "instruction",
      "summary": "Multiply unsigned 64-bit inputs and write bits 127 to 64 of the 128-bit product.",
      "syntax": [
        "mulhu rd, rs1, rs2"
      ],
      "rules": [
        "Both inputs use the unsigned reading. The U suffix changes the meaning of a set top bit.",
        "Use MUL for the low half. Together, separate MUL and MULHU results can represent the full unsigned product."
      ],
      "examples": [
        {
          "id": "mulhu-large",
          "setup": "li t0, -2\nli t1, 3",
          "instruction": "mulhu t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "The first input has a large unsigned reading. Its full product extends beyond the low 64 bits, so the high half is non-zero."
        }
      ],
      "mistakes": [
        {
          "source": "mulhu t2, t0, 3",
          "explanation": "Load the constant into a register before multiplying."
        }
      ]
    },
    {
      "id": "mulw",
      "title": "Multiply and keep a signed 32-bit result",
      "kind": "instruction",
      "summary": "Multiply the low 32 input bits, keep the low 32 product bits, then sign-extend to 64 bits.",
      "syntax": [
        "mulw rd, rs1, rs2"
      ],
      "rules": [
        "Sign extension copies bit 31 of the retained result into every upper destination bit. The registers remain 64 bits wide.",
        "MULW discards the product bits above position 31. A later wider operation cannot recover those discarded bits."
      ],
      "examples": [
        {
          "id": "mulw-sign-extension",
          "setup": "li t0, 0x7fffffff\nli t1, 2",
          "instruction": "mulw t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "The product’s retained bit 31 is one. MULW fills the upper half with ones instead of retaining the upper half of the full product."
        }
      ],
      "mistakes": [
        {
          "source": "mulw t2, t0, 2",
          "explanation": "The third operand is a register. Load the constant into a register first."
        }
      ]
    },
    {
      "id": "mv",
      "title": "Copy a register",
      "kind": "pseudo",
      "summary": "Copy all 64 bits from the input register into the destination.",
      "syntax": [
        "mv rd, rs"
      ],
      "rules": [
        "MV is a pseudo-instruction equivalent to addi rd, rs, 0.",
        "The input register is read, not cleared. Choosing zero as the destination discards the result; that register always reads zero."
      ],
      "examples": [
        {
          "id": "mv-copy",
          "setup": "li t0, 29",
          "instruction": "mv t2, t0",
          "watch": [
            "t0",
            "t2"
          ],
          "explanation": "Both registers contain the same bits afterwards. Copying does not remove the original value."
        }
      ],
      "mistakes": [
        {
          "source": "mv t0, 12",
          "explanation": "MV copies a register. Use li to load a constant."
        }
      ]
    },
    {
      "id": "not",
      "title": "Invert every bit",
      "kind": "pseudo",
      "summary": "Replace each zero input bit with one, and each one with zero.",
      "syntax": [
        "not rd, rs"
      ],
      "rules": [
        "NOT is a pseudo-instruction equivalent to xori rd, rs, -1.",
        "It inverts all 64 bits. This is a bitwise operation, not the C logical-not operation that produces only zero or one."
      ],
      "examples": [
        {
          "id": "not-bits",
          "setup": "li t0, 0b0101",
          "instruction": "not t2, t0",
          "watch": [
            "t0",
            "t2"
          ],
          "explanation": "The upper zero input bits also become ones. Inspect the hexadecimal reading as well as the signed reading."
        }
      ],
      "mistakes": [
        {
          "source": "not t2, t0, t1",
          "explanation": "NOT has one input register. Use xor for two inputs."
        }
      ]
    },
    {
      "id": "or",
      "title": "Set bits present in either input",
      "kind": "instruction",
      "summary": "Write a one at each position where either input bit is one.",
      "syntax": [
        "or rd, rs1, rs2"
      ],
      "rules": [
        "The operation combines corresponding bits across all 64 positions.",
        "A one in a mask sets the corresponding output bit. A zero in the mask leaves the other input bit unchanged."
      ],
      "examples": [
        {
          "id": "or-mask",
          "setup": "li t0, 0b0101\nli t1, 0b1010",
          "instruction": "or t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "The result combines the set bits from both input registers."
        }
      ],
      "mistakes": [
        {
          "source": "or t2, t0",
          "explanation": "Supply the second input register."
        }
      ]
    },
    {
      "id": "ori",
      "title": "Set bits selected by a constant",
      "kind": "instruction",
      "summary": "Set an output bit where either the input bit or the corresponding constant bit is one.",
      "syntax": [
        "ori rd, rs1, imm"
      ],
      "rules": [
        "imm must be from -2048 to 2047. Its sign bit is copied into the upper positions before the OR.",
        "A positive immediate affects only its set low bits. A negative immediate can set upper bits too."
      ],
      "examples": [
        {
          "id": "ori-mask",
          "setup": "li t0, 0b0101",
          "instruction": "ori t2, t0, 0b1000",
          "watch": [
            "t0",
            "t2"
          ],
          "explanation": "The constant sets a selected bit without clearing the input bits that were already one."
        }
      ],
      "mistakes": [
        {
          "source": "ori t2, t0, 2048",
          "explanation": "The immediate is outside the signed 12-bit range. Load a wider mask into a register and use or."
        }
      ]
    },
    {
      "id": "rem",
      "title": "Find a signed remainder",
      "kind": "instruction",
      "summary": "Write the remainder from signed division of the first input by the second.",
      "syntax": [
        "rem rd, rs1, rs2"
      ],
      "rules": [
        "The quotient used for the remainder rounds towards zero. A non-zero remainder has the dividend’s sign.",
        "A zero divisor returns the dividend. The minimum signed input divided by -1 has a zero remainder. Neither case traps."
      ],
      "examples": [
        {
          "id": "rem-negative",
          "setup": "li t0, -19\nli t1, 4",
          "instruction": "rem t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "The remainder follows the dividend’s sign. Combining the quotient times the divisor with this remainder recovers the dividend."
        },
        {
          "id": "rem-zero",
          "setup": "li t0, 19\nli t1, 0",
          "instruction": "rem t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "For a zero divisor, REM returns the original dividend. The CPU does not raise a division-by-zero exception."
        }
      ],
      "mistakes": [
        {
          "source": "rem t2, t0, 4",
          "explanation": "The divisor is a register operand. Load a constant into a register first."
        }
      ]
    },
    {
      "id": "remu",
      "title": "Find an unsigned remainder",
      "kind": "instruction",
      "summary": "Write the remainder from unsigned division of the first input by the second.",
      "syntax": [
        "remu rd, rs1, rs2"
      ],
      "rules": [
        "Both inputs use their unsigned 64-bit readings. A set top bit contributes a positive place value.",
        "For a non-zero divisor the remainder is smaller than the divisor. A zero divisor returns the dividend without trapping."
      ],
      "examples": [
        {
          "id": "remu-unsigned",
          "setup": "li t0, -1\nli t1, 4",
          "instruction": "remu t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "The first input’s all-ones pattern is read as the largest unsigned value. REMU keeps its remainder after division by the second input."
        },
        {
          "id": "remu-zero",
          "setup": "li t0, 21\nli t1, 0",
          "instruction": "remu t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "A zero divisor returns the original dividend. Test the divisor before REMU if your program must reject that case."
        }
      ],
      "mistakes": [
        {
          "source": "remu t2, t0, 4",
          "explanation": "The divisor is a register operand. Load the constant into a register first."
        }
      ]
    },
    {
      "id": "ret",
      "title": "Return through ra",
      "kind": "pseudo",
      "summary": "Continues at the return address held in ra.",
      "syntax": [
        "ret"
      ],
      "rules": [
        "This is assembler shorthand for jalr zero, 0(ra). The target address has its lowest bit cleared.",
        "ret has no written operands. It selects where execution continues; it does not copy a result into a0.",
        "An ordinary call supplies ra. A top-level lesson fragment has no ordinary caller, so do not finish that fragment with ret."
      ],
      "examples": [
        {
          "id": "ret-prepared-address",
          "setup": "li a0, 7\nla ra, returned",
          "instruction": "ret",
          "watch": [
            "a0",
            "ra"
          ],
          "explanation": "This independent example prepares ra with the address of returned. ret selects that address and leaves a0 unchanged.",
          "continuation": "li a0, 0\nreturned:"
        }
      ],
      "mistakes": [
        {
          "source": "ret a0",
          "explanation": "ret does not take a result register. Put the result in a0 before returning."
        }
      ]
    },
    {
      "id": "sb",
      "title": "Store one byte",
      "kind": "instruction",
      "summary": "Copies the lowest 8 register bits into one memory byte.",
      "syntax": [
        "sb rs, offset(base)"
      ],
      "rules": [
        "Write the source register first, then offset(base). The byte address is the base register value plus the written offset.",
        "The offset is a whole number from -2048 to 2047. Both the source and base registers keep their values.",
        "Only the lowest 8 source bits are stored.",
        "In this course, multi-byte values use little-endian order: the lowest eight source bits go to the lowest byte address."
      ],
      "examples": [
        {
          "id": "sb-data",
          "setup": "la t0, lesson_data\nli t1, 0x123456789abcdef0",
          "instruction": "sb t1, 0(t0)",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "Inspect the bytes in the supplied data region. The store copies source bits into memory while both input registers keep their values.",
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        }
      ],
      "mistakes": [
        {
          "source": "sb t1, 2048(t0)",
          "explanation": "The written byte offset is outside -2048 to 2047. Prepare the required address in a register first."
        }
      ]
    },
    {
      "id": "sd",
      "title": "Store eight bytes",
      "kind": "instruction",
      "summary": "Copies the lowest 64 register bits into 8 consecutive memory bytes.",
      "syntax": [
        "sd rs, offset(base)"
      ],
      "rules": [
        "Write the source register first, then offset(base). The byte address is the base register value plus the written offset.",
        "The offset is a whole number from -2048 to 2047. Both the source and base registers keep their values.",
        "All 64 source bits are stored in eight consecutive bytes.",
        "In this course, multi-byte values use little-endian order: the lowest eight source bits go to the lowest byte address.",
        "Use an address divisible by 8 for this 8-byte access. Misaligned access behaviour depends on the execution environment."
      ],
      "examples": [
        {
          "id": "sd-data",
          "setup": "la t0, lesson_data\nli t1, 0x123456789abcdef0",
          "instruction": "sd t1, 0(t0)",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "Inspect the bytes in the supplied data region. The store copies source bits into memory while both input registers keep their values.",
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        }
      ],
      "mistakes": [
        {
          "source": "sd t1, 2048(t0)",
          "explanation": "The written byte offset is outside -2048 to 2047. Prepare the required address in a register first."
        }
      ]
    },
    {
      "id": "sh",
      "title": "Store two bytes",
      "kind": "instruction",
      "summary": "Copies the lowest 16 register bits into 2 consecutive memory bytes.",
      "syntax": [
        "sh rs, offset(base)"
      ],
      "rules": [
        "Write the source register first, then offset(base). The byte address is the base register value plus the written offset.",
        "The offset is a whole number from -2048 to 2047. Both the source and base registers keep their values.",
        "Only the lowest 16 source bits are stored.",
        "In this course, multi-byte values use little-endian order: the lowest eight source bits go to the lowest byte address.",
        "Use an address divisible by 2 for this 2-byte access. Misaligned access behaviour depends on the execution environment."
      ],
      "examples": [
        {
          "id": "sh-data",
          "setup": "la t0, lesson_data\nli t1, 0x123456789abcdef0",
          "instruction": "sh t1, 0(t0)",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "Inspect the bytes in the supplied data region. The store copies source bits into memory while both input registers keep their values.",
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        }
      ],
      "mistakes": [
        {
          "source": "sh t1, 2048(t0)",
          "explanation": "The written byte offset is outside -2048 to 2047. Prepare the required address in a register first."
        }
      ]
    },
    {
      "id": "slli",
      "title": "Shift bits left by a constant",
      "kind": "instruction",
      "summary": "Move the input bits left and fill the vacated low positions with zeros.",
      "syntax": [
        "slli rd, rs1, shamt"
      ],
      "rules": [
        "shamt is the shift amount written in the instruction. For this RV64 instruction it must be from 0 to 63.",
        "Bits shifted beyond position 63 are discarded. Unlike a register-count shift, an out-of-range immediate is not masked to six bits."
      ],
      "examples": [
        {
          "id": "slli-positions",
          "setup": "li t0, 0b1011",
          "instruction": "slli t2, t0, 3",
          "watch": [
            "t0",
            "t2"
          ],
          "explanation": "Every set bit moves three positions left. The new low positions contain zeros."
        }
      ],
      "mistakes": [
        {
          "source": "slli t2, t0, 64",
          "explanation": "An RV64 immediate shift amount must be from 0 to 63. A shift by 64 needs different code."
        }
      ]
    },
    {
      "id": "slt",
      "title": "Compare signed integers",
      "kind": "instruction",
      "summary": "Write one if the first signed input is smaller than the second; otherwise write zero.",
      "syntax": [
        "slt rd, rs1, rs2"
      ],
      "rules": [
        "Both inputs use the signed 64-bit reading. A set top bit makes a value negative.",
        "The result is an ordinary register value. RISC-V does not put this comparison into condition flags."
      ],
      "examples": [
        {
          "id": "slt-signed",
          "setup": "li t0, -1\nli t1, 2",
          "instruction": "slt t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "The comparison uses the signed readings. The destination records whether the first input is smaller."
        }
      ],
      "mistakes": [
        {
          "source": "slt t2, t0",
          "explanation": "Supply both input registers. SLTI is the explicit instruction name for a register compared with a constant."
        }
      ]
    },
    {
      "id": "slti",
      "title": "Compare a signed register with a constant",
      "kind": "instruction",
      "summary": "Write one if the signed input is smaller than the constant; otherwise write zero.",
      "syntax": [
        "slti rd, rs1, imm"
      ],
      "rules": [
        "imm must be from -2048 to 2047. It is extended by copying its sign bit before comparison.",
        "Both operands use the signed reading. The destination holds only zero or one."
      ],
      "examples": [
        {
          "id": "slti-threshold",
          "setup": "li t0, -3",
          "instruction": "slti t2, t0, 0",
          "watch": [
            "t0",
            "t2"
          ],
          "explanation": "Comparing with zero tests whether the signed input is negative. The input register stays unchanged."
        }
      ],
      "mistakes": [
        {
          "source": "slti t2, t0, 2048",
          "explanation": "The immediate must fit the signed 12-bit range. Load a larger threshold into a register and use slt."
        }
      ]
    },
    {
      "id": "sltu",
      "title": "Compare unsigned integers",
      "kind": "instruction",
      "summary": "Write one if the first unsigned input is smaller than the second; otherwise write zero.",
      "syntax": [
        "sltu rd, rs1, rs2"
      ],
      "rules": [
        "The U suffix selects unsigned readings. A set top bit contributes a positive place value.",
        "The destination holds zero or one. This comparison can check whether an unsigned addition wrapped by comparing its result with an input."
      ],
      "examples": [
        {
          "id": "sltu-unsigned",
          "setup": "li t0, -1\nli t1, 2",
          "instruction": "sltu t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "The all-ones first input is read as a large unsigned value. The same bits compared with SLT have a different ordering."
        }
      ],
      "mistakes": [
        {
          "source": "sltu t2, t0",
          "explanation": "Supply both input registers to compare."
        }
      ]
    },
    {
      "id": "srai",
      "title": "Shift right while retaining the sign",
      "kind": "instruction",
      "summary": "Move bits right and fill the upper positions by copying the input’s top bit.",
      "syntax": [
        "srai rd, rs1, shamt"
      ],
      "rules": [
        "shamt must be from 0 to 63. The instruction uses all 64 input bits.",
        "This is an arithmetic right shift. For a negative signed value it rounds down, which can differ from signed division rounding towards zero."
      ],
      "examples": [
        {
          "id": "srai-negative",
          "setup": "li t0, -19",
          "instruction": "srai t2, t0, 2",
          "watch": [
            "t0",
            "t2"
          ],
          "explanation": "The input is negative, so the new upper positions contain ones. Discarding low bits rounds this signed result down."
        }
      ],
      "mistakes": [
        {
          "source": "srai t2, t0, 64",
          "explanation": "The immediate shift amount must be from 0 to 63."
        }
      ]
    },
    {
      "id": "srli",
      "title": "Shift right and fill with zeros",
      "kind": "instruction",
      "summary": "Move bits right and fill the vacated upper positions with zeros.",
      "syntax": [
        "srli rd, rs1, shamt"
      ],
      "rules": [
        "shamt must be from 0 to 63. Bits shifted below position zero are discarded.",
        "This is a logical right shift. It does not copy the sign bit; use srai when the signed reading must retain its sign."
      ],
      "examples": [
        {
          "id": "srli-high-bit",
          "setup": "li t0, -1",
          "instruction": "srli t2, t0, 1",
          "watch": [
            "t0",
            "t2"
          ],
          "explanation": "The input has every bit set. The shift replaces the top bit with zero, even though the input’s signed reading was negative."
        }
      ],
      "mistakes": [
        {
          "source": "srli t2, t0, -1",
          "explanation": "The shift amount must be from 0 to 63. A negative amount does not reverse the direction."
        }
      ]
    },
    {
      "id": "sub",
      "title": "Subtract two registers",
      "kind": "instruction",
      "summary": "Subtract the second input from the first and retain the low 64 result bits.",
      "syntax": [
        "sub rd, rs1, rs2"
      ],
      "rules": [
        "The operand order matters: rd receives rs1 minus rs2.",
        "The result wraps to 64 bits. The instruction does not write carry, borrow or signed-overflow flags."
      ],
      "examples": [
        {
          "id": "sub-order",
          "setup": "li t0, 23\nli t1, 9",
          "instruction": "sub t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "The second input is subtracted from the first. Both input registers keep their values."
        },
        {
          "id": "sub-wrap",
          "setup": "li t0, 0\nli t1, 1",
          "instruction": "sub t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "Subtracting one from zero wraps to an all-ones result. Its signed and unsigned decimal readings describe the same stored bits."
        }
      ],
      "mistakes": [
        {
          "source": "sub t2, t0, 1",
          "explanation": "SUB needs two input registers. Use addi with a negative immediate to subtract a small constant."
        }
      ]
    },
    {
      "id": "subw",
      "title": "Subtract and keep a signed 32-bit result",
      "kind": "instruction",
      "summary": "Subtract the second input from the first, keep the low 32 bits, then sign-extend to 64 bits.",
      "syntax": [
        "subw rd, rs1, rs2"
      ],
      "rules": [
        "The operand order is rs1 minus rs2. The upper input bits do not affect the retained low 32 result bits.",
        "Sign extension copies the retained result’s bit 31 into every upper destination bit. SUBW does not write condition flags."
      ],
      "examples": [
        {
          "id": "subw-wrap",
          "setup": "li t0, 0\nli t1, 1",
          "instruction": "subw t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "The subtraction wraps within the retained 32 bits. Their top bit is one, so the upper 32 destination bits are also filled with ones."
        }
      ],
      "mistakes": [
        {
          "source": "subw t2, t0, 1",
          "explanation": "SUBW needs two input registers. ADDIW with a negative immediate can subtract a small constant."
        }
      ]
    },
    {
      "id": "sw",
      "title": "Store four bytes",
      "kind": "instruction",
      "summary": "Copies the lowest 32 register bits into 4 consecutive memory bytes.",
      "syntax": [
        "sw rs, offset(base)"
      ],
      "rules": [
        "Write the source register first, then offset(base). The byte address is the base register value plus the written offset.",
        "The offset is a whole number from -2048 to 2047. Both the source and base registers keep their values.",
        "Only the lowest 32 source bits are stored.",
        "In this course, multi-byte values use little-endian order: the lowest eight source bits go to the lowest byte address.",
        "Use an address divisible by 4 for this 4-byte access. Misaligned access behaviour depends on the execution environment."
      ],
      "examples": [
        {
          "id": "sw-data",
          "setup": "la t0, lesson_data\nli t1, 0x123456789abcdef0",
          "instruction": "sw t1, 0(t0)",
          "watch": [
            "t0",
            "t1"
          ],
          "explanation": "Inspect the bytes in the supplied data region. The store copies source bits into memory while both input registers keep their values.",
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        }
      ],
      "mistakes": [
        {
          "source": "sw t1, 2048(t0)",
          "explanation": "The written byte offset is outside -2048 to 2047. Prepare the required address in a register first."
        }
      ]
    },
    {
      "id": "xor",
      "title": "Set bits where the inputs differ",
      "kind": "instruction",
      "summary": "Write a one where the corresponding input bits differ, and zero where they match.",
      "syntax": [
        "xor rd, rs1, rs2"
      ],
      "rules": [
        "XOR acts on each of the 64 bit positions independently.",
        "A one in a mask flips the corresponding input bit. A zero leaves it unchanged."
      ],
      "examples": [
        {
          "id": "xor-mask",
          "setup": "li t0, 0b1100\nli t1, 0b1010",
          "instruction": "xor t2, t0, t1",
          "watch": [
            "t0",
            "t1",
            "t2"
          ],
          "explanation": "Positions with different input bits become one. Matching positions become zero."
        }
      ],
      "mistakes": [
        {
          "source": "xor t2, t0",
          "explanation": "Supply the second input register or use xori for a constant mask."
        }
      ]
    },
    {
      "id": "xori",
      "title": "Flip bits selected by a constant",
      "kind": "instruction",
      "summary": "Flip each input bit selected by a one in the constant; keep the other input bits.",
      "syntax": [
        "xori rd, rs1, imm"
      ],
      "rules": [
        "imm must be from -2048 to 2047. Its sign bit is copied into upper positions before the XOR.",
        "An immediate of -1 has every bit set after extension, so it inverts all 64 input bits."
      ],
      "examples": [
        {
          "id": "xori-mask",
          "setup": "li t0, 0b1100",
          "instruction": "xori t2, t0, 0b0101",
          "watch": [
            "t0",
            "t2"
          ],
          "explanation": "Only positions selected by a one in the constant are inverted. Other input bits keep their values."
        }
      ],
      "mistakes": [
        {
          "source": "xori t2, t0, 0xffff",
          "explanation": "This positive constant is outside the signed 12-bit range. Use li and xor for a wider mask."
        }
      ]
    }
  ],
  "used": {
    "addition": [
      "li",
      "add"
    ],
    "constants-and-inputs": [
      "li",
      "addi",
      "add"
    ],
    "register-reuse": [
      "li",
      "add",
      "sub"
    ],
    "instruction-order": [
      "li",
      "add",
      "addi"
    ],
    "zero-register": [
      "li",
      "add",
      "sub",
      "addi"
    ],
    "hexadecimal": [
      "li",
      "addi"
    ],
    "signed-readings": [
      "li",
      "addi"
    ],
    "building-constants": [
      "lui",
      "addi",
      "add"
    ],
    "word-arithmetic": [
      "li",
      "add",
      "addw",
      "subw",
      "addiw"
    ],
    "addition-wraps": [
      "li",
      "add",
      "addi"
    ],
    "carry-without-flags": [
      "li",
      "add",
      "sltu"
    ],
    "signed-overflow": [
      "li",
      "add",
      "slti",
      "slt",
      "xor"
    ],
    "elapsed-time": [
      "li",
      "sub"
    ],
    "bit-masks": [
      "li",
      "andi",
      "addi",
      "and"
    ],
    "set-clear-toggle": [
      "li",
      "ori",
      "andi",
      "xori",
      "or"
    ],
    "logical-shifts": [
      "li",
      "srli",
      "andi",
      "slli",
      "or"
    ],
    "arithmetic-shifts": [
      "li",
      "srai",
      "srli"
    ],
    "compare-values": [
      "li",
      "slt"
    ],
    "signed-unsigned-comparison": [
      "li",
      "slt",
      "sltu"
    ],
    "branch-paths": [
      "li",
      "bgeu",
      "beq",
      "bne",
      "blt",
      "bge",
      "bltu",
      "j"
    ],
    "choosing-maximum": [
      "li",
      "bge",
      "mv",
      "j",
      "bgeu"
    ],
    "counting-up": [
      "li",
      "bgeu",
      "add",
      "addi",
      "j"
    ],
    "counting-down": [
      "li",
      "mv",
      "beq",
      "srli",
      "addi",
      "bne"
    ],
    "test-before-body": [
      "li",
      "bgeu",
      "addi",
      "j",
      "bltu"
    ],
    "stopping-sentinel": [
      "li",
      "mv",
      "beq",
      "srli",
      "addi",
      "bne"
    ],
    "memory-bytes": [
      "la",
      "lbu",
      "li"
    ],
    "loads-and-stores": [
      "la",
      "ld",
      "sd",
      "lbu",
      "li"
    ],
    "load-widths": [
      "la",
      "lb",
      "lbu",
      "li",
      "lw",
      "lwu",
      "lh",
      "lhu"
    ],
    "narrowing-stores": [
      "la",
      "li",
      "sb",
      "lbu",
      "sh",
      "lhu",
      "sw"
    ],
    "array-addresses": [
      "la",
      "li",
      "slli",
      "add",
      "lwu"
    ],
    "sum-array": [
      "li",
      "la",
      "bgeu",
      "lwu",
      "add",
      "addi",
      "j"
    ],
    "zero-terminated-strings": [
      "li",
      "la",
      "bgeu",
      "lbu",
      "beq",
      "addi",
      "j",
      "sb"
    ],
    "products": [
      "li",
      "mul",
      "add",
      "mulw"
    ],
    "high-products": [
      "li",
      "mulh",
      "mulhu",
      "mul",
      "mulhsu"
    ],
    "division-remainders": [
      "li",
      "div",
      "rem",
      "divu",
      "remu"
    ],
    "safe-scaling": [
      "li",
      "mul",
      "divu",
      "beqz",
      "j",
      "mulw"
    ],
    "calls-and-returns": [
      "li",
      "call",
      "addi",
      "j",
      "srli",
      "ret",
      "slli"
    ],
    "preserving-return-address": [
      "li",
      "call",
      "j",
      "addi",
      "sd",
      "ld",
      "ret",
      "srli"
    ],
    "stack-frames": [
      "li",
      "mv",
      "addi",
      "sd",
      "ld",
      "sub",
      "call",
      "j",
      "add",
      "ret",
      "srli"
    ],
    "recursive-progress": [
      "li",
      "call",
      "j",
      "beqz",
      "addi",
      "sd",
      "srli",
      "ld",
      "add",
      "ret",
      "beq"
    ],
    "debug-loop-boundary": [
      "la",
      "li",
      "bltu",
      "add",
      "lbu",
      "addi",
      "j",
      "bgeu",
      "sb"
    ],
    "debug-load-width": [
      "la",
      "lb",
      "mul",
      "lbu",
      "li",
      "sb"
    ],
    "debug-return-address": [
      "call",
      "j",
      "addi",
      "sd",
      "ld",
      "ret",
      "slli"
    ],
    "debug-memory-boundary": [
      "la",
      "add",
      "lbu",
      "bltu",
      "li",
      "bgeu"
    ],
    "c-return-values": [],
    "c-decisions": [],
    "c-loops": [],
    "c-memory": [],
    "c-integer-widths": [],
    "c-overflow-contracts": [],
    "checked-addition": [],
    "system-calls": [
      "li",
      "la",
      "ecall",
      "mv"
    ],
    "elf-entry": [
      "li",
      "call",
      "j",
      "addi",
      "add",
      "ret",
      "mv",
      "sub"
    ],
    "memory-protection": [
      "la",
      "lbu",
      "addi",
      "add",
      "li",
      "bgeu"
    ],
    "complete-assembly-program": [
      "call",
      "li",
      "ecall",
      "la",
      "ret"
    ],
    "trip-computer": [
      "la",
      "li",
      "bgeu",
      "lbu",
      "and",
      "beqz",
      "lhu",
      "add",
      "addi",
      "j",
      "mv",
      "call",
      "mul",
      "ret"
    ],
    "boot-trip-computer": [
      "la",
      "call",
      "li",
      "beq",
      "lwu",
      "add",
      "addi",
      "j",
      "sd",
      "sb",
      "remu",
      "divu",
      "bne",
      "mv",
      "ld",
      "ret",
      "lbu",
      "andi"
    ],
    "twos-complement": [
      "li",
      "not",
      "addi"
    ],
    "riscv-and-arm": [
      "li",
      "add",
      "sltu",
      "mv",
      "bge",
      "bgeu"
    ],
    "floating-point-bits": [
      "la",
      "lwu",
      "srli",
      "andi",
      "slti"
    ]
  }
};
