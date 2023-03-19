import { action_base, CSightParams, level, look, LuabindClass, vector, XR_vector } from "xray16";

import { look_at_object, look_object_type } from "@/engine/core/objects/state/direction/StateManagerDirection";
import { states } from "@/engine/core/objects/state/lib/state_lib";
import { StateManager } from "@/engine/core/objects/state/StateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { vectorCmp } from "@/engine/core/utils/physics";
import { gameConfig } from "@/engine/lib/configs/GameConfig";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActDirectionTurn",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActDirectionTurn extends action_base {
  public readonly stateManager: StateManager;

  /**
   * todo;
   */
  public constructor(st: StateManager) {
    super(null, StateManagerActDirectionTurn.__name);

    this.stateManager = st;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();
    this.turn();
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();
    this.turn();
  }

  /**
   * todo;
   */
  public override finalize(): void {
    super.finalize();
  }

  /**
   * todo;
   */
  public turn(): void {
    this.stateManager.point_obj_dir = look_object_type(this.object, this.stateManager);

    if (
      this.stateManager.look_object !== null &&
      level.object_by_id(this.stateManager.look_object as number) !== null
    ) {
      look_at_object(this.object, this.stateManager);
    } else if (this.stateManager.look_position !== null) {
      if (states.get(this.stateManager.target_state).direction) {
        this.object.set_sight(CSightParams.eSightTypeAnimationDirection, false, false);

        return;
      }

      const objectPosition: XR_vector = this.object.position();
      let dir: XR_vector = new vector().sub(this.stateManager.look_position!, objectPosition);

      if (this.stateManager.point_obj_dir === true) {
        dir.y = 0;
      }

      dir.normalize();

      if (vectorCmp(dir, new vector().set(0, 0, 0))) {
        const objectDirection: XR_vector = this.object.direction();

        this.stateManager.look_position = new vector().set(
          objectPosition.x + objectDirection.x,
          objectPosition.y + objectDirection.y,
          objectPosition.z + objectDirection.z
        );
        dir = this.object.direction();
      }

      this.object.set_sight(look.direction, dir, true);
    }
  }
}
