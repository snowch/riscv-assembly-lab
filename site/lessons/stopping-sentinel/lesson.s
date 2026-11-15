li t0, 8
li t1, 12
mv t2, t0
beq t1, zero, done
again:
beq t2, zero, done
srli t2, t2, 1
addi t1, t1, -1
bne t1, zero, again
done:
