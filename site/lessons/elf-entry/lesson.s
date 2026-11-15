li a0, 9
li a1, 4
call advance
j entry_done
advance:
    addi a0, a0, 1
    add a0, a0, a1
    ret
entry_done:
