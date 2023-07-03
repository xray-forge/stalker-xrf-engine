import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { IConfigSwitchCondition } from "@/engine/core/utils/ini/ini_types";
import type { LuaArray, Optional, StringOptional, TName, TNumberId, TStringId, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeRemarkState extends IBaseSchemeState {
  snd_anim_sync: boolean;
  snd: Optional<TName>;
  anim: LuaArray<IConfigSwitchCondition>;
  tips_id: TStringId;
  sender: Optional<TStringId>;
  target: StringOptional;
  target_id: Optional<TNumberId>;
  target_position: Optional<Vector>;
  target_init: Optional<boolean>;
}
