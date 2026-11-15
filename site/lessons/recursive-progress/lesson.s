li a0, 7
call fade_sum
j fade_done
fade_sum:
beqz a0, fade_zero
addi sp, sp, -16
sd ra, 8(sp)
sd a0, 0(sp)
srli a0, a0, 1
call fade_sum
ld t0, 0(sp)
add a0, a0, t0
ld ra, 8(sp)
addi sp, sp, 16
ret
fade_zero:
li a0, 0
ret
fade_done:
