import {
  alife,
  CALifeSmartTerrainTask,
  clsid,
  cse_alife_online_offline_group,
  game,
  game_graph,
  level,
  LuabindClass,
  patrol,
  XR_CALifeSmartTerrainTask,
  XR_cse_alife_creature_abstract,
  XR_cse_alife_object,
  XR_game_object,
  XR_net_packet,
  XR_vector,
} from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  openSaveMarker,
  registerObjectStoryLinks,
  registry,
  SMART_TERRAIN_MASKS_LTX,
  softResetOfflineObject,
  SQUAD_BEHAVIOURS_LTX,
  SYSTEM_INI,
} from "@/engine/core/database";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import {
  registerSimulationObject,
  unregisterSimulationObject,
  updateSimulationObjectAvailability,
} from "@/engine/core/database/simulation";
import { unregisterStoryLinkByObjectId } from "@/engine/core/database/story_objects";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import type { SmartTerrain } from "@/engine/core/objects/server/smart/SmartTerrain";
import { ESmartTerrainStatus } from "@/engine/core/objects/server/smart/SmartTerrainControl";
import {
  ISimActivityPrecondition,
  ISimulationActivityDescriptor,
  simulationActivities,
} from "@/engine/core/objects/server/squad/simulation_activities";
import { SquadReachTargetAction } from "@/engine/core/objects/server/squad/SquadReachTargetAction";
import { SquadStayOnTargetAction } from "@/engine/core/objects/server/squad/SquadStayOnTargetAction";
import { ISimulationTarget, TSimulationObject, TSquadAction } from "@/engine/core/objects/server/types";
import { SoundManager } from "@/engine/core/objects/sounds/SoundManager";
import { resetObjectAnimation } from "@/engine/core/utils/animation";
import { abort } from "@/engine/core/utils/assertion";
import { isSquadMonsterCommunity } from "@/engine/core/utils/check/is";
import { hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { getTwoNumbers, readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areObjectsOnSameLevel } from "@/engine/core/utils/object";
import { parseConditionsList, parseStringsList, TConditionList } from "@/engine/core/utils/parse";
import {
  getSquadIdRelationToActor,
  isFactionsEnemies,
  setObjectsRelation,
  setObjectSympathy,
  setServerObjectsRelation,
} from "@/engine/core/utils/relation";
import { isEmpty } from "@/engine/core/utils/table";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { squadCommunityByBehaviour } from "@/engine/lib/constants/behaviours";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { relations, TRelation } from "@/engine/lib/constants/relations";
import { SMART_TERRAIN_SECTION } from "@/engine/lib/constants/sections";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import {
  AnyCallablesModule,
  AnyObject,
  LuaArray,
  Optional,
  StringOptional,
  TCount,
  TLabel,
  TName,
  TNumberId,
} from "@/engine/lib/types";
import { TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

const smartsByNoAssaultZones: LuaTable<string, string> = {
  ["zat_a2_sr_no_assault"]: "zat_stalker_base_smart",
  ["jup_a6_sr_no_assault"]: "jup_a6",
  ["jup_b41_sr_no_assault"]: "jup_b41",
} as any;

/**
 * todo;
 */
@LuabindClass()
export class Squad extends cse_alife_online_offline_group implements ISimulationTarget {
  public isItemListSpawned: Optional<boolean> = null;
  public isSquadOnline: boolean = false;
  public isSimulationAvailableConditionList: TConditionList = parseConditionsList(TRUE);
  public isMapDisplayHidden: boolean = false;
  public isAlwaysArrived: boolean = false;

  public faction!: TCommunity;
  public behaviour: LuaTable<string, string> = new LuaTable();

  public assignedSmartTerrainId: Optional<TNumberId> = null;
  public enteredSmartTerrainId: Optional<TNumberId> = null;

  public simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
  public simulationProperties!: AnyObject;

  public respawn_point_id: Optional<number> = null;
  public respawn_point_prop_section: Optional<string> = null;

  public current_spot_id: Optional<number> = null;
  public spot_section: Optional<string> = null;

  public currentAction: Optional<TSquadAction> = null;
  public currentTargetId: Optional<TNumberId> = null;
  public assignedTargetId: Optional<TNumberId> = null;

  public soundManager: SoundManager = SoundManager.getSoundManagerForId("squad_" + this.section_name());

  public need_free_update: boolean = false;
  public nextTargetId: Optional<TNumberId> = null;
  public parsed_targets: LuaTable<number, string> = new LuaTable();

  public invulnerability: Optional<TConditionList> = null;
  public lastTarget: Optional<string> = null;

  public actionConditionList: TConditionList = new LuaTable();
  public deathConditionList: TConditionList = new LuaTable();

  public sympathy: Optional<TCount> = null;
  public isSpotVisible: Optional<TConditionList> = null;
  public relationship: Optional<TRelation> = null;

  public need_to_reset_location_masks: boolean = true;

  public constructor(section: TSection) {
    super(section);

    this.initialize();
    this.set_squad_behaviour();
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    super.update();
    this.refresh();

    updateSimulationObjectAvailability(this);

    this.updateInvulnerability();

    const scriptTarget: Optional<TNumberId> = this.getScriptTarget();

    if (scriptTarget === null) {
      this.genericUpdate();

      if (this.need_to_reset_location_masks) {
        this.setLocationTypes();
        this.need_to_reset_location_masks = false;
      }

      return;
    }

    this.soundManager.update();

    let shouldFindNewAction: boolean = false;

    if (this.assignedTargetId !== null && this.assignedTargetId === scriptTarget) {
      if (this.currentAction !== null) {
        if (this.currentAction.name === "stay_point") {
          if (this.isSquadOnPoint()) {
            shouldFindNewAction = true;
          } else {
            shouldFindNewAction = this.updateCurrentAction();
          }
        } else {
          if (this.updateCurrentAction()) {
            this.isSquadOnPoint();
            shouldFindNewAction = true;
          }
        }
      } else {
        this.isSquadOnPoint();
        shouldFindNewAction = true;
      }
    } else {
      shouldFindNewAction = true;
    }

    if (shouldFindNewAction) {
      this.assignedTargetId = scriptTarget;

      if (this.currentAction !== null) {
        this.currentAction.finalize();
        this.currentAction = null;
      }

      this.getNextAction(false);
    }

    if (this.need_to_reset_location_masks) {
      this.setLocationTypes();
      this.need_to_reset_location_masks = false;
    }
  }

  /**
   * todo: Description.
   */
  public override STATE_Write(packet: XR_net_packet): void {
    super.STATE_Write(packet);

    openSaveMarker(packet, Squad.__name);

    packet.w_stringZ(tostring(this.currentTargetId));
    packet.w_stringZ(tostring(this.respawn_point_id));
    packet.w_stringZ(tostring(this.respawn_point_prop_section));
    packet.w_stringZ(tostring(this.assignedSmartTerrainId));

    closeSaveMarker(packet, Squad.__name);
  }

  /**
   * todo: Description.
   */
  public override STATE_Read(packet: XR_net_packet, size: TCount): void {
    super.STATE_Read(packet, size);

    openLoadMarker(packet, Squad.__name);

    const currentTargetId: StringOptional = packet.r_stringZ();

    this.currentTargetId = currentTargetId === NIL ? null : (tonumber(currentTargetId) as TNumberId);

    const respawnPointId = packet.r_stringZ();

    this.respawn_point_id = respawnPointId === NIL ? null : (tonumber(respawnPointId) as TNumberId);
    this.respawn_point_prop_section = packet.r_stringZ();

    if (this.respawn_point_prop_section === NIL) {
      this.respawn_point_prop_section = null;
    }

    const smartTerrainId: StringOptional = packet.r_stringZ();

    this.assignedSmartTerrainId = smartTerrainId === NIL ? null : (tonumber(smartTerrainId) as TNumberId);

    this.initializeOnLoad();

    closeLoadMarker(packet, Squad.__name);
  }

  /**
   * todo: Description.
   */
  public override on_register(): void {
    super.on_register();

    this.simulationBoardManager.registerSquad(this);

    registerObjectStoryLinks(this);
    registerSimulationObject(this);
  }

  /**
   * todo: Description.
   */
  public override on_unregister(): void {
    super.on_unregister();

    unregisterStoryLinkByObjectId(this.id);
    unregisterSimulationObject(this);

    this.simulationBoardManager.getSquads().delete(this.id);
    this.simulationBoardManager.assignSquadToSmartTerrain(this, null);

    if (this.respawn_point_id !== null) {
      const smartTerrain: Optional<SmartTerrain> = alife().object(this.respawn_point_id)!;

      if (smartTerrain === null) {
        return;
      } else {
        smartTerrain.alreadySpawned.get(this.respawn_point_prop_section!).num -= 1;
      }
    }
  }

  /**
   * todo: Description.
   */
  public initialize(): void {
    const sectionName: TSection = this.section_name();

    this.faction = readIniString(SYSTEM_INI, sectionName, "faction", true, "") as TCommunity;
    this.actionConditionList = parseConditionsList(
      readIniString(SYSTEM_INI, sectionName, "target_smart", false, "", "")
    );
    this.deathConditionList = parseConditionsList(readIniString(SYSTEM_INI, sectionName, "on_death", false, "", ""));
    this.invulnerability = parseConditionsList(
      readIniString(SYSTEM_INI, sectionName, "invulnerability", false, "", "")
    );
    this.relationship =
      this.relationship || (readIniString(SYSTEM_INI, sectionName, "relationship", false, "", null) as TRelation);
    this.sympathy = readIniNumber(SYSTEM_INI, sectionName, "sympathy", false, null);
    this.isSpotVisible = parseConditionsList(readIniString(SYSTEM_INI, sectionName, "show_spot", false, "", FALSE));
    this.isAlwaysArrived = readIniBoolean(SYSTEM_INI, sectionName, "always_arrived", false);

    this.setLocationTypesSection("stalker_terrain");
    this.updateSquadSympathy();
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

    this.need_to_reset_location_masks = true;
  }

  /**
   * todo: Description.
   */
  public set_squad_behaviour(): void {
    this.behaviour = new LuaTable();

    const behaviour_section = readIniString(SYSTEM_INI, this.section_name(), "behaviour", false, "", this.faction);

    if (!SQUAD_BEHAVIOURS_LTX.section_exist(behaviour_section)) {
      abort("There is no section [" + behaviour_section + "] in 'squad_behaviours.ltx'");
    }

    const behaviourParametersCount: TCount = SQUAD_BEHAVIOURS_LTX.line_count(behaviour_section);

    for (const it of $range(0, behaviourParametersCount - 1)) {
      const [result, name, conditionsList] = SQUAD_BEHAVIOURS_LTX.r_line(behaviour_section, it, "", "");

      this.behaviour.set(name, conditionsList);
    }
  }

  /**
   * todo: Description.
   */
  public getScriptTarget(): Optional<TNumberId> {
    const newTarget: Optional<TSection> = pickSectionFromCondList(registry.actor, this, this.actionConditionList);

    if (newTarget === null) {
      return null;
    }

    if (newTarget !== this.lastTarget) {
      this.lastTarget = newTarget;
      this.parsed_targets = parseStringsList(newTarget);

      if (this.need_free_update !== true) {
        this.nextTargetId = 1;
      } else {
        this.need_free_update = false;
      }
    }

    if (this.parsed_targets.get(this.nextTargetId as number) === null) {
      this.nextTargetId = 1;
    }

    let nextTargetName: StringOptional<TName> = this.selectNextTarget();

    if (nextTargetName === NIL) {
      return null;
    } else if (nextTargetName === "loop") {
      this.nextTargetId = 1;
      nextTargetName = this.selectNextTarget();
    }

    const point = this.simulationBoardManager.getSmartTerrainByName(nextTargetName);

    if (point === null) {
      abort("Incorrect next point [%s] for squad [%s]", tostring(nextTargetName), tostring(this.id));
    }

    return point.id;
  }

  /**
   * todo: Description.
   */
  public selectNextTarget(): StringOptional<TName> {
    return this.parsed_targets.get(this.nextTargetId as TNumberId);
  }

  /**
   * todo: Description.
   */
  public isSquadOnPoint(): boolean {
    if (this.parsed_targets === null) {
      return true;
    }

    const nextTargetId: TNumberId = this.nextTargetId || 0;

    if (this.assignedTargetId !== null && this.assignedSmartTerrainId === this.assignedTargetId) {
      if (this.parsed_targets.get(nextTargetId + 1) !== null) {
        this.nextTargetId = nextTargetId + 1;

        return true;
      }
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public updateCurrentAction(): boolean {
    return this.currentAction!.update(false);
  }

  /**
   * todo: Description.
   */
  public clearAssignedTarget(): void {
    logger.info("Clear squad assigned target:", this.name());

    this.assignedTargetId = null;
  }

  /**
   * todo: Description.
   */
  public isAssignedTargetAvailable(): boolean {
    const targetObject: Optional<TSimulationObject> =
      this.assignedTargetId === null ? null : alife().object<TSimulationObject>(this.assignedTargetId);

    return targetObject === null ? false : targetObject.isValidSquadTarget(this, true);
  }

  /**
   * todo: Description.
   */
  public genericUpdate(): void {
    this.soundManager.update();
    this.refresh();

    const helpTargetId: Optional<TNumberId> = this.getHelpTargetId();

    if (helpTargetId) {
      logger.info("Assign squad new help target_id:", this.name(), helpTargetId);
      this.assignedTargetId = helpTargetId;
      this.currentAction = null;
      this.getNextAction(false);

      return;
    }

    if (
      this.assignedTargetId &&
      alife().object(this.assignedTargetId)! &&
      alife().object(this.assignedTargetId)!.clsid() !== clsid.online_offline_group_s
    ) {
      const target: TSimulationObject = this.simulationBoardManager.getSquadSimulationTarget(this)!;

      if (target.clsid() === clsid.online_offline_group_s) {
        this.assignedTargetId = target.id;
        this.currentAction = null;
        this.getNextAction(true);

        return;
      }
    }

    if (this.currentAction !== null && this.isAssignedTargetAvailable()) {
      const isFinished: boolean = this.currentAction.update(true);

      if (isFinished) {
        this.currentAction.finalize();

        if (this.currentAction.name === "stay_point" || this.assignedTargetId === null) {
          this.assignedTargetId = this.simulationBoardManager.getSquadSimulationTarget(this)!.id;
        }

        this.currentAction = null;
      } else {
        return;
      }
    } else {
      this.currentAction = null;
      this.currentTargetId = null;
      this.assignedTargetId = this.simulationBoardManager.getSquadSimulationTarget(this)!.id;
    }

    this.getNextAction(true);
  }

  /**
   * todo: Description.
   */
  public getNextAction(isUnderSimulation: boolean): void {
    const squadTarget: Optional<TSimulationObject> = alife().object<TSimulationObject>(this.assignedTargetId!);

    if (this.currentTargetId === null) {
      if (squadTarget === null || squadTarget.isReachedBySquad(this)) {
        if (squadTarget !== null) {
          squadTarget.onReachedBySquad(this);
          squadTarget.onAfterReachedBySquad(this);
        }

        this.currentAction = new SquadStayOnTargetAction(this);
        this.currentTargetId = this.assignedTargetId;
        this.currentAction.make(isUnderSimulation);

        return;
      }
    }

    if (this.assignedTargetId === this.currentTargetId || this.assignedTargetId === null) {
      this.currentAction = new SquadStayOnTargetAction(this);
      this.currentTargetId = this.assignedTargetId;
      this.currentAction.make(isUnderSimulation);
    } else {
      this.currentAction = new SquadReachTargetAction(this);
      this.currentAction.make(isUnderSimulation);
    }
  }

  /**
   * todo: Description.
   */
  public onRemoveSquadFromSimulation(): void {
    logger.info("Remove squad:", this.name());

    const squadMembers: LuaTable<TNumberId, boolean> = new LuaTable();

    for (const squadMember of this.squad_members()) {
      squadMembers.set(squadMember.id, true);
    }

    // Second loop is to prevent iteration breaking when iterating + mutating?
    for (const [id, v] of squadMembers) {
      const object: Optional<XR_cse_alife_object> = alife().object(id);

      if (object !== null) {
        this.unregister_member(id);
        alife().release(object, true);
      }
    }

    this.hide();
  }

  /**
   * todo: Description.
   */
  public onSquadObjectDeath(object: XR_cse_alife_creature_abstract): void {
    logger.info("On object death:", this.name(), object.name());

    this.soundManager.unregisterObject(object.id);
    this.unregister_member(object.id);

    if (this.npc_count() === 0) {
      logger.info("Removing dead squad:", this.name());

      if (this.currentAction !== null) {
        this.currentAction.finalize();
        this.currentAction = null;
      }

      if (this.deathConditionList !== null) {
        pickSectionFromCondList(registry.actor, this, this.deathConditionList as any);
      }

      this.simulationBoardManager.onRemoveSquad(this);

      return;
    }

    this.refresh();
  }

  /**
   * todo: Description.
   */
  public assignSquadMemberToSmartTerrain(
    memberId: TNumberId,
    smartTerrain: Optional<SmartTerrain>,
    oldSmartTerrainId: Optional<TNumberId>
  ): void {
    const object: Optional<XR_cse_alife_creature_abstract> = alife().object<XR_cse_alife_creature_abstract>(memberId);

    if (object !== null) {
      logger.info("Assign squad member to squad:", this.name(), smartTerrain?.name(), object.name());

      if (object.m_smart_terrain_id === this.assignedSmartTerrainId) {
        return;
      }

      if (
        object.m_smart_terrain_id !== MAX_U16 &&
        oldSmartTerrainId !== null &&
        object.m_smart_terrain_id === oldSmartTerrainId &&
        this.simulationBoardManager.getSmartTerrainDescriptorById(oldSmartTerrainId) !== null
      ) {
        this.simulationBoardManager
          .getSmartTerrainDescriptorById(oldSmartTerrainId)!
          .smartTerrain.unregister_npc(object);
      }

      if (smartTerrain !== null) {
        smartTerrain.register_npc(object);
      }
    }
  }

  /**
   * todo: Description.
   */
  public assignSmartTerrain(smartTerrain: Optional<SmartTerrain>) {
    if (smartTerrain) {
      logger.info("Assign squad to smart terrain:", this.name(), smartTerrain.name());
    } else {
      logger.info("Unassign squad from smart:", this.name());
    }

    const oldSmartId: TNumberId = this.assignedSmartTerrainId!;

    this.assignedSmartTerrainId = smartTerrain && smartTerrain.id;

    for (const squadMember of this.squad_members()) {
      this.assignSquadMemberToSmartTerrain(squadMember.id, smartTerrain, oldSmartId);
    }
  }

  /**
   * todo: Description.
   */
  public updateInvulnerability(): void {
    if (!this.isSquadOnline) {
      return;
    }

    const invulnerability: boolean =
      pickSectionFromCondList(registry.actor, this, this.invulnerability as any) === TRUE;

    for (const squadMember of this.squad_members()) {
      const objectState = registry.objects.get(squadMember.id);

      if (objectState !== null) {
        const object = objectState.object;

        if (
          object.invulnerable() !== invulnerability &&
          readIniString(objectState.ini, objectState.active_section!, "invulnerable", false, "", null) === null
        ) {
          object.invulnerable(invulnerability);
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public setLocationTypesSection(section: TSection): void {
    if (SMART_TERRAIN_MASKS_LTX.section_exist(section)) {
      const [result, id, value] = SMART_TERRAIN_MASKS_LTX.r_line(section, 0, "", "");

      this.add_location_type(id);
    }
  }

  /**
   * todo: Description.
   */
  public setLocationTypes(newLocationSection?: TSection): void {
    logger.info("Set location types:", this.name(), newLocationSection);

    const default_location: TSection = "stalker_terrain";

    this.clear_location_types();

    if (alife().object(this.assignedTargetId!)!.clsid() === clsid.smart_terrain) {
      this.setLocationTypesSection(default_location);

      const oldSmartName = this.assignedSmartTerrainId !== null && alife().object(this.assignedSmartTerrainId)?.name();

      if (oldSmartName) {
        this.setLocationTypesSection(oldSmartName);
      }

      if (newLocationSection) {
        this.setLocationTypesSection(newLocationSection);
      }
    } else {
      this.setLocationTypesSection("squad_terrain");

      for (const [k, v] of registry.simulationObjects) {
        if (alife().object(k)?.clsid() === clsid.smart_terrain) {
          const propertiesBase =
            alife().object<SmartTerrain>(k)!.simulationProperties &&
            alife().object<SmartTerrain>(k)!.simulationProperties["base"];

          if (propertiesBase && tonumber(propertiesBase) === 0) {
            this.setLocationTypesSection(alife().object(k)!.name());
          }
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public addSquadMember(spawnSection: TSection, spawnPosition: XR_vector, lvi: TNumberId, gvi: TNumberId): TNumberId {
    logger.info("Add squad member:", this.name());

    const customData = readIniString(SYSTEM_INI, spawnSection, "custom_data", false, "", "default_custom_data.ltx");

    if (customData !== "default_custom_data.ltx") {
      logger.warn("INCORRECT npc_spawn_section USED [%s]. You cannot use npc with custom_data in squads", spawnSection);
    }

    const serverObject = alife().create(spawnSection, spawnPosition, lvi, gvi);

    this.register_member(serverObject.id);
    this.soundManager.registerObject(serverObject.id);

    if (
      areObjectsOnSameLevel(serverObject, alife().actor()) &&
      spawnPosition.distance_to_sqr(alife().actor().position) <= alife().switch_distance() * alife().switch_distance()
    ) {
      // todo: Delete also, same as with stalkers and monsters??? Memory leak probable
      registry.spawnedVertexes.set(serverObject.id, lvi);
    }

    return serverObject.id;
  }

  /**
   * todo: Description.
   */
  public createSquadMembers(spawnSmartTerrain: SmartTerrain): void {
    logger.info("Create squad members:", this.name(), spawnSmartTerrain?.name());

    const sectionName: TName = this.section_name();

    const spawnSections: LuaArray<TSection> = parseStringsList(
      readIniString(SYSTEM_INI, sectionName, "npc", false, "", "")
    );
    const spawnPointData =
      readIniString(SYSTEM_INI, sectionName, "spawn_point", false, "", "self") ||
      readIniString(spawnSmartTerrain.ini, SMART_TERRAIN_SECTION, "spawn_point", false, "", "self");

    const spawnPoint: Optional<TName> = pickSectionFromCondList(
      registry.actor,
      this,
      parseConditionsList(spawnPointData)
    )!;

    let baseSpawnPosition: XR_vector = spawnSmartTerrain.position;
    let baseLevelVertexId: TNumberId = spawnSmartTerrain.m_level_vertex_id;
    let baseGameVertexId: TNumberId = spawnSmartTerrain.m_game_vertex_id;

    if (spawnPoint !== null) {
      if (spawnPoint === "self") {
        baseSpawnPosition = spawnSmartTerrain.position;
        baseLevelVertexId = spawnSmartTerrain.m_level_vertex_id;
        baseGameVertexId = spawnSmartTerrain.m_game_vertex_id;
      } else {
        baseSpawnPosition = new patrol(spawnPoint).point(0);
        baseLevelVertexId = new patrol(spawnPoint).level_vertex_id(0);
        baseGameVertexId = new patrol(spawnPoint).game_vertex_id(0);
      }
    } else if (spawnSmartTerrain.spawnPointName !== null) {
      baseSpawnPosition = new patrol(spawnSmartTerrain.spawnPointName).point(0);
      baseLevelVertexId = new patrol(spawnSmartTerrain.spawnPointName).level_vertex_id(0);
      baseGameVertexId = new patrol(spawnSmartTerrain.spawnPointName).game_vertex_id(0);
    }

    if (spawnSections.length() !== 0) {
      for (const [k, v] of spawnSections) {
        this.addSquadMember(v, baseSpawnPosition, baseLevelVertexId, baseGameVertexId);
      }
    }

    const randomSpawnConfig = readIniString(SYSTEM_INI, sectionName, "npc_random", false, "", null);

    if (randomSpawnConfig !== null) {
      const randomSpawn: LuaArray<string> = parseStringsList(randomSpawnConfig)!;

      const [countMin, countMax] = getTwoNumbers(SYSTEM_INI, sectionName, "npc_in_squad", 1 as any, 2 as any);

      if (countMin > countMax) {
        abort("min_count can't be greater then max_count [%s]!", this.section_name());
      }

      const randomCount: TCount = math.random(countMin, countMax);

      for (const it of $range(1, randomCount)) {
        const random_id = math.random(1, randomSpawn!.length());

        this.addSquadMember(randomSpawn!.get(random_id), baseSpawnPosition, baseLevelVertexId, baseGameVertexId);
      }
    } else if (spawnSections.length() === 0) {
      abort("You are trying to spawn an empty squad [%s]!", this.section_name());
    }

    this.assignedSmartTerrainId = spawnSmartTerrain.id;
    this.refresh();
  }

  /**
   * Update objects sympathy between objects within squad.
   */
  public updateSquadSympathy(sympathy?: Optional<TCount>): void {
    const squadSympathy = sympathy || this.sympathy;

    if (squadSympathy !== null) {
      for (const squadMembers of this.squad_members()) {
        const object: Optional<XR_game_object> =
          registry.objects.get(squadMembers.id) && registry.objects.get(squadMembers.id).object!;

        if (object !== null) {
          setObjectSympathy(object, squadSympathy);
        } else {
          registry.goodwill.sympathy.set(squadMembers.id, squadSympathy);
        }
      }
    }
  }

  /**
   * Set relation of squad to object with desired parameter.
   * In case of no parameter provided squad members relation will be updated with already in-memory stored value.
   *
   * @param relation - optional, new relation between squad and actor
   */
  public updateSquadRelationToActor(relation: Optional<TRelation> = this.relationship): void {
    if (relation !== null) {
      for (const squadMember of this.squad_members()) {
        const object: Optional<XR_game_object> = registry.objects.get(squadMember.id)?.object;

        if (object !== null) {
          setObjectsRelation(object, registry.actor, relation);
        } else {
          setServerObjectsRelation(alife().object(squadMember.id), alife().actor(), relation);
        }
      }
    }
  }

  /**
   * Set squad position in current level by supplied vector.
   */
  public setSquadPosition(position: XR_vector): void {
    if (!this.online) {
      this.force_change_position(position);
    }

    for (const squadMember of this.squad_members()) {
      const object: Optional<XR_game_object> = level.object_by_id(squadMember.id);

      registry.offlineObjects.get(squadMember.id).level_vertex_id = level.vertex_id(position);

      if (object !== null) {
        resetObjectAnimation(object);
        object.set_npc_position(position);
      } else {
        squadMember.object.position = position;
      }
    }
  }

  /**
   * @returns whether any squad participant has detector.
   */
  public hasDetector(): boolean {
    for (const k of this.squad_members()) {
      const target = alife().object<XR_cse_alife_creature_abstract>(k.id);

      if (target !== null && target.has_detector()) {
        return true;
      }
    }

    return false;
  }

  /**
   * @returns squad community section
   */
  public getSquadCommunity(): TCommunity {
    const squadCommunity: Optional<TCommunity> = squadCommunityByBehaviour[this.faction as TCommunity];

    assert(squadCommunity, "Squad community is 'null' for [%s].", this.faction);

    return squadCommunity;
  }

  /**
   * todo: Description.
   */
  public refresh(): void {
    if (this.commander_id() === null) {
      this.hide();

      return;
    }

    this.show();
  }

  /**
   * todo: Description.
   */
  public hide(): void {
    if (this.current_spot_id === null || this.spot_section === null) {
      return;
    }

    level.map_remove_object_spot(this.current_spot_id, this.spot_section);

    this.current_spot_id = null;
    this.spot_section = null;
  }

  /**
   * todo: Description.
   */
  public show(): void {
    if (this.isMapDisplayHidden) {
      this.hide();

      return;
    }

    if (
      level.map_has_object_spot(this.commander_id(), "ui_pda2_trader_location") !== 0 ||
      level.map_has_object_spot(this.commander_id(), "ui_pda2_mechanic_location") !== 0 ||
      level.map_has_object_spot(this.commander_id(), "ui_pda2_scout_location") !== 0 ||
      level.map_has_object_spot(this.commander_id(), "ui_pda2_quest_npc_location") !== 0 ||
      level.map_has_object_spot(this.commander_id(), "ui_pda2_medic_location") !== 0
    ) {
      this.isMapDisplayHidden = true;

      return;
    }

    if (this.current_spot_id !== this.commander_id()) {
      this.hide();
      this.current_spot_id = this.commander_id();
      this.show();

      return;
    }

    let spot: string = "";

    if (!isSquadMonsterCommunity(this.faction as TCommunity)) {
      const relation: TRelation = getSquadIdRelationToActor(this.id);

      if (relation === relations.friend) {
        spot = "alife_presentation_squad_friend";
      } else if (relation === relations.neutral) {
        spot = "alife_presentation_squad_neutral";
      }
    }

    if (spot !== "") {
      if (spot === this.spot_section) {
        level.map_change_spot_hint(this.current_spot_id, this.spot_section, this.getMapDisplayHint());

        return;
      }

      if (this.spot_section === null) {
        level.map_add_object_spot(this.current_spot_id, spot, this.getMapDisplayHint());
      } else {
        level.map_remove_object_spot(this.current_spot_id, this.spot_section);
        level.map_add_object_spot(this.current_spot_id, spot, this.getMapDisplayHint());
      }

      this.spot_section = spot;
    } else if (this.spot_section !== null) {
      level.map_remove_object_spot(this.current_spot_id, this.spot_section);
      this.spot_section = null;
    }
  }

  /**
   * Get map display hint for debugging and display in game UI map.
   */
  public getMapDisplayHint(): TLabel {
    if (gameConfig.DEBUG.IS_SMARTS_DEBUG_ENABLED) {
      let t: TLabel =
        "[" +
        tostring(this.name()) +
        "]\\n" +
        "current_target = [" +
        tostring(
          this.currentTargetId && alife().object(this.currentTargetId) && alife().object(this.currentTargetId)!.name()
        ) +
        "]\\n" +
        "assigned_target = [" +
        tostring(
          this.assignedTargetId &&
            alife().object(this.assignedTargetId) &&
            alife().object(this.assignedTargetId)!.name()
        ) +
        "]\\n";

      if (this.currentAction !== null && this.currentAction.name === "stay_point") {
        t =
          t +
          "stay_on_point = [" +
          tostring(
            this.currentAction.actionIdleTime - game.get_game_time().diffSec(this.currentAction.actionStartTime!)
          ) +
          "]";
      }

      return t;
    } else {
      return "";
    }
  }

  /**
   * todo;
   */
  public getHelpTargetId(): Optional<TNumberId> {
    if (!this.canHelpActor()) {
      return null;
    }

    const currentCommunity: TCommunity = this.getSquadCommunity();

    for (const [id, v] of registry.actorCombat) {
      const enemySquadId: Optional<TNumberId> = alife().object<XR_cse_alife_creature_abstract>(id)!.group_id;

      if (enemySquadId !== null) {
        const targetSquad: Optional<Squad> = alife().object<Squad>(enemySquadId);

        if (
          targetSquad &&
          this.position.distance_to_sqr(targetSquad.position) < 150 * 150 &&
          isFactionsEnemies(currentCommunity, targetSquad.getSquadCommunity())
        ) {
          return enemySquadId;
        }
      }
    }

    return null;
  }

  /**
   * todo;
   */
  public canHelpActor(): boolean {
    if (isEmpty(registry.actorCombat)) {
      return false;
    }

    if (
      game_graph().vertex(this.m_game_vertex_id).level_id() !==
      game_graph().vertex(alife().actor().m_game_vertex_id).level_id()
    ) {
      return false;
    }

    const currentCommunity: TCommunity = this.getSquadCommunity();

    if (currentCommunity === communities.dolg && hasAlifeInfo(infoPortions.sim_duty_help_harder)) {
      return true;
    } else if (currentCommunity === communities.freedom && hasAlifeInfo(infoPortions.sim_freedom_help_harder)) {
      return true;
    } else if (currentCommunity === communities.stalker && hasAlifeInfo(infoPortions.sim_stalker_help_harder)) {
      return true;
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public getGameLocation(): LuaMultiReturn<[XR_vector, TNumberId, TNumberId]> {
    return $multi(this.position, this.m_level_vertex_id, this.m_game_vertex_id);
  }

  /**
   * todo: Description.
   */
  public override get_current_task(): XR_CALifeSmartTerrainTask {
    if (this.assignedTargetId !== null && alife().object(this.assignedTargetId) !== null) {
      const smartTerrain: Optional<SmartTerrain> = alife().object<SmartTerrain>(this.assignedTargetId)!;

      if (
        smartTerrain.arrivingObjects !== null &&
        smartTerrain.arrivingObjects.get(this.commander_id()) === null &&
        smartTerrain.objectJobDescriptors &&
        smartTerrain.objectJobDescriptors.get(this.commander_id()) &&
        smartTerrain.objectJobDescriptors.get(this.commander_id()).job_id &&
        smartTerrain.jobsData.get(smartTerrain.objectJobDescriptors.get(this.commander_id()).job_id)
      ) {
        return smartTerrain.jobsData.get(smartTerrain.objectJobDescriptors.get(this.commander_id()).job_id).alife_task;
      }

      return alife().object<TSimulationObject>(this.assignedTargetId)!.getAlifeSmartTerrainTask();
    }

    return this.getAlifeSmartTerrainTask();
  }

  /**
   * todo: Description.
   */
  public isReachedBySquad(squad: Squad): boolean {
    return this.npc_count() === 0;
  }

  /**
   * todo: Description.
   */
  public onAfterReachedBySquad(squad: Squad): void {}

  /**
   * todo: Description.
   */
  public onReachedBySquad(squad: Squad): void {
    squad.setLocationTypes();

    for (const it of squad.squad_members()) {
      softResetOfflineObject(it.id);
    }

    this.simulationBoardManager.assignSquadToSmartTerrain(squad, null);
  }

  /**
   * todo: Description.
   */
  public getAlifeSmartTerrainTask(): XR_CALifeSmartTerrainTask {
    return new CALifeSmartTerrainTask(this.m_game_vertex_id, this.m_level_vertex_id);
  }

  /**
   * todo: Description.
   */
  public isSimulationAvailable(): boolean {
    if (pickSectionFromCondList(registry.actor, this, this.isSimulationAvailableConditionList) !== TRUE) {
      return false;
    }

    for (const [zoneName, smartTerrainName] of smartsByNoAssaultZones) {
      const zone: XR_game_object = registry.zones.get(zoneName);

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

    const assignedSmartTerrain: SmartTerrain = alife().object(this.assignedSmartTerrainId) as SmartTerrain;
    const smartTerrainBaseProperties =
      assignedSmartTerrain!.simulationProperties && assignedSmartTerrain!.simulationProperties["base"];

    if (smartTerrainBaseProperties !== null && tonumber(smartTerrainBaseProperties)! > 0) {
      return false;
    }

    if (
      assignedSmartTerrain.smartTerrainActorControl !== null &&
      assignedSmartTerrain.smartTerrainActorControl.status !== ESmartTerrainStatus.NORMAL
    ) {
      if (
        registry.zones.get(assignedSmartTerrain.smartTerrainActorControl.noweap_zone) === null ||
        !registry.zones.get(assignedSmartTerrain.smartTerrainActorControl.noweap_zone).inside(this.position)
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * todo: Description.
   */
  public isValidSquadTarget(squad: Squad): boolean {
    const squadActivityDescriptor: ISimulationActivityDescriptor = simulationActivities[squad.faction];

    if (squadActivityDescriptor === null || squadActivityDescriptor.squad === null) {
      return false;
    }

    const currentFactionDescriptor: Optional<ISimActivityPrecondition> = squadActivityDescriptor.squad[
      this.faction
    ] as Optional<ISimActivityPrecondition>;

    return currentFactionDescriptor !== null && currentFactionDescriptor.prec(squad, this);
  }
}
