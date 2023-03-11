import {
  action_base,
  alife,
  anim,
  clsid,
  game_object,
  level,
  look,
  LuabindClass,
  move,
  object,
  time_global,
  vector,
  XR_game_object,
  XR_vector,
} from "xray16";

import { registry } from "@/mod/scripts/core/database";
import { getSimulationObjectsRegistry } from "@/mod/scripts/core/database/SimulationObjectsRegistry";
import { SurgeManager } from "@/mod/scripts/core/managers/SurgeManager";
import { Actor } from "@/mod/scripts/core/objects/alife/Actor";
import { SmartTerrain } from "@/mod/scripts/core/objects/alife/smart/SmartTerrain";
import { Squad } from "@/mod/scripts/core/objects/alife/Squad";
import { ReachTaskPatrolManager } from "@/mod/scripts/core/schemes/reach_task/ReachTaskPatrolManager";
import { getObjectSquad, sendToNearestAccessibleVertex } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { vectorCmp } from "@/mod/scripts/utils/physics";

const logger: LuaLogger = new LuaLogger("ActionReachTaskLocation");

/**
 * todo;
 */
@LuabindClass()
export class ActionReachTaskLocation extends action_base {
  // todo: Verify if init is called only once. IF so, move everything to fields assign.

  public target_id!: number;
  public squad_id!: number;
  public cur_state!: string;
  public formation!: string;
  public l_vid!: number;
  public dist!: number;
  public dir!: XR_vector;
  public on_point!: boolean;
  public was_reset!: boolean;
  public time_to_update!: number;

  /**
   * todo;
   */
  public constructor() {
    super(null, ActionReachTaskLocation.__name);
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();

    const squad: Squad = getObjectSquad(this.object)!;

    this.target_id = squad.assigned_target_id!;
    this.squad_id = squad.id;
    this.cur_state = "patrol";
    this.formation = "back";
    this.l_vid = -1;
    this.dist = 0;
    this.dir = new vector().set(0, 0, 1);
    this.on_point = false;
    this.was_reset = false;
    this.time_to_update = time_global() + 1000;

    this.object.set_desired_direction();
    this.object.set_movement_selection_type(game_object.alifeMovementTypeMask);
    this.object.set_item(object.idle, this.object.best_weapon());
    this.object.set_body_state(move.standing);
    this.object.set_detail_path_type(move.line);
    this.object.set_mental_state(anim.free);
    this.object.set_movement_type(move.walk);

    const squad_target = alife().object(this.target_id)!;

    this.object.set_dest_game_vertex_id(squad_target.m_game_vertex_id);
    this.object.set_path_type(game_object.game_path);
    this.object.inactualize_patrol_path();
    this.object.set_sight(look.path_dir, null, 0);

    ReachTaskPatrolManager.add_to_reach_patrol(this.object, this.target_id);
  }

  /**
   * todo;
   */
  public override execute(): void {
    if (this.object.id() === getObjectSquad(this.object)!.commander_id()) {
      this.commander_execute();
    } else {
      this.soldier_execute();
    }

    super.execute();
  }

  /**
   * todo;
   */
  public override finalize(): void {
    this.object.set_movement_selection_type(game_object.alifeMovementTypeRandom);
    super.finalize();
  }

