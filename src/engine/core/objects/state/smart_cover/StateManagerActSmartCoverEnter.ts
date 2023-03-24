import { action_base, LuabindClass, move } from "xray16";

import { registry } from "@/engine/core/database";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/smartcover";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { EScheme } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActSmartCoverEnter",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActSmartCoverEnter extends action_base {
  public readonly stateManager: StalkerStateManager;

  /**
   * todo: Description.
   */
  public constructor(stateManager: StalkerStateManager) {
    super(null, StateManagerActSmartCoverEnter.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    const smartCoverState: ISchemeSmartCoverState = registry.objects.get(this.object.id())[
      EScheme.SMARTCOVER
    ] as ISchemeSmartCoverState;

    this.object.use_smart_covers_only(true);
    this.object.set_movement_type(move.run);
    this.object.set_dest_smart_cover(smartCoverState.cover_name as string);

    if (smartCoverState.loophole_name !== null) {
      this.object.set_dest_loophole(smartCoverState.loophole_name);
    }
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    super.finalize();
  }
}
