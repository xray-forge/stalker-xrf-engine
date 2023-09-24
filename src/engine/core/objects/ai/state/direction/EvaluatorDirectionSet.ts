import { CSightParams, LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/objects/animation/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areSameVectorsByPrecision, subVectors } from "@/engine/core/utils/vector";
import { AnyCallable, TSightType, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorDirectionSet extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorDirectionSet.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    const manager: StalkerStateManager = this.stateManager;

    if (manager.targetState === EStalkerState.SMART_COVER) {
      return true;
    }

    const objectSightType: CSightParams = this.object.sight_params();

    if (manager.lookObjectId) {
      if (
        objectSightType.m_object === null ||
        objectSightType.m_object.id() !== manager.lookObjectId ||
        manager.isObjectPointDirectionLook !== manager.isLookObjectType()
      ) {
        return false;
      }

      this.onTurnEnd();

      return true;
    }

    if (manager.lookPosition) {
      if (objectSightType.m_sight_type !== manager.getObjectLookPositionType()) {
        return false;
      } else if ((objectSightType.m_sight_type as TSightType) === CSightParams.eSightTypeAnimationDirection) {
        return true;
      }

      const direction: Vector = subVectors(manager.lookPosition!, this.object.position());

      if (manager.isLookObjectType()) {
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
    } else if (objectSightType.m_sight_type !== manager.getObjectLookPositionType()) {
      return false;
    } else {
      this.onTurnEnd();

      return true;
    }
  }

  /**
   * todo: Description.
   */
  public onTurnEnd(): void {
    if (this.stateManager.callback?.turnEndCallback) {
      (this.stateManager.callback.turnEndCallback as AnyCallable)(this.stateManager.callback.context);

      if (this.stateManager.callback !== null) {
        this.stateManager.callback.turnEndCallback = null;
      }
    }
  }
}
