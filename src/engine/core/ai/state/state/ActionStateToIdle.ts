import { action_base, LuabindClass } from "xray16";
import { EGameObjectPath } from "xray16/alias";
import { TName } from "xray16/lib";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStalkerState } from "@/engine/core/animation/types";
import { sendToNearestAccessibleVertex } from "@/engine/core/utils/position";

/**
 * Switch current state to idle when need cleanup for alife/combat/items loot activity etc.
 */
@LuabindClass()
export class ActionStateToIdle extends action_base {
  private readonly controller: StalkerStateController;
  public readonly name: TName;

  public constructor(controller: StalkerStateController, name?: TName) {
    super(null, name || ActionStateToIdle.__name);
    this.controller = controller;
    this.name = name || ActionStateToIdle.__name;
  }

  /**
   * Starting resetting state to idle for object.
   */
  public override initialize(): void {
    super.initialize();

    this.object.inactualize_patrol_path();
    this.object.set_path_type(EGameObjectPath.LEVEL_PATH);

    sendToNearestAccessibleVertex(this.object, this.object.level_vertex_id());
  }

  /**
   * Rest object state to idle.
   */
  public override execute(): void {
    super.execute();

    // If any animation is active in state controller, reset everything for game object.
    if (this.controller.targetState !== EStalkerState.IDLE) {
      this.object.clear_animations();
      this.controller.setState(EStalkerState.IDLE, null, null, null, { isForced: true });
      this.controller.animationController.setState(null, true);
      this.controller.animationController.setControl();
    }
  }
}
