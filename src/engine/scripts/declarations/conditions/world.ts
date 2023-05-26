import { game_object, level } from "xray16";

import { registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects";
import { ESmartTerrainStatus } from "@/engine/core/objects/server/smart_terrain/types";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { anomalyHasArtefact } from "@/engine/core/utils/object";
import { LuaArray, Optional, TName } from "@/engine/lib/types";

/**
 * todo;
 */
extern("xr_conditions.is_rain", (): boolean => {
  return registry.actor !== null && level.rain_factor() > 0;
});

/**
 * todo;
 */
extern("xr_conditions.is_heavy_rain", (): boolean => {
  return registry.actor !== null && level.rain_factor() >= 0.5;
});

/**
 * todo;
 */
extern("xr_conditions.is_day", (): boolean => {
  return registry.actor !== null && level.get_time_hours() >= 6 && level.get_time_hours() < 21;
});

/**
 * todo;
 */
extern("xr_conditions.is_dark_night", (): boolean => {
  return registry.actor !== null && (level.get_time_hours() < 3 || level.get_time_hours() > 22);
});

/**
 * todo;
 */
extern(
  "xr_conditions.anomaly_has_artefact",
  (
    actor: game_object,
    npc: game_object,
    p: [string, string]
  ): LuaMultiReturn<[boolean, Optional<LuaArray<string>>]> => {
    const [artefact, details] = anomalyHasArtefact(actor, npc, p);

    return $multi(artefact, details);
  }
);

/**
 * todo;
 */
extern("xr_conditions.surge_complete", (): boolean => {
  return SurgeManager.getInstance().isFinished;
});

/**
 * todo;
 */
extern("xr_conditions.surge_started", (): boolean => {
  return SurgeManager.getInstance().isStarted;
});

/**
 * todo;
 */
extern("xr_conditions.surge_kill_all", (): boolean => {
  return SurgeManager.getInstance().isKillingAll();
});

/**
 * todo;
 */
extern("xr_conditions.signal_rocket_flying", (actor: game_object, npc: game_object, p: [string]): boolean => {
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
extern("xr_conditions.time_period", (actor: game_object, npc: game_object, p: [number, number]): boolean => {
  const [tshift, period] = p;

  if (tshift !== null && period !== null && registry.actor !== null) {
    return tshift > period && level.get_time_minutes() % tshift <= period;
  }

  return false;
});

/**
 * todo;
 */
const alarm_statuses = {
  normal: ESmartTerrainStatus.NORMAL,
  danger: ESmartTerrainStatus.DANGER,
  alarm: ESmartTerrainStatus.ALARM,
};

/**
 * todo;
 */
extern(
  "xr_conditions.check_smart_alarm_status",
  (actor: game_object, npc: game_object, params: [TName, string]): boolean => {
    const smartName: TName = params[0];
    const status: ESmartTerrainStatus = alarm_statuses[params[1] as keyof typeof alarm_statuses];

    if (status === null) {
      abort("Wrong status[%s] in 'check_smart_alarm_status'", tostring(params[1]));
    }

    const smart: SmartTerrain = SimulationBoardManager.getInstance().getSmartTerrainByName(smartName)!;
    const smartControl: SmartTerrainControl = smart.smartTerrainActorControl;

    if (smartControl === null) {
      abort("Cannot calculate 'check_smart_alarm_status' for smart %s", tostring(smartName));
    }

    return smartControl.getSmartTerrainStatus() === status;
  }
);
