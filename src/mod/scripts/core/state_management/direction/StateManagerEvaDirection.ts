import { CSightParams, property_evaluator, TXR_SightType, vector, XR_CSightParams, XR_vector } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import {
  look_object_type,
  look_position_type,
} from "@/mod/scripts/core/state_management/direction/StateManagerDirection";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { vectorCmpPrec } from "@/mod/scripts/utils/physics";

const logger: LuaLogger = new LuaLogger("StateManagerEvaDirection", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerEvaDirection extends property_evaluator {
  public stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaDirection.__name);

    this.stateManager = stateManager;
  }

  public evaluate(): boolean {
    if (this.stateManager.target_state === "smartcover") {
      return true;
    }

    const sight_type: XR_CSightParams = this.object.sight_params();

    if (this.stateManager.look_object !== null) {
      if (
        sight_type.m_object === null ||
        sight_type.m_object.id() !== this.stateManager.look_object ||
        this.stateManager.point_obj_dir !== look_object_type(this.object, this.stateManager)
      ) {
        return false;
      }

      this.callback();

      return true;
    }

    if (this.stateManager.look_position !== null) {
      if (sight_type.m_sight_type !== look_position_type(this.object, this.stateManager)) {
        return false;
      } else if ((sight_type.m_sight_type as TXR_SightType) === CSightParams.eSightTypeAnimationDirection) {
        return true;
      }

      const dir: XR_vector = new vector().sub(this.stateManager.look_position!, this.object.position());

      if (look_object_type(this.object, this.stateManager)) {
        dir.y = 0;
      }

      dir.normalize();

      if (!vectorCmpPrec(sight_type.m_vector, dir, 0.01)) {
        // --printf("%s false vector", this.object:name())
        // --printf("%s %s %s", sight_type.m_vector.x, sight_type.m_vector.y, sight_type.m_vector.z)
        // --printf("%s %s %s", dir.x, dir.y, dir.z)
        return false;
      }

      this.callback();

      return true;
    }

    if (sight_type.m_object !== null) {
      return false;
    }

    if (sight_type.m_sight_type !== look_position_type(this.object, this.stateManager)) {
      return false;
    }

    this.callback();

    return true;
  }

  public callback(): void {
    if (this.stateManager.callback !== null && this.stateManager.callback.turn_end_func !== null) {
      this.stateManager.callback.turn_end_func(this.stateManager.callback.obj);

      if (this.stateManager.callback !== null) {
        this.stateManager.callback.turn_end_func = null;
      }
    }
  }
}
