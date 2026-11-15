# Change the message, then choose Build & Run.
.section .rodata
message:
    .ascii "Hello, RISC-V!\n"
.equ message_length, . - message

.text
.global _start
_start:
    # write(1, message, message_length)
    li a0, 1                  # 1 = standard output
    la a1, message            # address of the bytes to write
    li a2, message_length     # number of bytes
    li a7, 16                 # xv6 system call: write
    ecall                     # ask xv6 to perform it

    # exit(0)
    li a0, 0                  # exit status
    li a7, 2                  # xv6 system call: exit
    ecall
