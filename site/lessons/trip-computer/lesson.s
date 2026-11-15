la t3, lesson_data
li t4, 0
li a0, 0
scan_records:
    bgeu t4, t0, scale_records
    lbu t5, 2(t3)
    and t5, t5, t1
    beqz t5, next_record
    lhu t6, 0(t3)
    add a0, a0, t6
next_record:
    addi t3, t3, 4
    addi t4, t4, 1
    j scan_records
scale_records:
    mv a1, t2
    call scale_total
    j trip_done
scale_total:
    mul a0, a0, a1
    ret
trip_done:
