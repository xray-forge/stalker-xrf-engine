import { action_base, move, XR_action_base } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { look_position_type } from "@/mod/scripts/core/state_management/direction/StateManagerDirection";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger(
  "StateManagerActMovementRunSearch",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerActMovementRunSearch extends XR_action_base {
  st: StateManager;
}

export const StateManagerActMovementRunSearch: IStateManagerActMovementRunSearch = declare_xr_class(
  "StateManagerActMovementRunSearch",
  action_base,
  {
    __init(name: string, st: StateManager) {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);
      // --printf("MOVEMENT TYPE IS --- %s setting MOVEMENT TYPE --- RUN", tostring(this.object:movement_type()))
      this.object.set_movement_type(move.run);
      // --    printf("ENABLING MOVEMENT !!!!!")
      // --'this.object:movement_enabled(true)
      // --printf("MOVEMENT TYPE IS --- %s setting MOVEMENT TYPE --- RUN", tostring(this.object:movement_type()))
      // printf("SET_SIGHT!!!act_state_mgr_movement_run_search:initialize()")
      this.object.set_sight(look_position_type(this.object, this.st), null, 0);
    },
    execute(): void {
      log.info("Act movement run search");
      action_base.execute(this);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActMovementRunSearch
);
