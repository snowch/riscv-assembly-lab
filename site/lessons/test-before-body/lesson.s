li t0, 0
li t1, 0
before:
bgeu t1, t0, start_after
addi t1, t1, 1
j before
start_after:
li t2, 0
after:
addi t2, t2, 1
bltu t2, t0, after
