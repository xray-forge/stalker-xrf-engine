import { level, stalker_ids, vector, world_property, XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { action_ids } from "@/mod/scripts/core/actions_id";
import { IStoredObject, patrols } from "@/mod/scripts/core/db";
import { evaluators_id } from "@/mod/scripts/core/evaluators_id";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { ActionCommander, IActionCommander } from "@/mod/scripts/core/logic/actions/ActionCommander";
import { ActionPatrol, IActionPatrol } from "@/mod/scripts/core/logic/actions/ActionPatrol";
import { EvaluatorPatrolComm } from "@/mod/scripts/core/logic/evaluators/EvaluatorPatrolComm";
import { EvaluatorPatrolEnd } from "@/mod/scripts/core/logic/evaluators/EvaluatorPatrolEnd";
import { getObjectSquad } from "@/mod/scripts/utils/alife";
import { isObjectMeeting } from "@/mod/scripts/utils/checkers";
import { getConfigBoolean, getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { vectorCross, vectorRotateY, yawDegree } from "@/mod/scripts/utils/physics";

const logger: LuaLogger = new LuaLogger("ActionSchemePatrol");

const formations = {
  line: [
    { dir: new vector().set(-1, 0, 0), dist: 2 },
    { dir: new vector().set(-1, 0, 0), dist: 4 },
    { dir: new vector().set(-1, 0, 0), dist: 6 },
    { dir: new vector().set(1, 0, 0), dist: 2 },
    { dir: new vector().set(1, 0, 0), dist: 4 },
    { dir: new vector().set(1, 0, 0), dist: 6 },
  ],
  back: [
    { dir: new vector().set(0.3, 0, -1), dist: 1.2 },
    { dir: new vector().set(-0.3, 0, -1), dist: 2.4 },
    { dir: new vector().set(0.3, 0, -1), dist: 3.6 },
    { dir: new vector().set(-0.3, 0, -1), dist: 4.8 },
    { dir: new vector().set(0.3, 0, -1), dist: 6 },
    { dir: new vector().set(-0.3, 0, -1), dist: 7.2 },
  ],
  around: [
    { dir: new vector().set(0.44721359, 0, -0.89442718), dist: 2.236068 },
    { dir: new vector().set(-0.44721359, 0, -0.89442718), dist: 2.236068 },
    { dir: new vector().set(1.0, 0, 0), dist: 2 },
    { dir: new vector().set(-1, 0, 0), dist: 2 },
    { dir: new vector().set(0.44721359, 0, 0.89442718), dist: 2.236068 },
    { dir: new vector().set(-0.44721359, 0, 0.89442718), dist: 2.236068 },
  ],
};

const accel_by_curtype = {
  walk: "run",
  patrol: "rush",
  raid: "assault",
  sneak: "sneak_run",
  sneak_run: "assault",
};

export class ActionSchemePatrol extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "patrol";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    const operators = {
      action_patrol: action_ids.sidor_act_patrol,
      action_commander: action_ids.sidor_act_patrol + 1,
    };
    const properties = {
      event: evaluators_id.reaction,
      patrol_end: evaluators_id.sidor_patrol_base + 0,
      patrol_comm: evaluators_id.sidor_patrol_base + 1,
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    const manager = object.motivation_action_manager();

    manager.add_evaluator(
      properties.patrol_end,
      create_xr_class_instance(EvaluatorPatrolEnd, EvaluatorPatrolEnd.__name, storage, EvaluatorPatrolEnd.__name)
    );
    manager.add_evaluator(
      properties.patrol_comm,
      create_xr_class_instance(EvaluatorPatrolComm, EvaluatorPatrolComm.__name, storage, EvaluatorPatrolComm.__name)
    );

    const actionCommander: IActionCommander = create_xr_class_instance(
      ActionCommander,
      object,
      ActionCommander.__name,
      storage
    );

    actionCommander.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionCommander.add_precondition(new world_property(stalker_ids.property_danger, false));
    actionCommander.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionCommander.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    get_global<AnyCallablesModule>("xr_motivator").addCommonPrecondition(actionCommander);
    actionCommander.add_precondition(new world_property(properties.patrol_end, false));
    actionCommander.add_precondition(new world_property(properties.patrol_comm, true));
    actionCommander.add_effect(new world_property(properties.patrol_end, true));
    actionCommander.add_effect(new world_property(properties.state_mgr_logic_active, false));
    manager.add_action(operators.action_commander, actionCommander);
    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(object, storage, actionCommander);

    const actionPatrol: IActionPatrol = create_xr_class_instance(ActionPatrol, object, ActionPatrol.__name, storage);

    actionPatrol.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionPatrol.add_precondition(new world_property(stalker_ids.property_danger, false));
    actionPatrol.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionPatrol.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    get_global<AnyCallablesModule>("xr_motivator").addCommonPrecondition(actionPatrol);
    actionPatrol.add_precondition(new world_property(properties.patrol_end, false));
    actionPatrol.add_precondition(new world_property(properties.patrol_comm, false));
    actionPatrol.add_effect(new world_property(properties.patrol_end, true));
    actionPatrol.add_effect(new world_property(properties.state_mgr_logic_active, false));
    manager.add_action(operators.action_patrol, actionPatrol);
    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(object, storage, actionPatrol);

    manager.action(action_ids.alife).add_precondition(new world_property(properties.patrol_end, true));
  }

  public static set_scheme(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    gulag_name: string
  ): void {
    const st = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(npc, ini, scheme, section);

    st.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, npc);

    st.path_name = getConfigString(ini, section, "path_walk", npc, true, gulag_name);
    st.path_walk = st.path_name;
    st.path_look = getConfigString(ini, section, "path_look", npc, false, gulag_name);

    if (st.path_walk === st.path_look) {
      abort("You are trying to set 'path_look' equal to 'path_walk' in section [%s] for npc [%s]", section, npc.name());
    }

    st.formation = getConfigString(ini, section, "formation", npc, false, "");
    st.silent = getConfigBoolean(ini, section, "silent", npc, false, false);
    if (st.formation === null) {
      st.formation = "back";
    }

    st.move_type = getConfigString(ini, section, "move_type", npc, false, "");
    if (st.move_type === null) {
      st.move_type = "patrol";
    }

    st.suggested_state = {};
    st.suggested_state.standing = getConfigString(ini, section, "def_state_standing", npc, false, "");
    st.suggested_state.moving = getConfigString(ini, section, "def_state_moving1", npc, false, "");
    st.suggested_state.moving = getConfigString(
      ini,
      section,
      "def_state_moving",
      npc,
      false,
      "",
      st.suggested_state.moving
    );
    // --'    st.animation = getConfigString(ini, section, "animation", npc, false, "")

    st.path_walk_info = null;
    st.path_look_info = null;

    st.commander = getConfigBoolean(ini, section, "commander", npc, false, false);

    st.patrol_key = st.path_name;

    const squad = getObjectSquad(npc);

    if (squad !== null) {
      st.patrol_key = st.patrol_key + tostring(squad.id);
    }

    if (patrols.get(st.patrol_key) === null) {
      patrols.set(st.patrol_key, new PatrolManager(st.path_name));
    }

    patrols.get(st.patrol_key).add_npc(npc, st.commander);
  }
}

