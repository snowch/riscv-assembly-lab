li t0, 6
la t1, lesson_data
li t2, 0
again:
bgeu t2, t0, done
lbu t3, 0(t1)
beq t3, zero, done
addi t2, t2, 1
addi t1, t1, 1
j again
done:
