import { action_base, LuabindClass } from "xray16";

import { setStalkerState } from "@/engine/core/database";
import { ISchemeAnimpointState } from "@/engine/core/schemes/animpoint/ISchemeAnimpointState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EClientObjectPath } from "@/engine/lib/types";

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

    this.object.set_dest_level_vertex_id(this.state.animpoint!.positionLevelVertexId!);
    this.object.set_desired_direction(this.state.animpoint!.smartCoverDirection!);
    this.object.set_path_type(EClientObjectPath.LEVEL_PATH);

    const isDistanceReached: boolean =
      this.object.position().distance_to_sqr(this.state.animpoint!.vertexPosition!) <= this.state.reach_distance;

    if (isDistanceReached) {
      setStalkerState(this.object, this.state.reach_movement, null, null, {
        lookPosition: this.state.animpoint!.lookPosition,
        lookObject: null,
      });
    } else {
      setStalkerState(this.object, this.state.reach_movement);
    }
  }
}
