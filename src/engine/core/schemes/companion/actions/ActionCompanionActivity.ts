import { action_base, game_object, level, LuabindClass, time_global, XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { ITargetStateDescriptor } from "@/engine/core/objects/state";
import { setStalkerState } from "@/engine/core/objects/state/StalkerStateManager";
import { ISchemeCompanionState } from "@/engine/core/schemes/companion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { vectorRotateY } from "@/engine/core/utils/physics";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const beh_walk_simple = 0;
const beh_walk_near = 1;
const beh_walk_ignore = 2;
const beh_wait_simple = 3;
const beh_wait_near = 4;
const beh_wait_ignore = 5;

const mt_stand = 0;
const mt_walk = 1;
const mt_run = 2;
const mt_sprint = 3;

const desired_distance = 1;
const min_distance = 1;
const keep_state_min_time = 1000;

const dist_walk = 4;
const dist_run = 20;

const sound_wait = "weather,state";

/**
 * todo;
 */
@LuabindClass()
export class ActionCompanionActivity extends action_base {
  public state: ISchemeCompanionState;

  public assist_point: Optional<number> = null;
  public keep_state_until: number = 0;
  public last_state: string = "guard_na";

  /**
   * todo: Description.
   */
  public constructor(storage: ISchemeCompanionState) {
    super(null, ActionCompanionActivity.__name);
    this.state = storage;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();
    this.object.enable_talk();

    this.assist_point = null;
    this.last_state = "guard_na";

    setStalkerState(this.object, this.last_state, null, null, null, { animation: true });

    this.keep_state_until = time_global();
  }

  /**
   * todo: Description.
   */
  public beh_walk_simple(): void {
    const actor: Optional<XR_game_object> = registry.actor;
    let select_new_pt: boolean = false;
    const dist_from_self_to_actor: number = this.object.position().distance_to(actor.position());
    const dist_from_assist_pt_to_actor: Optional<number> = this.assist_point
      ? level.vertex_position(this.assist_point).distance_to(actor.position())
      : null;

    if (
      dist_from_self_to_actor >= desired_distance &&
      (!dist_from_assist_pt_to_actor || dist_from_assist_pt_to_actor >= desired_distance * 2)
    ) {
      select_new_pt = true;
    }

    if (select_new_pt) {
      this.assist_point = select_position(this.object, this.state);
      if (!this.assist_point) {
        return;
      }
    } else if (!this.assist_point) {
      return;
    }

    this.object.set_path_type(game_object.level_path);
    this.object.set_dest_level_vertex_id(this.assist_point);

    const dist_to_assist_pt = level.vertex_position(this.assist_point).distance_to(this.object.position());
    let new_state: Optional<string> = null;
    let target: Optional<ITargetStateDescriptor> = null;

    if (this.object.level_vertex_id() === this.assist_point) {
      new_state = "threat";
      target = { look_object: registry.actor, look_position: null };
    } else {
      const t = time_global();

      if (t >= this.keep_state_until) {
        this.keep_state_until = t + keep_state_min_time;

        if (dist_to_assist_pt <= dist_walk) {
          new_state = "raid";
          target = { look_object: registry.actor, look_position: null };
        } else if (dist_to_assist_pt <= dist_run) {
          new_state = "rush";
        } else {
          new_state = "assault";
        }
      }
    }

    if (new_state !== null && new_state !== this.last_state) {
      setStalkerState(this.object, new_state, null, null, target, { animation: true });
      this.last_state = new_state;
    }

    // -- 4. ���� ����� �� ����� - ���� ������� � ������ �����
    // --    GlobalSound:set_sound(this.object, sound_wait)
  }

  /**
   * todo: Description.
   */
  public beh_wait_simple(): void {
    const new_state = "threat";

    if (new_state !== this.last_state) {
      setStalkerState(
        this.object,
        new_state,
        null,
        null,
        { look_object: registry.actor, look_position: null },
        { animation: true }
      );
      this.last_state = new_state;
    }

    // -- 4. ���� ����� �� ����� - ���� ������� � ������ �����
    // --    GlobalSound:set_sound(this.object, sound_wait)
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    if (this.state.behavior === beh_walk_simple) {
      this.beh_walk_simple();
    } else if (this.state.behavior === beh_wait_simple) {
      this.beh_wait_simple();
    }
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    super.finalize();
  }
}

/**
 * todo;
 */
function select_position(object: XR_game_object, state: ISchemeCompanionState) {
  let node_1_vertex_id = null;
  let node_1_distance = null;
  let node_2_vertex_id = null;
  let node_2_distance = null;
  const actor = registry.actor;

  let desired_direction = vectorRotateY(actor.direction(), math.random(50, 60));

  node_1_vertex_id = level.vertex_in_direction(actor.level_vertex_id(), desired_direction, desired_distance);

  if (object.accessible(node_1_vertex_id) !== true || node_1_vertex_id === actor.level_vertex_id()) {
    node_1_vertex_id = null;
  }

  desired_direction = vectorRotateY(actor.direction(), -math.random(50, 60));
  node_2_vertex_id = level.vertex_in_direction(actor.level_vertex_id(), desired_direction, desired_distance);

  if (object.accessible(node_2_vertex_id) !== true || node_2_vertex_id === actor.level_vertex_id()) {
    node_2_vertex_id = null;
  }

  if (node_1_vertex_id !== null) {
    node_1_distance = object.position().distance_to_sqr(level.vertex_position(node_1_vertex_id));
  } else {
    node_1_distance = -1;
  }

  if (node_2_vertex_id !== null) {
    node_2_distance = object.position().distance_to_sqr(level.vertex_position(node_2_vertex_id));
  } else {
    node_2_distance = -1;
  }

  if (node_1_distance === -1 && node_2_distance === -1) {
    return null;
  }

  if (node_1_distance === -1) {
    return node_2_vertex_id;
  }

  if (node_2_distance === -1) {
    return node_1_vertex_id;
  }

  if (node_1_distance < node_2_distance) {
    return node_1_vertex_id;
  } else {
    return node_2_vertex_id;
  }
}
