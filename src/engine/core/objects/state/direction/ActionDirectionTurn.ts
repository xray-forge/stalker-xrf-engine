import { action_base, CSightParams, level, look, LuabindClass, vector, XR_vector } from "xray16";

import { look_object_type, lookAtObject } from "@/engine/core/objects/state/direction/StateManagerDirection";
import { states } from "@/engine/core/objects/state/lib/state_lib";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areSameVectors } from "@/engine/core/utils/vector";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionDirectionTurn extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionDirectionTurn.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();
    this.turn();
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();
    this.turn();
  }

  /**
   * todo: Description.
   */
  public turn(): void {
    this.stateManager.point_obj_dir = look_object_type(this.object, this.stateManager);

    if (this.stateManager.look_object !== null && level.object_by_id(this.stateManager.look_object) !== null) {
      lookAtObject(this.object, this.stateManager);
    } else if (this.stateManager.look_position !== null) {
      if (states.get(this.stateManager.target_state).direction) {
        this.object.set_sight(CSightParams.eSightTypeAnimationDirection, false, false);

        return;
      }

      const objectPosition: XR_vector = this.object.position();
      let direction: XR_vector = new vector().sub(this.stateManager.look_position, objectPosition);

      if (this.stateManager.point_obj_dir === true) {
        direction.y = 0;
      }

      direction.normalize();

      if (areSameVectors(direction, new vector().set(0, 0, 0))) {
        const objectDirection: XR_vector = this.object.direction();

        this.stateManager.look_position = new vector().set(
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
