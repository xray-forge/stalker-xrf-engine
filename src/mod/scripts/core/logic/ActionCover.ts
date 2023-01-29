import {
  action_base,
  game_object,
  level,
  stalker_ids,
  vector,
  world_property,
  XR_action_base,
  XR_game_object,
  XR_ini_file,
  XR_vector
} from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { EvaluatorNeedCover } from "@/mod/scripts/core/logic/evaluators/EvaluatorNeedCover";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { get_sim_board, ISimBoard } from "@/mod/scripts/se/SimBoard";
import { set_state } from "@/mod/scripts/state_management/StateManager";
import {
  getConfigBoolean,
  getConfigNumber,
  getConfigString,
  parseCondList,
  pickSectionFromCondList
} from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { vectorCmp } from "@/mod/scripts/utils/physics";

const log: LuaLogger = new LuaLogger("ActionCover");

export class ActionCover extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "cover";

  /**
   * Add scheme to object binder for initialization.
   */
  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    log.info("Add to binder:", object.name());

    const operators = {
      action_cover: get_global("xr_actions_id").stohe_cover_base + 1
    };
    const properties = {
      event: get_global("xr_evaluators_id").reaction,
      need_cover: get_global("xr_evaluators_id").stohe_cover_base + 1,
      state_mgr_logic_active: get_global("xr_evaluators_id").state_mgr + 4
    };

    const manager = object.motivation_action_manager();

    manager.add_evaluator(properties.need_cover, create_xr_class_instance(EvaluatorNeedCover, state, "need_cover"));

    const new_action = create_xr_class_instance(ActionBaseCover, "action_cover", state);

    new_action.add_precondition(new world_property(stalker_ids.property_alive, true));
    new_action.add_precondition(new world_property(stalker_ids.property_danger, false));
    new_action.add_precondition(new world_property(stalker_ids.property_enemy, false));
    new_action.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    new_action.add_precondition(new world_property(get_global("xr_evaluators_id").sidor_wounded_base + 0, false));
    new_action.add_precondition(new world_property(properties["need_cover"], true));
    new_action.add_effect(new world_property(properties["need_cover"], false));
    new_action.add_effect(new world_property(properties["state_mgr_logic_active"], false));
    manager.add_action(new operators["action_cover"](), new_action);

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(object, state, new_action);

    const alifeAction = manager.action(get_global("xr_actions_id").alife);

    alifeAction.add_precondition(new world_property(properties["need_cover"], false));
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    additional: string
  ): void {
    log.info("Set scheme:", object.name());

    const state = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(object, ini, scheme, section);

    state.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, object);
    state.smart = getConfigString(ini, section, "smart", object, false, "");
    state.anim = parseCondList(
      object,
      "anim",
      "anim",
      getConfigString(ini, section, "anim", object, false, "", "hide")
    );
    state.sound_idle = getConfigString(ini, section, "sound_idle", object, false, "");

    if (state.smart === null) {
      abort("There is no path_walk and smart in ActionCover.");
    }

    state.use_attack_direction = getConfigBoolean(ini, section, "use_attack_direction", object, false, true);

    state.radius_min = getConfigNumber(ini, section, "radius_min", object, false, 3);
    state.radius_max = getConfigNumber(ini, section, "radius_max", object, false, 5);
  }
}

export interface IActionBaseCover extends XR_action_base {
  state: IStoredObject;
  board: ISimBoard;
  enemy_random_position: XR_vector;

  cover_vertex_id: number;
  cover_position: XR_vector;

  position_reached(): boolean;
  activate_scheme(): void;
}

const ActionBaseCover: IActionBaseCover = declare_xr_class("ActionBaseCover", action_base, {
  __init(action_name: string, state: IStoredObject): void {
    action_base.__init(this, null, action_name);
    this.state = state;
  },
  initialize(): void {
    action_base.initialize(this);
    this.board = get_sim_board();
  },
  activate_scheme(): void {
    this.state.signals = {};
    this.board = get_sim_board();

    const base_point = this.board.get_smart_by_name(this.state.smart)!.m_level_vertex_id;

    const direction_vector = new vector().set(math.random(-100, 100), 0, math.random(-100, 100));
    const base_vertex_id = level.vertex_in_direction(
      base_point,
      direction_vector,
      math.random(this.state.radius_min, this.state.radius_max)
    );
    const this_random_position = level.vertex_position(base_vertex_id);

    this.enemy_random_position = this_random_position;

    let cover = null;
    const tcover = null;
    let cover_dist = 2;

    while (cover === null && cover_dist <= 4) {
      cover = this.object.best_cover(this_random_position, this.enemy_random_position, cover_dist, 1, 150);
      cover_dist = cover_dist + 1;
    }

    if (cover === null) {
      this.cover_vertex_id = base_vertex_id;
      this.cover_position = this_random_position;
    } else {
      this.cover_vertex_id = cover.level_vertex_id();
      this.cover_position = cover.position();
    }

    if (!this.object.accessible(this.cover_position)) {
      const ttp = new vector().set(0, 0, 0);

      this.cover_vertex_id = this.object.accessible_nearest(this.cover_position, ttp);
      this.cover_position = level.vertex_position(this.cover_vertex_id);
    }

    const desired_direction = new vector().sub(this.cover_position, this.enemy_random_position);

    if (desired_direction !== null && !vectorCmp(desired_direction, new vector().set(0, 0, 0))) {
      desired_direction.normalize();
      this.object.set_desired_direction(desired_direction);
    }

    this.object.set_path_type(game_object.level_path);
    this.object.set_dest_level_vertex_id(this.cover_vertex_id);

    set_state(this.object, "assault", null, null, null, null);
  },
  execute(): void {
    if (this.cover_position.distance_to_sqr(this.object.position()) <= 0.4) {
      const anim = pickSectionFromCondList(getActor(), this.object, this.state.anim);

      set_state(this.object, anim!, null, null, { look_position: this.enemy_random_position }, null);
    } else {
      this.object.set_dest_level_vertex_id(this.cover_vertex_id);
      set_state(this.object, "assault", null, null, null, null);
    }

    if (this.state.sound_idle !== null) {
      GlobalSound.set_sound_play(this.object.id(), this.state.sound_idle, null, null);
    }

    action_base.execute(this);
  },
  position_reached(): boolean {
    return this.cover_position.distance_to_sqr(this.object.position()) <= 0.4;
  }
} as IActionBaseCover);
