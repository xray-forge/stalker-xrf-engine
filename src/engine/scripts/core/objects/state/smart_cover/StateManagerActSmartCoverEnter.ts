import { action_base, LuabindClass, move } from "xray16";

import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { EScheme } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";
import { StateManager } from "@/engine/scripts/core/objects/state/StateManager";
import { ISchemeSmartCoverState } from "@/engine/scripts/core/schemes/smartcover";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActSmartCoverEnter",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActSmartCoverEnter extends action_base {
  public readonly stateManager: StateManager;

  /**
   * todo;
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerActSmartCoverEnter.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo;
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
   * todo;
   */
  public override execute(): void {
    super.execute();
  }

  /**
   * todo;
   */
  public override finalize(): void {
    super.finalize();
  }
}
