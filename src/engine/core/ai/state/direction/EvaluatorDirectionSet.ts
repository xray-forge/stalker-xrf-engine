import { CSightParams, LuabindClass, property_evaluator } from "xray16";
import { TSightType, Vector } from "xray16/alias";
import { AnyCallable, areSameVectorsByPrecision, subVectors } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/animation/types";

/**
 * Evaluator checking whether the object is already looking in the direction required by the current target state.
 */
@LuabindClass()
export class EvaluatorDirectionSet extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorDirectionSet.__name);
    this.stateManager = stateManager;
  }

  /**
   * Evaluate whether the object sight already matches the look object or position requested by the state manager.
   *
   * @returns Whether the desired look direction is already set.
   */
  public override evaluate(): boolean {
    const manager: StalkerStateManager = this.stateManager;

    if (manager.targetState === EStalkerState.SMART_COVER) {
      return true;
    }

    const objectSightType: CSightParams = this.object.sight_params();

    if (manager.lookObjectId) {
      if (
        $isNil(objectSightType.m_object) ||
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

    if ($isNotNil(objectSightType.m_object)) {
      return false;
    } else if (objectSightType.m_sight_type !== manager.getObjectLookPositionType()) {
      return false;
    } else {
      this.onTurnEnd();

      return true;
    }
  }

  /**
   * Invoke and clear the registered turn-end callback once the required look direction is reached.
   */
  public onTurnEnd(): void {
    if (this.stateManager.callback?.turnEndCallback) {
      (this.stateManager.callback.turnEndCallback as AnyCallable)(this.stateManager.callback.context);

      if ($isNotNil(this.stateManager.callback)) {
        this.stateManager.callback.turnEndCallback = null;
      }
    }
  }
}
