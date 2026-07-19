import { beforeEach, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { calculateObjectVisibility } from "@/engine/core/ai/combat/combat_visibility_calculation";
import { weatherConfig } from "@/engine/core/managers/weather/WeatherConfig";

describe("calculateObjectVisibility", () => {
  beforeEach(() => {
    weatherConfig.IS_UNDERGROUND_WEATHER = false;
  });

  it("should normalize non-positive luminosity and distance", () => {
    expect(
      calculateObjectVisibility(MockGameObject.mock(), MockGameObject.mock(), 100, 10, -1, 5, 7, -1, 5, 10)
    ).toBeCloseTo(-17999.964, 10);
    expect(
      calculateObjectVisibility(MockGameObject.mock(), MockGameObject.mock(), 100, 10, 0.0001, 5, 7, 0.00001, 5, 10)
    ).toBeCloseTo(-17999.964, 10);
  });

  it("should calculate visibility in outside weather", () => {
    expect(
      calculateObjectVisibility(MockGameObject.mock(), MockGameObject.mock(), 100, 10, 1, 5, 7, 150, 100, 10)
    ).toBe(120);
    expect(
      calculateObjectVisibility(MockGameObject.mock(), MockGameObject.mock(), 25.5, 5.5, 10.5, 8.5, 4.5, 2.5, 1.5, 0.5)
    ).toBe(764.3045454545455);
  });

  it("should add underground visibility luminosity", () => {
    weatherConfig.IS_UNDERGROUND_WEATHER = true;

    expect(calculateObjectVisibility(MockGameObject.mock(), MockGameObject.mock(), 10, 1, 1, 0, 0, 10, 0, 0)).toBe(
      13.5
    );
    expect(
      calculateObjectVisibility(MockGameObject.mock(), MockGameObject.mock(), 10, 1, 0, 0, 0, 10, 0, 0)
    ).toBeCloseTo(3.501, 10);
  });
});
