import { level } from "xray16";

import { SignalLightBinder } from "@/engine/core/binders/physic";
import { getManager, registry } from "@/engine/core/database";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";
import { ALARM_STATUSES, SmartTerrainControl } from "@/engine/core/objects/smart_terrain";
import { ESmartTerrainStatus } from "@/engine/core/objects/smart_terrain/smart_terrain_types";
import { anomalyHasArtefact } from "@/engine/core/utils/anomaly";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { GameObject, Optional, TName, TSection, TTimestamp } from "@/engine/lib/types";

/**
 * Check whether it is rainy in the game at the moment.
 */
extern("xr_conditions.is_rain", (): boolean => {
  return registry.actor !== null && level.rain_factor() > 0;
});

/**
 * Check whether it is heavy rain weather in the game at the moment.
 */
extern("xr_conditions.is_heavy_rain", (): boolean => {
  return registry.actor !== null && level.rain_factor() >= 0.5;
});

/**
 * Check whether it is dark daytime in the game at the moment.
 */
extern("xr_conditions.is_day", (): boolean => {
  const timeHours: TTimestamp = level.get_time_hours();

  return registry.actor !== null && timeHours >= 6 && timeHours < 21;
});

/**
 * Check whether it is dark nighttime in the game at the moment.
 */
extern("xr_conditions.is_dark_night", (): boolean => {
  const timeHours: TTimestamp = level.get_time_hours();

  return registry.actor !== null && (timeHours < 3 || timeHours > 22);
});

/**
 * Check whether current game minutes are within shift period (gets module from minutes and check <= period).
 *
 * Where:
 * - shift - time shift
 * - period - time period
 */
extern(
  "xr_conditions.time_period",
  (_: GameObject, __: GameObject, [shift, period]: [Optional<number>, Optional<number>]): boolean => {
    if (shift && period && registry.actor !== null) {
      return shift > period && level.get_time_minutes() % shift <= period;
    }

    return false;
  }
);

/**
 * Check whether anomaly with name has artefact.
 *
 * Where:
 * - anomalyName - name of the anomaly to check
 * - artefactSection - section of the artefact to check
 */
extern(
  "xr_conditions.anomaly_has_artefact",
  (_: GameObject, __: GameObject, [anomalyName, artefactSection]: [TName, TSection]): boolean => {
    return anomalyHasArtefact(anomalyName, artefactSection);
  }
);

/**
 * Check whether surge is completed at the moment.
 */
extern("xr_conditions.surge_complete", (): boolean => {
  return surgeConfig.IS_FINISHED;
});

/**
 * Check whether surge is started at the moment.
 */
extern("xr_conditions.surge_started", (): boolean => {
  return surgeConfig.IS_STARTED;
});

/**
 * Check whether surge is killing all not hided objects at the moment.
 */
extern("xr_conditions.surge_kill_all", (): boolean => {
  return getManager(SurgeManager).isKillingAll();
});

/**
 * Check whether surge signal rockets flying.
 *
 * Where:
 * - name - name of signal light to check flying state
 *
 * Throws, if signal rocket is not found.
 */
extern("xr_conditions.signal_rocket_flying", (_: GameObject, __: GameObject, [name]: [TName]): boolean => {
  const rocket: Optional<SignalLightBinder> = registry.signalLights.get(name) as Optional<SignalLightBinder>;

  if (!rocket) {
    abort("No such signal rocket: '%s' on the level.", name);
  }

  return rocket.isFlying();
});

/**
 * Check whether smart terrain alarm status matches provided parameters.
 *
 * Where:
 * - terrainName - name of target smart terrain
 * - alarmStatus - status value to check in smart terrain
 *
 * Throws, if parameters are invalid or target smart terrain is invalid.
 */
extern(
  "xr_conditions.check_smart_alarm_status",
  (_: GameObject, __: GameObject, [terrainName, alarmStatus]: [TName, keyof typeof ALARM_STATUSES]): boolean => {
    const status: Optional<ESmartTerrainStatus> = ALARM_STATUSES[alarmStatus];

    if (!status) {
      return abort("Wrong status '%s' in 'check_smart_alarm_status' condition.", status);
    }

    const terrainControl: Optional<SmartTerrainControl> = getManager(SimulationManager).getTerrainByName(terrainName)
      ?.terrainControl as Optional<SmartTerrainControl>;

    if (!terrainControl) {
      return abort("Cannot calculate 'check_smart_alarm_status' for terrain '%s'.", terrainName);
    }

    return terrainControl.getSmartTerrainStatus() === status;
  }
);
