import { Optional, TName } from "@/mod/lib/types";
import { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";
import { TConditionList } from "@/mod/scripts/utils/parse";

/**
 * todo;
 */
export interface ISchemeMobRemarkState extends IBaseSchemeState {
  state: Optional<string>;
  dialog_cond: Optional<{ name: TName; condlist: TConditionList }>;
  no_reset: boolean;
  anim: string;
  anim_movement: boolean;
  anim_head: string;
  tip: string;
  snd: string;
  time: string;
}

/**
 * state.state = getMobState(ini, section, object);
 */
