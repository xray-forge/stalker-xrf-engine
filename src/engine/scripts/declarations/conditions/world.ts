import { level } from "xray16";

import { SignalLightBinder } from "@/engine/core/binders/physic";
import { getManager, registry } from "@/engine/core/database";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";
import { ALARM_STATUSES, SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { ESmartTerrainStatus } from "@/engine/core/objects/smart_terrain/smart_terrain_types";
import { anomalyHasArtefact } from "@/engine/core/utils/anomaly";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { GameObject, Optional, TName, TSection, TTimestamp } from "@/engine/lib/types";

/**
 * @returns whether it is rainy in the game right now
 */
extern("xr_conditions.is_rain", (): boolean => {
  return registry.actor !== null && level.rain_factor() > 0;
});

/**
 * @returns whether it is heavy rain weather in the game right now
 */
extern("xr_conditions.is_heavy_rain", (): boolean => {
  return registry.actor !== null && level.rain_factor() >= 0.5;
});

/**
 * @returns whether it is dark daytime in the game
 */
extern("xr_conditions.is_day", (): boolean => {
  const timeHours: TTimestamp = level.get_time_hours();

  return registry.actor !== null && timeHours >= 6 && timeHours < 21;
});

/**
 * @returns whether it is dark nighttime in the game
 */
extern("xr_conditions.is_dark_night", (): boolean => {
  const timeHours: TTimestamp = level.get_time_hours();

  return registry.actor !== null && (timeHours < 3 || timeHours > 22);
});

/**
 * @returns whether current game minutes are within shift period (gets module from minutes and check <= period)
 */
extern(
  "xr_conditions.time_period",
  (actor: GameObject, object: GameObject, [shift, period]: [Optional<number>, Optional<number>]): boolean => {
    if (shift && period && registry.actor !== null) {
      return shift > period && level.get_time_minutes() % shift <= period;
    }

    return false;
  }
);

/**
 * Check whether anomaly with name has artefact.
 *
 * @param anomalyName - name of the anomaly to check
 * @param artefactSection - section of the artefact to check
 * @returns whether anomaly has artefact
 */
extern(
  "xr_conditions.anomaly_has_artefact",
  (actor: GameObject, object: GameObject, [anomalyName, artefactSection]: [TName, TSection]): boolean => {
    return anomalyHasArtefact(anomalyName, artefactSection);
  }
);

/**
 * @returns whether surge is completed
 */
extern("xr_conditions.surge_complete", (): boolean => {
  return surgeConfig.IS_FINISHED;
});

/**
 * @returns whether surge is started
 */
extern("xr_conditions.surge_started", (): boolean => {
  return surgeConfig.IS_STARTED;
});

/**
 * @returns whether surge is killing all not hided objects
 */
extern("xr_conditions.surge_kill_all", (): boolean => {
  return getManager(SurgeManager).isKillingAll();
});

/**
 * @returns whether surge signal rockets flying
 */
extern("xr_conditions.signal_rocket_flying", (actor: GameObject, object: GameObject, [name]: [TName]): boolean => {
  const rocket: Optional<SignalLightBinder> = registry.signalLights.get(name) as Optional<SignalLightBinder>;

  if (rocket) {
    return rocket.isFlying();
  } else {
    abort("No such signal rocket: '%s' on the level.", name);
  }
});

/**
 * @returns whether smart terrain alarm status matches provided parameters
 */
extern(
  "xr_conditions.check_smart_alarm_status",
  (
    actor: GameObject,
    object: GameObject,
    [terrainName, alarmStatus]: [TName, keyof typeof ALARM_STATUSES]
  ): boolean => {
    const status: Optional<ESmartTerrainStatus> = ALARM_STATUSES[alarmStatus];

    if (!status) {
      abort("Wrong status '%s' in 'check_smart_alarm_status'.", status);
    }

    const terrain: Optional<SmartTerrain> = getManager(SimulationManager).getSmartTerrainByName(terrainName);

    if (terrain?.smartTerrainActorControl) {
      return terrain.smartTerrainActorControl.getSmartTerrainStatus() === status;
    } else {
      abort("Cannot calculate 'check_smart_alarm_status' for smart terrain '%s'.", terrainName);
    }
  }
);
