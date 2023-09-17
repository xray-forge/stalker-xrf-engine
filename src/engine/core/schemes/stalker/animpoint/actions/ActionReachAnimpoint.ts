import { action_base, LuabindClass } from "xray16";

import { setStalkerState } from "@/engine/core/database";
import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EClientObjectPath } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action with animation scenario logics.
 * Usually performed with movement to some position where actual animpoint should happen.
 */
@LuabindClass()
export class ActionReachAnimpoint extends action_base {
  public readonly state: ISchemeAnimpointState;

  public constructor(state: ISchemeAnimpointState) {
    super(null, ActionReachAnimpoint.__name);
    this.state = state;
  }

  public override initialize(): void {
    super.initialize();
    this.state.animpointManager.calculatePosition();

    logger.info("Starting reach place of animpoint:", this.object.name());
  }

  public override finalize() {
    super.finalize();

    logger.info("Reached place of animpoint:", this.object.name());
  }

  /**
   * Update state on reach target animation.
   * Help object reach destination point to start animation.
   */
  public override execute(): void {
    super.execute();

    // Set destination point to walk.
    this.object.set_dest_level_vertex_id(this.state.animpointManager.positionLevelVertexId!);
    this.object.set_desired_direction(this.state.animpointManager.smartCoverDirection!);
    this.object.set_path_type(EClientObjectPath.LEVEL_PATH);

    const isDistanceReached: boolean =
      this.object.position().distance_to_sqr(this.state.animpointManager.vertexPosition!) <=
      this.state.reachDistanceSqr;

    if (isDistanceReached) {
      // When reached place start looking to where animation should happen.
      setStalkerState(this.object, this.state.reachMovement, null, null, {
        lookPosition: this.state.animpointManager.lookPosition,
        lookObjectId: null,
      });
    } else {
      // Just walk to the place.
      setStalkerState(this.object, this.state.reachMovement);
    }
  }
}
