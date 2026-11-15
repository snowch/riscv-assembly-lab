unsigned long lesson(unsigned long a, unsigned long b) {
    unsigned long total = 0;
    for (unsigned long i = 0; i < a; i++) {
        total += b;
    }
    return total;
}
