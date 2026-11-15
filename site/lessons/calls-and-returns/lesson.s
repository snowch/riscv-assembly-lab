li a0, 84
call half_distance
addi a0, a0, 3
j call_done
half_distance:
srli a0, a0, 1
ret
call_done:
