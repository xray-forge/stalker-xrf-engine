import type { XR_vector } from "xray16";

import type { LuaArray, Optional, StringOptional, TName, TNumberId, TStringId } from "@/engine/lib/types";
import type { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";
import type { IConfigSwitchCondition } from "@/engine/scripts/utils/parse";

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
  target_position: Optional<XR_vector>;
  target_init: Optional<boolean>;
}
