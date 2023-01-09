import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger(
  "StateManagerEvaWeaponNoneNow",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerEvaWeaponNoneNow extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaWeaponNoneNow: IStateManagerEvaWeaponNoneNow = declare_xr_class(
  "StateManagerEvaWeaponNoneNow",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      return this.object.active_item() === null;
    }
  } as IStateManagerEvaWeaponNoneNow
);
