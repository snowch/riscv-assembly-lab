// Copyright © 2026 Christopher Snow. ELF reader adapted from xv6 Lab (MIT).
export function readElf(input) {
  const bytes = new Uint8Array(input),
    view = new DataView(bytes.buffer),
    u16 = (o) => view.getUint16(o, true),
    u32 = (o) => view.getUint32(o, true),
    u64 = (o) => Number(view.getBigUint64(o, true));
  if (
    bytes[0] !== 127 ||
    bytes[1] !== 69 ||
    bytes[2] !== 76 ||
    bytes[3] !== 70 ||
    bytes[4] !== 2 ||
    bytes[5] !== 1 ||
    u16(18) !== 243
  )
    throw new Error("Expected a little-endian ELF64 RISC-V image.");
  const string = (offset, index) => {
    let end = offset + index;
    while (end < bytes.length && bytes[end]) end++;
    return new TextDecoder().decode(bytes.subarray(offset + index, end));
  };
  const sections = [];
  for (let i = 0; i < u16(60); i++) {
    const o = u64(40) + i * u16(58);
    sections.push({
      index: i,
      nameIndex: u32(o),
      type: u32(o + 4),
      flags: u64(o + 8),
      address: u64(o + 16),
      offset: u64(o + 24),
      size: u64(o + 32),
      link: u32(o + 40),
      info: u32(o + 44),
      alignment: u64(o + 48),
      entrySize: u64(o + 56),
    });
  }
  const names = sections[u16(62)];
  for (const section of sections)
    section.name = string(names.offset, section.nameIndex);
  const symbols = new Map(),
    tables = new Map();
  for (const section of sections.filter((s) => s.type === 2)) {
    const entries = [];
    for (
      let o = section.offset;
      o < section.offset + section.size;
      o += section.entrySize
    ) {
      const symbol = {
        index: entries.length,
        name: string(sections[section.link].offset, u32(o)),
        info: bytes[o + 4],
        section: u16(o + 6),
        value: u64(o + 8),
        size: u64(o + 16),
      };
      entries.push(symbol);
      if (symbol.name) symbols.set(symbol.name, symbol);
    }
    tables.set(section.index, entries);
  }
  return {
    bytes,
    view,
    sections,
    symbols,
    tables,
    offset(address) {
      const s = sections.find(
        (s) =>
          s.type === 1 &&
          s.flags & 2 &&
          address >= s.address &&
          address < s.address + s.size,
      );
      if (!s)
        throw new Error(
          "Address outside the linked image: 0x" + address.toString(16),
        );
      return s.offset + address - s.address;
    },
  };
}
