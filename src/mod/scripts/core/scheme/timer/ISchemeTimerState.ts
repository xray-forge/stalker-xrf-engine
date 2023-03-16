import { XR_CUIGameCustom, XR_CUIStatic } from "xray16";

import { LuaArray, Optional, TCount, TStringId } from "@/mod/lib/types";
import { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";

/**
 * todo;
 */
export interface ISchemeTimerState extends IBaseSchemeState {
  type: string;
  start_value: TCount;
  on_value: Optional<LuaArray<any>>;
  timer_id: TStringId;
  string: Optional<string>;
  ui: XR_CUIGameCustom;
  timer: XR_CUIStatic;
}
