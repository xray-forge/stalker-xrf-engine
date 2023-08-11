import { describe, expect, it } from "@jest/globals";

import {
  canUsePeriodsForWeather,
  getPossibleWeathersList,
  isIndoorWeather,
  isPreBlowoutWeather,
  isTransitionWeather,
} from "@/engine/core/utils/weather";
import { TName } from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/utils";

describe("'weather' utils", () => {
  it("'getPossibleWeathersList' should correctly get list of weathers", () => {
    replaceFunctionMock(lfs.dir, () => {
      const list: Array<TName> = [".", "..", "a.ltx", "b.ltx", "c.ltx", "another.xml"];

      return [null, { next: () => list.shift() }];
    });

    expect(getPossibleWeathersList()).toEqualLuaArrays(["a", "b", "c"]);
  });

  it("'canUsePeriodsForWeather' should check dynamic weathers", () => {
    expect(canUsePeriodsForWeather("dynamic_default")).toBe(true);
    expect(canUsePeriodsForWeather("dynamic")).toBe(true);
    expect(canUsePeriodsForWeather("default")).toBe(false);
    expect(canUsePeriodsForWeather("another")).toBe(false);
  });

  it("'isIndoorWeather' should check indoor weathers", () => {
    expect(isIndoorWeather("indoor_default")).toBe(true);
    expect(isIndoorWeather("indoor")).toBe(true);
    expect(isIndoorWeather("dynamic_default")).toBe(false);
    expect(isIndoorWeather("dynamic")).toBe(false);
    expect(isIndoorWeather("default")).toBe(false);
    expect(isIndoorWeather("another")).toBe(false);
  });

  it("'isPreBlowoutWeather' should check pre-blowout weathers", () => {
    expect(isPreBlowoutWeather("pre_blowout_default")).toBe(true);
    expect(isPreBlowoutWeather("pre_blowout")).toBe(true);
    expect(isPreBlowoutWeather("dynamic_default")).toBe(false);
    expect(isPreBlowoutWeather("dynamic")).toBe(false);
    expect(isPreBlowoutWeather("default")).toBe(false);
    expect(isPreBlowoutWeather("another")).toBe(false);
  });

  it("'isPreBlowoutWeather' should check isTransitionWeather weathers", () => {
    expect(isTransitionWeather("transition_default")).toBe(true);
    expect(isTransitionWeather("transition")).toBe(true);
    expect(isTransitionWeather("pre_blowout")).toBe(false);
    expect(isTransitionWeather("dynamic_default")).toBe(false);
    expect(isTransitionWeather("dynamic")).toBe(false);
    expect(isTransitionWeather("default")).toBe(false);
    expect(isTransitionWeather("another")).toBe(false);
  });
});
