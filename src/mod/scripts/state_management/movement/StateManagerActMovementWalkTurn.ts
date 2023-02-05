import { action_base, move, property_evaluator, XR_action_base } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { turn } from "@/mod/scripts/state_management/direction/StateManagerDirection";
import { StateManager } from "@/mod/scripts/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActMovementWalkTurn",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerActMovementWalkTurn extends XR_action_base {
  st: StateManager;
}

export const StateManagerActMovementWalkTurn: IStateManagerActMovementWalkTurn = declare_xr_class(
  "StateManagerActMovementWalkTurn",
  action_base,
  {
    __init(name: string, st: StateManager) {
      action_base.__init(this, null, name);

      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);
      // --printf("MOVEMENT TYPE IS --- %s setting MOVEMENT TYPE --- WALK", tostring(this.object:movement_type()))
      this.object.set_movement_type(move.walk);
      // --    printf("ENABLING MOVEMENT !!!!!")
      // --'this.object:movement_enabled(true)
      // --printf("MOVEMENT TYPE IS --- %s setting MOVEMENT TYPE --- WALK", tostring(this.object:movement_type()))
      turn(this.object, this.st);
    },
    execute(): void {
      logger.info("Act movement walk turn");
      action_base.execute(this);
    },
    finalize(): void {
      action_base.finalize(this);
    },
  } as IStateManagerActMovementWalkTurn
);
