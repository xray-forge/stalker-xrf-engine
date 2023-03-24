import {
  alife,
  anim,
  CALifeSmartTerrainTask,
  clsid,
  cse_alife_online_offline_group,
  game,
  game_graph,
  level,
  LuabindClass,
  move,
  patrol,
  XR_CALifeSmartTerrainTask,
  XR_cse_alife_creature_abstract,
  XR_game_object,
  XR_net_packet,
  XR_vector,
} from "xray16";

import {
  registerObjectStoryLinks,
  registry,
  SMART_TERRAIN_MASKS_LTX,
  softResetOfflineObject,
  SQUAD_BEHAVIOURS_LTX,
  SYSTEM_INI,
} from "@/engine/core/database";
import {
  registerSimulationObject,
  unregisterSimulationObject,
  updateSimulationObjectAvailability,
} from "@/engine/core/database/simulation";
import { unregisterStoryLinkByObjectId } from "@/engine/core/database/story_objects";
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { simulation_activities } from "@/engine/core/objects/alife/SimulationActivity";
import type { SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
import { ESmartTerrainStatus } from "@/engine/core/objects/alife/smart/SmartTerrainControl";
import { SquadReachTargetAction } from "@/engine/core/objects/alife/SquadReachTargetAction";
import { SquadStayOnTargetAction } from "@/engine/core/objects/alife/SquadStayOnTargetAction";
import { TSimulationObject, TSquadAction } from "@/engine/core/objects/alife/types";
import { SoundManager } from "@/engine/core/objects/sounds/SoundManager";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { abort } from "@/engine/core/utils/assertion";
import { isSquadMonsterCommunity } from "@/engine/core/utils/check/is";
import { setLoadMarker, setSaveMarker } from "@/engine/core/utils/game_save";
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
} from "@/engine/core/utils/relation";
import { isEmpty } from "@/engine/core/utils/table";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { squadCommunityByBehaviour } from "@/engine/lib/constants/behaviours";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { info_portions } from "@/engine/lib/constants/info_portions";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { goodwill, relations, TRelation } from "@/engine/lib/constants/relations";
import { SMART_TERRAIN_SECTION } from "@/engine/lib/constants/sections";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import {
  AnyCallablesModule,
  AnyObject,
  LuaArray,
  Optional,
  StringOptional,
  TCount,
  TName,
  TNumberId,
} from "@/engine/lib/types";
import { TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

const smarts_by_no_assault_zones: LuaTable<string, string> = {
  ["zat_a2_sr_no_assault"]: "zat_stalker_base_smart",
  ["jup_a6_sr_no_assault"]: "jup_a6",
  ["jup_b41_sr_no_assault"]: "jup_b41",
} as any;

/**
 * todo;
 */
@LuabindClass()
export class Squad<
  T extends XR_cse_alife_creature_abstract = XR_cse_alife_creature_abstract
> extends cse_alife_online_offline_group<T> {
  public behaviour: LuaTable<string, string> = new LuaTable();

  // todo: Rename.
  public player_id!: TCommunity;
  public smart_id: Optional<TNumberId> = null;

  public simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();

  public isSimulationAvailableConditionList: TConditionList = parseConditionsList(TRUE);
  public squad_online: boolean = false;
  public show_disabled: boolean = false;

  public entered_smart: Optional<number> = null;
  public items_spawned: Optional<boolean> = null;

  public respawn_point_id: Optional<number> = null;
  public respawn_point_prop_section: Optional<string> = null;

  public current_spot_id: Optional<number> = null;
  public spot_section: Optional<string> = null;

  public currentAction: Optional<TSquadAction> = null;
  public currentTargetId: Optional<TNumberId> = null;
  public assignedTargetId: Optional<TNumberId> = null;

  public soundManager: SoundManager = SoundManager.getSoundManagerForId("squad_" + this.section_name());

  public need_free_update: boolean = false;
  public next_target: Optional<number> = null;
  public parsed_targets: LuaTable<number, string> = new LuaTable();

  public invulnerability: Optional<TConditionList> = null;
  public last_target: Optional<string> = null;

  public action_condlist: TConditionList = new LuaTable();
  public death_condlist: TConditionList = new LuaTable();

  public sympathy: Optional<TCount> = null;
  public show_spot: Optional<TConditionList> = null;
  public relationship: Optional<TRelation> = null;

  public always_walk: boolean = false;
  public always_arrived: boolean = false;
  public need_to_reset_location_masks: boolean = true;

  public props!: AnyObject;

  /**
   * todo: Description.
   */
  public constructor(section: TSection) {
    super(section);

    this.init_squad();
    this.set_squad_behaviour();
  }

  /**
   * todo: Description.
   */
  public init_squad(): void {
    const sectionName: TSection = this.section_name();

    this.player_id = readIniString(SYSTEM_INI, sectionName, "faction", true, "") as TCommunity;
    this.action_condlist = parseConditionsList(readIniString(SYSTEM_INI, sectionName, "target_smart", false, "", ""));
    this.death_condlist = parseConditionsList(readIniString(SYSTEM_INI, sectionName, "on_death", false, "", ""));
    this.invulnerability = parseConditionsList(
      readIniString(SYSTEM_INI, sectionName, "invulnerability", false, "", "")
    );
    this.relationship =
      this.relationship || (readIniString(SYSTEM_INI, sectionName, "relationship", false, "", null) as TRelation);
    this.sympathy = readIniNumber(SYSTEM_INI, sectionName, "sympathy", false, null);
    this.show_spot = parseConditionsList(readIniString(SYSTEM_INI, sectionName, "show_spot", false, "", FALSE));

    this.always_walk = readIniBoolean(SYSTEM_INI, sectionName, "always_walk", false);
    this.always_arrived = readIniBoolean(SYSTEM_INI, sectionName, "always_arrived", false);
    this.set_location_types_section("stalker_terrain");
    this.set_squad_sympathy();
  }

  /**
   * todo: Description.
   */
  public init_squad_on_load(): void {
    logger.info("Init squad on load:", this.name());

    this.set_squad_sympathy();
    this.simulationBoardManager.assignSquadToSmartTerrain(this, this.smart_id);

    if (this.smart_id !== null) {
      this.simulationBoardManager.enterSmartTerrain(this, this.smart_id);
    }

    this.need_to_reset_location_masks = true;
  }

  /**
   * todo: Description.
   */
  public set_squad_behaviour(): void {
    this.behaviour = new LuaTable();

    const behaviour_section = readIniString(SYSTEM_INI, this.section_name(), "behaviour", false, "", this.player_id);

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
  public get_script_target(): Optional<TNumberId> {
    const newTarget: Optional<TSection> = pickSectionFromCondList(registry.actor, this, this.action_condlist);

    if (newTarget === null) {
      return null;
    }

    if (newTarget !== this.last_target) {
      this.last_target = newTarget;
      this.parsed_targets = parseStringsList(newTarget);

      if (this.need_free_update !== true) {
        this.next_target = 1;
      } else {
        this.need_free_update = false;
      }
    }

    if (this.parsed_targets.get(this.next_target as number) === null) {
      this.next_target = 1;
    }

    let nextTargetName: StringOptional<TName> = this.pick_next_target();

    if (nextTargetName === NIL) {
      return null;
    } else if (nextTargetName === "loop") {
      this.next_target = 1;
      nextTargetName = this.pick_next_target();
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
  public pick_next_target(): StringOptional<TName> {
    return this.parsed_targets.get(this.next_target as TNumberId);
  }

  /**
   * todo: Description.
   */
  public check_squad_come_to_point(): boolean {
    if (this.parsed_targets === null) {
      return true;
    }

    const next_target = this.next_target || 0;

    if (this.assignedTargetId !== null && this.smart_id === this.assignedTargetId) {
      if (this.parsed_targets.get(next_target + 1) !== null) {
        this.next_target = next_target + 1;

        return true;
      }
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public update_current_action(): boolean {
    const is_finished = this.currentAction!.update(false);

    if (!is_finished) {
      return false;
    }

    return true;
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    super.update();
    this.refresh();

    updateSimulationObjectAvailability(this);

    this.check_invulnerability();

    const script_target = this.get_script_target();

    if (script_target === null) {
      this.generic_update();

      if (this.need_to_reset_location_masks) {
        this.set_location_types();
        this.need_to_reset_location_masks = false;
      }

      return;
    }

    this.soundManager.update();

    let shouldFindNewAction: boolean = false;

    if (this.assignedTargetId !== null && this.assignedTargetId === script_target) {
      if (this.currentAction !== null) {
        if (this.currentAction.name === "stay_point") {
          if (this.check_squad_come_to_point()) {
            shouldFindNewAction = true;
          } else {
            shouldFindNewAction = this.update_current_action();
          }
        } else {
          if (this.update_current_action()) {
            this.check_squad_come_to_point();
            shouldFindNewAction = true;
          }
        }
      } else {
        this.check_squad_come_to_point();
        shouldFindNewAction = true;
      }
    } else {
      shouldFindNewAction = true;
    }

    if (shouldFindNewAction) {
      this.assignedTargetId = script_target;

      if (this.currentAction !== null) {
        this.currentAction.finalize();
        this.currentAction = null;
      }

      this.get_next_action(false);
    }

    if (this.need_to_reset_location_masks) {
      this.set_location_types();
      this.need_to_reset_location_masks = false;
    }
  }

  /**
   * todo: Description.
   */
  public clear_assigned_target(): void {
    logger.info("Clear squad assigned target:", this.name());

    this.assignedTargetId = null;
  }

  /**
   * todo: Description.
   */
  public assigned_target_avaliable(): boolean {
    const targetObject: Optional<TSimulationObject> =
      this.assignedTargetId === null ? null : alife().object<TSimulationObject>(this.assignedTargetId);

    if (targetObject === null) {
      return false;
    }

    return targetObject.target_precondition(this, true);
  }

  /**
   * todo: Description.
   */
  public generic_update(): void {
    this.soundManager.update();
    this.refresh();

    const help_target_id = get_help_target_id(this);

    if (help_target_id) {
      logger.info("Assign squad new help target_id:", this.name(), help_target_id);
      this.assignedTargetId = help_target_id;
      this.currentAction = null;
      this.get_next_action(false);

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
        this.get_next_action(true);

        return;
      }
    }

    if (this.currentAction !== null && this.assigned_target_avaliable()) {
      const is_finished = this.currentAction.update(true);

      if (is_finished) {
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

    this.get_next_action(true);
  }

  /**
   * todo: Description.
   */
  public get_next_action(under_simulation: boolean): void {
    const squad_target = alife().object<SmartTerrain>(this.assignedTargetId!);

    if (this.currentTargetId === null) {
      if (squad_target === null || squad_target.am_i_reached(this)) {
        if (squad_target !== null) {
          squad_target.on_reach_target(this);
          squad_target.on_after_reach(this);
        }

        this.currentAction = new SquadStayOnTargetAction(this);
        this.currentTargetId = this.assignedTargetId;
        this.currentAction.make(under_simulation);

        return;
      }
    }

    if (this.assignedTargetId === this.currentTargetId || this.assignedTargetId === null) {
      this.currentAction = new SquadStayOnTargetAction(this);
      this.currentTargetId = this.assignedTargetId;
      this.currentAction.make(under_simulation);
    } else {
      this.currentAction = new SquadReachTargetAction(this);
      this.currentAction.make(under_simulation);
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
      const object = alife().object(id);

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
  public remove_npc(objectId: TNumberId): void {
    const npc = alife().object<XR_cse_alife_creature_abstract>(objectId)!;

    logger.info("Remove npc:", this.name(), npc.name());

    this.on_npc_death(npc);
    alife().release(npc, true);
  }

  /**
   * todo: Description.
   */
  public on_npc_death(object: XR_cse_alife_creature_abstract): void {
    logger.info("On npc death:", this.name(), object.name());

    this.soundManager.unregisterObject(object.id);
    this.unregister_member(object.id);

    if (this.npc_count() === 0) {
      logger.info("Removing dead squad:", this.name());

      if (this.currentAction !== null) {
        this.currentAction.finalize();
        this.currentAction = null;
      }

      if (this.death_condlist !== null) {
        pickSectionFromCondList(registry.actor, this, this.death_condlist as any);
      }

      this.simulationBoardManager.onRemoveSquad(this);

      return;
    }

    this.refresh();
  }

  /**
   * todo: Description.
   */
  public assign_squad_member_to_smart(
    memberId: TNumberId,
    smartTerrain: Optional<SmartTerrain>,
    oldSmartTerrainId: Optional<TNumberId>
  ): void {
    const object: Optional<XR_cse_alife_creature_abstract> = alife().object<XR_cse_alife_creature_abstract>(memberId);

    if (object !== null) {
      logger.info("Assign squad member to squad:", this.name(), smartTerrain?.name(), object.name());

      if (object.m_smart_terrain_id === this.smart_id) {
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
  public assign_smart(smartTerrain: Optional<SmartTerrain>) {
    if (smartTerrain) {
      logger.info("Assign squad to smart terrain:", this.name(), smartTerrain.name());
    } else {
      logger.info("Unassign squad from smart:", this.name());
    }

    const oldSmartId: TNumberId = this.smart_id!;

    this.smart_id = smartTerrain && smartTerrain.id;

    for (const squadMember of this.squad_members()) {
      this.assign_squad_member_to_smart(squadMember.id, smartTerrain, oldSmartId);
    }
  }

  /**
   * todo: Description.
   */
  public check_invulnerability(): void {
    if (this.squad_online !== true) {
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
  public set_location_types_section(section: string): void {
    if (SMART_TERRAIN_MASKS_LTX.section_exist(section)) {
      const [result, id, value] = SMART_TERRAIN_MASKS_LTX.r_line(section, 0, "", "");

      this.add_location_type(id);
    }
  }

  /**
   * todo: Description.
   */
  public set_location_types(newSmartName?: TName): void {
    logger.info("Set location types:", this.name(), newSmartName);

    const default_location = "stalker_terrain";

    this.clear_location_types();

    if (alife().object(this.assignedTargetId!)!.clsid() === clsid.smart_terrain) {
      this.set_location_types_section(default_location);

      const old_smart_name = this.smart_id && alife().object(this.smart_id) && alife().object(this.smart_id)!.name();

      if (old_smart_name) {
        this.set_location_types_section(old_smart_name);
      }

      if (newSmartName) {
        this.set_location_types_section(newSmartName);
      }
    } else {
      this.set_location_types_section("squad_terrain");

      for (const [k, v] of registry.simulationObjects) {
        if (alife().object(k)?.clsid() === clsid.smart_terrain) {
          const props_base = alife().object<SmartTerrain>(k)!.props && alife().object<SmartTerrain>(k)!.props["base"];

          if (props_base && tonumber(props_base) === 0) {
            this.set_location_types_section(alife().object(k)!.name());
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

    let base_spawn_position: XR_vector = spawnSmartTerrain.position;
    let base_lvi = spawnSmartTerrain.m_level_vertex_id;
    let base_gvi = spawnSmartTerrain.m_game_vertex_id;

    if (spawnPoint !== null) {
      if (spawnPoint === "self") {
        base_spawn_position = spawnSmartTerrain.position;
        base_lvi = spawnSmartTerrain.m_level_vertex_id;
        base_gvi = spawnSmartTerrain.m_game_vertex_id;
      } else {
        base_spawn_position = new patrol(spawnPoint).point(0);
        base_lvi = new patrol(spawnPoint).level_vertex_id(0);
        base_gvi = new patrol(spawnPoint).game_vertex_id(0);
      }
    } else if (spawnSmartTerrain.spawnPointName !== null) {
      base_spawn_position = new patrol(spawnSmartTerrain.spawnPointName).point(0);
      base_lvi = new patrol(spawnSmartTerrain.spawnPointName).level_vertex_id(0);
      base_gvi = new patrol(spawnSmartTerrain.spawnPointName).game_vertex_id(0);
    }

    if (spawnSections.length() !== 0) {
      for (const [k, v] of spawnSections) {
        this.addSquadMember(v, base_spawn_position, base_lvi, base_gvi);
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

        this.addSquadMember(randomSpawn!.get(random_id), base_spawn_position, base_lvi, base_gvi);
      }
    } else if (spawnSections.length() === 0) {
      abort("You are trying to spawn an empty squad [%s]!", this.section_name());
    }

    this.smart_id = spawnSmartTerrain.id;
    this.refresh();
  }

  /**
   * todo: Description.
   */
  public set_squad_sympathy(sympathy?: Optional<TCount>): void {
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
          set_relation(alife().object(squadMember.id), alife().actor(), relation);
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public set_squad_position(position: XR_vector): void {
    if (this.online === false) {
      this.force_change_position(position);
    }

    for (const k of this.squad_members()) {
      const cl_object = level.object_by_id(k.id);

      registry.offlineObjects.get(k.id).level_vertex_id = level.vertex_id(position);

      if (cl_object !== null) {
        reset_animation(cl_object);
        cl_object.set_npc_position(position);
      } else {
        (k as any).object.position = position;
      }
    }
  }

  /**
   * todo: Description.
   */
  public has_detector(): boolean {
    for (const k of this.squad_members()) {
      const target = alife().object<XR_cse_alife_creature_abstract>(k.id);

      if (target !== null && target.has_detector()) {
        return true;
      }
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public get_squad_community(): TCommunity {
    const squad_community = squadCommunityByBehaviour[this.player_id as any as TCommunity];

    if (squad_community === null) {
      abort("squad community is 'null' for player_id [%s]", this.player_id);
    }

    return squad_community;
  }

  /**
   * todo: Description.
   */
  public override STATE_Write(packet: XR_net_packet): void {
    super.STATE_Write(packet);

    setSaveMarker(packet, false, Squad.__name);

    packet.w_stringZ(tostring(this.currentTargetId));
    packet.w_stringZ(tostring(this.respawn_point_id));
    packet.w_stringZ(tostring(this.respawn_point_prop_section));
    packet.w_stringZ(tostring(this.smart_id));

    setSaveMarker(packet, true, Squad.__name);
  }

  /**
   * todo: Description.
   */
  public override STATE_Read(packet: XR_net_packet, size: TCount): void {
    super.STATE_Read(packet, size);

    setLoadMarker(packet, false, Squad.__name);

    const currentTargetId: StringOptional = packet.r_stringZ();

    this.currentTargetId = currentTargetId === NIL ? null : (tonumber(currentTargetId) as TNumberId);

    const respawnPointId = packet.r_stringZ();

    this.respawn_point_id = respawnPointId === NIL ? null : (tonumber(respawnPointId) as TNumberId);
    this.respawn_point_prop_section = packet.r_stringZ();

    if (this.respawn_point_prop_section === NIL) {
      this.respawn_point_prop_section = null;
    }

    const smartTerrainId: StringOptional = packet.r_stringZ();

    this.smart_id = smartTerrainId === NIL ? null : (tonumber(smartTerrainId) as TNumberId);

    this.init_squad_on_load();

    setLoadMarker(packet, true, Squad.__name);
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
    if (this.show_disabled) {
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
      this.show_disabled = true;

      return;
    }

    if (this.current_spot_id !== this.commander_id()) {
      this.hide();
      this.current_spot_id = this.commander_id();
      this.show();

      return;
    }

    let spot: string = "";

    if (!isSquadMonsterCommunity(this.player_id as TCommunity)) {
      const relation: TRelation = getSquadIdRelationToActor(this.id);

      if (relation === relations.friend) {
        spot = "alife_presentation_squad_friend";
      } else if (relation === relations.neutral) {
        spot = "alife_presentation_squad_neutral";
      }
    }

    if (spot !== "") {
      if (spot === this.spot_section) {
        level.map_change_spot_hint(this.current_spot_id, this.spot_section, this.get_squad_props());

        return;
      }

      if (this.spot_section === null) {
        level.map_add_object_spot(this.current_spot_id, spot, this.get_squad_props());
      } else {
        level.map_remove_object_spot(this.current_spot_id, this.spot_section);
        level.map_add_object_spot(this.current_spot_id, spot, this.get_squad_props());
      }

      this.spot_section = spot;
    } else if (this.spot_section !== null) {
      level.map_remove_object_spot(this.current_spot_id, this.spot_section);
      this.spot_section = null;
    }
  }

  /**
   * todo: Description.
   */
  public get_squad_props() {
    if (gameConfig.DEBUG.IS_SMARTS_DEBUG_ENABLED) {
      let t: string =
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
   * todo: Description.
   */
  public get_location(): LuaMultiReturn<[XR_vector, TNumberId, TNumberId]> {
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
  public am_i_reached(squad: Squad): boolean {
    return this.npc_count() === 0;
  }

  /**
   * todo: Description.
   */
  public on_after_reach(squad: Squad): void {}

  /**
   * todo: Description.
   */
  public on_reach_target(squad: Squad): void {
    squad.set_location_types();

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

    for (const [k, v] of smarts_by_no_assault_zones) {
      const zone = registry.zones.get(k);

      if (zone && zone.inside(this.position)) {
        const smart = SimulationBoardManager.getInstance().getSmartTerrainByName(v);

        if (
          smart &&
          smart.smartTerrainActorControl !== null &&
          smart.smartTerrainActorControl.status !== ESmartTerrainStatus.ALARM
        ) {
          return false;
        }
      }
    }

    if (this.smart_id === null) {
      return true;
    }

    const smart: SmartTerrain = alife().object(this.smart_id) as SmartTerrain;
    const props_base = smart!.props && smart!.props["base"];

    if (props_base !== null && tonumber(props_base)! > 0) {
      return false;
    }

    if (
      smart.smartTerrainActorControl !== null &&
      smart.smartTerrainActorControl.status !== ESmartTerrainStatus.NORMAL
    ) {
      if (
        registry.zones.get(smart.smartTerrainActorControl.noweap_zone) === null ||
        !registry.zones.get(smart.smartTerrainActorControl.noweap_zone).inside(this.position)
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * todo: Description.
   */
  public target_precondition(squad: Squad): boolean {
    const squad_params = simulation_activities[squad.player_id];

    if (squad_params === null || squad_params.squad === null) {
      return false;
    }

    const this_params = squad_params.squad[this.player_id] as Optional<AnyCallablesModule>;

    if (this_params === null || this_params.prec(squad, this) === false) {
      return false;
    }

    return true;
  }
}

/**
 * todo;
 */
export function get_help_target_id(squad: Squad): Optional<TNumberId> {
  // log.info("Get help target id:", squad.name());

  if (!can_help_actor(squad)) {
    return null;
  }

  for (const [id, v] of registry.actorCombat) {
    const enemy_squad_id: Optional<number> = alife().object<XR_cse_alife_creature_abstract>(id)!.group_id;

    if (enemy_squad_id !== null) {
      const target_squad = alife().object<Squad>(enemy_squad_id);

      if (
        target_squad &&
        squad.position.distance_to_sqr(target_squad.position) < 150 * 150 &&
        isFactionsEnemies(squad.get_squad_community(), target_squad.get_squad_community())
      ) {
        return enemy_squad_id;
      }
    }
  }

  return null;
}

/**
 * todo;
 */
export function can_help_actor(squad: Squad): boolean {
  if (isEmpty(registry.actorCombat)) {
    return false;
  }

  if (
    game_graph().vertex(squad.m_game_vertex_id).level_id() !==
    game_graph().vertex(alife().actor().m_game_vertex_id).level_id()
  ) {
    return false;
  }

  if (hasAlifeInfo(info_portions.sim_duty_help_harder) && squad.get_squad_community() === communities.dolg) {
    return true;
  } else if (
    hasAlifeInfo(info_portions.sim_freedom_help_harder) &&
    squad.get_squad_community() === communities.freedom
  ) {
    return true;
  } else if (
    hasAlifeInfo(info_portions.sim_stalker_help_harder) &&
    squad.get_squad_community() === communities.stalker
  ) {
    return true;
  }

  return false;
}

/**
 * todo;
 */
function set_relation(
  npc1: Optional<XR_cse_alife_creature_abstract>,
  npc2: Optional<XR_cse_alife_creature_abstract>,
  new_relation: TRelation
): void {
  logger.info("Set relation:", npc1?.name(), "->", npc2?.name(), "@", new_relation);

  let reputation: TCount = goodwill.neutral;

  if (new_relation === relations.enemy) {
    reputation = goodwill.enemy;
  } else if (new_relation === relations.friend) {
    reputation = goodwill.friend;
  }

  if (npc1 !== null && npc2 !== null) {
    (npc1 as any).force_set_goodwill(reputation, npc2.id);
  } else {
    abort("Npc not set in goodwill function!!!");
  }
}

/**
 * todo;
 */
function reset_animation(object: XR_game_object): void {
  const stateManager: Optional<StalkerStateManager> = registry.objects.get(object.id()).state_mgr!;

  if (stateManager === null) {
    return;
  }

  // const planner = npc.motivation_action_manager();

  stateManager.animation.setState(null, true);
  stateManager.animation.setControl();
  stateManager.animstate.setState(null, true);
  stateManager.animstate.setControl();

  stateManager.set_state("idle", null, null, null, { fast_set: true });

  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();

  object.set_body_state(move.standing);
  object.set_mental_state(anim.free);
}
