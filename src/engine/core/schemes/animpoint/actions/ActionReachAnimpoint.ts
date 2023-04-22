import { action_base, game_object, LuabindClass } from "xray16";

import { setStalkerState } from "@/engine/core/database";
import { ISchemeAnimpointState } from "@/engine/core/schemes/animpoint/ISchemeAnimpointState";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action with animation scenario logics.
 * Usually performed with movement to some position.
 */
@LuabindClass()
export class ActionReachAnimpoint extends action_base {
  public readonly state: ISchemeAnimpointState;

  public constructor(state: ISchemeAnimpointState) {
    super(null, ActionReachAnimpoint.__name);
    this.state = state;
  }

  /**
   * Recalculate position on initialization.
   */
  public override initialize(): void {
    super.initialize();
    this.state.animpoint!.calculatePosition();
  }

  /**
   * Update state on reach target animation.
   */
  public override execute(): void {
    super.execute();

    this.object.set_dest_level_vertex_id(this.state.animpoint!.position_vertex!);
    this.object.set_desired_direction(this.state.animpoint!.smart_direction!);
    this.object.set_path_type(game_object.level_path);

    const isDistanceReached: boolean =
      this.object.position().distance_to_sqr(this.state.animpoint!.vertex_position!) <= this.state.reach_distance;

    if (isDistanceReached) {
      setStalkerState(this.object, this.state.reach_movement, null, null, {
        look_position: this.state.animpoint!.look_position,
        look_object: null,
      });
    } else {
      setStalkerState(this.object, this.state.reach_movement);
    }
  }
}
