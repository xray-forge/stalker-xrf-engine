import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import { StateManager } from "@/engine/core/objects/state/StateManager";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/smartcover";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { EScheme, Optional, TName } from "@/engine/lib/types";

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

  /**
   * todo;
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaSmartCover.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    if (this.stateManager.target_state !== EScheme.SMARTCOVER) {
      return true;
    }

    const stateDescription: Optional<ISchemeSmartCoverState> = registry.objects.get(this.object.id())[
      EScheme.SMARTCOVER
    ] as ISchemeSmartCoverState;
    const destinationSmartCoverName: Optional<TName> = this.object.get_dest_smart_cover_name();

    if (stateDescription === null) {
      return true;
    }

    return destinationSmartCoverName === (stateDescription.cover_name || "");
  }
}
