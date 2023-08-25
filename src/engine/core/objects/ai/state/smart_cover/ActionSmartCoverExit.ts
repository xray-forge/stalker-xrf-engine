import { action_base, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { sendToNearestAccessibleVertex } from "@/engine/core/utils/object";
import { ClientObject } from "@/engine/lib/types";

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
   * Exist from samrt cover and find nearest vertext to travel to.
   */
  public override initialize(): void {
    logger.info("Exist smart cover:", this.object.name());

    super.initialize();

    const object: ClientObject = this.object;

    object.set_smart_cover_target();
    object.use_smart_covers_only(false);
    object.set_smart_cover_target_selector();

    sendToNearestAccessibleVertex(object, object.level_vertex_id());
  }
}