  /**
   * todo;
   */
  public commander_execute(): void {
    const squad = getObjectSquad(this.object)!;
    let squad_target = getSimulationObjectsRegistry().objects.get(squad.assigned_target_id!);

    if (squad_target === null && squad.get_script_target() !== null) {
      squad_target = alife().object(squad.assigned_target_id!)!;
    }

    if (squad_target !== null && !this.object.is_talking()) {
      // eslint-disable-next-line prefer-const
      let [pos, lv_id, gv_id] = squad_target.get_location();

      if (this.object.game_vertex_id() !== gv_id) {
        this.object.set_path_type(game_object.game_path);
        this.object.set_dest_game_vertex_id(gv_id);
        this.object.set_sight(look.path_dir, null, 0);
        update_movement(squad_target, this.object);

        registry.patrols.reachTask
          .get(this.target_id + "_to_" + this.squad_id)
          .set_command(this.object, this.cur_state, this.formation);

        return;
      }

      this.object.set_path_type(game_object.level_path);
      if (!this.object.accessible(pos)) {
        const ttp = new vector().set(0, 0, 0);

        lv_id = this.object.accessible_nearest(pos, ttp);
        pos = level.vertex_position(lv_id);
      }

      this.object.set_sight(look.path_dir, null, 0);
      this.object.set_dest_level_vertex_id(lv_id);
      this.object.set_desired_position(pos);
    }

    update_movement(squad_target, this.object);

    registry.patrols.reachTask
      .get(this.target_id + "_to_" + this.squad_id)
      .set_command(this.object, this.cur_state, this.formation);
  }

  /**
   * todo;
   */
  public soldier_execute(): void {
    if (this.time_to_update! - time_global() > 0) {
      return;
    }

    const squad: Squad = getObjectSquad(this.object)!;
    let squad_target = getSimulationObjectsRegistry().objects.get(squad.assigned_target_id!);

    if (squad_target === null && squad.get_script_target() !== null) {
      squad_target = alife().object(squad.assigned_target_id!)!;
    }

    this.time_to_update = time_global() + 1000;

    const [l_vid, dir, cur_state] = registry.patrols.reachTask
      .get(this.target_id + "_to_" + this.squad_id)
      .get_npc_command(this.object);

    this.l_vid = l_vid;
    this.dir = dir;
    this.cur_state = cur_state!;

    this.l_vid = sendToNearestAccessibleVertex(this.object, this.l_vid);

    const desired_direction: XR_vector = this.dir;

    if (desired_direction !== null && !vectorCmp(desired_direction, new vector().set(0, 0, 0))) {
      desired_direction.normalize();
      this.object.set_desired_direction(desired_direction);
    }

    this.object.set_path_type(game_object.level_path);

    if (
      squad_target === null ||
      squad_target.clsid() === clsid.online_offline_group_s ||
      SurgeManager.getInstance().isStarted
    ) {
      this.object.set_movement_type(level.object_by_id(squad.commander_id())!.movement_type());
      this.object.set_mental_state(level.object_by_id(squad.commander_id())!.mental_state());

      return;
    }

    if (level.object_by_id(getObjectSquad(this.object)!.commander_id())!.movement_type() === move.stand) {
      this.object.set_movement_type(move.stand);

      return;
    }

    if (level.vertex_position(this.l_vid).distance_to(this.object.position()) > 5) {
      this.object.set_movement_type(move.run);
    } else {
      this.object.set_movement_type(move.walk);
    }
  }

  /**
   * todo;
   */
  public death_callback(object: XR_game_object): void {
    if (this.target_id !== null) {
      registry.patrols.reachTask.get(this.target_id + "_to_" + this.squad_id).remove_npc(object);
    }
  }

  /**
   * todo;
   */
  public net_destroy(object: XR_game_object): void {
    if (this.target_id !== null) {
      registry.patrols.reachTask.get(this.target_id + "_to_" + this.squad_id).remove_npc(object);
    }
  }
}

/**
 * todo;
 */
function update_movement(target: Actor | Squad | SmartTerrain, object: XR_game_object): void {
  if (target !== null && !object.is_talking()) {
    if (SurgeManager.getInstance().isStarted) {
      object.set_movement_type(move.run);
      object.set_mental_state(anim.free);

      return;
    }

    if (target.clsid() === clsid.online_offline_group_s) {
      object.set_movement_type(move.run);
      if (target.position.distance_to_sqr(object.position()) <= 10_000) {
        object.set_mental_state(anim.danger);
      } else {
        object.set_mental_state(anim.free);
      }
    } else {
      object.set_movement_type(move.walk);
      object.set_mental_state(anim.free);
    }
  } else {
    object.set_movement_type(move.stand);
  }
}
