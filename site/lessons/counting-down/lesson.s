li t0, 128
li t1, 3
mv t2, t0
beq t1, zero, done
again:
srli t2, t2, 1
addi t1, t1, -1
bne t1, zero, again
done:
