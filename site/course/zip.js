// Copyright © 2026 Christopher Snow. Small uncompressed ZIP writer for source downloads.
const encode = (s) => new TextEncoder().encode(s);
function crc32(bytes) {
  let c = 0xffffffff;
  for (const byte of bytes) {
    c ^= byte;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}
export function sourceZip(files) {
  const chunks = [],
    directory = [];
  let position = 0,
    dirSize = 0;
  for (const [name, source] of Object.entries(files)) {
    const filename = encode(name),
      data = encode(source),
      crc = crc32(data);
    const local = new Uint8Array(30 + filename.length),
      v = new DataView(local.buffer);
    v.setUint32(0, 0x04034b50, true);
    v.setUint16(4, 20, true);
    v.setUint32(14, crc, true);
    v.setUint32(18, data.length, true);
    v.setUint32(22, data.length, true);
    v.setUint16(26, filename.length, true);
    local.set(filename, 30);
    chunks.push(local, data);
    const central = new Uint8Array(46 + filename.length),
      d = new DataView(central.buffer);
    d.setUint32(0, 0x02014b50, true);
    d.setUint16(4, 20, true);
    d.setUint16(6, 20, true);
    d.setUint32(16, crc, true);
    d.setUint32(20, data.length, true);
    d.setUint32(24, data.length, true);
    d.setUint16(28, filename.length, true);
    d.setUint32(42, position, true);
    central.set(filename, 46);
    directory.push(central);
    position += local.length + data.length;
    dirSize += central.length;
  }
  const end = new Uint8Array(22),
    e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, directory.length, true);
  e.setUint16(10, directory.length, true);
  e.setUint32(12, dirSize, true);
  e.setUint32(16, position, true);
  return new Blob([...chunks, ...directory, end], { type: "application/zip" });
}
