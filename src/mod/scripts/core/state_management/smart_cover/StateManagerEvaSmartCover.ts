import { property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerEvaSmartCover",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerEvaSmartCover extends property_evaluator {
  private readonly stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaSmartCover.__name);
    this.stateManager = stateManager;
  }

  public evaluate(): boolean {
    if (this.stateManager.target_state !== "smartcover") {
      return true;
    }

    const stateDescription: any = registry.objects.get(this.object.id())["smartcover"];
    const destinationSmartCoverName: Optional<string> = this.object.get_dest_smart_cover_name();

    if (stateDescription === null) {
      return true;
    }

    return destinationSmartCoverName === (stateDescription.cover_name || "");
  }
}
