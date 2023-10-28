import { CALifeSmartTerrainTask, cse_alife_online_offline_group, level, LuabindClass, patrol } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  openLoadMarker,
  openSaveMarker,
  registerObjectStoryLinks,
  registerSimulationObject,
  registry,
  resetStalkerState,
  SMART_TERRAIN_MASKS_LTX,
  softResetOfflineObject,
  SQUAD_BEHAVIOURS_LTX,
  SYSTEM_INI,
  unregisterSimulationObject,
  unregisterStoryLinkByObjectId,
  updateSimulationObjectAvailability,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { MapDisplayManager } from "@/engine/core/managers/map/MapDisplayManager";
import {
  ESimulationTerrainRole,
  ISimulationActivityDescriptor,
  ISimulationTarget,
  simulationActivities,
  TSimulationActivityPrecondition,
  TSimulationObject,
} from "@/engine/core/managers/simulation";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import { StoryManager } from "@/engine/core/managers/sounds/stories";
import { ESmartTerrainStatus } from "@/engine/core/objects/smart_terrain/smart_terrain_types";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { SquadReachTargetAction, SquadStayOnTargetAction } from "@/engine/core/objects/squad/action";
import { ESquadActionType, ISquadAction } from "@/engine/core/objects/squad/squad_types";
import { abort } from "@/engine/core/utils/assertion";
import { isSmartTerrain, isSquad, isSquadId } from "@/engine/core/utils/class_ids";
import {
  parseConditionsList,
  parseStringsList,
  pickSectionFromCondList,
  readIniBoolean,
  readIniNumber,
  readIniString,
  readIniTwoNumbers,
  TConditionList,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areObjectsOnSameLevel } from "@/engine/core/utils/position";
import { areCommunitiesEnemies, ERelation, setObjectSympathy } from "@/engine/core/utils/relation";
import { canSquadHelpActor, updateSquadInvulnerabilityState } from "@/engine/core/utils/squad";
import { vectorToString } from "@/engine/core/utils/vector";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { squadCommunityByBehaviour } from "@/engine/lib/constants/behaviours";
import { TCommunity } from "@/engine/lib/constants/communities";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { SMART_TERRAIN_SECTION } from "@/engine/lib/constants/sections";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import {
  ALifeSmartTerrainTask,
  GameObject,
  LuaArray,
  NetPacket,
  Optional,
  Patrol,
  ServerCreatureObject,
  ServerObject,
  StringOptional,
  TCount,
  TIndex,
  TLabel,
  TName,
  TNumberId,
  Vector,
} from "@/engine/lib/types";
import { TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);
const simulationLogger: LuaLogger = new LuaLogger($filename, { file: "simulation" });

/**
 * Server object implementation for squad groups.
 */
@LuabindClass()
export class Squad extends cse_alife_online_offline_group implements ISimulationTarget {
  public isItemListSpawned: Optional<boolean> = null;
  public isSimulationAvailableConditionList: TConditionList = parseConditionsList(TRUE);
  public isMapDisplayHidden: boolean = false;
  public isAlwaysArrived: boolean = false;
  public isLocationMasksResetNeeded: boolean = true;
  public isSpotVisible: Optional<TConditionList> = null;

  // Faction for simulation (behaviour community) like monster_day/night etc.
  public faction!: TCommunity;
  public behaviour: LuaTable<string, string> = new LuaTable();

  public assignedSmartTerrainId: Optional<TNumberId> = null;
  public enteredSmartTerrainId: Optional<TNumberId> = null;

  public readonly mapDisplayManager: MapDisplayManager = MapDisplayManager.getInstance();
  public readonly simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
  public readonly soundManager: StoryManager = StoryManager.getStoryManagerForId("squad_" + this.section_name());

  public simulationProperties!: LuaTable<TName, string>;

  /**
   * Meta-info about spawn point of the squad.
   */
  public respawnPointId: Optional<TNumberId> = null;
  public respawnPointSection: Optional<TSection> = null;

  public currentMapSpotId: Optional<TNumberId> = null;
  public currentMapSpotSection: Optional<TName> = null;

  public currentAction: Optional<ISquadAction> = null;
  public currentTargetId: Optional<TNumberId> = null;
  public assignedTargetId: Optional<TNumberId> = null;
  public nextTargetId: Optional<TNumberId> = null;
  public lastTarget: Optional<string> = null;

  public parsedTargets: LuaArray<TName> = new LuaTable();

  public invulnerability: Optional<TConditionList> = null;

  public actionConditionList: TConditionList = new LuaTable();
  public deathConditionList: TConditionList = new LuaTable();

  public sympathy: Optional<TCount> = null;
  public relationship: Optional<ERelation> = null;

  public constructor(section: TSection) {
    super(section);
    this.initialize();
  }

  public override update(): void {
    super.update();

    this.mapDisplayManager.updateSquadMapSpot(this);
    this.soundManager.update();

    updateSimulationObjectAvailability(this);
    updateSquadInvulnerabilityState(this);

    const scriptTarget: Optional<TNumberId> = this.getLogicsScriptTarget();

    if (scriptTarget) {
      this.updateCurrentScriptedAction(scriptTarget);
    } else {
      this.updateCurrentGenericAction();
    }

    if (this.isLocationMasksResetNeeded) {
      this.setLocationTypes();
      this.isLocationMasksResetNeeded = false;
    }
  }

  /**
   * todo: Description.
   */
  public updateCurrentGenericAction(): void {
    const helpTargetId: Optional<TNumberId> = this.getHelpActorTargetId();

    // Try to help actor.
    if (helpTargetId) {
      simulationLogger.info("Assign squad new help target id:", this.name(), helpTargetId);

      this.assignedTargetId = helpTargetId;
      this.currentAction = null;
      this.updateNextSquadAction(false);

      return;
    }

    // Have squad target assigned, update current action and recalculate priorities.
    if (this.assignedTargetId && isSquadId(this.assignedTargetId)) {
      const target: TSimulationObject = this.simulationBoardManager.getSquadSimulationTarget(this) as TSimulationObject;

      if (isSquad(target)) {
        this.currentAction = null;
        this.assignedTargetId = target.id;
        this.updateNextSquadAction(true);

        return;
      }
    }

    // Have target and action, update it until it is finished.
    if (this.currentAction !== null && this.isAssignedTargetAvailable()) {
      const isFinished: boolean = this.currentAction.update(true);

      if (isFinished) {
        simulationLogger.format(
          "Finished task, search for new: '%s' '%s' '%s'",
          this.name(),
          this.currentAction.type,
          this.assignedTargetId
        );

        this.currentAction.finalize();

        if (this.currentAction.type === ESquadActionType.STAY_ON_TARGET || this.assignedTargetId === null) {
          this.assignedTargetId = this.simulationBoardManager.getSquadSimulationTarget(this)!.id;
        }

        this.currentAction = null;
      } else {
        return;
      }
    } else {
      this.currentAction = null;
      this.assignedTargetId = this.simulationBoardManager.getSquadSimulationTarget(this)!.id;
      this.currentTargetId = null;
    }

    this.updateNextSquadAction(true);
  }

  /**
   * todo;
   */
  public updateCurrentScriptedAction(scriptTarget: TNumberId): void {
    let isNewActionNeeded: boolean = false;

    if (this.assignedTargetId !== null && this.assignedTargetId === scriptTarget) {
      if (this.currentAction !== null) {
        if (this.currentAction.type === ESquadActionType.STAY_ON_TARGET) {
          if (this.isSquadOnPoint()) {
            isNewActionNeeded = true;
          } else {
            isNewActionNeeded = this.currentAction!.update(false);
          }
        } else {
          if (this.currentAction!.update(false)) {
            this.isSquadOnPoint();
            isNewActionNeeded = true;
          }
        }
      } else {
        this.isSquadOnPoint();
        isNewActionNeeded = true;
      }
    } else {
      isNewActionNeeded = true;
    }

    if (isNewActionNeeded) {
      this.assignedTargetId = scriptTarget;

      if (this.currentAction !== null) {
        this.currentAction.finalize();
        this.currentAction = null;
      }

      this.updateNextSquadAction(false);
    }
  }

  public override STATE_Write(packet: NetPacket): void {
    super.STATE_Write(packet);

    openSaveMarker(packet, Squad.__name);

    packet.w_stringZ(tostring(this.currentTargetId));
    packet.w_stringZ(tostring(this.respawnPointId));
    packet.w_stringZ(tostring(this.respawnPointSection));
    packet.w_stringZ(tostring(this.assignedSmartTerrainId));

    closeSaveMarker(packet, Squad.__name);
  }

  public override STATE_Read(packet: NetPacket, size: TCount): void {
    super.STATE_Read(packet, size);

    openLoadMarker(packet, Squad.__name);

    const currentTargetId: StringOptional = packet.r_stringZ();

    this.currentTargetId = currentTargetId === NIL ? null : (tonumber(currentTargetId) as TNumberId);

    const respawnPointId = packet.r_stringZ();

    this.respawnPointId = respawnPointId === NIL ? null : (tonumber(respawnPointId) as TNumberId);
    this.respawnPointSection = packet.r_stringZ();

    if (this.respawnPointSection === NIL) {
      this.respawnPointSection = null;
    }

    const smartTerrainId: StringOptional = packet.r_stringZ();

    this.assignedSmartTerrainId = smartTerrainId === NIL ? null : (tonumber(smartTerrainId) as TNumberId);

    this.initializeOnLoad();

    closeLoadMarker(packet, Squad.__name);
  }

  public override on_register(): void {
    super.on_register();

    this.simulationBoardManager.registerSquad(this);

    registerObjectStoryLinks(this);
    registerSimulationObject(this);

    EventsManager.emitEvent(EGameEvent.SQUAD_REGISTERED, this);
  }

  public override on_unregister(): void {
    super.on_unregister();

    unregisterStoryLinkByObjectId(this.id);
    unregisterSimulationObject(this);

    this.simulationBoardManager.unRegisterSquad(this);
    this.simulationBoardManager.assignSquadToSmartTerrain(this, null);

    // todo: Method for smart terrain onSpawnedSquadKilled.
    if (this.respawnPointId !== null) {
      const smartTerrain: Optional<SmartTerrain> = registry.simulator.object(this.respawnPointId)!;

      if (smartTerrain === null) {
        return;
      } else {
        smartTerrain.alreadySpawned.get(this.respawnPointSection!).num -= 1;
      }
    }

    EventsManager.emitEvent(EGameEvent.SQUAD_UNREGISTERED, this);
  }

  /**
   * todo: Description.
   */
  public initialize(): void {
    const sectionName: TSection = this.section_name();

    this.faction = readIniString(SYSTEM_INI, sectionName, "faction", true) as TCommunity;
    this.actionConditionList = parseConditionsList(
      readIniString(SYSTEM_INI, sectionName, "target_smart", false, null, "")
    );
    this.deathConditionList = parseConditionsList(readIniString(SYSTEM_INI, sectionName, "on_death", false, null, ""));
    this.invulnerability = parseConditionsList(
      readIniString(SYSTEM_INI, sectionName, "invulnerability", false, null, "")
    );
    this.relationship = this.relationship || readIniString(SYSTEM_INI, sectionName, "relationship", false);
    this.sympathy = readIniNumber(SYSTEM_INI, sectionName, "sympathy", false, null);
    this.isSpotVisible = parseConditionsList(readIniString(SYSTEM_INI, sectionName, "show_spot", false, null, FALSE));
    this.isAlwaysArrived = readIniBoolean(SYSTEM_INI, sectionName, "always_arrived", false);

    this.setLocationTypesMaskFromSection("stalker_terrain");
    this.updateSquadSympathy();

    this.behaviour = new LuaTable();

    const behaviourSection: TSection = readIniString(
      SYSTEM_INI,
      this.section_name(),
      "behaviour",
      false,
      null,
      this.faction
    );

    if (!SQUAD_BEHAVIOURS_LTX.section_exist(behaviourSection)) {
      abort("There is no section [" + behaviourSection + "] in 'squad_behaviours.ltx'");
    }

    const behaviourParametersCount: TCount = SQUAD_BEHAVIOURS_LTX.line_count(behaviourSection);

    for (const it of $range(0, behaviourParametersCount - 1)) {
      const [, name, conditionsList] = SQUAD_BEHAVIOURS_LTX.r_line(behaviourSection, it, "", "");

      this.behaviour.set(name, conditionsList);
    }
  }

  /**
   * todo: Description.
   */
  public initializeOnLoad(): void {
    logger.info("Init squad on load:", this.name());

    this.updateSquadSympathy();
    this.simulationBoardManager.assignSquadToSmartTerrain(this, this.assignedSmartTerrainId);

    if (this.assignedSmartTerrainId !== null) {
      this.simulationBoardManager.enterSmartTerrain(this, this.assignedSmartTerrainId);
    }

    this.isLocationMasksResetNeeded = true;
  }

  /**
   * todo: Description.
   *
   * @return target ID assigned for smart by condlists from ltx script configuration
   */
  public getLogicsScriptTarget(): Optional<TNumberId> {
    const newTarget: Optional<TSection> = pickSectionFromCondList(registry.actor, this, this.actionConditionList);

    if (newTarget === null) {
      return null;
    }

    if (newTarget !== this.lastTarget) {
      this.lastTarget = newTarget;
      this.parsedTargets = parseStringsList(newTarget);
      this.nextTargetId = 1;
    }

    if (this.parsedTargets.get(this.nextTargetId as TNumberId) === null) {
      this.nextTargetId = 1;
    }

    let nextTargetName: StringOptional<TName> = this.selectNextTarget();

    if (nextTargetName === NIL) {
      return null;
    } else if (nextTargetName === "loop") {
      this.nextTargetId = 1;
      nextTargetName = this.selectNextTarget();
    }

    return (this.simulationBoardManager.getSmartTerrainByName(nextTargetName) as SmartTerrain).id;
  }

  /**
   * todo: Description.
   */
  public selectNextTarget(): StringOptional<TName> {
    return this.parsedTargets.get(this.nextTargetId as TNumberId);
  }

  /**
   * todo: Description.
   * todo: has side effect
   */
  public isSquadOnPoint(): boolean {
    if (this.parsedTargets === null) {
      return true;
    }

    const nextTargetId: TNumberId = this.nextTargetId || 0;

    if (this.assignedTargetId !== null && this.assignedSmartTerrainId === this.assignedTargetId) {
      if (this.parsedTargets.get(nextTargetId + 1) !== null) {
        this.nextTargetId = nextTargetId + 1;

        return true;
      }
    }

    return false;
  }

  /**
   * Clear assigned to the squad target.
   */
  public clearAssignedTarget(): void {
    simulationLogger.format("Clear squad assigned target: '%s' x '%s'", this.name(), this.assignedTargetId);
    this.assignedTargetId = null;
  }

  /**
   * Check whether squad assigned target available.
   *
   * @returns if currently assigned target written in field is available and can be reached in simulation
   */
  public isAssignedTargetAvailable(): boolean {
    return this.assignedTargetId
      ? registry.simulator.object<TSimulationObject>(this.assignedTargetId)?.isValidSquadTarget(this, true) === true
      : false;
  }

  /**
   * todo: Description.
   */
  public updateNextSquadAction(isUnderSimulation: boolean): void {
    const squadTarget: Optional<TSimulationObject> = registry.simulator.object<TSimulationObject>(
      this.assignedTargetId!
    );

    if (this.currentTargetId === null) {
      if (squadTarget === null || squadTarget.isReachedBySquad(this)) {
        if (squadTarget !== null) {
          squadTarget.onStartedBeingReachedBySquad(this);
          // todo: Probably should be revisited.
          squadTarget.onEndedBeingReachedBySquad(this);
        }

        this.currentAction = new SquadStayOnTargetAction(this);
        this.currentTargetId = this.assignedTargetId;
        this.currentAction.initialize(isUnderSimulation);

        return;
      }
    }

    if (this.assignedTargetId === this.currentTargetId || this.assignedTargetId === null) {
      this.currentAction = new SquadStayOnTargetAction(this);
      this.currentTargetId = this.assignedTargetId;
      this.currentAction.initialize(isUnderSimulation);
    } else {
      this.currentAction = new SquadReachTargetAction(this);
      this.currentAction.initialize(isUnderSimulation);
    }
  }

  /**
   * todo: Description.
   */
  public onSquadObjectDeath(object: ServerObject): void {
    simulationLogger.info("On squad object death:", this.name(), object.name());

    this.soundManager.unregisterObject(object.id);
    this.unregister_member(object.id);

    if (this.npc_count() === 0) {
      logger.info("Removing dead squad:", this.name());

      if (this.currentAction !== null) {
        this.currentAction.finalize();
        this.currentAction = null;
      }

      if (this.deathConditionList !== null) {
        pickSectionFromCondList(registry.actor, this, this.deathConditionList);
      }

      this.simulationBoardManager.releaseSquad(this);

      return;
    }

    this.mapDisplayManager.updateSquadMapSpot(this);
  }

  /**
   * todo: Description.
   */
  public assignSquadMemberToSmartTerrain(
    memberId: TNumberId,
    smartTerrain: Optional<SmartTerrain>,
    oldSmartTerrainId: Optional<TNumberId>
  ): void {
    const object: Optional<ServerCreatureObject> = registry.simulator.object(memberId);

    if (object !== null) {
      if (object.m_smart_terrain_id === this.assignedSmartTerrainId) {
        return;
      }

      if (
        object.m_smart_terrain_id !== MAX_U16 &&
        oldSmartTerrainId !== null &&
        object.m_smart_terrain_id === oldSmartTerrainId &&
        this.simulationBoardManager.getSmartTerrainDescriptor(oldSmartTerrainId) !== null
      ) {
        this.simulationBoardManager.getSmartTerrainDescriptor(oldSmartTerrainId)!.smartTerrain.unregister_npc(object);
      }

      if (smartTerrain !== null) {
        smartTerrain.register_npc(object);
      }
    }
  }

  /**
   * todo: Description.
   */
  public assignToSmartTerrain(smartTerrain: Optional<SmartTerrain>): void {
    const oldSmartId: TNumberId = this.assignedSmartTerrainId!;

    this.assignedSmartTerrainId = smartTerrain && smartTerrain.id;

    for (const squadMember of this.squad_members()) {
      this.assignSquadMemberToSmartTerrain(squadMember.id, smartTerrain, oldSmartId);
    }
  }

  /**
   * todo: Description.
   */
  public setLocationTypesMaskFromSection(section: TSection): void {
    if (SMART_TERRAIN_MASKS_LTX.section_exist(section)) {
      const [, field] = SMART_TERRAIN_MASKS_LTX.r_line(section, 0, "", "");

      this.add_location_type(field);
    }
  }

  /**
   * todo: Description.
   */
  public setLocationTypes(newLocationSection?: TSection): void {
    const defaultLocation: TSection = "stalker_terrain";

    this.clear_location_types();

    if (isSmartTerrain(registry.simulator.object(this.assignedTargetId as TNumberId) as ServerObject)) {
      this.setLocationTypesMaskFromSection(defaultLocation);

      const oldSmartName =
        this.assignedSmartTerrainId !== null && registry.simulator.object(this.assignedSmartTerrainId)?.name();

      if (oldSmartName) {
        this.setLocationTypesMaskFromSection(oldSmartName);
      }

      if (newLocationSection) {
        this.setLocationTypesMaskFromSection(newLocationSection);
      }
    } else {
      this.setLocationTypesMaskFromSection("squad_terrain");

      for (const [id] of registry.simulationObjects) {
        const smartTerrain: ServerObject = registry.simulator.object(id) as ServerObject;

        if (isSmartTerrain(smartTerrain)) {
          const propertiesBase: TName = smartTerrain.simulationProperties.get(ESimulationTerrainRole.BASE);

          if (propertiesBase && tonumber(propertiesBase) === 0) {
            this.setLocationTypesMaskFromSection(smartTerrain.name());
          }
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public addSquadMember(spawnSection: TSection, spawnPosition: Vector, lvi: TNumberId, gvi: TNumberId): TNumberId {
    const customData: TName = readIniString(
      SYSTEM_INI,
      spawnSection,
      "custom_data",
      false,
      null,
      "misc\\default_custom_data.ltx"
    );

    if (customData !== "misc\\default_custom_data.ltx") {
      logger.format(
        "INCORRECT npc_spawn_section used for '%s'. You cannot use object with custom_data in squad",
        spawnSection
      );
    }

    const serverObject: ServerObject = registry.simulator.create(spawnSection, spawnPosition, lvi, gvi);

    this.register_member(serverObject.id);
    this.soundManager.registerObject(serverObject.id);

    if (
      areObjectsOnSameLevel(serverObject, registry.actorServer) &&
      spawnPosition.distance_to_sqr(registry.actorServer.position) <=
        registry.simulator.switch_distance() * registry.simulator.switch_distance()
    ) {
      registry.spawnedVertexes.set(serverObject.id, lvi);
    }

    return serverObject.id;
  }

  /**
   * todo: Description.
   */
  public createSquadMembers(spawnSmartTerrain: SmartTerrain): void {
    simulationLogger.info("Create squad members:", this.name(), spawnSmartTerrain?.name());

    const sectionName: TName = this.section_name();

    const spawnSections: LuaArray<TSection> = parseStringsList(
      readIniString(SYSTEM_INI, sectionName, "npc", false, null, "")
    );
    const spawnPointData =
      readIniString(SYSTEM_INI, sectionName, "spawn_point", false, null, "self") ||
      readIniString(spawnSmartTerrain.ini, SMART_TERRAIN_SECTION, "spawn_point", false, null, "self");

    const spawnPoint: Optional<TName> = pickSectionFromCondList(
      registry.actor,
      this,
      parseConditionsList(spawnPointData)
    )!;

    let baseSpawnPosition: Vector = spawnSmartTerrain.position;
    let baseLevelVertexId: TNumberId = spawnSmartTerrain.m_level_vertex_id;
    let baseGameVertexId: TNumberId = spawnSmartTerrain.m_game_vertex_id;

    if (spawnPoint !== null) {
      if (spawnPoint === "self") {
        baseSpawnPosition = spawnSmartTerrain.position;
        baseLevelVertexId = spawnSmartTerrain.m_level_vertex_id;
        baseGameVertexId = spawnSmartTerrain.m_game_vertex_id;
      } else {
        const destination: Patrol = new patrol(spawnPoint);

        baseSpawnPosition = destination.point(0);
        baseLevelVertexId = destination.level_vertex_id(0);
        baseGameVertexId = destination.game_vertex_id(0);
      }
    } else if (spawnSmartTerrain.spawnPointName !== null) {
      const destination: Patrol = new patrol(spawnSmartTerrain.spawnPointName);

      baseSpawnPosition = destination.point(0);
      baseLevelVertexId = destination.level_vertex_id(0);
      baseGameVertexId = destination.game_vertex_id(0);
    }

    if (spawnSections.length() !== 0) {
      for (const [k, v] of spawnSections) {
        this.addSquadMember(v, baseSpawnPosition, baseLevelVertexId, baseGameVertexId);
      }
    }

    const randomSpawnConfig: Optional<string> = readIniString(SYSTEM_INI, sectionName, "npc_random", false);

    if (randomSpawnConfig !== null) {
      const randomSpawn: LuaArray<string> = parseStringsList(randomSpawnConfig)!;

      const [countMin, countMax] = readIniTwoNumbers(SYSTEM_INI, sectionName, "npc_in_squad", 1, 2);

      if (countMin > countMax) {
        abort("min_count can't be greater then max_count [%s]!", this.section_name());
      }

      const randomCount: TCount = math.random(countMin, countMax);

      for (const it of $range(1, randomCount)) {
        const randomId: TIndex = math.random(1, randomSpawn!.length());

        this.addSquadMember(randomSpawn!.get(randomId), baseSpawnPosition, baseLevelVertexId, baseGameVertexId);
      }
    } else if (spawnSections.length() === 0) {
      abort("You are trying to spawn an empty squad [%s]!", this.section_name());
    }

    this.assignedSmartTerrainId = spawnSmartTerrain.id;
    this.mapDisplayManager.updateSquadMapSpot(this);
  }

  /**
   * Update objects sympathy between objects within squad.
   */
  public updateSquadSympathy(sympathy?: Optional<TCount>): void {
    const squadSympathy: Optional<TCount> = sympathy || this.sympathy;

    if (squadSympathy !== null) {
      for (const squadMembers of this.squad_members()) {
        const object: Optional<GameObject> = registry.objects.get(squadMembers.id)?.object;

        if (object !== null) {
          setObjectSympathy(object, squadSympathy);
        } else {
          registry.goodwill.sympathy.set(squadMembers.id, squadSympathy);
        }
      }
    }
  }

  /**
   * Set squad position in current level by supplied vector.
   */
  public setSquadPosition(position: Vector): void {
    logger.format("Set squad position: '%s', '%s', '%s'", this.name(), this.online, vectorToString(position));

    if (!this.online) {
      this.force_change_position(position);
    }

    for (const squadMember of this.squad_members()) {
      const object: Optional<GameObject> = registry.objects.get(squadMember.id)?.object as Optional<GameObject>;

      registry.offlineObjects.get(squadMember.id).levelVertexId = level.vertex_id(position);

      if (object) {
        logger.format("Set client squad member position: '%s'", object.name());

        resetStalkerState(object);
        object.set_npc_position(position);
      } else {
        logger.format("Set server squad member position: '%s'", squadMember.object.name());

        squadMember.object.position = position;
      }
    }
  }

  /**
   * @returns squad community section
   */
  public getCommunity(): TCommunity {
    return squadCommunityByBehaviour.get(this.faction);
  }

  /**
   * Get map display hint for debugging and display in game UI map.
   *
   * @returns hint to show when hovering over in PDA map
   */
  public getMapDisplayHint(): TLabel {
    if (forgeConfig.DEBUG.IS_SIMULATION_ENABLED) {
      let hint: TLabel = string.format(
        "[%s]\\nonline = %s\\ncurrent_target = [%s]\\nassigned_target = [%s]" +
          "\\nassigned_smartTerrain = [%s]\\nnext_target = [%s]\\ncurrent_action = [%s]\\n",
        this.name(),
        this.online,
        tostring(this.currentTargetId && registry.simulator.object(this.currentTargetId)?.name()),
        tostring(this.assignedTargetId && registry.simulator.object(this.assignedTargetId)?.name()),
        tostring(this.assignedSmartTerrainId && registry.simulator.object(this.assignedSmartTerrainId)?.name()),
        tostring(this.nextTargetId && registry.simulator.object(this.nextTargetId)?.name()),
        tostring(this.currentAction?.type)
      );

      if (this.currentAction?.type === ESquadActionType.STAY_ON_TARGET) {
        hint += string.format(
          "stay_on_target_for = [%.2f]",
          (this.currentAction as SquadStayOnTargetAction).getStayIdleDuration()
        );
      }

      return hint;
    } else {
      return "";
    }
  }

  /**
   * Check if squad can help actor.
   * If any valid target in combat can be targeted, try to help actor.
   *
   * @returns optional help target id to start combat with
   */
  public getHelpActorTargetId(): Optional<TNumberId> {
    if (!canSquadHelpActor(this)) {
      return null;
    }

    const currentCommunity: TCommunity = this.getCommunity();

    for (const [id, v] of registry.actorCombat) {
      const enemySquadId: Optional<TNumberId> = registry.simulator.object<ServerCreatureObject>(id)
        ?.group_id as Optional<TNumberId>;

      if (enemySquadId !== null) {
        const targetSquad: Optional<Squad> = registry.simulator.object<Squad>(enemySquadId);

        if (
          targetSquad &&
          areCommunitiesEnemies(currentCommunity, targetSquad.getCommunity()) &&
          this.position.distance_to_sqr(targetSquad.position) < 150 * 150
        ) {
          return enemySquadId;
        }
      }
    }

    return null;
  }

  /**
   * todo: Description.
   */
  public override get_current_task(): CALifeSmartTerrainTask {
    const smartTerrain: Optional<SmartTerrain> =
      this.assignedTargetId === null ? null : registry.simulator.object<SmartTerrain>(this.assignedTargetId);

    if (smartTerrain) {
      const commanderId: TNumberId = this.commander_id();

      if (
        smartTerrain.arrivingObjects !== null &&
        smartTerrain.arrivingObjects.get(commanderId) === null &&
        smartTerrain.objectJobDescriptors &&
        smartTerrain.objectJobDescriptors.get(commanderId) &&
        smartTerrain.objectJobDescriptors.get(commanderId).jobId &&
        smartTerrain.jobs.get(smartTerrain.objectJobDescriptors.get(commanderId).jobId)
      ) {
        return smartTerrain.objectJobDescriptors.get(this.commander_id()).job!.alifeTask as CALifeSmartTerrainTask;
      }

      return smartTerrain.getAlifeSmartTerrainTask();
    }

    return this.getAlifeSmartTerrainTask();
  }

  /**
   * @returns whether squad targeting another squad can be finished since one is eliminated
   */
  public isReachedBySquad(squad: Squad): boolean {
    return this.npc_count() === 0;
  }

  /**
   * todo: Description.
   */
  public onEndedBeingReachedBySquad(squad: Squad): void {}

  /**
   * todo: Description.
   */
  public onStartedBeingReachedBySquad(squad: Squad): void {
    squad.setLocationTypes();

    for (const it of squad.squad_members()) {
      softResetOfflineObject(it.id);
    }

    this.simulationBoardManager.assignSquadToSmartTerrain(squad, null);
  }

  /**
   * @returns alife smart terrain task to reach/stay on current object
   */
  public getAlifeSmartTerrainTask(): ALifeSmartTerrainTask {
    return new CALifeSmartTerrainTask(this.m_game_vertex_id, this.m_level_vertex_id);
  }

  /**
   * todo: Description.
   */
  public isSimulationAvailable(): boolean {
    if (pickSectionFromCondList(registry.actor, this, this.isSimulationAvailableConditionList) !== TRUE) {
      return false;
    }

    for (const [zoneName, smartTerrainName] of registry.noCombatZones) {
      const zone: GameObject = registry.zones.get(zoneName);

      if (zone && zone.inside(this.position)) {
        const smartTerrain: Optional<SmartTerrain> =
          SimulationBoardManager.getInstance().getSmartTerrainByName(smartTerrainName);

        if (
          smartTerrain &&
          smartTerrain.smartTerrainActorControl !== null &&
          smartTerrain.smartTerrainActorControl.status !== ESmartTerrainStatus.ALARM
        ) {
          return false;
        }
      }
    }

    if (this.assignedSmartTerrainId === null) {
      return true;
    }

    const assignedSmartTerrain: SmartTerrain = registry.simulator.object(this.assignedSmartTerrainId) as SmartTerrain;
    const smartTerrainBaseProperties =
      assignedSmartTerrain!.simulationProperties &&
      assignedSmartTerrain!.simulationProperties.get(ESimulationTerrainRole.BASE);

    // Squad is in base.
    if (smartTerrainBaseProperties !== null && tonumber(smartTerrainBaseProperties)! > 0) {
      return false;
    }

    if (
      assignedSmartTerrain.smartTerrainActorControl !== null &&
      assignedSmartTerrain.smartTerrainActorControl.status !== ESmartTerrainStatus.NORMAL
    ) {
      if (
        registry.zones.get(assignedSmartTerrain.smartTerrainActorControl.noWeaponZone) === null ||
        !registry.zones.get(assignedSmartTerrain.smartTerrainActorControl.noWeaponZone).inside(this.position)
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * @param squad - another squad checking availability of current instance
   * @returns whether the squad is valid simulation target for provided squad parameter.
   */
  public isValidSquadTarget(squad: Squad): boolean {
    const squadActivityDescriptor: ISimulationActivityDescriptor = simulationActivities.get(squad.faction);

    if (squadActivityDescriptor === null || squadActivityDescriptor.squad === null) {
      return false;
    }

    const currentFactionPrecondition: Optional<TSimulationActivityPrecondition> = squadActivityDescriptor.squad[
      this.faction
    ] as Optional<TSimulationActivityPrecondition>;

    return currentFactionPrecondition !== null && currentFactionPrecondition(squad, this);
  }
}
