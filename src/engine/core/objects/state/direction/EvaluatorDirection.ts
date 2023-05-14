import {
  CSightParams,
  LuabindClass,
  property_evaluator,
  TXR_SightType,
  vector,
  XR_CSightParams,
  XR_vector,
} from "xray16";

import { EStalkerState } from "@/engine/core/objects/state";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areSameVectorsByPrecision } from "@/engine/core/utils/vector";
import { AnyCallable } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorDirection extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorDirection.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    if (this.stateManager.targetState === EStalkerState.SMART_COVER) {
      return true;
    }

    const objectSightType: XR_CSightParams = this.object.sight_params();

    if (this.stateManager.lookObjectId !== null) {
      if (
        objectSightType.m_object === null ||
        objectSightType.m_object.id() !== this.stateManager.lookObjectId ||
        this.stateManager.isObjectPointDirectionLook !== this.stateManager.getLookObjectType()
      ) {
        return false;
      }

      this.onTurnEnd();

      return true;
    }

    if (this.stateManager.lookPosition !== null) {
      if (objectSightType.m_sight_type !== this.stateManager.getObjectLookPositionType()) {
        return false;
      } else if ((objectSightType.m_sight_type as TXR_SightType) === CSightParams.eSightTypeAnimationDirection) {
        return true;
      }

      const direction: XR_vector = new vector().sub(this.stateManager.lookPosition!, this.object.position());

      if (this.stateManager.getLookObjectType()) {
        direction.y = 0;
      }

      direction.normalize();

      if (!areSameVectorsByPrecision(objectSightType.m_vector, direction, 0.01)) {
        return false;
      }

      this.onTurnEnd();

      return true;
    }

    if (objectSightType.m_object !== null) {
      return false;
    } else if (objectSightType.m_sight_type !== this.stateManager.getObjectLookPositionType()) {
      return false;
    }

    this.onTurnEnd();

    return true;
  }

  /**
   * todo: Description.
   */
  public onTurnEnd(): void {
    if (this.stateManager.callback !== null && this.stateManager.callback.turnEndCallback !== null) {
      (this.stateManager.callback.turnEndCallback as AnyCallable)(this.stateManager.callback.context);

      if (this.stateManager.callback !== null) {
        this.stateManager.callback.turnEndCallback = null;
      }
    }
  }
}
