import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { storage } from "@/mod/scripts/core/db";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("StateManagerEvaSmartCover", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export interface IStateManagerEvaSmartCover extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaSmartCover: IStateManagerEvaSmartCover = declare_xr_class(
  "StateManagerEvaSmartCover",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      if (this.st.target_state !== "smartcover") {
        return true;
      }

      const state_descr: any = storage.get(this.object.id())["smartcover"];
      const dest_smart_cover_name: Optional<string> = this.object.get_dest_smart_cover_name();

      // -- printf("SC %s [%s] [%s]", tostring(dest_smart_cover_name == (state_descr.smartcover_name or "")),
      // -- tostring(dest_smart_cover_name), tostring((state_descr.smartcover_name or "")))
      if (state_descr === null) {
        return true;
      }

      return dest_smart_cover_name === (state_descr.cover_name || "");
    }
  } as IStateManagerEvaSmartCover
);
