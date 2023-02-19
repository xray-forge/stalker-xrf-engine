import { action_base, anim, property_evaluator, XR_action_base } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActMentalPanic",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerActMentalPanic extends XR_action_base {
  st: StateManager;
}

export const StateManagerActMentalPanic: IStateManagerActMentalPanic = declare_xr_class(
  "StateManagerActMentalPanic",
  action_base,
  {
    __init(name: string, st: StateManager): void {
      action_base.__init(this, null, name);

      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);
      this.object.set_mental_state(anim.panic);
    },
    execute(): void {
      logger.info("Act mental panic");
      action_base.execute(this);
      this.object.set_mental_state(anim.panic);
    },
    finalize(): void {
      action_base.finalize(this);
    },
  } as IStateManagerActMentalPanic
);
