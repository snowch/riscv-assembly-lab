# Copyright © 2026 Christopher Snow
# Pico SDK startup sets sp and calls main. This application keeps running.
.text
.globl main
.type main, @function
main:
    call stdio_init_all
report_again:
    la a0, heading
    li a1, 0
    call write_text

    la a0, distances
    la a1, distances_end
    call trip_total
    call print_decimal

    la a0, units
    li a1, 1
    call write_text

    # Repeat so a terminal opened after power-on can still see the result.
    li a0, 1000
    call sleep_ms
    j report_again
.size main, . - main

# a0 and a1 point to the beginning and end of the word array.
# Returns the unsigned 32-bit total in a0. Keep the sum within 32 bits.
.type trip_total, @function
trip_total:
    li a2, 0
sum_distances:
    beq a0, a1, return_total
    lw t0, 0(a0)
    add a2, a2, t0
    addi a0, a0, 4
    j sum_distances
return_total:
    mv a0, a2
    ret
.size trip_total, . - trip_total

# Convert an unsigned 32-bit value to at most ten decimal digits.
.type print_decimal, @function
print_decimal:
    addi sp, sp, -16
    sw ra, 12(sp)
    addi t0, sp, 10
    sb zero, 0(t0)
    li t1, 10
decimal_digit:
    remu t2, a0, t1
    divu a0, a0, t1
    addi t2, t2, '0'
    addi t0, t0, -1
    sb t2, 0(t0)
    bne a0, zero, decimal_digit
    mv a0, t0
    li a1, 0
    call write_text
    lw ra, 12(sp)
    addi sp, sp, 16
    ret
.size print_decimal, . - print_decimal

# a0 is a terminated string and a1 says whether to append a newline.
.type write_text, @function
write_text:
    mv a2, a1
    li a1, -1
    li a3, 1
    tail stdio_put_string
.size write_text, . - write_text

.section .rodata
heading:
    .asciz "Trip total: "
units:
    .asciz " km"
.balign 4
distances:
    .word 12, 7, 23
distances_end:
