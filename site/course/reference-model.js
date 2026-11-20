// Copyright © 2026 Christopher Snow
// Reference data is checked against actual GNU assembly and CPU execution.
import { registerIndex, reading } from "./model.js";

export function referenceFragment(example) {
  return [
    ".global reference_example",
    "reference_example:",
    example.setup || "",
    ".global reference_focus",
    "reference_focus:",
    example.instruction,
    ".global reference_focus_end",
    "reference_focus_end:",
    example.continuation || "",
    ".global reference_finished",
    "reference_finished:",
    "",
  ].join("\n");
}

export function referenceRegister(name, value) {
  if (registerIndex(name) < 0)
    throw new Error("Unknown reference register: " + name);
  return {
    register: name,
    signed: reading(value),
    unsigned: reading(value, "unsigned"),
    hex: reading(value, "hex"),
  };
}

export function validateReferenceEntries(entries) {
  const ids = new Set(),
    exampleIds = new Set();
  for (const entry of entries) {
    if (!/^[a-z][a-z0-9]*$/.test(entry.id) || ids.has(entry.id))
      throw new Error(
        "Invalid or duplicate reference instruction: " + entry.id,
      );
    ids.add(entry.id);
    for (const key of ["title", "summary"])
      if (typeof entry[key] !== "string" || !entry[key].trim())
        throw new Error(entry.id + ": missing " + key);
    if (!["instruction", "pseudo"].includes(entry.kind))
      throw new Error(entry.id + ": unknown instruction kind");
    for (const key of ["syntax", "rules", "examples"])
      if (!Array.isArray(entry[key]) || !entry[key].length)
        throw new Error(entry.id + ": empty " + key);
    for (const example of entry.examples) {
      if (!/^[a-z][a-z0-9-]*$/.test(example.id) || exampleIds.has(example.id))
        throw new Error(
          "Invalid or duplicate reference example: " + example.id,
        );
      exampleIds.add(example.id);
      if (
        !example.instruction?.trim() ||
        !example.explanation?.trim() ||
        !example.watch?.length
      )
        throw new Error(example.id + ": incomplete worked example");
      if (example.instruction.trim().split(/\s+/)[0] !== entry.id)
        throw new Error(example.id + ": example uses another instruction");
      for (const name of example.watch)
        if (registerIndex(name) < 0)
          throw new Error(example.id + ": unknown register " + name);
      if (
        example.data &&
        (example.data.length > 64 ||
          example.data.some(
            (byte) => !Number.isInteger(byte) || byte < 0 || byte > 255,
          ))
      )
        throw new Error(example.id + ": invalid data bytes");
    }
  }
  return { instructions: ids.size, examples: exampleIds.size };
}
