import { level, XR_game_object } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { ItemUpgradesManager } from "@/engine/core/managers/interface/ItemUpgradesManager";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { SmartTerrainControl } from "@/engine/core/objects/server/smart_terrain/SmartTerrainControl";
import { ESmartTerrainStatus } from "@/engine/core/objects/server/smart_terrain/types";
import { SchemeAnimpoint } from "@/engine/core/schemes/animpoint";
import { ISchemeAnimpointState } from "@/engine/core/schemes/animpoint/ISchemeAnimpointState";
import { SchemeDeimos } from "@/engine/core/schemes/sr_deimos/SchemeDeimos";
import { abort } from "@/engine/core/utils/assertion";
import { isPlayingSound } from "@/engine/core/utils/check/check";
import { hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { anomalyHasArtefact } from "@/engine/core/utils/object";
import { captions, TCaption } from "@/engine/lib/constants/captions/captions";
import { infoPortions } from "@/engine/lib/constants/info_portions/info_portions";
import { AnyArgs, LuaArray, Optional, TCount } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function is_playing_sound(actor: XR_game_object, npc: XR_game_object): boolean {
  return isPlayingSound(npc);
}

/**
 * todo;
 */
export function _used(actor: XR_game_object, npc: XR_game_object): boolean {
  return npc.is_talking();
}

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
export function check_smart_alarm_status(
  actor: XR_game_object,
  npc: XR_game_object,
  params: [string, string]
): boolean {
  const smartName: string = params[0];
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

/**
 * todo;
 */
export function time_period(actor: XR_game_object, npc: XR_game_object, p: [number, number]): boolean {
  const [tshift, period] = p;

  if (tshift !== null && period !== null && registry.actor !== null) {
    return tshift > period && level.get_time_minutes() % tshift <= period;
  }

  return false;
}

/**
 * todo;
 */
export function treasure_exist(actor: XR_game_object, npc: XR_game_object) {
  return true;
}

/**
 * todo;
 */
export function surge_complete(): boolean {
  return SurgeManager.getInstance().isFinished;
}

/**
 * todo;
 */
export function surge_started(): boolean {
  return SurgeManager.getInstance().isStarted;
}

/**
 * todo;
 */
export function surge_kill_all(): boolean {
  return SurgeManager.getInstance().isKillingAll();
}

/**
 * todo;
 */
export function signal_rocket_flying(actor: XR_game_object, npc: XR_game_object, p: [string]): boolean {
  if (p === null) {
    abort("Signal rocket name is !set!");
  }

  if (registry.signalLights.get(p[0]) !== null) {
    return registry.signalLights.get(p[0]).isFlying();
  } else {
    abort("No such signal rocket: [%s] on level", tostring(p[0]));
  }

  return false;
}

/**
 * todo;
 */
export function animpoint_reached(actor: XR_game_object, npc: XR_game_object): boolean {
  const animpointState: Optional<ISchemeAnimpointState> = registry.objects.get(npc.id())[
    SchemeAnimpoint.SCHEME_SECTION
  ] as Optional<ISchemeAnimpointState>;

  if (animpointState === null) {
    return false;
  }

  return animpointState.animpoint.isPositionReached();
}

/**
 * todo;
 */
export function is_rain(): boolean {
  return registry.actor !== null && level.rain_factor() > 0;
}

/**
 * todo;
 */
export function is_heavy_rain(): boolean {
  return registry.actor !== null && level.rain_factor() >= 0.5;
}

/**
 * todo;
 */
export function is_day(): boolean {
  return registry.actor !== null && level.get_time_hours() >= 6 && level.get_time_hours() < 21;
}

/**
 * todo;
 */
export function is_dark_night(): boolean {
  return registry.actor !== null && (level.get_time_hours() < 3 || level.get_time_hours() > 22);
}

/**
 * todo;
 */
export function anomaly_has_artefact(
  actor: XR_game_object,
  npc: XR_game_object,
  p: [string, string]
): LuaMultiReturn<[boolean, Optional<LuaArray<string>>]> {
  const [artefact, details] = anomalyHasArtefact(actor, npc, p);

  return $multi(artefact, details);
}

/**
 * todo;
 */
export function check_deimos_phase(actor: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean {
  if (params[0] && params[1]) {
    const obj: IRegistryObjectState = registry.objects.get(npc.id());
    const delta: boolean = SchemeDeimos.checkIntensityDelta(obj);

    if (params[1] === "increasing" && delta) {
      return false;
    } else if (params[1] === "decreasing" && !delta) {
      return false;
    }

    if (params[0] === "disable_bound") {
      if (params[1] === "increasing") {
        if (!SchemeDeimos.checkDisableBound(obj)) {
          return true;
        }
      } else if (params[1] === "decreasing") {
        return SchemeDeimos.checkDisableBound(obj);
      }
    } else if (params[0] === "lower_bound") {
      if (params[1] === "increasing") {
        if (!SchemeDeimos.checkLowerBound(obj)) {
          return true;
        }
      } else if (params[1] === "decreasing") {
        return SchemeDeimos.checkLowerBound(obj);
      }
    } else if (params[0] === "upper_bound") {
      if (params[1] === "increasing") {
        if (!SchemeDeimos.checkUpperBound(obj)) {
          return true;
        }
      } else if (params[1] === "decreasing") {
        return SchemeDeimos.checkUpperBound(obj);
      }
    }
  }

  return false;
}

/**
 * todo;
 */
export function upgrade_hint_kardan(actor: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean {
  const itemUpgradeHints: LuaArray<TCaption> = new LuaTable();
  const toolsCount: TCount = (params && tonumber(params[0])) || 0;
  let can_upgrade = 0;

  if (!hasAlifeInfo(infoPortions.zat_b3_all_instruments_brought)) {
    if (!hasAlifeInfo(infoPortions.zat_b3_tech_instrument_1_brought) && (toolsCount === 0 || toolsCount === 1)) {
      table.insert(itemUpgradeHints, captions.st_upgr_toolkit_1);
    } else if (toolsCount === 1) {
      can_upgrade = can_upgrade + 1;
    }

    if (!hasAlifeInfo(infoPortions.zat_b3_tech_instrument_2_brought) && (toolsCount === 0 || toolsCount === 2)) {
      table.insert(itemUpgradeHints, captions.st_upgr_toolkit_2);
    } else if (toolsCount === 2) {
      can_upgrade = can_upgrade + 1;
    }

    if (!hasAlifeInfo(infoPortions.zat_b3_tech_instrument_3_brought) && (toolsCount === 0 || toolsCount === 3)) {
      table.insert(itemUpgradeHints, captions.st_upgr_toolkit_3);
    } else if (toolsCount === 3) {
      can_upgrade = can_upgrade + 1;
    }
  } else {
    can_upgrade = can_upgrade + 1;
  }

  if (!hasAlifeInfo(infoPortions.zat_b3_tech_see_produce_62)) {
    if (toolsCount === 1 && !hasAlifeInfo(infoPortions.zat_b3_tech_have_one_dose)) {
      table.insert(itemUpgradeHints, captions.st_upgr_vodka);
    } else if (toolsCount !== 1 && !hasAlifeInfo(infoPortions.zat_b3_tech_have_couple_dose)) {
      table.insert(itemUpgradeHints, captions.st_upgr_vodka);
    } else {
      can_upgrade = can_upgrade + 1;
    }
  } else {
    can_upgrade = can_upgrade + 1;
  }

  ItemUpgradesManager.getInstance().setCurrentHints(itemUpgradeHints);

  return can_upgrade >= 2;
}

/**
 * todo;
 */
export function is_door_blocked_by_npc(actor: XR_game_object, object: XR_game_object): boolean {
  return object.is_door_blocked_by_npc();
}
