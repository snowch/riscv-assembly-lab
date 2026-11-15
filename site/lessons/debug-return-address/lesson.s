call add_service
j service_done
add_service:
    addi sp, sp, -16
    sd ra, 8(sp)
    call scale_ticks
    addi a0, a0, 3
    ld ra, 8(sp)
    addi sp, sp, 16
    ret
scale_ticks:
    slli a0, a0, 1
    ret
service_done:
