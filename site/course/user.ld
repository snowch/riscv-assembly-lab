OUTPUT_ARCH(riscv)
ENTRY(_start)
SECTIONS
{
  /* Keep this user program clear of the shell's small text range for breakpoints. */
  . = 0x10000;
  .text : { *(.text*) }
  .rodata : { *(.rodata*) }
  . = ALIGN(4096);
  .data : { *(.data*) *(.sdata*) }
  .bss : { *(.bss*) *(.sbss*) *(COMMON) }
  . = ALIGN(. + 64, 4096) - 64;
  .lesson_data : { *(.lesson_data) }
}
