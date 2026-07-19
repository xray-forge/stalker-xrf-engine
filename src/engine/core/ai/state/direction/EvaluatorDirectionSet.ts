import { CSightParams, LuabindClass, property_evaluator } from "xray16";
import { TSightType, Vector } from "xray16/alias";
import { AnyCallable, areSameVectorsByPrecision, createEmptyVector } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStalkerState } from "@/engine/core/animation/types";

/**
 * Evaluator checking whether the object is already looking in the direction required by the current target state.
 */
@LuabindClass()
export class EvaluatorDirectionSet extends property_evaluator {
  private readonly controller: StalkerStateController;
  private readonly direction: Vector = createEmptyVector();

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorDirectionSet.__name);
    this.controller = controller;
  }

  /**
   * Evaluate whether the object sight already matches the look object or position requested by the state controller.
   *
   * @returns Whether the desired look direction is already set.
   */
  public override evaluate(): boolean {
    const controller: StalkerStateController = this.controller;

    if (controller.targetState === EStalkerState.SMART_COVER) {
      return true;
    }

    const objectSightType: CSightParams = this.object.sight_params();

    if (controller.lookObjectId) {
      if (
        $isNil(objectSightType.m_object) ||
        objectSightType.m_object.id() !== controller.lookObjectId ||
        controller.isObjectPointDirectionLook !== controller.isLookObjectType()
      ) {
        return false;
      }

      this.onTurnEnd();

      return true;
    }

    if (controller.lookPosition) {
      if (objectSightType.m_sight_type !== controller.getObjectLookPositionType()) {
        return false;
      } else if ((objectSightType.m_sight_type as TSightType) === CSightParams.eSightTypeAnimationDirection) {
        return true;
      }

      const direction: Vector = this.direction.sub(controller.lookPosition!, this.object.position());

      if (controller.isLookObjectType()) {
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
    } else if (objectSightType.m_sight_type !== controller.getObjectLookPositionType()) {
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
    if (this.controller.callback?.turnEndCallback) {
      (this.controller.callback.turnEndCallback as AnyCallable)(this.controller.callback.context);

      if ($isNotNil(this.controller.callback)) {
        this.controller.callback.turnEndCallback = null;
      }
    }
  }
}