export class PatrolManager {
  public path_name: string;
  public npc_list: LuaTable = new LuaTable();
  public current_state: string = "patrol";
  public commander_id: number = -1;
  public formation: string = "back";
  public commander_lid: number = -1;
  public commander_dir: XR_vector = new vector().set(0, 0, 1);
  public npc_count: number = 0;

  public constructor(path_name: string) {
    this.path_name = path_name;
  }

  public add_npc(npc: XR_game_object, leader: Optional<boolean>): void {
    if (npc === null || npc.alive() === false || this.npc_list.get(npc.id()) !== null) {
      return;
    }

    if (this.npc_count === 7) {
      abort("[XR_PATROL] attempt to add more { 7 npc. [%s]", npc.name());
    }

    this.npc_list.set(npc.id(), { soldier: npc, dir: new vector().set(1, 0, 0), dist: 0 });

    this.npc_count = this.npc_count + 1;

    if (this.npc_count === 1 || leader === true) {
      this.commander_id = npc.id();
    }

    this.reset_positions();
  }

  public remove_npc(npc: XR_game_object): void {
    if (npc === null) {
      return;
    }

    if (this.npc_list.get(npc.id()) === null) {
      return;
    }

    this.npc_list.delete(npc.id());
    this.npc_count = this.npc_count - 1;

    if (npc.id() === this.commander_id) {
      this.commander_id = -1;
      this.reset_positions();
    }
  }

  public reset_positions(): void {
    const form_ = formations[this.formation as keyof typeof formations];
    let index = 1;

    for (const [key, data] of this.npc_list) {
      if (this.commander_id === -1 && index === 1) {
        this.commander_id = data.soldier.id();
      }

      if (this.commander_id !== this.npc_list.get(key).soldier.id()) {
        this.npc_list.get(key).dir = form_[index].dir;
        this.npc_list.get(key).dist = form_[index].dist;
        this.npc_list.get(key).vertex_id = -1;
        this.npc_list.get(key).accepted = true;

        index = index + 1;
      }
    }
  }

