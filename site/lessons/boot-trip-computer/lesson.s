.option norvc
.equ UART_BASE, 0x10000000
.equ UART_STATUS, 5
.equ UART_TX_READY, 0x20

.section .text.boot, "ax"
.globl _start
_start:
    la sp, __stack_top
    la a0, heading
    call uart_puts

    la t0, distances
    la t1, distances_end
    li a0, 0
sum_distances:
    beq t0, t1, print_total
    lwu t2, 0(t0)
    add a0, a0, t2
    addi t0, t0, 4
    j sum_distances

print_total:
    call uart_number
    la a0, units
    call uart_puts

# The transmit buffer is empty on return. Leave the hart here.
.globl park
park:
    j park

.text
# a0 holds an unsigned total. Build decimal digits backwards on the stack.
uart_number:
    addi sp, sp, -32
    sd ra, 24(sp)
    addi t0, sp, 20
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
    call uart_puts
    ld ra, 24(sp)
    addi sp, sp, 32
    ret

# a0 points to a zero-terminated string. Access UART registers one byte at a time.
uart_puts:
    li t0, UART_BASE
next_byte:
    lbu t1, 0(a0)
    beq t1, zero, drain_uart
wait_for_uart:
    lbu t2, UART_STATUS(t0)
    andi t2, t2, UART_TX_READY
    beq t2, zero, wait_for_uart
    sb t1, 0(t0)
    addi a0, a0, 1
    j next_byte
drain_uart:
    lbu t2, UART_STATUS(t0)
    andi t2, t2, UART_TX_READY
    beq t2, zero, drain_uart
    ret

.section .rodata
heading:
    .asciz "Trip total: "
units:
    .asciz " km\r\n"
.balign 4
distances:
    .word 12, 7, 23
distances_end:
