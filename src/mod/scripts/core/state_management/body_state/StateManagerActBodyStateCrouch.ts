import { action_base, move, XR_action_base } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger(
  "StateManagerActBodyStateCrouch",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerActBodyStateCrouch extends XR_action_base {
  st: StateManager;
}

export const StateManagerActBodyStateCrouch: IStateManagerActBodyStateCrouch = declare_xr_class(
  "StateManagerActBodyStateCrouch",
  action_base,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);
      this.object.set_body_state(move.crouch);
    },
    execute(): void {
      log.info("Act body state crouch");
      action_base.execute(this);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActBodyStateCrouch
);
