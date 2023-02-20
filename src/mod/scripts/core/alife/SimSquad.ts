import {
  alife,
  anim,
  CALifeSmartTerrainTask,
  clsid,
  cse_alife_online_offline_group,
  game,
  game_graph,
  level,
  move,
  patrol,
  system_ini,
  XR_CALifeSmartTerrainTask,
  XR_cse_alife_creature_abstract,
  XR_cse_alife_online_offline_group,
  XR_game_object,
  XR_net_packet,
  XR_vector,
} from "xray16";

import { squadCommunityByBehaviour } from "@/mod/globals/behaviours";
import { communities, TCommunity } from "@/mod/globals/communities";
import { goodwill } from "@/mod/globals/goodwill";
import { info_portions } from "@/mod/globals/info_portions";
import { MAX_UNSIGNED_16_BIT } from "@/mod/globals/memory";
import { relations, TRelation } from "@/mod/globals/relations";
import { SMART_TERRAIN_SECT } from "@/mod/globals/sections";
import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { AnyCallablesModule, AnyObject, Optional } from "@/mod/lib/types";
import { TSection } from "@/mod/lib/types/scheme";
import { simulation_activities } from "@/mod/scripts/core/alife/SimActivity";
import {
  ISimSquadReachTargetAction,
  SimSquadReachTargetAction,
} from "@/mod/scripts/core/alife/SimSquadReachTargetAction";
import {
  ISimSquadStayOnTargetAction,
  SimSquadStayOnTargetAction,
} from "@/mod/scripts/core/alife/SimSquadStayOnTargetAction";
import type { ISmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import { ESmartTerrainStatus } from "@/mod/scripts/core/alife/SmartTerrainControl";
import { goodwill as dbGoodwill, offlineObjects, registry } from "@/mod/scripts/core/db";
import { SMART_TERRAIN_MASKS_LTX, SQUAD_BEHAVIOURS_LTX, SYSTEM_INI } from "@/mod/scripts/core/db/IniFiles";
import { get_sim_board, ISimBoard } from "@/mod/scripts/core/db/SimBoard";
import { evaluate_prior, get_sim_obj_registry } from "@/mod/scripts/core/db/SimObjectsRegistry";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/db/StoryObjectsRegistry";
import {
  get_squad_relation_to_actor_by_id,
  is_factions_enemies,
  set_npc_sympathy,
  set_npcs_relation,
} from "@/mod/scripts/core/GameRelationsManager";
import { get_sound_manager, SoundManager } from "@/mod/scripts/core/sound/SoundManager";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { hasAlifeInfo } from "@/mod/scripts/utils/actor";
import { areOnSameAlifeLevel, unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { isSquadMonsterCommunity } from "@/mod/scripts/utils/checkers/is";
import {
  getConfigBoolean,
  getConfigNumber,
  getConfigString,
  parseCondList,
  parseNames,
  pickSectionFromCondList,
  r_2nums,
} from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { isEmpty } from "@/mod/scripts/utils/table";

const logger: LuaLogger = new LuaLogger("SimSquad");

const smarts_by_no_assault_zones: LuaTable<string, string> = {
  ["zat_a2_sr_no_assault"]: "zat_stalker_base_smart",
  ["jup_a6_sr_no_assault"]: "jup_a6",
  ["jup_b41_sr_no_assault"]: "jup_b41",
} as any;

export interface ISimSquad<T extends XR_cse_alife_creature_abstract = XR_cse_alife_creature_abstract>
  extends XR_cse_alife_online_offline_group<T> {
  behaviour: LuaTable<string, string>;

  // todo: Rename.
  player_id: TCommunity;
  smart_id: Optional<number>;
  board: ISimBoard;
  sim_avail: boolean;

  squad_online: boolean;
  show_disabled: boolean;

  entered_smart: Optional<number>;
  items_spawned: Optional<boolean>;

  respawn_point_id: Optional<number>;
  respawn_point_prop_section: Optional<string>;

  current_spot_id: Optional<number>;
  spot_section: Optional<string>;

  current_action: Optional<ISimSquadStayOnTargetAction | ISimSquadReachTargetAction>;
  current_target_id: Optional<any>;
  assigned_target_id: Optional<number>;

  soundManager: SoundManager;
  settings_id: any;
  init_squad: any;
  set_squad_behaviour: any;

  need_free_update: boolean;
  next_target: number;
  parsed_targets: LuaTable<number, string>;

  invulnerability: boolean;

  last_target: Optional<string>;

  action_condlist: LuaTable<string>;
  death_condlist: LuaTable<string>;

  sympathy: Optional<number>;
  show_spot: boolean;
  relationship: TRelation;

  always_walk: boolean;
  always_arrived: boolean;
  need_to_reset_location_masks: boolean;

  props: AnyObject;

  init_squad_on_load(): void;
  pick_next_target(): string;
  check_squad_come_to_point(): boolean;
  update_current_action(): boolean;
  clear_assigned_target(): void;
  assigned_target_avaliable(): boolean;
  generic_update(): void;
  get_script_target(): Optional<number>;
  get_next_action(under_simulation: boolean): unknown;
  remove_npc(npc_id: number): void;
  remove_squad(): void;
  on_npc_death(npc: XR_cse_alife_creature_abstract): void;
  assign_squad_member_to_smart(member_id: number, smart: Optional<ISmartTerrain>, old_smart_id: Optional<number>): void;
  assign_smart(smart: Optional<ISmartTerrain>): unknown;
  check_invulnerability(): void;
  set_location_types_section(section: string): void;
  set_location_types(new_smart_name?: string): void;
  add_squad_member(spawn_section: string, spawn_position: XR_vector, lv_id: number, gv_id: number): number;
  create_npc(smart: ISmartTerrain): void;
  set_squad_sympathy(sympathy?: number): void;
  set_squad_relation(relation?: TRelation): void;
  set_squad_position(position: XR_vector): void;
  has_detector(): boolean;
  get_squad_community(): TCommunity;
  refresh(): void;
  hide(): void;
  show(): void;
  get_squad_props(): string;
  get_location(): LuaMultiReturn<[XR_vector, number, number]>;
  am_i_reached(squad: ISimSquad): boolean;
  on_after_reach(squad: ISimSquad): void;
  on_reach_target(squad: ISimSquad): void;
  get_alife_task(): XR_CALifeSmartTerrainTask;
  sim_available(): boolean;
  target_precondition(squad: ISimSquad): boolean;
  evaluate_prior(squad: ISimSquad): number;
}

export const SimSquad: ISimSquad = declare_xr_class("SimSquad", cse_alife_online_offline_group, {
  __init(section: TSection): void {
    cse_alife_online_offline_group.__init(this, section);

    this.smart_id = null;
    this.board = get_sim_board();
    this.current_spot_id = null;

    this.current_action = null;
    this.current_target_id = null;
    this.assigned_target_id = null;

    this.soundManager = get_sound_manager("squad_" + this.section_name());
    this.settings_id = this.section_name();
    this.init_squad();
    this.set_squad_behaviour();
  },
  init_squad(): void {
    this.player_id = getConfigString(SYSTEM_INI, this.settings_id, "faction", this, true, "") as TCommunity;
    this.action_condlist = parseCondList(
      this,
      "assign_action",
      "target_smart",
      getConfigString(SYSTEM_INI, this.settings_id, "target_smart", this, false, "", "")
    );
    this.death_condlist = parseCondList(
      this,
      "death_condlist",
      "on_death",
      getConfigString(SYSTEM_INI, this.settings_id, "on_death", this, false, "", "")
    );
    this.invulnerability = parseCondList(
      this,
      "invulnerability",
      "invulnerability",
      getConfigString(SYSTEM_INI, this.settings_id, "invulnerability", this, false, "", "")
    );
    this.relationship =
      this.relationship || getConfigString(SYSTEM_INI, this.settings_id, "relationship", this, false, "", null);
    this.sympathy = getConfigNumber(SYSTEM_INI, this.settings_id, "sympathy", this, false, null);
    this.show_spot = parseCondList(
      this,
      "show_spot",
      "show_spot",
      getConfigString(SYSTEM_INI, this.settings_id, "show_spot", this, false, "", "false")
    );

    this.always_walk = getConfigBoolean(SYSTEM_INI, this.settings_id, "always_walk", this, false);
    this.always_arrived = getConfigBoolean(SYSTEM_INI, this.settings_id, "always_arrived", this, false);
    this.set_location_types_section("stalker_terrain");
    this.set_squad_sympathy();
  },
  init_squad_on_load(): void {
    logger.info("Init squad on load:", this.name());

    this.set_squad_sympathy();
    this.board.assign_squad_to_smart(this, this.smart_id);

    if (this.smart_id !== null) {
      this.board.enter_smart(this, this.smart_id, true);
    }

    this.need_to_reset_location_masks = true;
  },
  set_squad_behaviour(): void {
    this.behaviour = new LuaTable();

    const behaviour_section = getConfigString(
      SYSTEM_INI,
      this.settings_id,
      "behaviour",
      this,
      false,
      "",
      this.player_id
    );

    if (!SQUAD_BEHAVIOURS_LTX.section_exist(behaviour_section)) {
      abort("There is no section [" + behaviour_section + "] in 'squad_behaviours.ltx'");
    }

    const n = SQUAD_BEHAVIOURS_LTX.line_count(behaviour_section);

    for (const j of $range(0, n - 1)) {
      const [result, prop_name, prop_condlist] = SQUAD_BEHAVIOURS_LTX.r_line(behaviour_section, j, "", "");

      this.behaviour.set(prop_name, prop_condlist);
    }
  },
  get_script_target(): Optional<number> {
    const new_target: Optional<string> = pickSectionFromCondList(
      registry.actor,
      this,
      this.action_condlist as LuaTable<any>
    );

    if (new_target === null) {
      return null;
    }

    if (new_target !== this.last_target) {
      this.last_target = new_target;
      this.parsed_targets = parseNames(new_target);

      if (this.need_free_update !== true) {
        this.next_target = 1;
      } else {
        this.need_free_update = false;
      }
    }

    if (this.parsed_targets.get(this.next_target) === null) {
      this.next_target = 1;
    }

    let nt: string = this.pick_next_target();

    if (nt === "nil") {
      return null;
    } else if (nt === "loop") {
      this.next_target = 1;
      nt = this.pick_next_target();
    }

    const point = this.board.smarts_by_names.get(nt);

    if (point === null) {
      abort("Incorrect next point [%s] for squad [%s]", tostring(nt), tostring(this.id));
    }

    return point.id;
  },
  pick_next_target(): string {
    return this.parsed_targets.get(this.next_target);
  },
  check_squad_come_to_point(): boolean {
    if (this.parsed_targets === null) {
      return true;
    }

    const next_target = this.next_target || 0;

    if (this.assigned_target_id !== null && this.smart_id === this.assigned_target_id) {
      if (this.parsed_targets.get(next_target + 1) !== null) {
        this.next_target = next_target + 1;

        return true;
      }
    }

    return false;
  },
  update_current_action(): boolean {
    const is_finished = this.current_action!.update(false);

    if (!is_finished) {
      return false;
    }

    return true;
  },
  update(): void {
    cse_alife_online_offline_group.update(this);
    this.refresh();

    get_sim_obj_registry().update_avaliability(this);

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

    let need_to_find_new_action: boolean = false;

    if (this.assigned_target_id !== null && this.assigned_target_id === script_target) {
      if (this.current_action !== null) {
        if (this.current_action.name === "stay_point") {
          if (this.check_squad_come_to_point()) {
            need_to_find_new_action = true;
          } else {
            need_to_find_new_action = this.update_current_action();
          }
        } else {
          if (this.update_current_action()) {
            this.check_squad_come_to_point();
            need_to_find_new_action = true;
          }
        }
      } else {
        this.check_squad_come_to_point();
        need_to_find_new_action = true;
      }
    } else {
      if (this.current_action === null) {
        need_to_find_new_action = true;
      } else {
        if (this.current_action!.major === true) {
          if (this.update_current_action()) {
            this.check_squad_come_to_point();
            need_to_find_new_action = true;
          }
        } else {
          need_to_find_new_action = true;
        }
      }
    }

    if (need_to_find_new_action === true) {
      this.assigned_target_id = script_target;

      if (this.current_action !== null) {
        this.current_action.finalize();
        this.current_action = null;
      }

      this.get_next_action(false);
    }

    if (this.need_to_reset_location_masks) {
      this.set_location_types();
      this.need_to_reset_location_masks = false;
    }
  },
  clear_assigned_target(): void {
    this.assigned_target_id = null;
  },
  assigned_target_avaliable(): boolean {
    const target_obj = (this.assigned_target_id && alife().object(this.assigned_target_id)) as ISmartTerrain;

    if (target_obj === null) {
      return false;
    }

    return target_obj.target_precondition(this, true);
  },
  generic_update(): void {
    this.soundManager.update();
    this.refresh();

    const help_target_id = get_help_target_id(this);

    if (help_target_id) {
      this.assigned_target_id = help_target_id;
      this.current_action = null;
      this.get_next_action(false);

      return;
    }

    if (
      this.assigned_target_id &&
      alife().object(this.assigned_target_id)! &&
      alife().object(this.assigned_target_id)!.clsid() !== clsid.online_offline_group_s
    ) {
      const squad_target = this.board.get_squad_target(this)!;

      if (squad_target.clsid() === clsid.online_offline_group_s) {
        this.assigned_target_id = squad_target.id;
        this.current_action = null;
        this.get_next_action(true);

        return;
      }
    }

    if (this.current_action !== null && this.assigned_target_avaliable()) {
      const is_finished = this.current_action.update(true);

      if (is_finished) {
        this.current_action.finalize();

        if (this.current_action.name === "stay_point" || this.assigned_target_id === null) {
          this.assigned_target_id = this.board.get_squad_target(this)!.id;
        }

        this.current_action = null;
      } else {
        return;
      }
    } else {
      this.current_action = null;
      this.current_target_id = null;
      this.assigned_target_id = this.board.get_squad_target(this)!.id;
    }

    this.get_next_action(true);
  },
  get_next_action(under_simulation: boolean): void {
    const squad_target = alife().object<ISmartTerrain>(this.assigned_target_id!);

    if (this.current_target_id === null) {
      if (squad_target === null || squad_target.am_i_reached(this)) {
        if (squad_target !== null) {
          squad_target.on_reach_target(this);
          squad_target.on_after_reach(this);
        }

        this.current_action = create_xr_class_instance(SimSquadStayOnTargetAction, this);
        this.current_target_id = this.assigned_target_id;
        this.current_action.make(under_simulation);

        return;
      }
    }

    if (this.assigned_target_id === this.current_target_id || this.assigned_target_id === null) {
      this.current_action = create_xr_class_instance(SimSquadStayOnTargetAction, this);
      this.current_target_id = this.assigned_target_id;
      this.current_action.make(under_simulation);
    } else {
      this.current_action = create_xr_class_instance(SimSquadReachTargetAction, this);
      this.current_action.make(under_simulation);
    }
  },
  remove_squad(): void {
    logger.info("Remove squad:", this.name());

    const squad_npcs: LuaTable<number, boolean> = new LuaTable();

    for (const k of this.squad_members()) {
      squad_npcs.set(k.id, true);
    }

    // todo: May be more simple.
    for (const [j, v] of squad_npcs) {
      const obj = alife().object(j);

      if (obj !== null) {
        this.unregister_member(j);
        alife().release(obj, true);
      }
    }

    this.hide();
  },
  remove_npc(npc_id: number): void {
    const npc = alife().object<XR_cse_alife_creature_abstract>(npc_id)!;

    logger.info("Remove npc:", this.name(), npc.name());

    this.on_npc_death(npc);
    alife().release(npc, true);
  },
  on_npc_death(npc: XR_cse_alife_creature_abstract): void {
    logger.info("On npc death:", this.name(), npc.name());

    this.soundManager.unregister_npc(npc.id);
    this.unregister_member(npc.id);

    if (this.npc_count() === 0) {
      logger.info("Removing dead squad:", this.name());

      if (this.current_action !== null) {
        this.current_action.finalize();
        this.current_action = null;
      }

      if (this.death_condlist !== null) {
        pickSectionFromCondList(registry.actor, this, this.death_condlist as any);
      }

      this.board.remove_squad(this);

      return;
    }

    this.refresh();
  },
  assign_squad_member_to_smart(
    member_id: number,
    smart: Optional<ISmartTerrain>,
    old_smart_id: Optional<number>
  ): void {
    logger.info("Assign squad member to squad:", this.name(), smart?.name(), member_id);

    const obj = alife().object<XR_cse_alife_creature_abstract>(member_id);

    if (obj !== null) {
      if (obj.m_smart_terrain_id === this.smart_id) {
        return;
      }

      if (
        obj.m_smart_terrain_id !== MAX_UNSIGNED_16_BIT &&
        old_smart_id !== null &&
        obj.m_smart_terrain_id === old_smart_id &&
        this.board.smarts.get(old_smart_id) !== null
      ) {
        this.board.smarts.get(old_smart_id).smrt.unregister_npc(obj);
      }

      if (smart !== null) {
        smart.register_npc(obj);
      }
    }
  },
  assign_smart(smart: Optional<ISmartTerrain>) {
    logger.info("Assign smart:", this.name(), smart?.name());

    const old_smart = this.smart_id!;

    this.smart_id = smart && smart.id;

    for (const k of this.squad_members()) {
      this.assign_squad_member_to_smart(k.id, smart, old_smart);
    }
  },
  check_invulnerability(): void {
    if (this.squad_online !== true) {
      return;
    }

    const invulnerability: boolean =
      pickSectionFromCondList(registry.actor, this, this.invulnerability as any) === "true";

    for (const k of this.squad_members()) {
      const npc_st = registry.objects.get(k.id);

      if (npc_st !== null) {
        const npc = npc_st.object!;

        if (
          npc?.invulnerable() !== invulnerability &&
          getConfigString(npc_st.ini!, npc_st.active_section!, "invulnerable", npc, false, "", null) === null
        ) {
          npc.invulnerable(invulnerability);
        }
      }
    }
  },
  set_location_types_section(section: string): void {
    if (SMART_TERRAIN_MASKS_LTX.section_exist(section)) {
      logger.info("Set location types section:", this.name(), section);

      const [result, id, value] = SMART_TERRAIN_MASKS_LTX.r_line(section, 0, "", "");

      this.add_location_type(id);
    }
  },
  set_location_types(new_smart_name): void {
    logger.info("Set location types");

    const default_location = "stalker_terrain";

    this.clear_location_types();

    if (alife().object(this.assigned_target_id!)!.clsid() === clsid.smart_terrain) {
      this.set_location_types_section(default_location);

      const old_smart_name = this.smart_id && alife().object(this.smart_id) && alife().object(this.smart_id)!.name();

      if (old_smart_name) {
        this.set_location_types_section(old_smart_name);
      }

      if (new_smart_name) {
        this.set_location_types_section(new_smart_name);
      }
    } else {
      this.set_location_types_section("squad_terrain");

      for (const [k, v] of get_sim_obj_registry().objects) {
        if (alife().object(k)?.clsid() === clsid.smart_terrain) {
          const props_base = alife().object<ISmartTerrain>(k)!.props && alife().object<ISmartTerrain>(k)!.props["base"];

          if (props_base && tonumber(props_base) === 0) {
            this.set_location_types_section(alife().object(k)!.name());
          }
        }
      }
    }
  },
  add_squad_member(spawn_section, spawn_position, lv_id, gv_id): number {
    logger.info("Add squad member:", this.name());

    const spawn_sections_ltx = system_ini();
    const custom_data = getConfigString(
      spawn_sections_ltx,
      spawn_section,
      "custom_data",
      this,
      false,
      "",
      "default_custom_data.ltx"
    );

    if (custom_data !== "default_custom_data.ltx") {
      logger.info(
        "INCORRECT npc_spawn_section USED [%s]. You cannot use npc with custom_data in squads",
        spawn_section
      );
    }

    const position = spawn_position;
    const obj = alife().create(spawn_section, position, lv_id, gv_id);

    this.register_member(obj.id);
    this.soundManager.register_npc(obj.id);

    if (
      areOnSameAlifeLevel(obj, alife().actor()) &&
      position.distance_to_sqr(alife().actor().position) <= alife().switch_distance() * alife().switch_distance()
    ) {
      // todo: Delete also, same as with stalkers and monsters??? Memory leak probable
      registry.spawnedVertexes.set(obj.id, lv_id);
    }

    return obj.id;
  },
  create_npc(spawn_smart: ISmartTerrain): void {
    logger.info("Create npc:", this.name(), spawn_smart?.name());

    const ini = system_ini();

    const spawn_sections = parseNames(getConfigString(ini, this.settings_id, "npc", this, false, "", ""));

    let spawn_point =
      getConfigString(ini, this.settings_id, "spawn_point", this, false, "", "self") ||
      getConfigString(spawn_smart.ini, SMART_TERRAIN_SECT, "spawn_point", this, false, "", "self");

    spawn_point = parseCondList(this, "spawn_point", "spawn_point", spawn_point);
    spawn_point = pickSectionFromCondList(registry.actor, this, spawn_point as any)!;

    let base_spawn_position: XR_vector = spawn_smart.position;
    let base_lvi = spawn_smart.m_level_vertex_id;
    let base_gvi = spawn_smart.m_game_vertex_id;

    if (spawn_point !== null) {
      if (spawn_point === "self") {
        base_spawn_position = spawn_smart.position;
        base_lvi = spawn_smart.m_level_vertex_id;
        base_gvi = spawn_smart.m_game_vertex_id;
      } else {
        base_spawn_position = new patrol(spawn_point).point(0);
        base_lvi = new patrol(spawn_point).level_vertex_id(0);
        base_gvi = new patrol(spawn_point).game_vertex_id(0);
      }
    } else if (spawn_smart.spawn_point !== null) {
      base_spawn_position = new patrol(spawn_smart.spawn_point).point(0);
      base_lvi = new patrol(spawn_smart.spawn_point).level_vertex_id(0);
      base_gvi = new patrol(spawn_smart.spawn_point).game_vertex_id(0);
    }

    if (spawn_sections.length() !== 0) {
      for (const [k, v] of spawn_sections) {
        this.add_squad_member(v, base_spawn_position, base_lvi, base_gvi);
      }
    }

    const random_spawn_config = getConfigString(ini, this.settings_id, "npc_random", this, false, "", null);

    if (random_spawn_config !== null) {
      const random_spawn = parseNames(random_spawn_config)!;

      const [count_min, count_max] = r_2nums(ini, this.settings_id, "npc_in_squad", 1 as any, 2 as any);

      if (count_min > count_max) {
        abort("min_count can't be greater then max_count [%s]!", this.settings_id);
      }

      const random_count = math.random(count_min as any, count_max as any);

      for (const i of $range(1, random_count)) {
        const random_id = math.random(1, random_spawn!.length());

        this.add_squad_member(random_spawn!.get(random_id), base_spawn_position, base_lvi, base_gvi);
      }
    } else if (spawn_sections.length() === 0) {
      abort("You are trying to spawn an empty squad [%s]!", this.settings_id);
    }

    this.smart_id = spawn_smart.id;
    this.refresh();
  },
  set_squad_sympathy(sympathy?: Optional<number>): void {
    const symp = sympathy || this.sympathy;

    if (symp !== null) {
      for (const k of this.squad_members()) {
        const npc: Optional<XR_game_object> = registry.objects.get(k.id) && registry.objects.get(k.id).object!;

        if (npc !== null) {
          set_npc_sympathy(npc, symp);
        } else {
          if (dbGoodwill.sympathy === null) {
            dbGoodwill.sympathy = new LuaTable();
          }

          dbGoodwill.sympathy.set(k.id, symp);
        }
      }
    }
  },
  set_squad_relation(relation?: Optional<TRelation>): void {
    const rel = relation || this.relationship;

    if (rel !== null) {
      for (const k of this.squad_members()) {
        const npc: Optional<XR_game_object> = registry.objects.get(k.id) && registry.objects.get(k.id).object!;

        if (npc !== null) {
          set_npcs_relation(npc, registry.actor, rel);
        } else {
          set_relation(alife().object(k.id), alife().actor(), rel);
        }
      }
    }
  },
  set_squad_position(position: XR_vector): void {
    if (this.online === false) {
      this.force_change_position(position);
    }

    for (const k of this.squad_members()) {
      const cl_object = level.object_by_id(k.id);

      offlineObjects.get(k.id).level_vertex_id = level.vertex_id(position);

      if (cl_object !== null) {
        reset_animation(cl_object);
        cl_object.set_npc_position(position);
      } else {
        (k as any).object.position = position;
      }
    }
  },
  has_detector(): boolean {
    for (const k of this.squad_members()) {
      const target = alife().object<XR_cse_alife_creature_abstract>(k.id);

      if (target !== null && target.has_detector()) {
        return true;
      }
    }

    return false;
  },
  get_squad_community(): string {
    const squad_community = squadCommunityByBehaviour[this.player_id as any as TCommunity];

    if (squad_community === null) {
      abort("squad community is 'null' for player_id [%s]", this.player_id);
    }

    return squad_community;
  },
  STATE_Write(packet: XR_net_packet): void {
    cse_alife_online_offline_group.STATE_Write(this, packet);

    setSaveMarker(packet, false, "sim_squad_scripted");

    packet.w_stringZ(tostring(this.current_target_id));
    packet.w_stringZ(tostring(this.respawn_point_id));
    packet.w_stringZ(tostring(this.respawn_point_prop_section));
    packet.w_stringZ(tostring(this.smart_id));

    setSaveMarker(packet, true, "sim_squad_scripted");
  },
  STATE_Read(packet: XR_net_packet, size: number): void {
    cse_alife_online_offline_group.STATE_Read(this, packet, size);

    setSaveMarker(packet, false, "sim_squad_scripted");

    this.current_target_id = packet.r_stringZ();

    if (this.current_target_id === "nil") {
      this.current_target_id = null;
    } else {
      this.current_target_id = tonumber(this.current_target_id);
    }

    const respawn_point_id = packet.r_stringZ();

    if (respawn_point_id === "nil") {
      this.respawn_point_id = null;
    } else {
      this.respawn_point_id = tonumber(respawn_point_id)!;
    }

    this.respawn_point_prop_section = packet.r_stringZ();

    if (this.respawn_point_prop_section === "nil") {
      this.respawn_point_prop_section = null;
    }

    const smart_id = packet.r_stringZ();

    if (smart_id === "nil") {
      this.smart_id = null;
    } else {
      this.smart_id = tonumber(this.smart_id)!;
    }

    this.init_squad_on_load();
    setSaveMarker(packet, true, "sim_squad_scripted");
  },
  on_register(): void {
    cse_alife_online_offline_group.on_register(this);
    this.board.squads.set(this.id, this);
    checkSpawnIniForStoryId(this);
    get_sim_obj_registry().register(this);
  },
  on_unregister(): void {
    unregisterStoryObjectById(this.id);

    this.board.squads.delete(this.id);
    this.board.assign_squad_to_smart(this, null);
    cse_alife_online_offline_group.on_unregister(this);
    get_sim_obj_registry().unregister(this);

    if (this.respawn_point_id !== null) {
      const smart = alife().object<ISmartTerrain>(this.respawn_point_id)!;

      if (smart === null) {
        return;
      }

      smart.already_spawned.get(this.respawn_point_prop_section!).num =
        smart.already_spawned.get(this.respawn_point_prop_section!).num - 1;
    }
  },
  can_switch_offline(): boolean {
    return cse_alife_online_offline_group.can_switch_offline(this);
  },
  can_switch_online(): boolean {
    return cse_alife_online_offline_group.can_switch_online(this);
  },
  refresh(): void {
    if (this.commander_id() === null) {
      this.hide();

      return;
    }

    this.show();
  },
  hide(): void {
    if (this.current_spot_id === null || this.spot_section === null) {
      return;
    }

    level.map_remove_object_spot(this.current_spot_id, this.spot_section);

    this.current_spot_id = null;
    this.spot_section = null;
  },
  // Showing minimap star / dots icons.
  show(): void {
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
      const relation: TRelation = get_squad_relation_to_actor_by_id(this.id);

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
  },
  get_squad_props() {
    if (gameConfig.DEBUG.IS_SMARTS_DEBUG_ENABLED) {
      let t: string =
        "[" +
        tostring(this.name()) +
        "]\\n" +
        "current_target = [" +
        tostring(
          this.current_target_id &&
            alife().object(this.current_target_id) &&
            alife().object(this.current_target_id)!.name()
        ) +
        "]\\n" +
        "assigned_target = [" +
        tostring(
          this.assigned_target_id &&
            alife().object(this.assigned_target_id) &&
            alife().object(this.assigned_target_id)!.name()
        ) +
        "]\\n";

      if (this.current_action !== null && this.current_action.name === "stay_point") {
        t =
          t +
          "stay_on_point = [" +
          tostring(this.current_action.idle_time - game.get_game_time().diffSec(this.current_action.start_time!)) +
          "]";
      }

      return t;
    } else {
      return "";
    }
  },
  get_location(): LuaMultiReturn<[XR_vector, number, number]> {
    return $multi(this.position, this.m_level_vertex_id, this.m_game_vertex_id);
  },
  get_current_task() {
    if (this.assigned_target_id !== null && alife().object(this.assigned_target_id) !== null) {
      const smart_terrain = alife().object<ISmartTerrain>(this.assigned_target_id)!;

      if (
        smart_terrain.arriving_npc !== null &&
        smart_terrain.arriving_npc.get(this.commander_id()) === null &&
        smart_terrain.npc_info &&
        smart_terrain.npc_info.get(this.commander_id()) &&
        smart_terrain.npc_info.get(this.commander_id()).job_id &&
        smart_terrain.job_data.get(smart_terrain.npc_info.get(this.commander_id()).job_id)
      ) {
        return smart_terrain.job_data.get(smart_terrain.npc_info.get(this.commander_id()).job_id).alife_task;
      }

      return alife().object<ISimSquad>(this.assigned_target_id)!.get_alife_task();
    }

    return this.get_alife_task();
  },
  am_i_reached(squad: ISimSquad): boolean {
    return this.npc_count() === 0;
  },
  on_after_reach(squad: ISimSquad): void {},
  on_reach_target(squad: ISimSquad): void {
    squad.set_location_types();

    for (const k of squad.squad_members()) {
      if (offlineObjects.get(k.id) !== null) {
        offlineObjects.set(k.id, {});
      }
    }

    this.board.assign_squad_to_smart(squad, null);
  },
  get_alife_task(): XR_CALifeSmartTerrainTask {
    return new CALifeSmartTerrainTask(this.m_game_vertex_id, this.m_level_vertex_id);
  },
  sim_available(): boolean {
    for (const [k, v] of smarts_by_no_assault_zones) {
      const zone = registry.zones.get(k);

      if (zone && zone.inside(this.position)) {
        const smart = get_sim_board().get_smart_by_name(v);

        if (
          smart &&
          smart.base_on_actor_control !== null &&
          smart.base_on_actor_control.status !== ESmartTerrainStatus.ALARM
        ) {
          return false;
        }
      }
    }

    if (this.smart_id === null) {
      return true;
    }

    const smart: ISmartTerrain = alife().object<ISmartTerrain>(this.smart_id)!;
    const props_base = smart!.props && smart!.props["base"];

    if (props_base !== null && tonumber(props_base)! > 0) {
      return false;
    }

    if (smart.base_on_actor_control !== null && smart.base_on_actor_control.status !== ESmartTerrainStatus.NORMAL) {
      if (
        registry.zones.get(smart.base_on_actor_control.noweap_zone) === null ||
        !registry.zones.get(smart.base_on_actor_control.noweap_zone).inside(this.position)
      ) {
        return false;
      }
    }

    return true;
  },
  target_precondition(squad: ISimSquad): boolean {
    const squad_params = simulation_activities[squad.player_id];

    if (squad_params === null || squad_params.squad === null) {
      return false;
    }

    const this_params = squad_params.squad[this.player_id] as Optional<AnyCallablesModule>;

    if (this_params === null || this_params.prec(squad, this) === false) {
      return false;
    }

    return true;
  },
  evaluate_prior(squad: ISimSquad): number {
    return evaluate_prior(this, squad);
  },
} as ISimSquad);

export function get_help_target_id(squad: ISimSquad): Optional<number> {
  // log.info("Get help target id:", squad.name());

  if (!can_help_actor(squad)) {
    return null;
  }

  for (const [k, v] of registry.actorCombat) {
    const enemy_squad_id: Optional<number> = alife().object<XR_cse_alife_creature_abstract>(k)!.group_id;

    if (enemy_squad_id !== null) {
      const target_squad = alife().object<ISimSquad>(enemy_squad_id);

      if (
        target_squad &&
        squad.position.distance_to_sqr(target_squad.position) < 150 * 150 &&
        is_factions_enemies(squad.get_squad_community(), target_squad.get_squad_community())
      ) {
        return enemy_squad_id;
      }
    }
  }

  return null;
}

export function can_help_actor(squad: ISimSquad): boolean {
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

function set_relation(
  npc1: Optional<XR_cse_alife_creature_abstract>,
  npc2: Optional<XR_cse_alife_creature_abstract>,
  new_relation: TRelation
): void {
  logger.info("Set relation:", npc1?.name(), npc2?.name(), new_relation);

  let reputation: number = goodwill.neutral;

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

function reset_animation(npc: XR_game_object): void {
  const stateManager: Optional<StateManager> = registry.objects.get(npc.id()).state_mgr!;

  if (stateManager === null) {
    return;
  }

  // const planner = npc.motivation_action_manager();

  stateManager.animation.set_state(null, true);
  stateManager.animation.set_control();
  stateManager.animstate.set_state(null, true);
  stateManager.animstate.set_control();

  stateManager.set_state("idle", null, null, null, { fast_set: true });

  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();

  npc.set_body_state(move.standing);
  npc.set_mental_state(anim.free);
}
