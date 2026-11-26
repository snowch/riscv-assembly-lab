.section .rodata
message:
    .ascii "Trip ready\n"
.equ message_length, . - message

.text
.globl _start
_start:
    call announce

    li a0, 0
    li a7, 2
    ecall

announce:
    li a0, 1
    la a1, message
    li a2, message_length
    li a7, 16
    ecall
    ret