  public set_formation(formation: string): void {
    if (formation === null) {
      abort("Invalid formation (null) for PatrolManager[%s]", this.path_name);
    }

    if (formation !== "around" && formation !== "back" && formation !== "line") {
      abort("Invalid formation (%s) for PatrolManager[%s]", formation, this.path_name);
    }

    this.formation = formation;
    this.reset_positions();
  }

  public get_commander(npc: XR_game_object): void {
    if (npc === null) {
      abort("Invalid NPC on call PatrolManager:get_npc_command in PatrolManager[%s]", this.path_name);
    }

    if (this.npc_list.get(npc.id()) === null) {
      abort("NPC with name %s can't present in PatrolManager[%s]", npc.name(), this.path_name);
    }

    if (npc.id() === this.commander_id) {
      abort("Patrol commander called function PatrolManager:get_npc_command in PatrolManager[%s]", this.path_name);
    }

    const commander = this.npc_list.get(this.commander_id).soldier;

    if (commander === null) {
      abort("Patrol commander not present in PatrolManager[%s]", this.path_name);
    }

    return commander;
  }

  public get_npc_command(npc: XR_game_object): LuaMultiReturn<[number, XR_vector, string]> {
    if (npc === null) {
      abort("Invalid NPC on call PatrolManager:get_npc_command in PatrolManager[%s]", this.path_name);
    }

    // --'���������� �������� ������
    const npc_id = npc.id();

    // --'�������� ������ �� ���������� � ������
    if (this.npc_list.get(npc.id()) === null) {
      abort("NPC with name %s can't present in PatrolManager[%s]", npc.name(), this.path_name);
    }

    // --'��������, ����� �������� �� ������� �������� ������ ��������
    if (npc.id() === this.commander_id) {
      abort("Patrol commander called function PatrolManager:get_npc_command in PatrolManager[%s]", this.path_name);
    }

    const commander = this.npc_list.get(this.commander_id).soldier;
    const dir: XR_vector = commander.direction();
    const pos: XR_vector = new vector().set(0, 0, 0);
    let vertex_id: number = commander.location_on_path(5, pos);

    if (level.vertex_position(vertex_id).distance_to(this.npc_list.get(npc_id).soldier.position()) > 5) {
      vertex_id = commander.level_vertex_id();
    }

    dir.y = 0;
    dir.normalize();

    let dir_s = this.npc_list.get(npc_id).dir;
    const dist_s = this.npc_list.get(npc_id).dist;

    let angle = yawDegree(dir_s, new vector().set(0, 0, 1));
    const vvv = vectorCross(dir_s, new vector().set(0, 0, 1));

    if (vvv.y < 0) {
      angle = -angle;
    }

    dir_s = vectorRotateY(dir, angle);

    const d = 2;
    const vertex = level.vertex_in_direction(level.vertex_in_direction(vertex_id, dir_s, dist_s), dir, d);

    this.npc_list.get(npc_id).vertex_id = vertex;

    const distance = commander.position().distance_to(this.npc_list.get(npc_id).soldier.position());

    if (distance > dist_s + 2) {
      const new_state = accel_by_curtype[this.current_state as keyof typeof accel_by_curtype];

      if (new_state !== null) {
        return $multi(vertex, dir, new_state);
      }
    }

    return $multi(vertex, dir, this.current_state);
  }

  public set_command(npc: XR_game_object, command: string, formation: string): void {
    if (npc === null || npc.alive() === false) {
      this.remove_npc(npc);

      return;
    }

    if (npc.id() !== this.commander_id) {
      return; // --abort ("NPC %s is not commander in PatrolManager[%s]", npc:name (), this.path_name)
    }

    this.current_state = command;
    if (this.formation !== formation) {
      this.formation = formation;
      this.set_formation(formation);
    }

    this.commander_lid = npc.level_vertex_id();
    this.commander_dir = npc.direction();
    this.update();
  }

  public is_commander(npc_id: number): boolean {
    return npc_id === this.commander_id;
  }

  public is_commander_in_meet(): boolean {
    if (this.commander_id === -1) {
      return false;
    }

    const npc = this.npc_list.get(this.commander_id).soldier;

    if (npc !== null && npc.alive() === true) {
      return isObjectMeeting(npc);
    }

    return false;
  }

  public update(): void {
    /*
    if (tm_enabled === true) {
      this.tm.update();
    }
    */
  }
}
