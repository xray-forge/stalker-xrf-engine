import type { XR_game_object } from "xray16";

import type { TRelation } from "@/mod/globals/relations";
import type { EScheme, TName, TNumberId, TStringId } from "@/mod/lib/types";
import type { IRegistryObjectState } from "@/mod/scripts/core/database/objects";
import type { IStoredOfflineObject } from "@/mod/scripts/core/database/offline";
import type {
  AbstractCoreManager,
  TAbstractCoreManagerConstructor,
} from "@/mod/scripts/core/manager/AbstractCoreManager";
import type { ITradeManagerDescriptor } from "@/mod/scripts/core/manager/TradeManager";
import {
  AnomalyZoneBinder,
  LabX8DoorBinder,
  SignalLightBinder,
  SmartCover,
  SmartTerrain,
} from "@/mod/scripts/core/object";
import type { TAbstractSchemeConstructor } from "@/mod/scripts/core/scheme/base";
import type { CampStoryManager } from "@/mod/scripts/core/scheme/camper";
import type { PatrolManager } from "@/mod/scripts/core/scheme/patrol";
import type { ReachTaskPatrolManager } from "@/mod/scripts/core/scheme/reach_task";
import type { LightManager } from "@/mod/scripts/core/scheme/sr_light";
import type { AbstractPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/AbstractPlayableSound";

/**
 * Global-level registry of objects and references.
 * Stores up-to-date game state.
 */
export const registry = {
  /**
   * Current actor, injected on game start.
   */
  actor: null as unknown as XR_game_object,
  /**
   * List of active game managers.
   */
  managers: new LuaTable<TAbstractCoreManagerConstructor, AbstractCoreManager>(),
  /**
   * List of activated schemes in game.
   */
  schemes: new LuaTable<EScheme, TAbstractSchemeConstructor>(),
  /**
   * Set of objects in combat with actor.
   */
  actorCombat: new LuaTable<TNumberId, boolean>(),
  /**
   * List of active objects.
   */
  objects: new LuaTable<TNumberId, IRegistryObjectState>(),
  /**
   * List of offline objects.
   */
  offlineObjects: new LuaTable<TNumberId, IStoredOfflineObject>(),
  /**
   * State of trade.
   */
  trade: new LuaTable<TNumberId, ITradeManagerDescriptor>(),
  /**
   * Camp related states.
   */
  camps: {
    stories: new LuaTable<TNumberId, CampStoryManager>(),
  },
  /**
   * List of current zone crows spawned.
   */
  crows: {
    // Used as set.
    storage: new LuaTable<TNumberId, TNumberId>(),
    count: 0,
  },
  /**
   * List of data for game helicopters.
   */
  helicopter: {
    storage: new LuaTable<TNumberId, XR_game_object>(),
    enemies: new LuaTable<TNumberId, XR_game_object>(),
    enemiesCount: 0,
  },
  /**
   * List active anomalies by name.
   */
  anomalies: new LuaTable<TName, AnomalyZoneBinder>(),
  /**
   * List of data for game artefacts.
   */
  artefacts: {
    ways: new LuaTable<TNumberId, TName>(),
    points: new LuaTable<TNumberId, number>(),
    parentZones: new LuaTable<TNumberId, AnomalyZoneBinder>(),
  },
  /**
   * Goodwill state.
   */
  goodwill: {
    sympathy: new LuaTable<TNumberId, number>(),
    relations: new LuaTable<TNumberId, TRelation>(),
  },
  /**
   * List of active zones by name.
   */
  zones: new LuaTable<TName, XR_game_object>(),
  /**
   * List of zones under silence restriction, no music is allowed.
   */
  silenceZones: new LuaTable<TNumberId, TName>(),
  /**
   * Set of zones under no weapon restriction.
   */
  noWeaponZones: new LuaTable<TName, boolean>(),
  /**
   * List of light active.
   */
  lightZones: new LuaTable<number, LightManager>(),
  /**
   * List of active smart terrains.
   */
  smartTerrains: new LuaTable<TNumberId, SmartTerrain>(),
  /**
   * List of active smart covers.
   */
  smartCovers: new LuaTable<TName, SmartCover>(),
  /**
   * List of objects spawned by scripts execution.
   * $ key - object id, value - zone name.
   */
  scriptSpawned: new LuaTable<TNumberId, TName>(),
  /**
   * List of active scripted animated doors.
   */
  animatedDoors: new LuaTable<TName, LabX8DoorBinder>(),
  /**
   * List of save markers.
   */
  saveMarkers: new LuaTable<TName, number>(),
  /**
   * List of signal lights existing.
   */
  signalLights: new LuaTable<TName, SignalLightBinder>(),
  /**
   * List of vertexes with matching IDs of existing objects.
   */
  spawnedVertexes: new LuaTable<TNumberId, TNumberId>(),
  /**
   * List of active patrols and actions.
   */
  patrols: {
    generic: new LuaTable<TStringId, PatrolManager>(),
    reachTask: new LuaTable<TName, ReachTaskPatrolManager>(),
  },
  /**
   * State of active sounds.
   */
  sounds: {
    musicVolume: 0,
    effectsVolume: 0,
    generic: new LuaTable<TNumberId, AbstractPlayableSound>(),
    looped: new LuaTable<TNumberId, LuaTable<TName, AbstractPlayableSound>>(),
    themes: new LuaTable<TName, AbstractPlayableSound>(),
  },
};
