import { action_base, move, XR_action_base } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { turn } from "@/mod/scripts/core/state_management/direction/StateManagerDirection";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger(
  "StateManagerActMovementStandTurn",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerActMovementStandTurn extends XR_action_base {
  st: StateManager;
}

export const StateManagerActMovementStandTurn: IStateManagerActMovementStandTurn = declare_xr_class(
  "StateManagerActMovementStandTurn",
  action_base,
  {
    __init(name: string, st: StateManager) {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);
      turn(this.object, this.st);
      // --printf("MOVEMENT TYPE IS --- %s setting MOVEMENT TYPE --- stand", tostring(self.object:movement_type()))
      this.object.set_movement_type(move.stand);
    },
    execute(): void {
      log.info("Act movement stand turn");
      action_base.execute(this);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActMovementStandTurn
);
