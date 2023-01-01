import {
  alife,
  clsid,
  game_graph,
  ini_file,
  level,
  system_ini,
  XR_cse_alife_creature_abstract,
  XR_cse_alife_online_offline_group,
  XR_LuaBindBase
} from "xray16";

import { TCommunity } from "@/mod/globals/communities";
import { Optional } from "@/mod/lib/types";
import { getActor } from "@/mod/scripts/core/db";
import { ISimSquad } from "@/mod/scripts/se/SimSquad";
import { ISmartTerrain } from "@/mod/scripts/se/SmartTerrain";
import { changeTeamSquadGroup } from "@/mod/scripts/utils/alife";
import { parseNames } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("SimBoard");

export const squad_ltx = system_ini();
export const setting_ini = new ini_file("misc\\simulation.ltx");

const group_id_by_levels: LuaTable<string, number> = {
  zaton: 1,
  pripyat: 2,
  jupiter: 3,
  labx8: 4,
  jupiter_underground: 5
} as any;

let board: Optional<ISimBoard> = null;

export interface ISimSmartDescriptor {
  smrt: ISmartTerrain;
  squads: LuaTable<number, XR_cse_alife_online_offline_group>;
  stayed_squad_quan: number;
}

export interface ISimBoard extends XR_LuaBindBase {
  simulation_started: boolean;

  smarts: LuaTable<number, ISimSmartDescriptor>;
  smarts_by_names: any;
  squads: any;
  spawn_smarts: any;
  mutant_lair: any;
  tmp_assigned_squad: LuaTable<number, LuaTable<number, ISimSquad>>;
  tmp_entered_squad: LuaTable<number, LuaTable<number, ISimSquad>>;

  start_position_filled: boolean;

  start_sim(): void;
  stop_sim(): void;
  set_actor_community(community: TCommunity): void;
  register_smart(obj: ISmartTerrain): void;
  init_smart(obj: ISmartTerrain): void;
  unregister_smart(obj: ISmartTerrain): void;
  create_squad(spawn_smart: ISmartTerrain, sq_id: number): ISimSquad;
  remove_squad(squad: ISimSquad): void;
  assign_squad_to_smart(squad: ISimSquad, smart_id: Optional<number>): void;
  exit_smart(squad: ISimSquad, smart_id: Optional<number>): void;
  enter_smart(squad: ISimSquad, smart_id: number, after_load?: boolean): void;
  setup_squad_and_group(obj: unknown): void;
  fill_start_position(): void;
  get_smart_by_name(name: string): Optional<ISmartTerrain>;
  get_smart_population(smart: ISmartTerrain): number;
  get_squad_target(squad: ISimSquad): ISmartTerrain | ISimSquad;
}

export const SimBoard: ISimBoard = declare_xr_class("SimBoard", null, {
  __init(): void {
    this.smarts = new LuaTable();
    this.simulation_started = true;

    this.smarts_by_names = {};

    this.squads = {};

    this.spawn_smarts = {};
    this.mutant_lair = {};

    this.tmp_assigned_squad = new LuaTable();
    this.tmp_entered_squad = new LuaTable();
  },
  start_sim(): void {
    this.simulation_started = true;
  },
  stop_sim(): void {
    this.simulation_started = false;
  },
  set_actor_community(community: TCommunity): void {
    // May be broken?
    getActor()!.set_character_community(get_global("actor_communitites")[community], 0, 0);
  },
  register_smart(obj: ISmartTerrain): void {
    if (this.smarts.get(obj.id) !== null) {
      abort("Smart already exist in list [%s]", obj.name());
    }

    this.smarts.set(obj.id, { smrt: obj, squads: new LuaTable(), stayed_squad_quan: 0 });

    this.smarts_by_names[obj.name()] = obj;
  },
  init_smart(obj: ISmartTerrain): void {
    if (this.tmp_assigned_squad.has(obj.id)) {
      for (const [k, v] of this.tmp_assigned_squad.get(obj.id)) {
        this.assign_squad_to_smart(v, obj.id);
      }

      this.tmp_assigned_squad.delete(obj.id);
    }

    if (this.tmp_entered_squad.has(obj.id)) {
      for (const [k, v] of this.tmp_entered_squad.get(obj.id)) {
        this.enter_smart(v, obj.id);
      }

      this.tmp_entered_squad.delete(obj.id);
    }
  },
  unregister_smart(obj: ISmartTerrain): void {
    if (!this.smarts.has(obj.id)) {
      abort("Trying to unregister null smart [%s]", obj.name());
    }

    this.smarts.delete(obj.id);
  },
  create_squad(spawn_smart: ISmartTerrain, sq_id: number): ISimSquad {
    const squad_id = tostring(sq_id);
    const squad = alife().create<ISimSquad>(
      squad_id,
      spawn_smart.position,
      spawn_smart.m_level_vertex_id,
      spawn_smart.m_game_vertex_id
    );

    log.info("Creating squad in smart:", squad.name(), spawn_smart.name());

    squad.create_npc(spawn_smart);
    squad.set_squad_relation();

    this.assign_squad_to_smart(squad, spawn_smart.id);

    for (const k of squad.squad_members()) {
      const obj = k.object;

      squad.board.setup_squad_and_group(obj);
    }

    return squad;
  },
  remove_squad(squad: ISimSquad): void {
    log.info("Remove squad:", squad.name());

    if (squad.current_action === null || squad.current_action.dest_smrt === null) {
      squad.board.exit_smart(squad, squad.smart_id);
    }

    this.assign_squad_to_smart(squad, null);

    squad.remove_squad();
  },
  assign_squad_to_smart(squad: ISimSquad, smart_id: Optional<number>): void {
    if (smart_id !== null && !this.smarts.has(smart_id)) {
      if (!this.tmp_assigned_squad.has(smart_id)) {
        this.tmp_assigned_squad.set(smart_id, new LuaTable());
      }

      table.insert(this.tmp_assigned_squad.get(smart_id), squad);

      return;
    }

    let old_smart_id = null;

    if (squad.smart_id !== null) {
      old_smart_id = squad.smart_id;
    }

    if (old_smart_id !== null && this.smarts.has(old_smart_id)) {
      this.smarts.get(old_smart_id).squads.delete(squad.id);
      this.smarts.get(old_smart_id).smrt.refresh();
    }

    if (smart_id === null) {
      squad.assign_smart(null);

      return;
    }

    const target: ISimSmartDescriptor = this.smarts.get(smart_id);

    squad.assign_smart(target.smrt);
    target.squads.set(squad.id, squad);
    target.smrt.refresh();
  },
  exit_smart(squad: ISimSquad, smart_id: Optional<number>): void {
    if (smart_id === null) {
      return;
    }

    if (squad.entered_smart !== smart_id) {
      return;
    }

    squad.entered_smart = null;

    const smart = this.smarts.get(smart_id);

    if (smart === null) {
      abort("Smart null while smart_id not null [%s]", tostring(smart_id));
    }

    smart.stayed_squad_quan = smart.stayed_squad_quan - 1;
    smart.squads.delete(squad.id);
  },
  enter_smart(squad: ISimSquad, smart_id: number, after_load: boolean): void {
    if (!this.smarts.has(smart_id)) {
      if (!this.tmp_entered_squad.has(smart_id)) {
        this.tmp_entered_squad.set(smart_id, new LuaTable());
      }

      table.insert(this.tmp_entered_squad.get(smart_id), squad);

      return;
    }

    const smart = this.smarts.get(smart_id);

    if (squad.entered_smart !== null) {
      abort("Couldn't enter smart, still in old one. Squad: [%s]", squad.name());
    }

    squad.entered_smart = smart_id;

    smart.stayed_squad_quan = smart.stayed_squad_quan + 1;
    squad.items_spawned = false;
  },
  setup_squad_and_group(obj: XR_cse_alife_creature_abstract): void {
    const level_name: string = level.name();

    obj = alife().object(obj.id)!;

    const group: number = group_id_by_levels.get(level_name) || 0;

    changeTeamSquadGroup(obj, obj.team, obj.squad, group);

    const squad = alife().object<ISimSquad>(obj.group_id);

    if (squad === null) {
      changeTeamSquadGroup(obj, obj.team, 0, obj.group);

      return;
    }

    let smart = null;

    if (squad.current_action != null && squad.current_action.name === "reach_target") {
      smart = alife().object<ISmartTerrain>(squad.assigned_target_id);
    } else if (squad.smart_id != null) {
      smart = alife().object<ISmartTerrain>(squad.smart_id);
    }

    if (smart === null) {
      changeTeamSquadGroup(obj, obj.team, 0, obj.group);

      return;
    }

    let obj_sq = 0;

    if (smart.clsid() === clsid.smart_terrain) {
      obj_sq = smart.squad_id;
    }

    changeTeamSquadGroup(obj, obj.team, obj_sq, obj.group);
  },
  fill_start_position(): void {
    if (this.start_position_filled === true) {
      return;
    }

    this.start_position_filled = true;

    for (const level of game_graph().levels()) {
      const section_name = "start_position_" + alife().level_name(level.id);

      if (!setting_ini.section_exist(section_name)) {
        return;
      }

      const n = setting_ini.line_count(section_name);

      for (const i of $range(0, n - 1)) {
        const [result, id, value] = setting_ini.r_line(section_name, i, "", "");
        const smrt_names = parseNames(value);

        for (const [k, v] of smrt_names) {
          const smart = this.smarts_by_names[v];

          if (smart === null) {
            abort("Wrong smart name [%s] in start position", tostring(v));
          }

          const squad = this.create_squad(smart, id as any);

          this.enter_smart(squad, smart.id);
        }
      }
    }
  },
  get_smart_by_name(name: string): Optional<ISmartTerrain> {
    return this.smarts_by_names[name];
  },
  get_smart_population(smart: ISmartTerrain): number {
    return this.smarts.get(smart.id).stayed_squad_quan;
  },
  get_squad_target(squad: ISimSquad) {
    const available_targets: LuaTable<number, { prior: number; target: any }> = new LuaTable();
    let most_priority_task = null;
    const max_prior = 0;

    for (const [k, v] of get_global("simulation_objects").get_sim_obj_registry().objects) {
      let curr_prior = 0;

      if (v.id !== squad.id) {
        curr_prior = v.evaluate_prior(squad);
      }

      if (curr_prior > 0) {
        table.insert(available_targets, { prior: curr_prior, target: v });
      }
    }

    if (available_targets.length() > 0) {
      table.sort(available_targets, (a, b) => a.prior > b.prior);

      let max_id = math.floor(0.3 * available_targets.length());

      if (max_id === 0) {
        max_id = 1;
      }

      most_priority_task = available_targets.get(math.random(max_id)).target;
    }

    return most_priority_task || (squad.smart_id && alife().object<ISmartTerrain>(squad.smart_id)) || squad;
  }
} as ISimBoard);

export function get_sim_board(): ISimBoard {
  if (board === null) {
    log.info("Init new board");
    board = create_xr_class_instance(SimBoard);
  }

  return board;
}

export function reset_sim_board(): void {
  log.info("Clear board");
  board = null;
}
