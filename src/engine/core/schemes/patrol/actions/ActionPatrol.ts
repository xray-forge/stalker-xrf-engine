import { action_base, LuabindClass, time_global } from "xray16";

import { registry, setStalkerState } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/state";
import { StalkerMoveManager } from "@/engine/core/objects/state/StalkerMoveManager";
import { ISchemePatrolState } from "@/engine/core/schemes/patrol";
import { LuaLogger } from "@/engine/core/utils/logging";
import { sendToNearestAccessibleVertex } from "@/engine/core/utils/object";
import { parsePathWaypoints } from "@/engine/core/utils/parse";
import { areSameVectors, createEmptyVector, createVector } from "@/engine/core/utils/vector";
import { ClientObject, EClientObjectPath, TDistance, TNumberId, TTimestamp, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionPatrol extends action_base {
  public readonly state: ISchemePatrolState;
  public readonly moveManager: StalkerMoveManager;

  public l_vid: TNumberId = -1;
  public dist: TDistance = 0;
  public dir: Vector = createVector(0, 0, 1);
  public cur_state: EStalkerState = "cur_state" as unknown as EStalkerState; // todo: probably get rid
  public on_point: boolean = false;
  public time_to_update: TTimestamp = time_global() + 1000;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemePatrolState, object: ClientObject) {
    super(null, ActionPatrol.__name);
    this.state = state;
    this.moveManager = registry.objects.get(object.id()).moveManager!;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.on_point = false;
  }

  /**
   * todo: Description.
   */
  public activateScheme(): void {
    this.state.signals = new LuaTable();

    if (this.state.path_walk_info === null) {
      this.state.path_walk_info = parsePathWaypoints(this.state.path_walk);
    }

    if (this.state.path_look_info === null) {
      this.state.path_look_info = parsePathWaypoints(this.state.path_look);
    }

    this.moveManager.reset(
      this.state.path_walk,
      this.state.path_walk_info!,
      this.state.path_look,
      this.state.path_look_info,
      this.state.team,
      this.state.suggested_state,
      { obj: this, func: this.formation_callback },
      null,
      null,
      null
    );
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    if (this.time_to_update - time_global() > 0) {
      return;
    }

    this.time_to_update = time_global() + 1000;

    const [l_vid, dir, cur_state] = registry.patrols.generic.get(this.state.patrol_key).get_npc_command(this.object);

    this.l_vid = l_vid;
    this.dir = dir;
    this.cur_state = cur_state;

    this.l_vid = sendToNearestAccessibleVertex(this.object, this.l_vid);

    const desiredDirection: Vector = this.dir;

    if (desiredDirection !== null && !areSameVectors(desiredDirection, createEmptyVector())) {
      desiredDirection.normalize();
      this.object.set_desired_direction(desiredDirection);
    }

    this.object.set_path_type(EClientObjectPath.LEVEL_PATH);

    setStalkerState(this.object, this.cur_state, null, null, null, null);
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    if (this.object.alive()) {
      this.moveManager.finalize();
    }

    super.finalize();
  }

  /**
   * todo: Description.
   */
  public formation_callback(mode: number, number: number, index: number): void {}

  /**
   * todo: Description.
   */
  public death_callback(npc: ClientObject): void {
    registry.patrols.generic.get(this.state.patrol_key).remove_npc(npc);
  }

  /**
   * todo: Description.
   */
  public deactivate(npc: ClientObject): void {
    registry.patrols.generic.get(this.state.patrol_key).remove_npc(npc);
  }

  /**
   * todo: Description.
   */
  public net_destroy(npc: ClientObject): void {
    this.deactivate(npc);
  }
}
