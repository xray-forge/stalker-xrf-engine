import { property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerEvaSmartCoverLocked",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerEvaSmartCoverLocked extends property_evaluator {
  public readonly stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaSmartCoverLocked.__name);
    this.stateManager = stateManager;
  }

  public override evaluate(): boolean {
    const state_descr: Optional<any> = registry.objects.get(this.object.id())["smartcover"];

    if (state_descr === null) {
      return false;
    }

    const isSmartCover: boolean = this.object.in_smart_cover();

    return (isSmartCover && state_descr.cover_name === null) || (!isSmartCover && state_descr.cover_name !== null);
  }
}
