import { action_base, anim, XR_action_base } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("StateManagerActMentalPanic", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export interface IStateManagerActMentalPanic extends XR_action_base {
  st: StateManager;
}

export const StateManagerActMentalPanic: IStateManagerActMentalPanic = declare_xr_class(
  "StateManagerActMentalPanic",
  action_base,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);
      this.object.set_mental_state(anim.panic);
    },
    execute(): void {
      log.info("Act mental panic");
      action_base.execute(this);
      this.object.set_mental_state(anim.panic);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActMentalPanic
);
