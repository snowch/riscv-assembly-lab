// Copyright © 2026 Christopher Snow
import test from "node:test";
import assert from "node:assert/strict";
import {
  calculatorParseEntry as parse,
  calculatorCompute as compute,
  calculatorAdditionCarries as carries,
} from "../site/course/calculator-model.js";

test("calculator prefix entry retains exact 64-bit patterns without truncating paste", () => {
  assert.equal(
    parse("0xFFFF FFFF FFFF FFFF", 64, "signed").pattern,
    "18446744073709551615",
  );
  assert.equal(parse("0B0000_1111", 64, "signed").pattern, "15");
  assert.equal(parse("0x000000000000000000ff", 32, "unsigned").pattern, "255");
  assert.equal(
    parse("0b" + "1".repeat(32), 64, "signed").pattern,
    "4294967295",
  );
  assert.equal(parse("0x100000000", 32, "unsigned").error, "range");
  assert.equal(parse("0b1" + "0".repeat(64), 64, "unsigned").error, "range");
  assert.equal(parse("0xG1", 64, "unsigned").error, "hex");
  assert.equal(parse("0b102", 64, "unsigned").error, "binary");
  assert.equal(parse("1010", 64, "unsigned").pattern, "1010");
});

test("calculator decimal reading enforces each signed or unsigned range exactly", () => {
  for (const width of [32, 64]) {
    const sign = 1n << BigInt(width - 1),
      mask = (sign << 1n) - 1n;
    assert.equal(parse(String(-sign), width, "signed").pattern, String(sign));
    assert.equal(
      parse(String(sign - 1n), width, "signed").pattern,
      String(sign - 1n),
    );
    assert.equal(parse(String(sign), width, "signed").error, "range");
    assert.equal(parse(String(-sign - 1n), width, "signed").error, "range");
    assert.equal(parse("-1", width, "unsigned").error, "range");
    assert.equal(parse(String(mask), width, "unsigned").pattern, String(mask));
    assert.equal(parse(String(mask + 1n), width, "unsigned").error, "range");
  }
});

test("calculator full and retained arithmetic agree at signed and unsigned boundaries", () => {
  for (const width of [32, 64]) {
    const sign = 1n << BigInt(width - 1),
      mask = (sign << 1n) - 1n;
    assert.equal(
      compute(String(mask), "add", "1", width, "unsigned").full,
      String(mask + 1n),
    );
    assert.equal(
      compute(String(mask), "add", "1", width, "unsigned").pattern,
      "0",
    );
    assert.equal(
      compute(String(sign - 1n), "add", "1", width, "signed").full,
      String(sign),
    );
    assert.equal(
      compute("0", "subtract", "1", width, "unsigned").pattern,
      String(mask),
    );
    assert.equal(compute(String(mask), "add", "1", width, "signed").full, "0");
    assert.equal(
      compute("1", "shift-left", String(width - 1), width, "signed").pattern,
      String(sign),
    );
    assert.throws(() =>
      compute("1", "shift-left", String(width), width, "unsigned"),
    );
  }
});

test("addition carries agree with independent column addition and signed ranges", () => {
  // Exhaust every four-bit operand pair, including all sign-column combinations.
  for (let a = 0; a < 16; a++)
    for (let b = 0; b < 16; b++) {
      let carry = 0,
        incoming = 0;
      for (let bit = 0; bit < 4; bit++) {
        if (bit === 3) incoming = carry;
        carry = Number(((a >> bit) & 1) + ((b >> bit) & 1) + carry >= 2);
      }
      const actual = carries(String(a), String(b), 4),
        signed = (n) => (n >= 8 ? n - 16 : n),
        sum = signed(a) + signed(b);
      assert.equal(actual.intoSign, incoming);
      assert.equal(actual.out, carry);
      assert.equal(actual.v, Number(sum < -8 || sum > 7));
    }
  for (const width of [32, 64]) {
    const sign = 1n << BigInt(width - 1),
      mask = (sign << 1n) - 1n;
    assert.equal(carries(String(sign - 1n), "1", width).v, 1);
    assert.equal(carries(String(mask), "1", width).out, 1);
    assert.equal(carries(String(mask), "1", width).v, 0);
  }
});
