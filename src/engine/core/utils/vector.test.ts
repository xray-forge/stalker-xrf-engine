import { describe, expect, it } from "@jest/globals";
import { vector } from "xray16";

import { areSameVectors, areSameVectorsByPrecision } from "@/engine/core/utils/vector";

describe("'vector' utils", () => {
  it("Should correctly compare same vectors by value", () => {
    expect(areSameVectors(new vector(), new vector())).toBeTruthy();
    expect(areSameVectors(new vector().set(1, 2, 3), new vector().set(1, 2, 3))).toBeTruthy();
    expect(areSameVectors(new vector().set(1, 2, 3), new vector())).toBeFalsy();
    // Not precision based.
    expect(areSameVectors(new vector().set(1, 1, 0.3), new vector().set(1, 1, 0.2 + 0.1))).toBeFalsy();
  });

  it("Should correctly compare same vectors by precision rate", () => {
    expect(areSameVectorsByPrecision(new vector(), new vector(), 0.001)).toBeTruthy();
    expect(areSameVectorsByPrecision(new vector().set(1, 2, 3), new vector().set(1, 2, 3), 0.001)).toBeTruthy();
    expect(areSameVectorsByPrecision(new vector().set(1, 2, 3), new vector(), 0.001)).toBeFalsy();

    // Precision based, correct.
    expect(
      areSameVectorsByPrecision(new vector().set(1, 1, 0.3), new vector().set(1, 1, 0.2 + 0.1), 0.001)
    ).toBeTruthy();
  });
});
