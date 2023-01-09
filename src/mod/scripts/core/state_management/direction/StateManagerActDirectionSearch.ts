import { action_base, CSightParams, XR_action_base } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { look_position_type } from "@/mod/scripts/core/state_management/direction/StateManagerDirection";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger(
  "StateManagerActDirectionSearch",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerActDirectionSearch extends XR_action_base {
  st: StateManager;
}

export const StateManagerActDirectionSearch: IStateManagerActDirectionSearch = declare_xr_class(
  "StateManagerActDirectionSearch",
  action_base,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);

      if (
        states.get(this.st.target_state).direction &&
        states.get(this.st.target_state).direction === CSightParams.eSightTypeAnimationDirection
      ) {
        this.object.set_sight(CSightParams.eSightTypeAnimationDirection, false, false);
      } else {
        this.object.set_sight(look_position_type(this.object, this.st), null, 0);
      }
    },
    execute(): void {
      log.info("Act direction search");
      action_base.execute(this);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActDirectionSearch
);
