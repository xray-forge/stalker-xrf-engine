import { describe, expect, it } from "@jest/globals";

import { calculatePositionInRadius } from "@/engine/core/schemes/helicopter/heli_move/utils/heli_move_utils";
import { MockVector } from "@/fixtures/xray";

describe("calculatePositionInRadius", () => {
  it("should correctly calculate point in radius by single axis", () => {
    expect(
      calculatePositionInRadius(MockVector.mock(0, 0, 0), MockVector.mock(0, 0.5, 0), MockVector.mock(0, 0.5, 1), 4)
    ).toEqual(MockVector.mock(0, 2.125, 0));
    expect(
      calculatePositionInRadius(MockVector.mock(0, 0, 0), MockVector.mock(0, 1, 0), MockVector.mock(0, 0.5, 0), 6)
    ).toEqual(MockVector.mock(0, 6.5, 0));
    expect(
      calculatePositionInRadius(MockVector.mock(0, 0, 0), MockVector.mock(0, 0.75, 0), MockVector.mock(0, 0.1, 0), 6)
    ).toEqual(MockVector.mock(0, 4.55625, 0));
    expect(
      calculatePositionInRadius(MockVector.mock(0, 0, 0), MockVector.mock(0, 0.5, 0), MockVector.mock(0, 0.5, 1), 8)
    ).toEqual(MockVector.mock(0, 4.125, 0));
  });

  it("should correctly calculate point in radius by multiple axis", () => {
    expect(
      calculatePositionInRadius(MockVector.mock(0, 0, 0), MockVector.mock(1, -0.5, 1), MockVector.mock(1, 0.2, 0.5), 2)
    ).toEqual(MockVector.mock(3.3364916731037084, -1.6682458365518542, 3.3364916731037084));
    expect(
      calculatePositionInRadius(
        MockVector.mock(0, 0, 0),
        MockVector.mock(-1, -0.5, 0.3),
        MockVector.mock(1, 0.2, 0.5),
        2
      )
    ).toEqual(MockVector.mock(-0.8830302779823359, -0.44151513899116795, 0.26490908339470076));
  });
});
