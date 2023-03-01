import { property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerEvaSmartCoverNeed",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerEvaSmartCoverNeed extends property_evaluator {
  public readonly stateManager: IStoredObject;

  public constructor(stateManager: IStoredObject) {
    super(null, StateManagerEvaSmartCoverNeed.__name);
    this.stateManager = stateManager;
  }

  public override evaluate(): boolean {
    if (this.stateManager.target_state !== "smartcover") {
      return false;
    }

    const state_descr: Optional<any> = registry.objects.get(this.object.id())["smartcover"];

    if (state_descr === null) {
      return false;
    }

    return state_descr.cover_name !== null;
  }
}
