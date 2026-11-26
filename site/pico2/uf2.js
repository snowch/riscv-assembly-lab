// Copyright © 2026 Christopher Snow
const FLASH_START = 0x10000000;
const FLASH_END = FLASH_START + 4 * 1024 * 1024;
const SECTOR_BYTES = 4096;
const PAGE_BYTES = 256;
const BLOCK_BYTES = 512;
const FAMILY_FLAG = 0x2000;
const RP2350_RISCV = 0xe48bff5a;
const ABSOLUTE = 0xe48bff57;

// Use physical load addresses: initialised RAM lives in flash until startup copies it.
export function pico2Uf2(elf) {
  const view = new DataView(elf.buffer, elf.byteOffset, elf.byteLength);
  const u16 = (offset) => view.getUint16(offset, true);
  const u32 = (offset) => view.getUint32(offset, true);
  if (
    elf.length < 52 || u32(0) !== 0x464c457f ||
    u16(4) !== 0x0101 || u16(16) !== 2 || u16(18) !== 243
  )
    throw new Error("Expected a little-endian RISC-V ELF32 executable.");

  const entry = u32(24);
  const headers = u32(28);
  const headerBytes = u16(42);
  const count = u16(44);
  if (headerBytes !== 32 || headers + count * headerBytes > elf.length)
    throw new Error("Invalid Pico 2 ELF program headers.");

  const segments = [];
  for (let i = 0; i < count; i++) {
    const header = headers + i * headerBytes;
    const bytes = u32(header + 16);
    if (u32(header) !== 1 || !bytes) continue;
    const offset = u32(header + 4);
    const address = u32(header + 12);
    if (
      offset + bytes > elf.length || bytes > u32(header + 20) ||
      address < FLASH_START || address + bytes > FLASH_END
    )
      throw new Error("A Pico 2 load segment lies outside the image or onboard flash.");
    segments.push({ address, bytes, offset });
  }
  segments.sort((a, b) => a.address - b.address);
  if (
    segments[0]?.address !== FLASH_START ||
    !segments.some(({ address, bytes }) => entry >= address && entry < address + bytes)
  )
    throw new Error("The Pico 2 ELF has no startup code in flash.");

  const pages = new Map();
  let end = FLASH_START;
  for (const { address, bytes, offset } of segments) {
    if (address < end) throw new Error("The Pico 2 ELF has overlapping load segments.");
    end = address + bytes;
    for (let cursor = address; cursor < end;) {
      const base = cursor - cursor % PAGE_BYTES;
      const writeEnd = Math.min(base + PAGE_BYTES, end);
      if (!pages.has(base)) pages.set(base, new Uint8Array(PAGE_BYTES));
      const start = offset + cursor - address;
      pages.get(base).set(elf.subarray(start, start + writeEnd - cursor), cursor - base);
      cursor = writeEnd;
    }
  }

  // BOOTSEL counts pages when erasing touched sectors. Round out each touched
  // sector through the last data page, as picotool does.
  const lastPage = end - 1 - (end - 1) % PAGE_BYTES;
  const sectors = new Set([...pages.keys()].map((address) => address - address % SECTOR_BYTES));
  for (const base of sectors) {
    for (let page = base; page < Math.min(base + SECTOR_BYTES, lastPage); page += PAGE_BYTES)
      if (!pages.has(page)) pages.set(page, new Uint8Array(PAGE_BYTES));
  }
  const image = new Uint8Array((pages.size + 1) * BLOCK_BYTES);
  const uf2 = new DataView(image.buffer);
  function writeBlock(index, flags, address, ordinal, total, family) {
    const offset = index * BLOCK_BYTES;
    const fields = [0x0a324655, 0x9e5d5157, flags | FAMILY_FLAG, address, PAGE_BYTES, ordinal, total, family];
    fields.forEach((value, i) => uf2.setUint32(offset + i * 4, value, true));
    uf2.setUint32(offset + BLOCK_BYTES - 4, 0x0ab16f30, true);
    return offset + 32;
  }

  // RP2350-E10: the first absolute block carries the ignore-block extension.
  const absolutePayload = writeBlock(0, 0x8000, 0x10ffff00, 0, 2, ABSOLUTE);
  image.fill(0xef, absolutePayload, absolutePayload + PAGE_BYTES);
  uf2.setUint32(absolutePayload + PAGE_BYTES, 0x9957e304, true);
  [...pages.keys()].sort((a, b) => a - b).forEach((address, ordinal) => {
    const offset = writeBlock(ordinal + 1, 0, address, ordinal, pages.size, RP2350_RISCV);
    image.set(pages.get(address), offset);
  });
  return image;
}
