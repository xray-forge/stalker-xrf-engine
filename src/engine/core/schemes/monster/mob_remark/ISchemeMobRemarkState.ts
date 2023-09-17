import type { IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/database/types";
import type { EMonsterState } from "@/engine/lib/constants/monsters";
import type { Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeMobRemarkState extends IBaseSchemeState {
  state: Optional<EMonsterState>;
  dialog_cond: Optional<IBaseSchemeLogic>;
  no_reset: boolean;
  anim: string;
  anim_movement: boolean;
  anim_head: Optional<string>;
  tip: Optional<string>;
  snd: Optional<string>;
  time: Optional<string>;
}
