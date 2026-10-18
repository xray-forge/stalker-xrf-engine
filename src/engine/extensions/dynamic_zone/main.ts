import { AnyObject, Nillable, TName } from "xray16/lib";
import { $dirname } from "xray16/macros";

import { getManager } from "@/engine/core/database";
import { IExtensionsDescriptor, openExtensionIni } from "@/engine/core/extensions";
import { EGameHook, EGameHookPhase, registerGameHook } from "@/engine/core/hooks";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { LuaLogger } from "@/engine/core/utils/logging";
import { createDynamicZoneBases, IDynamicZoneBases } from "@/engine/extensions/dynamic_zone/dynamic_zone_bases";
import {
  createDynamicZoneCombat,
  IDynamicZoneCombat,
  loadDynamicZoneCombat,
  saveDynamicZoneCombat,
  updateDynamicZoneCombat,
} from "@/engine/extensions/dynamic_zone/dynamic_zone_combat";
import { IDynamicZoneConfig, readDynamicZoneConfig } from "@/engine/extensions/dynamic_zone/dynamic_zone_config";
import { getDynamicZoneHuntingRejection } from "@/engine/extensions/dynamic_zone/dynamic_zone_hunting";
import {
  getDynamicZoneRespawnIdle,
  getDynamicZoneRespawnLimit,
} from "@/engine/extensions/dynamic_zone/dynamic_zone_respawn";

const logger: LuaLogger = new LuaLogger($dirname);

export const name: TName = "Dynamic zone";
export const enabled: boolean = false;

// State of offline battles, kept across saves.
let combat: Nillable<IDynamicZoneCombat> = null;

/**
 * Make the zone calmer around the player and alive away from it: respawn points wait longer and respawn fewer squads,
 * squads at or near bases are not hunted, and enemy squads away from the player fight offline.
 *
 * @param isNewGame - Whether a new game starts.
 * @param extension - Descriptor of the extension, locating its `main.ltx`.
 */
export function register(isNewGame: boolean, extension: IExtensionsDescriptor): void {
  const config: IDynamicZoneConfig = readDynamicZoneConfig(openExtensionIni(extension));
  const bases: IDynamicZoneBases = createDynamicZoneBases(config);

  logger.info("Dynamic zone activated, respawn wait: %s", config.respawnIdle);

  combat = createDynamicZoneCombat(config, bases);

  registerGameHook(EGameHook.SMART_TERRAIN_RESPAWN_IDLE, getDynamicZoneRespawnIdle, {
    owner: name,
    phase: EGameHookPhase.SET,
    context: config,
  });
  registerGameHook(EGameHook.SMART_TERRAIN_RESPAWN_LIMIT, getDynamicZoneRespawnLimit, {
    owner: name,
    context: config,
  });
  registerGameHook(EGameHook.SIMULATION_TARGET_VALIDITY, getDynamicZoneHuntingRejection, {
    owner: name,
    context: bases,
  });

  getManager(EventsManager).registerCallback(EGameEvent.ACTOR_UPDATE_1000, updateDynamicZoneCombat, combat);
}

/**
 * @param data - Extension save data to write.
 */
export function save(data: AnyObject): void {
  if (combat) {
    saveDynamicZoneCombat(combat, data);
  }
}

/**
 * @param data - Extension save data to read.
 */
export function load(data: AnyObject): void {
  if (combat) {
    loadDynamicZoneCombat(combat, data);
  }
}
