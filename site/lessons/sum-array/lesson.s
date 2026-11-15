li t0, 4
la t1, lesson_data
li t2, 0
li t3, 0
again:
bgeu t3, t0, done
lwu t4, 0(t1)
add t2, t2, t4
addi t1, t1, 4
addi t3, t3, 1
j again
done:
