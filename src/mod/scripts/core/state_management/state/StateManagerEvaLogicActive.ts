import { property_evaluator, XR_property_evaluator } from "xray16";

import { Optional } from "@/mod/lib/types";
import { storage } from "@/mod/scripts/core/db";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaLogicActive extends XR_property_evaluator {
  st: StateManager;
  t: Optional<number>;
}

export const StateManagerEvaLogicActive: IStateManagerEvaLogicActive = declare_xr_class(
  "StateManagerEvaLogicActive",
  property_evaluator,
  {
    __init(name: string, state_manager: StateManager): void {
      xr_class_super(null, name);
      this.st = state_manager;
      this.t = null;
    },
    evaluate(): boolean {
      // --printf("evaluator_state_mgr_logic_active [%s] active_section[%s]",
      // self.object:name(), tostring(db.storage[self.object:id()].active_section))
      if (storage.get(this.object.id()).active_section === null) {
        return false;
      }

      return true;
    }
  } as IStateManagerEvaLogicActive
);
