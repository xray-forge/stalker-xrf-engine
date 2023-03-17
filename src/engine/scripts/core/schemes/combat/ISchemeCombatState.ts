import { XR_vector } from "xray16";

import { AnyObject, LuaArray, Optional } from "@/engine/lib/types";
import type { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";

/**
 * todo;
 */
export enum EScriptCombatType {
  CAMPER = "camper",
}

/**
 * todo;
 */
export interface ISchemeCombatState extends IBaseSchemeState {
  enabled: boolean;
  combat_type: Optional<AnyObject>;
  camper_combat_action: Optional<boolean>;
  last_seen_pos: Optional<XR_vector>;
  script_combat_type: Optional<EScriptCombatType>;
  cur_act: Optional<number>;
}
