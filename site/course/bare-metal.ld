OUTPUT_ARCH(riscv)
ENTRY(_start)

MEMORY
{
  RAM (rwx) : ORIGIN = 0x80000000, LENGTH = 16M
}

PHDRS
{
  code PT_LOAD FLAGS(5);
  data PT_LOAD FLAGS(6);
}

SECTIONS
{
  .text : { KEEP(*(.text.boot)) *(.text .text.*) } > RAM :code
  .rodata : { *(.rodata .rodata.*) } > RAM :code
  .data : { *(.data .data.* .sdata .sdata.*) } > RAM :data
  .bss (NOLOAD) :
  {
    *(.bss .bss.* .sbss .sbss.* COMMON)
    . = ALIGN(16);
    . += 4096;
    __stack_top = .;
  } > RAM :data

  ASSERT(_start == ORIGIN(RAM), "_start must be the first instruction in .text.boot")
}
