li t0, 4
li t1, 0
li t2, 0
again:
bgeu t1, t0, done
add t2, t2, t1
addi t1, t1, 1
j again
done:
