import { CALifeSmartTerrainTask, cse_alife_online_offline_group, LuabindClass } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  getManager,
  openLoadMarker,
  openSaveMarker,
  registerObjectStoryLinks,
  registerSimulationObject,
  registry,
  softResetOfflineObject,
  SYSTEM_INI,
  unregisterSimulationObject,
  unregisterStoryLinkByObjectId,
  updateSimulationObjectAvailability,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { MapDisplayManager } from "@/engine/core/managers/map/MapDisplayManager";
import {
  ESimulationTerrainRole,
  ISimulationTarget,
  simulationActivities,
  TSimulationObject,
} from "@/engine/core/managers/simulation";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import { getSquadSimulationTarget } from "@/engine/core/managers/simulation/utils";
import { StoryManager } from "@/engine/core/managers/sounds/stories";
import { getStoryManager } from "@/engine/core/managers/sounds/utils";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { SMART_TERRAIN_MASKS_LTX } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";
import { SquadReachTargetAction, SquadStayOnTargetAction } from "@/engine/core/objects/squad/action";
import { ESquadActionType, ISquadAction } from "@/engine/core/objects/squad/squad_types";
import { SQUAD_BEHAVIOURS_LTX } from "@/engine/core/objects/squad/SquadConfig";
import { abort } from "@/engine/core/utils/assertion";
import { isSmartTerrain } from "@/engine/core/utils/class_ids";
import {
  parseConditionsList,
  parseStringsList,
  pickSectionFromCondList,
  readIniBoolean,
  readIniNumber,
  readIniString,
  TConditionList,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areObjectsOnSameLevel } from "@/engine/core/utils/position";
import { ERelation, setObjectSympathy } from "@/engine/core/utils/relation";
import { getSquadHelpActorTargetId, updateSquadInvulnerabilityState } from "@/engine/core/utils/squad";
import { isInNoCombatZone, isInNoWeaponBase } from "@/engine/core/utils/zone";
import { TCommunity } from "@/engine/lib/constants/communities";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import {
  ALifeSmartTerrainTask,
  GameObject,
  LuaArray,
  NetPacket,
  Optional,
  ServerCreatureObject,
  ServerObject,
  StringOptional,
  TCount,
  TIndex,
  TName,
  TNumberId,
  TRate,
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
  public readonly mapDisplayManager: MapDisplayManager = getManager(MapDisplayManager);
  public readonly simulationManager: SimulationManager = getManager(SimulationManager);
  public readonly soundManager: StoryManager = getStoryManager(`squad_${this.section_name()}`);

  public isSimulationAvailableConditionList: TConditionList = parseConditionsList(TRUE);
  public isMapDisplayHidden: boolean = false;
  public isAlwaysArrived: boolean = false;
  public isLocationMasksResetNeeded: boolean = true;
  public isSpotVisible: Optional<TConditionList> = null;

  // Faction for simulation (behaviour community) like monster_day/night etc.
  public faction: TCommunity;
  public behaviour: LuaTable<string, string> = new LuaTable();

  public simulationProperties!: LuaTable<TName, TRate>;

  // Meta-info about spawn point of the squad.
  // Used to track each point spawning limits.
  public respawnPointId: Optional<TNumberId> = null;
  public respawnPointSection: Optional<TSection> = null;

  public currentMapSpotId: Optional<TNumberId> = null;
  public currentMapSpotSection: Optional<TName> = null;

  public currentAction: Optional<ISquadAction> = null;
  public currentTargetId: Optional<TNumberId> = null; // Target squad currently stays on.

  public assignedSmartTerrainId: Optional<TNumberId> = null; // ID of linked smart terrain.
  public assignedTargetId: Optional<TNumberId> = null; // Target squad should reach.

  public nextTargetIndex: Optional<TIndex> = null;
  public lastTarget: Optional<string> = null;
  public parsedTargets: LuaArray<TName> = new LuaTable();

  public invulnerabilityConditionList: Optional<TConditionList> = null;

  public targetConditionList: TConditionList = new LuaTable();
  public deathConditionList: Optional<TConditionList> = null;

  public sympathy: Optional<TCount> = null;
  public relationship: Optional<ERelation> = null;

  public constructor(section: TSection) {
    super(section);

    this.targetConditionList = parseConditionsList(readIniString(SYSTEM_INI, section, "target_smart", false, null, ""));
    this.deathConditionList = parseConditionsList(readIniString(SYSTEM_INI, section, "on_death", false, null, ""));
    this.invulnerabilityConditionList = parseConditionsList(
      readIniString(SYSTEM_INI, section, "invulnerability", false, null, "")
    );

    this.faction = readIniString(SYSTEM_INI, section, "faction", true) as TCommunity;
    this.relationship = this.relationship || readIniString(SYSTEM_INI, section, "relationship", false);
    this.sympathy = readIniNumber(SYSTEM_INI, section, "sympathy", false, null);
    this.isSpotVisible = parseConditionsList(readIniString(SYSTEM_INI, section, "show_spot", false, null, FALSE));
    this.isAlwaysArrived = readIniBoolean(SYSTEM_INI, section, "always_arrived", false);

    this.setLocationTypesMaskFromSection("stalker_terrain");
    this.updateSympathy();

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

    for (const it of $range(0, SQUAD_BEHAVIOURS_LTX.line_count(behaviourSection) - 1)) {
      const [, name, conditionsList] = SQUAD_BEHAVIOURS_LTX.r_line(behaviourSection, it, "", "");

      this.behaviour.set(name, conditionsList);
    }
  }

  public override update(): void {
    super.update();

    this.mapDisplayManager.updateSquadMapSpot(this);
    this.soundManager.update();

    updateSimulationObjectAvailability(this);
    updateSquadInvulnerabilityState(this);

    const scriptTarget: Optional<TNumberId> = this.getScriptedSimulationTarget();

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
    const helpTargetId: Optional<TNumberId> = getSquadHelpActorTargetId(this);

    // Try to help actor if can.
    if (helpTargetId && helpTargetId !== this.assignedTargetId) {
      simulationLogger.format("Assign squad new help target id: %s %s", this.name(), helpTargetId);

      this.currentAction?.finalize();
      this.currentAction = null;
      this.assignedTargetId = helpTargetId;
      this.selectNewAction(false);

      return;
    }

    // Have target and action, update it until it is finished.
    if (this.currentAction && this.isAssignedTargetAvailable()) {
      const isFinished: boolean = this.currentAction.update(true);

      if (isFinished) {
        simulationLogger.format(
          "Finished task, search for new: '%s' '%s' '%s'",
          this.name(),
          this.currentAction.type,
          this.assignedTargetId
        );

        this.currentAction.finalize();

        // Leave reaching target as assigned to stay for some time.
        this.assignedTargetId =
          this.currentAction.type === ESquadActionType.REACH_TARGET
            ? this.assignedTargetId
            : getSquadSimulationTarget(this)!.id;

        this.currentAction = null;
        this.selectNewAction(true);
      }

      // Continue previous action execution.
    } else {
      this.currentAction?.finalize();
      this.currentAction = null;
      this.currentTargetId = null;
      this.assignedTargetId = getSquadSimulationTarget(this)!.id;
      this.selectNewAction(true);
    }
  }

  /**
   * todo;
   */
  public updateCurrentScriptedAction(scriptTarget: TNumberId): void {
    let isNewActionNeeded: boolean = false;

    if (this.assignedTargetId !== null && this.assignedTargetId === scriptTarget) {
      if (this.currentAction) {
        if (this.currentAction.type === ESquadActionType.STAY_ON_TARGET) {
          if (this.isOnAssignedTarget()) {
            isNewActionNeeded = true;
          } else {
            isNewActionNeeded = this.currentAction!.update(false);
          }
        } else {
          if (this.currentAction.update(false)) {
            this.isOnAssignedTarget();
            isNewActionNeeded = true;
          }
        }
      } else {
        this.isOnAssignedTarget();
        isNewActionNeeded = true;
      }
    } else {
      isNewActionNeeded = true;
    }

    if (isNewActionNeeded) {
      this.assignedTargetId = scriptTarget;

      if (this.currentAction) {
        this.currentAction.finalize();
        this.currentAction = null;
      }

      this.selectNewAction(false);
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

    const respawnPointId: StringOptional = packet.r_stringZ();

    this.respawnPointId = respawnPointId === NIL ? null : (tonumber(respawnPointId) as TNumberId);
    this.respawnPointSection = packet.r_stringZ();

    if (this.respawnPointSection === NIL) {
      this.respawnPointSection = null;
    }

    const smartTerrainId: StringOptional = packet.r_stringZ();

    this.assignedSmartTerrainId = smartTerrainId === NIL ? null : (tonumber(smartTerrainId) as TNumberId);

    this.onSquadLoad();

    closeLoadMarker(packet, Squad.__name);
  }

  public override on_register(): void {
    super.on_register();

    this.simulationManager.registerSquad(this);

    registerObjectStoryLinks(this);
    registerSimulationObject(this);

    EventsManager.emitEvent(EGameEvent.SQUAD_REGISTERED, this);
  }

  public override on_unregister(): void {
    super.on_unregister();

    unregisterStoryLinkByObjectId(this.id);
    unregisterSimulationObject(this);

    this.simulationManager.unRegisterSquad(this);
    this.simulationManager.assignSquadToSmartTerrain(this, null);

    // todo: Method for smart terrain onSpawnedSquadKilled.
    if (this.respawnPointId !== null) {
      const smartTerrain: Optional<SmartTerrain> = registry.simulator.object(
        this.respawnPointId
      ) as Optional<SmartTerrain>;

      if (smartTerrain) {
        smartTerrain.spawnedSquadsList.get(this.respawnPointSection!).num -= 1;
      }
    }

    EventsManager.emitEvent(EGameEvent.SQUAD_UNREGISTERED, this);
  }

  /**
   * todo: Description.
   */
  public override get_current_task(): CALifeSmartTerrainTask {
    const target: Optional<TSimulationObject> =
      this.assignedTargetId === null ? null : registry.simulator.object(this.assignedTargetId);

    if (target && isSmartTerrain(target)) {
      const commanderId: TNumberId = this.commander_id();

      if (
        target.arrivingObjects.get(commanderId) === null &&
        target.objectJobDescriptors &&
        target.objectJobDescriptors.get(commanderId) &&
        target.objectJobDescriptors.get(commanderId).jobId &&
        target.jobs.get(target.objectJobDescriptors.get(commanderId).jobId)
      ) {
        return target.objectJobDescriptors.get(this.commander_id()).job!.alifeTask as CALifeSmartTerrainTask;
      }

      return target.getSimulationTask();
    }

    return this.getSimulationTask();
  }

  /**
   * Handling logics of strictly defined simulation targets for some squads.
   * Usually logics is handled by generic evaluator and is based on priority, but sum squads need different behaviour.
   * As example, squad on start of original COP always will go to actor spawn point.
   * Some squads can rotate over few smart terrains and completely ignore priorities.
   *
   * @return target ID assigned for smart by condlists from ltx script configuration
   */
  public getScriptedSimulationTarget(): Optional<TNumberId> {
    const newTarget: Optional<TSection> = pickSectionFromCondList(registry.actor, this, this.targetConditionList);

    if (newTarget === null) {
      return null;
    }

    if (newTarget !== this.lastTarget) {
      this.lastTarget = newTarget;
      this.parsedTargets = parseStringsList(newTarget);
      this.nextTargetIndex = 1;
    }

    if (this.parsedTargets.get(this.nextTargetIndex as TNumberId) === null) {
      this.nextTargetIndex = 1;
    }

    let nextTargetName: StringOptional<TName> = this.parsedTargets.get(this.nextTargetIndex as TNumberId);

    if (nextTargetName === NIL) {
      return null;
    } else if (nextTargetName === "loop") {
      // Support logics of looping over squad targets over and over.
      // In case if a->b->c path proceeded, go back to a and retry again.
      this.nextTargetIndex = 1;
      nextTargetName = this.parsedTargets.get(this.nextTargetIndex as TNumberId);
    }

    return (this.simulationManager.getSmartTerrainByName(nextTargetName) as SmartTerrain).id;
  }

  /**
   * todo: Description.
   * todo: has side effect
   *
   * Check if currently assigned target is assigned as smart terrain.
   * If yes, switch to next smart terrain target in the list.
   */
  public isOnAssignedTarget(): boolean {
    if (this.parsedTargets === null) {
      return true;
    }

    const nextTargetId: TNumberId = (this.nextTargetIndex ?? 0) + 1;

    if (this.assignedTargetId !== null && this.assignedTargetId === this.assignedSmartTerrainId) {
      if (this.parsedTargets.has(nextTargetId)) {
        this.nextTargetIndex = nextTargetId;

        return true;
      }
    }

    return false;
  }

  /**
   * Check whether squad assigned target available.
   *
   * @returns if currently assigned target written in field is available and can be reached in simulation
   */
  public isAssignedTargetAvailable(): boolean {
    return this.assignedTargetId
      ? registry.simulator.object<TSimulationObject>(this.assignedTargetId)?.isValidSimulationTarget(this, true) ===
          true
      : false;
  }

  /**
   * Clear assigned to the squad target.
   */
  public clearAssignedTarget(): void {
    simulationLogger.format("Clear squad assigned target: '%s' x '%s'", this.name(), this.assignedTargetId);
    this.assignedTargetId = null;
  }

  /**
   * todo: Description.
   */
  public selectNewAction(isUnderSimulation: boolean): void {
    const squadTarget: Optional<TSimulationObject> = registry.simulator.object<TSimulationObject>(
      this.assignedTargetId!
    );

    if (this.currentTargetId === null) {
      if (!squadTarget || squadTarget.isReachedBySimulationObject(this)) {
        if (squadTarget) {
          // todo: Probably should be revisited.
          squadTarget.onSimulationTargetSelected(this);
          squadTarget.onSimulationTargetDeselected(this);
        }

        this.currentTargetId = this.assignedTargetId;
        this.currentAction = new SquadStayOnTargetAction(this);
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
  public assignMemberToSmartTerrain(
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
        oldSmartTerrainId !== null &&
        oldSmartTerrainId !== MAX_U16 &&
        object.m_smart_terrain_id === oldSmartTerrainId &&
        this.simulationManager.getSmartTerrainDescriptor(oldSmartTerrainId)
      ) {
        this.simulationManager.getSmartTerrainDescriptor(oldSmartTerrainId)!.smartTerrain.unregister_npc(object);
      }

      if (smartTerrain) {
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
      this.assignMemberToSmartTerrain(squadMember.id, smartTerrain, oldSmartId);
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
    this.clear_location_types();

    this.setLocationTypesMaskFromSection("stalker_terrain");
    this.setLocationTypesMaskFromSection("squad_terrain");

    if (isSmartTerrain(registry.simulator.object(this.assignedTargetId as TNumberId) as ServerObject)) {
      const oldSmartName: Optional<TName> = this.assignedSmartTerrainId
        ? (registry.simulator.object(this.assignedSmartTerrainId)?.name() as TName)
        : null;

      if (oldSmartName) {
        this.setLocationTypesMaskFromSection(oldSmartName);
      }

      if (newLocationSection) {
        this.setLocationTypesMaskFromSection(newLocationSection);
      }
    } else {
      for (const [smartTerrainName, smartTerrain] of this.simulationManager.getSmartTerrains()) {
        const baseRate: Optional<TRate> = smartTerrain.simulationProperties.get(ESimulationTerrainRole.BASE);

        if (baseRate && baseRate !== 0) {
          this.setLocationTypesMaskFromSection(smartTerrainName);
        }
      }
    }
  }

  /**
   * todo: Description.
   *
   * @returns create squad member object
   */
  public addMember(
    section: TSection,
    position: Vector,
    levelVertexId: TNumberId,
    gameVertexId: TNumberId
  ): ServerCreatureObject {
    const customData: TName = readIniString(
      SYSTEM_INI,
      section,
      "custom_data",
      false,
      null,
      "misc\\default_custom_data.ltx"
    );

    if (customData !== "misc\\default_custom_data.ltx") {
      logger.format(
        "INCORRECT npc_spawn_section used for '%s'. You cannot use object with custom_data in squad",
        section
      );
    }

    const object: ServerCreatureObject = registry.simulator.create(section, position, levelVertexId, gameVertexId);

    this.register_member(object.id);
    this.soundManager.registerObject(object.id);

    if (
      areObjectsOnSameLevel(object, registry.actorServer) &&
      position.distance_to_sqr(registry.actorServer.position) <= Math.pow(registry.simulator.switch_distance(), 2)
    ) {
      registry.spawnedVertexes.set(object.id, levelVertexId);
    }

    return object;
  }

  /**
   * Update objects sympathy between objects within squad.
   */
  public updateSympathy(sympathy?: Optional<TCount>): void {
    const squadSympathy: Optional<TCount> = sympathy || this.sympathy;

    if (squadSympathy === null) {
      return;
    }

    for (const squadMembers of this.squad_members()) {
      const object: Optional<GameObject> = registry.objects.get(squadMembers.id)?.object as Optional<GameObject>;

      if (object) {
        setObjectSympathy(object, squadSympathy);
      } else {
        registry.goodwill.sympathy.set(squadMembers.id, squadSympathy);
      }
    }
  }

  /**
   * todo: Description.
   */
  public onSquadLoad(): void {
    logger.format("Initialize squad on load: %s", this.name());

    this.updateSympathy();
    this.simulationManager.assignSquadToSmartTerrain(this, this.assignedSmartTerrainId);
    this.isLocationMasksResetNeeded = true;
  }

  /**
   * todo: Description.
   */
  public onMemberDeath(object: ServerObject): void {
    simulationLogger.format("On squad member death: %s %s", this.name(), object.name());

    this.soundManager.unregisterObject(object.id);
    this.unregister_member(object.id);

    if (this.npc_count() === 0) {
      logger.format("Removing empty squad, last member died: %s", this.name());

      if (this.currentAction) {
        this.currentAction.finalize();
        this.currentAction = null;
      }

      if (this.deathConditionList) {
        pickSectionFromCondList(registry.actor, this, this.deathConditionList);
      }

      this.simulationManager.releaseSquad(this);
    } else {
      this.mapDisplayManager.updateSquadMapSpot(this);
    }
  }

  /**
   * @returns whether squad targeting another squad can be finished since one is eliminated
   */
  public isReachedBySimulationObject(squad: Squad): boolean {
    return this.npc_count() === 0;
  }

  /**
   * @returns alife smart terrain task to reach/stay on current object
   */
  public getSimulationTask(): ALifeSmartTerrainTask {
    return new CALifeSmartTerrainTask(this.m_game_vertex_id, this.m_level_vertex_id);
  }

  /**
   * @returns if current squad can be simulation target for other squads
   */
  public isSimulationAvailable(): boolean {
    return (
      // Object specific checker.
      pickSectionFromCondList(registry.actor, this, this.isSimulationAvailableConditionList) === TRUE &&
      // Is walking nearby no-combat zone or is inside [not necessary assigned to it].
      !isInNoCombatZone(this) &&
      // Is assigned to base.
      !isInNoWeaponBase(this)
    );
  }

  /**
   * @param squad - another squad checking availability of current one
   * @returns whether current squad is valid simulation target for provided squad
   */
  public isValidSimulationTarget(squad: Squad): boolean {
    return simulationActivities.get(squad.faction)?.squad?.[this.faction]?.(squad, this) === true;
  }

  /**
   * @param squad - squad that deselected current one from priority targets
   */
  public onSimulationTargetDeselected(squad: Squad): void {
    // Nothing to do currently.
  }

  /**
   * @param squad - squad that selected current one as active target
   */
  public onSimulationTargetSelected(squad: Squad): void {
    squad.setLocationTypes();

    for (const squadMember of squad.squad_members()) {
      softResetOfflineObject(squadMember.id);
    }

    this.simulationManager.assignSquadToSmartTerrain(squad, null);
  }
}
