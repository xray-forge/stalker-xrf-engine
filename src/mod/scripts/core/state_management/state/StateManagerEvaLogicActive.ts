import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { registry } from "@/mod/scripts/core/database";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerEvaLogicActive",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerEvaLogicActive extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaLogicActive: IStateManagerEvaLogicActive = declare_xr_class(
  "StateManagerEvaLogicActive",
  property_evaluator,
  {
    __init(name: string, state_manager: StateManager): void {
      property_evaluator.__init(this, null, name);

      this.st = state_manager;
    },
    evaluate(): boolean {
      if (registry.objects.get(this.object.id()).active_section === null) {
        return false;
      }

      return true;
    },
  } as IStateManagerEvaLogicActive
);
