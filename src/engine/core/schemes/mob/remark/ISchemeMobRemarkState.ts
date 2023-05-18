import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { TConditionList } from "@/engine/core/utils/parse";
import { EMonsterState } from "@/engine/lib/constants/monsters";
import { Optional, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeMobRemarkState extends IBaseSchemeState {
  state: Optional<EMonsterState>;
  dialog_cond: Optional<{ name: TName; condlist: TConditionList }>;
  no_reset: boolean;
  anim: string;
  anim_movement: boolean;
  anim_head: Optional<string>;
  tip: Optional<string>;
  snd: Optional<string>;
  time: Optional<string>;
}
