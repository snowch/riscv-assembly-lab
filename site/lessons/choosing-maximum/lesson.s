li t0, -4
li t1, 9
bge t0, t1, left
mv t2, t1
j done
left:
mv t2, t0
done:
