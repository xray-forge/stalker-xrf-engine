import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger(
  "StateManagerEvaSmartCoverNeed",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerEvaSmartCoverNeed extends XR_property_evaluator {
  st: IStoredObject;
}

export const StateManagerEvaSmartCoverNeed: IStateManagerEvaSmartCoverNeed = declare_xr_class(
  "StateManagerEvaSmartCoverNeed",
  property_evaluator,
  {
    __init(name: string, st: IStoredObject): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      if (this.st.target_state !== "smartcover") {
        return false;
      }

      const state_descr: Optional<any> = storage.get(this.object.id())["smartcover"];

      if (state_descr === null) {
        return false;
      }

      return state_descr.cover_name !== null;
    }
  } as IStateManagerEvaSmartCoverNeed
);
