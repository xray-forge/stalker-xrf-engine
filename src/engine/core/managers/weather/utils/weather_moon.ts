import { EWeatherMoonPeriod } from "@/engine/core/managers/weather/weather_types";
import { weatherConfig } from "@/engine/core/managers/weather/WeatherConfig";
import { Time, TIndex, TLabel } from "@/engine/lib/types";

/**
 * Calculate current moon phase based on game date time.
 *
 * @param time - current game time to calculate
 * @param period - phase setting of moon
 * @returns phase of moon
 */
export function getMoonPhase(time: Time, period: EWeatherMoonPeriod): TLabel {
  const [Y, M, D, h] = time.get(0, 0, 0, 0, 0, 0, 0);

  let day: TIndex = 365 * (Y - 2010) + D;

  for (const index of $range(1, M - 1)) {
    day += weatherConfig.MONTH_DAYS.get(index);
  }

  if (h >= 12) {
    day += 1;
  }

  switch (period) {
    case EWeatherMoonPeriod.DAYS_8:
      return tostring(day % 8);
    case EWeatherMoonPeriod.DAYS_28:
      return tostring(math.floor((day % 28) / 3.5));
    default:
      // Hardcoded 'aX' value.
      return tostring(string.sub(period, 2));
  }
}
