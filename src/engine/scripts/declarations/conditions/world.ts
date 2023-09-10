import { level } from "xray16";

import { registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";
import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects/server/smart_terrain";
import { ESmartTerrainStatus } from "@/engine/core/objects/server/smart_terrain/types";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { anomalyHasArtefact } from "@/engine/core/utils/object/object_anomaly";
import { ClientObject, Optional, TName, TSection, TTimestamp } from "@/engine/lib/types";

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
 * Check whether anomaly with name has artefact.
 *
 * @param anomalyName - name of the anomaly to check
 * @param artefactSection - section of the artefact to check
 * @returns whether anomaly has artefact
 */
extern(
  "xr_conditions.anomaly_has_artefact",
  (actor: ClientObject, object: ClientObject, [anomalyName, artefactSection]: [TName, TSection]): boolean => {
    return anomalyHasArtefact(anomalyName, artefactSection);
  }
);

/**
 * @returns whether surge is completed
 */
extern("xr_conditions.surge_complete", (): boolean => {
  return SurgeManager.IS_FINISHED;
});

/**
 * @returns whether surge is started
 */
extern("xr_conditions.surge_started", (): boolean => {
  return SurgeManager.IS_STARTED;
});

/**
 * @returns whether surge is killing all not hided objects
 */
extern("xr_conditions.surge_kill_all", (): boolean => {
  return SurgeManager.getInstance().isKillingAll();
});

/**
 * todo;
 */
extern("xr_conditions.signal_rocket_flying", (actor: ClientObject, npc: ClientObject, p: [string]): boolean => {
  if (p === null) {
    abort("Signal rocket name is !set!");
  }

  if (registry.signalLights.get(p[0]) !== null) {
    return registry.signalLights.get(p[0]).isFlying();
  } else {
    abort("No such signal rocket: [%s] on level", tostring(p[0]));
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.time_period", (actor: ClientObject, npc: ClientObject, p: [number, number]): boolean => {
  const [tshift, period] = p;

  if (tshift !== null && period !== null && registry.actor !== null) {
    return tshift > period && level.get_time_minutes() % tshift <= period;
  }

  return false;
});

/**
 * todo;
 */
const ALARM_STATUSES = {
  normal: ESmartTerrainStatus.NORMAL,
  danger: ESmartTerrainStatus.DANGER,
  alarm: ESmartTerrainStatus.ALARM,
};

/**
 * todo;
 */
extern(
  "xr_conditions.check_smart_alarm_status",
  (
    actor: ClientObject,
    object: ClientObject,
    [smartName, smartStatus]: [TName, keyof typeof ALARM_STATUSES]
  ): boolean => {
    const status: Optional<ESmartTerrainStatus> = ALARM_STATUSES[smartStatus];

    if (!status) {
      abort("Wrong status[%s] in 'check_smart_alarm_status'", status);
    }

    const smart: SmartTerrain = SimulationBoardManager.getInstance().getSmartTerrainByName(smartName)!;
    const smartControl: Optional<SmartTerrainControl> = smart.smartTerrainActorControl;

    if (smartControl === null) {
      abort("Cannot calculate 'check_smart_alarm_status' for smart '%s'.", tostring(smartName));
    }

    return smartControl.getSmartTerrainStatus() === status;
  }
);
