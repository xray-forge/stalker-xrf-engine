import { action_base, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { sendToNearestAccessibleVertex } from "@/engine/core/utils/position";
import { GameObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionSmartCoverExit extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionSmartCoverExit.__name);
    this.stateManager = stateManager;
  }

  /**
   * Exist from smart cover and find nearest vertex to travel to.
   */
  public override initialize(): void {
    logger.format("Exist smart cover: %s", this.object.name());

    super.initialize();

    const object: GameObject = this.object;

    object.set_smart_cover_target();
    object.use_smart_covers_only(false);
    object.set_smart_cover_target_selector();

    sendToNearestAccessibleVertex(object, object.level_vertex_id());
  }
}
