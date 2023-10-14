import type {
  IRankDescriptor,
  IRegistryObjectState,
  IStoredOfflineObject,
} from "@/engine/core/database/database_types";
import type { AbstractManager, TAbstractCoreManagerConstructor } from "@/engine/core/managers/base/AbstractManager";
import type { CampManager } from "@/engine/core/managers/camp";
import type { TSimulationObject } from "@/engine/core/managers/simulation";
import type { ITradeManagerDescriptor } from "@/engine/core/managers/trade";
import type { TAbstractSchemeConstructor } from "@/engine/core/objects/ai/scheme";
import type {
  AnomalyFieldBinder,
  AnomalyZoneBinder,
  LabX8DoorBinder,
  SignalLightBinder,
} from "@/engine/core/objects/binders";
import type { Actor } from "@/engine/core/objects/server/creature/Actor";
import type { SmartCover } from "@/engine/core/objects/server/smart_cover";
import type { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import type { LightManager } from "@/engine/core/schemes/restrictor/sr_light";
import type { PatrolManager } from "@/engine/core/schemes/stalker/patrol";
import type { ReachTaskPatrolManager } from "@/engine/core/schemes/stalker/reach_task";
import type { IExtensionsDescriptor } from "@/engine/core/utils/extensions";
import type { TConditionList } from "@/engine/core/utils/ini/ini_types";
import type { ERelation } from "@/engine/core/utils/relation";
import { storyNames, TStoryName } from "@/engine/lib/constants/story_names";
import type {
  AlifeSimulator,
  ClientObject,
  EScheme,
  IniFile,
  Optional,
  TIndex,
  TName,
  TNumberId,
  TStringId,
  ZoneCampfire,
} from "@/engine/lib/types";

/**
 * Global-level registry of objects and references.
 * Stores up-to-date game state.
 */
export const registry = {
  musicVolume: 0,
  effectsVolume: 0,
  /**
   * Current simulator, injected on game start.
   */
  simulator: null as unknown as AlifeSimulator,
  /**
   * Current actor, injected on game start.
   */
  actor: null as unknown as ClientObject,
  /**
   * Current actor, server object representation.
   */
  actorServer: null as unknown as Actor,
  /**
   * Currently active speaker in dialogs.
   */
  activeSpeaker: null as Optional<ClientObject>,
  /**
   * Currently active smart terrain id.
   * If not null, assume actor is in it.
   */
  activeSmartTerrainId: null as Optional<TNumberId>,
  /**
   * List of active game managers.
   */
  managers: new LuaTable<TAbstractCoreManagerConstructor, AbstractManager>(),
  /**
   * List of activated schemes in game.
   */
  schemes: new LuaTable<EScheme, TAbstractSchemeConstructor>(),
  cache: {
    /**
     * Memoized condlist for parsing simplification, where key is string data and value is parsed descriptor.
     */
    conditionLists: new LuaTable<string, TConditionList>(),
  },
  /**
   * Set of objects in combat with actor.
   */
  actorCombat: new LuaTable<TNumberId, boolean>(),
  /**
   * List of active objects.
   */
  objects: new LuaTable<TNumberId, IRegistryObjectState>(),
  /**
   * Game ranks.
   */
  ranks: {
    /**
     * Whether ranks were initialized from game ini files.
     */
    isInitialized: false,
    /**
     * Memoized stalker ranks list.
     */
    stalker: new LuaTable<TIndex, IRankDescriptor>(),
    /**
     * Memoized monster ranks list.
     */
    monster: new LuaTable<TIndex, IRankDescriptor>(),
    /**
     * Max rank for stalkers.
     */
    maxStalkerRank: null as unknown as IRankDescriptor,
    /**
     * Max rank for monsters.
     */
    maxMonsterRank: null as unknown as IRankDescriptor,
  },
  /**
   * List of offline objects.
   */
  offlineObjects: new LuaTable<TNumberId, IStoredOfflineObject>(),
  /**
   * List of wounded objects.
   */
  objectsWounded: new LuaTable<TNumberId, IRegistryObjectState>(),
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
   * Camp managers with logic.
   */
  camps: new LuaTable<TNumberId, CampManager>(),
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
    storage: new LuaTable<TNumberId, ClientObject>(),
    enemies: new LuaTable<TNumberId, ClientObject>(),
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
    relations: new LuaTable<TNumberId, ERelation>(),
  },
  /**
   * List of active zones by name.
   */
  zones: new LuaTable<TName, ClientObject>(),
  /**
   * List of zones under silence restriction, no music is allowed.
   */
  silenceZones: new LuaTable<TNumberId, TName>(),
  /**
   * Set of zones under no weapon restriction.
   */
  noWeaponZones: new LuaTable<TNumberId, boolean>(),
  /**
   * List of light active.
   */
  lightZones: new LuaTable<number, LightManager>(),
  /**
   * List of dynamically created ini files by name.
   */
  ini: new LuaTable<TName, IniFile>(),
  /**
   * List of active smart terrains.
   */
  smartTerrains: new LuaTable<TNumberId, SmartTerrain>(),
  /**
   * List of campfires by smart terrain name.
   */
  smartTerrainsCampfires: new LuaTable<TName, LuaTable<TNumberId, ZoneCampfire>>(),
  /**
   * Nearest to actor smart terrain.
   */
  smartTerrainNearest: {
    id: null as Optional<TNumberId>,
    distanceSqr: math.huge,
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
   * List of synchronization groups for game patrols.
   * Related to stalkers patrol manager.
   */
  patrolSynchronization: new LuaTable<TName, LuaTable<TNumberId, boolean>>(),
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
   * Set of terrains where combat is disabled.
   */
  noCombatSmartTerrains: $fromObject<TName, boolean>({
    [storyNames.zat_stalker_base_smart]: true,
    [storyNames.jup_b41]: true,
    [storyNames.jup_a6]: true,
    [storyNames.pri_a16]: true,
  }),
  /**
   * Set of terrains defined as stalker bases.
   */
  baseSmartTerrains: $fromObject<TName, boolean>({
    [storyNames.zat_stalker_base_smart]: true,
    [storyNames.jup_a6]: true,
    [storyNames.pri_a16]: true,
  }),
  /**
   * List of extensions details loaded additionally to the game engine.
   */
  extensions: new LuaTable<TName, IExtensionsDescriptor>(),
};
