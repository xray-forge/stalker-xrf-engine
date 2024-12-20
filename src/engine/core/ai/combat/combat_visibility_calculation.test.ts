import { beforeEach, describe, expect, it } from "@jest/globals";

import { calculateObjectVisibility } from "@/engine/core/ai/combat/combat_visibility_calculation";
import { weatherConfig } from "@/engine/core/managers/weather/WeatherConfig";
import { MockGameObject } from "@/fixtures/xray";

describe("calculateObjectVisibility", () => {
  beforeEach(() => {
    weatherConfig.IS_UNDERGROUND_WEATHER = false;
  });

  it("should correctly calculate outside values with negative distance / luminosity", () => {
    expect(calculateObjectVisibility(MockGameObject.mock(), MockGameObject.mock(), 100, 10, -1, 5, 7, -1, 5, 10)).toBe(
      -1799.9964000000002
    );
    expect(
      calculateObjectVisibility(MockGameObject.mock(), MockGameObject.mock(), 100, 10, 0.00001, 5, 7, 0.00001, 5, 10)
    ).toBe(-1799.9964000000002);
  });

  it("should correctly calculate outside and inside", () => {
    weatherConfig.IS_UNDERGROUND_WEATHER = false;
    expect(
      calculateObjectVisibility(MockGameObject.mock(), MockGameObject.mock(), 100, 10, 1, 5, 7, 150, 100, 10)
    ).toBe(120);
    expect(
      calculateObjectVisibility(MockGameObject.mock(), MockGameObject.mock(), 25.5, 5.5, 10.5, 8.5, 4.5, 2.5, 1.5, 0.5)
    ).toBe(764.3045454545455);

    weatherConfig.IS_UNDERGROUND_WEATHER = true;
    expect(
      calculateObjectVisibility(MockGameObject.mock(), MockGameObject.mock(), 100, 10, 1, 5, 7, 150, 100, 10)
    ).toBe(42);
    expect(
      calculateObjectVisibility(MockGameObject.mock(), MockGameObject.mock(), 25.5, 5.5, 10.5, 8.5, 4.5, 2.5, 1.5, 0.5)
    ).toBe(267.50659090909096);
  });
});
