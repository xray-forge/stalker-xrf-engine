import { action_base, CSightParams, level, look, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { states } from "@/engine/core/objects/state_lib/state_lib";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areSameVectors, createEmptyVector, createVector, subVectors } from "@/engine/core/utils/vector";
import { Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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
    this.stateManager.isObjectPointDirectionLook = this.stateManager.getLookObjectType();

    if (this.stateManager.lookObjectId !== null && level.object_by_id(this.stateManager.lookObjectId) !== null) {
      this.stateManager.lookAtObject();
    } else if (this.stateManager.lookPosition !== null) {
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

      if (areSameVectors(direction, createEmptyVector())) {
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
