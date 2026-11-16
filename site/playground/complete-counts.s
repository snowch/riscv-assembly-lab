# Copyright © 2026 Christopher Snow
.text
.global _start
_start:
    la t0, counts
    ld a0, 0(t0)
    ld a1, 8(t0)
    call combine
    mv s0, a0
    li a0, 0
    li a7, 2
    ecall

combine:
    add a0, a0, a1
    ret

.data
.balign 8
.global counts
counts: .quad 19, 23
    .zero 48
