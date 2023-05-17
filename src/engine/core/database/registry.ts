import type { XR_CZoneCampfire, XR_game_object } from "xray16";

import type { IStoredOfflineObject } from "@/engine/core/database/offline";
import type { IRegistryObjectState } from "@/engine/core/database/types";
import type {
  AbstractCoreManager,
  TAbstractCoreManagerConstructor,
} from "@/engine/core/managers/base/AbstractCoreManager";
import type { ITradeManagerDescriptor } from "@/engine/core/managers/interaction/TradeManager";
import type {
  AnomalyFieldBinder,
  AnomalyZoneBinder,
  LabX8DoorBinder,
  SignalLightBinder,
  SmartCover,
  SmartTerrain,
  TSimulationObject,
} from "@/engine/core/objects";
import type { AbstractPlayableSound } from "@/engine/core/objects/sounds/playable_sounds/AbstractPlayableSound";
import type { SoundManager } from "@/engine/core/objects/sounds/SoundManager";
import type { TAbstractSchemeConstructor } from "@/engine/core/schemes/base";
import type { CampStoryManager } from "@/engine/core/schemes/camper";
import type { PatrolManager } from "@/engine/core/schemes/patrol";
import type { ReachTaskPatrolManager } from "@/engine/core/schemes/reach_task";
import type { LightManager } from "@/engine/core/schemes/sr_light";
import type { TRelation } from "@/engine/lib/constants/relations";
import { storyNames, TStoryName } from "@/engine/lib/constants/story_names";
import type { EScheme, Optional, TName, TNumberId, TStringId } from "@/engine/lib/types";

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
   * Currently active speaker in dialogs.
   */
  activeSpeaker: null as Optional<XR_game_object>,
  /**
   * Currently active smart terrain id.
   * If not null, assume actor is in it.
   */
  activeSmartTerrainId: null as Optional<TNumberId>,
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
   * List of objects participating in alife simulation.
   */
  simulationObjects: new LuaTable<TNumberId, TSimulationObject>(),
  /**
   * Story objects mapping to match currently spawned object IDs and unique story objects.
   */
  storyLink: {
    sidById: new LuaTable<TNumberId, TStringId>(),
    idBySid: new LuaTable<TStringId, TNumberId>(),
  },
  /**
   * Set of alive stalker IDs for easy filtering and iteration.
   */
  stalkers: new LuaTable<TNumberId, boolean>(),
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
    enemyIndex: 0,
  },
  /**
   * Anomaly zones by name.
   */
  anomalyZones: new LuaTable<TName, AnomalyZoneBinder>(),
  /**
   * Anomaly fields by name.
   */
  anomalyFields: new LuaTable<TName, AnomalyFieldBinder>(),
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
   * List of campfires by smart terrain name.
   */
  smartTerrainsCampfires: new LuaTable<TName, LuaTable<TNumberId, XR_CZoneCampfire>>(),
  /**
   * Nearest to actor smart terrain.
   */
  smartTerrainNearest: {
    id: null as Optional<TNumberId>,
    distance: math.huge,
  },
  /**
   * List of active smart covers.
   */
  smartCovers: new LuaTable<TName, SmartCover>(),
  /**
   * List of active scripted doors.
   * Mainly used for scripted control of state and animation.
   */
  doors: new LuaTable<TName, LabX8DoorBinder>(),
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
    reachTask: new LuaTable<TNumberId, ReachTaskPatrolManager>(),
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
    managers: new LuaTable<TStringId, SoundManager>(),
  },
  /**
   * Map of no assault zones.
   * - key is name of no assault zone
   * - value is story name of smart terrain
   */
  noCombatZones: $fromObject<TName, TStoryName>({
    ["zat_a2_sr_no_assault"]: storyNames.zat_stalker_base_smart,
    ["jup_a6_sr_no_assault"]: storyNames.jup_a6,
    ["jup_b41_sr_no_assault"]: storyNames.jup_b41,
  }),
  /**
   * List of terrains where weapons are not allowed.
   */
  noWeaponSmartTerrains: $fromArray<TStoryName>([
    storyNames.zat_stalker_base_smart,
    storyNames.jup_b41,
    storyNames.jup_a6,
    storyNames.pri_a16,
  ]),
};
