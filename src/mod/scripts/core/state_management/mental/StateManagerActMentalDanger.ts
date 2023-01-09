import { action_base, anim, XR_action_base } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("StateManagerActMentalDanger", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export interface IStateManagerActMentalDanger extends XR_action_base {
  st: StateManager;
}

export const StateManagerActMentalDanger: IStateManagerActMentalDanger = declare_xr_class(
  "StateManagerActMentalDanger",
  action_base,
  {
    __init(name: string, st: StateManager) {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);
      this.object.set_mental_state(anim.danger);
    },
    execute(): void {
      log.info("Act mental danger");
      action_base.execute(this);
      this.object.set_mental_state(anim.danger);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActMentalDanger
);
