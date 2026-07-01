import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { IConfigSwitchCondition } from "@/engine/core/utils/ini";
import type { LuaArray, Nillable, StringNillable, TName, TNumberId, TStringId, Vector } from "@/engine/lib/types";

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
