// Copyright © 2026 Christopher Snow
// All rights reserved. Adapted with the author's permission; see ../NOTICE.md.
// Adapted from Assembly Lab packages/machine/src/programmer-calculator.ts.
// Original mask, clamp, toSigned and compute from snowch/programmer-calculator,
// efa1584bd6deb69b2e287aae579739c4a73bf052. Separate mathematical scratch work.
function checkWidth(width) {
  if (width !== 4 && width !== 32 && width !== 64)
    throw new RangeError("width");
}
function checkReading(reading) {
  if (reading !== "unsigned" && reading !== "signed")
    throw new TypeError("reading");
}
function calculatorMask(width) {
  checkWidth(width);
  return (1n << BigInt(width)) - 1n;
}
function calculatorPattern(value, width) {
  const mask = calculatorMask(width);
  return ((value % (mask + 1n)) + mask + 1n) & mask;
}
function calculatorReading(pattern, width, reading) {
  checkReading(reading);
  const value = calculatorPattern(pattern, width);
  const signBit = 1n << BigInt(width - 1);
  return reading === "signed" && (value & signBit) !== 0n
    ? value - (calculatorMask(width) + 1n)
    : value;
}
function calculatorParse(text, format, width, reading) {
  const mask = calculatorMask(width);
  checkReading(reading);
  if (format !== "decimal" && format !== "hex") throw new TypeError("format");
  const input = text.replace(/[\s,_]/g, "");
  if (input === "") return { ok: false, error: "empty" };
  if (format === "hex") {
    const digits = input.replace(/^0x/i, "");
    if (!/^[\da-f]+$/i.test(digits)) return { ok: false, error: "hex" };
    const significant2 = digits.replace(/^0+/, "") || "0";
    if (significant2.length > width / 4) return { ok: false, error: "range" };
    return { ok: true, pattern: BigInt(`0x${significant2}`).toString() };
  }
  if (!/^-?\d+$/.test(input)) return { ok: false, error: "decimal" };
  const negative = input.startsWith("-");
  if (negative && reading === "unsigned") return { ok: false, error: "range" };
  const significant = input.replace(/^-?0*/, "") || "0";
  if (significant.length > mask.toString().length)
    return { ok: false, error: "range" };
  const value = BigInt(`${negative ? "-" : ""}${significant}`);
  const signBit = 1n << BigInt(width - 1);
  const minimum = reading === "signed" ? -signBit : 0n;
  const maximum = reading === "signed" ? signBit - 1n : mask;
  if (value < minimum || value > maximum) return { ok: false, error: "range" };
  return { ok: true, pattern: calculatorPattern(value, width).toString() };
}
function calculatorEntryFormat(text) {
  const input = text.replace(/[\s,_]/g, "");
  return /^0x/i.test(input) ? "hex" : /^0b/i.test(input) ? "binary" : "decimal";
}
function calculatorParseEntry(text, width, reading) {
  const format = calculatorEntryFormat(text);
  if (format !== "binary") return calculatorParse(text, format, width, reading);
  calculatorMask(width);
  checkReading(reading);
  const digits = text.replace(/[\s,_]/g, "").slice(2);
  if (!/^[01]+$/.test(digits)) return { ok: false, error: "binary" };
  const significant = digits.replace(/^0+/, "") || "0";
  if (significant.length > width) return { ok: false, error: "range" };
  return { ok: true, pattern: BigInt(`0b${significant}`).toString() };
}
function boundedDecimal(text, maximum) {
  if (!/^\d+$/.test(text)) throw new TypeError("pattern");
  const significant = text.replace(/^0+/, "") || "0";
  if (significant.length > maximum.toString().length)
    throw new RangeError("pattern");
  const value = BigInt(significant);
  if (value > maximum) throw new RangeError("pattern");
  return value;
}
function calculatorCompute(leftPattern, op, rightPattern, width, reading) {
  const mask = calculatorMask(width);
  checkReading(reading);
  const rawLeft = boundedDecimal(leftPattern, mask);
  let left;
  let right;
  let full;
  switch (op) {
    case "add":
    case "subtract":
      left = calculatorReading(rawLeft, width, reading);
      right = calculatorReading(
        boundedDecimal(rightPattern, mask),
        width,
        reading,
      );
      full = op === "add" ? left + right : left - right;
      break;
    case "shift-left":
      left = rawLeft;
      right = boundedDecimal(rightPattern, BigInt(width - 1));
      full = left << right;
      break;
    default:
      throw new TypeError("operation");
  }
  return {
    pattern: calculatorPattern(full, width).toString(),
    full: full.toString(),
    left: left.toString(),
    right: right.toString(),
  };
}
function calculatorAdditionCarries(leftPattern, rightPattern, width) {
  const result = calculatorCompute(
    leftPattern,
    "add",
    rightPattern,
    width,
    "unsigned",
  );
  const sum = BigInt(result.full);
  const carries =
    (BigInt(leftPattern) ^ BigInt(rightPattern) ^ sum) & calculatorMask(width);
  const intoSign = Number((carries >> BigInt(width - 1)) & 1n);
  const out = Number((sum >> BigInt(width)) & 1n);
  return {
    carries: carries.toString(),
    intoSign,
    out,
    c: out,
    v: intoSign === out ? 0 : 1,
  };
}
export {
  calculatorAdditionCarries,
  calculatorCompute,
  calculatorEntryFormat,
  calculatorMask,
  calculatorParse,
  calculatorParseEntry,
  calculatorPattern,
  calculatorReading,
};
