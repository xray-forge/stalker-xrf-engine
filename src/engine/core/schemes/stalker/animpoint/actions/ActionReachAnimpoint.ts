import { action_base, LuabindClass } from "xray16";

import { setStalkerState } from "@/engine/core/database";
import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint/animpoint_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EGameObjectPath, GameObject } from "@/engine/lib/types";

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

    logger.info("Starting reach place of animpoint: %s", this.object.name());
  }

  public override finalize() {
    super.finalize();

    logger.info("Reached place of animpoint: %s", this.object.name());
  }

  /**
   * Update state on reach target animation.
   * Help object reach destination point to start animation.
   */
  public override execute(): void {
    super.execute();

    const object: GameObject = this.object;
    const state: ISchemeAnimpointState = this.state;

    // Set destination point to walk.
    object.set_dest_level_vertex_id(state.animpointManager.positionLevelVertexId!);
    object.set_desired_direction(state.animpointManager.smartCoverDirection!);
    object.set_path_type(EGameObjectPath.LEVEL_PATH);

    const isDistanceReached: boolean =
      object.position().distance_to_sqr(state.animpointManager.vertexPosition!) <= state.reachDistanceSqr;

    if (isDistanceReached) {
      // When reached place start looking to where animation should happen.
      setStalkerState(object, state.reachMovement, null, null, {
        lookPosition: state.animpointManager.lookPosition,
      });
    } else {
      // Just walk to the place.
      setStalkerState(object, state.reachMovement);
    }
  }
}
