import { describe, expect, it } from "@jest/globals";
import { createTime } from "xray16/lib";

import { EWeatherMoonPeriod } from "@/engine/core/managers/weather";
import { getMoonPhase } from "@/engine/core/managers/weather/utils/weather_moon";

describe("getMoonPhase util", () => {
  it("should correctly calculate phase for 8 days duration", () => {
    expect(getMoonPhase(createTime(2012, 6, 8, 9, 30, 0, 0), EWeatherMoonPeriod.DAYS_8)).toBe("1");
    expect(getMoonPhase(createTime(2012, 6, 16, 9, 30, 0, 0), EWeatherMoonPeriod.DAYS_8)).toBe("1");
    expect(getMoonPhase(createTime(2012, 6, 24, 9, 30, 0, 0), EWeatherMoonPeriod.DAYS_8)).toBe("1");

    expect(getMoonPhase(createTime(2012, 6, 11, 9, 30, 0, 0), EWeatherMoonPeriod.DAYS_8)).toBe("4");
    expect(getMoonPhase(createTime(2012, 6, 11, 12, 30, 0, 0), EWeatherMoonPeriod.DAYS_8)).toBe("5");
    expect(getMoonPhase(createTime(2012, 6, 12, 9, 30, 0, 0), EWeatherMoonPeriod.DAYS_8)).toBe("5");
    expect(getMoonPhase(createTime(2012, 6, 12, 12, 30, 0, 0), EWeatherMoonPeriod.DAYS_8)).toBe("6");
    expect(getMoonPhase(createTime(2012, 6, 13, 9, 30, 0, 0), EWeatherMoonPeriod.DAYS_8)).toBe("6");
    expect(getMoonPhase(createTime(2012, 6, 13, 12, 30, 0, 0), EWeatherMoonPeriod.DAYS_8)).toBe("7");
  });
});
