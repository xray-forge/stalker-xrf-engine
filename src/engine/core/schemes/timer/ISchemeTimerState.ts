import { CUIGameCustom, CUIStatic } from "xray16";

import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { LuaArray, Optional, TCount, TStringId } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeTimerState extends IBaseSchemeState {
  type: string;
  start_value: TCount;
  on_value: Optional<LuaArray<any>>;
  timer_id: TStringId;
  string: Optional<string>;
  ui: CUIGameCustom;
  timer: CUIStatic;
}
