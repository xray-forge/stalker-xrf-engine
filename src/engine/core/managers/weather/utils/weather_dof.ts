import { CConsole, get_console, level } from "xray16";

import { WeatherManager } from "@/engine/core/managers/weather";
import { weatherConfig } from "@/engine/core/managers/weather/WeatherConfig";
import { abort } from "@/engine/core/utils/assertion";
import { roundWithPrecision } from "@/engine/core/utils/number";
import { hoursToWeatherPeriod } from "@/engine/core/utils/time";
import { TDistance, TRate, TSection, TTimestamp } from "@/engine/lib/types";

/**
 * Reset DOF value to use defaults.
 */
export function resetDof(): void {
  const console: CConsole = get_console();

  console.execute(`r2_dof_far ${800 * weatherConfig.DOF_RATE}`);
  console.execute("r2_dof_kernel 2");
}

/**
 * Update DOF settings based on weather transition.
 * Adjusts DOF setting based on current weather cycle visibility + fog levels.
 *
 * @param manager - target weather manager to update
 */
export function updateDof(manager: WeatherManager): void {
  const console: CConsole = get_console();
  const minutes: TTimestamp = level.get_time_minutes();

  const lastFogDistanceDescriptor: LuaTable<TSection, TDistance> = weatherConfig.FOG_DISTANCES.get(
    manager.currentWeatherSection as TSection
  );
  const nextFogDistanceDescriptor: LuaTable<TSection, TDistance> = weatherConfig.FOG_DISTANCES.get(
    manager.nextWeatherSection as TSection
  );

  if (!lastFogDistanceDescriptor || !nextFogDistanceDescriptor) {
    abort(
      "Could not find fog distance descriptor for weather switch pair '%s -> %s'",
      manager.currentWeatherSection,
      manager.nextWeatherSection
    );
  }

  const lastFogDistance: TDistance = lastFogDistanceDescriptor.get(hoursToWeatherPeriod(manager.lastUpdatedAtHour));
  const nextFogDistance: TDistance = nextFogDistanceDescriptor.get(
    hoursToWeatherPeriod((manager.lastUpdatedAtHour + 1) % 24)
  );
  const lastDofKernel: TRate = weatherConfig.DOF_KERNELS.get(manager.currentWeatherSection as TSection);
  const nextDofKernel: TRate = weatherConfig.DOF_KERNELS.get(manager.nextWeatherSection as TSection);

  const currentDofFar: TRate = math.ceil(((nextFogDistance - lastFogDistance) * minutes) / 60 + lastFogDistance);
  const currentDofKernel: TRate = roundWithPrecision(
    ((nextDofKernel - lastDofKernel) * minutes) / 60 + lastDofKernel,
    2
  );

  let startTransition: TRate = 0;
  let percentOfTransition: TRate = 0;

  if (manager.weatherFx) {
    if (!manager.weatherFxStartedAt) {
      manager.weatherFxStartedAt = manager.lastUpdatedAtSecond;
      manager.weatherFxEndedAt = null;
    }

    if (manager.weatherFxStartedAt && !manager.weatherFxEndedAt) {
      startTransition = manager.lastUpdatedAtSecond - manager.weatherFxStartedAt;
      percentOfTransition = startTransition / ((6 * 60) / level.get_time_factor());

      if (percentOfTransition > 1) {
        percentOfTransition = 1;
      }

      console.execute(
        `r2_dof_far ${math.ceil(
          (currentDofFar - (currentDofFar - 200) * percentOfTransition) * weatherConfig.DOF_RATE
        )}`
      );
      console.execute(
        `r2_dof_kernel ${roundWithPrecision(currentDofKernel - (currentDofKernel - 4) * percentOfTransition)}`
      );
    }
  } else {
    if (!manager.weatherFxEndedAt && manager.weatherFxStartedAt) {
      manager.weatherFxEndedAt = manager.lastUpdatedAtSecond;
    }

    if (manager.weatherFxStartedAt && manager.weatherFxEndedAt) {
      startTransition = manager.lastUpdatedAtSecond - manager.weatherFxEndedAt;
      percentOfTransition = startTransition / 5;

      if (percentOfTransition > 1) {
        percentOfTransition = 1;

        manager.weatherFxStartedAt = null;
        manager.weatherFxEndedAt = null;
      }

      console.execute(
        `r2_dof_far ${math.ceil(
          (currentDofFar - (currentDofFar - 200) * (1 - percentOfTransition)) * weatherConfig.DOF_RATE
        )}`
      );
      console.execute(
        `r2_dof_kernel ${roundWithPrecision(currentDofKernel - (currentDofKernel - 4) * (1 - percentOfTransition))}`
      );
    } else {
      console.execute(`r2_dof_far ${currentDofFar * weatherConfig.DOF_RATE}`);
      console.execute(`r2_dof_kernel ${currentDofKernel}`);
    }
  }
}
