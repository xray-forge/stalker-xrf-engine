import { action_base, LuabindClass } from "xray16";
import { GameObject } from "xray16/alias";
import { $filename } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { LuaLogger } from "@/engine/core/utils/logging";
import { sendToNearestAccessibleVertex } from "@/engine/core/utils/position";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action forcing the object to leave its current smart cover and move to the nearest accessible vertex.
 */
@LuabindClass()
export class ActionSmartCoverExit extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionSmartCoverExit.__name);
    this.controller = controller;
  }

  /**
   * Exist from smart cover and find nearest vertex to travel to.
   */
  public override initialize(): void {
    logger.info("Exist smart cover: %s", this.object.name());

    super.initialize();

    const object: GameObject = this.object;

    object.set_smart_cover_target();
    object.use_smart_covers_only(false);
    object.set_smart_cover_target_selector();

    sendToNearestAccessibleVertex(object, object.level_vertex_id());
  }
}
