import { action_base, move, XR_action_base } from "xray16";

import { look_position_type } from "@/mod/scripts/core/state_management/direction/StateManagerDirection";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerActMovementStandSearch extends XR_action_base {
  st: StateManager;
}

export const StateManagerActMovementStandSearch: IStateManagerActMovementStandSearch = declare_xr_class(
  "StateManagerActMovementStandSearch",
  action_base,
  {
    __init(name: string, st: StateManager) {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);
      // --printf("MOVEMENT TYPE IS --- %s setting MOVEMENT TYPE --- stand", tostring(self.object:movement_type()))
      this.object.set_movement_type(move.stand);
      // printf("SET_SIGHT!!!act_state_mgr_movement_stand_search:initialize()")
      this.object.set_sight(look_position_type(this.object, this.st), null, 0);
    },
    execute(): void {
      action_base.execute(this);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActMovementStandSearch
);
