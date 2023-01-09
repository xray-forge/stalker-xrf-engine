import { action_base, anim, move, XR_action_base } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger(
  "StateManagerActBodyStateStandingFree",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerActBodyStateStandingFree extends XR_action_base {
  st: StateManager;
}

export const StateManagerActBodyStateStandingFree: IStateManagerActBodyStateStandingFree = declare_xr_class(
  "StateManagerActBodyStateStandingFree",
  action_base,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);
      this.object.set_body_state(move.standing);
      this.object.set_mental_state(anim.free);
    },
    execute(): void {
      log.info("Act body state standing free");
      action_base.execute(this);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActBodyStateStandingFree
);
