import { action_base, CSightParams, look, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { states } from "@/engine/core/animation/states";
import { registry } from "@/engine/core/database";
import { areSameVectors, createVector, subVectors } from "@/engine/core/utils/vector";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { Vector } from "@/engine/lib/types";

/**
 * Action to change object direction based on state manager.
 */
@LuabindClass()
export class ActionDirectionTurn extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionDirectionTurn.__name);
    this.stateManager = stateManager;
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
   * Perform directional turn based on state manager parameters.
   */
  public turn(): void {
    this.stateManager.isObjectPointDirectionLook = this.stateManager.isLookObjectType();

    if (this.stateManager.lookObjectId && registry.objects.get(this.stateManager.lookObjectId)?.object) {
      this.stateManager.lookAtObject();
    } else if (this.stateManager.lookPosition) {
      if (states.get(this.stateManager.targetState).direction) {
        this.object.set_sight(CSightParams.eSightTypeAnimationDirection, false, false);

        return;
      }

      const objectPosition: Vector = this.object.position();
      let direction: Vector = subVectors(this.stateManager.lookPosition, objectPosition);

      if (this.stateManager.isObjectPointDirectionLook) {
        direction.y = 0;
      }

      direction.normalize();

      if (areSameVectors(direction, ZERO_VECTOR)) {
        const objectDirection: Vector = this.object.direction();

        // todo: just sum vectors?
        this.stateManager.lookPosition = createVector(
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
