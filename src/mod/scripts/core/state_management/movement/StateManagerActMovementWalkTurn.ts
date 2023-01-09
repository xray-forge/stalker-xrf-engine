import { action_base, move, XR_action_base } from "xray16";

import { turn } from "@/mod/scripts/core/state_management/direction/StateManagerDirection";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerActMovementWalkTurn extends XR_action_base {
  st: StateManager;
}

export const StateManagerActMovementWalkTurn: IStateManagerActMovementWalkTurn = declare_xr_class(
  "StateManagerActMovementWalkTurn",
  action_base,
  {
    __init(name: string, st: StateManager) {
      xr_class_super(null, name);
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
      action_base.execute(this);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActMovementWalkTurn
);
