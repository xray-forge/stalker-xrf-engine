import { action_base, CSightParams, look, LuabindClass } from "xray16";
import { Vector } from "xray16/alias";
import { areSameVectors, createVector, subVectors, ZERO_VECTOR } from "xray16/lib";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";
import { registry } from "@/engine/core/database";

/**
 * Action to change object direction based on state controller.
 */
@LuabindClass()
export class ActionDirectionTurn extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionDirectionTurn.__name);
    this.controller = controller;
  }

  /**
   * Perform direction turn on init.
   */
  public override initialize(): void {
    super.initialize();
    this.turn();
  }

  /**
   * Execute direction turn when action is activated.
   */
  public override execute(): void {
    super.execute();
    this.turn();
  }

  /**
   * Perform directional turn based on state controller parameters.
   */
  public turn(): void {
    this.controller.isObjectPointDirectionLook = this.controller.isLookObjectType();

    if (this.controller.lookObjectId && registry.objects.get(this.controller.lookObjectId)?.object) {
      this.controller.lookAtObject();
    } else if (this.controller.lookPosition) {
      if (states.get(this.controller.targetState).direction) {
        this.object.set_sight(CSightParams.eSightTypeAnimationDirection, false, false);

        return;
      }

      const objectPosition: Vector = this.object.position();
      let direction: Vector = subVectors(this.controller.lookPosition, objectPosition);

      if (this.controller.isObjectPointDirectionLook) {
        direction.y = 0;
      }

      direction.normalize();

      if (areSameVectors(direction, ZERO_VECTOR)) {
        const objectDirection: Vector = this.object.direction();

        // todo: just sum vectors?
        this.controller.lookPosition = createVector(
          objectPosition.x + objectDirection.x,
          objectPosition.y + objectDirection.y,
          objectPosition.z + objectDirection.z
        );
        direction = this.object.direction();
      }

      this.object.set_sight(look.direction, direction, true);
    }
  }
}
