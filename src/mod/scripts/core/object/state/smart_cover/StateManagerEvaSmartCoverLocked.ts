import { LuabindClass, property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { EScheme, Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { StateManager } from "@/mod/scripts/core/object/state/StateManager";
import { ISchemeSmartCoverState } from "@/mod/scripts/core/scheme/smartcover";
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

  /**
   * todo;
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaSmartCoverLocked.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    const smartCoverState: Optional<ISchemeSmartCoverState> = registry.objects.get(this.object.id())[
      EScheme.SMARTCOVER
    ] as ISchemeSmartCoverState;

    if (smartCoverState === null) {
      return false;
    }

    const isSmartCover: boolean = this.object.in_smart_cover();

    return (
      (isSmartCover && smartCoverState.cover_name === null) || (!isSmartCover && smartCoverState.cover_name !== null)
    );
  }
}
