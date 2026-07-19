import type { Vector } from "xray16/alias";
import type { LuaArray, Nillable, StringNillable, TName, TNumberId, TStringId } from "xray16/lib";

import type { IConfigSwitchCondition } from "@/engine/core/ini";
import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

/**
 * Remark scheme state.
 */
export interface ISchemeRemarkState extends IBaseSchemeState {
  sndAnimSync: boolean;
  snd: Nillable<TName>;
  anim: LuaArray<IConfigSwitchCondition>;
  tipsId: TStringId;
  sender: Nillable<TStringId>;
  target: StringNillable;
  targetId: Nillable<TNumberId>;
  targetPosition: Nillable<Vector>;
  targetInit: Nillable<boolean>;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.REMARK]: ISchemeRemarkState;
  }
}
