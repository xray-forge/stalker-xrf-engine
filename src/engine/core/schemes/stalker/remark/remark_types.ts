import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { IConfigSwitchCondition } from "@/engine/core/utils/ini/ini_types";
import type { LuaArray, Optional, StringOptional, TName, TNumberId, TStringId, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeRemarkState extends IBaseSchemeState {
  sndAnimSync: boolean;
  snd: Optional<TName>;
  anim: LuaArray<IConfigSwitchCondition>;
  tipsId: TStringId;
  sender: Optional<TStringId>;
  target: StringOptional;
  targetId: Optional<TNumberId>;
  targetPosition: Optional<Vector>;
  targetInit: Optional<boolean>;
}
