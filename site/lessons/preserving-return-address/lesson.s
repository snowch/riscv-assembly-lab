li a0, 64
call report_once
j report_done
report_once:
addi sp, sp, -16
sd ra, 8(sp)
call half_distance
addi a0, a0, 1
ld ra, 8(sp)
addi sp, sp, 16
ret
half_distance:
srli a0, a0, 1
ret
report_done:
