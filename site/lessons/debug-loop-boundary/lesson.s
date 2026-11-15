la t1, lesson_data
li t2, 0
li a0, 0
scan_readings:
    bltu t0, t2, readings_done
    add t3, t1, t2
    lbu t4, 0(t3)
    add a0, a0, t4
    addi t2, t2, 1
    j scan_readings
readings_done:
