import { alife, clsid, game_graph, level, XR_cse_alife_creature_abstract } from "xray16";

import { TCommunity } from "@/engine/lib/constants/communities";
import { TLevel } from "@/engine/lib/constants/levels";
import { Optional, TName, TNumberId } from "@/engine/lib/types";
import { registry, SIMULATION_LTX } from "@/engine/scripts/core/database";
import { getSimulationObjectsRegistry } from "@/engine/scripts/core/database/SimulationObjectsRegistry";
import { AbstractCoreManager } from "@/engine/scripts/core/managers/AbstractCoreManager";
import { SmartTerrain } from "@/engine/scripts/core/objects/alife/smart/SmartTerrain";
import { Squad } from "@/engine/scripts/core/objects/alife/Squad";
import { abort } from "@/engine/scripts/utils/debug";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { changeTeamSquadGroup } from "@/engine/scripts/utils/object";
import { parseNames } from "@/engine/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger($filename);

const group_id_by_levels: LuaTable<TLevel, TNumberId> = {
  zaton: 1,
  pripyat: 2,
  jupiter: 3,
  labx8: 4,
  jupiter_underground: 5,
} as unknown as LuaTable<TLevel, TNumberId>;

export interface ISimSmartDescriptor {
  smrt: SmartTerrain;
  squads: LuaTable<number, Squad>;
  stayed_squad_quan: number;
}

/**
 * todo;
 */
export class SimulationBoardManager extends AbstractCoreManager {
  public isSimulationStarted: boolean = true;

  public players: Optional<LuaTable> = null;
  public smarts: LuaTable<number, ISimSmartDescriptor> = new LuaTable();
  public smarts_by_names: LuaTable<string, SmartTerrain> = new LuaTable();
  public squads: LuaTable<number, Squad> = new LuaTable();
  public tmp_assigned_squad: LuaTable<number, LuaTable<number, Squad>> = new LuaTable();
  public tmp_entered_squad: LuaTable<number, LuaTable<number, Squad>> = new LuaTable();

  public start_position_filled: boolean = false;

  /**
   * todo;
   */
  public startSimulation(): void {
    this.isSimulationStarted = true;
  }

  /**
   * todo;
   */
  public stopSimulation(): void {
    this.isSimulationStarted = false;
  }

  /**
   * todo;
   */
  public register_smart(obj: SmartTerrain): void {
    if (this.smarts.get(obj.id) !== null) {
      abort("Smart already exist in list [%s]", obj.name());
    }

    this.smarts.set(obj.id, { smrt: obj, squads: new LuaTable(), stayed_squad_quan: 0 });

    this.smarts_by_names.set(obj.name(), obj);
  }

  /**
   * todo;
   */
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

  /**
   * todo;
   */
  public unregister_smart(obj: SmartTerrain): void {
    if (!this.smarts.has(obj.id)) {
      abort("Trying to unregister null smart [%s]", obj.name());
    }

    this.smarts.delete(obj.id);
  }

  /**
   * todo;
   */
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

  /**
   * todo;
   */
  public remove_squad(squad: Squad): void {
    logger.info("Remove squad:", squad.name());

    squad.board.exit_smart(squad, squad.smart_id);

    this.assign_squad_to_smart(squad, null);

    squad.remove_squad();
  }

  /**
   * todo;
   */
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

  /**
   * todo;
   */
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

  /**
   * todo;
   */
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

  /**
   * todo;
   */
  public setup_squad_and_group(obj: XR_cse_alife_creature_abstract): void {
    const levelName: TLevel = level.name();

    obj = alife().object(obj.id)!;

    const group: TNumberId = group_id_by_levels.get(levelName) || 0;

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

  /**
   * todo;
   */
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

  /**
   * todo;
   */
  public get_smart_by_name(name: TName): Optional<SmartTerrain> {
    return this.smarts_by_names.get(name);
  }

  /**
   * todo;
   */
  public get_smart_population(smart: SmartTerrain): number {
    return this.smarts.get(smart.id).stayed_squad_quan;
  }

  /**
   * todo;
   */
  public get_squad_target(squad: Squad) {
    const available_targets: LuaTable<number, { prior: number; target: any }> = new LuaTable();
    let most_priority_task = null;
    const max_prior = 0;

    for (const [k, v] of getSimulationObjectsRegistry().objects) {
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

      let maxId: TNumberId = math.floor(0.3 * available_targets.length());

      if (maxId === 0) {
        maxId = 1;
      }

      most_priority_task = available_targets.get(math.random(maxId)).target;
    }

    return most_priority_task || (squad.smart_id && alife().object<SmartTerrain>(squad.smart_id)) || squad;
  }
}
