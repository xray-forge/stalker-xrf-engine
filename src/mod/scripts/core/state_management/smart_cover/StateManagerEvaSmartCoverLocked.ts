import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { storage } from "@/mod/scripts/core/db";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger(
  "StateManagerEvaSmartCoverLocked",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerEvaSmartCoverLocked extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaSmartCoverLocked: IStateManagerEvaSmartCoverLocked = declare_xr_class(
  "StateManagerEvaSmartCoverLocked",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      const state_descr: Optional<any> = storage.get(this.object.id())["smartcover"];

      if (state_descr === null) {
        return false;
      }

      const in_smart_cover: boolean = this.object.in_smart_cover();

      return (
        (in_smart_cover && state_descr.cover_name === null) || (!in_smart_cover && state_descr.cover_name !== null)
      );
    }
  } as IStateManagerEvaSmartCoverLocked
);
