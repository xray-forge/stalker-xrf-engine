import { describe, expect, it } from "@jest/globals";

import { createSequence } from "@/engine/core/utils/animation";

describe("'animation' utils", () => {
  it("'createSequence' should correctly create 0-based arrays", () => {
    expect(createSequence("a", "b", "c")).toEqualLuaTables({ 0: "a", 1: "b", 2: "c" });
    expect(createSequence("a", null, null, "b")).toEqualLuaTables({ 0: "a", 1: null, 2: null, 3: "b" });
  });
});
