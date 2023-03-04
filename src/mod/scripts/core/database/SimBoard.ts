import { alife, clsid, game_graph, level, XR_cse_alife_creature_abstract, XR_EngineBinding } from "xray16";

import { TCommunity } from "@/mod/globals/communities";
import { Optional, TNumberId } from "@/mod/lib/types";
import { SmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import { Squad } from "@/mod/scripts/core/alife/Squad";
import { registry, SIMULATION_LTX } from "@/mod/scripts/core/database";
import { get_sim_obj_registry } from "@/mod/scripts/core/database/SimObjectsRegistry";
import { changeTeamSquadGroup } from "@/mod/scripts/utils/alife";
import { parseNames } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SimBoard");

const group_id_by_levels: LuaTable<string, number> = {
  zaton: 1,
  pripyat: 2,
  jupiter: 3,
  labx8: 4,
  jupiter_underground: 5,
} as any;

let board: Optional<SimBoard> = null;

export interface ISimSmartDescriptor {
  smrt: SmartTerrain;
  squads: LuaTable<number, Squad>;
  stayed_squad_quan: number;
}

/**
 * todo;
 */
export class SimBoard {
  public simulation_started: boolean = true;

  public players: Optional<LuaTable> = null;
  public smarts: LuaTable<number, ISimSmartDescriptor> = new LuaTable();
  public smarts_by_names: LuaTable<string, SmartTerrain> = new LuaTable();
  public squads: LuaTable<number, Squad> = new LuaTable();
  public spawn_smarts: any;
  public mutant_lair: any;
  public tmp_assigned_squad: LuaTable<number, LuaTable<number, Squad>>;
  public tmp_entered_squad: LuaTable<number, LuaTable<number, Squad>>;

  public start_position_filled: boolean = false;

  public constructor() {
    this.spawn_smarts = {};
    this.mutant_lair = {};

    this.tmp_assigned_squad = new LuaTable();
    this.tmp_entered_squad = new LuaTable();
  }

  public start_sim(): void {
    this.simulation_started = true;
  }

  public stop_sim(): void {
    this.simulation_started = false;
  }

  public set_actor_community(community: TCommunity): void {
    // May be broken?
    registry.actor.set_character_community(get_global("actor_communitites")[community], 0, 0);
  }

  public register_smart(obj: SmartTerrain): void {
    if (this.smarts.get(obj.id) !== null) {
      abort("Smart already exist in list [%s]", obj.name());
    }

    this.smarts.set(obj.id, { smrt: obj, squads: new LuaTable(), stayed_squad_quan: 0 });

    this.smarts_by_names.set(obj.name(), obj);
  }

  public init_smart(obj: SmartTerrain): void {
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
  }

  public unregister_smart(obj: SmartTerrain): void {
    if (!this.smarts.has(obj.id)) {
      abort("Trying to unregister null smart [%s]", obj.name());
    }

    this.smarts.delete(obj.id);
  }

  public create_squad(spawn_smart: SmartTerrain, sq_id: string): Squad {
    const squad_id = tostring(sq_id);
    const squad = alife().create<Squad>(
      squad_id,
      spawn_smart.position,
      spawn_smart.m_level_vertex_id,
      spawn_smart.m_game_vertex_id
    );

    logger.info("Creating squad in smart:", squad.name(), spawn_smart.name());

    squad.create_npc(spawn_smart);
    squad.set_squad_relation();

    this.assign_squad_to_smart(squad, spawn_smart.id);

    for (const k of squad.squad_members()) {
      const obj = k.object;

      squad.board.setup_squad_and_group(obj);
    }

    return squad;
  }

  public remove_squad(squad: Squad): void {
    logger.info("Remove squad:", squad.name());

    squad.board.exit_smart(squad, squad.smart_id);

    this.assign_squad_to_smart(squad, null);

    squad.remove_squad();
  }

  public assign_squad_to_smart(squad: Squad, smart_id: Optional<number>): void {
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
  }

  public exit_smart(squad: Squad, smart_id: Optional<number>): void {
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
  }

  public enter_smart(squad: Squad, smartId: TNumberId): void {
    if (!this.smarts.has(smartId)) {
      if (!this.tmp_entered_squad.has(smartId)) {
        this.tmp_entered_squad.set(smartId, new LuaTable());
      }

      table.insert(this.tmp_entered_squad.get(smartId), squad);

      return;
    }

    const smart = this.smarts.get(smartId);

    if (squad.entered_smart !== null) {
      abort("Couldn't enter smart, still in old one. Squad: [%s]", squad.name());
    }

    squad.entered_smart = smartId;
    squad.items_spawned = false;

    smart.stayed_squad_quan = smart.stayed_squad_quan + 1;
  }

  public setup_squad_and_group(obj: XR_cse_alife_creature_abstract): void {
    const level_name: string = level.name();

    obj = alife().object(obj.id)!;

    const group: number = group_id_by_levels.get(level_name) || 0;

    changeTeamSquadGroup(obj, obj.team, obj.squad, group);

    const squad = alife().object<Squad>(obj.group_id);

    if (squad === null) {
      changeTeamSquadGroup(obj, obj.team, 0, obj.group);

      return;
    }

    let smart = null;

    if (squad.current_action !== null && squad.current_action.name === "reach_target") {
      smart = alife().object<SmartTerrain>(squad.assigned_target_id!);
    } else if (squad.smart_id !== null) {
      smart = alife().object<SmartTerrain>(squad.smart_id);
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
  }

  public fill_start_position(): void {
    if (this.start_position_filled === true) {
      return;
    }

    this.start_position_filled = true;

    for (const level of game_graph().levels()) {
      const section_name = "start_position_" + alife().level_name(level.id);

      if (!SIMULATION_LTX.section_exist(section_name)) {
        return;
      }

      const n = SIMULATION_LTX.line_count(section_name);

      for (const i of $range(0, n - 1)) {
        const [result, id, value] = SIMULATION_LTX.r_line(section_name, i, "", "");
        const smrt_names = parseNames(value);

        for (const [k, v] of smrt_names) {
          const smart = this.smarts_by_names.get(v);

          if (smart === null) {
            abort("Wrong smart name [%s] in start position", tostring(v));
          }

          const squad = this.create_squad(smart, id as any);

          this.enter_smart(squad, smart.id);
        }
      }
    }
  }

  public get_smart_by_name(name: string): Optional<SmartTerrain> {
    return this.smarts_by_names.get(name);
  }

  public get_smart_population(smart: SmartTerrain): number {
    return this.smarts.get(smart.id).stayed_squad_quan;
  }

  public get_squad_target(squad: Squad) {
    const available_targets: LuaTable<number, { prior: number; target: any }> = new LuaTable();
    let most_priority_task = null;
    const max_prior = 0;

    for (const [k, v] of get_sim_obj_registry().objects) {
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

    return most_priority_task || (squad.smart_id && alife().object<SmartTerrain>(squad.smart_id)) || squad;
  }
}

export function get_sim_board(): SimBoard {
  if (board === null) {
    logger.info("Init new board");
    board = new SimBoard();
  }

  return board;
}

export function resetSimBoard(): void {
  logger.info("Clear board");
  board = null;
}
